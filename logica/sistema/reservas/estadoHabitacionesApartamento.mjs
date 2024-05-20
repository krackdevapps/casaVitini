import { obtenerConfiguracionPorApartamentoIDV } from '../../repositorio/arquitectura/obtenerConfiguracionPorApartamentoIDV.mjs';
import { obtenerHabitacionesDelApartamentoPorApartamentoIDV } from '../../repositorio/arquitectura/obtenerHabitacionesDelApartamentoPorApartamentoIDV.mjs';
import { obtenerHabitacionesDelApartamento } from '../../repositorio/reservas/apartamentos/obtenerHabitacionDelApartamento.mjs';

export const estadoHabitacionesApartamento = async (transacion) => {
    try {
        const reservaUID = transacion.reservaUID
        const apartamentoUID = transacion.apartamentoUID
        // compruebo que eso sea un apartamento dentro de la reserva

        const apartamentoDeLaReserva = await obtenerApartamentoDeLaReservaPorApartamentoUID({
            reservaUID: reservaUID,
            apartamentoUID: apartamentoUID
        })
        if (apartamentoDeLaReserva.length === 0) {
            const error = "No existe el apartamento dentro de esta reserva"
            throw new Error(error)
        }
        const apartamentoIDV = apartamentoDeLaReserva?.apartamento

        const habitacionesDelApartamento = await obtenerHabitacionesDelApartamento({
            reservaUID: reservaUID,
            apartamentoUID: apartamentoUID,
        })

        await obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)

        const configuracionDeHabitacionesDelApartamento = await obtenerHabitacionesDelApartamentoPorApartamentoIDV(apartamentoIDV)
        if (configuracionDeHabitacionesDelApartamento.length === 0) {
            const error = `Este apartamento no tiene habitaciones disponbiles para seleccionar. Si desea tener disponibles habitaciones a este apartamento, añada habitaciones seleccionables en la configuracion de alojamiento con identificador visual ${apartamentoIDV}`
            throw new Error(error)
        }

        const habitacionesDelApartamentoPostProcesado = []
        const habitacionesDelApartamentoDeLaReservaPostProcesado = []
        configuracionDeHabitacionesDelApartamento.forEach((habitacionPreProcesda) => {
            const habitacionPostProcesada = habitacionPreProcesda.habitacion
            habitacionesDelApartamentoPostProcesado.push(habitacionPostProcesada)
        })
        habitacionesDelApartamento.forEach((habitacionPreProcesda) => {
            const habitacionPostProcesada = habitacionPreProcesda.habitacion
            habitacionesDelApartamentoDeLaReservaPostProcesado.push(habitacionPostProcesada)
        })
        const habitaconesDipsoniblesDelapartamentoPostProcesado = habitacionesDelApartamentoPostProcesado.filter(habitacion => !habitacionesDelApartamentoDeLaReservaPostProcesado.includes(habitacion));

        const ok = {
            ok: habitaconesDipsoniblesDelapartamentoPostProcesado
        }
        return ok
    } catch (error) {
        throw error;
    }
}
