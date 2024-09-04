import Decimal from "decimal.js"

export const sumarTotales = (data) => {
    try {
        const estructura = data.estructura
        const totalesGlobal = estructura.global.totales

        if (estructura.entidades.hasOwnProperty("reserva")) {
            const reserva = estructura.entidades.reserva
            const totales = reserva.global.totales
            const totalNeto = totales.totalNeto

            const totalDescuentos = totales?.totalDescuento || "0.00"
            const impuestosAplicados = totales?.impuestosAplicados || "0.00"
            const totalNetoConDescuentos = totales?.totalNetoConDescuentos || totalNeto || "0.00"

            totalesGlobal.totalNeto = new Decimal(totalNeto).plus(totalesGlobal.totalNeto)

            if (!totalesGlobal.hasOwnProperty("totalNetoConDescuentos")) {
                totalesGlobal.totalNetoConDescuentos = "0.00"
            }

            totalesGlobal.totalNetoConDescuentos = new Decimal(totalNetoConDescuentos).plus(totalesGlobal.totalNetoConDescuentos)

            if (!totalesGlobal.hasOwnProperty("impuestosAplicados")) {
                totalesGlobal.impuestosAplicados = "0.00"
            }
            totalesGlobal.impuestosAplicados = new Decimal(impuestosAplicados).plus(totalesGlobal.impuestosAplicados)

            if (!totalesGlobal.hasOwnProperty("totalDescuentos")) {
                totalesGlobal.totalDescuentos = "0.00"
            }
            totalesGlobal.totalDescuentos = new Decimal(totalDescuentos).plus(totalesGlobal.totalDescuentos)
        }
        if (estructura.entidades.hasOwnProperty("servicios")) {
            const servicios = estructura.entidades.servicios
            const totales = servicios.global.totales
            const totalNeto = totales.totalNeto

            const totalDescuentos = totales?.totalDescuento || "0.00"
            const impuestosAplicados = totales?.impuestosAplicados || "0.00"
            const totalNetoConDescuentos = totales?.totalNetoConDescuentos || totalNeto || "0.00"

            totalesGlobal.totalNeto = new Decimal(totalNeto).plus(totalesGlobal.totalNeto)

            if (!totalesGlobal.hasOwnProperty("totalNetoConDescuentos")) {
                totalesGlobal.totalNetoConDescuentos = "0.00"
            }
            totalesGlobal.totalNetoConDescuentos = new Decimal(totalNetoConDescuentos).plus(totalesGlobal.totalNetoConDescuentos)

            if (!totalesGlobal.hasOwnProperty("impuestosAplicados")) {
                totalesGlobal.impuestosAplicados = "0.00"
            }
            totalesGlobal.impuestosAplicados = new Decimal(impuestosAplicados).plus(totalesGlobal.impuestosAplicados)

            if (!totalesGlobal.hasOwnProperty("totalDescuentos")) {
                totalesGlobal.totalDescuentos = "0.00"
            }
            totalesGlobal.totalDescuentos = new Decimal(totalDescuentos).plus(totalesGlobal.totalDescuentos)

        }


        // ojo con los impuestso globalex

        // redondeos
        const totalFinal = new Decimal(totalesGlobal.totalNetoConDescuentos).plus(totalesGlobal.impuestosAplicados).toFixed(2)
        totalesGlobal.totalNeto = new Decimal(totalesGlobal.totalNeto).toFixed(2)
        totalesGlobal.totalFinal = new Decimal(totalesGlobal.totalFinal).toFixed(2)
        totalesGlobal.impuestosAplicados = new Decimal(totalesGlobal.impuestosAplicados).toFixed(2)
        totalesGlobal.totalNetoConDescuentos = new Decimal(totalesGlobal.totalNetoConDescuentos).toFixed(2)
        totalesGlobal.totalDescuentos = new Decimal(totalesGlobal.totalDescuentos).toFixed(2)
        totalesGlobal.totalFinal = totalFinal



    } catch (error) {
        throw error
    }
}