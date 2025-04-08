import { conexion } from "../globales/db.mjs"

export const insertarRegistro = async (data) => {
    try {
        const registroUI = data.registroUI
        const usuario = data.usuario
        const ip = data.ip
        const fecha = data.fecha
        const userAgent = data.userAgent
        const consulta = `
        INSERT INTO registro.registros
        (
        usuario,
        "operacionUI",
        fecha,
        ip,
        "userAgent"
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `;
        const parametros = [
            usuario,
            registroUI,
            fecha,
            ip,
            userAgent
        ];
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha insertado el regsitro"
            throw error
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}