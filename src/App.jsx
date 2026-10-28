import { useState } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import Home from "./pages/Home"
import Dashboard from "./pages/admin/Dashboard"
import ClienteDashboard from "./pages/cliente/ClienteDashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import { clienteEstaActivo, guardarClientes, obtenerClientes } from "./utils/clientesHotel"
import { empleadoEstaActivo, obtenerEmpleados } from "./utils/empleadosHotel"
import EmpleadoDashboard from "./pages/empleado/EmpleadoDashboard"
 
function App() {
  const [sesion, setSesion] = useState(() => {
    const rol = localStorage.getItem("usuarioHotel")
    if (rol === "admin") return { rol }

    const clienteId = localStorage.getItem("clienteActivoHotel")
    if (rol === "cliente") {
      const cliente = obtenerClientes().find((item) => item.id === clienteId)
      return clienteEstaActivo(cliente) ? { rol, cliente } : null
    }

    if (rol === "empleado") {
      const empleadoId = localStorage.getItem("empleadoActivoHotel")
      const empleado = obtenerEmpleados().find((item) => item.id === empleadoId)
      return empleadoEstaActivo(empleado) ? { rol, empleado } : null
    }
    return null
  })

  const navigate = useNavigate()
  
  const iniciarSesion = ({ rol, cliente, empleado }) => {
    localStorage.setItem("usuarioHotel", rol)
    if (rol === "cliente") {
      localStorage.setItem("clienteActivoHotel", cliente.id)
      localStorage.removeItem("empleadoActivoHotel")
      setSesion({ rol, cliente })
    } else if (rol === "empleado") {
      localStorage.setItem("empleadoActivoHotel", empleado.id)
      localStorage.removeItem("clienteActivoHotel")
      setSesion({ rol, empleado })
    } else {
      localStorage.removeItem("clienteActivoHotel")
      localStorage.removeItem("empleadoActivoHotel")
      setSesion({ rol })
    }
    navigate(rol === "admin" ? "/admin" : rol === "empleado" ? "/empleado" : "/cliente")
  }

  const guardarPerfilCliente = (datosActualizados) => {
    const clientes = obtenerClientes()
    const existeCliente = clientes.some((cliente) => cliente.id === datosActualizados.id)
    if (!existeCliente) {
      throw new Error("No se encontró la cuenta del cliente que inició sesión.")
    }

    guardarClientes(clientes.map((cliente) =>
      cliente.id === datosActualizados.id ? datosActualizados : cliente
    ))
    setSesion((actual) => ({ ...actual, cliente: datosActualizados }))
  }

  const cerrarSesion = () => {
    setSesion(null)
    localStorage.removeItem("usuarioHotel")
    localStorage.removeItem("clienteActivoHotel")
    localStorage.removeItem("empleadoActivoHotel")
    navigate("/")
  }
  return (
  <Routes>
    <Route
      path="/"
      element={
        <Home onLogin={iniciarSesion} />
      }
      />
      <Route
        path="/admin"
        element={
            <ProtectedRoute usuario={sesion?.rol} rolPermitido="admin">
            <Dashboard
            onLogout={cerrarSesion}
            />
            </ProtectedRoute>
        }
        />
        
        <Route 
        path="/cliente"
        element={
          <ProtectedRoute usuario={sesion?.rol} rolPermitido="cliente">
            <ClienteDashboard
              cliente={sesion?.cliente}
              onGuardarPerfil={guardarPerfilCliente}
              onLogout={cerrarSesion}
            />
          </ProtectedRoute>
        }
        />

        <Route
          path="/empleado"
          element={
            <ProtectedRoute usuario={sesion?.rol} rolPermitido="empleado">
              <EmpleadoDashboard
                empleado={sesion?.empleado}
                onLogout={cerrarSesion}
              />
            </ProtectedRoute>
          }
        />

  </Routes>
  )
}
 
export default App
 