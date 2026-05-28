import { useState, useEffect } from 'react';
import { UserPlus, ShieldCheck, Mail, Lock, UserCog, User, Briefcase, FileCode, Eye, EyeOff, IdCard, Phone, Users, UserX, UserCheck, Pencil, X, AlertTriangle } from 'lucide-react';

const RegistrarUsuario = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [rol, setRol] = useState('MEDICO'); 

  // Estados alineados a la base de datos
  const [ci, setCi] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [cargo, setCargo] = useState('');
  const [codigoMedico, setCodigoMedico] = useState('');
  const [telefono, setTelefono] = useState('');

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [cargando, setCargando] = useState(false);

  // Estados de la lista de personal
  const [listaPersonal, setListaPersonal] = useState([]);
  const [mensajeTabla, setMensajeTabla] = useState('Cargando personal de salud...');

  // Estados para la edición
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idUsuarioAEditar, setIdUsuarioAEditar] = useState(null);

  //  NUEVOS ESTADOS PARA EL MODAL DE CONFIRMACIÓN PERSONALIZADO
  const [modalConfirmar, setModalConfirmar] = useState({
    abierto: false,
    idUsuario: null,
    estadoActual: '',
    nombreUsuario: ''
  });

  // Obtener la lista de usuarios
  const cargarPersonal = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMensajeTabla('No autorizado. Por favor, inicia sesión nuevamente.');
        return;
      }

      const respuesta = await fetch('http://localhost:3000/api/auth/personal', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const datos = await respuesta.json();

      if (respuesta.ok) {
        if (Array.isArray(datos)) {
          setListaPersonal(datos);
          if (datos.length === 0) setMensajeTabla('No hay personal registrado.');
        } 
        else if (datos.usuarios && Array.isArray(datos.usuarios)) {
          setListaPersonal(datos.usuarios);
          if (datos.usuarios.length === 0) setMensajeTabla('No hay personal registrado.');
        } 
        else if (datos.personal && Array.isArray(datos.personal)) {
          setListaPersonal(datos.personal);
          if (datos.personal.length === 0) setMensajeTabla('No hay personal registrado.');
        }
        else {
          setMensajeTabla('Error en el formato de datos del servidor.');
        }
      } else {
        setMensajeTabla(datos.msg || 'Error al obtener datos del servidor.');
      }
    } catch (error) {
      console.error(" Error crítico de red:", error);
      setMensajeTabla('Error de conexión con el servidor.');
    }
  };

  useEffect(() => {
    let activo = true;
    const inicializarPersonal = async () => {
      if (activo) await cargarPersonal();
    };
    inicializarPersonal();
    return () => { activo = false; };
  }, []);

  // Manejador de Registro / Edición
  const handleFormulario = async (e) => {
    e.preventDefault();
    setMensaje({ texto: '', tipo: '' });
    setCargando(true);

    const token = localStorage.getItem('token'); 
    if (!token) {
      setMensaje({ texto: 'No estás autorizado. Por favor, inicia sesión.', tipo: 'error' });
      setCargando(false);
      return;
    }

    const dataFormulario = { 
      email, rol, ci, nombres, apellidos, cargo, codigo_medico: codigoMedico, telefono
    };

    if (!modoEdicion) dataFormulario.password = password;

    try {
      const url = modoEdicion 
        ? `http://localhost:3000/api/auth/personal/editar/${idUsuarioAEditar}`
        : 'http://localhost:3000/api/auth/registrar';
        
      const metodo = modoEdicion ? 'PUT' : 'POST';

      const respuesta = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(dataFormulario)
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        setMensaje({ texto: datos.msg || 'Operación realizada con éxito', tipo: 'exito' });
        limpiarFormulario();
        await cargarPersonal();
      } else {
        setMensaje({ texto: datos.msg || 'Error al procesar la solicitud', tipo: 'error' });
      }
    } catch (error) {
      console.error("Error en conexión:", error);
      setMensaje({ texto: 'Error de conexión con el servidor.', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  const activarEdicion = (empleado) => {
    setMensaje({ texto: '', tipo: '' });
    setModoEdicion(true);
    setIdUsuarioAEditar(empleado.id_usuario);
    setEmail(empleado.email || '');
    setRol(empleado.rol || 'MEDICO');
    setCi(empleado.ci || '');
    setNombres(empleado.nombres || '');
    setApellidos(empleado.apellidos || '');
    setCargo(empleado.cargo || '');
    setCodigoMedico(empleado.codigo_medico || '');
    setTelefono(empleado.telefono || '');
  };

  const limpiarFormulario = () => {
    setModoEdicion(false);
    setIdUsuarioAEditar(null);
    setEmail(''); setPassword(''); setRol('MEDICO'); setCi(''); setNombres(''); setApellidos(''); setCargo(''); setCodigoMedico(''); setTelefono('');
  };

  //  Abrir el modal personalizado guardando los datos necesarios
  const abrirModalConfirmacion = (empleado) => {
    setModalConfirmar({
      abierto: true,
      idUsuario: empleado.id_usuario || empleado.id,
      estadoActual: empleado.estado,
      nombreUsuario: `${empleado.nombres} ${empleado.apellidos}`
    });
  };

  //  Ejecutar el cambio de estado si el usuario presiona "Confirmar" en el modal
  const ejecutarCambioEstado = async () => {
    const { idUsuario, estadoActual } = modalConfirmar;
    const nuevoEstado = estadoActual === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`http://localhost:3000/api/auth/personal/estado/${idUsuario}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nuevoEstado })
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        await cargarPersonal();
      } else {
        alert(datos.msg || 'No se pudo cambiar el estado.');
      }
    } catch (error) {
      console.error("Error al modificar estado:", error);
    } finally {
      // Cerrar el modal pase lo que pase
      setModalConfirmar({ abierto: false, idUsuario: null, estadoActual: '', nombreUsuario: '' });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans pb-16 grid grid-cols-1 lg:grid-cols-5 gap-6 relative">
      
      {/* SECCIÓN ENCABEZADO */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4 lg:col-span-5">
        <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
          <UserPlus size={24} />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Gestión del Personal</h1>
          <p className="text-xs text-slate-500 font-medium">Registrar y controlar cuentas internas autorizadas para el Banco de Sangre</p>
        </div>
      </div>

      {/* COLUMNA IZQUIERDA: Formulario */}
      <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden h-fit lg:col-span-2 transition-all ${modoEdicion ? 'border-amber-200 ring-2 ring-amber-500/5' : 'border-slate-200/80'}`}>
        <div className={`p-5 border-b flex items-center justify-between ${modoEdicion ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50/50 border-slate-200/60'}`}>
          <div className="flex items-center gap-2">
            {modoEdicion ? (
              <>
                <Pencil size={16} className="text-amber-600" />
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Modificar Personal Médico</span>
              </>
            ) : (
              <>
                <ShieldCheck size={16} className="text-emerald-600" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Registro de Nuevo Personal</span>
              </>
            )}
          </div>
          {modoEdicion && (
            <button type="button" onClick={limpiarFormulario} className="p-1 hover:bg-amber-100 rounded-lg text-amber-700 transition">
              <X size={16} />
            </button>
          )}
        </div>

        <form onSubmit={handleFormulario} className="p-6 space-y-4">
          {mensaje.texto && (
            <div className={`p-4 rounded-xl text-xs font-bold border transition-all ${mensaje.tipo === 'exito' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>
              {mensaje.texto}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Asignación de Rol Interno</label>
            <div className="relative">
              <UserCog className="absolute left-4 top-3 text-slate-400" size={18} />
              <select value={rol} onChange={(e) => setRol(e.target.value)} className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition text-slate-700 bg-slate-50/30 text-xs font-bold appearance-none cursor-pointer">
                <option value="MEDICO">MÉDICO / ENFERMERO (Estándar)</option>
                <option value="ADMIN">ADMINISTRADOR (Acceso total)</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3 text-slate-400" size={18} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="ejemplo@bancodesangre.com" className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition text-slate-700 bg-slate-50/30 text-xs font-medium" />
              </div>
            </div>

            {!modoEdicion && (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contraseña Temporal</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3 text-slate-400" size={18} />
                  <input type={mostrarPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required={!modoEdicion} placeholder="Mínimo 6 caracteres" className="w-full pl-12 pr-12 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition text-slate-700 bg-slate-50/30 text-xs font-medium" />
                  <button type="button" onClick={() => setMostrarPassword(!mostrarPassword)} className="absolute right-4 top-3 text-slate-400 hover:text-slate-600 transition">
                    {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Cédula de Identidad (CI)</label>
              <div className="relative">
                <IdCard className="absolute left-4 top-3 text-slate-400" size={18} />
                <input type="text" value={ci} onChange={(e) => setCi(e.target.value)} required placeholder="Ej. 8456215" className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition text-slate-700 bg-slate-50/30 text-xs font-medium" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Teléfono de Contacto</label>
              <div className="relative">
                <Phone className="absolute left-4 top-3 text-slate-400" size={18} />
                <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Ej. 70712345" className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition text-slate-700 bg-slate-50/30 text-xs font-medium" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nombres</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-400" size={16} />
                  <input type="text" value={nombres} onChange={(e) => setNombres(e.target.value)} required placeholder="Juan" className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition text-slate-700 bg-slate-50/30 text-xs font-medium" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Apellidos</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-400" size={16} />
                  <input type="text" value={apellidos} onChange={(e) => setApellidos(e.target.value)} required placeholder="Pérez" className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition text-slate-700 bg-slate-50/30 text-xs font-medium" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Cargo / Ocupación</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-3 text-slate-400" size={18} />
                <input type="text" value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder={rol === 'ADMIN' ? 'Ej. Director de Guardia' : 'Ej. Bioquímico Encargado'} className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition text-slate-700 bg-slate-50/30 text-xs font-medium" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Matrícula Profesional</label>
              <div className="relative">
                <FileCode className="absolute left-4 top-3 text-slate-400" size={18} />
                <input type="text" value={codigoMedico} onChange={(e) => setCodigoMedico(e.target.value)} placeholder="Ej. MP-9455-CBBA" className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition text-slate-700 bg-slate-50/30 text-xs font-medium" />
              </div>
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            {modoEdicion && (
              <button type="button" onClick={limpiarFormulario} className="w-1/3 py-3 px-4 bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-200 transition text-xs tracking-wider uppercase">
                Cancelar
              </button>
            )}
            <button type="submit" disabled={cargando} className={`font-bold rounded-xl shadow-lg transition transform active:scale-95 text-xs tracking-wider uppercase py-3 px-4 ${modoEdicion ? 'w-2/3 bg-amber-600 text-white shadow-amber-600/10 hover:bg-amber-700' : 'w-full bg-slate-900 text-white shadow-slate-950/10 hover:bg-slate-800'} ${cargando ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {cargando ? 'Procesando...' : modoEdicion ? 'Guardar Cambios' : 'Crear Cuenta Autorizada'}
            </button>
          </div>
        </form>
      </div>

      {/* COLUMNA DERECHA: Tabla */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col lg:col-span-3">
        <div className="p-5 bg-slate-50/50 border-b border-slate-200/60 flex items-center gap-2">
          <Users size={16} className="text-slate-600" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Control del Personal y Accesos</span>
        </div>

        <div className="p-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/60">
                <th className="py-2.5 px-3">Nombre / Contacto</th>
                <th className="py-2.5 px-3">Rol / Cargo</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {listaPersonal.map((empleado) => (
                <tr key={empleado.id_usuario || empleado.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-800">{empleado.apellidos}, {empleado.nombres}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{empleado.email}</p>
                    <span className="text-[10px] text-slate-500">CI: {empleado.ci} {empleado.telefono ? `| Cel: ${empleado.telefono}` : ''}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-block text-[9px] font-black px-1.5 py-0.5 rounded mb-0.5 ${empleado.rol === 'ADMIN' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>{empleado.rol}</span>
                    <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{empleado.cargo || 'Personal Interno'}</p>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${empleado.estado === 'ACTIVO' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      <span className={`w-1 h-1 rounded-full ${empleado.estado === 'ACTIVO' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      {empleado.estado || 'ACTIVO'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button type="button" onClick={() => activarEdicion(empleado)} className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition flex items-center justify-center" title="Editar información">
                        <Pencil size={13} />
                      </button>

                      {/* 🌟 CAMBIO: Ahora llama a abrirModalConfirmacion en vez de handleAlternarEstado directamente */}
                      <button
                        type="button"
                        onClick={() => abrirModalConfirmacion(empleado)}
                        className={`p-1.5 rounded-lg transition border text-[11px] font-bold flex items-center gap-1 ${
                          empleado.estado === 'ACTIVO' 
                            ? 'border-rose-200 text-rose-600 hover:bg-rose-50' 
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={empleado.estado === 'ACTIVO' ? 'Dar de baja' : 'Dar de alta'}
                      >
                        {empleado.estado === 'ACTIVO' ? (
                          <>
                            <UserX size={13} />
                            <span className="hidden xl:inline">Baja</span>
                          </>
                        ) : (
                          <>
                            <UserCheck size={13} />
                            <span className="hidden xl:inline">Alta</span>
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {listaPersonal.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-slate-400 font-bold">{mensajeTabla}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalConfirmar.abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto bg-slate-900/60 backdrop-blur-sm transition-all duration-300 animate-fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-2xl transform transition-all scale-100 p-6 flex flex-col items-center text-center">
            
            {/* Icono de advertencia adaptable al estado */}
            <div className={`p-3 rounded-full mb-4 ${modalConfirmar.estadoActual === 'ACTIVO' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <AlertTriangle size={28} />
            </div>

            {/* Títulos claros */}
            <h3 className="text-base font-black text-slate-800 tracking-tight mb-1">
              Confirmar Cambio de Estado
            </h3>
            <p className="text-xs text-slate-500 font-semibold mb-2">
              Usuario: <span className="text-slate-700 font-bold font-mono">{modalConfirmar.nombreUsuario}</span>
            </p>

            {/* Mensajes exactamente como los pediste */}
            <p className="text-xs font-bold text-slate-600 px-2 bg-slate-50 py-3 rounded-xl border border-slate-100 w-full mb-6">
              ¿Estás seguro de cambiar el estado de este usuario a{' '}
              <span className={`font-black ${modalConfirmar.estadoActual === 'ACTIVO' ? 'text-rose-600' : 'text-emerald-600'}`}>
                {modalConfirmar.estadoActual === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'}
              </span>?
            </p>

            {/* Botones de acción del Modal */}
            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={() => setModalConfirmar({ abierto: false, idUsuario: null, estadoActual: '', nombreUsuario: '' })}
                className="w-1/2 py-2.5 px-4 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/60 hover:bg-slate-200 transition tracking-wider uppercase"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={ejecutarCambioEstado}
                className={`w-1/2 py-2.5 px-4 text-white text-xs font-bold rounded-xl shadow-md transition transform active:scale-95 tracking-wider uppercase ${
                  modalConfirmar.estadoActual === 'ACTIVO'
                    ? 'bg-rose-600 shadow-rose-600/10 hover:bg-rose-700'
                    : 'bg-emerald-600 shadow-emerald-600/10 hover:bg-emerald-700'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RegistrarUsuario;