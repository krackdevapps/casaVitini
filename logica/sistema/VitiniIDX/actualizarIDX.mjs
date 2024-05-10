import { conexion } from "../../componentes/db.mjs";

export const actualizarIDX = async (data) => {

    try {
        const actualIDX = data.actualIDX
        const nuevoIDX = data.nuevoIDX

        const actualizarIDX = `
        UPDATE usuarios
        SET 
            usuario = $2
        WHERE 
            usuario = $1
        RETURNING 
            usuario           
        `;
        const datos = [
            actualIDX,
            nuevoIDX
        ];

        const resuelveActualizarIDX = await conexion.query(actualizarIDX, datos);
        if (resuelveActualizarIDX.rowCount === 0) {
            const error = "No existe el nombre de usuario";
            throw new Error(error);
        }
        if (resuelveActualizarIDX.rowCount === 1) {
            const actualizarSessionesActivas = `
            UPDATE sessiones
            SET sess = jsonb_set(sess::jsonb, '{usuario}', $1::jsonb)::json
            WHERE sess->>'usuario' = $2;            
            `;
            await conexion.query(actualizarSessionesActivas, [nuevoIDX, actualIDX]);
        }
    }
    catch (error) {
        throw error
    }

}