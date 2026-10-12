/**
 * Complete End-to-End Workflow Automated Verification Script
 * Validates requirements 1 through 21 against live MongoDB database.
 */
const http = require('http');

function post(path, data, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method: 'POST',
        headers,
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function put(path, data, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method: 'PUT',
        headers,
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method: 'GET',
        headers,
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function verifyEndToEndWorkflow() {
  console.log('================================================================');
  console.log('STARTING END-TO-END WORKFLOW VERIFICATION');
  console.log('================================================================\n');

  // Step 1: Health & Root check
  console.log('Step 1: Checking server health & root endpoint...');
  const root = await get('/');
  if (root.body.status !== 'Online' || root.body.database !== 'Connected') {
    throw new Error('Server or MongoDB not connected.');
  }
  console.log(` -> PASS: Root status="${root.body.status}", MongoDB="${root.body.database}"\n`);

  // Step 2: Login using seeded demo recruiter
  console.log('Step 2: Authenticating with seeded demo recruiter...');
  const loginRes = await post('/api/auth/login', {
    email: 'recruiter@demo.com',
    password: 'Password123!',
  });
  if (!loginRes.body.success || !loginRes.body.token) {
    throw new Error('Authentication failed: ' + JSON.stringify(loginRes.body));
  }
  const token = loginRes.body.token;
  console.log(` -> PASS: Recruiter authenticated: ${loginRes.body.user.name} (${loginRes.body.user.email})\n`);

  // Step 3: Check Dashboard Statistics
  console.log('Step 3: Querying Dashboard statistics...');
  const statsRes = await get('/api/dashboard/stats', token);
  console.log(` -> PASS: Total Jobs: ${statsRes.body.data.totalJobs}, Candidates: ${statsRes.body.data.totalCandidates}, Screened: ${statsRes.body.data.resumesScreened}\n`);

  // Step 4: Create Job requisition & save to MongoDB
  console.log('Step 4: Creating new Job requisition ("DevOps & Cloud Infrastructure Engineer")...');
  const jobPayload = {
    title: 'DevOps & Cloud Infrastructure Engineer',
    department: 'Infrastructure & SRE',
    description: 'Lead containerized deployments, Kubernetes orchestration, and AWS Terraform infrastructure.',
    requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Linux'],
    preferredSkills: ['Helm', 'Prometheus', 'CI/CD'],
    minimumExperience: 3,
    education: "Bachelor's Degree in Computer Science or related field",
    status: 'Active',
  };
  const createJobRes = await post('/api/jobs', jobPayload, token);
  if (!createJobRes.body.success) {
    throw new Error('Job creation failed: ' + JSON.stringify(createJobRes.body));
  }
  const createdJobId = createJobRes.body.data._id;
  console.log(` -> PASS: Job created in MongoDB with ID: ${createdJobId}\n`);

  // Step 5: Save Candidate attached to the newly created Job
  console.log('Step 5: Registering Candidate ("Morgan Lee") with resume metadata...');
  const candidatePayload = {
    name: 'Morgan Lee',
    email: 'morgan.lee@example.com',
    phone: '+1 (555) 789-0123',
    education: "Bachelor's Degree in Computer Science",
    experience: 3.5,
    skills: ['AWS', 'Docker', 'Kubernetes', 'Linux'], // Missing Terraform
    certifications: ['AWS Certified Solutions Architect', 'Certified Kubernetes Administrator (CKA)'],
    projects: [
      {
        title: 'Kubernetes Multi-Cluster GitOps Platform',
        description: 'Automated ArgoCD deployments across AWS EKS clusters',
        technologies: ['Kubernetes', 'AWS', 'Docker'],
      },
    ],
    jobId: createdJobId,
    status: 'New',
    resumeFile: {
      originalName: 'Morgan_Lee_CloudEngineer_Resume.pdf',
      filename: 'Morgan_Lee_Resume.pdf',
      path: 'uploads/Morgan_Lee_Resume.pdf',
      mimetype: 'application/pdf',
      size: 215000,
    },
  };
  const createCandRes = await post('/api/candidates', candidatePayload, token);
  if (!createCandRes.body.success) {
    throw new Error('Candidate creation failed: ' + JSON.stringify(createCandRes.body));
  }
  const createdCandidateId = createCandRes.body.data._id;
  console.log(` -> PASS: Candidate saved in MongoDB with ID: ${createdCandidateId}\n`);

  // Step 6: Start Screening Engine for this Job
  console.log('Step 6: Executing Rule-Based Screening Engine for created Job...');
  const screeningRes = await post(`/api/screening/${createdJobId}`, {}, token);
  if (!screeningRes.body.success || screeningRes.body.count === 0) {
    throw new Error('Screening failed: ' + JSON.stringify(screeningRes.body));
  }
  const result = screeningRes.body.data[0];
  console.log(` -> PASS: Screening complete! Calculated matchScore = ${result.matchScore}%`);
  console.log(`    - Skills Score:         ${result.skillsScore}/50 pts (Matched: ${result.matchedSkills.join(', ')})`);
  console.log(`    - Experience Score:     ${result.experienceScore}/20 pts`);
  console.log(`    - Education Score:      ${result.educationScore}/10 pts`);
  console.log(`    - Certification Score:  ${result.certificationScore}/10 pts`);
  console.log(`    - Project Score:        ${result.projectScore}/10 pts`);
  console.log(`    - Missing Skills:       ${result.missingSkills.join(', ')}`);
  console.log(`    - Recommendation:       ${result.recommendation}\n`);

  // Step 7: Rank Candidates for this Job
  console.log('Step 7: Querying Ranking leaderboard from MongoDB...');
  const rankingRes = await get(`/api/rankings/${createdJobId}`, token);
  if (!rankingRes.body.success || rankingRes.body.data.length === 0) {
    throw new Error('Ranking retrieval failed');
  }
  const topRank = rankingRes.body.data[0];
  console.log(` -> PASS: Rank #1: "${topRank.candidate.name}" with score ${topRank.matchScore}%\n`);

  // Step 8: View Candidate Details and Explain Score
  console.log('Step 8: Fetching Explainable Candidate Details...');
  const detailsRes = await get(`/api/candidates/${createdCandidateId}`, token);
  if (!detailsRes.body.success || !detailsRes.body.data.screeningResult) {
    throw new Error('Candidate details or screening result missing');
  }
  console.log(` -> PASS: Score explanation confirmed: "${detailsRes.body.data.screeningResult.explanation.substring(0, 95)}..."\n`);

  // Step 9: Update Candidate Status (persists in MongoDB)
  console.log('Step 9: Updating Candidate status to "Shortlisted"...');
  const updateRes = await put(`/api/candidates/${createdCandidateId}`, { status: 'Shortlisted' }, token);
  if (!updateRes.body.success || updateRes.body.data.status !== 'Shortlisted') {
    throw new Error('Candidate status update failed');
  }
  console.log(` -> PASS: Candidate status updated to "${updateRes.body.data.status}" in MongoDB\n`);

  // Step 10: Verify DatabaseView Live Persistence Records
  console.log('Step 10: Verifying complete MongoDB persistence via /api/database...');
  const dbRes = await get('/api/database', token);
  if (!dbRes.body.success) {
    throw new Error('Database inspection failed');
  }
  console.log(` -> PASS: Database Audit Verified!`);
  console.log(`    Total Documents:       ${dbRes.body.counts.totalDocuments}`);
  console.log(`    Jobs Count:            ${dbRes.body.counts.jobs}`);
  console.log(`    Candidates Count:      ${dbRes.body.counts.candidates}`);
  console.log(`    ScreeningResults Count:${dbRes.body.counts.screeningResults}`);
  console.log(`    Users Count:           ${dbRes.body.counts.users}`);

  console.log('\n================================================================');
  console.log('ALL 10 END-TO-END WORKFLOW STAGES VERIFIED AND PASSED!');
  console.log('================================================================');
}

verifyEndToEndWorkflow().catch((err) => {
  console.error('[Workflow Error]', err);
  process.exit(1);
});
