import Decimal from 'decimal.js';
import { obtenerServicioPorServicioUID } from '../../../../repositorio/servicios/obtenerServicioPorServicioUID.mjs';
const precisionDecimal = Number(process.env.PRECISION_DECIMAL)
Decimal.set({ precision: precisionDecimal });
export const constructorInstantaneaServicios = async (data) => {
    try {
        const estructura = data.estructura
        const servicios = data.servicios

        const contenedorEntidades = estructura.entidades

        if (!contenedorEntidades.hasOwnProperty("servicios")) {
            contenedorEntidades.servicios = {}
        }
        const serviciosEntidad = contenedorEntidades.servicios
        if (!serviciosEntidad.hasOwnProperty("global")) {
            serviciosEntidad.global = {}
        }
        const global = serviciosEntidad.global
        global.totales = {
            totalNeto: new Decimal("0.00"),
            totalDescuento: "0.00",
            totalFinal: "0.00",
            impuestosAplicados: "0.00"
        }
        if (!serviciosEntidad.hasOwnProperty("desglosePorServicios")) {
            serviciosEntidad.desglosePorServicios = []
        }
        const desglosePorServicios = serviciosEntidad.desglosePorServicios

        for (const servicio of servicios) {
            delete servicio.testingVI
            desglosePorServicios.push(servicio)

            const precioNetoServicio = new Decimal(servicio.contenedor.precio)
            global.totales.totalNeto = precioNetoServicio.plus(global.totales.totalNeto)
        }
        global.totales.totalNeto = global.totales.totalNeto.toFixed(2)
        global.totales.totalFinal = global.totales.totalNeto

    } catch (errorCapturado) {
        throw errorCapturado
    }
}
