import { conexion } from "../../../globales/db.mjs";


export const finalizaEstadoRevision = async (data) => {

    try {
        const uid = data.uid
        const estadoRevision = data.estadoRevision
        const fechaFin = data.fechaFin

        const consulta = `
        UPDATE
        protocolos."revisionAlojamiento"
        SET
        "fechaFin" = $1,
        "estadoRevision" = $2
        WHERE
        uid = $3
        RETURNING *
        ;
        `;

        const p = [
            fechaFin,
            estadoRevision,
            uid
        ]
        const resuelve = await conexion.query(consulta, p);
        if (resuelve.rows.length === 0) {
            throw new Error("No se encuentra al revision")
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
