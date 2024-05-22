import { conexion } from "../../../componentes/db.mjs";

export const actualizarImagenDelApartamentoPorApartamentoIDV = async (data) => {
    try {
        const apartamentoIDV = data.apartamentoIDV
        const imagen = data.imagen

        const consulta = `
        UPDATE 
        "configuracionApartamento"
        SET
        imagen = $1
        WHERE
        "apartamentoIDV" = $2
        RETURNING 
        *;`;
        const parametros = [
            imagen,
            apartamentoIDV
        ]
        const resolucionNombre = await conexion.query(consulta, parametros)
        return resolucionNombre.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}
