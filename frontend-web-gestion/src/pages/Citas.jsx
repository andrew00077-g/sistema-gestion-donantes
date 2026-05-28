import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Search, CalendarDays } from 'lucide-react';

const Citas = () => {
  const [citas, setCitas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const cargarCitas = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/citas', {
          headers: { 'Authorization': `Bearer ${token || ''}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Nos aseguramos de que 'data' sea un arreglo para que no rompa el .map
          setCitas(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error al conectar con la API de citas:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarCitas();
  }, [token]);

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const res = await fetch(`http://localhost:3000/api/citas/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (res.ok) {
        setCitas(prevCitas => 
          prevCitas.map(cita => 
            cita.id_cita === id ? { ...cita, estado: nuevoEstado } : cita
          )
        );
      }
    } catch (error) {
      console.error("Error al actualizar el estado de la cita:", error);
    }
  };

  // Filtro seguro usando encadenamiento opcional (?.) para evitar pantallas en blanco
  const filtradas = citas.filter(c => {
    const nombreValido = c?.nombres ? c.nombres.toLowerCase() : '';
    const apellidoValido = c?.apellidos ? c.apellidos.toLowerCase() : '';
    const ciValido = c?.ci ? c.ci : '';
    const termino = busqueda.toLowerCase();

    return nombreValido.includes(termino) || apellidoValido.includes(termino) || ciValido.includes(termino);
  });

  if (cargando) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen text-slate-500 text-xs font-bold">
        Cargando agenda de citas...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-slate-900">Agenda de Citas Médicas</h3>
          <p className="text-xs text-slate-500 font-medium">Control de flujo y asistencia de donantes voluntarios</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input 
            type="text" placeholder="Buscar por C.I. o Nombre"
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:border-red-500 transition"
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Si la base de datos está vacía, muestra este panel en lugar de quedarse en blanco */}
      {filtradas.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center max-w-xl mx-auto mt-12 space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <CalendarDays size={24} />
          </div>
          <h4 className="font-bold text-slate-700 text-sm">No se encontraron citas</h4>
          <p className="text-xs text-slate-400">Actualmente no existen citas programadas que coincidan con la búsqueda o la base de datos está vacía.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtradas.map(cita => (
            <div key={cita.id_cita} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-[9px] font-black uppercase tracking-wider">{cita.tipo_sangre || 'S/N'}</span>
                  <h4 className="font-bold text-slate-800 mt-1.5">{cita.nombres} {cita.apellidos}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">C.I. {cita.ci}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                  cita.estado === 'PENDIENTE' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                  cita.estado === 'COMPLETADA' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                  'bg-slate-100 text-slate-500'
                }`}>{cita.estado || 'PENDIENTE'}</span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                <div className="flex items-center gap-1.5"><Calendar size={14}/> {cita.fecha_hora ? new Date(cita.fecha_hora).toLocaleDateString() : 'Sin fecha'}</div>
                <div className="flex items-center gap-1.5"><Clock size={14}/> {cita.fecha_hora ? new Date(cita.fecha_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Sin hora'}</div>
              </div>

              {cita.notes && (
                <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg italic">Nota: {cita.notes}</p>
              )}

              {cita.estado === 'PENDIENTE' && (
                <div className="flex gap-2 pt-2">
                  <button onClick={() => cambiarEstado(cita.id_cita, 'COMPLETADA')} className="flex-1 py-2 bg-emerald-500 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 hover:bg-emerald-600 transition"><CheckCircle size={12}/> Confirmar</button>
                  <button onClick={() => cambiarEstado(cita.id_cita, 'AUSENTE')} className="flex-1 py-2 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 hover:bg-slate-300 transition"><AlertCircle size={12}/> Ausente</button>
                  <button onClick={() => cambiarEstado(cita.id_cita, 'CANCELADA')} className="py-2 px-3 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition"><XCircle size={14}/></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Citas;