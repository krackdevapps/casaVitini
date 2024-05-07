import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

export const detalleImpuesto = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        const impuestoUID = validadoresCompartidos.tipos.numero({
            string: entrada.body.impuestoUID,
            nombreCampo: "El identificador universal del impuesto (impuestoUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
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