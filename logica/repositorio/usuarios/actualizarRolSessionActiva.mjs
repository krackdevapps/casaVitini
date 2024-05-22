import { conexion } from "../../componentes/db.mjs";

export const actualizarRolSessionActiva = async (data) => {
    const usuarioIDX = data.usuarioIDX
    const nuevoRol = data.nuevoRol
    try {
        const consulta =`
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
        if (resuelve.rowCount === 0) {
            const error = "No existe el usuario";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw error;
    }
};
