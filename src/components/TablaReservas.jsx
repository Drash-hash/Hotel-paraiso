import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import FormularioReserva from "./FormularioReserva";
import { generarCodigoReserva } from "../utils/reservasHotel";
import { obtenerHabitaciones } from "../utils/habitacionesHotel";
import { clienteEstaActivo, obtenerClientes } from "../utils/clientesHotel";

const reservasIniciales = [
    {
        id: 1,
        habitacion: "Suite 201",
        entrada: "2026-10-19",
        salida: "2026-10-28",
        estado: "Confirmada"
    },
    {
        id: 2,
        habitacion: "Doble 106",
        entrada: "2026-11-10",
        salida: "2026-11-15",
        estado: "Pendiente"
    }
];

function TablaReservas({ clienteId, cliente, esAdmin = true, onReservasChange }) {
    const [reservas, setReservas] = useState(() => {
        const guardadas = localStorage.getItem("reservasHotel");
        return guardadas ? JSON.parse(guardadas) : reservasIniciales;
    });
    const [busqueda, setBusqueda] = useState("");

    useEffect(() => {
        localStorage.setItem("reservasHotel", JSON.stringify(reservas));
        onReservasChange?.(reservas);
    }, [reservas, onReservasChange]);

    const validarClienteActivo = async () => {
        try {
            const clienteActual = obtenerClientes().find(
                (item) => String(item.id) === String(clienteId)
            );
            if (clienteEstaActivo(clienteActual)) return true;

            await Swal.fire({
                icon: "warning",
                title: "Cuenta inactiva",
                text: "No puedes crear reservas mientras tu cuenta esté inactiva. Contacta al administrador."
            });
        } catch (error) {
            await Swal.fire({
                icon: "error",
                title: "No se pudo validar tu cuenta",
                text: error.message || "Revisa tus datos e inténtalo nuevamente."
            });
        }

        return false;
    };

    const abrirFormulario = async (reserva = null) => {
        if (!esAdmin && !reserva && !(await validarClienteActivo())) return;

        let habitaciones = [];
        if (!esAdmin) {
            try {
                habitaciones = obtenerHabitaciones();
            } catch (error) {
                await Swal.fire({
                    icon: "error",
                    title: "No se pudieron cargar las habitaciones",
                    text: error.message
                });
                return;
            }
        }

        const contenedor = document.createElement("div");
        const raiz = createRoot(contenedor);

        raiz.render(
            <FormularioReserva
                reserva={reserva}
                esAdmin={esAdmin}
                habitaciones={habitaciones}
                reservasExistentes={reservas}
                guardar={async (datos) => {
                    if (reserva) {
                        setReservas((actuales) => actuales.map((actual) =>
                            actual.id === reserva.id
                                ? { ...actual, ...datos, clienteId: actual.clienteId }
                                : actual
                        ));
                    } else {
                        try {
                            if (!esAdmin && !(await validarClienteActivo())) return;

                            const nuevaReserva = {
                                ...datos,
                                id: generarCodigoReserva(reservas),
                                ...(esAdmin ? {} : {
                                    clienteId,
                                    clienteCorreo: cliente.correo,
                                    clienteNombre: cliente.nombreCompleto
                                })
                            };
                            setReservas((actuales) => [...actuales, nuevaReserva]);
                            Swal.close();
                        } catch (error) {
                            Swal.fire({
                                icon: "error",
                                title: "No se pudo crear la reserva",
                                text: error.message
                            });
                        }
                        return;
                    }

                    Swal.close();
                }}
                cancelar={() => Swal.close()}
            />
        );

        await Swal.fire({
            title: reserva ? "Editar Reserva" : "Nueva Reserva",
            html: contenedor,
            showConfirmButton: false,
            didClose: () => raiz.unmount()
        });
    };

    const eliminarReserva = async (id) => {
        const resultado = await Swal.fire({
            title: "¿Eliminar reserva?",
            text: "Esta acción eliminará la reserva",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#dc3545"
        });

        if (resultado.isConfirmed) {
            setReservas((actuales) => actuales.filter((reserva) => reserva.id !== id));
            Swal.fire("Reserva eliminada");
        }
    };

    const columnas = [
        {
            name: "Código",
            selector: (fila) => fila.id,
            sortable: true
        },
        {
            name: "Habitación",
            selector: (fila) => fila.habitacion,
            cell: (fila) => (
                <div>
                    <div>{fila.habitacion}</div>
                    {!esAdmin && fila.habitacionTipo && (
                        <small className="text-muted">
                            {fila.habitacionTipo}
                            {Number.isFinite(Number(fila.habitacionPrecio))
                                ? ` · $${Number(fila.habitacionPrecio).toLocaleString("es-CO")} COP`
                                : ""}
                        </small>
                    )}
                </div>
            ),
            sortable: true
        },
        {
            name: "Entrada",
            selector: (fila) => fila.entrada,
            sortable: true
        },
        {
            name: "Salida",
            selector: (fila) => fila.salida,
            sortable: true
        },
        {
            name: "Estado",
            selector: (fila) => fila.estado,
            sortable: true
        },
        ...(esAdmin ? [{
            name: "Cliente",
            selector: (fila) => fila.clienteNombre || "Sin cliente asignado",
            sortable: true
        }] : []),
        {
            name: "Acciones",
            cell: (fila) => (
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-sm btn-outline-primary"
                        title="Editar"
                        onClick={() => abrirFormulario(fila)}
                    >
                        <i className="bi bi-pencil-square"></i>
                    </button>
                    <button
                        className="btn btn-sm btn-outline-danger"
                        title="Eliminar"
                        onClick={() => eliminarReserva(fila.id)}
                    >
                        <i className="bi bi-trash"></i>
                    </button>
                </div>
            )
        }
    ];

    const reservasDelUsuario = esAdmin
        ? reservas
        : reservas.filter((reserva) => reserva.clienteId === clienteId);
    const termino = busqueda.toLocaleLowerCase();
    const reservasFiltradas = reservasDelUsuario.filter((reserva) =>
        (reserva.habitacion || "").toLocaleLowerCase().includes(termino)
        || (reserva.estado || "").toLocaleLowerCase().includes(termino)
    );

    return (
        <div>
            <div className="d-flex justify-content-between mb-3 gap-2">
                <input
                    type="text"
                    className="form-control"
                    style={{ maxWidth: "280px" }}
                    placeholder="Buscar reserva..."
                    value={busqueda}
                    onChange={(evento) => setBusqueda(evento.target.value)}
                />
                <button
                    className="btn text-white"
                    style={{ backgroundColor: "#344c5c" }}
                    onClick={() => abrirFormulario()}
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    Nueva Reserva
                </button>
            </div>
            <DataTable
                columns={columnas}
                data={reservasFiltradas}
                pagination
                highlightOnHover
                responsive
                noDataComponent={esAdmin
                    ? "No se encontraron reservas"
                    : "Aún no tienes reservas. Crea una para comenzar tu historial."}
            />
        </div>
    );
}

export default TablaReservas;
