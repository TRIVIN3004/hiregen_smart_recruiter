const SupabaseModel = require('./supabaseAdapter');

const User = new SupabaseModel('users');
const CandidateProfile = new SupabaseModel('candidate_profiles');
const RecruiterProfile = new SupabaseModel('recruiter_profiles');

module.exports = { User, CandidateProfile, RecruiterProfile };
