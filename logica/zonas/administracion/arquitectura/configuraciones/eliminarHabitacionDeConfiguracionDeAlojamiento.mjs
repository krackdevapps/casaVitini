import { eliminarHabitacionDelApartamentoPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/eliminarHabitacionDelApartamentoPorApartamentoIDV.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { obtenerHabitacionDelApartamentoPorHabitacionUID } from "../../../../repositorio/arquitectura/configuraciones/obtenerHabitacionDelApartamentoPorHabitacionUID.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

export const eliminarHabitacionDeConfiguracionDeAlojamiento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const habitacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.habitacionUID,
            nombreCampo: "El habitacionUID",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const detallesHabitacionDelApartamento = await obtenerHabitacionDelApartamentoPorHabitacionUID(habitacionUID)

        if (!detallesHabitacionDelApartamento?.componenteUID) {
            const error = "No existe la habitacion, revisa el habitacionUID";
            throw new Error(error);
        }
        const apartamentoIDV = detallesHabitacionDelApartamento.apartamentoIDV;

        const configuracionApartamento = await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })
        if (configuracionApartamento?.estadoConfiguracionIDV === "disponible") {
            const error = "No se puede eliminar una habitación cuando el estado de la configuración es disponible. Cambie el estado a no disponible para realizar añadir una cama.";
            throw new Error(error);
        }

        const habitacionEliminada = await eliminarHabitacionDelApartamentoPorApartamentoIDV(habitacionUID)
        if (habitacionEliminada.length === 0) {
            const error = "No se encuentra la habitación a eliminar";
            throw new Error(error);
        }
        const ok = {
            ok: "Se ha eliminado correctamente la habitación como entidad",
        }
        salida.json(ok)
    } catch (errorCapturado) {
        throw errorCapturado
    }
}