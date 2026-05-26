import { useState, useEffect } from 'react';
import { Droplets, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

const InventarioStock = () => {
  const [inventario, setInventario] = useState([]);
  const [cargando, setCargando] = useState(true);
  const token = localStorage.getItem('token');

  // 🔄 Función exclusiva para el botón manual (evita colisiones con el efecto inicial)
  const refrescarInventarioManual = async () => {
    setCargando(true);
    try {
      const res = await fetch('http://localhost:3000/api/operaciones/inventario', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const datos = await res.json();
        setInventario(datos);
      }
    } catch (error) {
      console.error("Error cargando inventario:", error);
    } finally {
      setCargando(false);
    }
  };

  // 🌟 SOLUCIÓN AL ADVERTENCIA: Aislamos el fetch síncrono inicial dentro de su propio efecto
  useEffect(() => {
    let activo = true; // Bandera para evitar fugas de memoria si el componente se desmonta rápido

    const cargarDatosIniciales = async () => {
      setCargando(true);
      try {
        const res = await fetch('http://localhost:3000/api/operaciones/inventario', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok && activo) {
          const datos = await res.json();
          setInventario(datos);
        }
      } catch (error) {
        console.error("Error cargando inventario inicial:", error);
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarDatosIniciales();

    return () => {
      activo = false; // Limpieza del efecto
    };
  }, [token]); // Agregamos token como dependencia segura

  // Función auxiliar para simular un stock completo con los 8 grupos si la BD está vacía
  const gruposBase = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const obtenerUnidades = (group) => {
    const registro = inventario.find(item => item.tipo_sangre === group);
    return registro ? registro.cantidad_unidades : 0;
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 font-sans pb-16">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
            <Droplets size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Inventario de Sangre</h1>
            <p className="text-sm text-slate-500">Stock físico de unidades disponibles en el Banco de Referencia</p>
          </div>
        </div>
        
        <button 
          onClick={refrescarInventarioManual} 
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition shadow-sm self-start sm:self-center"
        >
          <RefreshCw size={14} className={cargando ? 'animate-spin' : ''} />
          ACTUALIZAR STOCK
        </button>
      </div>

      {cargando ? (
        <div className="text-center p-20 font-bold text-slate-500 text-sm">Consultando cámaras frigoríficas...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {gruposBase.map((grupo) => {
            const unidades = obtenerUnidades(grupo);
            const esBajoStock = unidades <= 2;

            return (
              <div key={grupo} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-3xl font-black text-slate-900 tracking-tighter">{grupo}</span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Factor Sanguíneo</p>
                  </div>
                  <div className={`p-2 rounded-xl ${esBajoStock ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {esBajoStock ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                  </div>
                </div>

                <div className="mt-8 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-4xl font-black text-slate-800">{unidades}</span>
                    <span className="text-xs text-slate-500 font-bold">unidades</span>
                  </div>

                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${esBajoStock ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min((unidades / 10) * 100, 100)}%` }}
                    ></div>
                  </div>

                  <p className={`text-[10px] font-black uppercase tracking-wide pt-1 ${esBajoStock ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {esBajoStock ? '⚠️ Stock Crítico / Solicitar Alerta' : '✓ Stock Seguro'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InventarioStock;