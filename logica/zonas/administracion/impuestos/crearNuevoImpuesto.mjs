import { conexion } from "../../../componentes/db.mjs";
export const crearNuevoImpuesto = async (entrada, salida) => {
    await mutex.acquire();
    try {
        let nombreImpuesto = entrada.body.nombreImpuesto;
        const tipoImpositivo = entrada.body.tipoImpositivo;
        const tipoValor = entrada.body.tipoValor;
        const aplicacionSobre = entrada.body.aplicacionSobre;
        const filtroCadena_v2 = /['"\\;\r\n<>\t\b]/g;

        if (!nombreImpuesto) {
            const error = "El campo nombreImpuesto solo puede ser un una cadena de minúsculas";
            throw new Error(error);
        }
        nombreImpuesto = nombreImpuesto.replace(filtroCadena_v2, '');
        if (nombreImpuesto.length === 0) {
            const error = "Revisa el nombre del impuesto, ningun caracter escrito en el campo pasaporte es valido";
            throw new Error(error);
        }

        const filtroTipoImpositivo = /^\d+\.\d{2}$/;
        if (!tipoImpositivo || (typeof tipoImpositivo !== "string" || !filtroTipoImpositivo.test(tipoImpositivo))) {
            const error = "El campo tipoImpositivo solo puede ser una cadena con un numero y dos decimlaes";
            throw new Error(error);
        }
        const filtroCadenaSinEspacio = /^[a-z0-9]+$/;
        if (!tipoValor || !filtroCadenaSinEspacio.test(tipoValor)) {
            const error = "El campo tipoValor solo puede ser un una cadena de minúsculas y numeros sin espacios";
            throw new Error(error);
        }
        const filtroCadena_mMN = /^[a-zA-Z0-9]+$/;
        if (!aplicacionSobre || !filtroCadena_mMN.test(aplicacionSobre)) {
            const error = "El campo aplicacionSobre solo puede ser un una cadena de minúsculas y numeros sin espacios";
            throw new Error(error);
        }
        // if (!moneda || !filtroCadenaSinEspacio.test(moneda)) {
        //     const error = "El campo moneda solo puede ser un una cadena de minúsculas y numeros sin espacios"
        //     throw new Error(error)
        // }
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
        // if (moneda) {
        //     const validarMoneda = `
        // SELECT 
        // "monedaIDV"
        // FROM monedas
        // WHERE "monedaIDV" = $1
        // `
        //     const resuelveValidarMoneda = await conexion.query(validarMoneda, [moneda])
        //     if (resuelveValidarMoneda.rowCount === 0) {
        //         const error = "No existe la moneda, verifica el campo moneda"
        //         throw new Error(error)
        //     }
        // }
        const validarImpuestoYActualizar = `
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
        const nuevoImpuesto = [
            nombreImpuesto,
            tipoImpositivo,
            tipoValor,
            aplicacionSobre,
            "desactivado"
        ];
        const resuelveValidarImpuesto = await conexion.query(validarImpuestoYActualizar, nuevoImpuesto);
        const nuevoUIDImpuesto = resuelveValidarImpuesto.rows[0].idv;
        const ok = {
            ok: "Se ha creado el nuevo impuesto",
            nuevoImpuestoUID: nuevoUIDImpuesto
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