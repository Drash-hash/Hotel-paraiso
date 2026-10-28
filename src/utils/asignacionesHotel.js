export const ASIGNACIONES_STORAGE_KEY = "asignacionesHotel";

export function obtenerAsignaciones() {
    const guardadas = localStorage.getItem(ASIGNACIONES_STORAGE_KEY);
    if (!guardadas) return [];

    const asignaciones = JSON.parse(guardadas);
    if (!Array.isArray(asignaciones)) {
        throw new Error("Las asignaciones guardadas no tienen un formato válido.");
    }

    return asignaciones;
}

export function guardarAsignaciones(asignaciones) {
    localStorage.setItem(ASIGNACIONES_STORAGE_KEY, JSON.stringify(asignaciones));
}

export function crearIdAsignacion() {
    if (globalThis.crypto?.randomUUID) {
        return globalThis.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function hayConflictoHorario(asignacion, asignaciones) {
    if (asignacion.estado === "Cancelada") return false;

    return asignaciones.some((otra) =>
        otra.id !== asignacion.id
        && otra.empleadoId === asignacion.empleadoId
        && otra.fecha === asignacion.fecha
        && otra.estado !== "Cancelada"
        && asignacion.horaInicio < otra.horaFin
        && asignacion.horaFin > otra.horaInicio
    );
}
