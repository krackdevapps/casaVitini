import { Mutex } from "async-mutex"
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs"
import { procesador } from "../../../../../shared/contenedorFinanciero/procesador.mjs"
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs"
import { obtenerApartamentosDeLaReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/apartamentos/obtenerApartamentosDeLaReservaPorReservaUID.mjs"
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs"
import { obtenerServicioPorServicioUID } from "../../../../../infraestructure/repository/servicios/obtenerServicioPorServicioUID.mjs"
import { eliminarServicioEnReservaPorServicioUID } from "../../../../../infraestructure/repository/reservas/servicios/eliminarServicioEnReservaPorServicioUID.mjs"
import { insertarServicioPorReservaUID } from "../../../../../infraestructure/repository/reservas/servicios/insertarServicioPorReservaUID.mjs"
import { actualizarDesgloseFinacieroDesdeHubsPorReservaUID } from "../../../../../infraestructure/repository/reservas/transacciones/desgloseFinanciero/actualizarDesgloseFinacieroDesdeHubsPorReservaUID.mjs"
import { obtenerServiciosPorReservaUID } from "../../../../../infraestructure/repository/reservas/servicios/obtenerServiciosPorReservaUID.mjs"

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
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
        })


        const palabra = validadoresCompartidos.tipos.cadena({
            string: entrada.body.palabra,
            nombreCampo: "El campo de la palabra reconstruir",
            filtro: "strictoSinEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
        })
        if (palabra !== "reconstruir") {
            const error = "Por favor, escribe correctamente la palabra, reconstruir en el campo de texto. Escribe la palabra, reconstruir en minúsculas y sin espacios internos. Esto está así para evitar falsos clics."
            throw new Error(error)
        }

        mutex.acquire()
        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const estadoReserva = reserva.estadoIDV
        const fechaCreacion_simple = reserva.fechaCreacion_simple
        if (estadoReserva === "cancelada") {
            const error = "La reserva está cancelada, no se pueden alterar los descuentos."
            throw new Error(error)
        }


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
            const opcionesSel = servicio.opcionesSel
            const descuentoTotalServicio = servicio.descuentoTotalServicio
            await eliminarServicioEnReservaPorServicioUID(servicioUID_enSimulacion)

            let servicioDelHub
            try {
                servicioDelHub = await obtenerServicioPorServicioUID(servicioUID)
            } catch (error) {
                continue
            }

            const nombreServicico = servicioDelHub.nombre
            const contenedorServicio = servicioDelHub.contenedor
            contenedorServicio.servicioUID = servicioDelHub.servicioUID
            await insertarServicioPorReservaUID({
                reservaUID,
                nombre: nombreServicico,
                contenedor: contenedorServicio,
                opcionesSel,
                descuentoTotalServicio
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