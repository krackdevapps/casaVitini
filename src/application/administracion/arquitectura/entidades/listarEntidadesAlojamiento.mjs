
import { obtenerTodasLasCamas } from "../../../../infraestructure/repository/arquitectura/entidades/cama/obtenerTodasLasCama.mjs";
import { obtenerTodasLasHabitaciones } from "../../../../infraestructure/repository/arquitectura/entidades/habitacion/obtenerTodasLasHabitaciones.mjs";
import { obtenerTodasLosApartamentos } from "../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerTodasLosApartamentos.mjs";
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";


export const listarEntidadesAlojamiento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const estructuraFinal = {};
        const apartamentosComoEntidad = await obtenerTodasLosApartamentos()
        if (apartamentosComoEntidad.length > 0) {
            estructuraFinal.apartamentos = apartamentosComoEntidad;
        }
        const todasLasHabitaciones = await obtenerTodasLasHabitaciones()
        if (todasLasHabitaciones.length > 0) {
            estructuraFinal.habitaciones = todasLasHabitaciones;
        }
        const todasLasCamas = await obtenerTodasLasCamas()
        if (todasLasCamas.length > 0) {
            estructuraFinal.camas = todasLasCamas;
        }
        const ok = {
            ok: estructuraFinal
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}