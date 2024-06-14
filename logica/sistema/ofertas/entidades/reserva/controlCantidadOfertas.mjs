import Decimal from "decimal.js"

export const controlCantidadOfertas = (data) => {
    const contenedorOfertas = data.contenedorOfertas
    const ofertaUID = data.ofertaUID
    const contenedor = data.contenedor

    if (!contenedorOfertas.hasOwnProperty(ofertaUID)) {
        contenedorOfertas[ofertaUID] = {
            cantidad: new Decimal("1"),
            contenedor
        }
    } else {
        const cantidad = contenedorOfertas[ofertaUID].cantidad
        contenedorOfertas[ofertaUID].cantidad = cantidad.plus("1")
    }

}
