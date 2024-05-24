import { eliminarHabitacionDelApartamentoPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/eliminarHabitacionDelApartamentoPorApartamentoIDV.mjs";
import { obtenerConfiguracionPorArrayDeApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorArrayDeApartamentoIDV.mjs";
import { obtenerHabitacionDelApartamentoPorHabitacionUID } from "../../../../repositorio/arquitectura/configuraciones/obtenerHabitacionDelApartamentoPorHabitacionUID.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";


export const eliminarHabitacionDeConfiguracionDeAlojamiento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const habitacionUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.habitacionUID,
            nombreCampo: "El identificador universal de la habitación (habitacionUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const detallesHabitacionDelApartamento = await obtenerHabitacionDelApartamentoPorHabitacionUID(habitacionUID)
        if (detallesHabitacionDelApartamento.length === 0) {
            const error = "No existe la habitacion, revisa el habitacionUID";
            throw new Error(error);
        }
        const apartamentoIDV = detallesHabitacionDelApartamento.apartamento;

        const configuracionApartamento = await obtenerConfiguracionPorArrayDeApartamentoIDV(apartamentoIDV)
        if (configuracionApartamento.estadoConfiguracion === "disponible") {
            const error = "No se puede eliminar una habitacion cuando el estado de la configuracion es Disponible, cambie el estado a no disponible para realizar anadir una cama";
            throw new Error(error);
        }

        await eliminarHabitacionDelApartamentoPorApartamentoIDV(habitacionUID)
        const ok = {
            ok: "Se ha eliminado correctamente la habitacion como entidad",
        }
        salida.json(ok)
    } catch (errorCapturado) {
        throw errorCapturado
    }
}