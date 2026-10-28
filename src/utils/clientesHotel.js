export const CLIENTES_STORAGE_KEY = "clientesHotel";

export function normalizarCorreo(correo) {
    return correo.trim().toLocaleLowerCase();
}

export function clienteEstaActivo(cliente) {
    if (!cliente) return false;
    return String(cliente.estado || "").trim().toLocaleLowerCase() !== "inactivo";
}

export function obtenerClientes() {
    const guardados = localStorage.getItem(CLIENTES_STORAGE_KEY);
    if (!guardados) return [];

    const clientes = JSON.parse(guardados);
    if (!Array.isArray(clientes)) {
        throw new Error("Los datos de clientes guardados no tienen un formato válido.");
    }

    return clientes;
}

export function guardarClientes(clientes) {
    localStorage.setItem(CLIENTES_STORAGE_KEY, JSON.stringify(clientes));
}

export function crearIdCliente() {
    if (globalThis.crypto?.randomUUID) {
        return globalThis.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
