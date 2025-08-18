import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Image
                  src="/images/social-learning-transparent.png"
                  alt="Social Learning Logo"
                  width={320}
                  height={96}
                  className="h-24 w-auto"
                />
              </div>
              <h1 className="text-2xl font-serif font-bold text-gray-900">MisionesTeclab</h1>
            </div>
            <div className="flex items-center">
              <Image
                src="/images/teclab-logo.png"
                alt="Teclab Instituto Técnico Superior"
                width={320}
                height={96}
                className="h-24 w-auto"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif font-bold text-gray-900 mb-4">¡Sube de Nivel en tu Aprendizaje!</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Rastrea tu progreso, gana recompensas y compite con tus compañeros en un sistema gamificado de misiones
            educativas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/student">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                Acceso Estudiante
              </Button>
            </Link>
            <Link href="/tutor">
              <Button
                size="lg"
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg bg-transparent"
              >
                Acceso Tutor
              </Button>
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            ¿Listo para comenzar tu aventura de aprendizaje?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Únete a una misión hoy y desbloquea tu potencial. Cada paso te acerca más a convertirte en un experto.
          </p>
          <Link href="/student">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
              Comenzar Ahora
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
