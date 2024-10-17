import { DateTime } from "luxon";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { eventosCalendarioPorUID } from "../../../../calendariosSincronizados/airbnb/eventosCalendarioPorUID.mjs";
import { obtenerCalendarioPorCalendarioUID } from "../../../../../infraestructure/repository/calendario/obtenerCalendarioPorCalendarioUID.mjs";
import { codigoZonaHoraria } from "../../../../configuracion/codigoZonaHoraria.mjs";
export const eventosPorApartamentoAirbnb = async (contenedorDatos) => {
    try {
        const fecha = contenedorDatos.fecha
        const calendarioUID = contenedorDatos.calendarioUID
        const filtroFecha = /^([1-9]|1[0-2])-(\d{1,})$/;
        if (!filtroFecha.test(fecha)) {
            const error = "La fecha no cumple el formato específico para el calendario. En este caso se espera una cadena con este formado MM-YYYY. Si el mes tiene un dígito, es un dígito, sin el cero delante."
            throw new Error(error)
        }
        const filtroCadena = /^[0-9]+$/;
        if (!filtroCadena.test(calendarioUID) || typeof calendarioUID !== "string") {
            const error = "El campo 'calendarioUID' solo puede ser una cadena de letras minúsculas y números."
            throw new Error(error)
        }


        const calendario = await obtenerCalendarioPorCalendarioUID(calendarioUID)
        const apartamentoIDV = calendario.apartamentoIDV
        const apartamentoUI = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })).apartamentoUI
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;

        const fechaArray = fecha.split("-")
        const mes = fechaArray[0]
        const ano = fechaArray[1]
        const fechaCalendario_ConCeros = `${mes.padStart(2, 0)}-${ano}`
        const fechaObjeto = DateTime.fromObject({ year: ano, month: mes, day: 1 });
        const numeroDeDiasDelMes = fechaObjeto.daysInMonth;
        const calendarioObjeto = {}
        for (let numeroDia = 1; numeroDia <= numeroDeDiasDelMes; numeroDia++) {
            const diaISO = String(numeroDia).padStart(2, "0")
            const mesISO = String(mes).padStart(2, "0")

            const llaveCalendarioObjeto = `${ano}-${mesISO}-${diaISO}`
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

            const fechaISO = DateTime.fromFormat(fechaMMYYYY, 'MM-yyyy').startOf('month');

            const rangoInicio = DateTime.fromISO(rangoInicioISO).startOf('month');
            const rangoFin = DateTime.fromISO(rangoFinISO).endOf('month');

            return fechaISO >= rangoInicio && fechaISO <= rangoFin;
        }
        const eventosSeleccionados = []
        let uidTemporalContador = 0
        const eventosCalendarioAirbnb = await eventosCalendarioPorUID(calendarioUID)
        const arrayEventosAirbnb = eventosCalendarioAirbnb.calendarioDelApartamento.calendarioObjeto
        for (const detallesDelEvento of arrayEventosAirbnb) {
            const fechaEntrada = detallesDelEvento.fechaInicio
            const fechaSalida = detallesDelEvento.fechaFinal
            delete detallesDelEvento.fechaInicio
            delete detallesDelEvento.fechaFinal
            uidTemporalContador = uidTemporalContador + 1

            detallesDelEvento.eventoUID = "calendarioAirbnbUID_" + calendarioUID + "_apartamentoIDV_" + apartamentoIDV + "_uidEvento_" + uidTemporalContador
            const fechaEntrada_objeto = DateTime.fromISO(fechaEntrada, { zone: zonaHoraria });
            const fechaSalida_objeto = DateTime.fromISO(fechaSalida, { zone: zonaHoraria });


            const diferenciaEnDias = fechaSalida_objeto.diff(fechaEntrada_objeto, 'days').days + 1;

            detallesDelEvento.fechaEntrada = fechaEntrada
            detallesDelEvento.fechaSalida = fechaSalida
            detallesDelEvento.apartamentoUI = apartamentoUI
            detallesDelEvento.apartamentoIDV = apartamentoIDV
            detallesDelEvento.contenedorFechasDelEvento = [{
                fechaEntrada: fechaEntrada,
                fechaSalida: fechaSalida,
                duracion_en_dias: diferenciaEnDias
            }]

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
                const fechaInternaHumana = `${anoFechaInterna}-${String(mesFechaInterna).padStart(2, "0")}-${String(diaFechaInterna).padStart(2, "0")}`
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
