"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, BookOpen, Trophy, ArrowLeft, Plus, Trash2, Target, Copy } from "lucide-react"
import Link from "next/link"
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client"
import Image from "next/image"

interface Student {
  dni: string
  nick: string
  materia: string
  modulo: string
  m1: boolean
  m2: boolean
  m3: boolean
  m4: boolean
  points: number
  percentage: number
  rank: number
}

interface Tutor {
  name: string
  subjects: string[]
}

const materias = ["Programación I", "Contabilidad", "Comunicación"]

export default function TutorDashboard() {
  if (!isSupabaseConfigured) {
    return (
      <div className="p-4">
        <p className="text-center text-sm text-muted-foreground">
          Supabase no está configurado. El panel de tutor está deshabilitado.
        </p>
      </div>
    )
  }

  const [selectedTutor, setSelectedTutor] = useState("")
  const [tutorPassword, setTutorPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [selectedMateria, setSelectedMateria] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [tutores, setTutores] = useState<Tutor[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [adminTutors, setAdminTutors] = useState<Tutor[]>([])
  const [adminMaterias, setAdminMaterias] = useState<string[]>([])
  const [showEditTutor, setShowEditTutor] = useState<string | null>(null)
  const [showNewMateria, setShowNewMateria] = useState(false)
  const [newMateriaName, setNewMateriaName] = useState("")
  const [newTutorForm, setNewTutorForm] = useState({ name: "", subjects: [] })
  const [assigningToSubject, setAssigningToSubject] = useState<string | null>(null)
  const [selectedTutorForAssignment, setSelectedTutorForAssignment] = useState("")
  const [questionForm, setQuestionForm] = useState({
    materia: "",
    modulo: "",
    pregunta: "",
    opciones: ["", "", "", ""],
    correcta: "",
  })

  const loadTutors = async () => {
    if (!isSupabaseConfigured) return
    try {
      const { data: tutorsData, error: tutorsError } = await supabase.from("tutors").select("name")

      if (tutorsError) {
        console.error("Error loading tutors:", tutorsError)
        return
      }

      const { data: subjectsData, error: subjectsError } = await supabase
        .from("tutor_subjects")
        .select("tutor_name, subject")

      if (subjectsError) {
        console.error("Error loading tutor subjects:", subjectsError)
        return
      }

      const tutorsList: Tutor[] = (tutorsData || []).map((tutor) => ({
        name: tutor.name,
        subjects: (subjectsData || []).filter((ts) => ts.tutor_name === tutor.name).map((ts) => ts.subject),
      }))

      setTutores(tutorsList)
    } catch (error) {
      console.error("Error in loadTutors:", error)
    }
  }

  const createNewTutor = async () => {
    if (!newTutorForm.name.trim() || newTutorForm.subjects.length === 0) {
      alert("Por favor completa el nombre y selecciona al menos una materia")
      return
    }

    if (!isSupabaseConfigured) return
    try {
      setIsLoading(true)

      // Insert tutor
      const { error: tutorError } = await supabase.from("tutors").insert({ name: newTutorForm.name.trim() })

      if (tutorError) {
        console.error("Error creating tutor:", tutorError)
        alert("Error al crear el tutor")
        return
      }

      // Insert tutor subjects
      const subjectInserts = newTutorForm.subjects.map((subject) => ({
        tutor_name: newTutorForm.name.trim(),
        subject: subject,
      }))

      const { error: subjectsError } = await supabase.from("tutor_subjects").insert(subjectInserts)

      if (subjectsError) {
        console.error("Error creating tutor subjects:", subjectsError)
        alert("Error al asignar materias al tutor")
        return
      }

      // Reset form and reload tutors
      setNewTutorForm({ name: "", subjects: [] })
      setShowEditTutor(null)
      await loadTutors()
      alert("Tutor creado exitosamente")
    } catch (error) {
      console.error("Error in createNewTutor:", error)
      alert("Error al crear el tutor")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured) return
    loadTutors()
  }, [])

  const loadStudents = async (materia: string) => {
    if (!isSupabaseConfigured) return
    try {
      setIsLoading(true)

      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("*")
        .eq("subject", materia)

      if (studentsError) {
        console.error("Error loading students:", studentsError)
        return
      }

      const studentsList: Student[] = []

      for (const student of studentsData || []) {
        const { data: progressData, error: progressError } = await supabase
          .from("student_progress")
          .select("*")
          .eq("dni", student.dni)
          .eq("subject", materia)

        if (progressError) {
          console.error("Error loading progress:", progressError)
          continue
        }

        let currentModule = 1
        let totalPoints = 0
        let completedMissions = 0

        if (progressData && progressData.length > 0) {
          for (let module = 1; module <= 4; module++) {
            const moduleProgress = progressData.find((p) => p.module === module.toString())
            if (
              !moduleProgress ||
              moduleProgress.m1 !== true ||
              moduleProgress.m2 !== true ||
              moduleProgress.m3 !== true ||
              moduleProgress.m4 !== true
            ) {
              currentModule = module
              break
            }
            if (module === 4) currentModule = 4
          }

          progressData.forEach((progress) => {
            const missions = [progress.m1, progress.m2, progress.m3, progress.m4]
            const moduleMissions = missions.filter((m) => m === true).length
            totalPoints += moduleMissions * 25
            completedMissions += moduleMissions
          })
        }

        const currentModuleProgress = progressData?.find((p) => p.module === currentModule.toString())

        studentsList.push({
          dni: student.dni,
          nick: student.nickname,
          materia: student.subject,
          modulo: currentModule.toString(),
          m1: currentModuleProgress?.m1 || false,
          m2: currentModuleProgress?.m2 || false,
          m3: currentModuleProgress?.m3 || false,
          m4: currentModuleProgress?.m4 || false,
          points: totalPoints,
          percentage: Math.round((completedMissions / 16) * 100),
          rank: 0,
        })
      }

      studentsList.sort((a, b) => b.points - a.points)
      studentsList.forEach((student, index) => {
        student.rank = index + 1
      })

      setStudents(studentsList)
    } catch (error) {
      console.error("Error in loadStudents:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const clearSemesterData = async () => {
    if (!selectedMateria) return
    if (!isSupabaseConfigured) return

    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar TODOS los datos del bimestre para ${selectedMateria}? Esta acción no se puede deshacer.`,
    )

    if (!confirmed) return

    try {
      setIsLoading(true)

      const { error: progressError } = await supabase.from("student_progress").delete().eq("subject", selectedMateria)

      if (progressError) {
        console.error("Error deleting progress:", progressError)
        alert("Error al eliminar el progreso")
        return
      }

      const { error: studentsError } = await supabase.from("students").delete().eq("subject", selectedMateria)

      if (studentsError) {
        console.error("Error deleting students:", studentsError)
        alert("Error al eliminar estudiantes")
        return
      }

      setStudents([])
      alert("Datos del bimestre eliminados exitosamente")
    } catch (error) {
      console.error("Error clearing semester data:", error)
      alert("Error al limpiar los datos")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTutorLogin = () => {
    if (!selectedTutor) {
      setPasswordError("Por favor selecciona un tutor")
      return
    }

    if (tutorPassword !== "TeamTutores2A25") {
      setPasswordError("Contraseña incorrecta")
      return
    }

    setPasswordError("")
    const selectedTutorData = tutores.find((t) => t.name === selectedTutor)
    const tutorSubjects = selectedTutorData?.subjects || []

    if (tutorSubjects.length === 1) {
      setSelectedMateria(tutorSubjects[0])
      loadStudents(tutorSubjects[0])
    } else {
      setSelectedMateria("")
      setStudents([])
    }
  }

  const handleMateriaSelect = (materia: string) => {
    setSelectedMateria(materia)
    loadStudents(materia)
  }

  const handleSubjectToggle = (subject: string) => {
    setNewTutorForm((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }))
  }

  useEffect(() => {
    if (!isSupabaseConfigured) return
    if (selectedMateria) {
      loadStudents(selectedMateria)
    }
  }, [selectedMateria])

  const getStatusBadge = (student: Student) => {
    const completed = [student.m1, student.m2, student.m3, student.m4].filter(Boolean).length
    if (completed === 4) return <Badge className="bg-green-100 text-green-800">Completado</Badge>
    if (completed >= 2) return <Badge className="bg-blue-100 text-blue-800">En Progreso</Badge>
    return <Badge className="bg-yellow-100 text-yellow-800">Iniciando</Badge>
  }

  const getCurrentTutorSubjects = () => {
    const selectedTutorData = tutores.find((t) => t.name === selectedTutor)
    return selectedTutorData?.subjects || []
  }

  const loadAdminData = async () => {
    if (!isSupabaseConfigured) return
    await loadTutors()
    await loadSubjects()
    setAdminTutors(tutores)
  }

  const deleteTutor = async (tutorName: string) => {
    if (!confirm(`¿Estás seguro de eliminar al tutor ${tutorName}?`)) return

    if (!isSupabaseConfigured) return
    try {
      setIsLoading(true)

      await supabase.from("tutor_subjects").delete().eq("tutor_name", tutorName)
      await supabase.from("tutors").delete().eq("name", tutorName)

      await loadTutors()
      alert("Tutor eliminado exitosamente")
    } catch (error) {
      console.error("Error deleting tutor:", error)
      alert("Error al eliminar tutor")
    } finally {
      setIsLoading(false)
    }
  }

  const createNewMateria = async () => {
    if (!newMateriaName.trim()) return

    if (!isSupabaseConfigured) return
    try {
      setIsLoading(true)

      const { data: existingSubject, error: checkError } = await supabase
        .from("subjects")
        .select("name")
        .eq("name", newMateriaName.trim())
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking existing subject:", checkError)
        alert("Error al verificar la materia")
        return
      }

      if (existingSubject) {
        alert("Esta materia ya existe")
        return
      }

      const { error } = await supabase.from("subjects").insert({ name: newMateriaName.trim() })

      if (error) {
        console.error("Error creating subject:", error)
        alert("Error al crear la materia")
        return
      }

      await loadSubjects()
      setNewMateriaName("")
      setShowNewMateria(false)
      alert("Materia creada exitosamente")
    } catch (error) {
      console.error("Error in createNewMateria:", error)
      alert("Error al crear la materia")
    } finally {
      setIsLoading(false)
    }
  }

  const deleteMateria = async (materia: string) => {
    if (!confirm(`¿Estás seguro de eliminar la materia ${materia}?`)) return

    if (!isSupabaseConfigured) return
    try {
      setIsLoading(true)

      const { error } = await supabase.from("subjects").delete().eq("name", materia)

      if (error) {
        console.error("Error deleting subject:", error)
        alert("Error al eliminar la materia")
        return
      }

      await loadSubjects()
      alert("Materia eliminada exitosamente")
    } catch (error) {
      console.error("Error in deleteMateria:", error)
      alert("Error al eliminar la materia")
    } finally {
      setIsLoading(false)
    }
  }

  const loadSubjects = async () => {
    if (!isSupabaseConfigured) return
    try {
      const { data: subjectsData, error } = await supabase.from("subjects").select("name").order("name")

      if (error) {
        console.error("Error loading subjects:", error)
        return
      }

      const subjectsList = (subjectsData || []).map((s) => s.name)
      setAdminMaterias(subjectsList)
    } catch (error) {
      console.error("Error in loadSubjects:", error)
    }
  }

  const assignTutorToSubject = async (tutorName: string, subjectName: string) => {
    if (!isSupabaseConfigured) return
    try {
      setIsLoading(true)

      const { error } = await supabase.from("tutor_subjects").insert({
        tutor_name: tutorName,
        subject: subjectName,
      })

      if (error) {
        console.error("Error assigning tutor to subject:", error)
        alert("Error al asignar tutor a la materia")
        return
      }

      await loadTutors()
      setAssigningToSubject(null)
      setSelectedTutorForAssignment("")
      alert("Tutor asignado exitosamente")
    } catch (error) {
      console.error("Error in assignTutorToSubject:", error)
      alert("Error al asignar tutor")
    } finally {
      setIsLoading(false)
    }
  }

  const removeTutorFromSubject = async (tutorName: string, subjectName: string) => {
    if (!confirm(`¿Estás seguro de quitar a ${tutorName} de ${subjectName}?`)) return

    if (!isSupabaseConfigured) return
    try {
      setIsLoading(true)

      const { error } = await supabase
        .from("tutor_subjects")
        .delete()
        .eq("tutor_name", tutorName)
        .eq("subject", subjectName)

      if (error) {
        console.error("Error removing tutor from subject:", error)
        alert("Error al quitar tutor de la materia")
        return
      }

      await loadTutors()
      alert("Tutor removido exitosamente")
    } catch (error) {
      console.error("Error in removeTutorFromSubject:", error)
      alert("Error al quitar tutor")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
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
              <h1 className="text-2xl font-serif font-bold text-gray-900">Panel de Tutor</h1>
            </div>
            <div className="flex items-center space-x-4">
              {selectedTutor && (
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">{selectedTutor}</span>
                </div>
              )}
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedTutor || !tutorPassword || tutorPassword !== "TeamTutores2A25" ? (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="font-serif text-2xl">Seleccionar Tutor</CardTitle>
                <CardDescription>Elige tu perfil para acceder al panel de control</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Label htmlFor="tutor">Tutor</Label>
                  <Select value={selectedTutor} onValueChange={setSelectedTutor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu nombre" />
                    </SelectTrigger>
                    <SelectContent>
                      {tutores.map((tutor) => (
                        <SelectItem key={tutor.name} value={tutor.name}>
                          {tutor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div>
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Ingresa la contraseña"
                      value={tutorPassword}
                      onChange={(e) => {
                        setTutorPassword(e.target.value)
                        setPasswordError("")
                      }}
                    />
                    {passwordError && <p className="text-sm text-red-600 mt-1">{passwordError}</p>}
                  </div>

                  <Button onClick={handleTutorLogin} className="w-full" disabled={!selectedTutor || !tutorPassword}>
                    Acceder al Panel
                  </Button>

                  <div className="pt-4 border-t">
                    <Button
                      onClick={() => setShowEditTutor("new")}
                      variant="outline"
                      className="w-full flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Crear Nuevo Tutor
                    </Button>
                  </div>
                </div>

                {showEditTutor === "new" && (
                  <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                    <h3 className="font-semibold mb-4">Crear Nuevo Tutor</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="new-tutor-name">Nombre del Tutor</Label>
                        <Input
                          id="new-tutor-name"
                          placeholder="Ingresa el nombre"
                          value={newTutorForm.name}
                          onChange={(e) => setNewTutorForm({ ...newTutorForm, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Materias que enseña</Label>
                        <div className="grid grid-cols-1 gap-2 mt-2">
                          {materias.map((materia) => (
                            <label key={materia} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={newTutorForm.subjects.includes(materia)}
                                onChange={() => handleSubjectToggle(materia)}
                                className="rounded"
                              />
                              <span className="text-sm">{materia}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={createNewTutor} disabled={isLoading} className="flex-1">
                          {isLoading ? "Creando..." : "Crear Tutor"}
                        </Button>
                        <Button
                          onClick={() => {
                            setShowEditTutor(null)
                            setNewTutorForm({ name: "", subjects: [] })
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : !selectedMateria && getCurrentTutorSubjects().length > 1 ? (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="font-serif text-2xl">Seleccionar Materia</CardTitle>
                <CardDescription>Elige la materia que quieres gestionar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Label htmlFor="materia">Materia</Label>
                  <Select value={selectedMateria} onValueChange={handleMateriaSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una materia" />
                    </SelectTrigger>
                    <SelectContent>
                      {getCurrentTutorSubjects().map((materia) => (
                        <SelectItem key={materia} value={materia}>
                          {materia}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Tabs defaultValue="students" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="students" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Estudiantes
              </TabsTrigger>
              <TabsTrigger value="questions" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Preguntas
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Estadísticas
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Administrador
              </TabsTrigger>
              <TabsTrigger value="student-view" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Vista Estudiante
              </TabsTrigger>
            </TabsList>

            <TabsContent value="students" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-serif text-2xl text-blue-600">{selectedMateria}</CardTitle>
                      <CardDescription>Monitorea el avance de tus estudiantes en tiempo real</CardDescription>
                    </div>
                    <Button
                      onClick={clearSemesterData}
                      variant="destructive"
                      size="sm"
                      disabled={isLoading || students.length === 0}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Limpiar Bimestre
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <p>Cargando datos...</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>DNI</TableHead>
                          <TableHead>Nickname</TableHead>
                          <TableHead>Módulo</TableHead>
                          <TableHead className="text-center">M1</TableHead>
                          <TableHead className="text-center">M2</TableHead>
                          <TableHead className="text-center">M3</TableHead>
                          <TableHead className="text-center">M4</TableHead>
                          <TableHead className="text-center">Puntos</TableHead>
                          <TableHead className="text-center">%</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student) => (
                          <TableRow key={student.dni}>
                            <TableCell className="font-mono">{student.dni}</TableCell>
                            <TableCell className="font-medium">{student.nick}</TableCell>
                            <TableCell>{student.modulo}</TableCell>
                            <TableCell className="text-center">{student.m1 ? "✅" : "⭕"}</TableCell>
                            <TableCell className="text-center">{student.m2 ? "✅" : "⭕"}</TableCell>
                            <TableCell className="text-center">{student.m3 ? "✅" : "⭕"}</TableCell>
                            <TableCell className="text-center">{student.m4 ? "✅" : "⭕"}</TableCell>
                            <TableCell className="text-center font-bold text-blue-600">{student.points}</TableCell>
                            <TableCell className="text-center">{student.percentage}%</TableCell>
                            <TableCell>{getStatusBadge(student)}</TableCell>
                          </TableRow>
                        ))}
                        {students.length === 0 && !isLoading && (
                          <TableRow>
                            <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                              No hay estudiantes registrados para esta materia
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="questions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Crear Nueva Pregunta
                  </CardTitle>
                  <CardDescription>Agrega preguntas para las misiones de tus estudiantes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="q-materia">Materia</Label>
                      <Select
                        value={questionForm.materia}
                        onValueChange={(value) => setQuestionForm({ ...questionForm, materia: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona materia" />
                        </SelectTrigger>
                        <SelectContent>
                          {materias.map((materia) => (
                            <SelectItem key={materia} value={materia}>
                              {materia}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="q-modulo">Módulo</Label>
                      <Select
                        value={questionForm.modulo}
                        onValueChange={(value) => setQuestionForm({ ...questionForm, modulo: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Módulo 1</SelectItem>
                          <SelectItem value="2">Módulo 2</SelectItem>
                          <SelectItem value="3">Módulo 3</SelectItem>
                          <SelectItem value="4">Módulo 4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="pregunta">Pregunta</Label>
                    <Input
                      id="pregunta"
                      placeholder="Escribe tu pregunta aquí..."
                      value={questionForm.pregunta}
                      onChange={(e) => setQuestionForm({ ...questionForm, pregunta: e.target.value })}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {questionForm.opciones.map((opcion, index) => (
                      <div key={index}>
                        <Label htmlFor={`opcion-${index + 1}`}>Opción {index + 1}</Label>
                        <Input
                          id={`opcion-${index + 1}`}
                          placeholder={`Opción ${index + 1}`}
                          value={opcion}
                          onChange={(e) => {
                            const newOpciones = [...questionForm.opciones]
                            newOpciones[index] = e.target.value
                            setQuestionForm({ ...questionForm, opciones: newOpciones })
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <Label htmlFor="correcta">Respuesta Correcta</Label>
                    <Select
                      value={questionForm.correcta}
                      onValueChange={(value) => setQuestionForm({ ...questionForm, correcta: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Opción 1</SelectItem>
                        <SelectItem value="2">Opción 2</SelectItem>
                        <SelectItem value="3">Opción 3</SelectItem>
                        <SelectItem value="4">Opción 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={() => alert("Pregunta guardada exitosamente")}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={
                      !questionForm.materia || !questionForm.pregunta || questionForm.opciones.some((op) => !op)
                    }
                  >
                    Guardar Pregunta
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle className="font-serif">Total Estudiantes</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">{students.length}</div>
                    <p className="text-sm text-gray-600">Estudiantes activos</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="text-center">
                    <CardTitle className="font-serif">Promedio de Progreso</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {Math.round(students.reduce((acc, s) => acc + s.percentage, 0) / students.length || 0)}%
                    </div>
                    <p className="text-sm text-gray-600">Completado</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Estudiantes Completados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {students
                        .sort((a, b) => b.points - a.points)
                        .map((student, index) => (
                          <div
                            key={student.dni}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-4">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                  index === 0
                                    ? "bg-yellow-100 text-yellow-800"
                                    : index === 1
                                      ? "bg-gray-100 text-gray-800"
                                      : index === 2
                                        ? "bg-orange-100 text-orange-800"
                                        : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-semibold">{student.nick}</p>
                                <p className="text-sm text-gray-600">{student.materia}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-blue-600">{student.points} pts</p>
                              <p className="text-sm text-gray-600">{student.percentage}% completado</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Ranking de Estudiantes</CardTitle>
                  <CardDescription>Los mejores estudiantes por puntos obtenidos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {students
                      .sort((a, b) => b.points - a.points)
                      .map((student, index) => (
                        <div key={student.dni} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                index === 0
                                  ? "bg-yellow-100 text-yellow-800"
                                  : index === 1
                                    ? "bg-gray-100 text-gray-800"
                                    : index === 2
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold">{student.nick}</p>
                              <p className="text-sm text-gray-600">{student.materia}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600">{student.points} pts</p>
                            <p className="text-sm text-gray-600">{student.percentage}% completado</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admin" className="space-y-6">
              <Tabs defaultValue="tutors" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="tutors">Gestionar Tutores</TabsTrigger>
                  <TabsTrigger value="subjects">Gestionar Materias</TabsTrigger>
                  <TabsTrigger value="assignments">Asignaciones</TabsTrigger>
                </TabsList>

                <TabsContent value="tutors" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-serif">Tutores Registrados</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {tutores.map((tutor) => (
                          <div key={tutor.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <h3 className="font-semibold">{tutor.name}</h3>
                              <p className="text-sm text-gray-600">Materias: {tutor.subjects.join(", ")}</p>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => deleteTutor(tutor.name)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="subjects" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-serif">Materias Disponibles</CardTitle>
                        <Button onClick={() => setShowNewMateria(true)} className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Nueva Materia
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {adminMaterias.map((materia) => (
                          <div key={materia} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <h3 className="font-semibold">{materia}</h3>
                              <p className="text-sm text-gray-600">
                                Tutores asignados:{" "}
                                {tutores
                                  .filter((t) => t.subjects.includes(materia))
                                  .map((t) => t.name)
                                  .join(", ") || "Ninguno"}
                              </p>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => deleteMateria(materia)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {showNewMateria && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif">Crear Nueva Materia</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="new-materia">Nombre de la Materia</Label>
                          <Input
                            id="new-materia"
                            placeholder="Ingresa el nombre de la materia"
                            value={newMateriaName}
                            onChange={(e) => setNewMateriaName(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={createNewMateria} disabled={!newMateriaName.trim()} className="flex-1">
                            Crear Materia
                          </Button>
                          <Button
                            onClick={() => {
                              setShowNewMateria(false)
                              setNewMateriaName("")
                            }}
                            variant="outline"
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="assignments" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-serif">Asignaciones Tutor-Materia</CardTitle>
                      <CardDescription>Gestiona qué tutores están asignados a cada materia</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {adminMaterias.map((materia) => (
                          <div key={materia} className="border rounded-lg p-4">
                            <h3 className="font-semibold text-lg mb-3">{materia}</h3>
                            <div className="space-y-2">
                              {tutores
                                .filter((t) => t.subjects.includes(materia))
                                .map((tutor) => (
                                  <div
                                    key={tutor.name}
                                    className="flex items-center justify-between bg-blue-50 p-3 rounded"
                                  >
                                    <span className="font-medium">{tutor.name}</span>
                                    <div className="flex items-center gap-2">
                                      <Badge className="bg-blue-100 text-blue-800">Asignado</Badge>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => removeTutorFromSubject(tutor.name, materia)}
                                        disabled={isLoading}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              {tutores.filter((t) => t.subjects.includes(materia)).length === 0 && (
                                <div className="bg-gray-50 p-3 rounded">
                                  <p className="text-gray-500 italic mb-2">No hay tutores asignados</p>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setAssigningToSubject(materia)}
                                    className="flex items-center gap-2"
                                  >
                                    <Plus className="w-4 h-4" />
                                    Asignar Tutor
                                  </Button>
                                </div>
                              )}
                              {tutores.filter((t) => t.subjects.includes(materia)).length > 0 && (
                                <div className="pt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setAssigningToSubject(materia)}
                                    className="flex items-center gap-2"
                                  >
                                    <Plus className="w-4 h-4" />
                                    Asignar Otro Tutor
                                  </Button>
                                </div>
                              )}
                              {assigningToSubject === materia && (
                                <div className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-400">
                                  <h4 className="font-medium mb-3">Asignar tutor a {materia}</h4>
                                  <div className="flex gap-2">
                                    <Select
                                      value={selectedTutorForAssignment}
                                      onValueChange={setSelectedTutorForAssignment}
                                    >
                                      <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Selecciona un tutor" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {tutores
                                          .filter((t) => !t.subjects.includes(materia))
                                          .map((tutor) => (
                                            <SelectItem key={tutor.name} value={tutor.name}>
                                              {tutor.name}
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      onClick={() => assignTutorToSubject(selectedTutorForAssignment, materia)}
                                      disabled={!selectedTutorForAssignment || isLoading}
                                      size="sm"
                                    >
                                      Asignar
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setAssigningToSubject(null)
                                        setSelectedTutorForAssignment("")
                                      }}
                                      size="sm"
                                    >
                                      Cancelar
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="student-view" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-2xl text-blue-600">Vista del Estudiante</CardTitle>
                  <CardDescription>Experimenta la interfaz tal como la ven tus estudiantes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 p-6 rounded-lg border-2 border-dashed border-blue-200">
                    <div className="text-center space-y-4">
                      <Target className="w-16 h-16 text-blue-500 mx-auto" />
                      <h3 className="text-xl font-semibold text-blue-800">Portal del Estudiante</h3>
                      <p className="text-blue-700 max-w-md mx-auto">
                        Los estudiantes acceden a través del enlace: <br />
                        <code className="bg-white px-2 py-1 rounded text-sm font-mono">
                          {window.location.origin}/student
                        </code>
                      </p>
                      <div className="space-y-2 text-sm text-blue-600">
                        <p>• Acceso rápido solo con DNI y materia</p>
                        <p>• Sistema de 4 misiones por módulo</p>
                        <p>• Progresión automática entre módulos</p>
                        <p>• Badges y puntos motivacionales</p>
                        <p>• Bloqueo hasta próxima clase si marcan "No"</p>
                      </div>
                      <div className="pt-4 space-y-3">
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/student`)
                            alert("¡Link copiado al portapapeles!")
                          }}
                          variant="outline"
                          className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar Link para Estudiantes
                        </Button>
                        <div>
                          <Link href="/student">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                              <Target className="w-4 h-4 mr-2" />
                              Ir al Portal Estudiante
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
