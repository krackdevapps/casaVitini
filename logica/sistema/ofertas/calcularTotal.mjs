import Decimal from "decimal.js"
export const calcularTotal = (data) => {

    const tipoAplicacion = data.tipoAplicacion
    const descuentoTotal = data.descuentoTotal
    const total = new Decimal(data.total)
    const estructura = {}

    if (tipoAplicacion === "porcentaje") {
        const descuentoFinal = total.mul(descuentoTotal).div(100);
        estructura.descuentoAplicado = descuentoFinal.toFixed(2)
        estructura.porcentaje = descuentoTotal

    } else if (tipoAplicacion === "cantidadFija") {
        estructura.descuentoAplicado = descuentoTotal.toFixed(2)
    }
    return estructura
}