import { conexion } from "../../componentes/db.mjs";

export const insertarFilaDatosPersonales = async (usuarioIDX) => {
    try {
        const consulta = `
        INSERT INTO "datosDeUsuario"
        (
        usuario
        )
        VALUES ($1) 
        RETURNING
        *
        `;
        const resuelve = await conexion.query(consulta, [usuarioIDX])
        if (resuelve.rowCount === 0) {
            const error = "No se ha insertado la ficha de datos personales de este usuario.";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado;
    }
};
