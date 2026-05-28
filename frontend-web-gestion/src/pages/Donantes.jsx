import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, RefreshCw, Edit3, ShieldAlert, Check, X, FileText } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';

const Donantes = () => {
  const navigate = useNavigate();
  const [donantes, setDonantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estados para filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroGrupo, setFiltroGrupo] = useState('Todos los grupos');
  const [filtroEstado, setFiltroEstado] = useState('Todos los estados');

  // Estados para Modal de Actualización de Estado Clínico
  const [donanteSeleccionado, setDonanteSeleccionado] = useState(null);
  const [nuevoEstadoClinico, setNuevoEstadoClinico] = useState('');
  const [guardandoEstado, setGuardandoEstado] = useState(false);
  const [mensajeFeedback, setMensajeFeedback] = useState({ texto: '', tipo: '' });
  
  const token = localStorage.getItem('token');

  // 🔄 Memorizamos la función de carga con useCallback para que pueda ser invocada de forma segura
  const fetchDonantesALaFuerza = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch('http://localhost:3000/api/donantes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const datos = await res.json();
        const listaLimpia = Array.isArray(datos) ? datos : datos.donantes || [];
        setDonantes(listaLimpia);
      } else {
        console.error("Error en respuesta de servidor");
      }
    } catch (error) {
      console.error("Error al procesar la petición de donantes:", error);
    } finally {
      setCargando(false);
    }
  }, [token]);

  // ⚡ Efecto de inicialización limpio y seguro que evita renderizados en cascada
  useEffect(() => {
    let activo = true;

    const cargarDonantesIniciales = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/donantes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok && activo) {
          const datos = await res.json();
          const listaLimpia = Array.isArray(datos) ? datos : datos.donantes || [];
          setDonantes(listaLimpia);
        }
      } catch (error) {
        console.error("Error al cargar donantes iniciales:", error);
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarDonantesIniciales();

    return () => {
      activo = false; // Desactiva actualizaciones si el componente se desmonta en medio del fetch
    };
  }, [token]);

  // ⚙️ Función para actualizar el estado clínico directamente en el backend
  const handleGuardarEstadoClinico = async (e) => {
    e.preventDefault();
    if (!donanteSeleccionado) return;

    setGuardandoEstado(true);
    setMensajeFeedback({ texto: '', tipo: '' });
    
    const idActual = donanteSeleccionado.id_donante || donanteSeleccionado.id;

    try {
      const res = await fetch(`http://localhost:3000/api/donantes/${idActual}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...donanteSeleccionado,
          // Se envían ambas llaves por si el backend espera una u otra
          estado_clinico: nuevoEstadoClinico,
          estado_medico: nuevoEstadoClinico
        })
      });

      if (res.ok) {
        setMensajeFeedback({ texto: '¡Estado clínico actualizado correctamente!', tipo: 'exito' });
        setTimeout(() => {
          setDonanteSeleccionado(null);
          setMensajeFeedback({ texto: '', tipo: '' });
          fetchDonantesALaFuerza(); // Recargar datos de forma segura
        }, 1200);
      } else {
        setMensajeFeedback({ texto: 'Error al actualizar en el servidor.', tipo: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMensajeFeedback({ texto: 'No se pudo conectar con el backend.', tipo: 'error' });
    } finally {
      setGuardandoEstado(false);
    }
  };

  // 🔍 Filtrado reactivo en Frontend blindado frente a inconsistencias de la base de datos
  const donantesFiltrados = donantes.filter(d => {
    const nombreCompleto = `${d.nombres || d.nombre || ''} ${d.apellidos || d.apellido || ''}`.toLowerCase();
    const ciReal = d.ci ? String(d.ci).toLowerCase() : '';
    const termino = busqueda.toLowerCase();

    const coincideBusqueda = nombreCompleto.includes(termino) || ciReal.includes(termino);
    
    // Normalización del factor: Si viene con caracteres añadidos (ej: 'MO+') extrae solo los biológicos ('O+')
    const dTipoSangre = d.tipo_sangre ? String(d.tipo_sangre).toUpperCase() : '';
    const tipoSangreLimpio = dTipoSangre.replace(/[^A-B-O-R-H\\+\\-]/g, '');
    const coincideGrupo = filtroGrupo === 'Todos los grupos' || dTipoSangre === filtroGrupo || tipoSangreLimpio === filtroGrupo;
    
    // Tolerancia dual: Verifica tanto estado_clinico como estado_medico provistos por el backend
    const estadoDonante = (d.estado_clinico || d.estado_medico || 'EN EVALUACIÓN').toUpperCase();
    const coincideEstado = filtroEstado === 'Todos los estados' || estadoDonante === filtroEstado;

    return coincideBusqueda && coincideGrupo && coincideEstado;
  });

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen font-sans pb-16">
      
      {/* SECCIÓN DE ENCABEZADO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Gestión del Padrón de Donantes</h3>
          <p className="text-xs text-slate-500 mt-1">Auditoría, control bioclínico y disponibilidad de voluntarios activos en Cochabamba</p>
        </div>
        <button 
          onClick={() => navigate('/registrar-donante')}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-600/10 active:scale-95 uppercase tracking-wider"
        >
          <Plus size={16}/> Registrar Voluntario
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        
        {/* FILTROS Y CONTROLES AVANZADOS */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-3 bg-slate-50/50">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 text-slate-400" size={16} />
            <input 
              type="text" 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombres, apellidos o documento de identidad (C.I.)..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 text-xs text-slate-700 transition-all font-medium"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Filtro por Grupo Sanguíneo */}
            <select 
              value={filtroGrupo}
              onChange={(e) => setFiltroGrupo(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl outline-none bg-white text-xs text-slate-700 font-bold focus:border-red-500 transition-all cursor-pointer"
            >
              <option value="Todos los grupos">Todos los factores</option>
              <option value="O+">Factor O RH+</option>
              <option value="O-">Factor O RH-</option>
              <option value="A+">Factor A RH+</option>
              <option value="A-">Factor A RH-</option>
              <option value="B+">Factor B RH+</option>
              <option value="B-">Factor B RH-</option>
              <option value="AB+">Factor AB RH+</option>
              <option value="AB-">Factor AB RH-</option>
            </select>

            {/* Filtro por Estado Clínico */}
            <select 
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl outline-none bg-white text-xs text-slate-700 font-bold focus:border-red-500 transition-all cursor-pointer"
            >
              <option value="Todos los estados">Todos los estados</option>
              <option value="APTO">Estado: APTO</option>
              <option value="EN EVALUACIÓN">Estado: EN EVALUACIÓN</option>
              <option value="RECHAZADO">Estado: RECHAZADO</option>
            </select>

            {/* Botón Manual de Recarga */}
            <button 
              onClick={fetchDonantesALaFuerza}
              className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 transition active:scale-95"
              title="Sincronizar con Base de Datos"
            >
              <RefreshCw size={16} className={cargando ? 'animate-spin text-red-500' : ''} />
            </button>
          </div>
        </div>

        {/* TABLA PRINCIPAL DE AUDITORÍA */}
        <div className="overflow-x-auto">
          {cargando ? (
            <div className="flex items-center justify-center gap-2 p-16 text-slate-500 font-bold text-xs uppercase tracking-wider">
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              Sincronizando registros clínicos...
            </div>
          ) : donantesFiltrados.length === 0 ? (
            <div className="text-center p-16 text-slate-400 font-medium text-xs leading-relaxed">
              No se localizaron registros coincidentes en el padrón de Cochabamba.<br/>
              <span className="text-[10px] text-slate-400 font-normal">Asegúrate de que el donante tenga asignado correctamente su tipo de sangre y CI en la base de datos.</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6">Nombre del Voluntario</th>
                  <th className="p-4">C.I. / Documento</th>
                  <th className="p-4">Grupo Sanguíneo</th>
                  <th className="p-4">Teléfono de Contacto</th>
                  <th className="p-4">Estado Clínico</th>
                  <th className="p-4 text-center">Gestión Técnica</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100 font-medium text-slate-700">
                {donantesFiltrados.map((d, index) => {
                  const idUnico = d.id_donante || d.id || index;
                  const estadoActual = (d.estado_clinico || d.estado_medico || 'EN EVALUACIÓN').toUpperCase();

                  return (
                    <tr key={idUnico} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 pl-6 font-bold text-slate-800">
                        {d.nombres || d.nombre} {d.apellidos || d.apellido}
                      </td>
                      <td className="p-4 text-slate-600 font-mono font-bold">{d.ci || 'No Registrado'}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 bg-red-50 text-red-700 rounded-lg font-black text-[10px] border border-red-100 tracking-wider">
                          {d.tipo_sangre || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{d.telefono || 'Sin número'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider border ${
                          estadoActual === 'APTO' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                          estadoActual === 'RECHAZADO' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                          'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {estadoActual}
                        </span>
                      </td>
                      <td className="p-4 flex justify-center gap-1.5">
                        <button 
                          onClick={() => {
                            setDonanteSeleccionado(d);
                            setNuevoEstadoClinico(estadoActual);
                          }}
                          className="flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition active:scale-95"
                        >
                          <Edit3 size={12} /> Estado
                        </button>
                        <button 
                          onClick={() => alert(`Visualizando historial clínico extendido del donante ID: ${idUnico}`)}
                          className="flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition active:scale-95"
                        >
                          <FileText size={12} /> Ficha
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 🌟 MODAL FLOTANTE: ACTUALIZACIÓN RÁPIDA DE ESTADO CLÍNICO */}
      {donanteSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="text-amber-500" size={18} />
                <h4 className="font-black text-sm text-slate-800 uppercase tracking-tight">Actualizar Estado de Donación</h4>
              </div>
              <button 
                onClick={() => setDonanteSeleccionado(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
              <p className="text-slate-400 font-bold uppercase text-[9px]">Donante Seleccionado</p>
              <p className="font-bold text-slate-700 mt-0.5">{donanteSeleccionado.nombres || donanteSeleccionado.nombre} {donanteSeleccionado.apellidos || donanteSeleccionado.apellido}</p>
              <p className="text-slate-500 text-[11px] mt-0.5">Factor: <span className="font-bold text-red-600">{donanteSeleccionado.tipo_sangre}</span> | C.I.: {donanteSeleccionado.ci}</p>
            </div>

            {mensajeFeedback.texto && (
              <div className={`p-3 rounded-lg text-xs font-bold border text-center ${
                mensajeFeedback.tipo === 'exito' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100'
              }`}>
                {mensajeFeedback.texto}
              </div>
            )}

            <form onSubmit={handleGuardarEstadoClinico} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Nuevo Diagnóstico / Condición</label>
                <div className="grid grid-cols-1 gap-2">
                  {['APTO', 'EN EVALUACIÓN', 'RECHAZADO'].map((estado) => (
                    <label 
                      key={estado}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer text-xs font-bold transition ${
                        nuevoEstadoClinico === estado 
                          ? 'border-blue-500 bg-blue-50/50 text-blue-700' 
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          estado === 'APTO' ? 'bg-emerald-500' : estado === 'RECHAZADO' ? 'bg-rose-500' : 'bg-amber-500'
                        }`} />
                        {estado}
                      </span>
                      <input 
                        type="radio" 
                        name="estado_clinico" 
                        value={estado} 
                        checked={nuevoEstadoClinico === estado} 
                        onChange={(e) => setNuevoEstadoClinico(e.target.value)}
                        className="hidden"
                      />
                      {nuevoEstadoClinico === estado && <Check size={14} className="text-blue-600" />}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setDonanteSeleccionado(null)}
                  className="w-1/2 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={guardandoEstado}
                  className="w-1/2 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition disabled:bg-slate-300"
                >
                  {guardandoEstado ? 'Guardando...' : 'Confirmar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Donantes;