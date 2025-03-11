import { aplicarDescuento } from "../../ofertas/entidades/reserva/aplicarDescuento.mjs";
import { aplicarDescuentosPersonalizados } from "../../ofertas/entidades/reserva/aplicarDescuentosPersonalizados.mjs";
import { constructorEstructuraDescuentosReserva } from "../../ofertas/entidades/reserva/constructorEstructuraDescuentosReserva.mjs";
import { selecionarOfertasPorCondicion } from "../../ofertas/entidades/reserva/selecionarOfertasPorCondicion.mjs";
import { constructorEstructuraDescuentos } from "../../ofertas/global/constructorEstructuraDescuentos.mjs";
import { validadoresCompartidos } from "../../validadores/validadoresCompartidos.mjs";
import { obtenerOfertasPorEntidadPorOfertaUID } from "../../../infraestructure/repository/ofertas/perfiles/obtenerOfertasPorEntidadPorOfertaUID.mjs";
import { selectorPorCondicion } from "../../ofertas/entidades/reserva/selectorPorCondicion.mjs";

export const aplicarOfertas = async (data) => {
    try {
        const estructura = data.estructura
        const zonasArray = data.zonasArray
        const operacion = data.operacion
        const pipe = data.pipe
        const instantaneaOfertasPorCondicion = pipe.instantaneaOfertasPorCondicion
        const instantaneaOfertasPorAdministrador = pipe.instantaneaOfertasPorAdministrador



        const fechaActual = pipe.fechaActual
        const reserva = estructura.entidades?.reserva
        const global = reserva?.global
        const fechaEntrada = global?.rango?.fechaEntrada
        const fechaSalida = global?.rango?.fechaSalida
        const apartamentosArray = pipe.apartamentosArray

        const descuentosParaRechazar = validadoresCompartidos.tipos.array({
            array: data?.descuentosParaRechazar || [],
            nombreCampo: "descuentosParaRechazar en el procesador de precios",
            filtro: "strictoIDV",
            sePermitenDuplicados: "si",
            sePermiteArrayVacio: "si"
        })
        constructorEstructuraDescuentos(estructura)
        constructorEstructuraDescuentosReserva(estructura)

        if (operacion?.tipo === "insertarDescuentosPorCondicionPorCodigo") {
            const ignorarCodigosDescuentos = data.ignorarCodigosDescuentos
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
            const codigoDescuentosArrayBASE64 = data.codigoDescuentosArrayBASE64 || []
            const insertarDescuentosPorCondicionPorCodigo = await selecionarOfertasPorCondicion({
                estructura,
                fechaActual,
                fechaEntrada,
                fechaSalida,
                apartamentosArray,
                zonasArray,
                descuentosParaRechazar,
                codigoDescuentosArrayBASE64,
                ignorarCodigosDescuentos: ignorarCodigosDescuentos
            })

            instantaneaOfertasPorCondicion.push(...insertarDescuentosPorCondicionPorCodigo)
        } else if (operacion?.tipo === "insertarDescuentoPorAdministrador") {
            const ofertaUID = data?.ofertaUID
            if (!ofertaUID) {
                const m = "No llega ofertaUID en insertarDescuentoPorAdministrador"
                throw new Error(m)
            }
            await obtenerOfertasPorEntidadPorOfertaUID({
                ofertaUID,
                entidadIDV: "reserva"
            })

            const ofertasSelecionadasPorAdminstrador = await aplicarDescuentosPersonalizados({
                descuentosArray: [ofertaUID]
            })


            instantaneaOfertasPorAdministrador.push(...ofertasSelecionadasPorAdminstrador)

        } else if (operacion?.tipo === "insertarDescuentoCompatibleConReserva") {
            const ofertaUID = data.ofertaUID
            const codigoDescuentosArrayBASE64 = data.codigoDescuentosArrayBASE64 || []
            const ignorarCodigosDescuentos = data.ignorarCodigosDescuentos

            const oferta = await obtenerOfertasPorEntidadPorOfertaUID({
                ofertaUID,
                entidadIDV: "reserva"
            })
            const ofertaFormateada = await selectorPorCondicion({
                oferta,
                apartamentosArray,
                fechaActual_reserva: fechaActual,
                fechaEntrada_reserva: fechaEntrada,
                fechaSalida_reserva: fechaSalida,
                codigoDescuentosArrayBASE64: codigoDescuentosArrayBASE64,
                ignorarCodigosDescuentos: ignorarCodigosDescuentos
            })
            ofertaFormateada.autorizacion = "aceptada"
            if (ofertaFormateada.oferta.ofertaUID !== String(ofertaUID)) {
                const error = "La oferta seleccionada no es compatible condicionalmente con esta reserva. Si desea igualmente aplicar los descuentos de esta oferta, hazlo mediante el botón de insertar descuentos."
                throw new Error(error)
            }
            instantaneaOfertasPorCondicion.push(ofertaFormateada)
        }

        const ofertasSeleccionadas = [...instantaneaOfertasPorAdministrador, ...instantaneaOfertasPorCondicion]
        for (const oferta of ofertasSeleccionadas) {

            // Condicion por apartamentos especificos
            // 
        }


        await aplicarDescuento({
            origen: "porAdministrador",
            ofertasParaAplicarDescuentos: instantaneaOfertasPorAdministrador,
            estructura: estructura,
            fechaEntradaReserva_ISO: fechaEntrada,
            fechaSalidaReserva_ISO: fechaSalida
        })
        await aplicarDescuento({
            origen: "porCondicion",
            ofertasParaAplicarDescuentos: instantaneaOfertasPorCondicion,
            estructura: estructura,
            fechaEntradaReserva_ISO: fechaEntrada,
            fechaSalidaReserva_ISO: fechaSalida
        })

    } catch (error) {
        throw error
    }


}