import { DateTime } from "luxon";
import { obtenerTodosLosbloqueosPorMesPorAnoPorTipo } from "../../../repositorio/bloqueos/obtenerTodosLosbloqueosPorMesPorAnoPorTipo.mjs";
export const eventosTodosLosBloqueos = async (fecha) => {
    try {
        const filtroFecha = /^([1-9]|1[0-2])-(\d{1,})$/;
        if (!filtroFecha.test(fecha)) {
            const error = "La fecha no cumple el formato especifico para el calendario. En este caso se espera una cadena con este formado MM-YYYY, si el mes tiene un digio, es un digito, sin el cero delante."
            throw new Error(error)
        }
        const fechaArray = fecha.split("-")
        const mes = fechaArray[0]
        const ano = fechaArray[1]
        const fechaObjeto = DateTime.fromObject({ year: ano, month: mes, day: 1 });
        const numeroDeDiasDelMes = fechaObjeto.daysInMonth;
        const calendarioObjeto = {}
        const calendarioBloqueosObjeto = {}
        for (let numeroDia = 1; numeroDia <= numeroDeDiasDelMes; numeroDia++) {
            const llaveCalendarioObjeto = `${ano}-${mes}-${numeroDia}`
            calendarioObjeto[llaveCalendarioObjeto] = []
            calendarioBloqueosObjeto[llaveCalendarioObjeto] = []
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
        const bloqueoPermanente = "permanente"
        const bloqueos = await obtenerTodosLosbloqueosPorMesPorAnoPorTipo({
            mes: mes,
            ano: ano,
            bloqueoPermanente: bloqueoPermanente
        })
        const bloqueosSeleccionados = bloqueos.map((detallesBloqueo) => {
            return detallesBloqueo
        })
        for (const detallesReserva of bloqueosSeleccionados) {
            const bloqueoUID = detallesReserva.uid
            const tipoBloqueo = detallesReserva.tipoBloqueo
            const fechaEntrada = detallesReserva.fechaEntrada
            const fechaSalida = detallesReserva.fechaSalida
            const apartamentoUI = detallesReserva.apartamentoUI
            const apartamentoIDV = detallesReserva.apartamentoIDV
            detallesReserva.duracion_en_dias = detallesReserva.duracion_en_dias + 1
            detallesReserva.tipoEvento = "todosLosBloqueos"
            detallesReserva.eventoUID = "todosLosBloqueos_" + bloqueoUID
            if (tipoBloqueo === "rangoTemporal") {
                const arrayConFechasInternas = obtenerFechasInternas(fechaEntrada, fechaSalida)
                for (const fechaInterna_ISO of arrayConFechasInternas) {
                    const fechaInternaObjeto = DateTime.fromISO(fechaInterna_ISO)
                    const diaFechaInterna = fechaInternaObjeto.day
                    const mesFechaInterna = fechaInternaObjeto.month
                    const anoFechaInterna = fechaInternaObjeto.year
                    const fechaInternaHumana = `${anoFechaInterna}-${mesFechaInterna}-${diaFechaInterna}`
                    const estructuraBloqueoDia = {
                        eventoUID: "todosLosBloqueos_" + bloqueoUID,
                        fechaEntrada: fechaEntrada,
                        fechaSalida: fechaSalida
                    }
                    if (calendarioBloqueosObjeto[fechaInternaHumana]) {
                        calendarioBloqueosObjeto[fechaInternaHumana].push(estructuraBloqueoDia)
                    }
                }
            }
            if (tipoBloqueo === "permanente") {
                for (const [fechaDia, contenedor] of Object.entries(calendarioBloqueosObjeto)) {
                    const estructuraBloqueoDia = {
                        eventoUID: "todosLosBloqueos_" + bloqueoUID,
                        tipoBloqueo: tipoBloqueo,
                        //fechaEntrada: fechaEntrada_Humana,
                        //fechaSalida: fechaSalida_Humana,
                        apartamentoIDV: apartamentoIDV,
                        apartamentoUI: apartamentoUI
                    }
                    contenedor.push(estructuraBloqueoDia)
                }
            }
        }
        const ok = {
            eventosMes: calendarioBloqueosObjeto,
            eventosEnDetalle: bloqueosSeleccionados
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
