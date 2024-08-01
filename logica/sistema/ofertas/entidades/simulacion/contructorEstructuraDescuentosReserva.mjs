export const contructorEstructuraDescuentosReserva = (estructura) => {
    const entidades = estructura.contenedorOfertas.entidades
    if (!entidades.hasOwnProperty("reserva")) {
        entidades.reserva = {
            ofertas: {
                porCondicion: [],
                porAdministrador: []
            },
            desgloses: {
                porDia: {},
                porApartamento: {},
                porTotal: [],
            }
        }
    }
}