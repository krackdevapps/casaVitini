import { DateTime } from "luxon";
import { obtenerReservasPorMesPorAno } from "../../../infraestructure/repository/reservas/selectoresDeReservas/obtenerReservasPorMesPorAno.mjs";

export const eventosReservas = async (fecha) => {
    try {
        const filtroFecha = /^([1-9]|1[0-2])-(\d{1,})$/;
        if (!filtroFecha.test(fecha)) {
            const error = "La fecha no cumple el formato específico para el calendario. En este caso se espera una cadena con este formado MM-YYYY. Si el mes tiene un dígito, es un dígito, sin el cero delante."
            throw new Error(error)
        }
        const fechaArray = fecha.split("-")
        const mes = fechaArray[0]
        const ano = fechaArray[1]
        const fechaObjeto = DateTime.fromObject({ year: ano, month: mes, day: 1 });
        const numeroDeDiasDelMes = fechaObjeto.daysInMonth;
        const calendarioObjeto = {}
        for (let numeroDia = 1; numeroDia <= numeroDeDiasDelMes; numeroDia++) {
            const diaISO = String(numeroDia).padStart(2, "0")
            const mesISO = String(mes).padStart(2, "0")

            const llaveCalendarioObjeto = `${ano}-${mesISO}-${diaISO}`
            calendarioObjeto[llaveCalendarioObjeto] = []
        }
        const reservaCancelada = "cancelada"
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
        const reservas = await obtenerReservasPorMesPorAno({
            mes: mes,
            ano: ano,
            estadoReservaCancelada: reservaCancelada
        })

        const reservasSelecciondas = reservas.map((detallesReserva) => {
            detallesReserva.eventoUID = "reservaUID_" + detallesReserva.reservaUID
            return detallesReserva
        })

        for (const detallesReserva of reservasSelecciondas) {
            const reservaUID = detallesReserva.reservaUID
            const fechaEntrada = detallesReserva.fechaEntrada
            const fechaSalida = detallesReserva.fechaSalida
            detallesReserva.tipoEvento = "reserva"
            detallesReserva.contenedorFechasDelEvento = [{
                fechaEntrada: fechaEntrada,
                fechaSalida: fechaSalida,
                duracion_en_dias:  detallesReserva.duracion_en_dias + 1
            }]
            const arrayConFechasInternas = obtenerFechasInternas(fechaEntrada, fechaSalida)
            for (const fechaInterna_ISO of arrayConFechasInternas) {
                const fechaInternaObjeto = DateTime.fromISO(fechaInterna_ISO)
                const diaFechaInterna = fechaInternaObjeto.day
                const mesFechaInterna = fechaInternaObjeto.month
                const anoFechaInterna = fechaInternaObjeto.year
                const fechaInternaHumana = `${anoFechaInterna}-${String(mesFechaInterna).padStart(2, "0")}-${String(diaFechaInterna).padStart(2,"0")}`
                const estructuraReservaEnDia = {
                    eventoUID: "reservaUID_" + reservaUID,
                    fechaEntrada: fechaEntrada,
                    fechaSalida: fechaSalida
                }
                if (calendarioObjeto[fechaInternaHumana]) {
                    calendarioObjeto[fechaInternaHumana].push(estructuraReservaEnDia)
                }
            }
        }
        const ok = {
            eventosMes: calendarioObjeto,
            eventosEnDetalle: reservasSelecciondas
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
