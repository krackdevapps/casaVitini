import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";

export const opcionesCrearImpuesto = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        let opcionesTipoValor = [];
        let opcionesAplicacionSobre = [];
        let opcionesMonedas = [];
        const validarTipoValor = `
                            SELECT 
                            "tipoValorIDV", "tipoValorUI", simbolo
                            FROM "impuestoTipoValor"
                            `;
        const resuelveValidarTipoValor = await conexion.query(validarTipoValor);
        if (resuelveValidarTipoValor.rowCount > 0) {
            opcionesTipoValor = resuelveValidarTipoValor.rows;
        }
        const validarAplicacionSobre = `
                            SELECT 
                            "aplicacionIDV", "aplicacionUI"
                            FROM "impuestosAplicacion"
                            `;
        const resuelveValidarAplicacionSobre = await conexion.query(validarAplicacionSobre);
        if (resuelveValidarAplicacionSobre.rowCount > 0) {
            opcionesAplicacionSobre = resuelveValidarAplicacionSobre.rows;
        }
        const validarMoneda = `
                            SELECT 
                            "monedaIDV", "monedaUI", simbolo
                            FROM monedas
                            `;
        const resuelveValidarMoneda = await conexion.query(validarMoneda);
        if (resuelveValidarMoneda.rowCount > 0) {
            opcionesMonedas = resuelveValidarMoneda.rows;
        }
        const detallesImpuesto = {
            "tipoValor": opcionesTipoValor,
            "aplicacionSobre": opcionesAplicacionSobre,
            "moneda": opcionesMonedas
        };
        const ok = {
            "ok": detallesImpuesto
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
    }

}