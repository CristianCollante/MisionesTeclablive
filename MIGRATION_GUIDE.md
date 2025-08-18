# 📚 MisionesTeclab - Guía Completa de Migración a ChatGPT

## 🎯 Resumen del Proyecto

**MisionesTeclab** es una plataforma educativa gamificada que permite a estudiantes del Instituto Técnico Superior Teclab completar misiones por módulo y hacer seguimiento de su progreso académico.

### Características Principales:
- Sistema de misiones gamificado (4 misiones por módulo)
- Tracking de progreso estudiantil
- Dashboard para estudiantes y tutores
- Sistema de puntos y celebraciones
- Integración con base de datos Supabase
- Interfaz responsive y moderna

---

## 🏗️ Arquitectura del Proyecto

### Stack Tecnológico:
- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Base de Datos**: Supabase (PostgreSQL)
- **Tipografías**: Space Grotesk (serif) + DM Sans (sans)
- **Iconos**: Lucide React

### Estructura de Archivos:
\`\`\`
├── app/
│   ├── layout.tsx          # Layout principal con fuentes
│   ├── page.tsx            # Página de inicio
│   ├── student/page.tsx    # Dashboard de estudiantes
│   ├── tutor/page.tsx      # Dashboard de tutores (pendiente)
│   └── globals.css         # Estilos globales + variables CSS
├── components/ui/          # Componentes shadcn/ui
├── lib/
│   └── supabase/client.ts  # Cliente Supabase
├── scripts/                # Scripts SQL para base de datos
└── public/images/          # Logos e imágenes
\`\`\`

---

## 🗄️ Base de Datos (Supabase)

### Tablas Principales:

#### `students`
\`\`\`sql
- dni: varchar (PK) - Documento de identidad
- nickname: varchar - Nombre preferido del estudiante
- subject: varchar - Materia cursada
- tutor: varchar - Tutor asignado
- created_at: timestamp
\`\`\`

#### `student_progress`
\`\`\`sql
- id: integer (PK)
- dni: varchar (FK) - Referencia a students
- module: varchar - Módulo actual (1, 2, 3, etc.)
- subject: varchar - Materia
- m1: boolean - Misión 1: ¿Leíste el módulo?
- m2: boolean - Misión 2: ¿Aprobaste la AE?
- m3: boolean - Misión 3: Pregunta del módulo
- m4: boolean - Misión 4: ¿Entregas la API?
- points: integer - Puntos acumulados
- last_session_date: timestamp
- blocked_until_next_class: boolean
- created_at: timestamp
- updated_at: timestamp
\`\`\`

#### `tutors`
\`\`\`sql
- id: integer (PK)
- name: varchar - Nombre del tutor
- created_at: timestamp
\`\`\`

#### `subjects`
\`\`\`sql
- id: integer (PK)
- name: varchar - Nombre de la materia
- created_at: timestamp
\`\`\`

#### `tutor_subjects`
\`\`\`sql
- id: integer (PK)
- tutor_name: varchar
- subject: varchar
- created_at: timestamp
\`\`\`

### Scripts SQL Disponibles:
- `create-tables-v2.sql` - Creación de tablas principales
- `add-tutors-table.sql` - Tabla de tutores
- `add-subjects-table.sql` - Tabla de materias

---

## 🎮 Sistema de Misiones

### Tipos de Misiones (por módulo):

1. **M1 - ¿Leíste el módulo?** (Sí/No)
   - Confirma lectura del material
   - Icono: BookOpen

2. **M2 - ¿Aprobaste la AE del módulo?** (Sí/No)
   - Confirma aprobación de actividad evaluativa
   - Icono: FileCheck

3. **M3 - Pregunta del módulo** (Pregunta/Respuesta)
   - Respuesta a pregunta específica del módulo
   - Icono: HelpCircle

4. **M4 - ¿Entregas la API?** (Sí/No)
   - Confirma entrega de trabajo práctico
   - Icono: Code

### Sistema de Puntos:
- **25 puntos** por misión completada
- **100 puntos** por módulo completo
- Celebraciones animadas al completar misiones/módulos

---

## 🎨 Diseño y UX

### Paleta de Colores:
- **Primario**: Azul (#2563eb, #1d4ed8)
- **Secundario**: Gris claro/oscuro
- **Éxito**: Verde (#10b981)
- **Advertencia**: Amarillo/Naranja
- **Error**: Rojo (#ef4444)

### Componentes Clave:
- **ProgressPath**: Visualización del progreso por módulos
- **MissionCard**: Tarjetas de misiones individuales
- **CelebrationModal**: Modales de celebración
- **StudentStats**: Panel de estadísticas

### Animaciones:
- Celebraciones con confetti
- Animaciones de progreso
- Personaje saltando en el path
- Transiciones suaves

---

## 🔧 Funcionalidades Implementadas

### Dashboard de Estudiantes (`/student`):
1. **Login Rápido**: Solo DNI + materia
2. **Autocompletado**: Nickname basado en datos previos
3. **Sistema de Misiones**: 4 misiones por módulo
4. **Tracking de Progreso**: Visualización del avance
5. **Sistema de Bloqueo**: Previene avance excesivo por sesión
6. **Celebraciones**: Feedback visual por logros
7. **Persistencia**: Datos guardados en Supabase

### Página Principal (`/`):
- Landing page con acceso a estudiante/tutor
- Branding institucional (Social Learning + Teclab)
- Call-to-action para comenzar

---

## 🚀 Próximos Pasos Sugeridos

### Funcionalidades Pendientes:
1. **Dashboard de Tutores** (`/tutor`)
   - Vista de todos los estudiantes
   - Progreso por materia/módulo
   - Gestión de preguntas M3
   - Reportes y estadísticas

2. **Sistema de Autenticación**
   - Login seguro para tutores
   - Roles y permisos
   - Sesiones persistentes

3. **Gestión de Contenido**
   - CRUD de preguntas M3
   - Gestión de módulos/materias
   - Configuración de puntos

4. **Reportes y Analytics**
   - Estadísticas de progreso
   - Exportación de datos
   - Gráficos de rendimiento

5. **Mejoras UX**
   - Modo oscuro
   - Notificaciones
   - Gamificación avanzada (badges, rankings)

---

## 🔄 Instrucciones de Migración

### Para ChatGPT:

1. **Descargar el Código**:
   - Usar "Push to GitHub" o "Download ZIP"
   - Subir archivos a ChatGPT

2. **Configurar Supabase**:
   - Crear nuevo proyecto en Supabase
   - Ejecutar scripts SQL en orden:
     \`\`\`sql
     1. create-tables-v2.sql
     2. add-tutors-table.sql  
     3. add-subjects-table.sql
     \`\`\`
   - Configurar variables de entorno

3. **Variables de Entorno Necesarias**:
   \`\`\`env
   SUPABASE_URL=tu_supabase_url
   SUPABASE_ANON_KEY=tu_anon_key
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   \`\`\`

4. **Instalación Local**:
   \`\`\`bash
   npm install
   npm run dev
   \`\`\`

### Contexto para ChatGPT:
\`\`\`
Este es un proyecto educativo gamificado llamado MisionesTeclab. 
Es una plataforma donde estudiantes completan misiones por módulo 
para hacer seguimiento de su progreso académico. Usa Next.js 14, 
Tailwind CSS, shadcn/ui y Supabase como base de datos.

El sistema tiene 4 tipos de misiones por módulo, sistema de puntos, 
celebraciones animadas y persistencia de datos. Actualmente funciona 
el dashboard de estudiantes, falta implementar el dashboard de tutores.

Mantén el estilo de código existente, usa las mismas convenciones 
de nombres y sigue el patrón de componentes establecido.
\`\`\`

---

## 📝 Notas Técnicas

### Patrones de Código:
- Componentes funcionales con hooks
- TypeScript para tipado
- Supabase client-side para operaciones DB
- Estados locales con useState
- Async/await para operaciones asíncronas

### Convenciones:
- Archivos en kebab-case
- Componentes en PascalCase  
- Variables en camelCase
- Clases CSS con Tailwind

### Consideraciones:
- El proyecto está optimizado para mobile-first
- Usa el sistema de design tokens de shadcn/ui
- Las animaciones están implementadas con CSS puro
- La base de datos maneja relaciones simples sin foreign keys estrictas

---

**¡Proyecto listo para continuar en ChatGPT! 🚀**
