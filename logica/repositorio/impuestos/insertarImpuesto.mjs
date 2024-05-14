import { conexion } from "../../componentes/db.mjs";

export const insertarImpuesto = async (data) => {
    try {
        const nombreImpuesto = data.nombreImpuesto
        const tipoImpositivo = data.tipoImpositivo
        const tipoValor = data.tipoValor
        const aplicacionSobre = data.aplicacionSobre
        const estado = data.estado

        const consulta = `
        INSERT INTO impuestos
        (
        nombre,
        "tipoImpositivo",
        "tipoValor",
        "aplicacionSobre",
        estado
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING "impuestoUID"
        `;
        const parametros = [
            nombreImpuesto,
            tipoImpositivo,
            tipoValor,
            aplicacionSobre,
            estado
        ];
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}