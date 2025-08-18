-- Create tutors table
CREATE TABLE IF NOT EXISTS tutors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tutor_subjects table for many-to-many relationship
CREATE TABLE IF NOT EXISTS tutor_subjects (
  id SERIAL PRIMARY KEY,
  tutor_name VARCHAR(100) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (tutor_name) REFERENCES tutors(name) ON DELETE CASCADE,
  UNIQUE(tutor_name, subject)
);

-- Insert default tutors
INSERT INTO tutors (name) VALUES 
  ('Cristian'),
  ('María'),
  ('Juan')
ON CONFLICT (name) DO NOTHING;

-- Insert default tutor-subject relationships
INSERT INTO tutor_subjects (tutor_name, subject) VALUES 
  ('Cristian', 'Programación I'),
  ('María', 'Contabilidad'),
  ('María', 'Comunicación'),
  ('Juan', 'Programación I'),
  ('Juan', 'Contabilidad')
ON CONFLICT (tutor_name, subject) DO NOTHING;
