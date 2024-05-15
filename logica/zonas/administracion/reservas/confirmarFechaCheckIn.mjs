import { DateTime } from "luxon";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerPernoctanteDeLaReservaPorPernoctaneUID } from "../../../repositorio/reservas/pernoctantes/obtenerPernoctanteDeLaReservaPorPernoctaneUID.mjs";
import { obtenerReservaPorReservaUID } from "../../../repositorio/reservas/obtenerReservaPorReservaUID.mjs";
import { actualizarFechaCheckinPernoctante } from "../../../repositorio/reservas/pernoctantes/actualizarFechaCheckinPernoctante.mjs";

export const confirmarFechaCheckIn = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const pernoctantaUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.pernoctantaUID,
            nombreCampo: "El identificador universal de pernoctantaUID",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no",
            devuelveUnTipoNumber: "si"
        })
        const reservaUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de reservaUID",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no",
            devuelveUnTipoNumber: "si"
        })

        const fechaCheckIn_ISO = entrada.body.fechaCheckIn_ISO;
        await validadoresCompartidos.fechas.validarFecha_ISO(fechaCheckIn_ISO)
        const fechaCheckIn_Objeto = DateTime.fromISO(fechaCheckIn_ISO);
        await campoDeTransaccion("iniciar")

        // Validar pernoctanteUID
        const pernoctate = await obtenerPernoctanteDeLaReservaPorPernoctaneUID({
            reservaUID: reservaUID,
            pernoctantaUID: pernoctantaUID
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
        const checkoutAdelantado_ISO = pernoctate.fechaCheckOutAdelantado;
        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        // validar que la reserva no este cancelada
        const estadoReserva = reserva.estadoReservaIDV;
        if (estadoReserva === "cancelada") {
            const error = "No se puede alterar una fecha de checkin de una reserva cancelada";
            throw new Error(error);
        }
        const fechaEntrada_ISO = reserva.fechaEntrada;
        const fechaEntrada_Objeto = DateTime.fromISO(fechaEntrada_ISO);
        const fechaSalida_ISO = reserva.fechaSalida;
        const fechaSalida_Objeto = DateTime.fromISO(fechaSalida_ISO);
        if (fechaCheckIn_Objeto < fechaEntrada_Objeto) {
            const error = "La fecha de Checkin no puede ser inferior a la fecha de entrada de la reserva";
            throw new Error(error);
        }

        if (checkoutAdelantado_ISO) {
            const checkoutAdelantado_Objeto = DateTime.fromISO(checkoutAdelantado_ISO);
            if (fechaCheckIn_Objeto >= checkoutAdelantado_Objeto) {
                const error = "La fecha de Checkin no puede ser igual o superior a la fecha de checkout adelantado";
                throw new Error(error);
            }
        }
        if (fechaCheckIn_Objeto >= fechaSalida_Objeto) {
            const error = "La fecha de Checkin no puede ser igual o superior a la fecha de salida de la reserva";
            throw new Error(error);
        }
        await actualizarFechaCheckinPernoctante({
            fechaCheckIn_ISO: fechaCheckIn_ISO,
            pernoctantaUID: pernoctantaUID
        })
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado la fecha de checkin correctamente",
            fechaCheckIn: fechaCheckIn
        };
        salida.json(ok);
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}