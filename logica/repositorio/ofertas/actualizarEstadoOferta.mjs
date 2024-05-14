import { conexion } from "../../componentes/db.mjs";
export const actualizarEstadoOferata = async (data) => {
    try {

        const ofertaUID = data.ofertaUID
        const estado = data.estado

        const consulta = `
        UPDATE ofertas
        SET "estadoOferta" = $2
        WHERE uid = $1
        RETURNING "estadoOferta";
        `;
        const parametros = [
            ofertaUID,
            estado,
        ];
        const resuelve = await conexion.query(consulta, parametros)
        if (resuelve.rowCount === 0) {
            const error = "No existe al oferta, revisa el UID introducie en el campo ofertaUID, recuerda que debe de ser un number";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}
