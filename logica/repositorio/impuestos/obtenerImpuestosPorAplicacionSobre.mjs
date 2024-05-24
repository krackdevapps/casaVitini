import { conexion } from "../../componentes/db.mjs";

export const obtenerImpuestosPorAplicacionSobre = async (aplicacionSobre_array) => {
    try {

        const consulta = `
        SELECT
        nombre, "tipoImpositivo", "tipoValorIDV"
        FROM
        impuestos
        WHERE
        "aplicacionSobreIDV" = ANY($1);
        `;

        const resuelve = await conexion.query(consulta, [aplicacionSobre_array]);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}