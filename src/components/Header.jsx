/**
 * Header - Componente presentacional para el título de la aplicación
 */
import logo from '../assets/logo.png'

function Header() {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center gap-4">
          <img src={logo} alt="DameGasofa Logo" className="h-20 w-auto" />
          <div className="flex flex-col items-start">
            <h1 className="text-5xl font-extrabold italic tracking-tight text-[#0B1C3E] leading-none">
              DameGasofa
            </h1>
            <p className="text-2xl font-bold italic text-[#2A8BC0] tracking-wide -mt-1">
              Gasolineras & Rutas
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
