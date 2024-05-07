import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { resolverMoneda as resolverMoneda_ } from "../../../sistema/sistemaDeResolucion/resolverMoneda.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

export const resolverMoneda = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        const monedaIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.monedaIDV,
            nombreCampo: "El campo apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        const transaccionInterna = await resolverMoneda_(monedaIDV);
        salida.json(transaccionInterna);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}