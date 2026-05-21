import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Users, AlertTriangle, Droplets, BellRing, Sparkles, SendHorizontal, UserPlus, LogOut } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  // OPTIMIZACIÓN: Inicializamos el estado directamente leyendo el localStorage
  const [nombreAdmin] = useState(() => {
    return localStorage.getItem('nombreAdmin') || 'Administrador';
  });

  // CONTROL DE ACCESO (Solo valida y expulsa si no hay credenciales válidas)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');

    if (!token || rol !== 'ADMIN') {
      localStorage.clear(); // Limpiamos rastro corrupto
      navigate('/login');
    }
  }, [navigate]);

  // Función para cerrar sesión de forma segura
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Datos simulados del inventario actual en Cochabamba
  const stockSangre = [
    { grupo: 'O RH+', porcentaje: 85, color: 'bg-red-600' },
    { grupo: 'A RH+', porcentaje: 60, color: 'bg-red-500' },
    { grupo: 'B RH+', porcentaje: 40, color: 'bg-amber-500' },
    { grupo: 'O RH-', porcentaje: 15, color: 'bg-rose-600 animate-pulse' },
    { grupo: 'A RH-', porcentaje: 18, color: 'bg-rose-500 animate-pulse' },
  ];

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      
      {/* Encabezado Principal */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Bienvenido al Sistema</p>
          </div>
          <h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">
            Hola, <span className="text-red-600">Dr. {nombreAdmin}</span>
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">Gestión operativa del Banco de Sangre de Referencia Departamental</p>
        </div>
        
        {/* PANEL DE ACCIONES DEL HEADER */}
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => navigate('/registrar-donante')}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-red-600/10 transition active:scale-95"
          >
            <UserPlus size={18} />
            <span>REGISTRAR DONANTE</span>
          </button>

          {/* Botón de Cerrar Sesión */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition active:scale-95"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>
      
      {/* Tarjetas de Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tarjeta: Donantes */}
        <div 
          onClick={() => navigate('/donantes')}
          className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between cursor-pointer hover:border-slate-400 hover:shadow-md transition-all duration-200 group"
        >
          <div className="space-y-2">
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Donantes Activos</p>
            <h4 className="text-4xl font-black text-slate-800 tracking-tight group-hover:text-red-600 transition-colors">1,248</h4>
            <span className="inline-block text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              +4.2% esta semana
            </span>
          </div>
          <div className="p-4 bg-red-600 rounded-xl text-white shadow-md shadow-red-600/20">
            <Users size={24} />
          </div>
        </div>

        {/* Tarjeta: Alertas */}
        <div 
          onClick={() => navigate('/alertas')}
          className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between cursor-pointer hover:border-amber-400 hover:shadow-md transition-all duration-200 group"
        >
          <div className="space-y-2">
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Alertas Emitidas</p>
            <h4 className="text-4xl font-black text-slate-800 tracking-tight group-hover:text-amber-500 transition-colors">2</h4>
            <span className="inline-block text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
              Atención inmediata
            </span>
          </div>
          <div className="p-4 bg-amber-500 rounded-xl text-white shadow-md shadow-amber-500/20">
            <AlertTriangle size={24} />
          </div>
        </div>

        {/* Tarjeta: Estado Crítico */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Grupos en Alerta</p>
            <h4 className="text-4xl font-black text-rose-600 tracking-tight">O- / A-</h4>
            <span className="inline-block text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
              Stock crítico bajo 20%
            </span>
          </div>
          <div className="p-4 bg-rose-600 rounded-xl text-white shadow-md shadow-rose-600/20">
            <Droplets size={24} />
          </div>
        </div>

      </div>

      {/* Bloque de Acciones e Inventario */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Formulario de Alertas */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 w-full bg-red-600"></div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <BellRing size={20} />
            </div>
            <div>
              <h5 className="text-lg font-bold text-slate-900">Difusión de Emergencia Extrema</h5>
              <p className="text-xs text-slate-400">El sistema enviará una notificación Push nativa al celular de los donantes aptos.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Grupo de Riesgo</label>
              <select className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 bg-white text-sm text-slate-700 transition-all">
                <option>Seleccionar Grupo</option>
                <option>ORH+ (Universal)</option>
                <option>ORH- (Crítico)</option>
                <option>ARH+</option>
                <option>BRH-</option>
              </select>
            </div>
            
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Detalle de la Solicitud</label>
              <input 
                type="text" 
                placeholder="Ej. Emergencia médica en Hospital Viedma. Se requieren donantes..." 
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-red-500 text-sm text-slate-700 placeholder-slate-400 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium bg-amber-50 px-2.5 py-1 rounded">
              <Sparkles size={14} />
              <span>Alcance estimado: ~450 donantes en Cochabamba</span>
            </div>
            <button 
              onClick={() => navigate('/alertas')}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition shadow-md shadow-red-600/10 active:scale-95 group w-full sm:w-auto justify-center"
            >
              <span>EMITIR ALERTA</span>
              <SendHorizontal size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* PANEL: Monitor de Stock de Sangre Real */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
          <div>
            <h5 className="text-md font-bold text-slate-900">Niveles de Reserva (Stock)</h5>
            <p className="text-xs text-slate-400">Estado actual de los paquetes de sangre almacenados</p>
          </div>

          <div className="space-y-3.5">
            {stockSangre.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>{item.grupo}</span>
                  <span className={item.porcentaje <= 20 ? 'text-red-600' : 'text-slate-500'}>
                    {item.porcentaje}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                    style={{ width: `${item.porcentaje}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;