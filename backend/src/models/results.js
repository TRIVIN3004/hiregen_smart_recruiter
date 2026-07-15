const SupabaseModel = require('./supabaseAdapter');

const InterviewResult = new SupabaseModel('interview_results');
const CodingResult = new SupabaseModel('coding_results');
const AptitudeResult = new SupabaseModel('aptitude_results');

module.exports = { InterviewResult, CodingResult, AptitudeResult };