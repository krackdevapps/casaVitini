import { Mutex } from "async-mutex"
import { campoDeTransaccion } from "../../../../../repositorio/globales/campoDeTransaccion.mjs"
import { obtenerReservaPorReservaUID } from "../../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs"
import { procesador } from "../../../../../sistema/contenedorFinanciero/procesador.mjs"
import { validadoresCompartidos } from "../../../../../sistema/validadores/validadoresCompartidos.mjs"
import { obtenerApartamentosDeLaReservaPorReservaUID } from "../../../../../repositorio/reservas/apartamentos/obtenerApartamentosDeLaReservaPorReservaUID.mjs"
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs"
import { obtenerServiciosPorReservaUID } from "../../../../../repositorio/servicios/obtenerServiciosPorReservaUID.mjs"
import { obtenerServicioPorServicioUID } from "../../../../../repositorio/servicios/obtenerServicioPorServicioUID.mjs"
import { eliminarServicioEnReservaPorServicioUID } from "../../../../../repositorio/reservas/servicios/eliminarServicioEnReservaPorServicioUID.mjs"
import { insertarServicioPorReservaUID } from "../../../../../repositorio/reservas/servicios/insertarServicioPorReservaUID.mjs"
import { actualizarDesgloseFinacieroDesdeHubsPorReservaUID } from "../../../../../repositorio/reservas/transacciones/desgloseFinanciero/actualizarDesgloseFinacieroDesdeHubsPorReservaUID.mjs"

export const reconstruirDesgloseDesdeHubs = async (entrada) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })
        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })


        const palabra = validadoresCompartidos.tipos.cadena({
            string: entrada.body.palabra,
            nombreCampo: "El campo de la palabra reconstruir",
            filtro: "strictoSinEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        if (palabra !== "reconstruir") {
            const error = "Por favor, escribe correctamente la palabra, reconstruir en el campo de texto. Escribe la palabra, reconstruir en minúsculas y sin espacios internos. Esto está así para evitar falsos clics."
            throw new Error(error)
        }

        mutex.acquire()
        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const estadoReserva = reserva.estadoIDV
        const fechaCreacion_simple= reserva.fechaCreacion_simple
        if (estadoReserva === "cancelada") {
            const error = "La reserva está cancelada, no se pueden alterar los descuentos."
            throw new Error(error)
        }

        // Informar si algun apartametnoIDV no exsite por modificiaones futura para decir que, no se puede reconstruir desde los hubs y que si se quiere hacer esto se debrai de crear una reserva nueva
        await campoDeTransaccion("iniciar")

        const fechaEntrada = reserva.fechaEntrada
        const fechaSalida = reserva.fechaSalida
        const apartamentosReserva = await obtenerApartamentosDeLaReservaPorReservaUID(reservaUID)
        const apartamentosArray = apartamentosReserva.map((detallesApartamento) => {
            return detallesApartamento.apartamentoIDV
        })

        try {
            for (const apartamentoIDV of apartamentosArray) {
                await obtenerConfiguracionPorApartamentoIDV({
                    apartamentoIDV,
                    errorSi: "noExiste"
                })
            }
        } catch (error) {
            const m = "No se puede reconstruir este desglose financiero de esta reserva desde los hubs de precios, porque hay apartamentos que ya no existen como configuración de alojamiento en el hub de configuraciones de alojamiento."
            throw new Error(m)
        }

        const serviciosInstantaneaReserva = await obtenerServiciosPorReservaUID(reservaUID)

        for (const servicio of serviciosInstantaneaReserva) {
            const servicioUID_enSimulacion = servicio.servicioUID
            const servicioUID = servicio.contenedor.servicioUID
            await eliminarServicioEnReservaPorServicioUID(servicioUID_enSimulacion)

            const servicioDelHub = await obtenerServicioPorServicioUID(servicioUID)
            const nombreServicico = servicioDelHub.nombre
            const contenedorServicio = servicioDelHub.contenedor
            contenedorServicio.servicioUID = servicioDelHub.servicioUID
            await insertarServicioPorReservaUID({
                reservaUID,
                nombre: nombreServicico,
                contenedor: contenedorServicio
            })
        }
        const desgloseFinanciero = await procesador({
            entidades: {
                reserva: {
                    origen: "externo",
                    fechaEntrada: fechaEntrada,
                    fechaSalida: fechaSalida,
                    fechaActual: fechaCreacion_simple,
                    apartamentosArray: apartamentosArray,
                    origenSobreControl: "reserva"
                },
                servicios: {
                    origen: "instantaneaServiciosEnReserva",
                    reservaUID: reservaUID
                },
            },
            capas: {
                ofertas: {},
                impuestos: {
                    origen: "hubImuestos"
                }
            }
        })

        await actualizarDesgloseFinacieroDesdeHubsPorReservaUID({
            desgloseFinanciero,
            reservaUID
        })
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha reconstruido el desglose desde las instantáneas"
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        mutex.release()
    }
}