import { DateTime } from "luxon";
import { obtenerTodosLosbloqueosPorMesPorAnoPorTipo } from "../../../infraestructure/repository/bloqueos/obtenerTodosLosbloqueosPorMesPorAnoPorTipo.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
export const eventosTodosLosBloqueos = async (fecha) => {
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

        const fechaInicialVirtual = DateTime.fromObject({ year: ano, month: mes, day: 1 }).minus({ day: 1 }).toISODate()
        const ultimoDiaDelMes = DateTime.fromObject({ year: ano, month: mes }).endOf('month').day
        const fechaFinalVirtual = DateTime.fromObject({ year: ano, month: mes, day: ultimoDiaDelMes }).plus({ day: 1 }).toISODate()

        const bloqueoPermanente = "permanente"
        const bloqueos = await obtenerTodosLosbloqueosPorMesPorAnoPorTipo({
            mes: mes,
            ano: ano,
            bloqueoPermanente: bloqueoPermanente
        })
        const bloqueosSeleccionados = bloqueos.map((detallesBloqueo) => {
            return detallesBloqueo
        })
        for (const detallesBloqueo of bloqueosSeleccionados) {
            const bloqueoUID = detallesBloqueo.bloqueoUID
            const tipoBloqueo = detallesBloqueo.tipoBloqueoIDV
            const fechaEntrada = detallesBloqueo.fechaInicio
            const fechaSalida = detallesBloqueo.fechaFin
            const apartamentoIDV = detallesBloqueo.apartamentoIDV
            const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDV: apartamentoIDV,
                errorSi: "noExiste"
            })
            const apartamentoUI = apartamento.apartamentoUI
            detallesBloqueo.apartamentoUI = apartamentoUI
            if (tipoBloqueo === "rangoTemporal") {
                detallesBloqueo.fechaEntrada = fechaEntrada
                detallesBloqueo.fechaSalida = fechaSalida
            } else if (tipoBloqueo === "permanente") {
                detallesBloqueo.fechaEntrada = fechaInicialVirtual
                detallesBloqueo.fechaSalida = fechaFinalVirtual
            }

            // El calenadrio espera que en detalles del evento, este el fechaEntrad y fechaSalida
            delete detallesBloqueo.fechaInicio
            delete detallesBloqueo.fechaFin

            detallesBloqueo.duracion_en_dias = detallesBloqueo.duracion_en_dias + 1
            detallesBloqueo.tipoEvento = "todosLosBloqueos"
            detallesBloqueo.eventoUID = "todosLosBloqueos_" + bloqueoUID
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
                        fechaEntrada: fechaInicialVirtual,
                        fechaSalida: fechaFinalVirtual,
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
