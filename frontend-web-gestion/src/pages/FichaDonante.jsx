import { useState } from 'react';
import { UserPlus, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const FichaDonante = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    ci: '',
    telefono: '',
    email: '',
    edad: '',
    genero: '',
    grupoSanguineo: '',
    estadoTriage: 'Apto'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Encapsulamiento del payload listo para la API REST en PHP
    const payload = {
      ...formData,
      username: formData.ci,       // Regla de ingeniería: Usuario = C.I.
      password: formData.ci        // Regla de ingeniería: Contraseña Inicial = C.I.
    };

    console.log("JSON enviado al servidor PHP:", payload);
    alert(`Éxito: Ficha guardada. Cuenta móvil activada (Usuario y Contraseña provisional: ${formData.ci}).`);
    
    // Limpieza de campos
    setFormData({
      nombre: '',
      ci: '',
      telefono: '',
      email: '',
      edad: '',
      genero: '',
      grupoSanguineo: '',
      estadoTriage: 'Apto'
    });
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
        
        {/* Sección 1: Datos Personales */}
        <div>
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">1. Identidad y Datos Demográficos</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre Completo</label>
              <input type="text" name="nombre" required value={formData.nombre} onChange={handleChange} placeholder="Ej. Juan Carlos Perez" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 transition bg-slate-50 text-slate-700" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Carnet de Identidad (C.I.)</label>
              <input type="text" name="ci" required value={formData.ci} onChange={handleChange} placeholder="Ej. 8765432" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 transition bg-slate-50 text-slate-700" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Teléfono / Celular</label>
              <input type="text" name="telefono" required value={formData.telefono} onChange={handleChange} placeholder="Ej. 71234567" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 transition bg-slate-50 text-slate-700" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Correo Electrónico</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="juan.perez@example.com" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 transition bg-slate-50 text-slate-700" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Edad</label>
                <input type="number" name="edad" required value={formData.edad} onChange={handleChange} placeholder="25" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 transition bg-slate-50 text-slate-700" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Género</label>
                <select name="genero" required value={formData.genero} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 transition bg-white text-slate-700">
                  <option value="">Seleccionar</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Sección 2: Datos Médicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">2. Clasificación Sanguínea</h4>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Grupo y Factor RH</label>
            <select name="grupoSanguineo" required value={formData.grupoSanguineo} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 transition bg-white text-slate-700 font-bold">
              <option value="">Seleccione el grupo</option>
              <option value="O+">O RH + (Positivo)</option>
              <option value="O-">O RH - (Negativo)</option>
              <option value="A+">A RH + (Positivo)</option>
              <option value="A-">A RH - (Negativo)</option>
              <option value="B+">B RH + (Positivo)</option>
              <option value="B-">B RH - (Negativo)</option>
              <option value="AB+">AB RH + (Positivo)</option>
              <option value="AB-">AB RH - (Negativo)</option>
            </select>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">3. Triage Clínico</h4>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Condición Médica Inicial</label>
            <div className="flex gap-3 mt-1">
              {['Apto', 'Diferido', 'Excluido'].map((estado) => (
                <button
                  key={estado}
                  type="button"
                  onClick={() => setFormData({ ...formData, estadoTriage: estado })}
                  className={`flex-1 py-2.5 px-3 text-xs font-extrabold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                    formData.estadoTriage === estado
                      ? estado === 'Apto' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                        : estado === 'Diferido' ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-sm'
                        : 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {estado === 'Apto' && <CheckCircle size={14} />}
                  {estado === 'Diferido' && <AlertTriangle size={14} />}
                  {estado === 'Excluido' && <XCircle size={14} />}
                  {estado.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Botón y Nota Estilizada */}
        <div className="pt-4 flex flex-col items-end gap-2 border-t border-slate-100">
          <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-md shadow-red-600/10 transition active:scale-95 text-sm uppercase tracking-wider">
            <UserPlus size={18} /> Guardar Registro Físico
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