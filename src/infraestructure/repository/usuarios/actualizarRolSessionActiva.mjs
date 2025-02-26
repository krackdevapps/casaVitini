import { conexion } from "../globales/db.mjs";

export const actualizarRolSessionActiva = async (data) => {
    const usuarioIDX = data.usuarioIDX
    const nuevoRol = data.nuevoRol
    try {
        const consulta = `
        UPDATE 
        sessiones
        SET 
        sess = jsonb_set(sess::jsonb, '{rol}', to_jsonb($2::text))
        WHERE 
        sess->>'usuario' = $1;`;
        const parametros = [
            usuarioIDX,
            nuevoRol
        ];
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado;
    }
};
