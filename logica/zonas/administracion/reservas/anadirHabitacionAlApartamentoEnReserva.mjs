import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { estadoHabitacionesApartamento } from "../../../sistema/reservas/estadoHabitacionesApartamento.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerReservaPorReservaUID } from "../../../repositorio/reservas/obtenerReservaPorReservaUID.mjs";
import { insertarHabitacionEnApartamento } from "../../../repositorio/reservas/apartamentos/insertarHabitacionEnApartamento.mjs";
import { obtenerNombreHabitacionUI } from "../../../repositorio/arquitectura/obtenerNombreHabitacionUI.mjs";

export const anadirHabitacionAlApartamentoEnReserva = async (entrada, salida) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        await mutex.acquire();

        const apartamentoUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.apartamento,
            nombreCampo: "El apartamento",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        const reservaUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reservaUID (reservaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        const habitacionIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.habitacion,
            nombreCampo: "La habitacion",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        if (reserva.estadoReservaIDV === "cancelada") {
            const error = "La reserva no se puede modificar por que esta cancelada";
            throw new Error(error);
        }
        // Mira las habitaciones diponbiles para anadira este apartamento
        const transaccionInterna = {
            apartamento: apartamentoUID,
            reservaUID: reservaUID
        };
        const resuelveHabitaciones = await estadoHabitacionesApartamento(transaccionInterna);
        const habitacionesResuelvas = resuelveHabitaciones.ok;
        if (habitacionesResuelvas.length === 0) {
            const error = `El apartamento no tiene disponibles mas habitaciones para ser anadidas en base a su configuracion glboal`;
            throw new Error(error);
        }
        if (habitacionesResuelvas.length > 0) {
            for (const habitacionResuelta of habitacionesResuelvas) {
                if (habitacionIDV === habitacionResuelta) {
                    const habitacionUI = await obtenerNombreHabitacionUI(habitacionIDV)
                    const nuevaHabitacionDelApartamento = await insertarHabitacionEnApartamento({
                        reservaUID: reservaUID,
                        apartamentoUID: apartamentoUID,
                        habitacionIDV: habitacionIDV,
                        habitacionUI: habitacionUI
                    })
                    const ok = {
                        ok: `Se ha anadido la ${habitacionUI} al apartamento`,
                        nuevoUID: nuevaHabitacionDelApartamento.componenteUID
                    };
                    return salida.json(ok);
                }
            }
            const error = {
                error: `No se puede anadir esta habitacion, revisa que este bien escrito los datos y que el apartamento tenga habitaciones disponibles`
            };
            salida.json(error)
        }
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}