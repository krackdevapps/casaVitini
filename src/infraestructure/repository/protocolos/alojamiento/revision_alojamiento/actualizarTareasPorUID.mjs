import { conexion } from "../../../globales/db.mjs";


export const actualizarTareasPorUID = async (data) => {

    try {
        const tareas = data.tareas
        const uid = data.uid
        const reposicionInventario = data.reposicionInventario

        const consulta = `
        UPDATE
        protocolos."revisionAlojamiento"
        SET
        tareas = $1,
        "reposicionInventario" = $2
        WHERE
        uid = $3
        RETURNING *
        ;
        `;

        const p = [
            tareas,
            reposicionInventario,
            uid
        ]
        const resuelve = await conexion.query(consulta, p);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
