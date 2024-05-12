import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";
import { eliminarApartamentoComoEntidad } from "../../../../repositorio/arquitectura/eliminarApartamentoComoEntidad.mjs";
import { eliminarHabitacionComoEntidad } from "../../../../repositorio/arquitectura/eliminarHabitacionComoEntidad.mjs";
import { obtenerCamaComoEntidadPorCamaIDV } from "../../../../repositorio/arquitectura/obtenerCamaComoEntidadPorCamaIDV.mjs";
import { eliminarCamasComoEntidad } from "../../../../repositorio/arquitectura/eliminarCamasComoEntidad.mjs";

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
                salida.json(ok);
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
                salida.json(ok);
            }
        }
        if (tipoEntidad === "cama") {
            const camaComoEntidad = await obtenerCamaComoEntidadPorCamaIDV(entidadIDV)
            if (!camaComoEntidad.cama) {
                const error = "No existe la cama, revisa el camaIDV";
                throw new Error(error);
            }
            const eliminarCama = await eliminarCamasComoEntidad(entidadIDV)

            if (eliminarCama.rowCount === 0) {
                const error = "No se ha eliminado la cama por que no se ha entonctrado el registo en la base de datos";
                throw new Error(error);
            }
            if (eliminarCama.rowCount === 1) {
                const ok = {
                    ok: "Se ha eliminado correctamente la cama como entidad",
                };
                salida.json(ok);
            }
        }
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}