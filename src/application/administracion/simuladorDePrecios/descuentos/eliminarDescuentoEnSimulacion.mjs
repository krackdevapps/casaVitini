import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { eliminarOfertaDeInstantaneaPorAdministradorPorOfertaUID } from "../../../../infraestructure/repository/simulacionDePrecios/desgloseFinanciero/eliminarOfertaDeInstantaneaPorAdministradorPorOfertaUID.mjs"
import { eliminarOfertaDeInstantaneaPorCondicionPorOfertaUID } from "../../../../infraestructure/repository/simulacionDePrecios/desgloseFinanciero/eliminarOfertaDeInstantaneaPorCondicionPorOfertaUID.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"

import { controladorGeneracionDesgloseFinanciero } from "../../../../shared/simuladorDePrecios/controladorGeneracionDesgloseFinanciero.mjs"
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs"

export const eliminarDescuentoEnSimulacion = async (entrada) => {
    try {

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 4
        })

        const simulacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.simulacionUID,
            nombreCampo: "El identificador universal de la simulacionUID (simulacionUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })

        const ofertaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.ofertaUID,
            nombreCampo: "El identificador universal de la oferta (ofertaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })
        const posicion = validadoresCompartidos.tipos.cadena({
            string: entrada.body.posicion,
            nombreCampo: "El el campo de posicion",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })
        if (posicion === "0") {
            const m = "No puedes pasar una posición en 0, recuerda que aquí las posiciones empiezan a contar desde 1"
            throw new Errror(m)
        }

        const origen = validadoresCompartidos.tipos.cadena({
            string: entrada.body.origen,
            nombreCampo: "El campo origen en el controlador",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        await obtenerSimulacionPorSimulacionUID(simulacionUID)
        if (origen === "porAdministrador") {
            await eliminarOfertaDeInstantaneaPorAdministradorPorOfertaUID({
                simulacionUID,
                ofertaUID,
                posicion

            })
        } else if (origen === "porCondicion") {
            await eliminarOfertaDeInstantaneaPorCondicionPorOfertaUID({
                simulacionUID,
                ofertaUID,
                posicion

            })
        } else {
            const error = "El campo origen solo puede ser porAdminsitrador o porCondicion"
            throw new Error(error)
        }

        await campoDeTransaccion("iniciar")
        const postProcesadoSimualacion = await controladorGeneracionDesgloseFinanciero(simulacionUID)
        await campoDeTransaccion("confirmar")

        const ok = {
            ok: "Se ha eliminado correctamente la oferta de la instantánea de la reserva",
            orgien: origen,
            ofertaUID: ofertaUID,
            simulacionUID,
            ...postProcesadoSimualacion
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}