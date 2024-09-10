import { DateTime } from "luxon";
import { obtenerOfertasPorRangoActualPorEstadoPorCodigoDescuentoArray } from "../../../../repositorio/ofertas/perfiles/obtenerOfertasPorRangoActualPorEstadoPorCodigoDescuentoArray.mjs"
import { codigoZonaHoraria } from "../../../configuracion/codigoZonaHoraria.mjs";

export const validarCodigosDescuentos = async (data) => {
    try {

        // Obsoleto
        return

        const codigosDescuento = data.codigosDescuento || []
        const codigosValidados = {
            codigosSiReconocidos: [],
            codigosNoReconocidos: []
        }
        if (codigosDescuento.length > 0) {

            const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
            const tiempoZH = DateTime.now().setZone(zonaHoraria);
            const fechaActual = tiempoZH.toISODate()

            const codigosDescuentosUID = codigosDescuento.map((contenedor) => {
                return contenedor.codigoUID
            })

            const ofertasActivas = await obtenerOfertasPorRangoActualPorEstadoPorCodigoDescuentoArray({
                fechaActual: fechaActual,
                estadoIDV: "activado",
                zonasArray: ["global", "publica"],
                entidadIDV: "reserva",
                codigosDescuentoArray: codigosDescuentosUID
            })
            if (ofertasActivas.length === 0) {
                codigosValidados.codigosNoReconocidos = codigosDescuento
            } else {
                ofertasActivas.forEach((oferta) => {
                    const nombreOferta = oferta.nombreOferta

                    const condiciones = oferta.condicionesArray
                    condiciones.forEach((condicion) => {
                        const tipoCondicion = condicion.tipoCondicion
                        if (tipoCondicion === "porCodigoDescuento") {
                            const codigoDescuento = condicion.codigoDescuento
                            codigosValidados.codigosSiReconocidos.push({
                                codigoUID: codigoDescuento,
                                descuentoUI: nombreOferta
                            })
                        }
                    })
                })
                const codigosUIDValidos = codigosValidados.codigosSiReconocidos.map((contenedor) => {
                    return contenedor.codigoUID
                })
                codigosDescuento.forEach((contenedor) => {
                    const codigoUID = contenedor.codigoUID
                    if (!codigosUIDValidos.includes(codigoUID)) {
                        const codigoUTF = Buffer.from(codigoUID, 'base64').toString()
                        contenedor.codigoUID = codigoUTF
                        codigosValidados.codigosNoReconocidos.push(contenedor)
                    }
                })
            }
        }
        return codigosValidados
    } catch (error) {
        throw error
    }
}