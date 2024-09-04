export const constructorEstructuraDescuentosReserva = (estructura) => {
    const contenedorOfertas = estructura.contenedorOfertas
    const entidades = contenedorOfertas.entidades

    contenedorOfertas.ofertas = {
        porCondicion: [],
        porAdministrador: []
    }

    if (!entidades.hasOwnProperty("reserva")) {
        entidades.reserva = {
            desgloses: {
                porDia: {},
                porApartamento: {},
                porTotal: [],
            }
        }
    }
}