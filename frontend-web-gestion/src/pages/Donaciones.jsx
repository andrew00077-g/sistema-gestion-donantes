import { useState, useEffect } from "react";
import { User, Search } from "lucide-react";

const Donaciones = () => {
  const [donaciones, setDonaciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const cargarHistorialDonaciones = async () => {
      try {
        // GET /api/donaciones para listar el historial
        const res = await fetch("http://localhost:3000/api/donaciones", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setDonaciones(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error al cargar historial:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarHistorialDonaciones();
  }, [token]);

  const filtradas = donaciones.filter(
    (d) =>
      d.donante_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      d.id_donacion?.toString().includes(busqueda),
  );

  if (cargando)
    return (
      <div className="p-8 text-center text-xs font-bold text-slate-500">
        Cargando módulo de donaciones...
      </div>
    );

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-slate-900">
            Historial de Donaciones Sanguíneas
          </h3>
          <p className="text-xs text-slate-500">
            Registro de extracciones físicas{" "}
          </p>
        </div>
        <div className="relative w-64">
          <Search
            className="absolute left-3 top-2.5 text-slate-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Buscar por donante o ID Bolsa"
            className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs bg-white outline-none"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-slate-100 text-[10px] font-black uppercase tracking-wider">
              <th className="p-4">ID Bolsa</th>
              <th className="p-4">Donante</th>
              <th className="p-4">Volumen</th>
              <th className="p-4">Fecha/Hora</th>
              <th className="p-4">Responsable</th>
              <th className="p-4 text-center">Estado Laboratorio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {filtradas.map((donacion) => (
              <tr
                key={donacion.id_donacion}
                className="hover:bg-slate-50 transition"
              >
                <td className="p-4 font-mono font-bold text-red-600">
                  #B-{donacion.id_donacion}
                </td>
                <td className="p-4 flex items-center gap-2 font-semibold">
                  <User size={14} className="text-slate-400" />{" "}
                  {donacion.donante_nombre}
                </td>
                <td className="p-4 font-bold">{donacion.cantidad_ml} ml</td>
                <td className="p-4 text-slate-500">
                  {new Date(donacion.fecha_donacion).toLocaleString()}
                </td>
                <td className="p-4 text-slate-500">{donacion.admin_nombre}</td>
                <td className="p-4 text-center">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-wide ${
                      donacion.estado_sangre === "APROBADA"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        : donacion.estado_sangre === "DESCARTADA"
                          ? "bg-rose-50 text-rose-600 border border-rose-200"
                          : "bg-amber-50 text-amber-600 border border-amber-200"
                    }`}
                  >
                    {donacion.estado_sangre}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Donaciones;
