import { conexion } from "../globales/db.mjs";
export const actualizarComplementoPorComplementoUID = async (data) => {
    try {
        const complementoUI = data.complementoUI
        const definicion = data.definicion
        const tipoPrecio = data.tipoPrecio
        const precio = data.precio
        const complementoUID = data.complementoUID


        const consulta = `
        UPDATE "complementosDeAlojamiento"
        SET
        "complementoUI" = $1,
        definicion = $2,
        "tipoPrecio" = $3,
        precio = $4
        WHERE
        "complementoUID" = $5
        RETURNING
        *`;
        const parametros = [
            complementoUI,
            definicion,
            tipoPrecio,
            precio,
            complementoUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido actualizar el complemento.";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}