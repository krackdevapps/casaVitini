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

        const codigoDescuentosArrayBASE64 = contenedorCodigosDescuento.map((contenedor) => {
            return contenedor.codigoUID
        })


        const ofertasPorCodigoEncontradas = []
        validadoresCompartidos.tipos.array({
            array: zonasArray,
            nombreCampo: "El array de zonasArray en el procesador de precios",
            filtro: "soloCadenasIDV",
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

        const insertarDescuentosPorCondiconPorCoodigo = await selecionarOfertasPorCondicion({
            fechaActual,
            fechaEntrada,
            fechaSalida,
            apartamentosArray,
            zonasArray,
            codigoDescuentosArrayBASE64
        })
        ofertasPorCodigoEncontradas.push(...insertarDescuentosPorCondiconPorCoodigo)

        const control = {
            codigosDescuentosSiReconocidos: [],
            codigosDescuentosNoReconocidos: []
        }

        ofertasPorCodigoEncontradas.forEach((contenedorOferta) => {
            const condiciones = contenedorOferta.oferta.condicionesArray
            const nombreOferta = contenedorOferta.oferta.nombreOferta

            condiciones.forEach((contenedorCondiciones) => {
                const tipoCondicion = contenedorCondiciones.tipoCondicion
                if (tipoCondicion === "porCodigoDescuento") {
                    const codigoDescuento = contenedorCondiciones.codigoDescuento
                    control.codigosDescuentosSiReconocidos.push({
                        codigoUID: codigoDescuento,
                        descuentoUI: nombreOferta
                    })
                }
            })
        })

        const contenedorUIDValidos = control.codigosDescuentosSiReconocidos.map((contenedor) => {
            return contenedor.codigoUID
        })

        contenedorCodigosDescuento.forEach((contenedor) => {
            const codigoUID = contenedor.codigoUID
            if (!contenedorUIDValidos.includes(codigoUID)) {
                control.codigosDescuentosNoReconocidos.push(contenedor)
            }
        })

        return control
    } catch (error) {
        throw error
    }
}