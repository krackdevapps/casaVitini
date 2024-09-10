import { insertarCamaEnHabitacion } from "../../../../repositorio/arquitectura/configuraciones/insertarCamasEnHabitacion.mjs";
import { obtenerCamaDeLaHabitacionPorHabitacionUID } from "../../../../repositorio/arquitectura/configuraciones/obtenerCamaDeLaHabitacionPorHabitacionUID.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { obtenerHabitacionDelApartamentoPorHabitacionUID } from "../../../../repositorio/arquitectura/configuraciones/obtenerHabitacionDelApartamentoPorHabitacionUID.mjs";
import { obtenerCamaComoEntidadPorCamaIDVPorTipoIDV } from "../../../../repositorio/arquitectura/entidades/cama/obtenerCamaComoEntidadPorCamaIDVPorTipoIDV.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

export const addCamaToConfiguracionApartamentoHabitacion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })
        const camaIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.camaIDV,
            nombreCampo: "El camaIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const habitacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.habitacionUID,
            nombreCampo: "El habitacionUID",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const obtenerDetallesPorCama_ = await obtenerCamaComoEntidadPorCamaIDVPorTipoIDV({
            camaIDV,
            tipoIDVArray: ["compartida"],
            errorSi: "noExiste"
        })
        if (obtenerDetallesPorCama_.length === 0) {
            const error = "No existe ninguna cama con ese identificador visual";
            throw new Error(error);
        }
        const camaUI = obtenerDetallesPorCama_.camaUI;
        const capacidad = obtenerDetallesPorCama_.capacidad;
        const habitacionDelApartamento = await obtenerHabitacionDelApartamentoPorHabitacionUID(habitacionUID)
        if (!habitacionDelApartamento?.componenteUID) {
            const error = "No hay ninguna habitación con ese UID";
            throw new Error(error);
        }
        const apartamentoIDV = habitacionDelApartamento.apartamentoIDV;
        const obtenerConfiguracionPorApartamento_ = await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })
        if (obtenerConfiguracionPorApartamento_.estadoConfiguracionIDV === "disponible") {
            const error = "No se puede añadir una habitación cuando el estado de la configuración es Disponible. Cambie el estado a no disponible para realizar añadir una cama.";
            throw new Error(error);
        }
        const dataObtenerCamaPorHabitacion = {
            habitacionUID: habitacionUID,
            camaIDV: camaIDV
        }
        const camaDeLaHabitacion = await obtenerCamaDeLaHabitacionPorHabitacionUID(dataObtenerCamaPorHabitacion)
        if (camaDeLaHabitacion?.habitacionUID) {
            const error = "Esta cama ya existe";
            throw new Error(error);
        }
        const dataInsertarCamaEnHabitacion = {
            habitacionUID: habitacionUID,
            camaIDV: camaIDV
        }
        const nuevaCamaDeLaHabitacion = await insertarCamaEnHabitacion(dataInsertarCamaEnHabitacion)

        const nuevoUID = nuevaCamaDeLaHabitacion.componenteUID;
        const ok = {
            ok: "Se ha insertado la cama correctamente en la habitación.",
            nuevoUID: nuevoUID,
            camaUI: camaUI,
            camaIDV: camaIDV,
            capaciad: capacidad
        };
        return ok



    } catch (errorCapturado) {
        throw errorCapturado
    }

}