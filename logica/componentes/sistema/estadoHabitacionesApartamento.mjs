import { conexion } from '../db.mjs';
const estadoHabitacionesApartamento = async (transacion) => {
    try {
        const reserva = transacion.reserva
        const apartamento = transacion.apartamento
        // compruebo que eso sea un apartamento dentro de la reserva
        const controlApartamento = `
        SELECT apartamento
        FROM "reservaApartamentos"
        WHERE uid = $1 AND reserva = $2;
        `
        const resuelveControlApartamento = await conexion.query(controlApartamento, [apartamento, reserva])
        const apartamentoIDV = resuelveControlApartamento.rows[0]?.apartamento
        if (!apartamentoIDV) {
            const error = "No existe el apartamento dentro de esta reserva"
            throw new Error(error)
        }
        const habitcionesApartamentoEnReserva = `
        SELECT habitacion
        FROM "reservaHabitaciones"
        WHERE apartamento = $1 AND reserva = $2;
        `
        const resuelveHabitcionesApartamentoEnReserva = await conexion.query(habitcionesApartamentoEnReserva, [apartamento, reserva])
        const habitacionesApartamentoReserva = resuelveHabitcionesApartamentoEnReserva.rows


        const controlConfiguracionApartametno = `
            SELECT "apartamentoIDV"
            FROM "configuracionApartamento"
            WHERE "apartamentoIDV" = $1;
            `
        const resuelveCcontrolConfiguracionApartametno = await conexion.query(controlConfiguracionApartametno, [apartamentoIDV])
        if (resuelveCcontrolConfiguracionApartametno.rows.length === 0) {
            const info = `Este apartamento ya no existe como configuracion de alojamiento, para recuperar esta configuración de alojamiento, por favor cree una nueva configuración de alojmaiento con el identificador visual: ${apartamentoIDV}`
            const respuesta = {
                info: info
            }
            return respuesta
        }
        const configuracionGlobalHabitacionesApartamento = `
            SELECT habitacion
            FROM "configuracionHabitacionesDelApartamento"
            WHERE apartamento = $1;
            `
        const resuelveconfiguracionGlobalHabitacionesApartamento = await conexion.query(configuracionGlobalHabitacionesApartamento, [apartamentoIDV])
        const configuracionHabitacionesApartamento = resuelveconfiguracionGlobalHabitacionesApartamento.rows
        if (configuracionHabitacionesApartamento.length === 0) {
            const info = `Este apartamento no tiene habitaciones disponbiles para seleccionar. Si desea tener disponibles habitaciones a este apartamento, añada habitaciones seleccionables en la configuracion de alojamiento con identificador visual ${apartamentoIDV}`
            const respuesta = {
                info: info
            }
            return respuesta
        }

        if (configuracionHabitacionesApartamento.length > 0) {
            const habitacionesDelApartamentoPreProcesado = configuracionHabitacionesApartamento
            const habitacionesDelApartamentoDeLaReservaPreProcesado = habitacionesApartamentoReserva
            const habitacionesDelApartamentoPostProcesado = []
            const habitacionesDelApartamentoDeLaReservaPostProcesado = []
            habitacionesDelApartamentoPreProcesado.map((habitacionPreProcesda) => {
                const habitacionPostProcesada = habitacionPreProcesda.habitacion
                habitacionesDelApartamentoPostProcesado.push(habitacionPostProcesada)
            })
            habitacionesDelApartamentoDeLaReservaPreProcesado.map((habitacionPreProcesda) => {
                const habitacionPostProcesada = habitacionPreProcesda.habitacion
                habitacionesDelApartamentoDeLaReservaPostProcesado.push(habitacionPostProcesada)
            })
            const habitaconesDipsoniblesDelapartamentoPostProcesado = habitacionesDelApartamentoPostProcesado.filter(habitacion => !habitacionesDelApartamentoDeLaReservaPostProcesado.includes(habitacion));

            const ok = {
                ok: habitaconesDipsoniblesDelapartamentoPostProcesado
            }
            return ok
        }


    } catch (error) {
        throw error;
    }
}
export {
    estadoHabitacionesApartamento
};