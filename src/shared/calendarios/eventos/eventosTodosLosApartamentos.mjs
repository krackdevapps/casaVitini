import { DateTime } from "luxon";
import { validadoresCompartidos } from "../../validadores/validadoresCompartidos.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerReservasDeTodosLosApartamentosPorMesPorAno } from "../../../infraestructure/repository/reservas/selectoresDeReservas/obtenerReservasDeTodosLosApartamentosPorMesPorAno.mjs";

export const eventosTodosLosApartamentos = async (fecha) => {
    try {
        await validadoresCompartidos.fechas.fechaMesAno(fecha)
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
        const reservaCancelada = "cancelada"
        const reservas = await obtenerReservasDeTodosLosApartamentosPorMesPorAno({
            mes: mes,
            ano: ano,
            reservaCancelada: reservaCancelada
        })
        const reservasSelecciondas = []

        for (const detalles of reservas) {
            const apartamentoIDV = detalles.apartamentoIDV
            const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "desactivado"
            })
            detalles.apartamentoUI = apartamento?.apartamentoUI ||`(${apartamentoIDV}) Apartamento sin configuracion de alojamiento`
            reservasSelecciondas.push(detalles)
        }
        for (const detallesReserva of reservasSelecciondas) {
            const reservaUID = detallesReserva.reservaUID
            const apartamentoUID = detallesReserva.componenteUID
            const fechaEntrada = detallesReserva.fechaEntrada
            const fechaSalida = detallesReserva.fechaSalida
            const apartamentoIDV = detallesReserva.apartamentoIDV

            detallesReserva.contenedorFechasDelEvento = [{
                fechaEntrada: fechaEntrada,
                fechaSalida: fechaSalida,
                duracion_en_dias:  detallesReserva.duracion_en_dias + 1
            }]
            detallesReserva.tipoEvento = "todosLosApartamentos"
            detallesReserva.eventoUID = "todosLosApartamentos_" + apartamentoUID
            const arrayConFechasInternas = obtenerFechasInternas(fechaEntrada, fechaSalida)
            for (const fechaInterna_ISO of arrayConFechasInternas) {
                const fechaInternaObjeto = DateTime.fromISO(fechaInterna_ISO)
                const diaFechaInterna = fechaInternaObjeto.day
                const mesFechaInterna = fechaInternaObjeto.month
                const anoFechaInterna = fechaInternaObjeto.year
                const fechaInternaHumana = `${anoFechaInterna}-${String(mesFechaInterna).padStart(2, "0")}-${String(diaFechaInterna).padStart(2, "0")}`
                const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                    apartamentoIDV: apartamentoIDV,
                    errorSi: "desactivado"
                })
                const estructuraReservaEnDia = {
                    eventoUID: "todosLosApartamentos_" + apartamentoUID,
                    reservaUID: reservaUID,
                    apartamentoUID: apartamentoUID,
                    fechaEntrada: fechaEntrada,
                    fechaSalida: fechaSalida,
                    apartamentoIDV: apartamentoIDV,
                    apartamentoUI: apartamento?.apartamentoUI || `(${apartamentoIDV}) Apartamento sin configuracion de alojamiento`
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
