import { obtenerInterruptorPorInterruptorIDV } from '../../repositorio/configuracion/interruptores/obtenerInterruptorPorInterruptorIDV.mjs';
export const interruptor = async (interruptorIDV) => {
    try {
        const interruptor = await obtenerInterruptorPorInterruptorIDV(interruptorIDV)
        const estadoInterruptor = interruptor.estadoIDV
        if (estadoInterruptor === "activado") {
            return true
        } else {
            return false
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
