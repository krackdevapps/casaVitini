import { procesador } from "../../sistema/contenedorFinanciero/procesador.mjs"
import { validarObjetoReserva } from "../../sistema/reservas/validarObjetoReserva.mjs"

export const precioReservaPublica = async (entrada) => {
    try {
        const reservaObjeto = entrada.body?.reserva
        await validarObjetoReserva({
            reservaObjeto: reservaObjeto,
            filtroTitular: "no",
            filtroHabitacionesCamas: "no"
        })

        const fechaEntradaReserva = reservaObjeto.fechaEntrada
        const fechaSalidaReserva = reservaObjeto.fechaSalida
        const alojamiento = reservaObjeto.alojamiento
        const apartamentosIDV = Object.keys(alojamiento)

        const desgloseFinanciero = await procesador({
            entidades: {
                reserva: {
                    tipoOperacion: "crearDesglose",
                    fechaEntrada: fechaEntradaReserva,
                    fechaSalida: fechaSalidaReserva,
                    apartamentosArray: apartamentosIDV,
                    capaOfertas: "si",
                    zonasArray: ["global", "publica"],
                    capaDescuentosPersonalizados: "no",
                    capaImpuestos: "si"

                }
            }
        })
        const ok = {
            ok: desgloseFinanciero
        }
        return ok
    } catch (error) {

        throw error
    }

}