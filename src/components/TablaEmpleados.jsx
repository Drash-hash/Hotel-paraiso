import { useState } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import FormularioEmpleado from "./FormularioEmpleado";
import {
    crearIdEmpleado,
    guardarEmpleados,
    normalizarCorreoEmpleado,
    normalizarDocumento,
    obtenerEmpleados
} from "../utils/empleadosHotel";
import { obtenerClientes, normalizarCorreo } from "../utils/clientesHotel";

function cargarEmpleados() {
    try {
        return { empleados: obtenerEmpleados(), error: "" };
    } catch (error) {
        return {
            empleados: [],
            error: error.message || "No se pudieron cargar los empleados guardados."
        };
    }
}

function TablaEmpleados() {
    const [datos, setDatos] = useState(cargarEmpleados);
    const [busqueda, setBusqueda] = useState("");
    const [empleadoEditando, setEmpleadoEditando] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const actualizarLista = (empleados) => {
        guardarEmpleados(empleados);
        setDatos({ empleados, error: "" });
        setMostrarFormulario(false);
        setEmpleadoEditando(null);
    };

    const guardarEmpleado = async (formulario) => {
        try {
            const empleadosActuales = obtenerEmpleados();
            const documentoNormalizado = normalizarDocumento(formulario.documento);
            const correoNormalizado = normalizarCorreoEmpleado(formulario.correo);
            const duplicado = empleadosActuales.find((empleado) =>
                empleado.id !== empleadoEditando?.id
                && (normalizarDocumento(empleado.documento || "") === documentoNormalizado
                    || normalizarCorreoEmpleado(empleado.correo || "") === correoNormalizado)
            );

            if (duplicado) {
                await Swal.fire({
                    icon: "warning",
                    title: "Documento o correo ya registrado",
                    text: "Verifica los datos: cada empleado debe tener un documento y correo únicos.",
                    confirmButtonColor: "#344c5c"
                });
                return;
            }

            const correoReservado = ["admin@hotel.com", "cliente@hotel.com"].includes(correoNormalizado)
                || obtenerClientes().some((cliente) => normalizarCorreo(cliente.correo || "") === correoNormalizado);
            if (correoReservado) {
                await Swal.fire({
                    icon: "warning",
                    title: "Correo no disponible",
                    text: "El correo ya está reservado o pertenece a una cuenta de huésped.",
                    confirmButtonColor: "#344c5c"
                });
                return;
            }

            const empleadosActualizados = empleadoEditando
                ? empleadosActuales.map((empleado) => empleado.id === empleadoEditando.id
                    ? { ...empleado, ...formulario }
                    : empleado)
                : [...empleadosActuales, {
                    ...formulario,
                    id: crearIdEmpleado(),
                    estado: "Activo"
                }];

            actualizarLista(empleadosActualizados);
            await Swal.fire({
                icon: "success",
                title: empleadoEditando ? "Empleado actualizado" : "Empleado registrado",
                timer: 1800,
                showConfirmButton: false
            });
        } catch (error) {
            await Swal.fire({
                icon: "error",
                title: "No se pudo guardar el empleado",
                text: error.message || "Revisa el almacenamiento e inténtalo nuevamente.",
                confirmButtonColor: "#344c5c"
            });
        }
    };

    const cambiarEstado = async (empleado) => {
        const estaActivo = String(empleado.estado || "Activo").toLocaleLowerCase() === "activo";
        const nuevoEstado = estaActivo ? "Inactivo" : "Activo";
        const resultado = await Swal.fire({
            icon: estaActivo ? "warning" : "question",
            title: `¿Deseas ${estaActivo ? "inhabilitar" : "activar"} a este empleado?`,
            text: `${empleado.nombre} conservará su registro y podrá volver a activarse después.`,
            showCancelButton: true,
            confirmButtonText: estaActivo ? "Sí, inhabilitar" : "Sí, activar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: estaActivo ? "#dc3545" : "#344c5c"
        });

        if (!resultado.isConfirmed) return;

        try {
            const empleadosActuales = obtenerEmpleados();
            actualizarLista(empleadosActuales.map((actual) => actual.id === empleado.id
                ? { ...actual, estado: nuevoEstado }
                : actual));
            await Swal.fire({
                icon: "success",
                title: `Empleado ${nuevoEstado.toLocaleLowerCase()}`,
                confirmButtonColor: "#344c5c",
                timer: 1600,
                showConfirmButton: false
            });
        } catch (error) {
            await Swal.fire({
                icon: "error",
                title: "No se pudo cambiar el estado",
                text: error.message || "Revisa el almacenamiento e inténtalo nuevamente.",
                confirmButtonColor: "#344c5c"
            });
        }
    };

    const termino = busqueda.trim().toLocaleLowerCase();
    const empleadosFiltrados = datos.empleados.filter((empleado) =>
        (empleado.nombre || "").toLocaleLowerCase().includes(termino)
        || (empleado.documento || "").toLocaleLowerCase().includes(termino)
        || (empleado.cargo || "").toLocaleLowerCase().includes(termino)
    );

    const columnas = [
        { name: "Documento", selector: (fila) => fila.documento, sortable: true },
        { name: "Nombre", selector: (fila) => fila.nombre, sortable: true },
        { name: "Correo", selector: (fila) => fila.correo, sortable: true },
        { name: "Teléfono", selector: (fila) => fila.telefono, sortable: true },
        { name: "Cargo", selector: (fila) => fila.cargo, sortable: true },
        {
            name: "Estado",
            selector: (fila) => fila.estado || "Activo",
            cell: (fila) => {
                const estaActivo = String(fila.estado || "Activo").toLocaleLowerCase() === "activo";
                return <span className={`badge ${estaActivo ? "text-bg-success" : "text-bg-secondary"}`}>
                    {estaActivo ? "Activo" : "Inactivo"}
                </span>;
            },
            sortable: true
        },
        {
            name: "Acciones",
            cell: (fila) => {
                const estaActivo = String(fila.estado || "Activo").toLocaleLowerCase() === "activo";
                return (
                    <div className="employee-actions">
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-primary employee-action-btn"
                            onClick={() => {
                                setEmpleadoEditando(fila);
                                setMostrarFormulario(true);
                            }}
                            aria-label={`Editar a ${fila.nombre}`}
                            title="Editar empleado"
                        >
                            <i className="bi bi-pencil-square" aria-hidden="true"></i>
                            <span>Editar</span>
                        </button>
                        <button
                            type="button"
                            className={`btn btn-sm employee-action-btn ${estaActivo ? "btn-outline-danger" : "btn-outline-success"}`}
                            onClick={() => cambiarEstado(fila)}
                            aria-label={`${estaActivo ? "Inhabilitar" : "Activar"} a ${fila.nombre}`}
                        >
                            <i className={`bi ${estaActivo ? "bi-person-slash" : "bi-person-check"}`} aria-hidden="true"></i>
                            {estaActivo ? "Inhabilitar" : "Activar"}
                        </button>
                    </div>
                );
            }
        }
    ];

    return (
        <section className="hp-panel">
            <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
                <div>
                    <h2 className="mb-1">Gestión de empleados</h2>
                    <p className="text-secondary mb-0">{datos.empleados.length} empleados registrados</p>
                </div>
                <button
                    type="button"
                    className="btn-nueva-habitacion"
                    onClick={() => {
                        setEmpleadoEditando(null);
                        setMostrarFormulario(true);
                    }}
                >
                    <i className="bi bi-person-plus me-2" aria-hidden="true"></i>
                    Nuevo empleado
                </button>
            </div>

            {datos.error && <div className="alert alert-danger" role="alert">{datos.error}</div>}

            {mostrarFormulario && (
                <div className="card p-3 p-md-4 mb-4">
                    <h3 className="h5 mb-3">{empleadoEditando ? "Editar empleado" : "Registrar empleado"}</h3>
                    <FormularioEmpleado
                        key={empleadoEditando?.id || "nuevo-empleado"}
                        empleado={empleadoEditando}
                        guardar={guardarEmpleado}
                        cancelar={() => {
                            setMostrarFormulario(false);
                            setEmpleadoEditando(null);
                        }}
                    />
                </div>
            )}

            <label htmlFor="buscar-empleado" className="visually-hidden">
                Buscar por nombre, documento o cargo
            </label>
            <input
                id="buscar-empleado"
                type="search"
                className="form-control mb-3"
                placeholder="Buscar por nombre, documento o cargo..."
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
            />

            <div className="employee-table-wrap">
                <DataTable
                    columns={columnas}
                    data={empleadosFiltrados}
                    pagination
                    highlightOnHover
                    striped
                    responsive
                    noDataComponent={termino ? "No se encontraron empleados" : "No hay empleados registrados"}
                />
            </div>
        </section>
    );
}

export default TablaEmpleados;