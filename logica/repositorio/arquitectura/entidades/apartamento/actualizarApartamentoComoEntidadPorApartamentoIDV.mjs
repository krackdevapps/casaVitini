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
        const resolucionNombre = await conexion.query(consulta, parametros)
        return resolucionNombre.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}
