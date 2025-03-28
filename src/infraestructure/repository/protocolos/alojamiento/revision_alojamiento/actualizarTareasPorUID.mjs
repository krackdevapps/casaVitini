import { conexion } from "../../../globales/db.mjs";


export const actualizarTareasPorUID = async (data) => {

    try {
        const tareas = data.tareas
        const uid = data.uid
        const fechaFin = data.fechaFin
        const estadoRevision = data.estadoRevision
        const reposicionInventario = data.reposicionInventario

        const consulta = `
        UPDATE
        protocolos."revisionAlojamiento"
        SET
        tareas = $1,
        "fechaFin" = $2,
        "estadoRevision" = $3,
        "reposicionInventario" = $4
        WHERE
        uid = $5
        RETURNING *
        ;
        `;

        const p = [
            tareas,
            fechaFin,
            estadoRevision,
            reposicionInventario,
            uid
        ]
        const resuelve = await conexion.query(consulta, p);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
