import { conexion } from "../globales/db.mjs";
export const obtenerNombreMonedaUI = async (moneda) => {
    try {
        const monedaIDV = moneda
        const filtroCadena = /^[a-z]+$/;
        if (!monedaIDV || !filtroCadena.test(monedaIDV)) {
            const error = "El campo monedaIDV solo puede ser una cadena de minúsculas."
            throw new Error(error)
        }
        const seleccionarMoneda = `
        SELECT
        "monedaIDV", "monedaUI", simbolo
        FROM 
        monedas
        WHERE "monedaIDV" = $1
        `
        const resuelveSeleccionarMoneda = await conexion.query(seleccionarMoneda, [monedaIDV])
        if (resuelveSeleccionarMoneda.rowCount === 0) {
            const error = "No existe la moneda"
            throw new Error(error)
        }
        const detallesMoneda = resuelveSeleccionarMoneda.rows[0]
        monedaIDV = detallesMoneda.monedaIDV
        const monedaUI = detallesMoneda.monedaUI
        const simbolo = detallesMoneda.simbolo
        const ok = {
            monedaIDV: monedaIDV,
            monedaUI: monedaUI,
            simbolo: simbolo
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}
