import { conexion } from "../../componentes/db.mjs"

export const actualizarCalendarioSincronizado = async (data) => {
    try {

        const nombre = data.nombre
        const url = data.url
        const apartamentoIDV = data.apartamentoIDV
        const calendarioRaw = data.calendarioRaw
        const calendarioUID = data.calendarioUID

        const consulta = `
            UPDATE "calendariosSincronizados"
            SET 
            nombre = COALESCE($1, nombre),
            url = COALESCE($2, url),
            "apartamentoIDV" = COALESCE($3, "apartamentoIDV"),
            "dataIcal" = COALESCE($4, "dataIcal")
            WHERE "calendarioUID"  = $5
            RETURNING *;

            `;
      const parametros = [
            nombre,
            url,
            apartamentoIDV,
            calendarioRaw,
            calendarioUID
        ];
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha actualizado el calendario sincronizado.";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
