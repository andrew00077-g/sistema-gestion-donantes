import { useState, useEffect } from 'react';
import { BellRing, SendHorizontal, ShieldAlert, Clock, Activity, Search, AlertTriangle } from 'lucide-react';
// Importaciones del mapa interactivo
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Marcador para el Banco de Sangre 
const iconoBancoSangre = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/128/1297/1297136.png', 
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});

// Marcador para los Donantes (Gotitas de Sangre reales)
const iconoDonante = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/128/7918/7918340.png', 
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});

// Ubicación de la Calle Aurelio Meleán Nº 487 (Banco de Sangre Cochabamba)
const COORDENADAS_BANCO = [-17.3892, -66.1478]; 

const Alertas = () => {
  const [alertas, setAlertas] = useState([]);
  const [tipoSangre, setTipoSangre] = useState('');
  const [titulo, setTitulo] = useState('');
  const [mensajeInput, setMensajeInput] = useState('');
  const [urgencia, setUrgencia] = useState('ALTA');
  const [notificacion, setNotificacion] = useState({ texto: '', tipo: '' });
  const [cargando, setCargando] = useState(false);

  const [donantesCandidatos, setDonantesCandidatos] = useState([]);
  const [buscandoDonantes, setBuscandoDonantes] = useState(false);

  const token = localStorage.getItem('token');

  // Inicializar historial de alertas desde el backend
  useEffect(() => {
    const inicializarAlertas = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/operaciones/alertas', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const datos = await res.json();
          setAlertas(datos);
        }
      } catch (err) {
        console.error("Error cargando historial de alertas:", err);
      }
    };
    inicializarAlertas();
  }, [token]);

  // RASTREO GEOGRÁFICO Y MÉDICO REAL DESDE EL BACKEND
  useEffect(() => {
    const buscarDonantesDisponiblesReal = async () => {
      if (!tipoSangre || tipoSangre === '') {
        setDonantesCandidatos([]);
        return;
      }

      setBuscandoDonantes(true);
      try {
        // Hacemos el fetch al endpoint real que calcula la geocerca de 3km
        const res = await fetch(`http://localhost:3000/api/donantes/buscar-disponibles?tipoSangre=${encodeURIComponent(tipoSangre)}&radioKm=3`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const datos = await res.json();
          const listaDonantes = Array.isArray(datos) ? datos : datos.donantes || [];
          
          // Guardamos los datos puros del backend (que ya traen sus coordenadas reales de Cochabamba)
          setDonantesCandidatos(listaDonantes);
        }
      } catch (err) {
        console.error("Error al buscar donantes en la geocerca:", err);
      } finally {
        setBuscandoDonantes(false);
      }
    };

    buscarDonantesDisponiblesReal();
  }, [tipoSangre, token]);

  const refrescarHistorialAlertas = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/operaciones/alertas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const datos = await res.json();
        setAlertas(datos);
      }
    } catch (err) {
      console.error("Error refrescando alertas:", err);
    }
  };

  const handleEmitirAlerta = async (e) => {
    e.preventDefault();
    if (!tipoSangre || tipoSangre === '') {
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
          nivel_urgencia: urgencia,
          donantes_notificados_ids: donantesCandidatos.map(d => d.id_donante || d.id) 
        })
      });

      const data = await res.json();

      if (res.ok) {
        setNotificacion({ 
          texto: ` Alerta Real Despachada. Geocerca activa establecida (3km). Se registraron notificaciones de emergencia para ${donantesCandidatos.length} donantes calificados en el radio de cobertura.`, 
          tipo: 'exito' 
        });
        setTitulo('');
        setMensajeInput('');
        setTipoSangre('');
        setDonantesCandidatos([]);
        await refrescarHistorialAlertas();
      } else {
        setNotificacion({ texto: data.msg || 'Error al emitir alerta', tipo: 'error' });
      }
    } catch {
      setNotificacion({ texto: 'No se pudo conectar con el servidor.', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans pb-16">
      
      {/* HEADER PRINCIPAL */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
          <BellRing size={24} />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Centro de Alertas de Emergencia</h1>
          <p className="text-xs text-slate-500 font-medium">Panel Administrativo del Banco de Sangre de Referencia Departamental Cochabamba</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUMNA 1: FORMULARIO */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm h-fit space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <ShieldAlert size={16} className="text-red-500" />
            Parámetros del Incidente
          </h3>

          {notificacion.texto && (
            <div className={`p-4 rounded-xl text-xs font-bold border transition-all ${
              notificacion.tipo === 'exito' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {notificacion.texto}
            </div>
          )}

          <form onSubmit={handleEmitirAlerta} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Grupo de Sangre Solicitado</label>
              <select 
                value={tipoSangre} 
                onChange={(e) => setTipoSangre(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 bg-slate-50/40 text-xs font-bold text-slate-700 cursor-pointer"
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

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nivel de Urgencia</label>
              <select 
                value={urgencia} 
                onChange={(e) => setUrgencia(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 bg-slate-50/40 text-xs font-black text-slate-700 cursor-pointer"
              >
                <option value="MEDIA"> MEDIA (Reposición de Stock)</option>
                <option value="ALTA"> ALTA (Cirugía Programada)</option>
                <option value="CRITICA"> CRÍTICA (Código Rojo / Trauma)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Título del Incidente</label>
              <input 
                type="text" 
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. Convocatoria Urgente de Donantes"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 text-xs font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mensaje de Convocatoria</label>
              <textarea 
                rows="3"
                value={mensajeInput}
                onChange={(e) => setMensajeInput(e.target.value)}
                placeholder="Detalle los requisitos médicos de asistencia..."
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 text-xs font-medium resize-none leading-relaxed"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={cargando || donantesCandidatos.length === 0}
              className={`w-full flex items-center justify-center gap-2 py-3 text-white font-bold rounded-xl shadow-lg transition transform active:scale-95 text-xs tracking-wider uppercase ${
                donantesCandidatos.length === 0 
                  ? 'bg-slate-300 shadow-none cursor-not-allowed text-slate-500' 
                  : 'bg-red-600 shadow-red-600/10 hover:bg-red-700'
              }`}
            >
              <span>{cargando ? 'Despachando...' : 'Despachar Alerta Real'}</span>
              <SendHorizontal size={14} />
            </button>
          </form>
        </div>

        {/* COLUMNA 2 INTERACTIVA: GEOCERCA DE 3KM REAL CON LEAFLET */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[520px]">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2 shrink-0">
            <Search size={16} className="text-red-500 animate-pulse" />
            Geocerca Logística Activa
          </h3>

          {!tipoSangre && (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-dashed border-slate-200 mb-3">📍</div>
              <p className="text-xs font-bold">Mapa Satelital Desactivado</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[220px]">Selecciona un grupo sanguíneo para calcular el perímetro real en Cochabamba.</p>
            </div>
          )}

          {tipoSangre && buscandoDonantes && (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-xs font-bold">Calculando distancias con Haversine SQL...</p>
            </div>
          )}

          {tipoSangre && !buscandoDonantes && (
            <div className="flex flex-col flex-grow min-h-0 pt-3 relative">
              <div className="p-2.5 rounded-xl border mb-2 bg-red-50 text-red-900 border-red-100 text-[10px] font-bold uppercase flex items-center gap-1.5 z-10">
                <AlertTriangle size={12} className="text-red-600" />
                <span>Radio Operativo: 3.00 km del centro de Cochabamba</span>
              </div>

              <div className="flex-grow rounded-xl overflow-hidden border border-slate-200 relative" style={{ height: '100%', minHeight: '300px' }}>
                <MapContainer center={COORDENADAS_BANCO} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                  />
                  
                  {/* Punto Fijo Administrativo: Banco de Sangre */}
                  <Marker position={COORDENADAS_BANCO} icon={iconoBancoSangre}>
                    <Popup>
                      <div className="text-xs font-sans">
                        <p className="font-bold text-red-600">Banco de Sangre Departamental</p>
                        <p className="text-[10px] text-slate-600">Calle Aurelio Meleán Nº 487</p>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Geocerca Real en el mapa (Círculo de 3000 metros) */}
                  <Circle 
                    center={COORDENADAS_BANCO}
                    radius={3000}
                    pathOptions={{ color: '#dc2626', fillColor: '#ef4444', fillOpacity: 0.12, weight: 2, dashArray: '5, 5' }}
                  />

                  {/* Renderizado de Donantes en sus Ubicaciones REALES de la Base de Datos */}
                  {donantesCandidatos.map((donante, idx) => (
                    <Marker 
                      key={donante.id_donante || idx} 
                      position={[parseFloat(donante.latitud), parseFloat(donante.longitud)]} 
                      icon={iconoDonante}
                    >
                      <Popup>
                        <div className="text-xs font-sans">
                          <p className="font-bold text-slate-800">{donante.nombre || `${donante.nombres} ${donante.apellidos}`}</p>
                          <p className="text-[10px] text-red-600 font-bold">Ubicación: A {parseFloat(donante.distancia_km).toFixed(2)} km</p>
                          <p className="text-[9px] text-slate-500">Estado Médico: APTO</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg border border-slate-200 text-[9px] font-bold text-slate-600 space-y-1 z-[1000]">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600 inline-block"></span> Banco de Sangre</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block"></span> Donantes Aptos en Radio ({donantesCandidatos.length})</div>
              </div>
            </div>
          )}
        </div>

        {/* COLUMNA 3: HISTORIAL CRÍTICO ADM */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[520px]">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2 shrink-0">
            <Activity size={16} className="text-slate-600" />
            Historial de Alertas Emitidas
          </h3>

          {alertas.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <p className="text-xs font-bold">Historial Vacío</p>
              <p className="text-[11px] text-slate-400 mt-1">No hay alertas despachadas recientemente.</p>
            </div>
          ) : (
            <div className="flex-grow overflow-y-auto space-y-3 pt-3 pr-1 min-h-0">
              {alertas.map((alerta) => (
                <div key={alerta.id_alerta || alerta.id} className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col gap-2">
                  <div className={`absolute top-0 left-0 h-full w-1 ${
                    alerta.nivel_urgencia === 'CRITICA' ? 'bg-red-600' : 'bg-amber-500'
                  }`}></div>

                  <div className="space-y-1 pl-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="bg-red-600 px-1.5 py-0.5 rounded text-[8px] font-black text-white">
                        {alerta.nivel_urgencia}
                      </span>
                      <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[8px] font-bold">
                        Factor: {alerta.tipo_sangre_requerido}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{alerta.titulo}</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">{alerta.mensaje}</p>
                  </div>

                  <div className="flex flex-col gap-0.5 text-[9px] text-slate-400 font-bold pl-1.5 border-t border-slate-50 pt-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Clock size={10} />
                      <span>{new Date(alerta.fecha_emision || alerta.created_at).toLocaleString()}</span>
                    </div>
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