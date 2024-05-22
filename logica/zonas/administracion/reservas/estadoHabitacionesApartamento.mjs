import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { estadoHabitacionesApartamento as estadoHabitacionesApartamento_ } from "../../../sistema/reservas/estadoHabitacionesApartamento.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

import { obtenerHabitacionComoEntidadPorHabitacionIDV } from "../../../repositorio/arquitectura/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs";

export const estadoHabitacionesApartamento = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const reservaUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reservaUID",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const apartamentoUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.apartamento,
            nombreCampo: "El identificador universal apartamentoUID",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const transaccionInterna = {
            apartamento: apartamentoUID,
            reserva: reservaUID
        };
        const resuelveHabitaciones = await estadoHabitacionesApartamento_(transaccionInterna);
        if (resuelveHabitaciones.info) {
            return salida.json(resuelveHabitaciones);
        }
        const habitacionesResuelvas = resuelveHabitaciones.ok;
        if (habitacionesResuelvas.length === 0) {
            const ok = {
                ok: []
            };
            return ok
        }
        if (habitacionesResuelvas.length > 0) {
            const habitacionesProcesdas = [];
            for (const habitacionIDV of habitacionesResuelvas) {
                const habitacion = obtenerHabitacionComoEntidadPorHabitacionIDV(habitacionIDV)
                const habitaconUI = habitacion.habitacionUI;
                const habitacionResuelta = {
                    habitacionIDV: habitacionIDV,
                    habitacionUI: habitaconUI
                };
                habitacionesProcesdas.push(habitacionResuelta);
            }
            const ok = {
                ok: habitacionesProcesdas
            };
            return ok
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}