import { conexion } from "../../globales/db.mjs"

export const insertarConfiguracionUsuario = async (data) => {
    try {
        const usuario = data.usuario
        const configuracionIDV = data.configuracionIDV
        const valor = data.valor
        const consulta = `
        INSERT INTO "usuariosConfiguracion" ("usuario", "configuracionIDV", "valor")
        SELECT $1, $2, $3
        WHERE NOT EXISTS (
        SELECT 1
        FROM "usuariosConfiguracion"
        WHERE "usuario" = $1 AND "configuracionIDV" = $2)
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
