import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerPernoctanteDeLaReservaPorPernoctaneUID } from "../../../../../infraestructure/repository/reservas/pernoctantes/obtenerPernoctanteDeLaReservaPorPernoctaneUID.mjs";
import { obtenerClientePoolPorPernoctanteUID } from "../../../../../infraestructure/repository/pool/obtenerClientePoolPorPernoctanteUID.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { obtenerDetallesCliente } from "../../../../../infraestructure/repository/clientes/obtenerDetallesCliente.mjs";

export const detallesDelPernoctantePorPernoctaneUID = async (entrada, salida) => {
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

        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
        })

        const pernoctanteUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.pernoctanteUID,
            nombreCampo: "El identificador universal de la pernoctanteUID (pernoctanteUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
        })

        await obtenerReservaPorReservaUID(reservaUID);

        const pernoctante = await obtenerPernoctanteDeLaReservaPorPernoctaneUID({
            reservaUID: reservaUID,
            pernoctanteUID: pernoctanteUID
        })
        if (!pernoctante?.componenteUID) {
            const error = "No existe ningún pernoctante con ese UID dentro de la reserva";
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

            const primerApellido = cliente.primerApellido || ""
            const segundoApellido = cliente.segundoApellido || ""
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