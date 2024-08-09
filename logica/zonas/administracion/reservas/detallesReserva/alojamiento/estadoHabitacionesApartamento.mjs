import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs";
import { estadoHabitacionesApartamento as estadoHabitacionesApartamento_ } from "../../../../../sistema/reservas/estadoHabitacionesApartamento.mjs";
import { validadoresCompartidos } from "../../../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerHabitacionComoEntidadPorHabitacionIDV } from "../../../../../repositorio/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs";

export const estadoHabitacionesApartamento = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const apartamentoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoUID,
            nombreCampo: "El identificador universal de la apartamentoUID (apartamentoUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })


        const resuelveHabitaciones = await estadoHabitacionesApartamento_({
            apartamentoUID: apartamentoUID,
            reservaUID: reservaUID
        })
        const ok = {
            ok: []
        }
        for (const habitacionIDV of resuelveHabitaciones) {
            const habitacion = await obtenerHabitacionComoEntidadPorHabitacionIDV({
                habitacionIDV,
                errorSi: "noExiste"
            })
            const habitaconUI = habitacion.habitacionUI;
            const habitacionResuelta = {
                habitacionIDV: habitacionIDV,
                habitacionUI: habitaconUI
            };
            ok.ok.push(habitacionResuelta);
        }

        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}