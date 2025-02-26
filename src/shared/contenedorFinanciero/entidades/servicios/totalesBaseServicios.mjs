import Decimal from 'decimal.js';
const precisionDecimal = Number(process.env.PRECISION_DECIMAL)
Decimal.set({ precision: precisionDecimal });
export const totalesBaseServicios000 = async (data) => {
    try {
        const estructura = data.estructura
        const serviciosSolicitados = data.serviciosSolicitados

        const contenedorEntidades = estructura.entidades

        if (!contenedorEntidades.hasOwnProperty("servicios")) {
            contenedorEntidades.servicios = {}
        }

        const serviciosEntidad = contenedorEntidades.servicios

        if (!serviciosEntidad.hasOwnProperty("global")) {
            serviciosEntidad.global = {}
        }
        const global = serviciosEntidad.global
        global.serviciosSolicitados = serviciosSolicitados
        global.numeroDeServicios = serviciosSolicitados.length.toString()
        global.totales = {
            totalNeto: "0.00",
            impuestosAplicados: "0.00",
            totalDescuento: "0.00",
            totalFinal: "0.00"
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
