import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerInterruptorPorInterruptorIDV } from "../../../../infraestructure/repository/configuracion/interruptores/obtenerInterruptorPorInterruptorIDV.mjs";
import { actualizarEstadoDelInterruptor } from "../../../../infraestructure/repository/configuracion/interruptores/actualizarEstadoDelInterruptor.mjs";
import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";

export const actualizarEstado = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })
        const interruptorIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.interruptorIDV,
            nombreCampo: "El interruptorIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const estado = validadoresCompartidos.tipos.cadena({
            string: entrada.body.estado,
            nombreCampo: "El estado",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        validadoresCompartidos.filtros.estados(estado)

        await obtenerInterruptorPorInterruptorIDV(interruptorIDV)
        await campoDeTransaccion("iniciar")

        const dataActualizarInterruptor = {
            estado: estado,
            interruptorIDV: interruptorIDV
        }
        const nuevoEstado = await actualizarEstadoDelInterruptor(dataActualizarInterruptor)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado correctamente el interruptor",
            interrutorIDV: interruptorIDV,
            estado: nuevoEstado.estado
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }

}