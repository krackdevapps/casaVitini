import { conexion } from "../../componentes/db.mjs";

export const insertarImpuesto = async (data) => {
    try {
        const nombreImpuesto = data.nombreImpuesto
        const tipoImpositivo = data.tipoImpositivo
        const tipoValor = data.tipoValor
        const aplicacionSobre = data.aplicacionSobre
        const estado = data.estado
        const impuestoTVI = data.impuestoTVI

        const consulta = `
        INSERT INTO impuestos
        (
        nombre,
        "tipoImpositivo",
        "tipoValorIDV",
        "aplicacionSobreIDV",
        "estadoIDV",
        "impuestoTVI"
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `;
        const parametros = [
            nombreImpuesto,
            tipoImpositivo,
            tipoValor,
            aplicacionSobre,
            estado,
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