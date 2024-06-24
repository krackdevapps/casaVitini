import { DateTime } from 'luxon';
import { validadoresCompartidos } from '../validadores/validadoresCompartidos.mjs';
import { insertarReservaAdministrativa } from '../../repositorio/reservas/reserva/insertarReservaAdministrativa.mjs';
import { insertarTitularPool } from '../../repositorio/pool/insertarTitularPool.mjs';
import { insertarApartamentoEnReserva } from '../../repositorio/reservas/apartamentos/insertarApartamentoEnReserva.mjs';
import { insertarCamaEnLaHabitacion } from '../../repositorio/reservas/apartamentos/insertarCamaEnLaHabitacion.mjs';
import { obtenerHabitacionComoEntidadPorHabitacionIDV } from '../../repositorio/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs';
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from '../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs';
import { insertarHabitacionEnApartamento } from '../../repositorio/reservas/apartamentos/insertarHabitacionEnApartamento.mjs';
import { obtenerCamaComoEntidadPorCamaIDV } from '../../repositorio/arquitectura/entidades/cama/obtenerCamaComoEntidadPorCamaIDV.mjs';
import { procesador } from '../contenedorFinanciero/procesador.mjs';
import { insertarDesgloseFinacieroPorReservaUID } from '../../repositorio/reservas/transacciones/desgloseFinanciero/insertarDesgloseFinacieroPorReservaUID.mjs';

export const insertarReserva = async (reserva) => {
    try {

        const fechaEntrada_ISO = (await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: reserva.fechaEntrada,
            nombreCampo: "La fecha de entrada de la reserva a confirmar"
        }))
        const fechaSalida_ISO = (await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: reserva.fechaSalida,
            nombreCampo: "La fecha de entrada de la reserva a confirmar"
        }))
        const estadoReserva = "confirmada"
        const estadoPago = "noPagado"
        const origen = "cliente"
        const fechaCreacion = DateTime.utc().toISO()
        const alojamiento = reserva.alojamiento
        const datosTitular = reserva.datosTitular
        const titularReservaPool = datosTitular.nombreTitular
        const pasaporteTitularPool = datosTitular.pasaporteTitular
        const correoTitular = datosTitular.correoTitular
        const telefonoTitular = datosTitular.telefonoTitular

        const nuevaReserva = await insertarReservaAdministrativa({
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_ISO,
            estadoReserva: estadoReserva,
            origen: origen,
            fechaCreacion,
            estadoPago: estadoPago
        })
        const reservaUID = nuevaReserva.reservaUID;
        await insertarTitularPool({
            titularReservaPool: titularReservaPool,
            pasaporteTitularPool: pasaporteTitularPool,
            correoTitular: correoTitular,
            telefonoTitular: telefonoTitular,
            reservaUID: reservaUID
        })
        for (const apartamentoConfiguracion in alojamiento) {
            const apartamentoIDV = apartamentoConfiguracion
            const habitaciones = alojamiento[apartamentoConfiguracion].habitaciones

            const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV)
            const apartamentoUI = apartamento.apartamentoUI

            const nuevoApartamentoEnReserva = await insertarApartamentoEnReserva({
                reservaUID: reservaUID,
                apartamentoIDV: apartamentoIDV,
                apartamentoUI: apartamentoUI
            })
            const apartamentoUID = nuevoApartamentoEnReserva.componenteUID

            for (const habitacionConfiguracion in habitaciones) {
                const habitacionIDV = habitacionConfiguracion
                const camaIDV = habitaciones[habitacionIDV].camaSeleccionada.camaIDV
                const pernoctantesPool = habitaciones[habitacionIDV].pernoctantes
                const habitacion = await obtenerHabitacionComoEntidadPorHabitacionIDV(habitacionIDV)
                const habitacionUI = habitacion.habitacionUI

                const nuevoHabitacionEnElApartamento = await insertarHabitacionEnApartamento({
                    apartamentoUID: apartamentoUID,
                    habitacionIDV: habitacionIDV,
                    reservaUID: reservaUID,
                    habitacionUI: habitacionUI
                })
                const habitacionUID = nuevoHabitacionEnElApartamento.componenteUID
                const cama = await obtenerCamaComoEntidadPorCamaIDV(camaIDV)
                const camaUI = cama.camaUI

                const nuevaCamaEnLaHabitacion = await insertarCamaEnLaHabitacion({
                    habitacionUID: habitacionUID,
                    nuevaCamaIDV: camaIDV,
                    reservaUID: reservaUID,
                    camaUI: camaUI
                })
                const camaUID = nuevaCamaEnLaHabitacion.componenteUID
            }
        }
        const apartamentosArray = Object.keys(alojamiento);

        const desgloseFinanciero = await procesador({
            entidades: {
                reserva: {
                    tipoOperacion: "crearDesglose",
                    fechaEntrada: fechaEntrada_ISO,
                    fechaSalida: fechaSalida_ISO,
                    apartamentosArray: apartamentosArray,
                    capaOfertas: "si",
                    zonasArray: ["global", "publica"],
                    capaDescuentosPersonalizados: "no",
                    capaImpuestos: "si"

                }
            },
        })
        await insertarDesgloseFinacieroPorReservaUID({
            reservaUID,
            desgloseFinanciero
        })
        return nuevaReserva
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
