import { conexion } from "../../componentes/db.mjs"

export const insertarCalendarioSincronizado = async (data) => {
    try {
        const nombre = data.nombre
        const url = data.url
        const apartamentoIDV = data.apartamentoIDV
        const plataformaOrigen = data.plataformaOrigen
        const calendarioRaw = data.calendarioRaw
        const codigoAleatorioUnico = data.codigoAleatorioUnico
        const calendarioIDV = data.calendarioIDV

        const consulta = `
        INSERT INTO "calendariosSincronizados"
        (
        nombre,
        url,
        "apartamentoIDV",
        "plataformaOrigenIDV",
        "dataIcal", 
        "publicoUID",
        "calendarioIDV"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING 
        *
            `;
        const parametros = [
            nombre,
            url,
            apartamentoIDV,
            plataformaOrigen,
            calendarioRaw,
            codigoAleatorioUnico,
            calendarioIDV
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
