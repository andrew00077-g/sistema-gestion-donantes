import { useState, useEffect } from 'react';
import { BellRing, SendHorizontal, ShieldAlert, Clock, Activity, Search, AlertTriangle } from 'lucide-react';
// Importaciones del mapa interactivo
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

//  CONFIGURACIÓN DE ICONOS PERSONALIZADOS PARA EL MAPA
// Marcador para el Banco de Sangre (Estilo Pin de Emergencia)
const iconoBancoSangre = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/11116/11116246.png', // Icono de hospital/banco de sangre
  iconSize: [42, 42],
  iconAnchor: [21, 42],
  popupAnchor: [0, -40]
});

// Marcador para los Donantes (Gotitas de Sangre)
const iconoDonante = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/9123/9123133.png', // Icono de gota de sangre
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});

// Coordenadas aproximadas de la Calle Aurelio Meleán Nº 487 (Banco de Sangre Cochabamba)
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
  const [donantesConCoordenadas, setDonantesConCoordenadas] = useState([]);

  const token = localStorage.getItem('token');

  // Inicializar alertas desde el backend
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
        console.error("Error cargando alertas:", err);
      }
    };
    inicializarAlertas();
  }, [token]);

  // Buscar donantes disponibles y generar posiciones aleatorias en Cochabamba para simular GPS
  useEffect(() => {
    const buscarDonantesDisponibles = async () => {
      if (!tipoSangre || tipoSangre === '') {
        setDonantesCandidatos([]);
        setDonantesConCoordenadas([]);
        return;
      }

      setBuscandoDonantes(true);
      try {
        const res = await fetch(`http://localhost:3000/api/donantes/buscar-disponibles?tipoSangre=${encodeURIComponent(tipoSangre)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const datos = await res.json();
          const listaDonantes = Array.isArray(datos) ? datos : datos.donantes || [];
          setDonantesCandidatos(listaDonantes);

          // Generar coordenadas dispersas simuladas en Cochabamba alrededor del banco (Rango ~4km)
          const conCoordenadas = listaDonantes.map((d) => {
            const randomLat = COORDENADAS_BANCO[0] + (Math.random() - 0.5) * 0.04;
            const randomLng = COORDENADAS_BANCO[1] + (Math.random() - 0.5) * 0.04;
            return { ...d, lat: randomLat, lng: randomLng };
          });
          setDonantesConCoordenadas(conCoordenadas);
        }
      } catch (err) {
        console.error("Error al buscar donantes disponibles:", err);
      } finally {
        setBuscandoDonantes(false);
      }
    };

    buscarDonantesDisponibles();
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
          texto: `🚨 Alerta en masa despachada. Se estableció un perímetro de Geocerca (3km) en el Banco de Sangre y se notificó a ${donantesCandidatos.length} usuarios aptos.`, 
          tipo: 'exito' 
        });
        setTitulo('');
        setMensajeInput('');
        setTipoSangre('');
        setDonantesCandidatos([]);
        setDonantesConCoordenadas([]);
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
          <p className="text-xs text-slate-500 font-medium">Búsqueda inteligente, geocercas activas por radio y notificación push en masa</p>
        </div>
      </div>

      {/* DISPOSICIÓN EN TRES COLUMNAS ADAPTABLES */}
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
                placeholder="Ej. Convocatoria Banco de Sangre Referencia"
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
                placeholder="Detalle los requisitos e indicaciones en la Calle Aurelio Meleán..."
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
              <span>{cargando ? 'Despachando...' : 'Despachar Alerta en Masa'}</span>
              <SendHorizontal size={14} />
            </button>
          </form>
        </div>

        {/*  COLUMNA 2 INTERACTIVA: MAPA COCHABAMBA CON GEOFENCING SIMULADO */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[520px]">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2 shrink-0">
            <Search size={16} className="text-red-500 animate-pulse" />
            Mapa de Cobertura y Geocerca
          </h3>

          {!tipoSangre && (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-dashed border-slate-200 mb-3">📍</div>
              <p className="text-xs font-bold">Mapa Desactivado</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[220px]">Selecciona un grupo sanguíneo para inicializar el radar y proyectar la geocerca activa.</p>
            </div>
          )}

          {tipoSangre && buscandoDonantes && (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-xs font-bold">Rastreando base de datos cartográfica...</p>
            </div>
          )}

          {tipoSangre && !buscandoDonantes && (
            <div className="flex flex-col flex-grow min-h-0 pt-3 relative">
              <div className="p-2.5 rounded-xl border mb-2 bg-red-50 text-red-900 border-red-100 text-[10px] font-bold uppercase flex items-center gap-1.5 z-10">
                <AlertTriangle size={12} className="text-red-600" />
                <span>Geocerca activa: 3km a la redonda del Banco de Sangre</span>
              </div>

              {/* CONTENEDOR DEL MAPA LEAFLET */}
              <div className="flex-grow rounded-xl overflow-hidden border border-slate-200 relative" style={{ height: '100%', minHeight: '300px' }}>
                <MapContainer center={COORDENADAS_BANCO} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                  />
                  
                  {/* 1. Marcador del Punto Central: Banco de Sangre */}
                  <Marker position={COORDENADAS_BANCO} icon={iconoBancoSangre}>
                    <Popup>
                      <div className="text-xs font-sans">
                        <p className="font-bold text-red-600">Banco de Sangre de Referencia</p>
                        <p className="text-[10px] text-slate-600">Calle Aurelio Meleán Nº 487</p>
                        <p className="text-[9px] font-bold text-slate-500 mt-1">📍 Punto de Origen del Incidente</p>
                      </div>
                    </Popup>
                  </Marker>

                  {/* 2. Dibujo de la Geocerca (Círculo de Radio de 3 Kilómetros = 3000 metros) */}
                  <Circle 
                    center={COORDENADAS_BANCO}
                    radius={3000}
                    pathOptions={{ color: '#dc2626', fillColor: '#ef4444', fillOpacity: 0.12, weight: 2, dashArray: '5, 5' }}
                  />

                  {/* 3. Renderizar las gotitas de sangre de los donantes localizados */}
                  {donantesConCoordenadas.map((donante, idx) => (
                    <Marker key={donante.id_donante || idx} position={[donante.lat, donante.lng]} icon={iconoDonante}>
                      <Popup>
                        <div className="text-xs font-sans">
                          <p className="font-bold text-slate-800">{donante.nombres} {donante.apellidos}</p>
                          <p className="text-[10px] text-emerald-600 font-bold">Grupo Sanguíneo: {tipoSangre}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">Última conexión pasiva de red registrada</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              {/* Mini leyenda informativa flotante */}
              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg border border-slate-200 text-[9px] font-bold text-slate-600 space-y-1 z-[1000]">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600 inline-block"></span> Banco de Sangre</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block"></span> Donantes ({donantesCandidatos.length})</div>
              </div>
            </div>
          )}
        </div>

        {/* COLUMNA 3: HISTORIAL CRÍTICO */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[520px]">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2 shrink-0">
            <Activity size={16} className="text-slate-600" />
            Historial de Alertas Emitidas
          </h3>

          {alertas.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <p className="text-xs font-bold">Historial Limpio</p>
              <p className="text-[11px] text-slate-400 mt-1">No se han registrado despachos de emergencia.</p>
            </div>
          ) : (
            <div className="flex-grow overflow-y-auto space-y-3 pt-3 pr-1 custom-scrollbar min-h-0">
              {alertas.map((alerta) => (
                <div key={alerta.id_alerta} className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col gap-2 hover:shadow-md transition duration-200">
                  <div className={`absolute top-0 left-0 h-full w-1 ${
                    alerta.nivel_urgencia === 'CRITICA' ? 'bg-red-600' : alerta.nivel_urgencia === 'ALTA' ? 'bg-amber-500' : 'bg-blue-500'
                  }`}></div>

                  <div className="space-y-1 pl-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black text-white ${
                        alerta.nivel_urgencia === 'CRITICA' ? 'bg-red-600' : alerta.nivel_urgencia === 'ALTA' ? 'bg-amber-500' : 'bg-blue-500'
                      }`}>
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
                      <span>{new Date(alerta.fecha_emision).toLocaleString()}</span>
                    </div>
                    <span className="text-slate-400 font-medium text-[8px] uppercase">Emitido por: {alerta.admin_nombre || 'Médico de Guardia'}</span>
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