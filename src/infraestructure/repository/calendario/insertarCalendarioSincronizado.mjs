import { conexion } from "../globales/db.mjs"

export const insertarCalendarioSincronizado = async (data) => {
    try {
        const nombre = data.nombre
        const apartamentoIDV = data.apartamentoIDV
        const plataformaOrigen = data.plataformaOrigen
        const calendarioRaw = data.calendarioRaw
        const codigoAleatorioUnico = data.codigoAleatorioUnico
        const testingVI = data.testingVI

        const consulta = `
        INSERT INTO "calendariosSincronizados"
        (
        nombre,
        "apartamentoIDV",
        "plataformaOrigenIDV",
        "dataIcal", 
        "publicoUID",
        "testingVI"
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING 
        *
            `;
        const parametros = [
            nombre,
            apartamentoIDV,
            plataformaOrigen,
            calendarioRaw,
            codigoAleatorioUnico,
            testingVI
        ];

        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha insertado el calendario sincronizado.";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
