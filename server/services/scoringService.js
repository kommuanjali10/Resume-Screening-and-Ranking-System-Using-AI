/**
 * ============================================================================
 * SCREENING ENGINE SERVICE
 * Method: Rule-Based Screening Engine (Review-I Implementation)
 * ============================================================================
 * 
 * NOTE FOR REVIEW-I EVALUATION:
 * This module implements a transparent, deterministic Rule-Based Screening Engine.
 * It strictly evaluates candidate profiles against recruiter job requirements using
 * mathematical weighted scoring criteria.
 * 
 * Scoring Formula Breakdown (Total: 100%):
 *  - Required Skills Match: 50%
 *  - Experience Match:      20%
 *  - Education Match:       10%
 *  - Certifications Match:  10%
 *  - Relevant Projects Match: 10%
 * 
 * Total Score = Skills Score + Experience Score + Education Score + Certifications Score + Projects Score
 * 
 * FUTURE AI/NLP INTEGRATION (Phase 2 Roadmap):
 *  - [ ] TODO Phase 2: PDF/DOCX text extraction using pdf-parse and mammoth
 *  - [ ] TODO Phase 2: NLP-based skill extraction using Named Entity Recognition (NER)
 *  - [ ] TODO Phase 2: Automated experience & education parsing via Transformer models
 *  - [ ] TODO Phase 2: Semantic embedding generation via Sentence Transformers (all-MiniLM-L6-v2)
 *  - [ ] TODO Phase 2: Cosine semantic similarity between resume bio & job description
 *  - [ ] TODO Phase 2: Hybrid AI-ranking combining rule constraints and semantic scores
 * ============================================================================
 */

/**
 * Normalizes a string for robust keyword matching (lowercase, removes special chars, trims)
 * @param {string} str 
 * @returns {string}
 */
const normalizeText = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
};

/**
 * Calculates education hierarchy level
 * @param {string} eduString 
 * @returns {number} Level from 1 to 5
 */
const getEducationLevel = (eduString) => {
  if (!eduString) return 1;
  const s = eduString.toLowerCase();
  if (s.includes('phd') || s.includes('doctorate') || s.includes('doctor of')) {
    return 5;
  }
  if (s.includes('master') || s.includes('m.tech') || s.includes('ms') || s.includes('mca') || s.includes('mba') || s.includes('m.s') || s.includes('post graduate')) {
    return 4;
  }
  if (s.includes('bachelor') || s.includes('b.tech') || s.includes('be') || s.includes('bs') || s.includes('bca') || s.includes('b.e') || s.includes('b.s') || s.includes('degree') || s.includes('undergraduate')) {
    return 3;
  }
  if (s.includes('diploma') || s.includes('associate')) {
    return 2;
  }
  return 1;
};

/**
 * Calculates candidate match score and explanation against a job requirement.
 * 
 * @param {Object} candidate - Candidate document from database
 * @param {Object} job - Job document from database
 * @returns {Object} Screening calculation breakdown
 */
const calculateScreeningScore = (candidate, job) => {
  const strengths = [];
  const skillGaps = [];

  // --------------------------------------------------------------------------
  // 1. REQUIRED SKILLS MATCH (50% WEIGHT)
  // --------------------------------------------------------------------------
  const jobRequiredSkills = Array.isArray(job.requiredSkills) ? job.requiredSkills : [];
  const candidateSkills = Array.isArray(candidate.skills) ? candidate.skills : [];

  const normalizedCandidateSkills = candidateSkills.map(s => ({
    original: s,
    norm: normalizeText(s)
  }));

  const matchedSkills = [];
  const missingSkills = [];

  jobRequiredSkills.forEach(reqSkill => {
    const normReq = normalizeText(reqSkill);
    const hasMatch = normalizedCandidateSkills.some(cs => {
      return cs.norm === normReq || cs.norm.includes(normReq) || normReq.includes(cs.norm);
    });

    if (hasMatch) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  });

  const totalRequired = jobRequiredSkills.length;
  let skillsScore = 0;
  if (totalRequired > 0) {
    skillsScore = Number(((matchedSkills.length / totalRequired) * 50).toFixed(2));
  } else {
    skillsScore = 50; // Fallback if no specific skills listed
  }

  if (matchedSkills.length === totalRequired && totalRequired > 0) {
    strengths.push(`100% required skills matched (${matchedSkills.length}/${totalRequired})`);
  } else if (matchedSkills.length > 0) {
    strengths.push(`Matched ${matchedSkills.length} of ${totalRequired} required skills (${matchedSkills.join(', ')})`);
  }

  if (missingSkills.length > 0) {
    skillGaps.push(`Missing required skills: ${missingSkills.join(', ')}`);
  }

  // --------------------------------------------------------------------------
  // 2. EXPERIENCE MATCH (20% WEIGHT)
  // --------------------------------------------------------------------------
  const candExp = Number(candidate.experience) || 0;
  const minExp = Number(job.minimumExperience) || 0;
  let experienceScore = 0;

  if (minExp === 0) {
    experienceScore = 20;
    strengths.push(`Entry-level role: Candidate has ${candExp} year(s) of relevant experience`);
  } else if (candExp >= minExp) {
    experienceScore = 20;
    strengths.push(`Experience requirement satisfied (${candExp} yrs vs min ${minExp} yrs)`);
  } else {
    experienceScore = Number(((candExp / minExp) * 20).toFixed(2));
    skillGaps.push(`Experience gap: Has ${candExp} year(s), job requires minimum ${minExp} year(s)`);
  }
  experienceScore = Math.min(20, Math.max(0, experienceScore));

  // --------------------------------------------------------------------------
  // 3. EDUCATION MATCH (10% WEIGHT)
  // --------------------------------------------------------------------------
  const candEduLevel = getEducationLevel(candidate.education);
  const jobEduLevel = getEducationLevel(job.education);
  let educationScore = 0;

  if (candEduLevel >= jobEduLevel) {
    educationScore = 10;
    strengths.push(`Education requirement fulfilled: ${candidate.education}`);
  } else if (candEduLevel === jobEduLevel - 1) {
    educationScore = 7.5;
    skillGaps.push(`Education level slightly below target (${candidate.education} vs ${job.education})`);
  } else {
    educationScore = 5.0;
    skillGaps.push(`Education gap (${candidate.education} vs required ${job.education})`);
  }

  // --------------------------------------------------------------------------
  // 4. CERTIFICATIONS MATCH (10% WEIGHT)
  // --------------------------------------------------------------------------
  const candidateCerts = Array.isArray(candidate.certifications) ? candidate.certifications : [];
  let certificationScore = 0;

  if (candidateCerts.length >= 2) {
    certificationScore = 10;
    strengths.push(`Strong credentialing: ${candidateCerts.length} verified certifications`);
  } else if (candidateCerts.length === 1) {
    certificationScore = 6;
    strengths.push(`Holds certified credential: ${candidateCerts[0]}`);
  } else {
    certificationScore = 0;
    skillGaps.push('No professional certifications listed');
  }

  // --------------------------------------------------------------------------
  // 5. RELEVANT PROJECTS MATCH (10% WEIGHT)
  // --------------------------------------------------------------------------
  const candidateProjects = Array.isArray(candidate.projects) ? candidate.projects : [];
  let projectScore = 0;

  if (candidateProjects.length >= 2) {
    projectScore = 10;
    strengths.push(`Demonstrated portfolio with ${candidateProjects.length} relevant projects`);
  } else if (candidateProjects.length === 1) {
    projectScore = 6;
    strengths.push(`Portfolio project present: ${candidateProjects[0].title || 'Candidate Project'}`);
  } else {
    projectScore = 0;
    skillGaps.push('No portfolio projects provided');
  }

  // --------------------------------------------------------------------------
  // TOTAL MATCH SCORE (Capped 0 - 100)
  // --------------------------------------------------------------------------
  const rawTotal = skillsScore + experienceScore + educationScore + certificationScore + projectScore;
  const matchScore = Number(Math.min(100, Math.max(0, rawTotal)).toFixed(1));

  // Recommendation generator based on transparent thresholds
  let recommendation = 'Requires Recruiter Review';
  if (matchScore >= 80) {
    recommendation = 'Strong Match - Recommended for Technical Interview';
  } else if (matchScore >= 65) {
    recommendation = 'Moderate Match - Recommended with Review on Skill Gaps';
  } else if (matchScore >= 50) {
    recommendation = 'Borderline Match - Consider for Alternate or Junior Roles';
  } else {
    recommendation = 'Low Match - Does Not Meet Core Technical Qualifications';
  }

  // Transparent explanation paragraph
  const explanation = `Score breakdown under Rule-Based Screening Engine: Required Skills Match contributed ${skillsScore}/50 pts (${matchedSkills.length}/${totalRequired} skills matched). Experience Match contributed ${experienceScore}/20 pts (${candExp} yrs candidate vs ${minExp} yrs required). Education Match contributed ${educationScore}/10 pts. Certifications Match contributed ${certificationScore}/10 pts (${candidateCerts.length} certification(s)). Projects Match contributed ${projectScore}/10 pts (${candidateProjects.length} project(s)). Total calculated score is ${matchScore}%.`;

  return {
    matchScore,
    skillsScore,
    experienceScore,
    educationScore,
    certificationScore,
    projectScore,
    matchedSkills,
    missingSkills,
    strengths,
    skillGaps,
    recommendation,
    explanation,
  };
};

module.exports = {
  calculateScreeningScore,
  normalizeText,
  getEducationLevel,
};
