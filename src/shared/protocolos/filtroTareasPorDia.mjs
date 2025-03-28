import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../configuracion/codigoZonaHoraria.mjs";
import { obtenerReservasPorRangoConfirmadas } from "../../infraestructure/repository/reservas/selectoresDeReservas/obtenerReservasPorRangoConfirmadas.mjs";
import { obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID } from "../../infraestructure/repository/reservas/apartamentos/obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID.mjs";

export const filtroTareasPorDia = async (data) => {

    try {
        const tareas = data.tareas
        const apartamentoIDV = data.apartamentoIDV

        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const fechaActualLocal = tiempoZH.toISODate();
        const diaAnteior = tiempoZH.minus({ day: 1 })
        const diaSiguiente = tiempoZH.plus({ day: 1 })
 
        const reservasPorRango = await obtenerReservasPorRangoConfirmadas({
            fechaIncioRango_ISO: diaAnteior,
            fechaFinRango_ISO: diaSiguiente
        })

        const clasificacionReservas = {
            diaEntrada: [],
            diaSalida: [],
            diaDuranteReserva: []
        }

        for (const r of reservasPorRango) {
            const reservaUID = r.reservaUID
            const fechaEntrada = r.fechaEntrada
            const fechaSalida = r.fechaSalida

            const apartamentoReserva = await obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID({
                apartamentoIDV,
                reservaUID
            })
            if (!apartamentoReserva) {
                continue
            }
            if (fechaEntrada === fechaActualLocal) {
                clasificacionReservas.diaEntrada.push(r)

            } else if (fechaSalida === fechaActualLocal) {
                clasificacionReservas.diaSalida.push(r)
            } else {
                clasificacionReservas.diaDuranteReserva.push(r)
            }
        }
        let tipoDiaActual = "diaSinReservas"
        if (clasificacionReservas.diaEntrada.length > 0) {
            tipoDiaActual = "diaEntrada"
        } else if (clasificacionReservas.diaSalida > 0) {
            tipoDiaActual = "diaSalida"
        } else if (clasificacionReservas.diaDuranteReserva > 0) {
            tipoDiaActual = "diaDuranteReserva"
        }

        const tareasDelDia = []
        tareas.forEach(t => {
            const tipoDiasIDV = t.tipoDiasIDV
            if (tipoDiasIDV.includes("siempre") || tipoDiasIDV.includes(tipoDiaActual)) {
                tareasDelDia.push(t)
            }
        })
        return tareasDelDia
    } catch (error) {
        throw error
    }



}