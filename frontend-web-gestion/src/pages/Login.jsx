import { useNavigate } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulamos el ingreso directo al Dashboard
    navigate('/dashboard');
  };

  return (
    <div className="relative flex items-center justify-center h-screen w-screen overflow-hidden font-sans">
      {/* Video de fondo */}
      <video autoPlay loop muted className="absolute inset-0 w-full h-full object-cover z-0">
        <source src="https://assets.mixkit.co/videos/preview/mixkit-doctor-holding-a-blood-sample-tube-41614-large.mp4" type="video/mp4" />
      </video>

      {/* Capa oscura decorativa */}
      <div className="absolute inset-0 bg-slate-900/70 z-0"></div>

      {/* Tarjeta de Login */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl mx-4">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-red-100 rounded-full text-red-600 mb-3">
            <HeartPulse size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 text-center tracking-tight">Acceso Seguro</h2>
          <p className="text-sm text-slate-500 text-center mt-1">Ingresa tus credenciales de administrador</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              required 
              placeholder="admin@bancodesangre.com"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition text-slate-700 bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Contraseña</label>
            <input 
              type="password" 
              required 
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition text-slate-700 bg-slate-50"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3 px-4 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 hover:bg-red-700 transition transform active:scale-95"
          >
            INICIAR SESIÓN
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;