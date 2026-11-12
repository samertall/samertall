create table if not exists people (
  id text primary key,
  name text not null,
  email text not null default '',
  sample boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists courses (
  id text primary key,
  slug text not null unique,
  title text not null,
  summary text not null,
  description text not null,
  subject text not null,
  level text not null,
  published boolean not null default false,
  house boolean not null default false,
  author_id text not null references people (id),
  created_at timestamptz not null default now()
);

create table if not exists modules (
  id text primary key,
  course_id text not null references courses (id) on delete cascade,
  title text not null,
  position integer not null
);

create table if not exists lessons (
  id text primary key,
  module_id text not null references modules (id) on delete cascade,
  title text not null,
  kind text not null check (kind in ('reading', 'quiz')),
  body text not null default '',
  minutes integer not null default 8,
  position integer not null
);

create table if not exists questions (
  id text primary key,
  lesson_id text not null references lessons (id) on delete cascade,
  prompt text not null,
  explanation text not null default '',
  position integer not null
);

create table if not exists choices (
  id text primary key,
  question_id text not null references questions (id) on delete cascade,
  label text not null,
  correct boolean not null default false,
  position integer not null
);

create table if not exists enrollments (
  person_id text not null references people (id) on delete cascade,
  course_id text not null references courses (id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  primary key (person_id, course_id)
);

create table if not exists lesson_progress (
  person_id text not null references people (id) on delete cascade,
  lesson_id text not null references lessons (id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (person_id, lesson_id)
);

create table if not exists quiz_attempts (
  id text primary key,
  person_id text not null references people (id) on delete cascade,
  lesson_id text not null references lessons (id) on delete cascade,
  score integer not null,
  total integer not null,
  submitted_at timestamptz not null default now()
);

create table if not exists attempt_answers (
  attempt_id text not null references quiz_attempts (id) on delete cascade,
  question_id text not null,
  choice_id text not null,
  primary key (attempt_id, question_id)
);

create index if not exists courses_published_idx on courses (published, house, title);
create index if not exists modules_course_idx on modules (course_id, position);
create index if not exists lessons_module_idx on lessons (module_id, position);
create index if not exists questions_lesson_idx on questions (lesson_id, position);
create index if not exists choices_question_idx on choices (question_id, position);
create index if not exists enrollments_course_idx on enrollments (course_id);
create index if not exists attempts_lesson_idx on quiz_attempts (person_id, lesson_id, submitted_at desc);
