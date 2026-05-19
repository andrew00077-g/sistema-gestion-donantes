import { useState } from 'react';
import { Droplet, AlertTriangle, ShieldCheck, RefreshCw, Search, Layers } from 'lucide-react';

const InventarioStock = () => {
  const [filtroGrupo, setFiltroGrupo] = useState('Todos');

  // Datos simulados del inventario de Cochabamba para el Frontend (70% de avance)
  const stockData = [
    { id: 1, grupo: 'O RH+', tipo: 'Glóbulos Rojos', unidades: 45, estado: 'Óptimo', vencimiento: 'Próx. 15 días' },
    { id: 2, grupo: 'O RH-', tipo: 'Glóbulos Rojos', unidades: 3, estado: 'Crítico', vencimiento: 'Próx. 8 días' },
    { id: 3, grupo: 'A RH+', tipo: 'Plasma Fresco', unidades: 28, estado: 'Óptimo', vencimiento: 'Próx. 30 días' },
    { id: 4, grupo: 'A RH-', tipo: 'Plaquetas', unidades: 5, estado: 'Crítico', vencimiento: 'Próx. 3 días' },
    { id: 5, grupo: 'B RH+', tipo: 'Glóbulos Rojos', unidades: 19, estado: 'Bajo', vencimiento: 'Próx. 12 días' },
    { id: 6, grupo: 'AB RH+', tipo: 'Plasma Fresco', unidades: 12, estado: 'Óptimo', vencimiento: 'Próx. 25 días' },
  ];

  const gruposSanguineos = ['Todos', 'O RH+', 'O RH-', 'A RH+', 'A RH-', 'B RH+', 'AB RH+'];

  // Filtrar datos según la selección del usuario
  const stockFiltrado = filtroGrupo === 'Todos' 
    ? stockData 
    : stockData.filter(item => item.grupo === filtroGrupo);

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      
      {/* Encabezado */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
        <div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">Inventario de Hemocomponentes</h3>
          <p className="text-sm text-slate-500 mt-0.5">Control de reservas de bolsas de sangre, plasma y plaquetas.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition active:scale-95">
          <RefreshCw size={16} />
          <span>Sincronizar Stock</span>
        </button>
      </header>

      {/* Tarjetas de Resumen Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Bolsas Almacenadas</p>
            <h4 className="text-4xl font-black text-slate-800 tracking-tight">112 Unidades</h4>
          </div>
          <div className="p-4 bg-red-50 text-red-600 rounded-xl">
            <Layers size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alertas por Desabastecimiento</p>
            <h4 className="text-4xl font-black text-rose-600 tracking-tight">2 Grupos</h4>
          </div>
          <div className="p-4 bg-rose-50 text-rose-600 rounded-xl animate-pulse">
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Productos Verificados</p>
            <h4 className="text-4xl font-black text-emerald-600 tracking-tight">100% Aptos</h4>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck size={24} />
          </div>
        </div>
      </div>

      {/* Filtros de Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-slate-400 pl-2">
          <Search size={18} />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Filtrar Grupo:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {gruposSanguineos.map((grupo) => (
            <button
              key={grupo}
              onClick={() => setFiltroGrupo(grupo)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                filtroGrupo === grupo 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {grupo}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla del Inventario */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-4 px-6">Grupo Sanguíneo</th>
                <th className="py-4 px-6">Tipo de Componente</th>
                <th className="py-4 px-6 text-center">Unidades Disponibles</th>
                <th className="py-4 px-6">Estado de Alerta</th>
                <th className="py-4 px-6">Próximo Vencimiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm font-medium">
              {stockFiltrado.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
                        <Droplet size={16} fill="currentColor" />
                      </div>
                      <span className="font-black text-slate-900 text-base">{item.grupo}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-500">{item.tipo}</td>
                  <td className="py-4 px-6 text-center font-bold text-slate-800 text-base">{item.unidades}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                      item.estado === 'Crítico' ? 'bg-rose-50 text-rose-600 border border-rose-100 animate-pulse' :
                      item.estado === 'Bajo' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {item.estado}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-400 text-xs font-semibold">{item.vencimiento}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default InventarioStock;