import { conexion } from "../../componentes/db.mjs";
export const actualizarEstadoOferata = async (data) => {
    try {

        const ofertaUID = data.ofertaUID
        const estadoIDV = data.estadoIDV

        const consulta = `
        UPDATE ofertas
        SET "estadoIDV" = $2
        WHERE "ofertaUID" = $1
        RETURNING "estadoIDV";
        `;
        const parametros = [
            ofertaUID,
            estadoIDV,
        ];
        const resuelve = await conexion.query(consulta, parametros)
        if (resuelve.rowCount === 0) {
            const error = "No existe al oferta, revisa el UID introducie en el campo ofertaUID, recuerda que debe de ser un number";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
