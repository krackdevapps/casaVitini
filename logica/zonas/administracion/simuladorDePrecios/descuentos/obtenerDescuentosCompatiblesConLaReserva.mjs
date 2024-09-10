import { campoDeTransaccion } from "../../../../repositorio/globales/campoDeTransaccion.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../../../repositorio/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs"
import { selecionarOfertasPorCondicion } from "../../../../sistema/ofertas/entidades/reserva/selecionarOfertasPorCondicion.mjs"
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs"

export const obtenerDescuentosCompatiblesConLaReserva = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })

        const simulacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.simulacionUID,
            nombreCampo: "El identificador universal de la simulacionUID (simulacionUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const simulacion = await obtenerSimulacionPorSimulacionUID(simulacionUID)
        const fechaEntrada = simulacion.fechaEntrada
        const fechaSalida = simulacion.fechaSalida
        const fechaCreacion = simulacion.fechaCreacion
        const apartamentosArray = simulacion.apartamentosArray

        const zonasArray = ["global", "privada"]
        const ofertasSelecionadasPorCondicion = await selecionarOfertasPorCondicion({
            fechaActual: fechaCreacion,
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            apartamentosArray,
            zonasArray
        })

        const ok = {
            ok: "Ofertas compatibles con la reserva",
            ofertasCompatibles: ofertasSelecionadasPorCondicion
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}