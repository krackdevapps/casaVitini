import { eliminarCamaDeLaHabitacionPorCamaUID } from "../../../../repositorio/arquitectura/configuraciones/eliminarCamaDeLaHabitacionPorCamaUID.mjs";
import { obtenerCamasDeLaHabitacionPorCamaUID } from "../../../../repositorio/arquitectura/configuraciones/obtenerCamasDeLaHabitacionPorCamaUID.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerHabitacionDelApartamentoPorHabitacionUID } from "../../../../repositorio/arquitectura/configuraciones/obtenerHabitacionDelApartamentoPorHabitacionUID.mjs";

export const eliminarCamaDeConfiguracionDeAlojamiento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const camaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.camaUID,
            nombreCampo: "El camaUID",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const detallesCamaEnLaHabitacion = await obtenerCamasDeLaHabitacionPorCamaUID(camaUID)
        if (!detallesCamaEnLaHabitacion?.componenteUID) {
            const error = "No existe la cama, revisa el camaUID";
            throw new Error(error);
        }
        const habitacionUID = detallesCamaEnLaHabitacion.habitacionUID;
        const detallesHabitacion = await obtenerHabitacionDelApartamentoPorHabitacionUID(habitacionUID)
        const apartamentoIDV = detallesHabitacion.apartamentoIDV;

        const detallesApartamento = await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })
        if (detallesApartamento.estadoConfiguracionIDV === "disponible") {
            const error = "No se puede eliminar una habitación cuando el estado de la configuración es disponible. Cambie el estado a no disponible para realizar añadir una cama.";
            throw new Error(error);
        }
        await eliminarCamaDeLaHabitacionPorCamaUID(camaUID)
        const ok = {
            ok: "Se ha eliminado correctamente la cama de la habitación"
        };
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }

}