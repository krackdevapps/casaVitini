import { eliminarHabitacionDelApartamentoPorHabitacionUID } from "../../../../infraestructure/repository/arquitectura/configuraciones/eliminarHabitacionDelApartamentoPorHabitacionUID.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { obtenerHabitacionDelApartamentoPorHabitacionUID } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerHabitacionDelApartamentoPorHabitacionUID.mjs";
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";

export const eliminarHabitacionDeConfiguracionDeAlojamiento = async (entrada, salida) => {
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
            devuelveUnTipoNumber: "si"
        })

        const detallesHabitacionDelApartamento = await obtenerHabitacionDelApartamentoPorHabitacionUID(habitacionUID)

        if (!detallesHabitacionDelApartamento?.componenteUID) {
            const error = "No existe la habitación, revisa el habitacionUID";
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

        const habitacionEliminada = await eliminarHabitacionDelApartamentoPorHabitacionUID(habitacionUID)
        if (habitacionEliminada.length === 0) {
            const error = "No se encuentra la habitación a eliminar";
            throw new Error(error);
        }
        const ok = {
            ok: "Se ha eliminado correctamente la habitación como entidad",
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}