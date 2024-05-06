import { Mutex } from "async-mutex";
import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
export const guardarModificacionImpuesto = async (entrada, salida) => {
    let mutex
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        mutex = new Mutex
        await mutex.acquire();

        const impuestoUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.impuestoUID,
            nombreCampo: "El UID del impuesto",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
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
        const estado = validadoresCompartidos.tipos.cadena({
            string: entrada.body.estado,
            nombreCampo: "El campo de la aplicacion sobre",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })


        // Validar si el nombre del impuesto es unico
        const consultaNombreImpuesto = `
           SELECT 
           nombre
           FROM impuestos
           WHERE LOWER(nombre) = LOWER($1)
           AND
           "impuestoUID" <> $2
           `;
        const resuelveValidarNombreImpuesto = await conexion.query(consultaNombreImpuesto, [nombreImpuesto, impuestoUID]);
        if (resuelveValidarNombreImpuesto.rowCount > 0) {
            const error = "Ya existe un impuesto con ese nombre exacto. Por favor selecciona otro nombre para este impuesto con el fin de tener nombres unicos en los impuestos y poder distingirlos correctamente.";
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
        if (mutex) {
            mutex.release();
        }
    }
}