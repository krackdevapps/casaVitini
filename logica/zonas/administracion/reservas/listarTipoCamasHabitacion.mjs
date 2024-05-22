import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerHabitacionesDelApartamentoPorApartamentoIDV } from "../../../repositorio/arquitectura/obtenerHabitacionesDelApartamentoPorApartamentoIDV.mjs";
import { obtenerHabitacionesDelApartamentoPorHabitacionIDV } from "../../../repositorio/arquitectura/obtenerHabitacionesDelApartamentoPorHabitacionIDV.mjs";
import { obtenerCamasDeLaHabitacionPorHabitacionUID } from "../../../repositorio/arquitectura/obtenerCamasDeLaHabitacionPorHabitacionUID.mjs";
import { obtenerCamaComoEntidadPorCamaIDV } from "../../../repositorio/arquitectura/obtenerCamaComoEntidadPorCamaIDV.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";

export const listarTipoCamasHabitacion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const habitacionIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.habitacionIDV,
            nombreCampo: "El habitacionIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const habitacionesDelApartamento = await obtenerHabitacionesDelApartamentoPorApartamentoIDV(apartamentoIDV)
        if (habitacionesDelApartamento.length === 0) {
            const error = `Ya no existe el apartamento como una configuración del apartamento. Si deseas volver a usar este apartamento, vuelve a crear la configuración del apartamento con el identificador visual: ${apartamentoIDV} y dentro de este apartamento crea una habitacion con el habitacionIDV: ${habitacionIDV}`;
            throw new Error(error);
        }
        const habitacion = await obtenerHabitacionesDelApartamentoPorHabitacionIDV({
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV
        })
        const nombreUIApartamento = obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV)
        if (!habitacion.componenteUID) {
            const error = `Dentro de la configuración de este apartamento ya no esta disponible esta habitación para seleccionar. Para recuperar esta habitación en la configuración de alojamiento, crea una habitación como entidad con el identificador visual ${habitacionIDV} y añádela a la configuración del apartamento con nombre ${nombreUIApartamento} e identificador visual ${apartamentoIDV}`;
            throw new Error(error);
        }
        const habitacionUID = habitacion.componenteUID

        const camasDeLaHabitacion = await obtenerCamasDeLaHabitacionPorHabitacionUID(habitacionUID)
        if (camasDeLaHabitacion.length === 0) {
            const error = "No existe ningun tipo de camas configuradas para esta habitacion";
            throw new Error(error);
        }
        const listaCamasDisponiblesPorHabitacion = [];
        for (const configuracionCama of camasDeLaHabitacion) {
            const camaIDV = configuracionCama.camaIDV;
            const cama = await obtenerCamaComoEntidadPorCamaIDV(camaIDV)
            const camaResuelta = {
                cama: cama.camaIDV,
                camaUI: cama.camaUI
            };
            listaCamasDisponiblesPorHabitacion.push(camaResuelta);
        }
        const ok = {
            camasDisponibles: listaCamasDisponiblesPorHabitacion
        }
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }
}