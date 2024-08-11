import { conexion } from "../../componentes/db.mjs";
export const eliminarOfertaPorOfertaTVI = async (ofertaTVI) => {
    try {
        const consulta =`
        DELETE FROM ofertas
        WHERE "ofertaTVI" = $1;
        `;
        const resuelve = await conexion.query(consulta, [ofertaTVI])
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
