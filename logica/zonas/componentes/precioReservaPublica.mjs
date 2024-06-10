import { procesador } from "../../sistema/precios/procesador.mjs"
import { validarObjetoReserva } from "../../sistema/reservas/validarObjetoReserva.mjs"

export const precioReservaPublica = async (entrada, salida) => {
    try {
        const reservaObjeto = entrada.body?.reservaObjeto
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
            fechaEntrada: fechaEntradaReserva,
            fechaSalida: fechaSalidaReserva,
            apartamentosArray: apartamentosIDV,
            capaImpuestos: "si",
            capaOfertas: "si",
            zonasDeLaOferta: ["publica", "global"],
            capaDescuentosPersonalizados: "no",

        })
        const ok = {
            ok: desgloseFinanciero
        }
        salida.json(ok)
    } catch (error) {

        throw error
    }

}