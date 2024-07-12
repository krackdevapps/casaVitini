import { DateTime } from "luxon";
import { validadoresCompartidos } from "../../../../../sistema/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { obtenerPernoctanteDeLaReservaPorPernoctaneUID } from "../../../../../repositorio/reservas/pernoctantes/obtenerPernoctanteDeLaReservaPorPernoctaneUID.mjs";
import { actualizarFechaCheckOutPernoctante } from "../../../../../repositorio/reservas/pernoctantes/actualizarFechaCheckOutPernoctante.mjs";
import { campoDeTransaccion } from "../../../../../repositorio/globales/campoDeTransaccion.mjs";

export const confirmarFechaCheckOutAdelantado = async (entrada, salida) => {

    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        const pernoctanteUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.pernoctanteUID,
            nombreCampo: "El identificador universal de la reserva (pernoctanteUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        const fechaCheckOut = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: entrada.body.fechaCheckOut,
            nombreCampo: "La fecha de checkout"
        })
        const fechaCheckOut_Objeto = DateTime.fromISO(fechaCheckOut);
        await campoDeTransaccion("iniciar")


        // Validar pernoctanteUID
        const pernoctate = await obtenerPernoctanteDeLaReservaPorPernoctaneUID({
            reservaUID,
            pernoctanteUID
        })
        if (!pernoctate.componenteUID) {
            const error = "No existe el pernoctante en la reserva, revisa el pernoctanteUID";
            throw new Error(error);
        }
        // Validar que el pernoctatne sea cliente y no cliente pool
        if (!pernoctate.clienteUID) {
            const error = "El pernoctante esta pendiente de validacion documental. Valide primero la documentacion antes de hacer el checkin";
            throw new Error(error);
        }
        const fechaCheckIn = pernoctate.fechaCheckIn;
        if (!fechaCheckIn) {
            const error = "No puedes determinar un checkout adelantado a un pernoctante que no ha reazliado el checkin. Primero realiza el checkin";
            throw new Error(error);
        }

        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        // validar que la reserva no este cancelada
        const estadoReserva = reserva.estadoReservaIDV;
        if (estadoReserva === "cancelada") {
            const error = "No se puede alterar una fecha de checkin de una reserva cancelada";
            throw new Error(error);
        }
        const fechaEntrada = reserva.fechaEntrada;
        const fechaEntrada_Objeto = DateTime.fromISO(fechaEntrada);
        const fechaSalida = reserva.fechaSalida;
        const fechaSalida_Objeto = DateTime.fromISO(fechaSalida);
        if (fechaCheckOut_Objeto >= fechaSalida_Objeto) {
            const error = "La fecha de Checkout adelantado no puede ser superior o igual a la fecha de salida de la reserva, si el checkout se hace el mismo dia que finaliza la reserva no hace falta has un checkout adelantado";
            throw new Error(error);
        }
        if (fechaCheckIn) {
            const fechaCheckIn_Objeto = DateTime.fromISO(fechaCheckIn);
            if (fechaCheckIn_Objeto >= fechaCheckOut_Objeto) {
                const error = "La fecha de Checkout no puede ser igual o inferior a la fecha de checkin";
                throw new Error(error);
            }
        }
        if (fechaCheckOut_Objeto <= fechaEntrada_Objeto) {
            const error = "La fecha de Checkout no puede ser inferior o igual a la fecha de entrada de la reserva";
            throw new Error(error);
        }
        await actualizarFechaCheckOutPernoctante({
            fechaCheckOut,
            pernoctanteUID
        })
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado la fecha de checkin correctamente",
            fechaCheckOut: fechaCheckOut
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}