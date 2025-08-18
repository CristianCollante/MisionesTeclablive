-- Create students table
CREATE TABLE IF NOT EXISTS students (
  dni VARCHAR(20) PRIMARY KEY,
  nickname VARCHAR(100) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  tutor VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student_progress table
CREATE TABLE IF NOT EXISTS student_progress (
  id SERIAL PRIMARY KEY,
  dni VARCHAR(20) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  module VARCHAR(10) NOT NULL,
  m1 BOOLEAN DEFAULT NULL,
  m2 BOOLEAN DEFAULT NULL,
  m3 BOOLEAN DEFAULT NULL,
  m4 BOOLEAN DEFAULT NULL,
  points INTEGER DEFAULT 0,
  last_session_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blocked_until_next_class BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (dni) REFERENCES students(dni) ON DELETE CASCADE,
  UNIQUE(dni, subject, module)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_progress_dni ON student_progress(dni);
CREATE INDEX IF NOT EXISTS idx_student_progress_subject ON student_progress(subject);
CREATE INDEX IF NOT EXISTS idx_students_tutor ON students(tutor);
