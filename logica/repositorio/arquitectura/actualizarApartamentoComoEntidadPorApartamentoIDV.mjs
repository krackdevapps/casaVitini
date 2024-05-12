import { conexion } from "../../componentes/db.mjs"

export const actualizarApartamentoComoEntidadPorApartamentoIDV = async (data) => {
    try {

        const apartamentoIDV = data.apartamentoIDV
        const apartamentoUI = data.apartamentoUI
        const entidadIDV = data.entidadIDV


        const consulta = `
        UPDATE apartamentos
        SET 
        apartamento= COALESCE($1, apartamento),
        "apartamentoUI" = COALESCE($2, "apartamentoUI")
        WHERE apartamento = $3
        `;
        const parametros = [
            apartamentoIDV,
            apartamentoUI,
            entidadIDV
        ];
        const resolucionNombre = await conexion.query(consulta, [parametros])
        return resolucionNombre
    } catch (error) {
        throw error;
    }
}
