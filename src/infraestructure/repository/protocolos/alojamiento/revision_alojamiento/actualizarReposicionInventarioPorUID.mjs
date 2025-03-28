import { conexion } from "../../../globales/db.mjs";


export const actualizarReposicionInventarioPorUID = async (data) => {

    try {
        const reposicionInventario = data.reposicionInventario
        const uid = data.uid

        const consulta = `
        UPDATE protocolos."revisionAlojamiento"
        SET "reposicionInventario" = $1
        WHERE
        uid = $2
        RETURNING *
        ;
        `;

        const p = [
            reposicionInventario,
            uid
        ]
        const resuelve = await conexion.query(consulta, p);

        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
