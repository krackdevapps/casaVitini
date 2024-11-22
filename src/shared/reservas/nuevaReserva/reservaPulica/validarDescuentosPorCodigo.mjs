import { DateTime } from "luxon";
import { selecionarOfertasPorCondicion } from "../../../ofertas/entidades/reserva/selecionarOfertasPorCondicion.mjs"
import { validadoresCompartidos } from "../../../validadores/validadoresCompartidos.mjs"
import { codigoZonaHoraria } from "../../../configuracion/codigoZonaHoraria.mjs";

export const validarDescuentosPorCodigo = async (data) => {
    try {
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const fechaActual = tiempoZH.toISODate();
        const zonasArray = data.zonasArray
        const contenedorCodigosDescuento = data.contenedorCodigosDescuento || []
        const fechaEntrada = data.fechaEntrada
        const fechaSalida = data.fechaSalida
        const apartamentosArray = data.apartamentosArray

        const codigoDescuentosArrayBASE64 = []
        contenedorCodigosDescuento.forEach((contenedor) => {
            const codigosUID = contenedor.codigosUID
            codigosUID.forEach((codigoUID) => {
                codigoDescuentosArrayBASE64.push(codigoUID)
            })
        })

        const ofertasPorCodigoEncontradas = []
        validadoresCompartidos.tipos.array({
            array: zonasArray,
            nombreCampo: "El array de zonasArray en el procesador de precios",
            filtro: "strictoIDV",
            sePermitenDuplicados: "no"
        })

        const zonasIDVControl = ["publica", "privada", "global"]
        if (zonasArray.length === 0) {
            const m = "No se han definidos las zonas en el array de aplicarOfertas"
            throw new Error(m)
        }
        const contieneSoloValoresPermitidos = zonasArray.every(zonaIDV => zonasIDVControl.includes(zonaIDV));
        if (!contieneSoloValoresPermitidos) {
            const error = "En el array de zonasArray hay identificadores visuales de zona no reconocidos. Los identificadores visuales reconocidos son pública, privada y global"
            throw new Error(error)
        }

        const insertarDescuentosPorCondicionPorCodigo = await selecionarOfertasPorCondicion({
            fechaActual,
            fechaEntrada,
            fechaSalida,
            apartamentosArray,
            zonasArray,
            codigoDescuentosArrayBASE64,
            ignorarCodigosDescuentos: "no"
        })
        ofertasPorCodigoEncontradas.push(...insertarDescuentosPorCondicionPorCodigo)

        const control = {
            codigosDescuentosSiReconocidos: [],
            codigosDescuentosNoReconocidos: []
        }

        ofertasPorCodigoEncontradas.forEach((contenedorOferta) => {
            const condiciones = contenedorOferta.oferta.condicionesArray
            const nombreOferta = contenedorOferta.oferta.nombreOferta
            const ofertaUID = contenedorOferta.oferta.ofertaUID

            const estructura = {
                ofertaUID: ofertaUID,
                codigosUID: [],
                descuentoUI: nombreOferta
            }

            condiciones.forEach((contenedorCondiciones) => {
                const tipoCondicion = contenedorCondiciones.tipoCondicion
                if (tipoCondicion === "porCodigoDescuento") {
                    const codigoDescuento = contenedorCondiciones.codigoDescuento
                    if (codigoDescuentosArrayBASE64.includes(codigoDescuento)) {
                        estructura.codigosUID.push(codigoDescuento)
                    }
                }
            })

            if (estructura.codigosUID.length > 0) {
                control.codigosDescuentosSiReconocidos.push(estructura)
            }
        })
        const contenedorUIDValidos = []
        control.codigosDescuentosSiReconocidos.forEach((contenedor) => {
            const codigosUID = contenedor.codigosUID
            codigosUID.forEach(codigo => {
                contenedorUIDValidos.push(codigo)
            })
        })
        contenedorCodigosDescuento.forEach((contenedor) => {
            const codigosUID = contenedor.codigosUID
            codigosUID.forEach((codigoUID) => {
                if (!contenedorUIDValidos.includes(codigoUID)) {
                    control.codigosDescuentosNoReconocidos.push(contenedor)
                }
            })
        })

        return control
    } catch (error) {
        throw error
    }
}