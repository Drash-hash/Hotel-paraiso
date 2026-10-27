import { useState } from "react"
import Swal from "sweetalert2"
import { estaHabitacionDisponible } from "../utils/disponibilidadHabitaciones"
import { obtenerHabitaciones, obtenerTipoHabitacion } from "../utils/habitacionesHotel"

function FormularioReserva({
    reserva,
    esAdmin = true,
    habitaciones = [],
    reservasExistentes = [],
    guardar,
    cancelar
}) {
    const [datos, setDatos] = useState(() => ({
        habitacion: esAdmin
            ? reserva?.habitacion || ""
            : String(reserva?.habitacionId
                ?? habitaciones.find((item) => item.nombre === reserva?.habitacion)?.id
                ?? ""),
        entrada: reserva?.entrada || "",
        salida: reserva?.salida || "",
        estado: reserva?.estado || "Pendiente"
    }))

    const reservasGuardadas = () => {
        const guardadas = localStorage.getItem("reservasHotel")
        if (!guardadas) return []

        const reservas = JSON.parse(guardadas)
        if (!Array.isArray(reservas)) {
            throw new Error("Los datos guardados de reservas no tienen un formato válido.")
        }
        return reservas
    }

    const habitacionesDisponibles = esAdmin
        ? []
        : habitaciones.filter((habitacion) =>
            habitacion.estado?.toLocaleLowerCase() === "disponible"
            && estaHabitacionDisponible(
                habitacion,
                datos.entrada,
                datos.salida,
                reservasExistentes,
                reserva?.id
            )
        )

    const manejarCambio = (e) => {
        setDatos({
            ...datos,
            [e.target.name]: e.target.value
        })
    }

    const manejarEnvio = async (e) => {
        e.preventDefault()

        if (!datos.habitacion || !datos.entrada || !datos.salida) {
            Swal.fire("Completa todos los datos")
            return
        }

        if (datos.salida <= datos.entrada) {
            Swal.fire(
                "Fechas incorrectas",
                "La fecha de salida debe ser posterior a la de entrada",
                "warning"
            )
            return
        }

        if (!esAdmin) {
            try {
                const habitacionesActualizadas = obtenerHabitaciones()
                const habitacionSeleccionada = habitacionesActualizadas.find(
                    (habitacion) => String(habitacion.id) === datos.habitacion
                    && habitacion.estado?.toLocaleLowerCase() === "disponible"
                )
                if (!habitacionSeleccionada) {
                    await Swal.fire(
                        "Habitación no disponible",
                        "Selecciona una habitación disponible para las fechas elegidas.",
                        "warning"
                    )
                    return
                }

                const reservas = reservasGuardadas()
                if (!estaHabitacionDisponible(
                    habitacionSeleccionada,
                    datos.entrada,
                    datos.salida,
                    reservas,
                    reserva?.id
                )) {
                    await Swal.fire(
                        "Fechas ocupadas",
                        "Esa habitación ya tiene una reserva que se cruza con las fechas seleccionadas.",
                        "warning"
                    )
                    return
                }

                guardar({
                    ...datos,
                    habitacion: habitacionSeleccionada.nombre,
                    habitacionId: habitacionSeleccionada.id,
                    habitacionTipo: obtenerTipoHabitacion(habitacionSeleccionada),
                    habitacionPrecio: Number(habitacionSeleccionada.precio),
                    estado: reserva?.estado || "Pendiente"
                })
                return
            } catch (error) {
                await Swal.fire(
                    "No se pudo validar la disponibilidad",
                    error.message || "Revisa los datos guardados e inténtalo nuevamente.",
                    "error"
                )
                return
            }
        }

        guardar({
            ...datos,
            estado: datos.estado
        })
    }

    return (
        <form onSubmit={manejarEnvio}>
            <div className="mb-3">
                <label className="form-label">Habitación</label>
                <select
                    className="form-select"
                    name="habitacion"
                    value={datos.habitacion}
                    onChange={manejarCambio}
                    disabled={!esAdmin && !datos.entrada}
                    required
                >
                    <option value="">Seleccione una habitación</option>
                    {esAdmin
                        ? <>
                            <option value="Suite 201">Suite 201</option>
                            <option value="Doble 105">Doble 105</option>
                            <option value="Sencilla 103">Sencilla 103</option>
                        </>
                        : habitacionesDisponibles.map((habitacion) => (
                            <option key={habitacion.id} value={String(habitacion.id)}>
                                {habitacion.nombre} · {obtenerTipoHabitacion(habitacion)} ·
                                {" "}${Number(habitacion.precio).toLocaleString("es-CO")} COP
                            </option>
                        ))}
                </select>
                {!esAdmin && datos.entrada && habitacionesDisponibles.length === 0 && (
                    <small className="text-muted d-block mt-2">
                        No hay habitaciones activas disponibles para esas fechas.
                    </small>
                )}
            </div>

            <div className="mb-3">
                <label className="form-label">Fecha de entrada</label>
                <input
                    type="date"
                    className="form-control"
                    name="entrada"
                    value={datos.entrada}
                    onChange={manejarCambio}
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Fecha de salida</label>
                <input
                    type="date"
                    className="form-control"
                    name="salida"
                    min={datos.entrada || undefined}
                    value={datos.salida}
                    onChange={manejarCambio}
                    required
                />

                {esAdmin && <div className="mb-3">
                    <label htmlFor="" className="form-label">Estado</label>
                    <select 
                    className="form-select"
                    name="estado"
                    value={datos.estado}
                    onChange={manejarCambio}
                    required>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Confirmada">Confirmada</option>
                        <option value="Cancelada">Cancelada</option>
                    </select>
                </div>}
            </div>

            <div className="d-flex justify-content-end gap-2">
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={cancelar}
                >
                    Cancelar
                </button>

                <button type="submit" className="btn btn-success">
                    <i className="bi bi-check-circle me-2"></i>
                    Guardar Reserva
                </button>
            </div>
        </form>
    )
}

export default FormularioReserva