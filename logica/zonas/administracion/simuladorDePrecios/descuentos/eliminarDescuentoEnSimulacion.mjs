import { campoDeTransaccion } from "../../../../repositorio/globales/campoDeTransaccion.mjs"
import { actualizarDesgloseFinacieroPorSimulacionUID } from "../../../../repositorio/simulacionDePrecios/desgloseFinanciero/actualizarDesgloseFinacieroPorSimulacionUID.mjs"
import { eliminarOfertaDeInstantaneaPorAdministradorPorOfertaUID } from "../../../../repositorio/simulacionDePrecios/desgloseFinanciero/eliminarOfertaDeInstantaneaPorAdministradorPorOfertaUID.mjs"
import { eliminarOfertaDeInstantaneaPorCondicionPorOfertaUID } from "../../../../repositorio/simulacionDePrecios/desgloseFinanciero/eliminarOfertaDeInstantaneaPorCondicionPorOfertaUID.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../../../repositorio/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs"
import { procesador } from "../../../../sistema/contenedorFinanciero/procesador.mjs"
import { generarDesgloseSimpleGuardarlo } from "../../../../sistema/simuladorDePrecios/generarDesgloseSimpleGuardarlo.mjs"
import { validarDataGlobalDeSimulacion } from "../../../../sistema/simuladorDePrecios/validarDataGlobalDeSimulacion.mjs"
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs"

export const eliminarDescuentoEnSimulacion = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
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
            devuelveUnTipoNumber: "si"
        })

        const ofertaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.ofertaUID,
            nombreCampo: "El identificador universal de la oferta (ofertaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        const posicion = validadoresCompartidos.tipos.cadena({
            string: entrada.body.posicion,
            nombreCampo: "El el campo de posicion",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
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
        await validarDataGlobalDeSimulacion(simulacionUID)
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
        await generarDesgloseSimpleGuardarlo(simulacionUID)
        await campoDeTransaccion("confirmar")

        const ok = {
            ok: "Se ha eliminado correctamente la oferta de la instantánea de la reserva",
            orgien: origen,
            ofertaUID: ofertaUID
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}