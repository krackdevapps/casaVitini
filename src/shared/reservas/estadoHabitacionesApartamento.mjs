import { obtenerConfiguracionPorApartamentoIDV } from '../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs';
import { obtenerHabitacionesDelApartamentoPorApartamentoIDV } from '../../infraestructure/repository/arquitectura/configuraciones/obtenerHabitacionesDelApartamentoPorApartamentoIDV.mjs';
import { obtenerApartamentoDeLaReservaPorApartamentoUID } from '../../infraestructure/repository/reservas/apartamentos/obtenerApartamentoDeLaReservaPorApartamentoUID.mjs';
import { obtenerHabitacionesDelApartamento } from '../../infraestructure/repository/reservas/apartamentos/obtenerHabitacionDelApartamento.mjs';

export const estadoHabitacionesApartamento = async (transacion) => {
    try {
        const reservaUID = transacion.reservaUID
        const apartamentoUID = transacion.apartamentoUID

        const apartamentoDeLaReserva = await obtenerApartamentoDeLaReservaPorApartamentoUID({
            reservaUID: reservaUID,
            apartamentoUID: apartamentoUID
        })

        if (!apartamentoDeLaReserva?.componenteUID) {
            const error = "No existe el apartamento dentro de esta reserva"
            throw new Error(error)
        }
        const apartamentoIDV = apartamentoDeLaReserva?.apartamentoIDV

        const habitacionesDelApartamento = await obtenerHabitacionesDelApartamento({
            reservaUID: reservaUID,
            apartamentoUID: apartamentoUID,
        })

        await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })
        const configuracionDeHabitacionesDelApartamento = await obtenerHabitacionesDelApartamentoPorApartamentoIDV(apartamentoIDV)

        if (configuracionDeHabitacionesDelApartamento.length === 0) {
            const error = `Este apartamento no tiene habitaciones disponibles para seleccionar. Si desea tener disponibles habitaciones a este apartamento, añada habitaciones seleccionables en la configuración de alojamiento con identificador visual ${apartamentoIDV}`
            throw new Error(error)
        }

        const habitacionesDelApartamentoPostProcesado = []
        const habitacionesDelApartamentoDeLaReservaPostProcesado = []
        configuracionDeHabitacionesDelApartamento.forEach((habitacionPreProcesda) => {
            const habitacionPostProcesada = habitacionPreProcesda.habitacionIDV
            habitacionesDelApartamentoPostProcesado.push(habitacionPostProcesada)
        })
        habitacionesDelApartamento.forEach((habitacionPreProcesda) => {
            const habitacionPostProcesada = habitacionPreProcesda.habitacionIDV
            habitacionesDelApartamentoDeLaReservaPostProcesado.push(habitacionPostProcesada)
        })
        const habitaconesDipsoniblesDelapartamentoPostProcesado = habitacionesDelApartamentoPostProcesado.filter(habitacion => !habitacionesDelApartamentoDeLaReservaPostProcesado.includes(habitacion));

        return habitaconesDipsoniblesDelapartamentoPostProcesado
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}
