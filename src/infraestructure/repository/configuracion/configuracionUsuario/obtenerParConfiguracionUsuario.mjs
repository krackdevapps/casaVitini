import { conexion } from "../../globales/db.mjs";

export const obtenerParConfiguracionUsuario = async (data) => {
    try {
        const paresConfIDV = data.paresConfIDV
        const usuario = data.usuario
        const consulta = `          
                SELECT 
                "configuracionIDV",
                valor
                FROM 
                "usuariosConfiguracion"
                WHERE
                "configuracionIDV" = ANY($1)
                AND
                usuario = $2
            `;
        const parametros = [
            paresConfIDV,
            usuario
        ]
        const resuelve = await conexion.query(consulta, parametros);
        const parConfiguracion = {}
        resuelve.rows.forEach((parConf) => {
            const configuracionIDV = parConf.configuracionIDV
            const valor = parConf.valor
            parConfiguracion[configuracionIDV] = valor
        })
        return parConfiguracion
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
