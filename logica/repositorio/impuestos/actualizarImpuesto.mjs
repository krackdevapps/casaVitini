import { conexion } from "../../componentes/db.mjs";

export const actualizarImpuesto = async (data) => {
    try {
        const impuestoUID = data.impuestoUID
        const nombreImpuesto = data.nombreImpuesto
        const tipoImpositivo = data.tipoImpositivo
        const tipoValor = data.tipoValor
        const aplicacionSobre = data.aplicacionSobre
        const estado = data.estado

        const consulta = `
        UPDATE impuestos
        SET 
        nombre = COALESCE($1, nombre),
        "tipoImpositivo" = COALESCE($2, "tipoImpositivo"),
        "tipoValorIDV" = COALESCE($3, "tipoValorIDV"),
        "aplicacionSobreIDV" = COALESCE($4, "aplicacionSobreIDV"),
        "estadoIDV" = COALESCE($5, "estadoIDV")
        WHERE "impuestoUID" = $6
        RETURNING
        *
        `;
        const parametros = [
            nombreImpuesto,
            tipoImpositivo,
            tipoValor,
            aplicacionSobre,
            estado,
            impuestoUID
        ];
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No existe el perfil del impuesto que quieres actualizar";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}