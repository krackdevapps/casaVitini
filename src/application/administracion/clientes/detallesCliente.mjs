import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerDetallesCliente } from "../../../infraestructure/repository/clientes/obtenerDetallesCliente.mjs";

export const detallesCliente = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
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
            devuelveUnTipoNumber: "si"
        })
        const detallesCliente = await obtenerDetallesCliente(clienteUID)
        const ok = {
            ok: detallesCliente
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}