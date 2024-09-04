import { procesador } from "../../sistema/contenedorFinanciero/procesador.mjs"
import { validarObjetoReserva } from "../../sistema/reservas/validarObjetoReserva.mjs"
import { validarServiciosPubicos } from "../../sistema/servicios/validarServiciosPublicos.mjs"

export const precioReservaPublica = async (entrada) => {
    try {
        const reservaObjeto = entrada.body?.reserva

        const numeroLlaves = Object.keys(entrada.body).length
        if (numeroLlaves > 2) {
            const m = "Solo se esperas dos llaves en el json"
            throw new Error(m)
        }

        await validarObjetoReserva({
            reservaObjeto: reservaObjeto,
            filtroTitular: "no",
            filtroHabitacionesCamas: "no"
        })

        const serviciosUIDSolicitados = entrada.body.reserva?.servicios || []
        if (serviciosUIDSolicitados.length > 0) {
            await validarServiciosPubicos(serviciosUIDSolicitados)
        }
        const fechaEntradaReserva = reservaObjeto.fechaEntrada
        const fechaSalidaReserva = reservaObjeto.fechaSalida
        const alojamiento = reservaObjeto.alojamiento
        const apartamentosIDV = Object.keys(alojamiento)
        const codigoDescuentosArrayBASE64 = reservaObjeto.codigosDescuento
  
        const desgloseFinanciero = await procesador({
            entidades: {
                reserva: {
                    origen: "externo",
                    fechaEntrada: fechaEntradaReserva,
                    fechaSalida: fechaSalidaReserva,
                    apartamentosArray: apartamentosIDV,
                },
                servicios: {
                    origen: "hubServicios",
                    serviciosUIDSolicitados
                },
            },
            capas: {
                ofertas: {
                    zonasArray: ["global", "publica"],
                    configuracion: {
                        descuentosPersonalizados: "no",
                        descuentosArray: []
                    },
                    operacion: {
                        tipo: "insertarDescuentosPorCondiconPorCoodigo",
                        codigoDescuentosArrayBASE64: codigoDescuentosArrayBASE64
                    }
                },
                impuestos: {
                    origen: "hubImuestos"
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