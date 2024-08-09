import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerHabitacionesDelApartamentoPorApartamentoIDV } from "../../../../../repositorio/arquitectura/configuraciones/obtenerHabitacionesDelApartamentoPorApartamentoIDV.mjs";
import { obtenerHabitacionDelApartamentoPorHabitacionIDV } from "../../../../../repositorio/arquitectura/configuraciones/obtenerHabitacionDelApartamentoPorHabitacionIDV.mjs";
import { obtenerCamasDeLaHabitacionPorHabitacionUID } from "../../../../../repositorio/arquitectura/configuraciones/obtenerCamasDeLaHabitacionPorHabitacionUID.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerCamaComoEntidadPorCamaIDVPorTipoIDV } from "../../../../../repositorio/arquitectura/entidades/cama/obtenerCamaComoEntidadPorCamaIDVPorTipoIDV.mjs";
import { obtenerTodasLasCamaPorTipoIDV } from "../../../../../repositorio/arquitectura/entidades/cama/obtenerTodasLasCamaPorTipoIDV.mjs";

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
            const error = `Ya no existe el apartamento como una configuración del apartamento. Si deseas volver a usar este apartamento, vuelve a crear la configuración del apartamento con el identificador visual: ${apartamentoIDV} y dentro de este apartamento crea una habitación con el habitacionIDV: ${habitacionIDV}`;
            throw new Error(error);
        }
        const habitacion = await obtenerHabitacionDelApartamentoPorHabitacionIDV({
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV,
            errorSi: "noExiste"
        })
        const nombreUIApartamento = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })).apartamentoUI
        if (!habitacion.componenteUID) {
            const error = `Dentro de la configuración de este apartamento ya no está disponible esta habitación para seleccionar. Para recuperar esta habitación en la configuración de alojamiento, crea una habitación como entidad con el identificador visual ${habitacionIDV} y añádela a la configuración del apartamento con nombre ${nombreUIApartamento} e identificador visual ${apartamentoIDV}`;
            throw new Error(error);
        }
        const habitacionUID = habitacion.componenteUID

        const camasDeLaHabitacion = await obtenerCamasDeLaHabitacionPorHabitacionUID(habitacionUID)
        if (camasDeLaHabitacion.length === 0) {
            const error = "No existe ningún tipo de camas configuradas para esta habitación";
            throw new Error(error);
        }
        const estructura = {
            ok: "Lista de camas disponibles para este apartamento.",
            listaCamasDisponiblesPorHabitacion: []
        }
        for (const configuracionCama of camasDeLaHabitacion) {
            const camaIDV = configuracionCama.camaIDV;
            const cama = await obtenerCamaComoEntidadPorCamaIDVPorTipoIDV({
                camaIDV,
                tipoIDVArray: ["compartida"],
                errorSi: "desactivado"
            })
            estructura.listaCamasDisponiblesPorHabitacion.push(cama);
        }
        const camasFisicas = await obtenerTodasLasCamaPorTipoIDV("fisica")

        estructura.listaCamasFisicas = camasFisicas
  
        return estructura

    } catch (errorCapturado) {
        throw errorCapturado
    }
}