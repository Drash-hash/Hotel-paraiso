export const EMPLEADOS_STORAGE_KEY = "empleadosHotel";
export const CARGOS_EMPLEADO = [
    "Recepción",
    "Limpieza",
    "Mantenimiento",
    "Cocina",
    "Administración"
];

export function normalizarDocumento(documento) {
    return documento.trim().replace(/[\s.-]/g, "").toLocaleLowerCase();
}

export function normalizarCorreoEmpleado(correo) {
    return correo.trim().toLocaleLowerCase();
}

export function empleadoEstaActivo(empleado) {
    return Boolean(empleado)
        && String(empleado.estado || "Activo").trim().toLocaleLowerCase() === "activo";
}

export function obtenerEmpleados() {
    const guardados = localStorage.getItem(EMPLEADOS_STORAGE_KEY);
    if (!guardados) return [];

    const empleados = JSON.parse(guardados);
    if (!Array.isArray(empleados)) {
        throw new Error("Los datos guardados de empleados no tienen un formato válido.");
    }

    return empleados;
}

export function guardarEmpleados(empleados) {
    localStorage.setItem(EMPLEADOS_STORAGE_KEY, JSON.stringify(empleados));
}

export function crearIdEmpleado() {
    if (globalThis.crypto?.randomUUID) {
        return globalThis.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}