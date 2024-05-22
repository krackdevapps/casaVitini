import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

import { obtenerDetallesCliente } from "../../../repositorio/clientes/obtenerDetallesCliente.mjs";
import { obtenerPernoctanteDeLaReservaPorClienteUID } from "../../../repositorio/reservas/pernoctantes/obtenerPernoctanteDeLaReservaPorClienteUID.mjs";
import { obtenerReservaPorReservaUID } from "../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { actualizarPernoctantePoolPorClienteUID } from "../../../repositorio/reservas/pernoctantes/actualizarPernoctantePoolPorClienteUID.mjs";
import { eliminarClienteDelPool } from "../../../repositorio/clientes/eliminarClienteDelPool.mjs";
import { reservasPorRango } from "../../../repositorio/reservas/selectoresDeReservas/reservasPorRango.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";

export const cambiarTipoCliente = async (entrada, salida) => {
    const mutex = new Mutex()
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        await mutex.acquire();

        const reservaUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const pernoctanteUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.pernoctanteUID,
            nombreCampo: "El identificador universal de la pernoctante (pernoctanteUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        const clienteUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.clienteUID,
            nombreCampo: "El identificador universal de la cliente (clienteUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        if (reserva.estadoReservaIDV === "cancelada") {
            const error = "La reserva no se puede modificar por que esta cancelada";
            throw new Error(error);
        }
        const fechaEntrada_ISO = reserva.fechaEntrada;
        const fechaSalida_ISO = reserva.fechaSalida_ISO;
        const estadoReservaCancelado = "cancelada";

        await campoDeTransaccion("iniciar")

        // validar cliente
        const cliente = await obtenerDetallesCliente(clienteUID)
        const nombre = cliente.nombre;
        const primerApellido = cliente.primerApellido || "";
        const segundoApellido = cliente.segundoApellido || "";
        const nombreCompleto = `${nombre} ${primerApellido} ${segundoApellido}`;
        const pasaporte = cliente.segundoApellido;
        // No se puede anadir un pernoctante ya existen a la reserva, proponer moverlo de habitacion
        const clienteComoPernoctanteEnLaReserva = await obtenerPernoctanteDeLaReservaPorClienteUID({
            reservaUID: reservaUID,
            clienteUID: clienteUID
        })
        if (clienteComoPernoctanteEnLaReserva.componenteUID) {
            const error = "Este cliente ya es un pernoctante dentro de esta reserva, mejor muevalo de habitacion";
            throw new Error(error);
        }
        // Buscar reservas que interfieren para verificar que el pernoctante no esta en otra reserva del mismo rango
        const selectorReservaInterfirientes = await reservasPorRango({
            fechaInicioRango_ISO: fechaEntrada_ISO,
            fechaSalidaRango_ISO: fechaSalida_ISO
        })
        let interruptorClienteEncontrado;
        if (selectorReservaInterfirientes.length > 0) {
            for (const reserva of selectorReservaInterfirientes) {
                const reservaUID_Interfiriente = reserva.reservaUID;
                const clienteEnOtraReserva = await obtenerPernoctanteDeLaReservaPorClienteUID({
                    clienteUID: clienteUID,
                    reservaUID: reservaUID_Interfiriente
                })
                if (clienteEnOtraReserva.clienteUID) {
                    interruptorClienteEncontrado = "encontrado";
                    break;
                }
            }
        }
        if (interruptorClienteEncontrado === "encontrado") {
            const error = "Este cliente no se puede anadir a esta reserva por que esta en otra reserva cuyo rango de fecha coincide con esta, dicho de otra manera, si se anadiese este cliente en esta reserva, puede que en un dia o en mas de un dia este cliente estaria asignado a un apartmento distingo en fechas coincidentes";
            throw new Error(error);
        }
        const pernoctanteActualizado = await actualizarPernoctantePoolPorClienteUID({
            reservaUID: reservaUID,
            pernoctanteUID: pernoctanteUID,
            clienteUID: clienteUID
        })
        await eliminarClienteDelPool(pernoctanteUID)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha acualizado el pernoctante correctamente",
            pernoctanteUID: pernoctanteUID,
            habitacionUID: pernoctanteActualizado.habitacion,
            nombreCompleto: nombreCompleto,
            pasaporte: pasaporte
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorFinal
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}