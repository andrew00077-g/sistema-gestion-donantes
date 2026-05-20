import { useState } from 'react'; // <-- Importamos useState
import { useNavigate } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  
  // 1. ESTADOS PARA CAPTURAR LOS DATOS Y ERRORES
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // 2. FUNCIÓN DE CONEXIÓN REAL CON EL BACKEND
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Limpiamos errores previos antes de intentar

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
        // ¡ÉXITO! Guardamos las credenciales reales devueltas por el servidor
        localStorage.setItem('token', datos.token);
        localStorage.setItem('rol', datos.usuario.rol);
        localStorage.setItem('email', datos.usuario.email);

        // Saltamos al dashboard de verdad
        navigate('/dashboard');
      } else {
        // Si el backend dice que las credenciales están mal
        setError(datos.msg || 'Credenciales incorrectas');
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      // Si el backend está apagado o no hay conexión
      setError('No se pudo conectar con el servidor del Banco de Sangre.');
    }
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

        {/* ALERTA DE ERROR VISUAL */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl text-center border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              required 
              value={email} // <-- Vinculado al estado
              onChange={(e) => setEmail(e.target.value)} // <-- Guarda lo que escribes
              placeholder="admin@bancodesangre.com"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition text-slate-700 bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Contraseña</label>
            <input 
              type="password" 
              required 
              value={password} // <-- Vinculado al estado
              onChange={(e) => setPassword(e.target.value)} // <-- Guarda lo que escribes
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