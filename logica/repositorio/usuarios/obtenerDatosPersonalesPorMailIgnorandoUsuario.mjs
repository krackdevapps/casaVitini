import { conexion } from "../../componentes/db.mjs";

export const obtenerDatosPersonalesPorMailIgnorandoUsuario = async (data) => {
    try {
        const mail = data.mail
        const usuario = data.usuario

        const consulta = `
        SELECT 
        *
        FROM 
        "datosDeUsuario"
        WHERE 
        mail = $1
        AND usuario <> $2;`;
        const parametros = [
            mail,
            usuario
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}