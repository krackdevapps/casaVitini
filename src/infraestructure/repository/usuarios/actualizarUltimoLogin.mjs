import { conexion } from "../globales/db.mjs";

export const actualizarUltimoLogin = async (data) => {
    const usuario = data.usuario
    const fechaActualISO = data.fechaActualISO
    try {
        const consulta = `
        UPDATE usuarios
        SET 
            "ultimoLogin" = $1
        WHERE 
            usuario = $2;
        `;
        const parametros = [
            fechaActualISO,
            usuario,

        ];
        const resuelve = await conexion.query(consulta, parametros)
        if (resuelve.rowCount === 0) {
            const error = "No existe el usuario";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado;
    }
};
