-- Execute this script in your Supabase SQL Editor to set up the relational database tables

-- Enable UUID extension (usually active by default, but safe to verify)
create extension if not exists "uuid-ossp";

-- 1. Users Table
create table users (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    email text unique not null,
    password text not null,
    role text check (role in ('admin', 'recruiter', 'candidate')) default 'candidate',
    is_verified boolean default false,
    verification_token text,
    reset_password_token text,
    reset_password_expire timestamp,
    created_at timestamp default now()
);

-- 2. Companies Table
create table companies (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    website text,
    logo_url text,
    description text,
    created_at timestamp default now()
);

-- 3. Candidate Profiles Table
create table candidate_profiles (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references users(id) on delete cascade unique,
    title text default 'Software Engineer',
    phone text,
    location text,
    bio text,
    skills text[] default '{}',
    experience jsonb default '[]',
    education jsonb default '[]',
    resume_url text,
    resume_path text,
    ats_score numeric default 0,
    resume_summary text,
    improvement_suggestions text[] default '{}'
);

-- 4. Recruiter Profiles Table
create table recruiter_profiles (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references users(id) on delete cascade unique,
    phone text,
    company_id uuid references companies(id) on delete set null,
    designation text default 'Recruiting Officer'
);

-- 5. Jobs Table
create table jobs (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    description text not null,
    requirements text[] default '{}',
    location text,
    type text default 'Full-time',
    status text check (status in ('Open', 'Closed')) default 'Open',
    salary text,
    recruiter_id uuid references users(id) on delete set null,
    company_id uuid references companies(id) on delete set null,
    created_at timestamp default now()
);

-- 6. Applications Table
create table applications (
    id uuid primary key default uuid_generate_v4(),
    job_id uuid references jobs(id) on delete cascade,
    candidate_id uuid references users(id) on delete cascade,
    status text check (status in ('Applied', 'Under Review', 'Interview Scheduled', 'Shortlisted', 'Hired', 'Rejected')) default 'Applied',
    resume_url text,
    ats_score numeric default 0,
    feedback text,
    created_at timestamp default now(),
    unique(job_id, candidate_id)
);

-- 7. Announcements Table
create table announcements (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    message text not null,
    created_by uuid references users(id) on delete set null,
    recipient_count integer default 0,
    created_at timestamp default now()
);

-- 8. Notifications Table
create table notifications (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references users(id) on delete cascade,
    title text not null,
    message text not null,
    read boolean default false,
    created_at timestamp default now()
);

-- 9. Interview Results Table
create table interview_results (
    id uuid primary key default uuid_generate_v4(),
    candidate_id uuid references users(id) on delete cascade,
    score numeric default 0,
    feedback text,
    recording_url text,
    created_at timestamp default now()
);

-- 10. Coding Results Table
create table coding_results (
    id uuid primary key default uuid_generate_v4(),
    candidate_id uuid references users(id) on delete cascade,
    score numeric default 0,
    feedback text,
    language text,
    code text,
    created_at timestamp default now()
);

-- 11. Aptitude Results Table
create table aptitude_results (
    id uuid primary key default uuid_generate_v4(),
    candidate_id uuid references users(id) on delete cascade,
    score numeric default 0,
    feedback text,
    answers jsonb default '[]',
    created_at timestamp default now()
);

-- 12. Audit Logs Table
create table audit_logs (
    id uuid primary key default uuid_generate_v4(),
    actor uuid references users(id) on delete set null,
    action text not null,
    details text,
    created_at timestamp default now()
);
