import { conexion } from "../../componentes/db.mjs";
export const eliminarApartamentosDeLaOferta = async (ofertaUID) => {
    try {
        const consulta = `
        DELETE FROM "ofertasApartamentos"
        WHERE oferta = $1;`;
        const resuelve = await conexion.query(consulta, [ofertaUID])
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}
