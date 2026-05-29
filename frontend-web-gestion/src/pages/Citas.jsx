import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  CalendarDays,
  Plus,
  X,
  User,
} from "lucide-react";

const Citas = () => {
  const [citas, setCitas] = useState([]);
  const [donantes, setDonantes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  // Estados para el Formulario de Nueva Cita
  const [mostrarModal, setMostrarModal] = useState(false);
  const [idDonante, setIdDonante] = useState("");
  const [textoBusquedaDonante, setTextoBusquedaDonante] = useState("");
  const [donanteSeleccionado, setDonanteSeleccionado] = useState(null);
  const [fechaHora, setFechaHora] = useState("");
  const [notes, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Función segura para formatear la fecha proveniente de MySQL sin romper React
  const formatearFechaSegura = (fechaString) => {
    if (!fechaString) return { fecha: "Sin fecha", hora: "Sin hora" };
    try {
      const fechaEstandar = fechaString.includes(" ")
        ? fechaString.replace(" ", "T")
        : fechaString;
      const objetoFecha = new Date(fechaEstandar);

      if (isNaN(objetoFecha.getTime())) {
        return { fecha: "Fecha inválida", hora: "Hora inválida" };
      }

      return {
        fecha: objetoFecha.toLocaleDateString(),
        hora: objetoFecha.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    } catch {
      return { fecha: "Error fecha", hora: "Error hora" };
    }
  };

  // Función de carga aislada e independiente
  const cargarDatosIniciales = useCallback(async () => {
    try {
      const authorizationHeader = { Authorization: `Bearer ${token || ""}` };

      const [resCitas, resDonantes] = await Promise.all([
        fetch("http://localhost:3000/api/operaciones/citas", {
          headers: authorizationHeader,
        }),
        fetch("http://localhost:3000/api/donantes", {
          headers: authorizationHeader,
        }),
      ]);

      if (resCitas.ok) {
        const dataCitas = await resCitas.json();
        setCitas(Array.isArray(dataCitas) ? dataCitas : []);
      }

      if (resDonantes.ok) {
        const dataDonantes = await resDonantes.json();
        setDonantes(Array.isArray(dataDonantes) ? dataDonantes : []);
      }
    } catch (error) {
      console.error("Error al conectar con la API:", error);
    } finally {
      setCargando(false);
    }
  }, [token]);

  // Hook de sincronización limpio sin llamadas directas síncronas
  useEffect(() => {
    let activo = true;

    const inicializar = async () => {
      if (activo) {
        await cargarDatosIniciales();
      }
    };

    inicializar();

    return () => {
      activo = false;
    };
  }, [cargarDatosIniciales]);

  // Cambiar estado (PUT)
  const cambiarEstado = async (idCita, nuevoEstado) => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/operaciones/citas/${idCita}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ estado: nuevoEstado }),
        },
      );

      if (res.ok) {
        setCitas((prevCitas) =>
          prevCitas.map((cita) =>
            cita.id_cita === idCita ? { ...cita, estado: nuevoEstado } : cita,
          ),
        );
      } else {
        const errData = await res.json();
        alert(errData.msg || "Error al actualizar el estado de la cita.");
      }
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
    }
  };

  // Registrar Cita (POST)
  const manejarCrearCita = async (event) => {
    event.preventDefault();
    if (!idDonante || !fechaHora) {
      alert("Por favor, selecciona un donante válido y la fecha/hora.");
      return;
    }

    setGuardando(true);
    try {
      const fechaFormateadaParaMySQL = fechaHora.replace("T", " ") + ":00";

      const res = await fetch("http://localhost:3000/api/operaciones/citas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_donante: Number(idDonante),
          fecha_hora: fechaFormateadaParaMySQL,
          notas: notes || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("🎉 ¡Cita programada exitosamente en el sistema!");

        // Reseteamos el formulario de inmediato
        setMostrarModal(false);
        setIdDonante("");
        setTextoBusquedaDonante("");
        setDonanteSeleccionado(null);
        setFechaHora("");
        setNotas("");

        // Refrescar los datos reflejando los cambios en la lista reactiva
        try {
          await cargarDatosIniciales();
        } catch (fetchError) {
          console.error("El backend falló al recargar la lista:", fetchError);
          alert("La cita se guardó, pero hubo un error de servidor al leer la lista actualizada.");
        }
      } else {
        alert(data.msg || "Error al agendar la cita.");
      }
    } catch (error) {
      console.error("Error detallado en la operación:", error);
      alert("Hubo un problema de sincronización. Comprueba el estado del servidor.");
    } finally {
      setGuardando(false);
    }
  };

  // Filtrados reactivos de donantes para el buscador interno del modal
  const donantesFiltradosModal =
    textoBusquedaDonante.trim() === ""
      ? []
      : donantes.filter((d) => {
          const nombreCompleto = `${d.nombres} ${d.apellidos}`.toLowerCase();
          const documento = d.ci ? d.ci.toString() : "";
          const termino = textoBusquedaDonante.toLowerCase();
          return (
            nombreCompleto.includes(termino) || documento.includes(termino)
          );
        });

  // Filtrado reactivo de la lista global de citas
  const filtradas = citas.filter((c) => {
    const nombreValido = c?.nombres ? c.nombres.toLowerCase() : "";
    const apellidoValido = c?.apellidos ? c.apellidos.toLowerCase() : "";
    const ciValido = c?.ci ? c.ci.toString() : "";
    const termino = busqueda.toLowerCase();
    return (
      nombreValido.includes(termino) ||
      apellidoValido.includes(termino) ||
      ciValido.includes(termino)
    );
  });

  if (cargando) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen text-slate-500 text-xs font-bold">
        Cargando agenda de citas...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen relative">
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900">
            Agenda de Citas Médicas
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Control de flujo y asistencia de donantes voluntarios
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-2.5 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Buscar por C.I. o Nombre"
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:border-red-500 transition"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <button
            onClick={() => setMostrarModal(true)}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition shrink-0"
          >
            <Plus size={16} /> Agendar Cita
          </button>
        </div>
      </div>

      {/* RENDERIZADO DE TARJETAS */}
      {filtradas.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center max-w-xl mx-auto mt-12 space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <CalendarDays size={24} />
          </div>
          <h4 className="font-bold text-slate-700 text-sm">
            No se encontraron citas
          </h4>
          <p className="text-xs text-slate-400">
            Actualmente no existen citas programadas que coincidan con los criterios de búsqueda o cargadas en la base de datos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtradas.map((cita) => {
            const tiempo = formatearFechaSegura(cita.fecha_hora);

            return (
              <div
                key={cita.id_cita}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-[9px] font-black uppercase tracking-wider">
                      {cita.tipo_sangre || "S/N"}
                    </span>
                    <h4 className="font-bold text-slate-800 mt-1.5">
                      {cita.nombres 
                        ? `${cita.nombres} ${cita.apellidos}` 
                        : `Donante no vinculado (ID: ${cita.id_donante})`}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      C.I. {cita.ci || "S/N"}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                      cita.estado === "PENDIENTE"
                        ? "bg-amber-50 text-amber-600 border border-amber-200"
                        : cita.estado === "COMPLETADA"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {cita.estado || "PENDIENTE"}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} /> {tiempo.fecha}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} /> {tiempo.hora}
                  </div>
                </div>

                {cita.notas && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg italic">
                    Nota: {cita.notas}
                  </p>
                )}

                {cita.estado === "PENDIENTE" && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => cambiarEstado(cita.id_cita, "COMPLETADA")}
                      className="flex-1 py-2 bg-emerald-500 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 hover:bg-emerald-600 transition"
                    >
                      <CheckCircle size={12} /> Confirmar
                    </button>
                    <button
                      onClick={() => cambiarEstado(cita.id_cita, "AUSENTE")}
                      className="flex-1 py-2 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 hover:bg-slate-300 transition"
                    >
                      <AlertCircle size={12} /> Ausente
                    </button>
                    <button
                      onClick={() => cambiarEstado(cita.id_cita, "CANCELADA")}
                      className="py-2 px-3 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE PROGRAMACIÓN */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-slate-950 p-4 text-white flex justify-between items-center">
              <div>
                <h4 className="font-black text-sm uppercase tracking-wider">
                  Programar Nueva Cita
                </h4>
                <p className="text-[10px] text-slate-400">
                  Asignación de cupo horario para extracción
                </p>
              </div>
              <button
                onClick={() => {
                  setMostrarModal(false);
                  setDonanteSeleccionado(null);
                  setIdDonante("");
                  setTextoBusquedaDonante("");
                }}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={manejarCrearCita} className="p-5 space-y-4">
              {/* BUSCADOR INTERNO DE DONANTE */}
              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">
                  Buscar Donante Voluntario
                </label>

                {donanteSeleccionado ? (
                  <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs text-emerald-800">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-emerald-600" />
                      <div>
                        <p className="font-bold">
                          {donanteSeleccionado.nombres}{" "}
                          {donanteSeleccionado.apellidos}
                        </p>
                        <p className="text-[10px] text-emerald-600 font-mono">
                          C.I. {donanteSeleccionado.ci} | Tipo:{" "}
                          {donanteSeleccionado.tipo_sangre || "S/N"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDonanteSeleccionado(null);
                        setIdDonante("");
                      }}
                      className="p-1 hover:bg-emerald-100 rounded text-emerald-700 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search
                        className="absolute left-3 top-2.5 text-slate-400"
                        size={14}
                      />
                      <input
                        type="text"
                        placeholder="Escribe el nombre o C.I. del donante..."
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:border-red-500 transition"
                        value={textoBusquedaDonante}
                        onChange={(e) => setTextoBusquedaDonante(e.target.value)}
                      />
                    </div>

                    {donantesFiltradosModal.length > 0 && (
                      <div className="absolute left-0 right-0 top-[58px] bg-white border border-slate-200 rounded-xl max-h-40 overflow-y-auto shadow-lg z-50 divide-y divide-slate-100">
                        {donantesFiltradosModal.map((d) => (
                          <div
                            key={d.id_donante}
                            onClick={() => {
                              setDonanteSeleccionado(d);
                              setIdDonante(d.id_donante);
                              setTextoBusquedaDonante("");
                            }}
                            className="p-2.5 text-xs hover:bg-slate-50 cursor-pointer transition flex justify-between items-center"
                          >
                            <span className="font-semibold text-slate-700">
                              {d.nombres} {d.apellidos}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              C.I. {d.ci}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* ENTRADA DE FECHA Y HORA */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">
                  Fecha y Hora de la Reserva
                </label>
                <input
                  type="datetime-local"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:border-red-500 transition"
                  value={fechaHora}
                  onChange={(e) => setFechaHora(e.target.value)}
                />
              </div>

              {/* COMENTARIOS CLÍNICOS */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">
                  Notas Clínicas / Recordatorios
                </label>
                <textarea
                  placeholder="Ej: Donante requiere refrigerio sin lactosa..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:border-red-500 transition resize-none"
                  value={notes}
                  onChange={(e) => setNotas(e.target.value)}
                />
              </div>

              {/* ACCIONES DEL MODAL */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  disabled={guardando}
                  onClick={() => {
                    setMostrarModal(false);
                    setDonanteSeleccionado(null);
                    setIdDonante("");
                    setTextoBusquedaDonante("");
                  }}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando || !idDonante}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                >
                  {guardando ? "Guardando..." : "Confirmar Reserva"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Citas;