import { conexion } from "../../componentes/db.mjs"

export const actualizarImagenDelApartamentoPorApartamentoIDV = async (apartamentoIDV) => {
    try {
        const consulta =`
        UPDATE "configuracionApartamento"
        SET imagen = NULL
        WHERE "apartamentoIDV" = $1;
        `;
        const resolucionNombre = await conexion.query(consulta, [apartamentoIDV])
        return resolucionNombre.rows[0]
    } catch (error) {
        throw error;
    }
}
