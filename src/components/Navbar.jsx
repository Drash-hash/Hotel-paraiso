import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark hotel-navbar sticky-top">
      <div className="container">
        <a href="#inicio" className="navbar-brand fw-bold">
          Hotel Paraíso
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#menu"
          aria-controls="menu"
          aria-expanded="false"
          aria-label="Abrir menú"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="menu">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a href="#inicio" className="nav-link">Inicio</a>
            </li>
            <li className="nav-item">
              <a href="#habitaciones" className="nav-link">Habitaciones</a>
            </li>
            <li className="nav-item">
              <a href="#servicios" className="nav-link">Servicios</a>
            </li>
            <li className="nav-item">
              <a href="#contacto" className="nav-link">Contacto</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;