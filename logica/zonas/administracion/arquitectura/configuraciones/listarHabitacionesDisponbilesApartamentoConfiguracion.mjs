import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

import { obtenerConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { obtenerHabitacionesDelApartamentoPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/obtenerHabitacionesDelApartamentoPorApartamentoIDV.mjs";
import { obtenerTodasLasHabitaciones } from "../../../../repositorio/arquitectura/entidades/habitacion/obtenerTodasLasHabitaciones.mjs";

export const listarHabitacionesDisponbilesApartamentoConfiguracion = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.control()

        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        const configuracionDelApartamento = await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })


        const habitacionesDelApartamento = await obtenerHabitacionesDelApartamentoPorApartamentoIDV(apartamentoIDV)
        const habitacionesEnConfiguracionArrayLimpio = [];
        for (const detalleHabitacion of habitacionesDelApartamento) {
            const habitacionIDV = detalleHabitacion.habitacionIDV;
            habitacionesEnConfiguracionArrayLimpio.push(habitacionIDV);
        }
        const todasLasHabitacione = await obtenerTodasLasHabitaciones()
        const habitacionComoEntidadArrayLimpio = [];
        const habitacionesComoEntidadEstructuraFinal = {};
        for (const detalleHabitacion of todasLasHabitacione) {
            const habitacionUI = detalleHabitacion.habitacionUI;
            const habitacionIDV = detalleHabitacion.habitacionIDV;
            habitacionComoEntidadArrayLimpio.push(habitacionIDV);
            habitacionesComoEntidadEstructuraFinal[habitacionIDV] = habitacionUI;
        }
        const habitacionesDisponiblesNoInsertadas = habitacionComoEntidadArrayLimpio.filter(entidad => !habitacionesEnConfiguracionArrayLimpio.includes(entidad));
        const estructuraFinal = [];
        for (const habitacionDisponible of habitacionesDisponiblesNoInsertadas) {
            if (habitacionesComoEntidadEstructuraFinal[habitacionDisponible]) {
                const estructuraFinalObjeto = {
                    habitacionIDV: habitacionDisponible,
                    habitacionUI: habitacionesComoEntidadEstructuraFinal[habitacionDisponible]
                };
                estructuraFinal.push(estructuraFinalObjeto);
            }
        }
        const ok = {
            ok: estructuraFinal
        };
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }
}