import { conexion } from "../../globales/db.mjs"

export const insertarMensajeEnPortada = async (data) => {
    try {

        const mensajeB64 = data.mensajeB64
        const estadoInicial = data.estadoInicial
        const posicionInicial = data.posicionInicial
        const testingVI = data.testingVI

        const consulta = `
        INSERT INTO 
        "mensajesEnPortada"
        (
        mensaje,
        "estadoIDV",
        posicion,
        "testingVI"
        )
        VALUES 
        ($1, $2, $3, $4)
        RETURNING
        *
        `;
        const parametros = [
            mensajeB64,
            estadoInicial,
            posicionInicial,
            testingVI
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
