import { conexion } from "../../../componentes/db.mjs";
import { mutex } from "../../../puerto.mjs";


export const guardarModificacionImpuesto = async (entrada, salida) => {
    await mutex.acquire();
    try {
        const impuestoUID = entrada.body.impuestoUID;
        let nombreImpuesto = entrada.body.nombreImpuesto;
        const tipoImpositivo = entrada.body.tipoImpositivo;
        const tipoValor = entrada.body.tipoValor;
        const aplicacionSobre = entrada.body.aplicacionSobre;
        const estado = entrada.body.estado;
        if (typeof impuestoUID !== "number" || !Number.isInteger(impuestoUID) || impuestoUID <= 0) {
            const error = "El campo 'impuestoUID' debe ser un tipo numero, entero y positivo";
            throw new Error(error);
        }
        const filtroCadena_v2 = /['"\\;\r\n<>\t\b]/g;
        if (nombreImpuesto) {
            if (typeof nombreImpuesto !== "string") {
                const error = "El impuesto debe de ser una cadena";
                throw new Error(error);
            }
            nombreImpuesto = nombreImpuesto.replace(filtroCadena_v2, '');
            if (nombreImpuesto.length === 0) {
                const error = "Revisa el nombre, ningun caracter escrito en el campo pasaporte es valido";
                throw new Error(error);
            }
        }


        const filtroTipoImpositivo = /^\d+\.\d{2}$/;
        if (tipoImpositivo?.length > 0 && (typeof tipoImpositivo !== "string" || !filtroTipoImpositivo.test(tipoImpositivo))) {
            const error = "El campo tipoImpositivo solo puede ser una cadena con un numero y dos decimlaes";
            throw new Error(error);
        }
        const filtroCadenaSinEspacio = /^[a-z0-9]+$/;
        if (tipoValor?.length > 0 && !filtroCadenaSinEspacio.test(tipoValor)) {
            const error = "El campo tipoValor solo puede ser un una cadena de minúsculas y numeros sin espacios";
            throw new Error(error);
        }
        const filtroCadena_mMN = /^[a-zA-Z0-9]+$/;
        if (aplicacionSobre?.length > 0 && !filtroCadena_mMN.test(aplicacionSobre)) {
            const error = "El campo aplicacionSobre solo puede ser un una cadena de minúsculas y numeros sin espacios";
            throw new Error(error);
        }
        if (estado?.length > 0 && estado !== "desactivado" && estado !== "activado") {
            const error = "El estado de un impuesto solo puede ser activado o desactivado";
            throw new Error(error);
        }
        if (tipoValor) {
            const validarTipoValor = `
                                SELECT 
                                "tipoValorIDV"
                                FROM "impuestoTipoValor"
                                WHERE "tipoValorIDV" = $1
                                `;
            const resuelveValidarTipoValor = await conexion.query(validarTipoValor, [tipoValor]);
            if (resuelveValidarTipoValor.rowCount === 0) {
                const error = "No existe el tipo valor verifica el campor tipoValor";
                throw new Error(error);
            }
        }
        if (aplicacionSobre) {
            const validarAplicacionSobre = `
                                SELECT 
                                "aplicacionIDV"
                                FROM "impuestosAplicacion"
                                WHERE "aplicacionIDV" = $1
                                `;
            const resuelveValidarAplicacionSobre = await conexion.query(validarAplicacionSobre, [aplicacionSobre]);
            if (resuelveValidarAplicacionSobre.rowCount === 0) {
                const error = "No existe el contexto de aplicación verifica el campor resuelveValidarAplicacionSobre";
                throw new Error(error);
            }
        }
        const validarImpuestoYActualizar = `
                                UPDATE impuestos
                                SET 
                                nombre = COALESCE($1, nombre),
                                "tipoImpositivo" = COALESCE($2, "tipoImpositivo"),
                                "tipoValor" = COALESCE($3, "tipoValor"),
                                "aplicacionSobre" = COALESCE($4, "aplicacionSobre"),
                                estado = COALESCE($5, estado)
                                WHERE "impuestoUID" = $6
                                RETURNING
                                "impuestoUID",
                                "tipoImpositivo",
                                "tipoValor",
                                "aplicacionSobre",
                                estado
                                `;
        const resuelveValidarImpuesto = await conexion.query(validarImpuestoYActualizar, [nombreImpuesto, tipoImpositivo, tipoValor, aplicacionSobre, estado, impuestoUID]);
        if (resuelveValidarImpuesto.rowCount === 0) {
            const error = "No existe el perfil del impuesto";
            throw new Error(error);
        }
        const validarImpuesto = `
                                SELECT
                                nombre,
                                "impuestoUID",
                                "tipoImpositivo",
                                "tipoValor",
                                estado,
                                "aplicacionSobre"
                                FROM
                                impuestos
                                WHERE
                                "impuestoUID" = $1;
                                `;
        const resuelveObtenerDetallesImpuesto = await conexion.query(validarImpuesto, [impuestoUID]);
        if (resuelveObtenerDetallesImpuesto.rowCount === 0) {
            const error = "No existe el perfil del impuesto";
            throw new Error(error);
        }
        const perfilImpuesto = resuelveObtenerDetallesImpuesto.rows[0];
        const ok = {
            ok: "El impuesto se ha actualizado correctamente",
            detallesImpuesto: perfilImpuesto
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
        mutex.release();
    }

}