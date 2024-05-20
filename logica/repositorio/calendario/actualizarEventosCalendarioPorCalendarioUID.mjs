import { conexion } from "../../componentes/db.mjs";

export const actualizarEventosCalendarioPorCalendarioUID = async (data) => {
    try {

        const calendarioUID = data.calendarioUID
        const calendarioRaw = data.calendarioRaw

        const consulta =   `
        UPDATE "calendariosSincronizados"
        SET 
        "dataIcal" = COALESCE($1, "dataIcal")
        WHERE "calendarioUID" = $2;
        `;
        const parametros = [
            calendarioRaw,
            calendarioUID
        ]
        const resuelve = await conexion.query(consulta, parametros)
        if (resuelve.rowCount === 0) {
            const error = "Los datos actualizados tras la sincronizacion se han enviado a la base de datos pero el servidor de base de datos informa que no se ha actualizado el calendario. Vuelve a intentarlo mas tarde.";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}