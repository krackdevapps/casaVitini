
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";

import { obtenerConfiguracionPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { obtenerHabitacionesDelApartamentoPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerHabitacionesDelApartamentoPorApartamentoIDV.mjs";
import { obtenerTodasLasHabitaciones } from "../../../../infraestructure/repository/arquitectura/entidades/habitacion/obtenerTodasLasHabitaciones.mjs";

export const listarHabitacionesDisponiblesApartamentoConfiguracion = async (entrada) => {
    try {

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
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