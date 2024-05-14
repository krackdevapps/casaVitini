import { conexion } from "../../../componentes/db.mjs"

export const insertarMensajeEnPortada = async (data) => {
    try {

        const mensajeB64 = data.mensajeB64
        const estadoInicial = data.estadoInicial
        const posicionInicial = data.posicionInicial

        const consulta = `
        INSERT INTO 
        "mensajesEnPortada"
        (
        mensaje,
        estado,
        posicion
        )
        VALUES 
        ($1, $2, $3)
        RETURNING
        uid
        `;
        const parametros = [
            mensajeB64,
            estadoInicial,
            posicionInicial
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}
