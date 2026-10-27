const RESERVAS_STORAGE_KEY = "reservasHotel";
const CONTADOR_RESERVAS_KEY = "contadorReservasHotel";
const CODIGO_RESERVA_PATTERN = /^RES-(\d+)$/i;

function obtenerMayorConsecutivo(reservas) {
    return reservas.reduce((mayor, reserva) => {
        const coincidencia = String(reserva.id).match(CODIGO_RESERVA_PATTERN);
        return coincidencia ? Math.max(mayor, Number(coincidencia[1])) : mayor;
    }, 0);
}

export function generarCodigoReserva(reservasActuales = []) {
    const reservasGuardadas = localStorage.getItem(RESERVAS_STORAGE_KEY);
    const reservasPersistidas = reservasGuardadas ? JSON.parse(reservasGuardadas) : [];
    if (!Array.isArray(reservasPersistidas)) {
        throw new Error("No se pudieron leer las reservas guardadas para asignar un código único.");
    }

    const contadorGuardado = localStorage.getItem(CONTADOR_RESERVAS_KEY);
    const siguienteGuardado = contadorGuardado === null ? 1 : Number(contadorGuardado);
    if (!Number.isSafeInteger(siguienteGuardado) || siguienteGuardado < 1) {
        throw new Error("El consecutivo de reservas guardado no es válido.");
    }

    const siguiente = Math.max(
        siguienteGuardado,
        obtenerMayorConsecutivo(reservasActuales) + 1,
        obtenerMayorConsecutivo(reservasPersistidas) + 1
    );
    if (!Number.isSafeInteger(siguiente)) {
        throw new Error("Se alcanzó el límite para generar códigos de reserva.");
    }

    localStorage.setItem(CONTADOR_RESERVAS_KEY, String(siguiente + 1));
    return `RES-${String(siguiente).padStart(3, "0")}`;
}
