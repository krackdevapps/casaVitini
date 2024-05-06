import { Mutex } from "async-mutex";
import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

export const crearNuevoImpuesto = async (entrada, salida) => {
    let mutex
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        const mutex = new Mutex()
        await mutex.acquire();

        const nombreImpuesto = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nombreImpuesto,
            nombreCampo: "El nombre del impuesto",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const tipoImpositivo = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoImpositivo,
            nombreCampo: "El tipo impositivo",
            filtro: "cadenaConNumerosConDosDecimales",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        
        })

        const tipoValor = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoValor,
            nombreCampo: "El tipo valor",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const aplicacionSobre = validadoresCompartidos.tipos.cadena({
            string: entrada.body.aplicacionSobre,
            nombreCampo: "El campo de la aplicacion sobre",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })


        // Validar si el nombre del impuesto es unico
        const consultaNombreImpuesto = `
        SELECT 
        nombre
        FROM impuestos
        WHERE LOWER(nombre) = LOWER($1)
        `;
        const resuelveValidarNombreImpuesto = await conexion.query(consultaNombreImpuesto, [nombreImpuesto]);
        if (resuelveValidarNombreImpuesto.rowCount > 0) {
            const error = "Ya existe un impuesto con ese nombre exacto. Por favor selecciona otro nombre para este impuesto con el fin de tener nombres unicos en los impuestos y poder distingirlos correctamente.";
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
        if (mutex) {
            mutex.release();
        }
    }
}