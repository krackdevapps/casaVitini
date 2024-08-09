import { conexion } from "../../componentes/db.mjs";

export const actualizarImpuesto = async (data) => {
    try {
        const impuestoUID = data.impuestoUID
        const nombre = data.nombre
        const tipoImpositivo = data.tipoImpositivo
        const tipoValorIDV = data.tipoValorIDV
        const entidadIDV = data.entidadIDV
        const estadoIDV = data.estadoIDV

        const consulta = `
        UPDATE impuestos
        SET 
        nombre = COALESCE($1, nombre),
        "tipoImpositivo" = COALESCE($2, "tipoImpositivo"),
        "tipoValorIDV" = COALESCE($3, "tipoValorIDV"),
        "entidadIDV" = COALESCE($4, "entidadIDV"),
        "estadoIDV" = COALESCE($5, "estadoIDV")
        WHERE "impuestoUID" = $6
        RETURNING
        *
        `;
        const parametros = [
            nombre,
            tipoImpositivo,
            tipoValorIDV,
            entidadIDV,
            estadoIDV,
            impuestoUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No existe el perfil del impuesto que quieres actualizar.";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}