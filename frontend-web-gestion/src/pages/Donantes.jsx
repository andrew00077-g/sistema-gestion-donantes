import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, RefreshCw, Edit3, ShieldAlert, Check, X, FileText, Printer } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';

const Donantes = () => {
  const navigate = useNavigate();
  const [donantes, setDonantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [busqueda, setBusqueda] = useState('');
  const [filtroGrupo, setFiltroGrupo] = useState('Todos los grupos');
  const [filtroEstado, setFiltroEstado] = useState('Todos los estados');

  const [donanteSeleccionado, setDonanteSeleccionado] = useState(null);
  const [nuevoEstadoClinico, setNuevoEstadoClinico] = useState('');
  const [guardandoEstado, setGuardandoEstado] = useState(false);
  const [mensajeFeedback, setMensajeFeedback] = useState({ texto: '', tipo: '' });

  const [fichaSeleccionada, setFichaSeleccionada] = useState(null);
  const [editandoFicha, setEditandoFicha] = useState(false);
  const [datosEditados, setDatosEditados] = useState({});
  const [guardandoFicha, setGuardandoFicha] = useState(false);
  
  const token = localStorage.getItem('token');

  // DICCIONARIOS DE CONVERSIÓN FRONT <-> BACKEND (Para no romper tu ENUM de BD)
  const traductores = {
    haciaBackend: (estadoVisual) => {
      if (estadoVisual === 'DIFERIDO') return 'EN_ESPERA';
      if (estadoVisual === 'EXCLUIDO') return 'NO_APTO';
      return 'APTO';
    },
    haciaVisual: (estadoDB) => {
      if (estadoDB === 'EN_ESPERA') return 'DIFERIDO';
      if (estadoDB === 'NO_APTO') return 'EXCLUIDO';
      return 'APTO';
    }
  };

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
      }
    } catch (error) {
      console.error("Error al procesar la petición de donantes:", error);
    } finally {
      setCargando(false);
    }
  }, [token]);

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
    return () => { activo = false; };
  }, [token]);

  const ejecutarActualizacionDonante = async (id, cuerpoDatos) => {
    return await fetch(`http://localhost:3000/api/donantes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(cuerpoDatos)
    });
  };

  const handleGuardarEstadoClinico = async (e) => {
    e.preventDefault();
    if (!donanteSeleccionado) return;

    setGuardandoEstado(true);
    setMensajeFeedback({ texto: '', tipo: '' });
    const idActual = donanteSeleccionado.id_donante || donanteSeleccionado.id;

    // Traducimos el estado visual a la nomenclatura exacta que exige tu backend
    const estadoFormateadoDB = traductores.haciaBackend(nuevoEstadoClinico);

    try {
      const res = await ejecutarActualizacionDonante(idActual, {
        estado_clinico: estadoFormateadoDB,
        estado_medico: estadoFormateadoDB
      });

      if (res.ok) {
        setMensajeFeedback({ texto: '¡Estado clínico actualizado correctamente!', tipo: 'exito' });
        setTimeout(() => {
          setDonanteSeleccionado(null);
          setMensajeFeedback({ texto: '', tipo: '' });
          fetchDonantesALaFuerza();
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

  const handleGuardarCambiosFicha = async () => {
    setGuardandoFicha(true);
    const idActual = fichaSeleccionada.id_donante || fichaSeleccionada.id;

    
    const datosListos = {
      ...datosEditados,
      estado_medico: traductores.haciaBackend(datosEditados.estado_medico || datosEditados.estado_clinico),
      estado_clinico: traductores.haciaBackend(datosEditados.estado_medico || datosEditados.estado_clinico)
    };

    try {
      const res = await ejecutarActualizacionDonante(idActual, datosListos);

      if (res.ok) {
        setFichaSeleccionada(datosEditados); 
        setEditandoFicha(false);
        fetchDonantesALaFuerza(); 
        alert("¡Expediente actualizado con éxito!");
      } else {
        alert("Error al guardar las modificaciones en el servidor.");
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo establecer conexión con el backend.");
    } finally {
      setGuardandoFicha(false);
    }
  };

  const handleInputFichaChange = (e) => {
    const { name, value } = e.target;
    setDatosEditados(prev => ({ ...prev, [name]: value }));
  };

  const donantesFiltrados = donantes.filter(d => {
    const nombreCompleto = `${d.nombres || d.nombre || ''} ${d.apellidos || d.apellido || ''}`.toLowerCase();
    const ciReal = d.ci ? String(d.ci).toLowerCase() : '';
    const termino = busqueda.toLowerCase();

    const coincideBusqueda = nombreCompleto.includes(termino) || ciReal.includes(termino);
    
    const dTipoSangre = d.tipo_sangre ? String(d.tipo_sangre).toUpperCase() : '';
    const tipoSangreLimpio = dTipoSangre.replace(/[^A-B-O-R-H\\+\\-]/g, '');
    const coincideGrupo = filtroGrupo === 'Todos los grupos' || dTipoSangre === filtroGrupo || tipoSangreLimpio === filtroGrupo;
    
    // Homologamos la lectura para los filtros de arriba
    const estadoDBRaw = (d.estado_clinico || d.estado_medico || 'EN_ESPERA').toUpperCase();
    const estadoVisual = traductores.haciaVisual(estadoDBRaw);
    const coincideEstado = filtroEstado === 'Todos los estados' || estadoVisual === filtroEstado;

    return coincideBusqueda && coincideGrupo && coincideEstado;
  });

  const handleExportarPDF = () => {
    window.print();
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen font-sans pb-16 print:p-0 print:bg-white">
      
      {/*  CSS AISLADO PARA  PDF */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #area-ficha-medica, #area-ficha-medica * {
            visibility: visible;
          }
          #area-ficha-medica {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          html, body {
            height: auto;
            background: #fff !important;
          }
        }
      `}</style>

      {/* ENCABEZADO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4 print:hidden">
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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden print:hidden">
        
        {/* CONTROLES Y FILTROS */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-3 bg-slate-50/50">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 text-slate-400" size={16} />
            <input 
              type="text" 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombres, apellidos o documento de identidad (C.I.)...." 
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 text-xs text-slate-700 font-medium"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select 
              value={filtroGrupo}
              onChange={(e) => setFiltroGrupo(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl outline-none bg-white text-xs text-slate-700 font-bold focus:border-red-500 cursor-pointer"
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

            <select 
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl outline-none bg-white text-xs text-slate-700 font-bold focus:border-red-500 cursor-pointer"
            >
              <option value="Todos los estados">Todos los estados</option>
              <option value="APTO">Estado: APTO</option>
              <option value="DIFERIDO">Estado: DIFERIDO</option>
              <option value="EXCLUIDO">Estado: EXCLUIDO</option>
            </select>

            <button 
              onClick={fetchDonantesALaFuerza}
              className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 transition"
            >
              <RefreshCw size={16} className={cargando ? 'animate-spin text-red-500' : ''} />
            </button>
          </div>
        </div>

        {/* TABLA DE RESULTADOS */}
        <div className="overflow-x-auto">
          {cargando ? (
            <div className="flex items-center justify-center gap-2 p-16 text-slate-500 font-bold text-xs uppercase tracking-wider">
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              Sincronizando registros clínicos...
            </div>
          ) : donantesFiltrados.length === 0 ? (
            <div className="text-center p-16 text-slate-400 font-medium text-xs">
              No se localizaron registros coincidentes en el padrón de Cochabamba.
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
                  const estadoDB = (d.estado_clinico || d.estado_medico || 'EN_ESPERA').toUpperCase();
                  const estadoVisual = traductores.haciaVisual(estadoDB);

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
                          estadoVisual === 'APTO' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                          estadoVisual === 'EXCLUIDO' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                          'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {estadoVisual}
                        </span>
                      </td>
                      <td className="p-4 flex justify-center gap-1.5">
                        <button 
                          onClick={() => {
                            setDonanteSeleccionado(d);
                            setNuevoEstadoClinico(estadoVisual);
                          }}
                          className="flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition"
                        >
                          <Edit3 size={12} /> Estado
                        </button>
                        
                        <button 
                          onClick={() => { 
                            setFichaSeleccionada(d); 
                            setDatosEditados({
                              ...d,
                              estado_medico: traductores.haciaVisual(d.estado_medico || d.estado_clinico)
                            }); 
                            setEditandoFicha(false); 
                          }}
                          className="flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition"
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

      {/* MODAL: CAMBIO DE ESTADO (Mapea correctamente de cara al backend) */}
      {donanteSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="text-amber-500" size={18} />
                <h4 className="font-black text-sm text-slate-800 uppercase tracking-tight">Actualizar Estado de Donación</h4>
              </div>
              <button onClick={() => setDonanteSeleccionado(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X size={16} />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
              <p className="text-slate-400 font-bold uppercase text-[9px]">Donante Seleccionado</p>
              <p className="font-bold text-slate-700 mt-0.5">{donanteSeleccionado.nombres || donanteSeleccionado.nombre} {donanteSeleccionado.apellidos || donanteSeleccionado.apellido}</p>
            </div>

            {mensajeFeedback.texto && (
              <div className={`p-3 rounded-lg text-xs font-bold border text-center ${
                mensajeFeedback.tipo === 'exito' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100'
              }`}>
                {mensajeFeedback.texto}
              </div>
            )}

            <form onSubmit={handleGuardarEstadoClinico} className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                {['APTO', 'DIFERIDO', 'EXCLUIDO'].map((estado) => (
                  <label 
                    key={estado}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer text-xs font-bold transition ${
                      nuevoEstadoClinico === estado ? 'border-blue-500 bg-blue-50/50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${estado === 'APTO' ? 'bg-emerald-500' : estado === 'EXCLUIDO' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                      {estado}
                    </span>
                    <input type="radio" name="estado_clinico" value={estado} checked={nuevoEstadoClinico === estado} onChange={(e) => setNuevoEstadoClinico(e.target.value)} className="hidden" />
                    {nuevoEstadoClinico === estado && <Check size={14} className="text-blue-600" />}
                  </label>
                ))}
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setDonanteSeleccionado(null)} className="w-1/2 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition">Cancelar</button>
                <button type="submit" disabled={guardandoEstado} className="w-1/2 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition">{guardandoEstado ? 'Guardando...' : 'Confirmar Cambios'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EXPEDIENTE CLÍNICO INTEGRADO */}
      {fichaSeleccionada && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 print:absolute print:inset-0 print:bg-white print:p-0 print:block">
          <div id="area-ficha-medica" className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto print:border-none print:shadow-none print:max-h-none print:overflow-visible">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:border-slate-300">
              <div>
                <h4 className="font-black text-sm text-slate-900 uppercase tracking-tight">
                  {editandoFicha ? '📝 Editando Expediente Clínico' : 'Ficha Clínica e Historial del Donante'}
                </h4>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Sistema de Hemodonación • Nodo Departamental Cochabamba</p>
              </div>
              <button onClick={() => setFichaSeleccionada(null)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition print:hidden">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2.5 bg-slate-50/70 p-4 rounded-xl border border-slate-100 print:bg-white print:border-slate-200">
                <p className="text-red-600 font-black uppercase text-[10px] tracking-wider border-b border-red-100 pb-1 print:text-slate-900 print:border-slate-300">Datos Civiles del Voluntario</p>
                <div>
                  <label className="text-slate-400 font-bold block mb-0.5">Nombres:</label>
                  {editandoFicha ? (
                    <input type="text" name="nombres" value={datosEditados.nombres || datosEditados.nombre || ''} onChange={handleInputFichaChange} className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-800" />
                  ) : (
                    <p className="font-bold text-slate-800">{fichaSeleccionada.nombres || fichaSeleccionada.nombre}</p>
                  )}
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-0.5">Apellidos:</label>
                  {editandoFicha ? (
                    <input type="text" name="apellidos" value={datosEditados.apellidos || datosEditados.apellido || ''} onChange={handleInputFichaChange} className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-800" />
                  ) : (
                    <p className="font-bold text-slate-800">{fichaSeleccionada.apellidos || fichaSeleccionada.apellido}</p>
                  )}
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-0.5">Carnet de Identidad (C.I.):</label>
                  {editandoFicha ? (
                    <input type="text" name="ci" value={datosEditados.ci || ''} onChange={handleInputFichaChange} className="w-full p-2 border border-slate-200 rounded-xl bg-white font-mono text-xs font-bold" />
                  ) : (
                    <p className="font-mono font-bold text-slate-700">{fichaSeleccionada.ci || 'No Registrado'}</p>
                  )}
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-0.5">Teléfono Celular:</label>
                  {editandoFicha ? (
                    <input type="text" name="telefono" value={datosEditados.telefono || ''} onChange={handleInputFichaChange} className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs font-bold" />
                  ) : (
                    <p className="text-slate-600 font-medium">{fichaSeleccionada.telefono || 'No registra'}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2.5 bg-slate-50/70 p-4 rounded-xl border border-slate-100 print:bg-white print:border-slate-200">
                <p className="text-red-600 font-black uppercase text-[10px] tracking-wider border-b border-red-100 pb-1 print:text-slate-900 print:border-slate-300">Parámetros Clínicos</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-bold">Grupo Sanguíneo:</span> 
                  <span className="px-2.5 py-0.5 bg-red-600 text-white font-black rounded-lg text-[10px] tracking-widest print:bg-slate-800">
                    {fichaSeleccionada.tipo_sangre || 'N/A'}
                  </span>
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-0.5">Peso Corporal (Kg):</label>
                  {editandoFicha ? (
                    <input type="number" name="peso_kg" value={datosEditados.peso_kg || ''} onChange={handleInputFichaChange} className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs font-bold" />
                  ) : (
                    <p className="text-slate-700 font-medium">{fichaSeleccionada.peso_kg ? `${fichaSeleccionada.peso_kg} Kg` : 'Sin registrar'}</p>
                  )}
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-0.5">Calificación de Estado:</label>
                  {editandoFicha ? (
                    <select name="estado_medico" value={datosEditados.estado_medico || 'DIFERIDO'} onChange={handleInputFichaChange} className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs font-bold text-blue-700">
                      <option value="APTO">APTO</option>
                      <option value="DIFERIDO">DIFERIDO</option>
                      <option value="EXCLUIDO">EXCLUIDO</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider border ${
                      traductores.haciaVisual(fichaSeleccionada.estado_clinico || fichaSeleccionada.estado_medico) === 'APTO' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 print:bg-white print:text-black' 
                        : traductores.haciaVisual(fichaSeleccionada.estado_clinico || fichaSeleccionada.estado_medico) === 'EXCLUIDO'
                        ? 'bg-rose-50 text-rose-700 border-rose-100 print:bg-white print:text-black'
                        : 'bg-amber-50 text-amber-700 border-amber-100 print:bg-white print:text-black'
                    }`}>
                      {traductores.haciaVisual(fichaSeleccionada.estado_clinico || fichaSeleccionada.estado_medico)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-100 print:hidden">
              {editandoFicha ? (
                <>
                  <button type="button" onClick={() => setEditandoFicha(false)} className="w-1/2 py-2.5 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition">Cancelar</button>
                  <button type="button" onClick={handleGuardarCambiosFicha} disabled={guardandoFicha} className="w-1/2 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg transition">{guardandoFicha ? 'Guardando...' : 'Guardar Cambios'}</button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => { setEditandoFicha(true); }} className="w-1/4 py-2.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition">Editar Datos</button>
                  <button type="button" onClick={handleExportarPDF} className="w-3/4 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg flex items-center justify-center gap-2 transition"><Printer size={14} /> Descargar Ficha Médica (PDF)</button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Donantes;