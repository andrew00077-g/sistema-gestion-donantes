import { Link } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';

const Inicio = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-900 font-sans">
      
      {/* 1. El Video de Fondo (Cargado desde tu carpeta public) */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover opacity-40"
      >
        <source src="/fondo-medico.mp4" type="video/mp4" />
      </video>

      {/* 2. Capa de degradado para oscurecer el video y que las letras se lean perfecto */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/80"></div>

      {/* 3. Contenido Principal */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-600/20 backdrop-blur-md rounded-full border border-red-500/30">
            <HeartPulse size={56} className="text-red-500 animate-pulse" />
          </div>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-4 drop-shadow-lg">
          Banco de Sangre <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-600">
            de Referencia Cochabamba
          </span>
        </h1>
        
        <p className="mt-4 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-medium mb-10 drop-shadow-md">
          Sistema centralizado de gestión, monitoreo de stock y alertas tempranas para la red hospitalaria de Cochabamba.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/login" 
            className="flex items-center justify-center gap-2 px-8 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-600/30 active:scale-95 group"
          >
            INGRESAR AL SISTEMA
          </Link>
          
          
        </div>

      </div>
      
      {/* Pie de página pequeño */}
      <div className="absolute bottom-6 w-full text-center z-10">
        <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">
         
        </p>
      </div>
    </div>
  );
};

export default Inicio;