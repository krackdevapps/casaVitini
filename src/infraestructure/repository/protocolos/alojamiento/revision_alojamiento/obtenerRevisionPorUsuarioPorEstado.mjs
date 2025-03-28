import { conexion } from "../../../globales/db.mjs";

export const obtenerRevisionPorUsuarioPorEstado = async (data) => {
   
    try {
        const usuario = data.usuario
        const estadoRevision = data.estadoRevision

        const consulta = `
        SELECT
        *
        FROM
        protocolos."revisionAlojamiento"
        WHERE
        usuario = $1;
        AND
        "estadoRevision" = $2
        `;
        const parametros = [
            usuario,
            estadoRevision
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }

}