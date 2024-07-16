import { conexion } from "../../componentes/db.mjs";

export const actualizarUsuarioSessionActiva = async (data) => {
    const usuarioIDX = data.usuarioIDX
    const nuevoIDX = data.nuevoIDX
    console.log("data",data)
    try {
        const consulta =`
            UPDATE
            sessiones
            SET 
            sess = jsonb_set(sess::jsonb, '{usuario}', to_jsonb($1::text)::jsonb)
            WHERE 
            sess::jsonb @> jsonb_build_object('usuario', $2::text);
        `;
        const parametros = [
            usuarioIDX,
            nuevoIDX
        ];
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado;
    }
};
