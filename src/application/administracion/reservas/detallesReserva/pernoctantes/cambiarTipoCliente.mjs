import { Mutex } from "async-mutex";

import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerDetallesCliente } from "../../../../../infraestructure/repository/clientes/obtenerDetallesCliente.mjs";
import { obtenerPernoctanteDeLaReservaPorClienteUID } from "../../../../../infraestructure/repository/reservas/pernoctantes/obtenerPernoctanteDeLaReservaPorClienteUID.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { actualizarPernoctantePoolPorClienteUID } from "../../../../../infraestructure/repository/reservas/pernoctantes/actualizarPernoctantePoolPorClienteUID.mjs";
import { eliminarClienteDelPool } from "../../../../../infraestructure/repository/pool/eliminarClienteDelPool.mjs";
import { obtenerReservasPorRango } from "../../../../../infraestructure/repository/reservas/selectoresDeReservas/obtenerReservasPorRango.mjs";
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";

export const cambiarTipoCliente = async (entrada, salida) => {
    const mutex = new Mutex()
    try {
        const m = "Funcion deshabilitada"
        throw new Error(m)



        await mutex.acquire();
        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })

        const pernoctanteUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.pernoctanteUID,
            nombreCampo: "El identificador universal de la pernoctanteUID (pernoctanteUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })
        const clienteUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.clienteUID,
            nombreCampo: "El identificador universal de la clienteUID (clienteUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
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


        const cliente = await obtenerDetallesCliente(clienteUID)
        const nombre = cliente.nombre;
        const primerApellido = cliente.primerApellido || "";
        const segundoApellido = cliente.segundoApellido || "";
        const nombreCompleto = `${nombre} ${primerApellido} ${segundoApellido}`;
        const pasaporte = cliente.segundoApellido;

        const clienteComoPernoctanteEnLaReserva = await obtenerPernoctanteDeLaReservaPorClienteUID({
            reservaUID: reservaUID,
            clienteUID: clienteUID
        })
        if (clienteComoPernoctanteEnLaReserva.componenteUID) {
            const error = "Este cliente ya es un pernoctante dentro de esta reserva, mejor muévalo de habitación";
            throw new Error(error);
        }

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
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}