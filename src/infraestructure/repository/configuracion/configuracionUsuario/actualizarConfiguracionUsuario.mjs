import { conexion } from "../../globales/db.mjs"

export const actualizarConfiguracionUsuario = async (data) => {
    try {
        const usuario = data.usuario
        const configuracionIDV = data.configuracionIDV
        const valor = data.valor
        const consulta = `
        UPDATE "usuariosConfiguracion"
        SET "valor" = $3
        WHERE "usuario" = $1 AND "configuracionIDV" = $2
        RETURNING *;`;
        const parametros = [
            usuario,
            configuracionIDV,
            valor
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
