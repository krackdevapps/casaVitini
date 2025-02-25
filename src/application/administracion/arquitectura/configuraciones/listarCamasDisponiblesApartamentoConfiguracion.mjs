import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerHabitacionDelApartamentoPorHabitacionUID } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerHabitacionDelApartamentoPorHabitacionUID.mjs";
import { obtenerCamasDeLaHabitacionPorHabitacionUID } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerCamasDeLaHabitacionPorHabitacionUID.mjs";
import { obtenerCamaComoEntidadPorTipoIDV } from "../../../../infraestructure/repository/arquitectura/entidades/cama/obtenerCamaComoEntidadPorTipoIDV.mjs";

export const listarCamasDisponiblesApartamentoConfiguracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const habitacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.habitacionUID,
            nombreCampo: "El habitacionUID",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        const detallesHabitacionDelApartamento = await obtenerHabitacionDelApartamentoPorHabitacionUID(habitacionUID)
        if (!detallesHabitacionDelApartamento?.componenteUID) {
            const ok = {
                ok: "No hay ninguna habitación con ese identificador disponible para este apartamento."
            };
            return ok
        }
        const camasDeLaHabitacion = await obtenerCamasDeLaHabitacionPorHabitacionUID(habitacionUID)
        const camasArrayLimpioEnHabitacion = [];
        for (const detalleHabitacion of camasDeLaHabitacion) {
            const camaIDV = detalleHabitacion.camaIDV;
            camasArrayLimpioEnHabitacion.push(camaIDV);
        }
        const todasLasCamasDelTipoCompartida = await obtenerCamaComoEntidadPorTipoIDV("compartida")
        const camasComoEntidadArrayLimpio = [];
        const camasComoEntidadEstructuraFinal = {};
        for (const detalleHabitacion of todasLasCamasDelTipoCompartida) {
            const camaUI = detalleHabitacion.camaUI;
            const camaIDV = detalleHabitacion.camaIDV;
            camasComoEntidadArrayLimpio.push(camaIDV);
            camasComoEntidadEstructuraFinal[camaIDV] = camaUI;
        }
        const camasDisponiblesNoInsertadas = camasComoEntidadArrayLimpio.filter(entidad => !camasArrayLimpioEnHabitacion.includes(entidad));
        const estructuraFinal = [];
        for (const camaDisponible of camasDisponiblesNoInsertadas) {
            if (camasComoEntidadEstructuraFinal[camaDisponible]) {
                const estructuraFinalObjeto = {
                    camaIDV: camaDisponible,
                    camaUI: camasComoEntidadEstructuraFinal[camaDisponible]
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