import { Mutex } from "async-mutex";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { obtenerDetallesCliente } from "../../../infraestructure/repository/clientes/obtenerDetallesCliente.mjs";
import { actualizarPernoctanteEnReservaPorClienteUID } from "../../../infraestructure/repository/clientes/actualizarPernoctanteEnReservaPorClienteUID.mjs";
import { actualizarTitularEnReservaPorClienteUID } from "../../../infraestructure/repository/clientes/actualizarTitularEnReservaPorClienteUID.mjs";
import { campoDeTransaccion } from "../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { eliminarClientePorClienteUID } from "../../../infraestructure/repository/clientes/eliminarClientePorClienteUID.mjs";

export const fusion = async (entrada, salida) => {
    const mutex = new Mutex();
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })
        await mutex.acquire();
        const clienteUID_origen = validadoresCompartidos.tipos.cadena({
            string: entrada.body.clienteUID_origen,
            nombreCampo: "El identificador universal del cliente (clienteUID_origen)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
        })
        const clienteUID_destino = validadoresCompartidos.tipos.cadena({
            string: entrada.body.clienteUID_destino,
            nombreCampo: "El identificador universal del cliente (clienteUID_destino)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
        })
        await campoDeTransaccion("iniciar")

        try {
            await obtenerDetallesCliente(clienteUID_origen)
        } catch (error) {
            const m = "No existe el cliente de origen"
            throw new Error(m)
        }
        try {
            await obtenerDetallesCliente(clienteUID_destino)
        } catch (error) {
            const m = "No existe el cliente de destino"
            throw new Error(m)
        }

        if (clienteUID_destino === clienteUID_origen) {
            const m = "El cliente de ORIGEN y el cliente de DESTINO es el mismo."
            throw new Error(m)
        }

        await actualizarPernoctanteEnReservaPorClienteUID({
            clienteUID_origen,
            clienteUID_destino
        })

        await actualizarTitularEnReservaPorClienteUID({
            clienteUID_origen,
            clienteUID_destino
        })

        await eliminarClientePorClienteUID(clienteUID_origen)

        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha completado la fusión",
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}