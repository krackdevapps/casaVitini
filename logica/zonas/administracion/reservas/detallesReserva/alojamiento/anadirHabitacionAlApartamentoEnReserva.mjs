import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs";
import { estadoHabitacionesApartamento } from "../../../../../sistema/reservas/estadoHabitacionesApartamento.mjs";
import { validadoresCompartidos } from "../../../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { insertarHabitacionEnApartamento } from "../../../../../repositorio/reservas/apartamentos/insertarHabitacionEnApartamento.mjs";
import { obtenerHabitacionComoEntidadPorHabitacionIDV } from "../../../../../repositorio/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs";
import { obtenerHabitacionDelApartamentoPorApartamentoUIDPorHabitacionIDV } from "../../../../../repositorio/reservas/apartamentos/obtenerHabitacionDelApartamentoPorApartamentoUIDPorHabitacionIDV.mjs";

export const anadirHabitacionAlApartamentoEnReserva = async (entrada) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session,)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 3
        })
        await mutex.acquire();

        const apartamentoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoUID,
            nombreCampo: "El apartamentoUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no",
            devuelveUnTipoNumber: "si"

        })
        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const habitacionIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.habitacionIDV,
            nombreCampo: "La habitacion",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        if (reserva.estadoReservaIDV === "cancelada") {
            const error = "La reserva no se puede modificar porque está cancelada.";
            throw new Error(error);
        }
        await obtenerHabitacionDelApartamentoPorApartamentoUIDPorHabitacionIDV({
            habitacionIDV,
            apartamentoUID
        })


        const resuelveHabitaciones = await estadoHabitacionesApartamento({
            apartamentoUID,
            reservaUID
        });
        if (resuelveHabitaciones.length === 0) {
            const error = `El apartamento no tiene disponibles más habitaciones para ser añadidas basándonos en su configuración global.`;
            throw new Error(error);
        }

        if (!resuelveHabitaciones.includes(habitacionIDV)) {
            const error = `No existe el identificador visual de la habitación en esta configuración`;
            throw new Error(error);

        }

        const habitacion = await obtenerHabitacionComoEntidadPorHabitacionIDV({
            habitacionIDV,
            errorSi: "noExiste"
        })
        const habitacionUI = habitacion.habitacionUI
        const nuevaHabitacionDelApartamento = await insertarHabitacionEnApartamento({
            reservaUID: reservaUID,
            apartamentoUID: apartamentoUID,
            habitacionIDV: habitacionIDV,
            habitacionUI: habitacionUI
        })

        const ok = {
            ok: `Se ha añadido la ${habitacionUI} al apartamento`,
            nuevoUID: nuevaHabitacionDelApartamento.componenteUID
        }
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}