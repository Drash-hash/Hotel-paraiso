import { useState } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import {
    crearIdAsignacion,
    guardarAsignaciones,
    hayConflictoHorario,
    obtenerAsignaciones
} from "../utils/asignacionesHotel";
import { empleadoEstaActivo, obtenerEmpleados } from "../utils/empleadosHotel";

const TIPOS_TAREA = ["Limpieza", "Mantenimiento", "Recepción", "Cocina", "Administración", "Otra"];
const ESTADOS_TAREA = ["Pendiente", "En proceso", "Completada", "Cancelada"];

function cargarDatos() {
    try {
        return { asignaciones: obtenerAsignaciones(), empleados: obtenerEmpleados(), error: "" };
    } catch (error) {
        return {
            asignaciones: [],
            empleados: [],
            error: error.message || "No se pudieron cargar las asignaciones."
        };
    }
}

function fechaHoy() {
    const fecha = new Date();
    const zona = fecha.getTimezoneOffset() * 60000;
    return new Date(fecha.getTime() - zona).toISOString().slice(0, 10);
}

function GestionAsignaciones() {
    const [datos, setDatos] = useState(cargarDatos);
    const [edicion, setEdicion] = useState(null);
    const [formulario, setFormulario] = useState(null);
    const empleadosActivos = datos.empleados.filter(empleadoEstaActivo);

    const refrescarDatos = () => {
        setDatos({ asignaciones: obtenerAsignaciones(), empleados: obtenerEmpleados(), error: "" });
    };

    const iniciarFormulario = (asignacion = null) => {
        setEdicion(asignacion);
        setFormulario(asignacion ? {
            empleadoId: asignacion.empleadoId,
            tipo: asignacion.tipo,
            ubicacion: asignacion.ubicacion || "",
            fecha: asignacion.fecha,
            horaInicio: asignacion.horaInicio,
            horaFin: asignacion.horaFin,
            estado: asignacion.estado
        } : {
            empleadoId: "",
            tipo: TIPOS_TAREA[0],
            ubicacion: "",
            fecha: fechaHoy(),
            horaInicio: "",
            horaFin: "",
            estado: "Pendiente"
        });
    };

    const cancelarFormulario = () => {
        setFormulario(null);
        setEdicion(null);
    };

    const cambiarCampo = (evento) => {
        const { name, value } = evento.target;
        setFormulario((actual) => ({ ...actual, [name]: value }));
    };

    const guardar = async (evento) => {
        evento.preventDefault();
        try {
            const asignaciones = obtenerAsignaciones();
            const empleado = obtenerEmpleados().find((item) => item.id === formulario.empleadoId);
            if (!empleadoEstaActivo(empleado)) {
                await Swal.fire({
                    icon: "warning",
                    title: "Empleado inactivo",
                    text: "Solo se pueden asignar tareas a empleados activos.",
                    confirmButtonColor: "#344c5c"
                });
                refrescarDatos();
                return;
            }

            if (formulario.horaFin <= formulario.horaInicio) {
                await Swal.fire({
                    icon: "warning",
                    title: "Horario no válido",
                    text: "La hora de finalización debe ser posterior a la hora de inicio.",
                    confirmButtonColor: "#344c5c"
                });
                return;
            }

            const asignacion = {
                ...formulario,
                id: edicion?.id || crearIdAsignacion(),
                empleadoId: empleado.id,
                empleadoNombre: empleado.nombre
            };
            if (hayConflictoHorario(asignacion, asignaciones)) {
                await Swal.fire({
                    icon: "error",
                    title: "Conflicto de horario",
                    text: "Este empleado ya tiene otra tarea asignada durante ese horario.",
                    confirmButtonColor: "#344c5c"
                });
                return;
            }

            const actualizadas = edicion
                ? asignaciones.map((actual) => actual.id === edicion.id ? asignacion : actual)
                : [...asignaciones, asignacion];
            guardarAsignaciones(actualizadas);
            setDatos((actual) => ({ ...actual, asignaciones: actualizadas }));
            cancelarFormulario();
            await Swal.fire({
                icon: "success",
                title: edicion ? "Asignación actualizada" : "Tarea asignada",
                timer: 1600,
                showConfirmButton: false
            });
        } catch (error) {
            await Swal.fire({
                icon: "error",
                title: "No se pudo guardar la asignación",
                text: error.message || "Revisa el almacenamiento e inténtalo nuevamente.",
                confirmButtonColor: "#344c5c"
            });
        }
    };

    const cancelarAsignacion = async (asignacion) => {
        const confirmacion = await Swal.fire({
            icon: "warning",
            title: "¿Cancelar esta asignación?",
            text: "La tarea se conservará en el historial con estado Cancelada.",
            showCancelButton: true,
            confirmButtonText: "Sí, cancelar tarea",
            cancelButtonText: "Volver",
            confirmButtonColor: "#dc3545"
        });
        if (!confirmacion.isConfirmed) return;

        try {
            const actualizadas = obtenerAsignaciones().map((actual) =>
                actual.id === asignacion.id ? { ...actual, estado: "Cancelada" } : actual
            );
            guardarAsignaciones(actualizadas);
            setDatos((actual) => ({ ...actual, asignaciones: actualizadas }));
        } catch (error) {
            await Swal.fire({
                icon: "error",
                title: "No se pudo cancelar la asignación",
                text: error.message || "Revisa el almacenamiento e inténtalo nuevamente.",
                confirmButtonColor: "#344c5c"
            });
        }
    };

    const columnas = [
        { name: "Empleado", selector: (fila) => fila.empleadoNombre, sortable: true },
        { name: "Tarea", selector: (fila) => fila.tipo, sortable: true },
        { name: "Piso / habitación", selector: (fila) => fila.ubicacion || "—" },
        { name: "Fecha", selector: (fila) => fila.fecha, sortable: true },
        { name: "Horario", selector: (fila) => `${fila.horaInicio} - ${fila.horaFin}` },
        {
            name: "Estado",
            cell: (fila) => <span className={`badge ${fila.estado === "Completada" ? "text-bg-success" : fila.estado === "Cancelada" ? "text-bg-secondary" : "text-bg-warning"}`}>{fila.estado}</span>,
            sortable: true,
            selector: (fila) => fila.estado
        },
        {
            name: "Acciones",
            cell: (fila) => (
                <div className="d-flex gap-2 py-2">
                    <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => iniciarFormulario(fila)} aria-label={`Editar tarea de ${fila.empleadoNombre}`}>
                        <i className="bi bi-pencil-square" aria-hidden="true"></i>
                    </button>
                    {fila.estado !== "Cancelada" && (
                        <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => cancelarAsignacion(fila)} aria-label={`Cancelar tarea de ${fila.empleadoNombre}`}>
                            <i className="bi bi-x-circle" aria-hidden="true"></i>
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <section className="hp-panel">
            <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
                <div>
                    <h2 className="mb-1">Asignación de tareas</h2>
                    <p className="text-secondary mb-0">{datos.asignaciones.length} asignaciones registradas</p>
                </div>
                <button type="button" className="btn-nueva-habitacion" onClick={() => iniciarFormulario()}>
                    <i className="bi bi-plus-circle me-2" aria-hidden="true"></i>Nueva asignación
                </button>
            </div>

            {datos.error && <div className="alert alert-danger" role="alert">{datos.error}</div>}
            {!datos.error && empleadosActivos.length === 0 && (
                <div className="alert alert-info" role="status">Registra y activa empleados antes de asignar tareas.</div>
            )}

            {formulario && (
                <form className="card p-3 p-md-4 mb-4" onSubmit={guardar}>
                    <h3 className="h5 mb-3">{edicion ? "Editar asignación" : "Nueva asignación"}</h3>
                    <div className="row g-3">
                        <div className="col-12 col-md-6">
                            <label className="form-label" htmlFor="asignacion-empleado">Empleado</label>
                            <select className="form-select" id="asignacion-empleado" name="empleadoId" value={formulario.empleadoId} onChange={cambiarCampo} required>
                                <option value="">Selecciona un empleado</option>
                                {empleadosActivos.map((empleado) => <option key={empleado.id} value={empleado.id}>{empleado.nombre} — {empleado.cargo}</option>)}
                            </select>
                        </div>
                        <div className="col-12 col-md-6">
                            <label className="form-label" htmlFor="asignacion-tipo">Tipo de tarea</label>
                            <select className="form-select" id="asignacion-tipo" name="tipo" value={formulario.tipo} onChange={cambiarCampo} required>
                                {TIPOS_TAREA.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
                            </select>
                        </div>
                        <div className="col-12 col-md-6">
                            <label className="form-label" htmlFor="asignacion-ubicacion">Piso / habitación <span className="text-secondary">(si corresponde)</span></label>
                            <input className="form-control" id="asignacion-ubicacion" name="ubicacion" value={formulario.ubicacion} onChange={cambiarCampo} maxLength={60} placeholder="Ej. Piso 2, habitación 204" />
                        </div>
                        <div className="col-12 col-md-6">
                            <label className="form-label" htmlFor="asignacion-fecha">Fecha</label>
                            <input className="form-control" type="date" id="asignacion-fecha" name="fecha" value={formulario.fecha} onChange={cambiarCampo} required />
                        </div>
                        <div className="col-12 col-md-4">
                            <label className="form-label" htmlFor="asignacion-inicio">Hora de inicio</label>
                            <input className="form-control" type="time" id="asignacion-inicio" name="horaInicio" value={formulario.horaInicio} onChange={cambiarCampo} required />
                        </div>
                        <div className="col-12 col-md-4">
                            <label className="form-label" htmlFor="asignacion-fin">Hora de finalización</label>
                            <input className="form-control" type="time" id="asignacion-fin" name="horaFin" value={formulario.horaFin} onChange={cambiarCampo} required />
                        </div>
                        <div className="col-12 col-md-4">
                            <label className="form-label" htmlFor="asignacion-estado">Estado</label>
                            <select className="form-select" id="asignacion-estado" name="estado" value={formulario.estado} onChange={cambiarCampo} required>
                                {ESTADOS_TAREA.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <button type="button" className="btn btn-outline-secondary" onClick={cancelarFormulario}>Cancelar</button>
                        <button type="submit" className="btn-nueva-habitacion">{edicion ? "Guardar cambios" : "Asignar tarea"}</button>
                    </div>
                </form>
            )}
            <DataTable
                columns={columnas}
                data={[...datos.asignaciones].sort((a, b) => `${a.fecha}${a.horaInicio}`.localeCompare(`${b.fecha}${b.horaInicio}`))}
                pagination
                highlightOnHover
                striped
                responsive
                noDataComponent="No hay asignaciones registradas"
            />
        </section>
    );
}

export default GestionAsignaciones;
