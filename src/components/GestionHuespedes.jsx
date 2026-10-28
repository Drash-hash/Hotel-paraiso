import { useState } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import { guardarClientes, normalizarCorreo, obtenerClientes } from "../utils/clientesHotel";
import { obtenerReservas } from "../utils/reservasHotel";

function cargarDatos() {
    try {
        return {
            clientes: obtenerClientes(),
            reservas: obtenerReservas(),
            error: ""
        };
    } catch (error) {
        return {
            clientes: [],
            reservas: [],
            error: error.message || "No se pudieron cargar los datos guardados."
        };
    }
}

function GestionHuespedes() {
    const [datos, setDatos] = useState(cargarDatos);
    const [busqueda, setBusqueda] = useState("");
    const [huespedSeleccionado, setHuespedSeleccionado] = useState(null);
    const termino = busqueda.trim().toLocaleLowerCase();

    const huespedesFiltrados = datos.clientes.filter((cliente) =>
        (cliente.nombreCompleto || "").toLocaleLowerCase().includes(termino)
        || (cliente.correo || "").toLocaleLowerCase().includes(termino)
    );

    const reservasDelHuesped = huespedSeleccionado
        ? datos.reservas.filter((reserva) => {
            if (reserva.clienteId !== undefined && reserva.clienteId !== null) {
                return String(reserva.clienteId) === String(huespedSeleccionado.id);
            }

            return reserva.clienteCorreo
                && normalizarCorreo(reserva.clienteCorreo) === normalizarCorreo(huespedSeleccionado.correo);
        })
        : [];

    const cambiarEstadoHuesped = async (huesped) => {
        const estadoActual = String(huesped.estado || "activo").toLocaleLowerCase();
        const nuevoEstado = estadoActual === "inactivo" ? "activo" : "inactivo";
        const accion = nuevoEstado === "inactivo" ? "inhabilitar" : "activar";
        const resultado = await Swal.fire({
            icon: nuevoEstado === "inactivo" ? "warning" : "question",
            title: `¿Deseas ${accion} a este huésped?`,
            text: `${huesped.nombreCompleto || huesped.correo} ${nuevoEstado === "inactivo"
                ? "no podrá iniciar sesión ni crear reservas. Su información e historial se conservarán."
                : "podrá volver a iniciar sesión y crear reservas."}`,
            showCancelButton: true,
            confirmButtonText: nuevoEstado === "inactivo" ? "Sí, inhabilitar" : "Sí, activar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: nuevoEstado === "inactivo" ? "#dc3545" : "#344c5c"
        });

        if (!resultado.isConfirmed) return;

        try {
            const clientesActuales = obtenerClientes();
            const clientesActualizados = clientesActuales.map((cliente) =>
                cliente.id === huesped.id ? { ...cliente, estado: nuevoEstado } : cliente
            );
            guardarClientes(clientesActualizados);
            setDatos((actuales) => ({ ...actuales, clientes: clientesActualizados }));
            setHuespedSeleccionado((actual) => actual?.id === huesped.id
                ? { ...actual, estado: nuevoEstado }
                : actual);
            await Swal.fire({
                icon: "success",
                title: nuevoEstado === "inactivo" ? "Huésped inhabilitado" : "Huésped activado",
                text: "El estado se actualizó correctamente.",
                confirmButtonColor: "#344c5c",
                timer: 1800,
                showConfirmButton: false
            });
        } catch (error) {
            await Swal.fire({
                icon: "error",
                title: "No se pudo cambiar el estado",
                text: error.message || "Revisa el almacenamiento e inténtalo nuevamente."
            });
        }
    };

    const columnasHuespedes = [
        {
            name: "Huésped",
            selector: (fila) => fila.nombreCompleto || "Sin nombre",
            sortable: true
        },
        {
            name: "Correo",
            selector: (fila) => fila.correo || "Sin correo",
            sortable: true
        },
        {
            name: "Teléfono",
            selector: (fila) => fila.telefono || "No registrado",
            sortable: true
        },
        {
            name: "Estado",
            selector: (fila) => String(fila.estado || "activo").toLocaleLowerCase() === "inactivo"
                ? "Inactivo"
                : "Activo",
            cell: (fila) => {
                const estaInactivo = String(fila.estado || "activo").toLocaleLowerCase() === "inactivo";
                return (
                    <span className={`badge ${estaInactivo ? "text-bg-secondary" : "text-bg-success"}`}>
                        {estaInactivo ? "Inactivo" : "Activo"}
                    </span>
                );
            },
            sortable: true
        },
        {
            name: "Acciones",
            button: true,
            cell: (fila) => (
                <div className="d-flex flex-wrap gap-2 py-2">
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setHuespedSeleccionado(fila)}
                        aria-label={`Ver reservas de ${fila.nombreCompleto || fila.correo}`}
                    >
                        <i className="bi bi-calendar-check me-1" aria-hidden="true"></i>
                        Ver reservas
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm ${String(fila.estado || "activo").toLocaleLowerCase() === "inactivo"
                            ? "btn-outline-success"
                            : "btn-outline-danger"}`}
                        onClick={() => cambiarEstadoHuesped(fila)}
                        aria-label={`${String(fila.estado || "activo").toLocaleLowerCase() === "inactivo" ? "Activar" : "Inhabilitar"} a ${fila.nombreCompleto || fila.correo}`}
                    >
                        <i
                            className={`bi ${String(fila.estado || "activo").toLocaleLowerCase() === "inactivo"
                                ? "bi-person-check"
                                : "bi-person-slash"} me-1`}
                            aria-hidden="true"
                        ></i>
                        {String(fila.estado || "activo").toLocaleLowerCase() === "inactivo" ? "Activar" : "Inhabilitar"}
                    </button>
                </div>
            )
        }
    ];

    const columnasReservas = [
        { name: "Código", selector: (fila) => fila.id, sortable: true },
        { name: "Habitación", selector: (fila) => fila.habitacion || "No asignada", sortable: true },
        { name: "Entrada", selector: (fila) => fila.entrada || "-", sortable: true },
        { name: "Salida", selector: (fila) => fila.salida || "-", sortable: true },
        { name: "Estado", selector: (fila) => fila.estado || "Sin estado", sortable: true }
    ];

    return (
        <section className="hp-panel">
            <div className="hp-panel-header">
                <div>
                    <h2>Gestión de huéspedes</h2>
                    <p>{datos.clientes.length} huéspedes registrados</p>
                </div>
            </div>

            {datos.error && (
                <div className="alert alert-danger" role="alert">
                    {datos.error}
                </div>
            )}

            <label className="visually-hidden" htmlFor="buscar-huesped">
                Buscar huésped por nombre o correo
            </label>
            <input
                id="buscar-huesped"
                type="search"
                className="form-control mb-3"
                placeholder="Buscar por nombre o correo..."
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
            />

            <DataTable
                columns={columnasHuespedes}
                data={huespedesFiltrados}
                pagination
                highlightOnHover
                responsive
                striped
                noDataComponent={termino
                    ? "No se encontraron huéspedes con esa búsqueda"
                    : "No hay huéspedes registrados"}
            />

            {huespedSeleccionado && (
                <div className="mt-4 pt-4 border-top">
                    <div className="hp-panel-header">
                        <div>
                            <h2>Reservas de {huespedSeleccionado.nombreCompleto || huespedSeleccionado.correo}</h2>
                            <p>{huespedSeleccionado.correo}</p>
                        </div>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setHuespedSeleccionado(null)}
                        >
                            Cerrar detalle
                        </button>
                    </div>
                    <div className="row g-3 mb-4">
                        <div className="col-12 col-md-4">
                            <span className="d-block text-secondary small">Teléfono</span>
                            <strong>{huespedSeleccionado.telefono || "No registrado"}</strong>
                        </div>
                        <div className="col-12 col-md-4">
                            <span className="d-block text-secondary small">Ciudad</span>
                            <strong>{huespedSeleccionado.ciudad || "No registrada"}</strong>
                        </div>
                        <div className="col-12 col-md-4">
                            <span className="d-block text-secondary small">Dirección</span>
                            <strong>{huespedSeleccionado.direccion || "No registrada"}</strong>
                        </div>
                    </div>
                    <DataTable
                        columns={columnasReservas}
                        data={reservasDelHuesped}
                        pagination
                        highlightOnHover
                        responsive
                        noDataComponent="Este huésped aún no tiene reservas asociadas"
                    />
                </div>
            )}
        </section>
    );
}

export default GestionHuespedes;