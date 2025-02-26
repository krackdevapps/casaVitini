import { DateTime } from "luxon";
import { obtenerComportamientosPorRangoPorTipoIDV } from "../../../infraestructure/repository/comportamientoDePrecios/obtenerComportamientosPorRangoPorTipoIDV.mjs";
import { obtenerBloqueosPorRangoPorApartamentoIDV } from "../../../infraestructure/repository/bloqueos/obtenerBloqueosPorRangoPorApartamentoIDV.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";

export const bloqueosPorApartamento = async (metadatos) => {
    try {
        const fecha = metadatos.fecha
        const apartamentosIDV = metadatos.apartamentosIDV
        const filtroFecha = /^([1-9]|1[0-2])-(\d{1,})$/;
        if (!filtroFecha.test(fecha)) {
            const error = "La fecha no cumple el formato específico para el calendario. En este caso se espera una cadena con este formado MM-YYYY. Si el mes tiene un dígito, es un dígito, sin el cero delante."
            throw new Error(error)
        }

        const fechaArray = fecha.split("-")
        const mes = fechaArray[0]
        const ano = fechaArray[1]
        const fechaObjeto = DateTime.fromObject({ year: ano, month: mes, day: 1 }, { zone: 'utc' });
        const numeroDeDiasDelMes = fechaObjeto.daysInMonth;
        const calendarioObjeto = {}
        for (let numeroDia = 1; numeroDia <= numeroDeDiasDelMes; numeroDia++) {

            const diaISO = String(numeroDia).padStart(2, "0")
            const mesISO = String(mes).padStart(2, "0")

            const llaveCalendarioObjeto = `${ano}-${mesISO}-${diaISO}`
            calendarioObjeto[llaveCalendarioObjeto] = []
        }
        const fechaFinRangoObjeto = DateTime.fromObject({ year: ano, month: mes, day: numeroDeDiasDelMes }, { zone: 'utc' });

        const ok = {
            eventosMes: calendarioObjeto,
            eventosEnDetalle: []
        }

        const obtenerFechasInternas = (fechaInicio_ISO, fechaFin_ISO) => {
            const inicio = DateTime.fromISO(fechaInicio_ISO);
            const fin = DateTime.fromISO(fechaFin_ISO);
            const fechasInternas = [];
            for (let i = 0; i <= fin.diff(inicio, "days").days; i++) {
                const fechaActual = inicio.plus({ days: i });
                fechasInternas.push(fechaActual.toISODate());
            }
            return fechasInternas;
        }

        const bloqueosPorApartamento = await obtenerBloqueosPorRangoPorApartamentoIDV({
            fechaInicio: fechaObjeto.toISODate(),
            fechaFin: fechaFinRangoObjeto.toISODate(),
            apartamentosIDV_array: apartamentosIDV,
            zonaBloqueoIDV_array: ["publica", "privada", "global"]
        })

        for (const comportamiento of bloqueosPorApartamento) {
            const bloqueoUID = comportamiento.bloqueoUID
            const apartamentoIDV = comportamiento.apartamentoIDV
            const fechaEntrada = comportamiento.fechaInicio
            const fechaSalida = comportamiento.fechaFin
            const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDV: apartamentoIDV,
                errorSi: "noExiste"
            })
            const apartamentoUI = apartamento.apartamentoUI
            comportamiento.apartamentoUI = apartamentoUI

            comportamiento.contenedorFechasDelEvento = [{
                fechaEntrada: fechaEntrada,
                fechaSalida: fechaSalida,
                duracion_en_dias: comportamiento.duracion_en_dias + 1
            }]

            comportamiento.tipoEvento = "bloqueoPorApartamento"
            comportamiento.eventoUID = "bloqueoPorApartamento_" + bloqueoUID
            const arrayConFechasInternas = obtenerFechasInternas(fechaEntrada, fechaSalida)
            for (const fechaInterna_ISO of arrayConFechasInternas) {
                const fechaInternaObjeto = DateTime.fromISO(fechaInterna_ISO)
                const diaFechaInterna = fechaInternaObjeto.day
                const mesFechaInterna = fechaInternaObjeto.month
                const anoFechaInterna = fechaInternaObjeto.year
                const fechaInternaHumana = `${anoFechaInterna}-${String(mesFechaInterna).padStart(2, "0")}-${String(diaFechaInterna).padStart(2, "0")}`
                const estructuraReservaEnDia = {
                    eventoUID: "bloqueoPorApartamento_" + bloqueoUID,
                    fechaEntrada: fechaEntrada,
                    fechaSalida: fechaSalida
                }
                if (calendarioObjeto[fechaInternaHumana]) {
                    calendarioObjeto[fechaInternaHumana].push(estructuraReservaEnDia)
                }
            }
        }
        ok.eventosEnDetalle.push(...bloqueosPorApartamento)

        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
