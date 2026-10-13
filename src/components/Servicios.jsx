import piscina from '../assets/piscina.jpg';
import restaurante from '../assets/restaurante.jpg';
import lobby from '../assets/lobby.jpg';
import './Servicios.css';

function Servicios() {

    const servicios =[
        {
            nombre: "Piscina",
            imagen: piscina,
            descripcion: "Relájate bajo el sol en nuestra piscina con vista al jardín."
        },
        {
            nombre: "Restaurante",
            imagen: restaurante,
            descripcion: "Disfruta de platos locales e internacionales preparados al momento."
        },
        {
            nombre: "Lobby",
            imagen: lobby,
            descripcion: "Un espacio acogedor para recibirte y atenderte las 24 horas."
        }
    ];

    return(
        <section className="py-5 bg-light" id="servicios">
            <div className="container">
                <div className="text-center mb-5">
                    <h2 className="fw-bold">Nuestros servicios</h2>
                    <p className="text-secondary">
                        Disfruta de los servicios
                    </p>
                </div>
              <div className="row g-4">
                {servicios.map((servicio) => (
                     <div className='col-md-4' key={servicio.nombre}>
                        <div className='card h-100 border-0 shadow-sm'>
                            <img src={servicio.imagen} alt={servicio.nombre} className='card-img-top servicio-img'/>
                     
                        <div className='card-body text-center'>
                            <h4 className='fw-bold'>{servicio.nombre}</h4>
                            <p className='text-secondary'>{servicio.descripcion}</p>
                            </div>
                        </div>
                        </div>
                ))}
   </div>
   </div>
   </section> 
    )
}

export default Servicios;