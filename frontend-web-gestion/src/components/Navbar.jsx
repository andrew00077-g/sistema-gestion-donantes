import MenuPerfil from './MenuPerfil';

const Navbar = ({ usuarioActual, alCerrarSesion }) => {
  return (
    <header className="bg-white border-b border-slate-200/80 px-6 py-3.5 flex justify-between items-center w-full h-16 shadow-sm shadow-slate-100/40">
      
      {/* Lado Izquierdo: Título del Sistema */}
      <div className="flex items-center gap-3">
        <h1 className="text-xs md:text-sm font-black text-slate-700 uppercase tracking-wider">
          Banco de Sangre de Referencia Departamental
        </h1>
      </div>

      {/* Lado Derecho: Menú de Perfil Flotante */}
      <div className="flex items-center gap-4">
        <MenuPerfil 
          usuarioActual={usuarioActual} 
          alCerrarSesion={alCerrarSesion} 
        />
      </div>

    </header>
  );
};

export default Navbar;