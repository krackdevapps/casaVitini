import { conexion } from "../../../globales/db.mjs";


export const actualizarRevisionInventarioPorUID = async (data) => {

    try {
        const revisionInventario = data.revisionInventario
        const reposicionInventario = data.reposicionInventario
        const uid = data.uid

        const consulta = `
        UPDATE protocolos."revisionAlojamiento"
        SET
        "revisionInventario" = $1,
        "reposicionInventario" = $2
        
        WHERE
        uid = $3
        RETURNING *
        ;
        `;

        const p = [
            revisionInventario,
            reposicionInventario,
            uid
        ]
        const resuelve = await conexion.query(consulta, p);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
