import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

import { obtenerHabitacionDelApartamentoPorHabitacionUID } from "../../../../repositorio/arquitectura/obtenerHabitacionDelApartamentoPorHabitacionUID.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/obtenerConfiguracionPorApartamentoIDV.mjs";
import { eliminarCamaDeLaHabitacionPorCamaUID } from "../../../../repositorio/arquitectura/eliminarCamaDeLaHabitacionPorCamaUID.mjs";
import { obtenerCamasDeLaHabitacionPorCamaUID } from "../../../../repositorio/arquitectura/obtenerCamasDeLaHabitacionPorCamaUID.mjs";

export const eliminarCamaDeConfiguracionDeAlojamiento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const camaUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.camaUID,
            nombreCampo: "El identificador universal de la cama (camaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si"
        })

        const detallesCamaEnLaHabitacion = await obtenerCamasDeLaHabitacionPorCamaUID(camaUID)
        if (!detallesCamaEnLaHabitacion.uid) {
            const error = "No existe la cama, revisa el camaUID";
            throw new Error(error);
        }
        const habitacionUID = detallesCamaEnLaHabitacion.habitacion;
        const detallesHabitacion = await obtenerHabitacionDelApartamentoPorHabitacionUID(habitacionUID)
        const apartamentoIDV = detallesHabitacion.apartamento;

        const detallesApartamento = await obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)
        if (detallesApartamento.estadoConfiguracion === "disponible") {
            const error = "No se puede eliminar una habitacion cuando el estado de la configuracion es Disponible, cambie el estado a no disponible para realizar anadir una cama";
            throw new Error(error);
        }
        await eliminarCamaDeLaHabitacionPorCamaUID(camaUID)
        const ok = {
            ok: "Se ha eliminado correctamente la cama de la habitacion"
        };
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }

}