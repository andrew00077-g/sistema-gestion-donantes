import { useState } from 'react';
import { UserPlus, ShieldCheck, Mail, Lock, UserCog, User, Briefcase, FileCode } from 'lucide-react';

const RegistrarUsuario = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('MEDICO'); // Por defecto 'MEDICO'
  

  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [cargo, setCargo] = useState('');
  const [codigoMedico, setCodigoMedico] = useState('');

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [cargando, setCargando] = useState(false);

  const handleRegistro = async (e) => {
    e.preventDefault();
    setMensaje({ texto: '', tipo: '' });
    setCargando(true);

    const token = localStorage.getItem('token'); 

    if (!token) {
      setMensaje({ texto: 'No estás autorizado. Por favor, inicia sesión.', tipo: 'error' });
      setCargando(false);
      return;
    }

    // Preparamos el objeto con la data estructurada
    const dataFormulario = { 
      email, 
      password, 
      rol,
      // Solo mandamos estos datos si es un ADMIN para evitar ruido en la API
      nombres: rol === 'ADMIN' ? nombres : null,
      apellidos: rol === 'ADMIN' ? apellidos : null,
      cargo: rol === 'ADMIN' ? cargo : null,
      codigo_medico: rol === 'ADMIN' ? codigoMedico : null
    };

    try {
      const respuesta = await fetch('http://localhost:3000/api/auth/registrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(dataFormulario)
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        setMensaje({ texto: datos.msg || 'Usuario creado exitosamente', tipo: 'exito' });
        // Limpiamos todos los campos tras el éxito
        setEmail('');
        setPassword('');
        setRol('MEDICO');
        setNombres('');
        setApellidos('');
        setCargo('');
        setCodigoMedico('');
      } else {
        setMensaje({ texto: datos.msg || 'Error al registrar', tipo: 'error' });
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setMensaje({ texto: 'Error de conexión con el servidor.', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto font-sans pb-16">
      {/* Encabezado de la Sección */}
      <div className="flex items-center gap-3 mb-8 border-b border-slate-200 pb-4">
        <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
          <UserPlus size={24} />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Gestión del Personal</h1>
          <p className="text-xs text-slate-500 font-medium">Registrar cuentas internas para el control del Banco de Sangre</p>
        </div>
      </div>

      {/* Tarjeta del Formulario */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 bg-slate-50/50 border-b border-slate-200/60 flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Acceso Restringido (Solo Administradores)</span>
        </div>

        <form onSubmit={handleRegistro} className="p-6 space-y-6">
          
          {/* Alertas de Estado dinámicas */}
          {mensaje.texto && (
            <div className={`p-4 rounded-xl text-xs font-bold border transition-all ${
              mensaje.tipo === 'exito' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {mensaje.texto}
            </div>
          )}

          {/* Selector de Roles Exclusivos de Sistema */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Asignación de Rol Interno</label>
            <div className="relative">
              <UserCog className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <select 
                value={rol} 
                onChange={(e) => setRol(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition text-slate-700 bg-slate-50/30 text-sm font-bold appearance-none cursor-pointer"
              >
                <option value="MEDICO">MÉDICO / ENFERMERO (Acceso estándar)</option>
                <option value="ADMIN">ADMINISTRADOR (Acceso total al sistema)</option>
              </select>
            </div>
          </div>

          {/* Input Correo Electrónico */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Correo Electrónico Institucional</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="ejemplo@bancodesangre.com"
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition text-slate-700 bg-slate-50/30 text-sm font-medium"
              />
            </div>
          </div>

          {/* Input Contraseña */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contraseña Temporal de Acceso</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition text-slate-700 bg-slate-50/30 text-sm font-medium"
              />
            </div>
          </div>

          {/* FORMULARIO DINÁMICO: Solo aparece si el rol seleccionado es ADMIN */}
          {rol === 'ADMIN' && (
            <div className="pt-4 border-t border-slate-100 space-y-6 animate-fadeIn">
              <p className="text-xs font-extrabold text-red-600 uppercase tracking-widest">Información del Perfil del Administrador</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombres</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={nombres} 
                      onChange={(e) => setNombres(e.target.value)} 
                      required={rol === 'ADMIN'}
                      placeholder="Ej. Juan Carlos"
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition text-slate-700 bg-slate-50/30 text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Apellidos</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={apellidos} 
                      onChange={(e) => setApellidos(e.target.value)} 
                      required={rol === 'ADMIN'}
                      placeholder="Ej. Pérez Gómez"
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition text-slate-700 bg-slate-50/30 text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cargo / Ocupación</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={cargo} 
                      onChange={(e) => setCargo(e.target.value)} 
                      placeholder="Ej. Director Médico, Bioquímico"
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition text-slate-700 bg-slate-50/30 text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Código de Colegiatura Médica</label>
                  <div className="relative">
                    <FileCode className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={codigoMedico} 
                      onChange={(e) => setCodigoMedico(e.target.value)} 
                      placeholder="Ej. CM-9455-CBBA"
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition text-slate-700 bg-slate-50/30 text-sm font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botón de Envío */}
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={cargando}
              className={`w-full py-3 px-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-950/10 hover:bg-slate-800 transition transform active:scale-95 text-xs tracking-wider uppercase ${
                cargando ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {cargando ? 'Registrando en Base de Datos...' : 'Crear Cuenta Autorizada'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrarUsuario;