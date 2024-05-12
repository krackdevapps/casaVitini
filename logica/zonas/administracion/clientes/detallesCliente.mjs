import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerDetallesCliente } from "../../../repositorio/clientes/obtenerDetallesCliente.mjs";

export const detallesCliente = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const cliente = validadoresCompartidos.tipos.numero({
            number: entrada.body.cliente,
            nombreCampo: "El identificador universal del cliente (clienteUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        const detallesCliente = await obtenerDetallesCliente(cliente)
        const ok = {
            ok: detallesCliente
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}