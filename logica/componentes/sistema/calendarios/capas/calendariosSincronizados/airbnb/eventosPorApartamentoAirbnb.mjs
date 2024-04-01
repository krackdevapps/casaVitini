import { DateTime } from "luxon";
import { conexion } from "../../../../../db.mjs";
import { resolverApartamentoUI } from "../../../../resolverApartamentoUI.mjs";
import { eventosCalendarioPorUID } from "../../../../calendariosSincronizados/airbnb/eventosCalendarioPorUID.mjs";
const eventosPorApartamentoAirbnb = async (contenedorDatos) => {
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
        const validacionCalendarioUID = `
               SELECT *
               FROM "calendariosSincronizados"
               WHERE uid = $1
               `
        const resuelveCalendarioUID = await conexion.query(validacionCalendarioUID, [calendarioUID])
        if (resuelveCalendarioUID.rowCount === 0) {
            const error = "No existe el calendarioUID, revisa el nombre identificador"
            throw new Error(error)
        }
        const apartamentoIDV = resuelveCalendarioUID.rows[0].apartamentoIDV
        const apartamentoUI = await resolverApartamentoUI(apartamentoIDV)
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
            const fechaEntrada_ISO = detallesDelEvento.fechaInicio
            const fechaSalida_ISO = detallesDelEvento.fechaFinal
            delete detallesDelEvento.fechaInicio
            delete detallesDelEvento.fechaFinal
            uidTemporalContador = uidTemporalContador + 1
            // Definir las fechas en formato ISO
            detallesDelEvento.eventoUID = "calendarioAirbnbUID_" + calendarioUID + "_apartamentoIDV_" + apartamentoIDV + "_uidEvento_" + uidTemporalContador
            const fechaEntrada_objeto = DateTime.fromISO(fechaEntrada_ISO);
            const fechaSalida_objeto = DateTime.fromISO(fechaSalida_ISO);
            const diferenciaEnDias = fechaSalida_objeto.diff(fechaEntrada_objeto, 'days').days;
            detallesDelEvento.duracion_en_dias = diferenciaEnDias + 1
            detallesDelEvento.fechaEntrada_ISO = fechaEntrada_ISO
            detallesDelEvento.fechaSalida_ISO = fechaSalida_ISO
            detallesDelEvento.apartamentoUI = apartamentoUI
            detallesDelEvento.apartamentoIDV = apartamentoIDV
            // Hay un error por aqui, encontrarlo
            if (controlRango(fechaCalendario_ConCeros, fechaEntrada_ISO, fechaSalida_ISO)) {
                eventosSeleccionados.push(detallesDelEvento)
            }
        }
        for (const detallesDelEvento of arrayEventosAirbnb) {
            const eventoUID = detallesDelEvento.uid
            const fechaEntrada_ISO = detallesDelEvento.fechaEntrada_ISO
            const fechaSalida_ISO = detallesDelEvento.fechaSalida_ISO
            const uidEvento = detallesDelEvento.uidEvento
            detallesDelEvento.tipoEvento = "calendarioAirbnb"
            const arrayConFechasInternas = obtenerFechasInternas(fechaEntrada_ISO, fechaSalida_ISO)
            for (const fechaInterna_ISO of arrayConFechasInternas) {
                const fechaInternaObjeto = DateTime.fromISO(fechaInterna_ISO)
                const diaFechaInterna = fechaInternaObjeto.day
                const mesFechaInterna = fechaInternaObjeto.month
                const anoFechaInterna = fechaInternaObjeto.year
                const fechaInternaHumana = `${anoFechaInterna}-${mesFechaInterna}-${diaFechaInterna}`
                const estructuraReservaEnDia = {
                    fechaEntrada_ISO: fechaEntrada_ISO,
                    fechaSalida_ISO: fechaSalida_ISO,
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
export {
    eventosPorApartamentoAirbnb
}