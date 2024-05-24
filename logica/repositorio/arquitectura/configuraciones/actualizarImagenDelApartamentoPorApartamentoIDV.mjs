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
        const resuelve = await conexion.query(consulta, parametros)
        if (resuelve.rowCount === 0) {
            const error = "No se ha posido actualizar la imagen por que no existe ningun apartmento con ese apartamentoIDV";
            throw error;
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}