import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerNombreMonedaUI } from "../../../repositorio/precios/obtenerNombreMonedaUI.mjs";

export const resolverMoneda = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const monedaIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.monedaIDV,
            nombreCampo: "El campo apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        const transaccionInterna = await obtenerNombreMonedaUI(monedaIDV);
        salida.json(transaccionInterna);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}