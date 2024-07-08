import { DateTime } from "luxon";


import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { eventosCalendarioPorUID } from "../../../../calendariosSincronizados/airbnb/eventosCalendarioPorUID.mjs";
import { obtenerCalendarioPorCalendarioUID } from "../../../../../repositorio/calendario/obtenerCalendarioPorCalendarioUID.mjs";
export const eventosPorApartamentoAirbnb = async (contenedorDatos) => {
    try {
        const fecha = contenedorDatos.fecha
        const calendarioUID = contenedorDatos.calendarioUID
        const filtroFecha = /^([1-9]|1[0-2])-(\d{1,})$/;
        if (!filtroFecha.test(fecha)) {
            const error = "La fecha no cumple el formato especifico para el calendario. En este caso se espera una cadena con este formado MM-YYYY, si el mes tiene un digio, es un digito, sin el cero delante."
            throw new Error(error)
        }
        const filtroCadena = /^[0-9]+$/;
        if (!filtroCadena.test(calendarioUID) || typeof calendarioUID !== "string") {
            const error = "1el campo 'calendarioUID' solo puede ser una cadena de letras minúsculas y numeros."
            throw new Error(error)
        }
        // Validar que le nombre del calendarioUID existe como tal

        const calendario = await obtenerCalendarioPorCalendarioUID(calendarioUID)
        const apartamentoIDV = calendario.apartamentoIDV
        const apartamentoUI = await obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV)
        const fechaArray = fecha.split("-")
        const mes = fechaArray[0]
        const ano = fechaArray[1]
        const fechaCalendario_ConCeros = `${mes.padStart(2, 0)}-${ano}`
        const fechaObjeto = DateTime.fromObject({ year: ano, month: mes, day: 1 });
        const numeroDeDiasDelMes = fechaObjeto.daysInMonth;
        const calendarioObjeto = {}
        for (let numeroDia = 1; numeroDia <= numeroDeDiasDelMes; numeroDia++) {
            const llaveCalendarioObjeto = `${ano}-${mes}-${numeroDia}`
            calendarioObjeto[llaveCalendarioObjeto] = []
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
        const controlRango = (fechaMMYYYY, rangoInicioISO, rangoFinISO) => {
            // Convertir la fecha MM-YYYY a formato ISO
            const fechaISO = DateTime.fromFormat(fechaMMYYYY, 'MM-yyyy').startOf('month');
            // Convertir las fechas de inicio y fin del rango a objetos DateTime
            const rangoInicio = DateTime.fromISO(rangoInicioISO).startOf('month');
            const rangoFin = DateTime.fromISO(rangoFinISO).endOf('month');
            // Verificar si el mes y el año están dentro del rango
            return fechaISO >= rangoInicio && fechaISO <= rangoFin;
        }
        const eventosSeleccionados = []
        let uidTemporalContador = 0
        const eventosCalendarioAirbnb = await eventosCalendarioPorUID(calendarioUID)
        // 
        const arrayEventosAirbnb = eventosCalendarioAirbnb.calendariosPorApartamento[0].calendarioObjeto
        for (const detallesDelEvento of arrayEventosAirbnb) {
            const eventoUID = detallesDelEvento.uid
            const fechaEntrada = detallesDelEvento.fechaInicio
            const fechaSalida = detallesDelEvento.fechaFinal
            delete detallesDelEvento.fechaInicio
            delete detallesDelEvento.fechaFinal
            uidTemporalContador = uidTemporalContador + 1
            // Definir las fechas en formato ISO
            detallesDelEvento.eventoUID = "calendarioAirbnbUID_" + calendarioUID + "_apartamentoIDV_" + apartamentoIDV + "_uidEvento_" + uidTemporalContador
            const fechaEntrada_objeto = DateTime.fromISO(fechaEntrada);
            const fechaSalida_objeto = DateTime.fromISO(fechaSalida);
            const diferenciaEnDias = fechaSalida_objeto.diff(fechaEntrada_objeto, 'days').days;
            detallesDelEvento.duracion_en_dias = diferenciaEnDias + 1
            detallesDelEvento.fechaEntrada = fechaEntrada
            detallesDelEvento.fechaSalida = fechaSalida
            detallesDelEvento.apartamentoUI = apartamentoUI
            detallesDelEvento.apartamentoIDV = apartamentoIDV
            // Hay un error por aqui, encontrarlo
            if (controlRango(fechaCalendario_ConCeros, fechaEntrada, fechaSalida)) {
                eventosSeleccionados.push(detallesDelEvento)
            }
        }
        for (const detallesDelEvento of arrayEventosAirbnb) {
            const eventoUID = detallesDelEvento.uid
            const fechaEntrada = detallesDelEvento.fechaEntrada
            const fechaSalida = detallesDelEvento.fechaSalida
            const uidEvento = detallesDelEvento.uidEvento
            detallesDelEvento.tipoEvento = "calendarioAirbnb"
            const arrayConFechasInternas = obtenerFechasInternas(fechaEntrada, fechaSalida)
            for (const fechaInterna_ISO of arrayConFechasInternas) {
                const fechaInternaObjeto = DateTime.fromISO(fechaInterna_ISO)
                const diaFechaInterna = fechaInternaObjeto.day
                const mesFechaInterna = fechaInternaObjeto.month
                const anoFechaInterna = fechaInternaObjeto.year
                const fechaInternaHumana = `${anoFechaInterna}-${mesFechaInterna}-${diaFechaInterna}`
                const estructuraReservaEnDia = {
                    fechaEntrada: fechaEntrada,
                    fechaSalida: fechaSalida,
                    apartamentoIDV: apartamentoIDV,
                    apartamentoUI: apartamentoUI,
                    eventoUID: detallesDelEvento.eventoUID
                }
                if (calendarioObjeto[fechaInternaHumana]) {
                    calendarioObjeto[fechaInternaHumana].push(estructuraReservaEnDia)
                }
            }
        }
        const ok = {
            eventosMes: calendarioObjeto,
            eventosEnDetalle: eventosSeleccionados
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
