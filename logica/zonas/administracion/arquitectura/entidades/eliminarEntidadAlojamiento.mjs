import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";

export const eliminarEntidadAlojamiento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return


        const tipoEntidad = entrada.body.tipoEntidad;
        const entidadIDV = entrada.body.entidadIDV;
        const filtroCadenaSinEspacios = /^[a-z0-9]+$/;
        const filtroCadenaConEspacios = /^[a-z0-9\s]+$/i;
        if (!tipoEntidad || !filtroCadenaSinEspacios.test(tipoEntidad)) {
            const error = "el campo 'tipoEntidad' solo puede ser letras minúsculas y numeros. sin pesacios";
            throw new Error(error);
        }
        if (!entidadIDV || !filtroCadenaSinEspacios.test(entidadIDV)) {
            const error = "el campo 'entidadIDV' solo puede ser letras minúsculas y numeros. sin pesacios";
            throw new Error(error);
        }
        if (tipoEntidad === "apartamento") {
            const validarIDV = `
                                    SELECT 
                                    *
                                    FROM apartamentos
                                    WHERE apartamento = $1
                                    `;
            const resuelveValidarIDV = await conexion.query(validarIDV, [entidadIDV]);
            if (resuelveValidarIDV.rowCount === 0) {
                const error = "No existe el apartamento que desea borrar, revisa el apartamentoIDV";
                throw new Error(error);
            }
            const eliminarEntidad = `
                                    DELETE FROM apartamentos
                                    WHERE apartamento = $1;
                                    `;
            const resuelveEliminarBloqueo = await conexion.query(eliminarEntidad, [entidadIDV]);
            if (resuelveEliminarBloqueo.rowCount === 0) {
                const error = "No se ha eliminado el apartamento por que no se ha encontrado el registo en la base de datos";
                throw new Error(error);
            }
            if (resuelveEliminarBloqueo.rowCount === 1) {
                const ok = {
                    "ok": "Se ha eliminado correctamente el apartamento como entidad",
                };
                salida.json(ok);
            }
        }
        if (tipoEntidad === "habitacion") {
            const validarIDV = `
                                    SELECT 
                                    *
                                    FROM habitaciones
                                    WHERE habitacion = $1
                                    `;
            const resuelveValidarIDV = await conexion.query(validarIDV, [entidadIDV]);
            if (resuelveValidarIDV.rowCount === 0) {
                const error = "No existe la habitacion, revisa el habitacionIDV";
                throw new Error(error);
            }
            const eliminarEntidad = `
                                    DELETE FROM habitaciones
                                    WHERE habitacion = $1;
                                    `;
            const resuelveEliminarBloqueo = await conexion.query(eliminarEntidad, [entidadIDV]);
            if (resuelveEliminarBloqueo.rowCount === 0) {
                const error = "No se ha eliminado la habitacion por que no se ha entonctrado el registo en la base de datos";
                throw new Error(error);
            }
            if (resuelveEliminarBloqueo.rowCount === 1) {
                const ok = {
                    "ok": "Se ha eliminado correctamente la habitacion como entidad",
                };
                salida.json(ok);
            }
        }
        if (tipoEntidad === "cama") {
            const validarIDV = `
                                    SELECT 
                                    *
                                    FROM camas
                                    WHERE cama = $1
                                    `;
            const resuelveValidarIDV = await conexion.query(validarIDV, [entidadIDV]);
            if (resuelveValidarIDV.rowCount === 0) {
                const error = "No existe la cama, revisa el camaIDV";
                throw new Error(error);
            }
            const eliminarEntidad = `
                                    DELETE FROM camas
                                    WHERE cama = $1;
                                    `;
            const resuelveEliminarBloqueo = await conexion.query(eliminarEntidad, [entidadIDV]);
            if (resuelveEliminarBloqueo.rowCount === 0) {
                const error = "No se ha eliminado la cama por que no se ha entonctrado el registo en la base de datos";
                throw new Error(error);
            }
            if (resuelveEliminarBloqueo.rowCount === 1) {
                const ok = {
                    "ok": "Se ha eliminado correctamente la cama como entidad",
                };
                salida.json(ok);
            }
        }
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}