import { useState } from 'react'
import Swal from 'sweetalert2'
import DataTable from 'react-data-table-component'
import Sidebar from '../../components/Sidebar'
import './Dashboard.css'
import TablaReservas from '../../components/TablaReservas'
import TablaHabitaciones from '../../components/TablaHabitaciones'
import GestionHuespedes from '../../components/GestionHuespedes'
import TablaEmpleados from '../../components/TablaEmpleados'
import GestionAsignaciones from '../../components/GestionAsignaciones'
import { obtenerClientes } from '../../utils/clientesHotel'

const reservas = [
  { id: 'R-001', huesped: 'Laura Gómez', habitacion: 'Suite 201', fecha: '18/10/2026', estado: 'Confirmada' },
  { id: 'R-002', huesped: 'Carlos Ruiz', habitacion: 'Doble 105', fecha: '19/10/2026', estado: 'Pendiente' },
  { id: 'R-003', huesped: 'Ana Torres', habitacion: 'Suite 203', fecha: '20/10/2026', estado: 'Confirmada' },
]

const secciones = ['Resumen', 'Habitaciones', 'Reservas', 'Huéspedes', 'Empleados', 'Asignaciones']

function Dashboard({ onLogout }) {
  const [seccion, setSeccion] = useState('Resumen')
  const [reservasClientes, setReservasClientes] = useState(() => {
    const guardadas = localStorage.getItem("reservasHotel")
    return guardadas ? JSON.parse(guardadas) : []
  })
  const clientes = obtenerClientes()

  const confirmadas = reservasClientes.filter(
    reserva => reserva.estado === "Confirmada"
  ).length

  const pendientes = reservasClientes.filter(
    reserva => reserva.estado === "Pendiente"
  ).length

  const reservasResumen = [
    ...reservas.map((reserva) => ({
      id: reserva.id,
      huesped: reserva.huesped,
      habitacion: reserva.habitacion,
      ingreso: reserva.fecha,
      estado: reserva.estado
    })),
    ...reservasClientes.map((reserva) => ({
      id: `cliente-${reserva.id}`,
      huesped: reserva.clienteNombre || "Sin cliente asignado",
      habitacion: reserva.habitacion,
      ingreso: reserva.entrada || reserva.fecha || "—",
      estado: reserva.estado
    }))
  ]

  const columnasReservasRecientes = [
    { name: "Código", selector: (fila) => fila.id.replace("cliente-", ""), sortable: true },
    { name: "Huésped", selector: (fila) => fila.huesped, sortable: true },
    { name: "Habitación", selector: (fila) => fila.habitacion || "—", sortable: true },
    { name: "Ingreso", selector: (fila) => fila.ingreso, sortable: true },
    {
      name: "Estado",
      selector: (fila) => fila.estado,
      sortable: true,
      cell: (fila) => (
        <span className={`hp-status ${fila.estado === "Confirmada" ? "confirmed" : "pending"}`}>
          {fila.estado}
        </span>
      )
    }
  ]

  const confirmarSalida = () => {
    Swal.fire({
      title: "¿Deseas cerrar Sesión?",
      text: "Regresaras a la pagina principal",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Si, salir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#344c5c"
    }).then((resultado) => {
      if (resultado.isConfirmed) {
        onLogout()
      }
    })
  }

  return (
    <div className="hp-dashboard">
      <Sidebar
        titulo='Administración'
        opciones={secciones}
        seccion={seccion}
        cambiarSeccion={setSeccion}
        cerrarSesion={confirmarSalida}
      />

      <main className="hp-main">
        <header className="hp-header">
          <div>
            <p className="hp-eyebrow">PANEL ADMINISTRATIVO</p>
            <h1>{seccion === 'Resumen' ? 'Bienvenido al Hotel Paraíso' : seccion}</h1>
            <p className="hp-subtitle">{seccion === 'Resumen' ? 'Resumen general de la operación del hotel' : 'Consulta y Gestión de Reservas del Hotel'}</p>
          </div>
          <div className="hp-user"><span className="hp-avatar">A</span><span>Administrador</span></div>
        </header>

        {seccion === 'Resumen' ? (
          <>
            <section className="hp-stats" aria-label="Indicadores del hotel">
              {[
                { titulo: 'Habitaciones', valor: '24', detalle: 'Total registradas', icono: '▤' },
                { titulo: 'Reservas', valor: reservasClientes.length, detalle: 'Reservas activas', icono: '▣' },
                { titulo: 'Confirmadas', valor: confirmadas, detalle: 'Reservas confirmadas', icono: '✔️' },
                { titulo: 'Pendientes', valor: pendientes, detalle: 'Reservas pendientes', icono: '⏳' },
                { titulo: 'Huéspedes', valor: clientes.length, detalle: 'Huéspedes registrados', icono: '♙' },
                { titulo: 'Ocupación', valor: '75%', detalle: 'Ocupación estimada', icono: '◕' },
              ].map((dato) => (
                <article className="hp-stat" key={dato.titulo}>
                  <div className="hp-stat-top"><span>{dato.titulo}</span><span className="hp-stat-icon">{dato.icono}</span></div>
                  <strong>{dato.valor}</strong>
                  <small>{dato.detalle}</small>
                </article>
              ))}
            </section>

            <section className="hp-panel">
              <div className="hp-panel-header"><div><h2>Reservas recientes</h2><p>Últimos registros del hotel</p></div><span className="hp-demo-tag">Datos de ejemplo</span></div>
              <DataTable
                columns={columnasReservasRecientes}
                data={reservasResumen}
                keyField="id"
                pagination
                paginationPerPage={5}
                paginationRowsPerPageOptions={[5, 10, 15]}
                highlightOnHover
                striped
                responsive
                noDataComponent="No hay reservas para mostrar"
              />
            </section>
          </>
        ) : seccion === "Habitaciones" ? (
          <TablaHabitaciones />
        ) : seccion === "Reservas" ? (
          <TablaReservas onReservasChange={setReservasClientes} />
        ) : seccion === "Huéspedes" ? (
          <GestionHuespedes />
        ) : seccion === "Empleados" ? (
          <TablaEmpleados />
        ) : seccion === "Asignaciones" ? (
          <GestionAsignaciones />
        ) : (
          <section className="hp-panel hp-placeholder">
            <span className="hp-placeholder-icon">✦</span>
            <h2>Gestión de {seccion.toLowerCase()}</h2>
            <p>En las próximas clases construiremos las funcionalidades de este módulo.</p>
            <button type="button" onClick={() => setSeccion('Resumen')}>Volver al resumen</button>
          </section>
        )}
        <footer className="hp-footer">Hotel Paraíso · Proyecto académico React</footer>
      </main>
    </div>
  )
}

export default Dashboard