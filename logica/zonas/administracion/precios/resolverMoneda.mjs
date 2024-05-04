import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { resolverMoneda as resolverMoneda_ } from "../../../sistema/sistemaDeResolucion/resolverMoneda.mjs";

export const resolverMoneda = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        let monedaIDV = entrada.body.monedaIDV;
        const filtroCadena = /^[a-z]+$/;
        if (!monedaIDV || !filtroCadena.test(monedaIDV)) {
            const error = "El campo monedaIDV solo puede ser un una cadena de minúsculas";
            throw new Error(error);
        }
        const transaccionInterna = await resolverMoneda_(monedaIDV);
        salida.json(transaccionInterna);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}