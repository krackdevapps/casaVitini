import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { eliminarApartamentoComoEntidad } from "../../../../repositorio/arquitectura/entidades/apartamento/eliminarApartamentoComoEntidad.mjs";
import { eliminarHabitacionComoEntidad } from "../../../../repositorio/arquitectura/entidades/habitacion/eliminarHabitacionComoEntidad.mjs";
import { eliminarCamaComoEntidad } from "../../../../repositorio/arquitectura/entidades/cama/eliminarCamaComoEntidad.mjs";
import { obtenerCamaComoEntidadPorCamaIDVPorTipoIDV } from "../../../../repositorio/arquitectura/entidades/cama/obtenerCamaComoEntidadPorCamaIDVPorTipoIDV.mjs";

export const eliminarEntidadAlojamiento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()


        const tipoEntidad = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoEntidad,
            nombreCampo: "El tipoEntidad",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const entidadIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.entidadIDV,
            nombreCampo: "El entidadIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        if (tipoEntidad === "apartamento") {

            const apartamentoComoEntidad = await obtenerApartamentoComoEntidadPorApartamentoIDV(entidadIDV)
            if (!apartamentoComoEntidad.apartamento) {
                const error = "No existe el apartamento que desea borrar, revisa el apartamentoIDV";
                throw new Error(error);
            }

            const eliminarApartametnoComoEntidad = await eliminarApartamentoComoEntidad(entidadIDV)

            if (eliminarApartametnoComoEntidad.rowCount === 0) {
                const error = "No se ha eliminado el apartamento por que no se ha encontrado el registo en la base de datos";
                throw new Error(error);
            }
            if (eliminarApartametnoComoEntidad.rowCount === 1) {
                const ok = {
                    ok: "Se ha eliminado correctamente el apartamento como entidad",
                };
                return ok
            }
        }
        if (tipoEntidad === "habitacion") {
            const obtenerHabitacionComoEntidad = await obtenerHabitacionComoEntidadPorHabitacionIDV(entidadIDV)
            if (!obtenerHabitacionComoEntidad.habitacion) {
                const error = "No existe la habitacion, revisa el habitacionIDV";
                throw new Error(error);
            }
            const eliminarHabitacion = await eliminarHabitacionComoEntidad(entidadIDV)
            if (eliminarHabitacion.rowCount === 0) {
                const error = "No se ha eliminado la habitacion por que no se ha entonctrado el registo en la base de datos";
                throw new Error(error);
            }
            if (eliminarHabitacion.rowCount === 1) {
                const ok = {
                    ok: "Se ha eliminado correctamente la habitacion como entidad",
                };
                return ok
            }
        }
        if (tipoEntidad === "cama") {
            const tipoIDV = validadoresCompartidos.tipos.cadena({
                string: entrada.body.tipoIDV,
                nombreCampo: "El campo tipoIDV de la cama",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })
            
            const camaComoEntidad = await obtenerCamaComoEntidadPorCamaIDVPorTipoIDV({
                camaIDV: entidadIDV,
                tipoIDV: [tipoIDV]
            })
            if (!camaComoEntidad.cama) {
                const error = "No existe la cama, revisa el camaIDV";
                throw new Error(error);
            }
            const eliminarCama = await eliminarCamaComoEntidad(entidadIDV)

            if (eliminarCama.rowCount === 0) {
                const error = "No se ha eliminado la cama por que no se ha entonctrado el registo en la base de datos";
                throw new Error(error);
            }
            if (eliminarCama.rowCount === 1) {
                const ok = {
                    ok: "Se ha eliminado correctamente la cama como entidad",
                };
                return ok
            }
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}