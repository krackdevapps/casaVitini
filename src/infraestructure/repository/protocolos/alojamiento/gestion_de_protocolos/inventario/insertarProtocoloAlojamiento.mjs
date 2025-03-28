import { conexion } from "../../../../globales/db.mjs";
export const insertarProtocoloAlojamiento = async (data) => {
    try {
        const elementoUID = data.elementoUID
        const apartamentoIDV = data.apartamentoIDV
        const cantidad_enAlojamiento = data.cantidad_enAlojamiento
        const posicion = data.posicion

        const consulta = `
        INSERT INTO protocolos."inventarioAlojamiento"
        (
        "apartamentoIDV",
        "elementoUID",
        "cantidad_enAlojamiento",
        posicion
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `;
        const parametros = [
            apartamentoIDV,
            elementoUID,
            cantidad_enAlojamiento,
            posicion

        ];
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha insertado el elemento del inventario en el protocolo de alojamiento."
            throw error
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}