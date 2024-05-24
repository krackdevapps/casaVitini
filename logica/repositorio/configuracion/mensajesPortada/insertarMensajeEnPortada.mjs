import { conexion } from "../../../componentes/db.mjs"

export const insertarMensajeEnPortada = async (data) => {
    try {

        const mensajeB64 = data.mensajeB64
        const estadoInicial = data.estadoInicial
        const posicionInicial = data.posicionInicial
        const mensajeTVI = data.mensajeTVI

        const consulta = `
        INSERT INTO 
        "mensajesEnPortada"
        (
        mensaje,
        "estadoIDV",
        posicion,
        "mensajeTVI"
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
            mensajeTVI
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
