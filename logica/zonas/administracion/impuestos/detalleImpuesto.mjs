import { conexion } from "../../../componentes/db.mjs";
export const detalleImpuesto = async (entrada, salida) => {
    try {
        const impuestoUID = entrada.body.impuestoUID;
        if (!impuestoUID || typeof impuestoUID !== "number" || !Number.isInteger(impuestoUID) || impuestoUID <= 0) {
            const error = "El campo 'impuestoUID' debe ser un tipo numero, entero y positivo";
            throw new Error(error);
        }
        const validarImpuesto = `
                            SELECT
                            nombre,
                            "impuestoUID",
                            "tipoImpositivo",
                            "tipoValor",
                            "aplicacionSobre",
                            "estado"
                            FROM
                            impuestos
                            WHERE
                            "impuestoUID" = $1;
                            `;
        const resuelveValidarImpuesto = await conexion.query(validarImpuesto, [impuestoUID]);
        if (resuelveValidarImpuesto.rowCount === 0) {
            const error = "No existe el perfil del impuesto";
            throw new Error(error);
        }
        const perfilImpuesto = resuelveValidarImpuesto.rows[0];
        const ok = {
            ok: perfilImpuesto
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}