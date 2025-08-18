"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Target, CheckCircle, ArrowLeft, BookOpen, FileCheck, HelpCircle, Code, X, Heart, User } from "lucide-react"
import Link from "next/link"
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client"
import Image from "next/image"

interface StudentData {
  dni: string
  nick?: string
  materia: string
  tutor: string
  currentModule: number
  moduleProgress: {
    [module: number]: {
      m1: boolean | null // ¿Leíste el módulo? (true=sí, false=no, null=no respondido)
      m2: boolean | null // ¿Aprobaste la AE del módulo?
      m3: boolean | null // Contestar la pregunta del módulo
      m4: boolean | null // ¿Entregas la API?
      blockedUntilNextClass?: boolean // Si marcó "no" en alguna misión
    }
  }
  totalPoints: number
  lastSessionDate?: string // Para controlar reinicio de sesiones
}

const materias = ["Programación I", "Contabilidad", "Comunicación"]

const materiaTutorMap: { [key: string]: string } = {
  "Programación I": "Cristian",
  Contabilidad: "María",
  Comunicación: "Juan",
}

const missionTypes = [
  {
    id: "m1",
    title: "¿Leíste el módulo?",
    icon: BookOpen,
    type: "yesno",
    description: "Confirma que leíste todo el material del módulo",
  },
  {
    id: "m2",
    title: "¿Aprobaste la AE del módulo?",
    icon: FileCheck,
    type: "yesno",
    description: "Confirma que aprobaste la actividad evaluativa",
  },
  {
    id: "m3",
    title: "Pregunta del módulo",
    icon: HelpCircle,
    type: "question",
    description: "Responde correctamente la pregunta del módulo",
  },
  {
    id: "m4",
    title: "¿Entregas la API?",
    icon: Code,
    type: "yesno",
    description: "Confirma que entregaste el trabajo práctico",
  },
]

const ProgressPath = ({
  currentModule,
  totalModules = 4,
  isJumping = false,
}: { currentModule: number; totalModules?: number; isJumping?: boolean }) => {
  // Calculate progress: 0 = Inicio, 1-4 = Módulos, 5 = Regular
  const totalStations = 6 // Inicio + 4 Módulos + Regular
  const currentStation = Math.min(currentModule, 5) // Cap at Regular
  const progress = currentStation / (totalStations - 1)

  return (
    <div className="w-full py-4">
      <svg viewBox="0 0 1200 250" className="w-full h-48 md:h-56">
        {/* Dark blue background */}
        <rect width="1200" height="250" fill="#1e3a8a" rx="12" />

        {/* Winding path with dashed lines */}
        <path
          d="M 100 180 Q 200 120 300 160 Q 400 200 500 140 Q 600 80 700 120 Q 800 160 900 100 Q 1000 140 1100 180"
          stroke="#06b6d4"
          strokeWidth="8"
          fill="none"
          strokeDasharray="12 8"
          strokeLinecap="round"
          className="drop-shadow-lg"
        />

        {/* Progress path (completed portion) */}
        <path
          d="M 100 180 Q 200 120 300 160 Q 400 200 500 140 Q 600 80 700 120 Q 800 160 900 100 Q 1000 140 1100 180"
          stroke="#fbbf24"
          strokeWidth="6"
          fill="none"
          strokeDasharray="1000"
          strokeDashoffset={1000 - progress * 1000}
          className="transition-all duration-2000 ease-out drop-shadow-lg"
        />

        {/* Station markers and labels */}
        {/* Inicio */}
        <g>
          <rect x="70" y="50" width="60" height="30" rx="6" fill="#06b6d4" stroke="white" strokeWidth="2" />
          <text x="100" y="70" textAnchor="middle" className="text-sm font-bold fill-white">
            INICIO
          </text>
          <circle
            cx="100"
            cy="180"
            r="8"
            fill={currentStation >= 0 ? "#10b981" : "#64748b"}
            stroke="white"
            strokeWidth="3"
          />
        </g>

        {/* Módulo 1 */}
        <g>
          <rect x="270" y="40" width="60" height="30" rx="6" fill="#06b6d4" stroke="white" strokeWidth="2" />
          <text x="300" y="60" textAnchor="middle" className="text-xs font-bold fill-white">
            MÓDULO 1
          </text>
          <circle
            cx="300"
            cy="160"
            r="8"
            fill={currentStation >= 1 ? "#10b981" : "#64748b"}
            stroke="white"
            strokeWidth="3"
          />
        </g>

        {/* Módulo 2 */}
        <g>
          <rect x="470" y="200" width="60" height="30" rx="6" fill="#06b6d4" stroke="white" strokeWidth="2" />
          <text x="500" y="220" textAnchor="middle" className="text-xs font-bold fill-white">
            MÓDULO 2
          </text>
          <circle
            cx="500"
            cy="140"
            r="8"
            fill={currentStation >= 2 ? "#10b981" : "#64748b"}
            stroke="white"
            strokeWidth="3"
          />
        </g>

        {/* Módulo 3 */}
        <g>
          <rect x="670" y="30" width="60" height="30" rx="6" fill="#06b6d4" stroke="white" strokeWidth="2" />
          <text x="700" y="50" textAnchor="middle" className="text-xs font-bold fill-white">
            MÓDULO 3
          </text>
          <circle
            cx="700"
            cy="120"
            r="8"
            fill={currentStation >= 3 ? "#10b981" : "#64748b"}
            stroke="white"
            strokeWidth="3"
          />
        </g>

        {/* Módulo 4 */}
        <g>
          <rect x="870" y="180" width="60" height="30" rx="6" fill="#06b6d4" stroke="white" strokeWidth="2" />
          <text x="900" y="200" textAnchor="middle" className="text-xs font-bold fill-white">
            MÓDULO 4
          </text>
          <circle
            cx="900"
            cy="100"
            r="8"
            fill={currentStation >= 4 ? "#10b981" : "#64748b"}
            stroke="white"
            strokeWidth="3"
          />
        </g>

        {/* Regular (finish line) */}
        <g>
          <rect x="1040" y="50" width="80" height="30" rx="6" fill="#ef4444" stroke="white" strokeWidth="2" />
          <text x="1080" y="70" textAnchor="middle" className="text-sm font-bold fill-white">
            REGULAR
          </text>

          {/* Checkered flag */}
          <g transform="translate(1100, 140)">
            <rect x="0" y="0" width="20" height="15" fill="white" stroke="#374151" strokeWidth="1" />
            <rect x="0" y="0" width="5" height="3" fill="#374151" />
            <rect x="5" y="3" width="5" height="3" fill="#374151" />
            <rect x="10" y="0" width="5" height="3" fill="#374151" />
            <rect x="15" y="3" width="5" height="3" fill="#374151" />
            <rect x="0" y="6" width="5" height="3" fill="#374151" />
            <rect x="5" y="9" width="5" height="3" fill="#374151" />
            <rect x="10" y="6" width="5" height="3" fill="#374151" />
            <rect x="15" y="9" width="5" height="3" fill="#374151" />
            <rect x="0" y="12" width="5" height="3" fill="#374151" />
            <rect x="10" y="12" width="5" height="3" fill="#374151" />
            {/* Flag pole */}
            <rect x="0" y="15" width="2" height="25" fill="#8b4513" />
          </g>
          <circle
            cx="1100"
            cy="180"
            r="10"
            fill={currentStation >= 5 ? "#fbbf24" : "#64748b"}
            stroke="white"
            strokeWidth="3"
          />
        </g>

        {/* Character with torch - positioned along the path */}
        <g transform={`translate(${100 + progress * 1000}, ${180 - Math.sin(progress * Math.PI * 2) * 20})`}>
          {/* Character shadow */}
          <ellipse cx="0" cy="25" rx="12" ry="4" fill="rgba(0,0,0,0.2)" />

          <g className={isJumping && currentStation >= 5 ? "animate-bounce" : ""}>
            {/* Character body */}
            <ellipse cx="0" cy="0" rx="12" ry="18" fill="#f97316" />

            {/* Character head */}
            <circle cx="0" cy="-20" r="10" fill="#fbbf24" stroke="#f97316" strokeWidth="2" />

            {/* Character face */}
            <circle cx="-3" cy="-23" r="1.5" fill="#374151" />
            <circle cx="3" cy="-23" r="1.5" fill="#374151" />
            <path d="M -3 -17 Q 0 -15 3 -17" stroke="#374151" strokeWidth="1.5" fill="none" strokeLinecap="round" />

            {/* Backpack */}
            <ellipse cx="-8" cy="-5" rx="6" ry="12" fill="#1f2937" />
            <rect x="-10" y="-10" width="4" height="6" rx="2" fill="#374151" />

            {/* Arms */}
            <ellipse cx="-8" cy="-8" rx="4" ry="8" fill="#fbbf24" transform="rotate(-20)" />
            <ellipse cx="12" cy="-12" rx="4" ry="8" fill="#fbbf24" transform="rotate(30)" />

            {/* Legs */}
            <ellipse cx="-4" cy="15" rx="3" ry="10" fill="#1e40af" />
            <ellipse cx="4" cy="15" rx="3" ry="10" fill="#1e40af" />

            {/* Shoes */}
            <ellipse cx="-4" cy="25" rx="5" ry="3" fill="#374151" />
            <ellipse cx="4" cy="25" rx="5" ry="3" fill="#374151" />

            {/* Torch in right hand */}
            <g transform="translate(15, -15) rotate(15)">
              {/* Torch handle */}
              <rect x="0" y="0" width="3" height="20" rx="1.5" fill="#8b4513" />
              {/* Torch flame */}
              <ellipse cx="1.5" cy="-8" rx="6" ry="12" fill="#ef4444" className="animate-pulse" />
              <ellipse cx="1.5" cy="-8" rx="4" ry="8" fill="#f97316" className="animate-pulse" />
              <ellipse cx="1.5" cy="-8" rx="2" ry="4" fill="#fbbf24" className="animate-pulse" />
            </g>
          </g>

          {isJumping && currentStation >= 5 && (
            <>
              <circle
                cx="0"
                cy="0"
                r="30"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="3"
                opacity="0.6"
                className="animate-ping"
              />
              <circle
                cx="0"
                cy="0"
                r="40"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                opacity="0.4"
                className="animate-ping"
                style={{ animationDelay: "0.5s" }}
              />
            </>
          )}

          {/* Movement indicator when active */}
          {currentStation < 5 && (
            <circle
              cx="0"
              cy="0"
              r="25"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2"
              opacity="0.4"
              className="animate-ping"
            />
          )}
        </g>

        {/* Progress indicator text */}
        <text x="600" y="30" textAnchor="middle" className="text-lg font-bold fill-white">
          {currentStation === 0 && "¡Comenzando tu aventura!"}
          {currentStation >= 1 && currentStation <= 4 && `Avanzando por el Módulo ${currentStation}`}
          {currentStation >= 5 && "¡Llegaste a Regular! 🎉"}
        </text>
      </svg>
    </div>
  )
}

export default function StudentDashboard() {
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [formData, setFormData] = useState({
    dni: "",
    nick: "",
    materia: "",
  })
  const [currentMission, setCurrentMission] = useState<number>(1)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showMotivationalMessage, setShowMotivationalMessage] = useState(false)
  const [showModuleCelebration, setShowModuleCelebration] = useState(false)
  const [showRegularizationCelebration, setShowRegularizationCelebration] = useState(false)
  const [celebratingModule, setCelebratingModule] = useState<number>(0)
  const [isCharacterJumping, setIsCharacterJumping] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentView, setCurrentView] = useState("login")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [questions, setQuestions] = useState<any[]>([])

  const isNewSession = (lastSessionDate?: string): boolean => {
    if (!lastSessionDate) return true
    const today = new Date().toDateString()
    const lastSession = new Date(lastSessionDate).toDateString()
    return today !== lastSession
  }

  const loadStudentData = async (dni: string): Promise<StudentData | null> => {
    try {
      console.log("[v0] Loading student data for DNI:", dni)

      if (!isSupabaseConfigured) {
        console.error("Supabase is not properly configured")
        return null
      }

      // Get student basic info
      const { data: student, error: studentError } = await supabase.from("students").select("*").eq("dni", dni).single()

      console.log("[v0] Student query result:", { student, error: studentError })

      if (studentError && studentError.code !== "PGRST116") {
        console.error("Error loading student:", studentError)
        return null
      }

      if (!student) {
        console.log("[v0] No student found for DNI:", dni)
        return null
      }

      // Get student progress
      const { data: progressData, error: progressError } = await supabase
        .from("student_progress")
        .select("*")
        .eq("dni", dni)
        .eq("subject", student.subject)

      console.log("[v0] Progress query result:", { progressData, error: progressError })

      if (progressError) {
        console.error("Error loading progress:", progressError)
        return null
      }

      // Build moduleProgress object
      const moduleProgress: StudentData["moduleProgress"] = {}
      progressData?.forEach((progress) => {
        moduleProgress[Number.parseInt(progress.module)] = {
          m1: progress.m1,
          m2: progress.m2,
          m3: progress.m3,
          m4: progress.m4,
          blockedUntilNextClass: progress.blocked_until_next_class,
        }
      })

      const data: StudentData = {
        dni: student.dni,
        nick: student.nickname,
        materia: student.subject,
        tutor: student.tutor,
        currentModule: 1,
        moduleProgress,
        totalPoints: 0,
        lastSessionDate: progressData?.[0]?.last_session_date,
      }

      // Check for new session and reset blocked missions
      if (isNewSession(data.lastSessionDate)) {
        for (const moduleKey of Object.keys(data.moduleProgress)) {
          const module = data.moduleProgress[Number.parseInt(moduleKey)]
          if (module && module.blockedUntilNextClass) {
            if (module.m1 === false) module.m1 = null
            if (module.m2 === false) module.m2 = null
            if (module.m3 === false) module.m3 = null
            if (module.m4 === false) module.m4 = null
            module.blockedUntilNextClass = false

            // Update in database
            await supabase
              .from("student_progress")
              .update({
                m1: module.m1,
                m2: module.m2,
                m3: module.m3,
                m4: module.m4,
                blocked_until_next_class: false,
                last_session_date: new Date().toISOString(),
              })
              .eq("dni", dni)
              .eq("subject", student.subject)
              .eq("module", moduleKey)
          }
        }
      }

      return data
    } catch (error) {
      console.error("Error in loadStudentData:", error)
      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.error(
          "Network error: Unable to connect to Supabase. Check your internet connection and environment variables.",
        )
      }
      return null
    }
  }

  const saveStudentData = async (data: StudentData) => {
    try {
      // Update or insert student
      const { error: studentError } = await supabase.from("students").upsert({
        dni: data.dni,
        nickname: data.nick || `Estudiante${data.dni.slice(-4)}`,
        subject: data.materia,
        tutor: data.tutor,
      })

      if (studentError) {
        console.error("Error saving student:", studentError)
        return
      }

      // Update or insert progress for each module
      for (const [moduleNum, progress] of Object.entries(data.moduleProgress)) {
        const { error: progressError } = await supabase.from("student_progress").upsert(
          {
            dni: data.dni,
            subject: data.materia,
            module: moduleNum,
            m1: progress.m1,
            m2: progress.m2,
            m3: progress.m3,
            m4: progress.m4,
            points: Object.values(progress).filter((val) => val === true).length * 25,
            blocked_until_next_class: progress.blockedUntilNextClass || false,
            last_session_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "dni,subject,module",
          },
        )

        if (progressError) {
          console.error("Error saving progress:", progressError)
        }
      }
    } catch (error) {
      console.error("Error in saveStudentData:", error)
    }
  }

  const handleDniChange = async (dni: string) => {
    setFormData({ ...formData, dni })

    if (dni.length >= 7) {
      try {
        console.log("[v0] Attempting to load student data for DNI:", dni)
        const existingStudent = await loadStudentData(dni)
        if (existingStudent && existingStudent.nick) {
          console.log("[v0] Found existing student:", existingStudent.nick)
          setFormData((prev) => ({
            ...prev,
            dni,
            nick: existingStudent.nick || "",
            materia: existingStudent.materia || "",
          }))
        } else {
          console.log("[v0] No existing student found or no nickname")
        }
      } catch (error) {
        console.error("[v0] Error in handleDniChange:", error)
      }
    }
  }

  const getCurrentModule = (moduleProgress: StudentData["moduleProgress"]): number => {
    for (let module = 1; module <= 4; module++) {
      const progress = moduleProgress[module]
      if (!progress || progress.blockedUntilNextClass) {
        return module
      }
      if (progress.m1 !== true || progress.m2 !== true || progress.m3 !== true || progress.m4 !== true) {
        return module
      }
    }
    return 4
  }

  const calculateTotalPoints = (moduleProgress: StudentData["moduleProgress"]): number => {
    let points = 0
    Object.values(moduleProgress).forEach((module) => {
      if (module) {
        points += Object.values(module).filter((val) => val === true).length * 25
      }
    })
    return points
  }

  const getCurrentMission = (moduleProgress: any): number => {
    if (moduleProgress.blockedUntilNextClass) return -1
    if (moduleProgress.m1 !== true) return 1
    if (moduleProgress.m2 !== true) return 2
    if (moduleProgress.m3 !== true) return 3
    if (moduleProgress.m4 !== true) return 4
    return 5
  }

  const loadQuestionsForModule = async (subject: string, moduleNumber: number) => {
    console.log("[v0] Loading questions for subject:", subject, "module:", moduleNumber)

    try {
      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .select("*")
        .eq("subject", subject)
        .eq("module", moduleNumber.toString())

      if (questionError) {
        console.error("[v0] Error loading questions:", questionError)
        setQuestions([])
      } else {
        console.log("[v0] Questions loaded:", questionData)
        setQuestions(questionData || [])
      }
    } catch (error) {
      console.error("[v0] Error in loadQuestionsForModule:", error)
      setQuestions([])
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.dni || !formData.materia) {
      setError("Por favor completa todos los campos requeridos")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      let student = await loadStudentData(formData.dni)

      if (!student) {
        console.log("[v0] Creating default data for new student:", formData.dni)
        student = {
          dni: formData.dni,
          nick: formData.nick || "",
          materia: formData.materia,
          tutor: "",
          currentModule: 1,
          moduleProgress: {
            1: { m1: null, m2: null, m3: null, m4: null, blockedUntilNextClass: false },
          },
          totalPoints: 0,
          lastSessionDate: null,
        }
      }

      setStudentData(student)
      const moduleProgress = student.moduleProgress[student.currentModule] || {
        m1: null,
        m2: null,
        m3: null,
        m4: null,
      }
      setCurrentMission(getCurrentMission(moduleProgress))
      setIsLoggedIn(true)

      // Removed automatic loading of questions - now loaded dynamically
    } catch (error) {
      console.error("[v0] Error in handleLogin:", error)
      setError("Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  const handleYesNoMission = async (missionId: string, answer: boolean) => {
    if (!studentData) return

    const currentModule = studentData.currentModule
    const currentProgress = studentData.moduleProgress[currentModule] || {
      m1: null,
      m2: null,
      m3: null,
      m4: null,
    }

    const updatedProgress = { ...currentProgress, [missionId]: answer }

    if (!answer) {
      updatedProgress.blockedUntilNextClass = true
      setShowMotivationalMessage(true)
      setTimeout(() => setShowMotivationalMessage(false), 3000)
    }

    const updatedModuleProgress = {
      ...studentData.moduleProgress,
      [currentModule]: updatedProgress,
    }

    const newCurrentModule = getCurrentModule(updatedModuleProgress)
    const newTotalPoints = calculateTotalPoints(updatedModuleProgress)

    const updatedStudent = {
      ...studentData,
      currentModule: newCurrentModule,
      moduleProgress: updatedModuleProgress,
      totalPoints: newTotalPoints,
    }

    setStudentData(updatedStudent)
    await saveStudentData(updatedStudent)

    if (answer) {
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 2000)

      const nextMission = getCurrentMission(updatedProgress)
      setCurrentMission(nextMission)

      if (nextMission > 4) {
        setCelebratingModule(currentModule)
        if (currentModule === 4 && newCurrentModule === 4) {
          // All modules completed - show regularization celebration
          setShowRegularizationCelebration(true)
        } else {
          // Individual module completed
          setShowModuleCelebration(true)
        }
      }
    } else {
      setCurrentMission(-1)
    }
  }

  const handleAnswerSubmit = () => {
    if (!studentData || selectedAnswer === null) return

    console.log("[v0] Starting handleAnswerSubmit")
    console.log("[v0] Current mission:", currentMission)
    console.log("[v0] Selected answer:", selectedAnswer)

    const currentModule = studentData.currentModule
    const currentProgress = studentData.moduleProgress[currentModule] || {
      m1: null,
      m2: null,
      m3: null,
      m4: null,
    }

    console.log("[v0] Current progress before update:", currentProgress)

    const question = questions[0]
    const isCorrect = question?.options[selectedAnswer] === question?.correctAnswer

    console.log("[v0] Question:", question)
    console.log("[v0] Selected option text:", question?.options[selectedAnswer])
    console.log("[v0] Correct answer text:", question?.correctAnswer)
    console.log("[v0] Is correct:", isCorrect)

    const updatedProgress = { ...currentProgress, m3: isCorrect }

    if (!isCorrect) {
      updatedProgress.blockedUntilNextClass = true
      setShowMotivationalMessage(true)
      setTimeout(() => setShowMotivationalMessage(false), 3000)
    }

    console.log("[v0] Updated progress:", updatedProgress)

    const updatedModuleProgress = {
      ...studentData.moduleProgress,
      [currentModule]: updatedProgress,
    }

    const newCurrentModule = getCurrentModule(updatedModuleProgress)
    const newTotalPoints = calculateTotalPoints(updatedModuleProgress)

    const updatedStudent = {
      ...studentData,
      currentModule: newCurrentModule,
      moduleProgress: updatedModuleProgress,
      totalPoints: newTotalPoints,
    }

    setStudentData(updatedStudent)
    saveStudentData(updatedStudent)

    if (isCorrect) {
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 2000)

      const nextMission = getCurrentMission(updatedProgress)
      console.log("[v0] Next mission calculated:", nextMission)

      setCurrentMission(nextMission)

      // Only show module celebration if all missions are completed (nextMission > 4)
      if (nextMission > 4) {
        console.log("[v0] All missions completed, showing module celebration")
        setCelebratingModule(currentModule)
        if (currentModule === 4 && newCurrentModule === 4) {
          // All modules completed - show regularization celebration
          setShowRegularizationCelebration(true)
        } else {
          // Individual module completed
          setShowModuleCelebration(true)
        }
      } else {
        console.log("[v0] Moving to next mission:", nextMission)
      }
    } else {
      console.log("[v0] Incorrect answer, blocking until next class")
      setCurrentMission(-1)
    }

    setSelectedAnswer(null)
  }

  const handleMissionClick = async (missionId: string, moduleNumber: number) => {
    console.log("[v0] Mission clicked:", missionId, "for module:", moduleNumber)
    console.log("[v0] Current studentData:", studentData?.materia)
    console.log("[v0] Current questions state:", questions.length)

    if (!studentData) return

    // Load specific questions for mission 3
    if (missionId === "m3") {
      console.log("[v0] Loading questions for mission 3...")
      await loadQuestionsForModule(studentData.materia, moduleNumber)
      console.log("[v0] Questions loaded, new count:", questions.length)
    }

    setCurrentMission(missionId === currentMission ? -1 : missionId)
    setSelectedAnswer(null)

    console.log("[v0] Current mission set to:", missionId === currentMission ? -1 : missionId)
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Image
                  src="/images/social-learning-transparent.png"
                  alt="Social Learning"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <button
                  onClick={() => setCurrentView("welcome")}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="font-medium">Volver</span>
                </button>
                <h1 className="text-xl font-bold text-gray-800">Inicio Rápido</h1>
              </div>
            </div>
            <div className="ml-auto">
              <Image src="/images/teclab-logo.png" alt="Teclab" width={120} height={40} className="h-10 w-auto" />
            </div>
          </div>
        </div>

        <div className="px-4 py-6 max-w-6xl mx-auto w-full">
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 text-center">
              Tu Aventura de Aprendizaje Te Espera
            </h2>
            <div className="w-full">
              <ProgressPath currentModule={0} isJumping={false} />
            </div>
            <p className="text-sm text-gray-600 text-center mt-3">
              Comienza tu viaje desde el punto de partida y avanza a través de cada módulo
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="flex-1 flex items-center justify-center px-4 pb-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Bienvenido de vuelta!</h2>
              <p className="text-gray-600">Ingresa tus credenciales para continuar tu aventura</p>
            </div>
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <Label htmlFor="dni">DNI *</Label>
                <Input
                  id="dni"
                  type="text"
                  maxLength={8}
                  placeholder="12345678"
                  value={formData.dni}
                  onChange={(e) => handleDniChange(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="nick">Nickname {formData.nick ? "(autocompletado)" : "(opcional)"}</Label>
                <Input
                  id="nick"
                  type="text"
                  placeholder="Tu nombre preferido"
                  value={formData.nick}
                  onChange={(e) => setFormData({ ...formData, nick: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="materia">Materia *</Label>
                <Select
                  value={formData.materia}
                  onValueChange={(value) => setFormData({ ...formData, materia: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu materia" />
                  </SelectTrigger>
                  <SelectContent>
                    {materias?.map((materia) => (
                      <SelectItem key={materia} value={materia}>
                        {materia}
                      </SelectItem>
                    )) || []}
                  </SelectContent>
                </Select>
                {formData.materia && (
                  <p className="text-sm text-blue-600 mt-1">Tutor: {materiaTutorMap[formData.materia]}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!formData.dni || !formData.materia}
              >
                Comenzar Misiones
              </Button>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </form>
          </div>
        </div>
      </div>
    )
  }

  const currentModuleProgress = studentData.moduleProgress[studentData.currentModule] || {
    m1: null,
    m2: null,
    m3: null,
    m4: null,
  }
  const moduleProgressPercent = (Object.values(currentModuleProgress).filter((val) => val === true).length / 4) * 100
  const currentQuestion = questions[0]
  const isBlocked = currentModuleProgress.blockedUntilNextClass

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      {showMotivationalMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center max-w-md">
            <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">¡Gran trabajo!</h2>
            <p className="text-gray-600">Seguiremos intentándolo en la próxima clase</p>
            <p className="text-sm text-blue-600 mt-2">Tu progreso se mantiene guardado</p>
          </div>
        </div>
      )}

      {showCelebration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">¡Misión Completada!</h2>
            <p className="text-gray-600">+25 puntos ganados</p>
          </div>
        </div>
      )}

      {showModuleCelebration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 text-center">
            <div className="mb-6">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/felicitaciones_modulo2_banner_v2-EKZxJkq9GEoSWxNLSC0b8tVmDOjvmv.gif"
                alt={`Felicitaciones Módulo ${celebratingModule}`}
                className="w-full max-w-lg mx-auto rounded-lg"
              />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-serif font-bold text-gray-800">¡Excelente trabajo!</h2>
              <p className="text-lg text-gray-600">Has completado exitosamente el Módulo {celebratingModule}</p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 font-medium">Puntos ganados: +100 puntos</p>
                <p className="text-blue-600 text-sm mt-1">
                  {celebratingModule < 4
                    ? `Continúa con el Módulo ${celebratingModule + 1} en la próxima clase`
                    : "¡Preparate para la regularización!"}
                </p>
              </div>
              <button
                onClick={() => setShowModuleCelebration(false)}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {showRegularizationCelebration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 text-center">
            <div className="mb-6">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/felicitaciones_regularizar_banner-KoTnu4yLKMt996Rp8hhbFk2pR9uLB2.gif"
                alt="Felicitaciones Regularización"
                className="w-full max-w-lg mx-auto rounded-lg"
              />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-serif font-bold text-gray-800">¡REGULARIZASTE LA MATERIA!</h2>
              <p className="text-xl text-gray-600">
                Has completado exitosamente todos los módulos de {studentData?.materia}
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">4/4</p>
                    <p className="text-sm text-gray-600">Módulos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{studentData?.totalPoints}</p>
                    <p className="text-sm text-gray-600">Puntos</p>
                  </div>
                </div>
                <p className="text-green-800 font-medium text-lg">¡Felicitaciones por tu dedicación y esfuerzo!</p>
              </div>
              <button
                onClick={() => {
                  setIsCharacterJumping(true)
                  setTimeout(() => {
                    setShowRegularizationCelebration(false)
                    setIsCharacterJumping(false)
                  }, 3000) // Show jumping for 3 seconds before closing modal
                }}
                className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-green-700 transition-colors"
              >
                ¡Celebrar!
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Image
                  src="/images/social-learning-transparent.png"
                  alt="Social Learning Logo"
                  width={280}
                  height={84}
                  className="h-20 w-auto"
                />
              </div>
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <h1 className="text-2xl font-serif font-bold text-gray-900">
                {studentData.nick} - Módulo {studentData.currentModule}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Puntos Totales</p>
                <p className="text-2xl font-bold text-blue-600">{studentData.totalPoints}</p>
              </div>
              <Image
                src="/images/teclab-logo.png"
                alt="Teclab Instituto Técnico Superior"
                width={280}
                height={84}
                className="h-20 w-auto"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 via-white to-sky-50 shadow-lg">
            <CardContent className="py-6">
              <div className="text-center mb-4">
                <h2 className="text-xl font-serif font-bold mb-2">
                  Tu Camino al Éxito - Módulo {studentData.currentModule}
                </h2>
              </div>
              <ProgressPath currentModule={studentData.currentModule} isJumping={isCharacterJumping} />
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Missions Grid - Left Side */}
          <div className="lg:col-span-3">
            {isBlocked && (
              <Card className="border-orange-200 bg-orange-50 mb-6">
                <CardContent className="text-center py-8">
                  <Heart className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-serif font-bold mb-2 text-orange-800">¡Nos vemos en la próxima clase!</h3>
                  <p className="text-orange-700">Tu progreso está guardado. Podrás continuar en la siguiente sesión.</p>
                </CardContent>
              </Card>
            )}

            {!isBlocked && (
              <div className="grid md:grid-cols-2 gap-3">
                {missionTypes?.map((mission, index) => {
                  const missionNumber = index + 1
                  const missionValue = currentModuleProgress[mission.id as keyof typeof currentModuleProgress]
                  const isCompleted = missionValue === true
                  const isFailed = missionValue === false
                  const isCurrent = currentMission === missionNumber
                  const isLocked = missionNumber > currentMission && currentMission !== -1
                  const Icon = mission.icon

                  return (
                    <Card
                      key={mission.id}
                      className={`${isCurrent ? "ring-2 ring-blue-500" : ""} ${isLocked ? "opacity-50" : ""} ${isFailed ? "border-red-200 bg-red-50" : ""}`}
                      onClick={() => handleMissionClick(mission.id, studentData.currentModule)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="font-serif flex items-center gap-2 text-lg">
                          <div className="p-1.5 bg-blue-100 rounded-full">
                            <Icon
                              className={`w-5 h-5 ${isCompleted ? "text-green-500" : isFailed ? "text-red-500" : isCurrent ? "text-blue-500" : "text-gray-400"}`}
                            />
                          </div>
                          Misión {missionNumber}: {mission.title}
                        </CardTitle>
                        <CardDescription className="text-sm">{mission.description}</CardDescription>
                      </CardHeader>

                      {!isLocked && !isCompleted && !isFailed && (
                        <CardContent>
                          {mission.type === "yesno" && (
                            <div className="flex gap-4">
                              <Button
                                onClick={() => handleYesNoMission(mission.id, true)}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                              >
                                Sí
                              </Button>
                              <Button
                                onClick={() => handleYesNoMission(mission.id, false)}
                                variant="outline"
                                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                              >
                                No
                              </Button>
                            </div>
                          )}

                          {mission.type === "question" && isCurrent && currentQuestion && (
                            <div className="space-y-4">
                              <div className="p-4 bg-blue-50 rounded-lg">
                                <h3 className="font-semibold mb-3">{currentQuestion.question}</h3>
                                <div className="space-y-2">
                                  {currentQuestion?.options?.map((option: string, optionIndex: number) => (
                                    <label key={optionIndex} className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name="answer"
                                        value={optionIndex.toString()}
                                        checked={selectedAnswer === optionIndex.toString()}
                                        onChange={(e) => setSelectedAnswer(e.target.value)}
                                        className="text-blue-600"
                                      />
                                      <span>{option}</span>
                                    </label>
                                  )) || []}
                                </div>
                              </div>
                              <Button
                                onClick={handleAnswerSubmit}
                                disabled={!selectedAnswer}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                              >
                                Enviar Respuesta
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      )}

                      {isCompleted && (
                        <CardContent>
                          <div className="text-center py-4 text-green-600">
                            <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                            <p className="font-semibold">¡Completado correctamente!</p>
                          </div>
                        </CardContent>
                      )}

                      {isFailed && (
                        <CardContent>
                          <div className="text-center py-4 text-red-600">
                            <X className="w-8 h-8 mx-auto mb-2" />
                            <p className="font-semibold">Intentaremos en la próxima clase</p>
                          </div>
                        </CardContent>
                      )}

                      {isLocked && (
                        <CardContent>
                          <p className="text-sm text-gray-500 text-center py-4">
                            Completa la misión anterior para desbloquear
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  )
                }) || []}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Progress Panel */}
              <Card className="border-l-4 border-l-blue-500 shadow-xl bg-gradient-to-b from-blue-50 via-white to-blue-50 h-fit">
                <CardHeader className="pb-4 text-center">
                  <div className="p-3 bg-blue-100 rounded-full mx-auto mb-3">
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="font-serif text-xl text-gray-900">Módulo {studentData.currentModule}</CardTitle>
                  <CardDescription className="text-base font-medium text-blue-600">
                    {studentData.materia}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Progress Bar */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{Math.round(moduleProgressPercent)}%</div>
                    <p className="text-sm text-gray-600 mb-4">Progreso del módulo actual</p>
                  </div>

                  {/* Stats */}
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Object.values(currentModuleProgress).filter((val) => val === true).length}
                      </div>
                      <p className="text-sm text-green-700">Misiones Completadas</p>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {Object.values(currentModuleProgress).filter((val) => val === true).length * 25}
                      </div>
                      <p className="text-sm text-yellow-700">Puntos del Módulo</p>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">{studentData.totalPoints}</div>
                      <p className="text-sm text-purple-700">Puntos Totales</p>
                    </div>
                  </div>

                  {/* Student Info */}
                  <div className="border-t pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estudiante:</span>
                      <span className="font-medium">{studentData.nick}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">DNI:</span>
                      <span className="font-medium">{studentData.dni}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tutor:</span>
                      <span className="font-medium">{studentData.tutor}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
