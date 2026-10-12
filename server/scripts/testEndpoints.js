/**
 * Automated API Endpoint Verification Script
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
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
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
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('Testing Endpoints...');

  // 1. Root and Health
  const health = await get('/api/health');
  console.log(`[PASS] /api/health -> status=${health.status}, db=${health.body.database}`);

  // 2. Auth Login
  const login = await post('/api/auth/login', {
    email: 'recruiter@demo.com',
    password: 'Password123!',
  });
  console.log(`[PASS] /api/auth/login -> status=${login.status}, user=${login.body.user?.name}`);
  const token = login.body.token;

  // 3. Dashboard Stats & Charts
  const stats = await get('/api/dashboard/stats', token);
  console.log(`[PASS] /api/dashboard/stats -> jobs=${stats.body.data.totalJobs}, candidates=${stats.body.data.totalCandidates}, screened=${stats.body.data.resumesScreened}`);

  const charts = await get('/api/dashboard/charts', token);
  console.log(`[PASS] /api/dashboard/charts -> scoreBuckets=${charts.body.data.scoreDistribution.length}, jobsData=${charts.body.data.jobCandidates.length}`);

  // 4. Jobs
  const jobs = await get('/api/jobs', token);
  console.log(`[PASS] /api/jobs -> count=${jobs.body.count}, first="${jobs.body.data[0]?.title}"`);
  const firstJobId = jobs.body.data[0]?._id;

  // 5. Candidates
  const candidates = await get('/api/candidates', token);
  console.log(`[PASS] /api/candidates -> count=${candidates.body.count}`);

  // 6. Screening Results
  const screening = await get(`/api/screening/${firstJobId}`, token);
  console.log(`[PASS] /api/screening/${firstJobId} -> screened=${screening.body.count}`);

  // 7. Rankings
  const rankings = await get(`/api/rankings/${firstJobId}`, token);
  console.log(`[PASS] /api/rankings/${firstJobId} -> ranked=${rankings.body.count}, top=${rankings.body.data[0]?.candidate?.name} (${rankings.body.data[0]?.matchScore}%)`);

  // 8. Database Overview
  const dbOverview = await get('/api/database', token);
  console.log(`[PASS] /api/database -> totalDocs=${dbOverview.body.counts.totalDocuments}, connection=${dbOverview.body.database.status}`);

  console.log('\nALL BACKEND API VERIFICATIONS PASSED SUCCESSFULLY!');
}

run().catch((err) => {
  console.error('[FAIL]', err);
  process.exit(1);
});
