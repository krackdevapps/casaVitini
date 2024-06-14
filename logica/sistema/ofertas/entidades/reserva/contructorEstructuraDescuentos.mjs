export const constructorEstructuraDescuentos = (estructura) => {
    if (!estructura.hasOwnProperty("ofertasAplicadas")) {
        estructura.ofertasAplicadas = {
            ofertas: {
                porCondicion: {},
                porAdministrador: {}
            },
            porTotal: [],
            entidades: {
                reserva: {
                    porApartamento: {},
                    porDia: {},
                }
            }
        }
    }
}