import { conexion } from "../../../globales/db.mjs";

export const obtenerRevisionPorRevisionUID = async (uid) => {
    try {
        const consulta = `
        SELECT
        *,
        (
            SELECT
            "apartamentoUI"
            FROM
            public.apartamentos
            WHERE
            protocolos."revisionAlojamiento"."apartamentoIDV" = public.apartamentos."apartamentoIDV"
        ) as "apartamentoUI"
        FROM
        protocolos."revisionAlojamiento"
        WHERE
        uid = $1;
        `;
        const resuelve = await conexion.query(consulta, [uid]);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningúna revisión en el registro con ese reivisionUID.";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }

}