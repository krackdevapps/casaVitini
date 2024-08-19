import { conexion } from "../../componentes/db.mjs";
export const eliminarOfertaPorOfertaUID = async (ofertaUID) => {
    try {
        const consulta =`
        DELETE FROM ofertas
        WHERE "ofertaUID" = $1;
        `;
        const resuelve = await conexion.query(consulta, [ofertaUID])
        if (resuelve.rowCount === 0) {
            const error = "No se encuentra la oferta que quieres eliminar, revisa el ofertaUID.";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
