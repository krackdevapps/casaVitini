import { conexion } from '../db.mjs';

const estadoHabitacionesApartamento = async (transacion) => {
    try {
        let reserva = transacion.reserva
        let apartamento = transacion.apartamento
        // compruebo que eso sea un apartamento dentro de la reserva
        const controlApartamento = `
        SELECT apartamento
        FROM "reservaApartamentos"
        WHERE uid = $1 AND reserva = $2;
        `
        let resuelveControlApartamento = await conexion.query(controlApartamento, [apartamento, reserva])
        let apartamentoIDV = resuelveControlApartamento.rows[0]?.apartamento
        if (!apartamentoIDV) {
            const error = "No existe el apartamento dentro de esta reserva"
            throw new Error(error)
        }

        const habitcionesApartamentoEnReserva = `
        SELECT habitacion
        FROM "reservaHabitaciones"
        WHERE apartamento = $1 AND reserva = $2;
        `
        let resuelveHabitcionesApartamentoEnReserva = await conexion.query(habitcionesApartamentoEnReserva, [apartamento, reserva])
        let habitacionesApartamentoReserva = resuelveHabitcionesApartamentoEnReserva.rows
            const configuracionGlobalHabitacionesApartamento = `
            SELECT habitacion
            FROM "configuracionHabitacionesDelApartamento"
            WHERE apartamento = $1;
            `
            let resuelveconfiguracionGlobalHabitacionesApartamento = await conexion.query(configuracionGlobalHabitacionesApartamento, [apartamentoIDV])
            let configuracionHabitacionesApartamento = resuelveconfiguracionGlobalHabitacionesApartamento.rows
            if (configuracionHabitacionesApartamento.length === 0) {
                const error = `El apartamento ${apartamentoIDV} no tiene habitaciones disponibles en la configuracion global de apartamento`
                throw new Error(error)
            }
            if (configuracionHabitacionesApartamento.length > 0) {
                let habitacionesDelApartamentoPreProcesado = configuracionHabitacionesApartamento
                let habitacionesDelApartamentoDeLaReservaPreProcesado = habitacionesApartamentoReserva

                let habitacionesDelApartamentoPostProcesado = []
                let habitacionesDelApartamentoDeLaReservaPostProcesado = []
                habitacionesDelApartamentoPreProcesado.map((habitacionPreProcesda) => {

                    let habitacionPostProcesada = habitacionPreProcesda.habitacion
                    habitacionesDelApartamentoPostProcesado.push(habitacionPostProcesada)
                })
                habitacionesDelApartamentoDeLaReservaPreProcesado.map((habitacionPreProcesda) => {
                    let habitacionPostProcesada = habitacionPreProcesda.habitacion
                    habitacionesDelApartamentoDeLaReservaPostProcesado.push(habitacionPostProcesada)
                })
                const habitaconesDipsoniblesDelapartamentoPostProcesado = habitacionesDelApartamentoPostProcesado.filter(habitacion => !habitacionesDelApartamentoDeLaReservaPostProcesado.includes(habitacion));
                
                let ok = {
                    "ok": habitaconesDipsoniblesDelapartamentoPostProcesado
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