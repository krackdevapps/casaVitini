import { conexion } from "../../../../componentes/db.mjs"

export const actualizarApartamentoComoEntidadPorApartamentoIDV = async (data) => {
    try {

        const apartamentoIDVNuevo = data.apartamentoIDVNuevo
        const apartamentoUI = data.apartamentoUI
        const apartamentoIDVSelector = data.apartamentoIDVSelector


        const consulta = `
        UPDATE apartamentos
        SET 
        "apartamentoIDV" = COALESCE($1, "apartamentoIDV"),
        "apartamentoUI"  = COALESCE($2, "apartamentoUI")
        WHERE 
        "apartamentoIDV" = $3
        RETURNING
        *
        `;
        const parametros = [
            apartamentoIDVNuevo,
            apartamentoUI,
            apartamentoIDVSelector
        ];
        const resuelve = await conexion.query(consulta, parametros)
        if (resuelve.rowCount === 0) {
            const error = "No se encuentra el apartamento que quieres actualizar"
            throw error
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}
