export function hayCruceDeFechas(entrada, salida, reserva) {
    if (!reserva.entrada || !reserva.salida) return false;
    return reserva.entrada < salida && entrada < reserva.salida;
}

function obtenerDiaSiguiente(fecha) {
    const siguiente = new Date(`${fecha}T00:00:00Z`);
    siguiente.setUTCDate(siguiente.getUTCDate() + 1);
    return siguiente.toISOString().slice(0, 10);
}

export function estaHabitacionDisponible(habitacion, entrada, salida, reservas, reservaActualId) {
    if (!entrada || (salida && salida <= entrada)) return false;

    const fechaSalida = salida || obtenerDiaSiguiente(entrada);
    return !reservas.some((reserva) => {
        if (reserva.id === reservaActualId || reserva.estado?.toLocaleLowerCase() === "cancelada") {
            return false;
        }

        const mismaHabitacion = reserva.habitacionId !== undefined && reserva.habitacionId !== null
            ? String(reserva.habitacionId) === String(habitacion.id)
            : reserva.habitacion?.trim().toLocaleLowerCase()
                === habitacion.nombre?.trim().toLocaleLowerCase();

        return mismaHabitacion && hayCruceDeFechas(entrada, fechaSalida, reserva);
    });
}
