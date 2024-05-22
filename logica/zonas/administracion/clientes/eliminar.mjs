import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

import { obtenerDetallesCliente } from "../../../repositorio/clientes/obtenerDetallesCliente.mjs";
import { eliminarCliente } from "../../../repositorio/clientes/eliminarCliente.mjs";

export const eliminar = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const clienteUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.clienteUID,
            nombreCampo: "El identificador universal del cliente (clienteUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        await obtenerDetallesCliente(clienteUID)
        await eliminarCliente(clienteUID)
        const ok = {
            ok: "Se ha eliminado correctamente el cliente",
            clienteUID: clienteUID
        };
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }
}