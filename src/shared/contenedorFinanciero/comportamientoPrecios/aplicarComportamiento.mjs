import Decimal from "decimal.js";

export const aplicarComportamiento = (data) => {
    try {
        const precioBase = new Decimal(data.precioBase)
        const simboloIDV = data.simboloIDV
        const cantidad = new Decimal(data.cantidad)
        let precioFinalPorNoche;

        if (simboloIDV === "aumentoPorcentaje") {
            const calculo = precioBase.times(cantidad.dividedBy(100));
            precioFinalPorNoche = precioBase.plus(calculo);
        } else if (simboloIDV === "aumentoCantidad") {
            precioFinalPorNoche = precioBase.plus(cantidad);
        } else if (simboloIDV === "reducirCantidad") {
            precioFinalPorNoche = precioBase.minus(cantidad);
        } else if (simboloIDV === "reducirPorcentaje") {
            const calculo = precioBase.times(cantidad.dividedBy(100));
            precioFinalPorNoche = precioBase.minus(calculo);
        } else if (simboloIDV === "precioEstablecido") {
            precioFinalPorNoche = new Decimal(cantidad);
        } else {
            const error = "No se reconoce el simboloIDV del comportamiento."
            throw new Error(error)
        }
        if (precioFinalPorNoche.isPositive()) {
            return precioFinalPorNoche.toFixed(2)
        }
        return "0.00";
    } catch (error) {
        throw error
    }
}