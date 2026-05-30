import { useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Eye, EyeOff, Mail, ArrowLeft, RefreshCw } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  
  // Estados para el flujo de Inicio de Sesión
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Estados para el flujo de Recuperación de Contraseña
  const [modoRecuperar, setModoRecuperar] = useState(false);
  const [emailRecuperar, setEmailRecuperar] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  // 1. INICIAR SESIÓN (Envío al Backend)
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); 
    setCargando(true);

    try {
      const respuesta = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        localStorage.setItem('token', datos.token);
        localStorage.setItem('rol', datos.usuario.rol);
        localStorage.setItem('email', datos.usuario.email);
        localStorage.setItem('nombreAdmin', datos.usuario.nombre);

        navigate('/dashboard');
      } else {
        setError(datos.msg || 'Credenciales incorrectas');
      }
    } catch (err) {
      
      console.error("Error en la conexión de login:", err);
      setError('No se pudo conectar con el servidor del Banco de Sangre.');
    } finally {
      setCargando(false);
    }
  };

  // 2. RECUPERAR CONTRASEÑA 
  const handleRecuperar = async (e) => {
    e.preventDefault();
    setError('');
    setMensajeExito('');
    setCargando(true);

    try {
      const respuesta = await fetch('http://localhost:3000/api/auth/recuperar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: emailRecuperar })
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        setMensajeExito(datos.msg || 'Se ha enviado la clave temporal a tu correo.');
        setEmailRecuperar('');
      } else {
        setError(datos.msg || 'No se pudo procesar la solicitud.');
      }
    } catch (err) {
      
      console.error("Error en la conexión de recuperación:", err);
      setError('Error al conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center h-screen w-screen overflow-hidden font-sans bg-gradient-to-br from-slate-900 via-slate-800 to-red-950">
      
      {/* Capa decorativa sutil con un destello de luz roja en la esquina superior derecha */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-red-600/10 via-transparent to-transparent z-0"></div>

      {/* Tarjeta Dinámica de Login / Recuperación */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl mx-4 transition-all duration-300">
        
        {modoRecuperar ? (
         
          <div className="space-y-6">
            <button 
              type="button"
              onClick={() => { setModoRecuperar(false); setError(''); setMensajeExito(''); }}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-600 transition uppercase tracking-wider bg-transparent border-none outline-none cursor-pointer"
            >
              <ArrowLeft size={14} /> Volver al Login
            </button>

            <div className="flex flex-col items-center">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-full mb-3">
                <Mail size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-800 text-center tracking-tight">¿Olvidaste tu contraseña?</h2>
              <p className="text-xs text-slate-500 text-center mt-1">Introduce tu correo institucional registrado. Te despacharemos una nueva contraseña temporal de inmediato.</p>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl text-center border border-red-200">{error}</div>}
            {mensajeExito && <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl text-center border border-emerald-200">{mensajeExito}</div>}

            <form onSubmit={handleRecuperar} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Correo de Registro</label>
                <input 
                  type="email" 
                  required 
                  value={emailRecuperar}
                  onChange={(e) => setEmailRecuperar(e.target.value)}
                  placeholder="admin@bancodesangre.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition text-slate-700 bg-slate-50 text-sm"
                />
              </div>

              <button 
                type="submit" 
                disabled={cargando}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition active:scale-95 text-xs tracking-wider"
              >
                {cargando ? <RefreshCw size={14} className="animate-spin" /> : 'ENVIAR CLAVE TEMPORAL'}
              </button>
            </form>
          </div>
        ) : (
          
          <>
            <div className="flex flex-col items-center mb-6">
              <div className="p-3 bg-red-100 rounded-full text-red-600 mb-3">
                <HeartPulse size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 text-center tracking-tight">Acceso Seguro</h2>
              <p className="text-sm text-slate-500 text-center mt-1">Ingresa tus credenciales de administrador</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl text-center border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="admin@bancodesangre.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition text-slate-700 bg-slate-50 text-sm"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Contraseña</label>
                  <button 
                    type="button"
                    onClick={() => { setModoRecuperar(true); setError(''); setMensajeExito(''); }}
                    className="text-xs font-bold text-red-600 hover:underline bg-transparent border-none outline-none cursor-pointer"
                  >
                    ¿Olvidaste tu clave?
                  </button>
                </div>
                
                <div className="relative">
                  <input 
                    type={mostrarPassword ? 'text' : 'password'} 
                    required 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition text-slate-700 bg-slate-50 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition"
                  >
                    {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={cargando}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 hover:bg-red-700 transition transform active:scale-95 text-sm"
              >
                {cargando ? <RefreshCw size={16} className="animate-spin" /> : 'INICIAR SESIÓN'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;