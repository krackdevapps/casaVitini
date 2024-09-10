import { DateTime } from "luxon";
import { validadoresCompartidos } from "../../../../../sistema/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs";
import { obtenerPernoctanteDeLaReservaPorPernoctaneUID } from "../../../../../repositorio/reservas/pernoctantes/obtenerPernoctanteDeLaReservaPorPernoctaneUID.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { actualizarFechaCheckinPernoctante } from "../../../../../repositorio/reservas/pernoctantes/actualizarFechaCheckinPernoctante.mjs";
import { campoDeTransaccion } from "../../../../../repositorio/globales/campoDeTransaccion.mjs";


export const confirmarFechaCheckIn = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 3
        })

        const pernoctanteUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.pernoctanteUID,
            nombreCampo: "El identificador universal de la pernoctantaUID (pernoctantaUID)",
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


        const fechaCheckIn = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: entrada.body.fechaCheckIn,
            nombreCampo: "La fecha de checkin"
        })
        const fechaCheckIn_Objeto = DateTime.fromISO(fechaCheckIn);
        await campoDeTransaccion("iniciar")

        // Validar pernoctanteUID
        const pernoctate = await obtenerPernoctanteDeLaReservaPorPernoctaneUID({
            reservaUID: reservaUID,
            pernoctanteUID: pernoctanteUID
        })
        if (!pernoctate.componenteUID) {
            const error = "No existe el pernoctante en la reserva, revisa el pernoctanteUID";
            throw new Error(error);
        }
        // Validar que el pernoctatne sea cliente y no cliente pool
        if (!pernoctate.clienteUID) {
            const error = "El pernoctante está pendiente de validación documental. Valide primero la documentación antes de hacer el check-in";
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
        const fechaEntrada = reserva.fechaEntrada;
        const fechaEntrada_Objeto = DateTime.fromISO(fechaEntrada);
        const fechaSalida = reserva.fechaSalida;
        const fechaSalida_Objeto = DateTime.fromISO(fechaSalida);
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
            fechaCheckIn,
            pernoctanteUID
        })
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado la fecha de checkin correctamente",
            fechaCheckIn: fechaCheckIn
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}