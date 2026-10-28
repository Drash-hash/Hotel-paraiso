import { useState } from "react";
import Swal from "sweetalert2";
import {
  clienteEstaActivo,
  crearIdCliente,
  guardarClientes,
  normalizarCorreo,
  obtenerClientes
} from "../utils/clientesHotel";
import { empleadoEstaActivo, normalizarCorreoEmpleado, obtenerEmpleados } from "../utils/empleadosHotel";
 
function LoginModal({ mostrar, cerrar, onLogin }) {
  const [modo, setModo] = useState("login");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
 
  if (!mostrar) return null;
 
  const autenticar = async (e) => {
    e.preventDefault()

    try {
      const emailNormalizado = normalizarCorreo(correo);
      let clienteAutenticado = null;
      let empleadoAutenticado = null;

      if (modo === "registro") {
        if (password !== confirmarPassword) {
          await Swal.fire({
            icon: "warning",
            title: "Las contraseñas no coinciden",
            confirmButtonColor: "#344c5c"
          });
          return;
        }

        if (emailNormalizado === "admin@hotel.com" || emailNormalizado === "cliente@hotel.com") {
          await Swal.fire({
            icon: "error",
            title: "Correo no disponible",
            text: "Este correo está reservado para una cuenta del hotel.",
            confirmButtonColor: "#344c5c"
          });
          return;
        }

        const clientes = obtenerClientes();
        if (clientes.some((cliente) => normalizarCorreo(cliente.correo) === emailNormalizado)) {
          await Swal.fire({
            icon: "error",
            title: "Esta cuenta ya existe",
            text: "Inicia sesión con ese correo o utiliza otro para registrarte.",
            confirmButtonColor: "#344c5c"
          });
          return;
        }

        clienteAutenticado = {
          id: crearIdCliente(),
          nombreCompleto: nombreCompleto.trim(),
          correo: emailNormalizado,
          password,
          estado: "activo",
          telefono: "",
          ciudad: "",
          direccion: ""
        };
        guardarClientes([...clientes, clienteAutenticado]);
      } else if (emailNormalizado === "admin@hotel.com" && password === "12345") {
        await Swal.fire({
          icon: "success",
          title: "Bienvenid@",
          text: "Sesión iniciada correctamente",
          confirmButtonText: "Continuar",
          confirmButtonColor: "#344c5c"
        });
        cerrar();
        onLogin({ rol: "admin" });
        return;
      } else {
        const empleados = obtenerEmpleados();
        const empleadoPorCorreo = empleados.find(
          (empleado) => normalizarCorreoEmpleado(empleado.correo || "") === emailNormalizado
        );

        if (empleadoPorCorreo) {
          if (!empleadoEstaActivo(empleadoPorCorreo)) {
            await Swal.fire({
              icon: "error",
              title: "Cuenta inactiva",
              text: "Tu cuenta de empleado está inhabilitada. Contacta con administración.",
              confirmButtonColor: "#344c5c"
            });
            return;
          }
          empleadoAutenticado = empleadoPorCorreo.password === password ? empleadoPorCorreo : null;
        } else {
          const clientes = obtenerClientes();
          clienteAutenticado = clientes.find(
            (cliente) =>
              normalizarCorreo(cliente.correo) === emailNormalizado &&
              cliente.password === password &&
              clienteEstaActivo(cliente)
          );

          const cuentaExiste = clientes.some(
            (cliente) => normalizarCorreo(cliente.correo) === emailNormalizado
          );
          if (!clienteAutenticado && !cuentaExiste && emailNormalizado === "cliente@hotel.com" && password === "12345") {
            const perfilAnterior = localStorage.getItem("perfilClienteHotel");
            const datosPerfil = perfilAnterior ? JSON.parse(perfilAnterior) : {};
            clienteAutenticado = {
              id: "cliente-demo",
              nombreCompleto: datosPerfil.nombreCompleto || "",
              correo: "cliente@hotel.com",
              password: "12345",
              estado: "activo",
              telefono: datosPerfil.telefono || "",
              ciudad: datosPerfil.ciudad || "",
              direccion: datosPerfil.direccion || ""
            };
            guardarClientes([...clientes, clienteAutenticado]);
          }
        }

        if (!empleadoAutenticado && !clienteAutenticado) {
          await Swal.fire({
            icon: "error",
            title: "Acceso denegado",
            text: "El correo o la contraseña son incorrectos",
            confirmButtonText: "Intentar nuevamente",
            confirmButtonColor: "#344c5c"
          });
          return;
        }
      }

      await Swal.fire({
        icon: "success",
        title: modo === "registro" ? "Cuenta creada" : "Bienvenid@",
        text: modo === "registro"
          ? "Tu cuenta está lista. Ya puedes comenzar a reservar."
          : "Sesión iniciada correctamente",
        confirmButtonText: "Continuar",
        confirmButtonColor: "#344c5c"
      });
      cerrar();
      if (empleadoAutenticado) {
        onLogin({ rol: "empleado", empleado: empleadoAutenticado });
      } else {
        onLogin({ rol: "cliente", cliente: clienteAutenticado });
      }
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo completar la operación",
        text: error.message || "Ocurrió un error al acceder a los datos guardados.",
        confirmButtonColor: "#344c5c"
      });
    }
  };
 
  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 shadow">
          <div className="modal-header border-0">
            <h4 className="modal-title fw-bold">
              {modo === "login" ? "Bienvenido" : "Crea tu cuenta"}
            </h4>
            <button
              type="button"
              className="btn-close"
              onClick={cerrar}
            />
          </div>
 
          <div className="modal-body px-4 pb-4">
            <p className="text-muted">
              {modo === "login"
                ? "Ingresa a tu cuenta del hotel. El personal usa las credenciales creadas por administración."
                : "Regístrate para gestionar tus reservas"}
            </p>
 
            <form onSubmit={autenticar}>
              {modo === "registro" && (
                <div className="mb-3">
                  <label className="form-label" htmlFor="registro-nombre">Nombre completo</label>
                  <input
                    id="registro-nombre"
                    type="text"
                    className="form-control"
                    placeholder="Tu nombre"
                    value={nombreCompleto}
                    onChange={(e) => setNombreCompleto(e.target.value)}
                    autoComplete="name"
                    maxLength={80}
                    required
                  />
                </div>
              )}
              <div className="mb-3">
                <label className="form-label" htmlFor="acceso-correo">
                  Correo electrónico
                </label>
                <input
                  id="acceso-correo"
                  type="email"
                  className="form-control"
                  placeholder="correo@ejemplo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
 
              <div className="mb-4">
                <label className="form-label" htmlFor="acceso-password">
                  Contraseña
                </label>
                <input
                  id="acceso-password"
                  type="password"
                  className="form-control"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={modo === "registro" ? "new-password" : "current-password"}
                  minLength={modo === "registro" ? 6 : undefined}
                  required
                />
              </div>

              {modo === "registro" && (
                <div className="mb-4">
                  <label className="form-label" htmlFor="registro-confirmar-password">Confirmar contraseña</label>
                  <input
                    id="registro-confirmar-password"
                    type="password"
                    className="form-control"
                    placeholder="Repite tu contraseña"
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </div>
              )}
 
              <button
                type="submit"
                className="btn w-100 text-white py-2"
                style={{ backgroundColor: "#176b70" }}
              >
                {modo === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </button>
            </form>
 
            <p className="text-center mt-3 mb-0">
              {modo === "login" ? "¿No tienes cuenta?" : "¿Ya tienes una cuenta?"}{" "}
              <button
                type="button"
                className="btn btn-link p-0 align-baseline"
                onClick={() => {
                  setModo(modo === "login" ? "registro" : "login");
                  setPassword("");
                  setConfirmarPassword("");
                }}
              >
                {modo === "login" ? "Regístrate" : "Inicia sesión"}
              </button>
            </p>
            {modo === "registro" && (
              <p className="text-center text-muted small mt-2 mb-0">
                La contraseña debe tener al menos 6 caracteres.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
 
export default LoginModal;