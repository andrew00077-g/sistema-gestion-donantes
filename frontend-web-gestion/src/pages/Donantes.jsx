import { useState, useEffect } from 'react';
import { Search, Plus, RefreshCw } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';

const Donantes = () => {
  const navigate = useNavigate();
  const [donantes, setDonantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estados para los filtros de búsqueda
  const [busqueda, setBusqueda] = useState('');
  const [filtroGrupo, setFiltroGrupo] = useState('Todos los grupos');
  
  const token = localStorage.getItem('token');

  // 🔄 Función exclusiva para el botón manual (evita colisiones con el efecto inicial)
  const refrescarDonantesManual = async () => {
    setCargando(true);
    try {
      const res = await fetch('http://localhost:3000/api/donantes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const datos = await res.json();
        setDonantes(datos);
      }
    } catch (error) {
      console.error("Error al refrescar donantes:", error);
    } finally {
      setCargando(false);
    }
  };

  
  useEffect(() => {
    let activo = true;

    const cargarDonantesIniciales = async () => {
      setCargando(true);
      try {
        const res = await fetch('http://localhost:3000/api/donantes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok && activo) {
          const datos = await res.json();
          setDonantes(datos);
        }
      } catch (error) {
        console.error("Error al cargar donantes iniciales:", error);
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarDonantesIniciales();

    return () => {
      activo = false; // Evita actualizaciones de estado en componentes desmontados
    };
  }, [token]);

  //  Lógica de filtrado en tiempo real (Frontend)
  const donantesFiltrados = donantes.filter(d => {
    const nombreCompleto = `${d.nombres || ''} ${d.apellidos || ''}`.toLowerCase();
    const ciReal = d.ci ? d.ci.toLowerCase() : '';
    const termino = busqueda.toLowerCase();

    const coincideBusqueda = nombreCompleto.includes(termino) || ciReal.includes(termino);
    const coincideGrupo = filtroGrupo === 'Todos los grupos' || d.tipo_sangre === filtroGrupo;

    return coincideBusqueda && coincideGrupo;
  });

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen font-sans pb-16">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">Gestión de Donantes</h3>
          <p className="text-sm text-slate-500 mt-1">Registro y control de voluntarios del Banco de Sangre</p>
        </div>
        <button 
          onClick={() => navigate('/registrar-donante')}
          className="flex items-center gap-2 px-5 py-3 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition shadow-md shadow-red-600/20 active:scale-95"
        >
          <Plus size={18}/> REGISTRAR DONANTE
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        
        {/* Barra de Búsqueda y Filtros */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 bg-slate-50/50">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              type="text" 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o carnet de identidad..." 
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm text-slate-700 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filtroGrupo}
              onChange={(e) => setFiltroGrupo(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl outline-none bg-white text-sm text-slate-700 font-medium focus:border-red-500 transition-all"
            >
              <option value="Todos los grupos">Todos los grupos</option>
              <option value="O+">O RH+</option>
              <option value="O-">O RH-</option>
              <option value="A+">A RH+</option>
              <option value="A-">A RH-</option>
              <option value="B+">B RH+</option>
              <option value="B-">B RH-</option>
              <option value="AB+">AB RH+</option>
              <option value="AB-">AB RH-</option>
            </select>
            <button 
              onClick={refrescarDonantesManual}
              className="p-2.5 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 transition"
              title="Recargar tabla"
            >
              <RefreshCw size={18} className={cargando ? 'animate-spin text-red-500' : ''} />
            </button>
          </div>
        </div>

        {/* Tabla de Datos */}
        <div className="overflow-x-auto">
          {cargando ? (
            <div className="flex items-center justify-center gap-2 p-12 text-slate-500 font-medium text-sm">
              <RefreshCw size={16} className="animate-spin text-red-500" />
              Cargando lista de voluntarios...
            </div>
          ) : donantesFiltrados.length === 0 ? (
            <div className="text-center p-12 text-slate-400 font-medium text-sm">
              No se encontraron donantes registrados con esos criterios.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-5">Nombre Completo</th>
                  <th className="p-5">C.I.</th>
                  <th className="p-5">Grupo Sanguíneo</th>
                  <th className="p-5">Teléfono</th>
                  <th className="p-5">Estado Clínico</th>
                  <th className="p-5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {donantesFiltrados.map(d => (
                  <tr key={d.id_donante} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-5 font-bold text-slate-800">{d.nombres} {d.apellidos}</td>
                    <td className="p-5 text-slate-600 font-medium">{d.ci || 'Sin registro'}</td>
                    <td className="p-5">
                      <span className="px-3 py-1 bg-red-50 text-red-700 rounded-lg font-black text-xs border border-red-100">
                        {d.tipo_sangre}
                      </span>
                    </td>
                    <td className="p-5 text-slate-600 font-medium">{d.telefono || '---'}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                        d.estado_clinico === 'APTO' ? 'bg-emerald-50 text-emerald-700' : 
                        d.estado_clinico === 'RECHAZADO' ? 'bg-rose-50 text-rose-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {d.estado_clinico || 'EN EVALUACIÓN'}
                      </span>
                    </td>
                    <td className="p-5 flex justify-center gap-2">
                      <button className="px-4 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition">
                        Editar
                      </button>
                      <button className="px-4 py-1.5 text-xs font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">
                        Historial
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Donantes;