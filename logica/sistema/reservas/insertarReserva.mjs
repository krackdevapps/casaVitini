import { DateTime } from 'luxon';
import { insertarTotalesReserva } from './insertarTotalesReserva.mjs';
import { validadoresCompartidos } from '../validadores/validadoresCompartidos.mjs';
import { obtenerNombreApartamentoUI } from '../../repositorio/arquitectura/obtenerNombreApartamentoUI.mjs';
import { insertarReservaAdministrativa } from '../../repositorio/reservas/reserva/insertarReservaAdministrativa.mjs';
import { Mutex } from 'async-mutex';
import { insertarClientePool } from '../../repositorio/clientes/insertarClientePool.mjs';
import { insertarApartamentoEnReserva } from '../../repositorio/reservas/apartamentos/insertarApartamentoEnReserva.mjs';
import { obtenerNombreHabitacionUI } from '../../repositorio/arquitectura/obtenerNombreHabitacionUI.mjs';
import { insertarHabitacionEnApartamento } from '../../repositorio/arquitectura/insertarHabitacionEnApartamento.mjs';
import { insertarCamaEnLaHabitacion } from '../../repositorio/reservas/apartamentos/insertarCamaEnLaHabitacion.mjs';

export const insertarReserva = async (reserva) => {
    const mutex = new Mutex()
    try {

        mutex.acquire()
        const fechaEntrada_Humano = reserva.entrada
        const fechaSalida_Humano = reserva.salida

        const fechaEntrada_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaEntrada_Humano)).fecha_ISO
        const fechaSalida_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaSalida_Humano)).fecha_ISO
        const estadoReserva = "confirmada"
        const estadoPago = "noPagado"
        const origen = "cliente"
        const fechaReserva = DateTime.utc().toISO()
        const alojamiento = reserva.alojamiento
        const titularReservaPool = reserva.datosTitular.nombreTitular
        const pasaporteTitularPool = reserva.datosTitular.pasaporteTitular
        const correoTitular = reserva.datosTitular.correoTitular
        const telefonoTitular = reserva.datosTitular.telefonoTitular
        await campoDeTransaccion("iniciar")

        const nuevaReserva = await insertarReservaAdministrativa({
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_ISO,
            estadoReserva: estadoReserva,
            origen: origen,
            fechaReserva: fechaReserva,
            estadoPago: estadoPago
        })
        const reservaUID = nuevaReserva.reservaUID;

        const nuevoClientePool = await insertarClientePool({
            titularReservaPool: titularReservaPool,
            pasaporteTitularPool: pasaporteTitularPool,
            correoTitular: correoTitular,
            telefonoTitular: telefonoTitular,
            reservaUID: reservaUID
        })
        for (const apartamentoConfiguracion in alojamiento) {
            const apartamentoIDV = apartamentoConfiguracion
            const habitaciones = alojamiento[apartamentoConfiguracion].habitaciones

            const apartamentoUI = await obtenerNombreApartamentoUI(apartamentoIDV)

            const nuevoApartamentoEnReserva = await insertarApartamentoEnReserva({
                reservaUID: reservaUID,
                apartamentoIDV: apartamentoIDV,
                apartamentoUI: apartamentoUI
            })
            const apartamentoUID = nuevoApartamentoEnReserva.uid

            for (const habitacionConfiguracion in habitaciones) {
                const habitacionIDV = habitacionConfiguracion
                const camaIDV = habitaciones[habitacionIDV].camaSeleccionada.camaIDV
                const pernoctantesPool = habitaciones[habitacionIDV].pernoctantes
                const habitacionUI = await obtenerNombreHabitacionUI(habitacionIDV)

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

        const transaccion = {
            tipoProcesadorPrecio: "objeto",
            reserva: reserva,
            reservaUID: reservaUID
        }
        await insertarTotalesReserva(transaccion)
        //resolverPrecio = resolverPrecio.ok
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "reserva insertada con exito",
            reservaUID: reservaUID
        }
        return ok
    } catch (error) {
        await campoDeTransaccion("cancelar")
        throw error;
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}
