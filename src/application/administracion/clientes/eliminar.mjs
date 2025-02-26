import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";

import { obtenerDetallesCliente } from "../../../infraestructure/repository/clientes/obtenerDetallesCliente.mjs";
import { eliminarClientePorClienteUID } from "../../../infraestructure/repository/clientes/eliminarClientePorClienteUID.mjs";

export const eliminar = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const clienteUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.clienteUID,
            nombreCampo: "El identificador universal del cliente (clienteUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no",
            devuelveUnTipoNumber: "si"
        })
        await obtenerDetallesCliente(clienteUID)
        await eliminarClientePorClienteUID(clienteUID)
        const ok = {
            ok: "Se ha eliminado correctamente el cliente",
            clienteUID: clienteUID
        };
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }
}