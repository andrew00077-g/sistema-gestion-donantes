import { useState } from 'react';
import { UserPlus, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const FichaDonante = () => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    ci: '',
    telefono: '',
    email: '',
    fecha_nacimiento: '',
    genero: '',
    tipo_sangre: '',
    estado_medico: 'APTO', // Sincronizado con el ENUM de tu DB
    peso_kg: ''
  });

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ texto: '', tipo: '' });
    setCargando(false);

    const token = localStorage.getItem('token');
    if (!token) {
      setMensaje({ texto: 'No estás autorizado. Inicia sesión como administrador.', tipo: 'error' });
      return;
    }

    try {
      setCargando(true);
      // Petición real al backend de Node.js en el puerto 3000
      const respuesta = await fetch('http://localhost:3000/api/donantes/registrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        setMensaje({ 
          texto: `Éxito: Ficha guardada. Cuenta móvil activada para el donante (Usuario y Contraseña provisional: ${formData.ci}).`, 
          tipo: 'exito' 
        });
        
        // Limpieza de campos
        setFormData({
          nombres: '',
          apellidos: '',
          ci: '',
          telefono: '',
          email: '',
          fecha_nacimiento: '',
          genero: '',
          tipo_sangre: '',
          estado_medico: 'APTO',
          peso_kg: ''
        });
      } else {
        setMensaje({ texto: datos.msg || 'Error al registrar el donante', tipo: 'error' });
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setMensaje({ texto: 'Error de conexión con el servidor Node.js.', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Ficha de Registro del Donante</h3>
        <p className="text-sm text-slate-500 mt-1">
          Ingreso centralizado de datos demográficos y estado de triage clínico.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 space-y-6">
        
        {/* Alertas de Respuesta */}
        {mensaje.texto && (
          <div className={`p-4 rounded-xl text-xs font-bold border transition-all ${
            mensaje.tipo === 'exito' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            {mensaje.texto}
          </div>
        )}

        {/* Sección 1: Datos Personales */}
        <div>
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">1. Identidad y Datos Demográficos</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nombres</label>
              <input type="text" name="nombres" required value={formData.nombres} onChange={handleChange} placeholder="Ej. Juan Carlos" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 transition bg-slate-50 text-slate-700 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Apellidos</label>
              <input type="text" name="apellidos" required value={formData.apellidos} onChange={handleChange} placeholder="Ej. Perez Gomez" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 transition bg-slate-50 text-slate-700 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Carnet de Identidad (C.I.)</label>
              <input type="text" name="ci" required value={formData.ci} onChange={handleChange} placeholder="Ej. 8765432" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 transition bg-slate-50 text-slate-700 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Teléfono / Celular</label>
              <input type="text" name="telefono" required value={formData.telefono} onChange={handleChange} placeholder="Ej. 71234567" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 transition bg-slate-50 text-slate-700 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Correo Electrónico (Para App Móvil)</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="juan.perez@example.com" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 transition bg-slate-50 text-slate-700 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">F. de Nacimiento</label>
                <input type="date" name="fecha_nacimiento" required value={formData.fecha_nacimiento} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 transition bg-slate-50 text-slate-700 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Género</label>
                <select name="genero" required value={formData.genero} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 transition bg-white text-slate-700 text-sm font-bold">
                  <option value="">Seleccionar</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Sección 2: Datos Médicos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">2. Clasificación</h4>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Grupo Sanguíneo</label>
            <select name="tipo_sangre" required value={formData.tipo_sangre} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 transition bg-white text-slate-700 font-black text-sm">
              <option value="">Seleccione grupo</option>
              <option value="O+">O Rh +</option>
              <option value="O-">O Rh -</option>
              <option value="A+">A Rh +</option>
              <option value="A-">A Rh -</option>
              <option value="B+">B Rh +</option>
              <option value="B-">B Rh -</option>
              <option value="AB+">AB Rh +</option>
              <option value="AB-">AB Rh -</option>
            </select>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">3. Signos Vitales</h4>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Peso Corporal (kg)</label>
            <input type="number" step="0.01" name="peso_kg" required value={formData.peso_kg} onChange={handleChange} placeholder="Ej. 68.5" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 transition bg-slate-50 text-slate-700 text-sm font-bold" />
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">4. Triage Clínico</h4>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Condición Médica Inicial</label>
            <div className="flex gap-2 mt-1">
              {[
                { label: 'Apto', value: 'APTO' },
                { label: 'Diferido', value: 'EN_ESPERA' },
                { label: 'Excluido', value: 'NO_APTO' }
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, estado_medico: item.value })}
                  className={`flex-1 py-2.5 px-2 text-[10px] font-black rounded-xl border transition-all flex items-center justify-center gap-1 ${
                    formData.estado_medico === item.value
                      ? item.value === 'APTO' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                        : item.value === 'EN_ESPERA' ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-sm'
                        : 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {item.value === 'APTO' && <CheckCircle size={12} />}
                  {item.value === 'EN_ESPERA' && <AlertTriangle size={12} />}
                  {item.value === 'NO_APTO' && <XCircle size={12} />}
                  {item.label.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Botón y Nota Estilizada */}
        <div className="pt-4 flex flex-col items-end gap-2 border-t border-slate-100">
          <button 
            type="submit" 
            disabled={cargando}
            className={`flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-md shadow-red-600/10 transition active:scale-95 text-sm uppercase tracking-wider ${
              cargando ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <UserPlus size={18} /> {cargando ? 'Guardando en Servidor...' : 'Guardar Registro Físico'}
          </button>
          <span className="text-[11px] text-slate-400 font-medium">
            * Al guardar, el sistema asignará automáticamente el C.I. como credencial provisoria para la aplicación móvil.
          </span>
        </div>
      </form>
    </div>
  );
};

export default FichaDonante;