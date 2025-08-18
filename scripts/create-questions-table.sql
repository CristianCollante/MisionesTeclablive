-- Create questions table for storing quiz questions by subject and module
CREATE TABLE IF NOT EXISTS public.questions (
    id SERIAL PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    module VARCHAR(10) NOT NULL,
    question_text TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    question_type VARCHAR(50) DEFAULT 'multiple_choice',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_questions_subject_module ON public.questions(subject, module);

-- Insert sample questions for testing
INSERT INTO public.questions (subject, module, question_text, correct_answer, option_a, option_b, option_c, option_d) VALUES
('Programación I', '1', '¿Qué es una variable en programación?', 'Un espacio en memoria para almacenar datos', 'Un espacio en memoria para almacenar datos', 'Una función matemática', 'Un tipo de bucle', 'Un operador lógico'),
('Programación I', '2', '¿Qué es un bucle for?', 'Una estructura de control repetitiva', 'Una función', 'Una estructura de control repetitiva', 'Una variable', 'Un operador'),
('Programación I', '3', '¿Qué es una función en programación?', 'Un bloque de código reutilizable', 'Una variable', 'Un bloque de código reutilizable', 'Un tipo de dato', 'Un operador'),
('Programación I', '4', '¿Qué es una API?', 'Interfaz de programación de aplicaciones', 'Un lenguaje de programación', 'Una base de datos', 'Interfaz de programación de aplicaciones', 'Un framework');
