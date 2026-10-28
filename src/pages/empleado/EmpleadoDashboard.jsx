import { useState } from "react";
import Swal from "sweetalert2";
import Sidebar from "../../components/Sidebar";
import { obtenerAsignaciones } from "../../utils/asignacionesHotel";
import "../admin/Dashboard.css";

function cargarTareas(empleadoId) {
    try {
        return { tareas: obtenerAsignaciones().filter((tarea) => tarea.empleadoId === empleadoId), error: "" };
    } catch (error) {
        return { tareas: [], error: error.message || "No se pudieron cargar tus tareas." };
    }
}

function EmpleadoDashboard({ empleado, onLogout }) {
    const [seccion, setSeccion] = useState("Mis tareas");
    const [datos] = useState(() => cargarTareas(empleado?.id));

    const confirmarSalida = () => {
        Swal.fire({
            title: "¿Deseas cerrar sesión?",
            text: "Regresarás a la página principal",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, salir",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#344c5c"
        }).then((resultado) => {
            if (resultado.isConfirmed) onLogout();
        });
    };

    const tareasOrdenadas = [...datos.tareas].sort((a, b) =>
        `${a.fecha}${a.horaInicio}`.localeCompare(`${b.fecha}${b.horaInicio}`)
    );

    return (
        <div className="hp-dashboard">
            <Sidebar
                titulo="Espacio del empleado"
                opciones={["Mis tareas"]}
                seccion={seccion}
                cambiarSeccion={setSeccion}
                cerrarSesion={confirmarSalida}
            />
            <main className="hp-main">
                <header className="hp-header">
                    <div>
                        <p className="hp-eyebrow">PANEL DEL EMPLEADO</p>
                        <h1>Mis tareas</h1>
                        <p className="hp-subtitle">Bienvenido, {empleado?.nombre || empleado?.correo}</p>
                    </div>
                    <div className="hp-user">
                        <span className="hp-avatar">{empleado?.nombre?.charAt(0) || "E"}</span>
                        <span>{empleado?.cargo}</span>
                    </div>
                </header>

                <section className="hp-panel">
                    <div className="hp-panel-header">
                        <div>
                            <h2>Mis asignaciones</h2>
                            <p>Consulta tus tareas, horarios y estado.</p>
                        </div>
                    </div>
                    {datos.error && <div className="alert alert-danger" role="alert">{datos.error}</div>}
                    {!datos.error && tareasOrdenadas.length === 0 && (
                        <div className="alert alert-info mb-0" role="status">Aún no tienes tareas asignadas.</div>
                    )}
                    {tareasOrdenadas.length > 0 && (
                        <div className="hp-table-wrap">
                            <table className="hp-table">
                                <thead>
                                    <tr>
                                        <th>Tarea</th>
                                        <th>Piso / habitación</th>
                                        <th>Fecha</th>
                                        <th>Horario</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tareasOrdenadas.map((tarea) => (
                                        <tr key={tarea.id}>
                                            <td>{tarea.tipo}</td>
                                            <td>{tarea.ubicacion || "—"}</td>
                                            <td>{tarea.fecha}</td>
                                            <td>{tarea.horaInicio} - {tarea.horaFin}</td>
                                            <td>
                                                <span className={`hp-status ${tarea.estado === "Completada" ? "confirmed" : tarea.estado === "Cancelada" ? "cancelled" : "pending"}`}>
                                                    {tarea.estado}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
                <footer className="hp-footer">Hotel Paraíso · Espacio del empleado</footer>
            </main>
        </div>
    );
}

export default EmpleadoDashboard;
