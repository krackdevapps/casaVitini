import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerPernoctanteDeLaReservaPorPernoctaneUID } from "../../../../../repositorio/reservas/pernoctantes/obtenerPernoctanteDeLaReservaPorPernoctaneUID.mjs";
import { obtenerClientePoolPorPernoctanteUID } from "../../../../../repositorio/pool/obtenerClientePoolPorPernoctanteUID.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { obtenerDetallesCliente } from "../../../../../repositorio/clientes/obtenerDetallesCliente.mjs";

export const detallesDelPernoctantePorPernoctaneUID = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const pernoctanteUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.pernoctanteUID,
            nombreCampo: "El identificador universal de la pernoctanteUID (pernoctanteUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        await obtenerReservaPorReservaUID(reservaUID);

        const pernoctante = await obtenerPernoctanteDeLaReservaPorPernoctaneUID({
            reservaUID: reservaUID,
            pernoctanteUID: pernoctanteUID
        })
        if (!pernoctante?.componenteUID) {
            const error = "No existe ningun pernoctante con ese UID dentro del la reserva";
            throw new Error(error);
        }
        const clienteUID = pernoctante.clienteUID;
        const ok = {
            ok: {
                pernoctante
            }
        }

        if (clienteUID) {
            const cliente = await obtenerDetallesCliente(clienteUID)
            const nombre = cliente.nombre
            const mail = cliente.mail
            const telefono = cliente.telefono

            const primerApellido = cliente.primerApellidos
            const segundoApellido = cliente.segundoApellido
            const nombreCompleto = `${nombre} ${primerApellido} ${segundoApellido}`
            const pasaporte = cliente.pasaporte;

            ok.ok.cliente = {
                clienteUID,
                telefono,
                mail,
                nombreCompleto,
                pasaporte,
                tipoPernoctante: "cliente"
            }

        } else {
            const clientePool = await obtenerClientePoolPorPernoctanteUID(pernoctanteUID)
            const nombreCompleto = clientePool.nombreCompleto;
            const pasaporte = clientePool.pasaporte;
            const clienteUID = clientePool.clienteUID

            ok.ok.cliente = {
                clienteUID,
                nombreCompleto,
                pasaporte,
                tipoPernoctante: "clientePool"
            }
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}