import Decimal from "decimal.js"
export const calcularTotal = (data) => {

    const tipoAplicacion = data.tipoAplicacion
    const descuentoTotal = new Decimal(data.descuentoTotal)
    const total = new Decimal(data.total)
    const estructura = {}

    if (tipoAplicacion === "porcentaje") {
        const descuentoFinal = total.mul(descuentoTotal).div(100);
        estructura.descuentoAplicado = descuentoFinal.toFixed(2)
        estructura.porcentaje = descuentoTotal
        const totalConDescuento = total.minus(descuentoTotal)
        if (totalConDescuento.isPositive()) {
            estructura.totalConDescuento = total.minus(descuentoTotal).toFixed(2)
        } else {
            estructura.totalConDescuento = "0.00"
        }

    } else if (tipoAplicacion === "cantidadFija") {
        estructura.descuentoAplicado = descuentoTotal.toFixed(2)
        const totalConDescuento = total.minus(descuentoTotal)
        if (totalConDescuento.isPositive()) {
            estructura.totalConDescuento = total.minus(descuentoTotal).toFixed(2)
        } else {
            estructura.totalConDescuento = "0.00"
        }
    }
    return estructura
}