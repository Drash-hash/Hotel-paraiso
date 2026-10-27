export const HABITACIONES_STORAGE_KEY = "habitacionesHotel";

const HABITACIONES_INICIALES = [
    { id: 1, nombre: "Habitación Estandar", tipo: "Estandar", precio: 150000, estado: "Disponible" },
    { id: 2, nombre: "Habitación Premium", tipo: "Premium", precio: 250000, estado: "Disponible" },
    { id: 3, nombre: "Habitación Suite", tipo: "Suite", precio: 500000, estado: "Mantenimiento" }
];

export function obtenerHabitaciones() {
    const guardadas = localStorage.getItem(HABITACIONES_STORAGE_KEY);
    if (guardadas === null) {
        guardarHabitaciones(HABITACIONES_INICIALES);
        return HABITACIONES_INICIALES;
    }

    const habitaciones = JSON.parse(guardadas);
    if (!Array.isArray(habitaciones)) {
        throw new Error("Los datos guardados de habitaciones no tienen un formato válido.");
    }

    return habitaciones;
}

export function guardarHabitaciones(habitaciones) {
    localStorage.setItem(HABITACIONES_STORAGE_KEY, JSON.stringify(habitaciones));
}

export function obtenerTipoHabitacion(habitacion) {
    if (habitacion.tipo?.trim()) return habitacion.tipo.trim();

    const nombre = habitacion.nombre || "";
    const tipoConocido = ["estandar", "estándar", "premium", "suite"].find((tipo) =>
        nombre.toLocaleLowerCase().includes(tipo)
    );
    return tipoConocido
        ? tipoConocido.charAt(0).toLocaleUpperCase() + tipoConocido.slice(1)
        : "Habitación";
}
