import { useState } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import Home from "./pages/Home"
import Dashboard from "./pages/admin/Dashboard"
import ClienteDashboard from "./pages/cliente/ClienteDashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import { guardarClientes, obtenerClientes } from "./utils/clientesHotel"
 
function App() {
  const [sesion, setSesion] = useState(() => {
    const rol = localStorage.getItem("usuarioHotel")
    if (rol === "admin") return { rol }
    if (rol !== "cliente") return null

    const clienteId = localStorage.getItem("clienteActivoHotel")
    const cliente = obtenerClientes().find((item) => item.id === clienteId)
    return cliente ? { rol, cliente } : null
  })

  const navigate = useNavigate()
  
  const iniciarSesion = ({ rol, cliente }) => {
    localStorage.setItem("usuarioHotel", rol)
    if (rol === "cliente") {
      localStorage.setItem("clienteActivoHotel", cliente.id)
      setSesion({ rol, cliente })
    } else {
      localStorage.removeItem("clienteActivoHotel")
      setSesion({ rol })
    }
    navigate(rol === "admin" ? "/admin" : "/cliente")
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

  </Routes>
  )
}
 
export default App
 