import { conexion } from "../../componentes/db.mjs";

export const insertarImpuesto = async (data) => {
    try {
        const nombre = data.nombre
        const tipoImpositivo = data.tipoImpositivo
        const tipoValorIDV = data.tipoValorIDV
        const entidadIDV = data.entidadIDV
        const estadoIDV = data.estadoIDV
        const impuestoTVI = data.impuestoTVI

        const consulta = `
        INSERT INTO impuestos
        (
        nombre,
        "tipoImpositivo",
        "tipoValorIDV",
        "entidadIDV",
        "estadoIDV",
        "impuestoTVI"
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `;
        const parametros = [
            nombre,
            tipoImpositivo,
            tipoValorIDV,
            entidadIDV,
            estadoIDV,
            impuestoTVI
        ];
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha insertado el impuesto"
            throw error
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}