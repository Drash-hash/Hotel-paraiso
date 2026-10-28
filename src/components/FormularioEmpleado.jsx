import { useState } from "react";
import { CARGOS_EMPLEADO } from "../utils/empleadosHotel";

function FormularioEmpleado({ empleado, guardar, cancelar }) {
    const [errorValidacion, setErrorValidacion] = useState("");
    const [formulario, setFormulario] = useState(() => ({
        documento: empleado?.documento || "",
        nombre: empleado?.nombre || "",
        correo: empleado?.correo || "",
        telefono: empleado?.telefono || "",
        cargo: empleado?.cargo || "",
        password: ""
    }));

    const manejarCambio = (evento) => {
        const { name, value } = evento.target;
        setFormulario((actual) => ({ ...actual, [name]: value }));
        setErrorValidacion("");
    };

    const manejarEnvio = (evento) => {
        evento.preventDefault();
        const datos = {
            documento: formulario.documento.trim(),
            nombre: formulario.nombre.trim(),
            correo: formulario.correo.trim(),
            telefono: formulario.telefono.trim(),
            cargo: formulario.cargo.trim(),
            ...(formulario.password ? { password: formulario.password } : {})
        };

        if (datos.documento.length < 4 || datos.nombre.length < 3 || !datos.correo || !datos.cargo) {
            setErrorValidacion("Completa todos los campos con información válida.");
            return;
        }

        if ((!empleado && (datos.password || "").length < 6) || (datos.password && datos.password.length < 6)) {
            setErrorValidacion("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        if (datos.telefono.replace(/\D/g, "").length < 7) {
            setErrorValidacion("El teléfono debe contener al menos 7 dígitos.");
            return;
        }

        guardar(datos);
    };

    return (
        <form onSubmit={manejarEnvio}>
            {errorValidacion && <div className="alert alert-danger" role="alert">{errorValidacion}</div>}
            <div className="row g-3">
                <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="empleado-documento">Documento</label>
                    <input
                        id="empleado-documento"
                        className="form-control"
                        name="documento"
                        value={formulario.documento}
                        onChange={manejarCambio}
                        minLength={4}
                        maxLength={20}
                        pattern="[A-Za-z0-9][A-Za-z0-9 .-]{2,19}"
                        title="Ingresa un documento de 4 a 20 caracteres alfanuméricos."
                        autoComplete="off"
                        required
                    />
                </div>
                <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="empleado-nombre">Nombre completo</label>
                    <input
                        id="empleado-nombre"
                        className="form-control"
                        name="nombre"
                        value={formulario.nombre}
                        onChange={manejarCambio}
                        minLength={3}
                        maxLength={80}
                        autoComplete="name"
                        required
                    />
                </div>
                <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="empleado-correo">Correo electrónico</label>
                    <input
                        id="empleado-correo"
                        className="form-control"
                        type="email"
                        name="correo"
                        value={formulario.correo}
                        onChange={manejarCambio}
                        maxLength={120}
                        autoComplete="email"
                        required
                    />
                </div>
                <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="empleado-telefono">Teléfono</label>
                    <input
                        id="empleado-telefono"
                        className="form-control"
                        type="tel"
                        name="telefono"
                        value={formulario.telefono}
                        onChange={manejarCambio}
                        minLength={7}
                        maxLength={20}
                        pattern="[0-9+() .-]{7,20}"
                        title="Ingresa un teléfono válido de 7 a 20 caracteres."
                        autoComplete="tel"
                        required
                    />
                </div>
                <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="empleado-cargo">Cargo</label>
                    <select
                        id="empleado-cargo"
                        className="form-select"
                        name="cargo"
                        value={formulario.cargo}
                        onChange={manejarCambio}
                        required
                    >
                        <option value="" disabled>Selecciona un cargo</option>
                        {CARGOS_EMPLEADO.map((cargo) => (
                            <option key={cargo} value={cargo}>{cargo}</option>
                        ))}
                    </select>
                </div>
                <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="empleado-password">
                        Contraseña {empleado && <span className="text-secondary">(opcional para cambiarla)</span>}
                    </label>
                    <input
                        id="empleado-password"
                        className="form-control"
                        type="password"
                        name="password"
                        value={formulario.password}
                        onChange={manejarCambio}
                        minLength={6}
                        autoComplete="new-password"
                        required={!empleado}
                    />
                    {!empleado && <small className="text-secondary">Mínimo 6 caracteres. El empleado usará su correo y esta contraseña.</small>}
                </div>
            </div>
            <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="btn btn-outline-secondary" onClick={cancelar}>
                    Cancelar
                </button>
                <button type="submit" className="btn btn-nueva-habitacion">
                    <i className="bi bi-check-circle me-2" aria-hidden="true"></i>
                    {empleado ? "Guardar cambios" : "Registrar empleado"}
                </button>
            </div>
        </form>
    );
}

export default FormularioEmpleado;