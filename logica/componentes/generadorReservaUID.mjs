import { obtenerNumeroTotalReservas } from "../repositorio/reservas/reserva/obtenerNumeroTotalReservas.mjs"
import { obtenerTodasLasReservasPorReservaUID } from "../repositorio/reservas/reserva/obtenerTodasLasReservasPorReservaUID.mjs"
export const generadorReservaUID = async () => {
    try {
        const generarCodigoAleatorio = async () => {
            const totalReservas = await obtenerNumeroTotalReservas()
            const logitudNumeroTotalReservas = String(totalReservas).length < 6 ? 6 : String(totalReservas).length
            const limiteAnchoAleatorio = Number(logitudNumeroTotalReservas) + 1
            const rangoMinimo = Math.pow(10, limiteAnchoAleatorio - 1);
            const rangoMaximo = Math.pow(10, limiteAnchoAleatorio) - 1;
            const nuevoCodigo = Math.floor(Math.random() * (rangoMaximo - rangoMinimo + 1)) + rangoMinimo;
            return nuevoCodigo
        }
        let codigoFinal
        let estadoBusqueda
        do {
            const reservaUIDSinConfirmar = await generarCodigoAleatorio()
            const reservasEncontradas = await obtenerTodasLasReservasPorReservaUID(reservaUIDSinConfirmar)
            codigoFinal = reservaUIDSinConfirmar
            if (reservasEncontradas.length > 0) {
                estadoBusqueda = true
            } else if (reservasEncontradas.length === 0) {
                estadoBusqueda = false
            }
        } while (estadoBusqueda);
        return codigoFinal
    } catch (error) {
        throw error
    }
}