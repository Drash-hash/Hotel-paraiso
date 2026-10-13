import HabitacionCard from "./HabitacionCard";
import "./Habitaciones.css";
import estandar from "../assets/estandar.jpg";
import premium from "../assets/premium.jpg";
import suite from "../assets/suite.jpg";

const habitaciones = [
    {
        id: 1,
        nombre: "Habitacion Estandar",
        descripcion: "Cómoda y acogedora, ideal para una escapada corta.",
        precio: 2500000,
        imagen: estandar
    },
    {
        id: 2,
        nombre: "Habitacion Premium",
        descripcion: "Más espacio, mejor vista y servicios adicionales.",
        precio: 4000000,
        imagen: premium
    },
    {
        id: 3,
        nombre: "Suite",
        descripcion: "La experiencia más completa, con sala privada y vista panorámica.",
        precio: 6500000,
        imagen: suite
    },

];

function Habitaciones() {
    return (
        <section className="py-5 bg-light" id="habitaciones">
            <div className="container">
                <h2 className="text-center fw-bold mb-3">Nuestras habitaciones</h2>
                <p className="text-center text-secondary mb-5">
                    Descubre nuestras habitaciones
                </p>

                <div className="row">
                    {habitaciones.map((habitacion)=>(
                        <HabitacionCard 
                             key={habitacion.id}
                             {...habitacion}
                        />
                    ) )}
                </div>
            </div>
        </section>
    )
}

export default Habitaciones;