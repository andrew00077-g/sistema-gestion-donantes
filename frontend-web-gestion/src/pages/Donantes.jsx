import { Search, Plus } from 'lucide-react';

const Donantes = () => {
  // Datos simulados para tu presentación
  const donantesEjemplo = [
    { id: 1, nombre: "Andrew Gonzales", ci: "1234567 LP", tipo: "O RH+", telefono: "78945612", estado: "Apto" },
    { id: 2, nombre: "Maria Lopez", ci: "8765432 CB", tipo: "A RH-", telefono: "65412398", estado: "En espera" },
    { id: 3, nombre: "Carlos Mamani", ci: "5566778 CB", tipo: "O RH-", telefono: "71122334", estado: "Rechazado" },
  ];

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">Gestión de Donantes</h3>
          <p className="text-sm text-slate-500 mt-1">Registro y control de voluntarios del Banco de Sangre</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-3 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition shadow-md shadow-red-600/20 active:scale-95">
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
              placeholder="Buscar por nombre o carnet de identidad..." 
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm text-slate-700 transition-all"
            />
          </div>
          <select className="px-4 py-2.5 border border-slate-200 rounded-xl outline-none bg-white text-sm text-slate-700 font-medium focus:border-red-500 transition-all">
            <option>Todos los grupos</option>
            <option>O RH+</option>
            <option>O RH-</option>
            <option>A RH+</option>
          </select>
        </div>

        {/* Tabla de Datos */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="p-5">Nombre Completo</th>
                <th className="p-5">C.I.</th>
                <th className="p-5">Grupo Sanguíneo</th>
                <th className="p-5">Teléfono</th>
                <th className="p-5">Estado</th>
                <th className="p-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {donantesEjemplo.map(d => (
                <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-5 font-bold text-slate-800">{d.nombre}</td>
                  <td className="p-5 text-slate-600">{d.ci}</td>
                  <td className="p-5">
                    <span className="px-3 py-1 bg-red-50 text-red-700 rounded-lg font-bold text-xs border border-red-100">
                      {d.tipo}
                    </span>
                  </td>
                  <td className="p-5 text-slate-600">{d.telefono}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                      d.estado === 'Apto' ? 'bg-emerald-50 text-emerald-700' : 
                      d.estado === 'Rechazado' ? 'bg-rose-50 text-rose-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {d.estado}
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
        </div>
      </div>
    </div>
  );
};

export default Donantes;