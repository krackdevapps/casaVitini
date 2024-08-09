import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerDetallesCliente } from "../../../../../repositorio/clientes/obtenerDetallesCliente.mjs";
import { obtenerPernoctanteDeLaReservaPorClienteUID } from "../../../../../repositorio/reservas/pernoctantes/obtenerPernoctanteDeLaReservaPorClienteUID.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { actualizarPernoctantePoolPorClienteUID } from "../../../../../repositorio/reservas/pernoctantes/actualizarPernoctantePoolPorClienteUID.mjs";
import { eliminarClienteDelPool } from "../../../../../repositorio/pool/eliminarClienteDelPool.mjs";
import { obtenerReservasPorRango } from "../../../../../repositorio/reservas/selectoresDeReservas/obtenerReservasPorRango.mjs";
import { campoDeTransaccion } from "../../../../../repositorio/globales/campoDeTransaccion.mjs";

export const cambiarTipoCliente = async (entrada, salida) => {
    const mutex = new Mutex()
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        await mutex.acquire();
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
        const clienteUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.clienteUID,
            nombreCampo: "El identificador universal de la clienteUID (clienteUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        if (reserva.estadoReservaIDV === "cancelada") {
            const error = "La reserva no se puede modificar porque está cancelada.";
            throw new Error(error);
        }
        const fechaEntrada = reserva.fechaEntrada;
        const fechaSalida = reserva.fechaSalida;
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
            const error = "Este cliente ya es un pernoctante dentro de esta reserva, mejor muévalo de habitación";
            throw new Error(error);
        }
        // Buscar reservas que interfieren para verificar que el pernoctante no esta en otra reserva del mismo rango
        const selectorReservaInterfirientes = await obtenerReservasPorRango({
            fechaInicioRango_ISO: fechaEntrada,
            fechaSalidaRango_ISO: fechaSalida
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
            const error = "Este cliente no se puede añadir a esta reserva porque está en otra reserva cuyo rango de fecha coincide con esta. Dicho de otra manera, si se añadiese este cliente en esta reserva, puede que en un día o en más de un día este cliente estaría asignado a un apartamento distingo en fechas coincidentes.";
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
            ok: "Se ha actualizado el pernoctante correctamente",
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