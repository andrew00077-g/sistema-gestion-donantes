import { useState, useEffect, useRef } from 'react';
import { User, LogOut, Settings, Key, Mail, Shield, IdCard, Phone, X, Eye, EyeOff } from 'lucide-react';

const MenuPerfil = ({ usuarioActual, alCerrarSesion }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const menuRef = useRef(null);

  // Estados para el formulario de edición de datos personales
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [ci, setCi] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  
  // Estados para contraseñas y su visibilidad
  const [passwordActual, setPasswordActual] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [verPasswordActual, setVerPasswordActual] = useState(false);
  const [verNuevaPassword, setVerNuevaPassword] = useState(false);

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [cargando, setCargando] = useState(false);

  // Cargar datos del usuario al abrir el modal de configuración
  const abrirConfiguracion = () => {
    // Si nombres y apellidos vienen juntos en 'nombre', intentamos separarlos con un fallback inteligente
    const nombreCompleto = usuarioActual?.nombre || '';
    const partes = nombreCompleto.split(' ');
    
    setNombres(partes[0] || '');
    setApellidos(partes.slice(1).join(' ') || '');
    setCi(usuarioActual?.ci || '');
    setTelefono(usuarioActual?.telefono || '');
    setEmail(usuarioActual?.email || '');
    
    // Resetear campos de control y contraseñas
    setPasswordActual('');
    setNuevaPassword('');
    setVerPasswordActual(false);
    setVerNuevaPassword(false);
    setMensaje({ texto: '', tipo: '' });
    
    setModalAbierto(true);
    setMenuAbierto(false);
  };

  // Manejador para cerrar el menú flotante al hacer clic fuera
  useEffect(() => {
    const hacerClicFuera = (evento) => {
      if (menuRef.current && !menuRef.current.contains(evento.target)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener('mousedown', hacerClicFuera);
    return () => document.removeEventListener('mousedown', hacerClicFuera);
  }, []);

  const handleActualizarPerfil = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje({ texto: '', tipo: '' });

    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch('http://localhost:3000/api/auth/actualizar-perfil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          nombres, 
          apellidos, 
          ci, 
          telefono, 
          email, 
          passwordActual, 
          nuevaPassword 
        })
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        setMensaje({ 
          texto: 'Perfil actualizado con éxito. Los cambios se reflejarán por completo en tu próximo inicio de sesión.', 
          tipo: 'exito' 
        });
        
        // Actualizamos localmente el localStorage si corresponde para mantener sincronía inmediata
        localStorage.setItem('nombre', `${nombres} ${apellidos}`.trim());
        localStorage.setItem('email', email);
        localStorage.setItem('ci', ci);
        localStorage.setItem('telefono', telefono);

        setPasswordActual('');
        setNuevaPassword('');
      } else {
        setMensaje({ texto: datos.msg || 'Error al actualizar', tipo: 'error' });
      }
    } catch (error) {
      console.error('Error en la conexión:', error);
      setMensaje({ texto: 'Error de conexión con el servidor.', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="relative font-sans" ref={menuRef}>
      {/* Botón del Perfil en la Esquina Superior Derecho */}
      <button 
        onClick={() => setMenuAbierto(!menuAbierto)}
        className="flex items-center gap-2.5 p-1.5 pr-3 hover:bg-slate-100 rounded-xl transition active:scale-95 border border-transparent hover:border-slate-200/60"
      >
        <div className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-red-600/10 tracking-wider">
          {usuarioActual?.nombre ? usuarioActual.nombre.substring(0, 2).toUpperCase() : 'US'}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-xs font-black text-slate-800 leading-none mb-0.5">{usuarioActual?.nombre || 'Usuario'}</p>
          <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">{usuarioActual?.rol}</span>
        </div>
      </button>

      {/* Menú Desplegable Flotante (Dropdown) */}
      {menuAbierto && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200/70 shadow-xl shadow-slate-900/5 z-50 py-2 animate-in fade-in slide-in-from-top-3 duration-150">
          <div className="px-4 py-3 border-b border-slate-100 hidden md:block">
            <p className="text-xs font-semibold text-slate-400">Sesión iniciada como</p>
            <p className="text-xs font-bold text-slate-700 truncate">{usuarioActual?.email}</p>
          </div>

          <button 
            onClick={abrirConfiguracion}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <Settings size={16} className="text-slate-400" />
            Configurar Perfil
          </button>

          <div className="border-t border-slate-100 my-1"></div>

          <button 
            onClick={alCerrarSesion}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      )}

      {/* MODAL MODERNO DE EDICIÓN DE PERFIL */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
            
            {/* Cabecera del Modal */}
            <div className="p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                  <User size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">Gestionar Mi Perfil</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Modifica tus datos de identidad y credenciales de acceso</p>
                </div>
              </div>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition">
                <X size={18} />
              </button>
            </div>

            {/* Cuerpo del Modal con Formulario */}
            <form onSubmit={handleActualizarPerfil} className="p-6 space-y-4 overflow-y-auto">
              
              {mensaje.texto && (
                <div className={`p-3.5 rounded-xl text-xs font-bold border ${
                  mensaje.tipo === 'exito' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {mensaje.texto}
                </div>
              )}

              {/* Rol e identificación interna de solo lectura */}
              <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-500 uppercase flex items-center gap-1.5"><Shield size={13}/> Rol Asignado</span>
                <span className="font-extrabold text-red-600 px-2 py-0.5 bg-red-50 rounded-md uppercase tracking-wider">{usuarioActual?.rol}</span>
              </div>

              {/* GRUPO: Datos Personales Editables */}
              <div className="space-y-3">
                <p className="text-[11px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1">Información Personal</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nombres</label>
                    <input 
                      type="text" 
                      value={nombres}
                      onChange={(e) => setNombres(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition text-slate-700 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Apellidos</label>
                    <input 
                      type="text" 
                      value={apellidos}
                      onChange={(e) => setApellidos(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition text-slate-700 text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cédula de Identidad (CI)</label>
                    <div className="relative">
                      <IdCard className="absolute left-3 top-2.5 text-slate-400" size={15} />
                      <input 
                        type="text" 
                        value={ci}
                        onChange={(e) => setCi(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition text-slate-700 text-xs font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Teléfono / Celular</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 text-slate-400" size={15} />
                      <input 
                        type="text" 
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition text-slate-700 text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* GRUPO: Cuenta de Acceso */}
              <div className="space-y-3 pt-2">
                <p className="text-[11px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1">Credenciales de Acceso</p>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Correo Electrónico de Acceso</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 text-slate-400" size={15} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition text-slate-700 text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Contraseña Actual</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 text-slate-400" size={15} />
                      <input 
                        type={verPasswordActual ? "text" : "password"} 
                        value={passwordActual}
                        onChange={(e) => setPasswordActual(e.target.value)}
                        placeholder="Ingresa clave actual"
                        className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition text-slate-700 text-xs font-medium"
                      />
                      <button 
                        type="button"
                        onClick={() => setVerPasswordActual(!verPasswordActual)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
                      >
                        {verPasswordActual ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nueva Contraseña (Opcional)</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 text-slate-400" size={15} />
                      <input 
                        type={verNuevaPassword ? "text" : "password"} 
                        value={nuevaPassword}
                        onChange={(e) => setNuevaPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition text-slate-700 text-xs font-medium"
                      />
                      <button 
                        type="button"
                        onClick={() => setVerNuevaPassword(!verNuevaPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
                      >
                        {verNuevaPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="pt-3 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setModalAbierto(false)}
                  className="w-1/3 py-2.5 border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition text-xs"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={cargando}
                  className="w-2/3 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition text-xs shadow-lg shadow-slate-950/10 disabled:opacity-50"
                >
                  {cargando ? 'Guardando Cambios...' : 'Guardar Configuración'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPerfil;
