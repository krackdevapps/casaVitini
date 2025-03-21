import { Mutex } from "async-mutex"
import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { obtenerOferatPorOfertaUID } from "../../../../infraestructure/repository/ofertas/obtenerOfertaPorOfertaUID.mjs"
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs"
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { obtenerDesgloseFinancieroPorSimulacionUIDPorOfertaUIDEnInstantaneaOfertasPorCondicion } from "../../../../infraestructure/repository/simulacionDePrecios/desgloseFinanciero/obtenerDesgloseFinancieroPorSimulacionUIDPorOfertaUIDEnInstantaneaOfertasPorCondicion.mjs"
import { actualizarAutorizacionOfertaPorReservaUIDPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/desgloseFinanciero/actualizarAutorizacionOfertaPorReservaUIDPorSimulacionUID.mjs"
import { controladorGeneracionDesgloseFinanciero } from "../../../../shared/simuladorDePrecios/controladorGeneracionDesgloseFinanciero.mjs"

export const actualizarAutorizacionDescuentoCompatible = async (entrada) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 3
        })

        const simulacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.simulacionUID,
            nombreCampo: "El identificador universal de la reserva (simulacionUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
        })
        const ofertaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.ofertaUID,
            nombreCampo: "El identificador universal de la oferta (ofertaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
        })

        const nuevaAutorizacion = entrada.body.nuevaAutorizacion
        if (nuevaAutorizacion !== "aceptada" && nuevaAutorizacion !== "rechazada") {
            const error = "El campo nuevaAutorizacion solo puede ser aceptada o rechazada"
            throw new Error(error)
        }
        mutex.acquire()
        await obtenerSimulacionPorSimulacionUID(simulacionUID)

        await campoDeTransaccion("iniciar")
        await obtenerOferatPorOfertaUID(ofertaUID)
        await obtenerDesgloseFinancieroPorSimulacionUIDPorOfertaUIDEnInstantaneaOfertasPorCondicion({
            simulacionUID,
            ofertaUID,
            errorSi: "noExiste"
        })
        await actualizarAutorizacionOfertaPorReservaUIDPorSimulacionUID({
            simulacionUID,
            ofertaUID,
            nuevaAutorizacion
        })
        const postProcesadoSimualacion = await controladorGeneracionDesgloseFinanciero(simulacionUID)

        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado el estado de autorización de la oferta en la reserva",
            autorizacion: nuevaAutorizacion,
            simulacionUID,
            ...postProcesadoSimualacion
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        mutex.release()
    }
}