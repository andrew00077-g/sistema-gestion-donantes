import { useState, useEffect } from 'react';
import { BellRing, SendHorizontal, ShieldAlert, Clock, Activity } from 'lucide-react';

const Alertas = () => {
  const [alertas, setAlertas] = useState([]);
  const [tipoSangre, setTipoSangre] = useState('');
  const [titulo, setTitulo] = useState('');
  const [mensajeInput, setMensajeInput] = useState('');
  const [urgencia, setUrgencia] = useState('ALTA');
  const [notificacion, setNotificacion] = useState({ texto: '', tipo: '' });
  const [cargando, setCargando] = useState(false);

  const token = localStorage.getItem('token');

  // Cargar alertas de la base de datos al entrar
  const cargarAlertas = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/operaciones/alertas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const datos = await res.json();
        setAlertas(datos);
      }
    } catch (err) {
      console.error("Error cargando alertas:", err);
    }
  };

  useEffect(() => {
    cargarAlertas();
  }, []);

  const handleEmitirAlerta = async (e) => {
    e.preventDefault();
    if (!tipoSangre || tipoSangre === 'Seleccionar Grupo') {
      setNotificacion({ texto: 'Por favor, selecciona un tipo de sangre válido.', tipo: 'error' });
      return;
    }

    setCargando(true);
    setNotificacion({ texto: '', tipo: '' });

    try {
      const res = await fetch('http://localhost:3000/api/operaciones/alertas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tipo_sangre_requerido: tipoSangre,
          titulo,
          mensaje: mensajeInput,
          nivel_urgencia: urgencia
        })
      });

      const data = await res.json();

      if (res.ok) {
        setNotificacion({ texto: data.msg, tipo: 'exito' });
        setTitulo('');
        setMensajeInput('');
        setTipoSangre('');
        cargarAlertas(); // Recargamos la lista
      } else {
        setNotificacion({ texto: data.msg || 'Error al emitir alerta', tipo: 'error' });
      }
    } catch (error) {
      setNotificacion({ texto: 'No se pudo conectar con el servidor.', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 font-sans pb-16">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
          <BellRing size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Centro de Alertas de Emergencia</h1>
          <p className="text-sm text-slate-500">Emisión y monitoreo de solicitudes críticas de suministro de sangre</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario de Emisión */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm h-fit space-y-5">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert size={16} className="text-red-500" />
            Nueva Difusión
          </h3>

          {notificacion.texto && (
            <div className={`p-3 rounded-xl text-xs font-bold border ${
              notificacion.tipo === 'exito' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {notificacion.texto}
            </div>
          )}

          <form onSubmit={handleEmitirAlerta} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Grupo de Sangre Solicitado</label>
              <select 
                value={tipoSangre} 
                onChange={(e) => setTipoSangre(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 bg-white text-sm text-slate-700"
                required
              >
                <option value="">Seleccionar Grupo</option>
                <option value="O+">O RH+ (Universal)</option>
                <option value="O-">O RH- (Crítico)</option>
                <option value="A+">A RH+</option>
                <option value="A-">A RH-</option>
                <option value="B+">B RH+</option>
                <option value="B-">B RH-</option>
                <option value="AB+">AB RH+</option>
                <option value="AB-">AB RH-</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Nivel de Urgencia</label>
              <select 
                value={urgencia} 
                onChange={(e) => setUrgencia(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 bg-white text-sm text-slate-700 font-bold"
              >
                <option value="MEDIA">⚠️ MEDIA</option>
                <option value="ALTA">🚨 ALTA</option>
                <option value="CRITICA">🔥 CRÍTICA</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Título del Incidente</label>
              <input 
                type="text" 
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. Suministro Crítico Hospital Viedma"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 text-sm"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Mensaje para Donantes</label>
              <textarea 
                rows="4"
                value={mensajeInput}
                onChange={(e) => setMensajeInput(e.target.value)}
                placeholder="Detalle la emergencia médica y ubicación..."
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 text-sm resize-none"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={cargando}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-md shadow-red-600/10 active:scale-95 text-xs tracking-wider"
            >
              <span>{cargando ? 'EMITIENDO...' : 'EMITIR ALERTA'}</span>
              <SendHorizontal size={14} />
            </button>
          </form>
        </div>

        {/* Panel de Visualización Histórica */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Activity size={16} />
            Historial de Alertas en Cochabamba
          </h3>

          {alertas.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-2xl border border-slate-200/60 text-slate-400 font-medium text-sm">
              No se han emitido alertas de emergencia en el sistema todavía.
            </div>
          ) : (
            <div className="space-y-4">
              {alertas.map((alerta) => (
                <div key={alerta.id_alerta} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between gap-4">
                  {/* Barra lateral indicadora de urgencia */}
                  <div className={`absolute top-0 left-0 h-full w-1.5 ${
                    alerta.nivel_urgencia === 'CRITICA' ? 'bg-red-600' : alerta.nivel_urgencia === 'ALTA' ? 'bg-amber-500' : 'bg-blue-500'
                  }`}></div>

                  <div className="space-y-2 flex-grow pl-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider text-white ${
                        alerta.nivel_urgencia === 'CRITICA' ? 'bg-red-600' : alerta.nivel_urgencia === 'ALTA' ? 'bg-amber-500' : 'bg-blue-500'
                      }`}>
                        {alerta.nivel_urgencia}
                      </span>
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                        Factor requerido: {alerta.tipo_sangre_requerido}
                      </span>
                    </div>

                    <h4 className="text-md font-bold text-slate-900">{alerta.titulo}</h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{alerta.mensaje}</p>
                  </div>

                  <div className="flex flex-col items-start md:items-end justify-between shrink-0 text-xs text-slate-400 font-bold pl-2 md:pl-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{new Date(alerta.fecha_emision).toLocaleString()}</span>
                    </div>
                    <span className="text-slate-500 text-[10px] uppercase mt-2">Por: Dr. {alerta.admin_nombre}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alertas;