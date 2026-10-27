import { useState } from "react";

function PerfilCliente({ cliente, onGuardarPerfil }) {
    const [perfil, setPerfil] = useState(cliente);
    const [datosEdicion, setDatosEdicion] = useState(cliente);
    const [editando, setEditando] = useState(false);
    const [mensaje, setMensaje] = useState("");

    const actualizarCampo = (evento) => {
        const { name, value } = evento.target;
        setDatosEdicion((actuales) => ({ ...actuales, [name]: value }));
    };

    const iniciarEdicion = () => {
        setDatosEdicion(perfil);
        setMensaje("");
        setEditando(true);
    };

    const cancelarEdicion = () => {
        setDatosEdicion(perfil);
        setMensaje("");
        setEditando(false);
    };

    const guardarPerfil = (evento) => {
        evento.preventDefault();

        try {
            const perfilActualizado = { ...cliente, ...datosEdicion };
            onGuardarPerfil(perfilActualizado);
            setPerfil(perfilActualizado);
            setMensaje("Tus cambios se guardaron correctamente.");
            setEditando(false);
        } catch {
            setMensaje("No se pudieron guardar los cambios. Revisa el almacenamiento disponible e inténtalo de nuevo.");
        }
    };

    const iniciales = perfil.nombreCompleto
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0].toLocaleUpperCase())
        .join("") || "HP";

    const campos = [
        { nombre: "nombreCompleto", etiqueta: "Nombre completo", icono: "bi-person", requerido: true },
        { nombre: "telefono", etiqueta: "Teléfono", icono: "bi-telephone", requerido: true, tipo: "tel" },
        { nombre: "ciudad", etiqueta: "Ciudad", icono: "bi-geo-alt" },
        { nombre: "direccion", etiqueta: "Dirección", icono: "bi-house" }
    ];

    return (
        <div className="hp-profile">
            <div className="hp-profile-hero">
                <div className="hp-profile-identity">
                    <div className="hp-profile-avatar" aria-hidden="true">{iniciales}</div>
                    <div className="hp-profile-identity-copy">
                        <span className="hp-profile-kicker">CUENTA DEL HOTEL</span>
                        <h3>{perfil.nombreCompleto || "Completa tu perfil"}</h3>
                        <p>Administra la información personal de tu cuenta.</p>
                    </div>
                </div>
                {!editando && (
                    <button className="hp-profile-edit" type="button" onClick={iniciarEdicion}>
                        <i className="bi bi-pencil-square" aria-hidden="true"></i>
                        Editar datos
                    </button>
                )}
            </div>

            {mensaje && (
                <div
                    className="hp-profile-message is-success"
                    role="status"
                    aria-live="polite"
                >
                    {mensaje}
                </div>
            )}

            {editando ? (
                <form className="hp-profile-form" onSubmit={guardarPerfil}>
                    <div className="hp-profile-section-heading">
                        <div>
                            <h3>Datos personales</h3>
                            <p>Actualiza tus datos y guarda los cambios cuando termines.</p>
                        </div>
                        <span className="hp-profile-required">* Obligatorio</span>
                    </div>

                    <div className="hp-profile-grid">
                        {campos.map((campo) => (
                            <div className="hp-profile-field" key={campo.nombre}>
                                <label htmlFor={`perfil-${campo.nombre}`}>
                                    {campo.etiqueta}{campo.requerido && <span aria-hidden="true"> *</span>}
                                </label>
                                <div className="hp-profile-input-wrap">
                                    <i className={`bi ${campo.icono}`} aria-hidden="true"></i>
                                    <input
                                        id={`perfil-${campo.nombre}`}
                                        className="form-control"
                                        type={campo.tipo || "text"}
                                        name={campo.nombre}
                                        value={datosEdicion[campo.nombre]}
                                        onChange={actualizarCampo}
                                        required={campo.requerido}
                                        maxLength={campo.nombre === "direccion" ? 120 : 80}
                                        autoComplete={campo.nombre === "nombreCompleto" ? "name" : campo.nombre === "telefono" ? "tel" : "off"}
                                    />
                                </div>
                            </div>
                        ))}
                        <div className="hp-profile-field hp-profile-field-email">
                            <label htmlFor="perfil-correo">Correo de acceso</label>
                            <div className="hp-profile-input-wrap">
                                <i className="bi bi-envelope" aria-hidden="true"></i>
                                <input
                                    id="perfil-correo"
                                    className="form-control"
                                    type="email"
                                    value={cliente.correo}
                                    readOnly
                                    aria-describedby="perfil-correo-ayuda"
                                />
                            </div>
                            <small id="perfil-correo-ayuda">Este correo identifica tu cuenta y no se puede editar.</small>
                        </div>
                    </div>

                    <div className="hp-profile-actions">
                        <button className="hp-profile-cancel" type="button" onClick={cancelarEdicion}>
                            Cancelar
                        </button>
                        <button className="hp-profile-save" type="submit">
                            <i className="bi bi-check2" aria-hidden="true"></i>
                            Guardar cambios
                        </button>
                    </div>
                </form>
            ) : (
                <div className="hp-profile-details">
                    <div className="hp-profile-section-heading">
                        <div>
                            <h3>Datos personales</h3>
                            <p>Tu información, disponible para consultar cuando la necesites.</p>
                        </div>
                    </div>
                    <div className="hp-profile-grid">
                        {campos.map((campo) => (
                            <div className="hp-profile-detail" key={campo.nombre}>
                                <span className="hp-profile-detail-icon" aria-hidden="true">
                                    <i className={`bi ${campo.icono}`}></i>
                                </span>
                                <div>
                                    <span className="hp-profile-label">{campo.etiqueta}</span>
                                    <strong>{perfil[campo.nombre] || "Aún no agregado"}</strong>
                                </div>
                            </div>
                        ))}
                        <div className="hp-profile-detail">
                            <span className="hp-profile-detail-icon" aria-hidden="true">
                                <i className="bi bi-envelope"></i>
                            </span>
                            <div>
                                <span className="hp-profile-label">Correo de acceso</span>
                                <strong>{cliente.correo}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PerfilCliente;
