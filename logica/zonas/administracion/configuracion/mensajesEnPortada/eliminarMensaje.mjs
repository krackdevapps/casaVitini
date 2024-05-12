import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";

export const eliminarMensaje = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const mensajeUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.mensajeUID,
            nombreCampo: "El campo mensajeUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        await conexion.query('BEGIN'); // Inicio de la transacción


        // Validar si es un usuario administrador
        const validaMensaje = `
                                SELECT 
                                posicion
                                FROM "mensajesEnPortada"
                                WHERE uid = $1;
                                `;
        const resuelveValidacion = await conexion.query(validaMensaje, [mensajeUID]);

        if (resuelveValidacion.rowCount === 0) {
            const error = "No se encuentra ningun mensaje con ese UID";
            throw new Error(error);
        }
        const posicion = resuelveValidacion.rows[0].posicion;
        const consultaEliminacion = `
                                DELETE FROM "mensajesEnPortada"
                                WHERE uid = $1;
                                `;
        const resuelveEliminacion = await conexion.query(consultaEliminacion, [mensajeUID]);
        // Ahora, puedes agregar la lógica para actualizar las filas restantes si es necesario
        const consultaActualizacion = `
                                    UPDATE "mensajesEnPortada"
                                    SET posicion = posicion - 1
                                    WHERE posicion > $1; 
                                `;
        await conexion.query(consultaActualizacion, [posicion]);

        await conexion.query('COMMIT');
        if (resuelveEliminacion.rowCount === 1) {
            const ok = {
                ok: "Se ha eliminado correctamente el mensaje de portada",
                mensajeUID: mensajeUID
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK');
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
    }
}