import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";


export const opcionesEditarImpuesto = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        const opcionesTipoValor = [];
        const opcionesAplicacionSobre = [];
        const opcionesMonedas = [];
        const validarTipoValor = `
                            SELECT 
                            "tipoValorIDV", "tipoValorUI", simbolo
                            FROM "impuestoTipoValor"
                            `;
        const resuelveValidarTipoValor = await conexion.query(validarTipoValor);
        if (resuelveValidarTipoValor.rowCount > 0) {
            opcionesTipoValor.push(...resuelveValidarTipoValor.rows);
        }
        const validarAplicacionSobre = `
                            SELECT 
                            "aplicacionIDV", "aplicacionUI"
                            FROM "impuestosAplicacion"
                            `;
        const resuelveValidarAplicacionSobre = await conexion.query(validarAplicacionSobre);
        if (resuelveValidarAplicacionSobre.rowCount > 0) {
            opcionesAplicacionSobre.push(...resuelveValidarAplicacionSobre.rows);
        }
        const detallesImpuesto = {
            tipoValor: opcionesTipoValor,
            aplicacionSobre: opcionesAplicacionSobre,
            //moneda: opcionesMonedas
        };
        const ok = {
            ok: detallesImpuesto
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
    }
}