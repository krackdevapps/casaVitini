import { conexion } from "../globales/db.mjs";
export const actualizarEstadoIDVPorComplementoUID = async (data) => {
    try {

        const complementoUID = data.complementoUID
        const estadoIDV = data.estadoIDV

        const consulta = `
        UPDATE "complementosDeAlojamiento"
        SET "estadoIDV" = $2
        WHERE "complementoUID" = $1
        RETURNING "estadoIDV";
        `;
        const parametros = [
            complementoUID,
            estadoIDV,
        ];
        const resuelve = await conexion.query(consulta, parametros)
        if (resuelve.rowCount === 0) {
            const error = "No existe el complemento que quieres cambiar el estado, revisa el UID introducie en el campo complementoUID, recuerda que debe de ser un number";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
