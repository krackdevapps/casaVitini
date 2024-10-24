import { DateTime } from "luxon";
import { obtenerComportamientosPorRangoPorTipoIDV } from "../../../infraestructure/repository/comportamientoDePrecios/obtenerComportamientosPorRangoPorTipoIDV.mjs";
import { obtenerTodasLasConfiguracionDeLosApartamento } from "../../../infraestructure/repository/arquitectura/configuraciones/obtenerTodasLasConfiguracionDeLosApartamento.mjs";

export const todosLosComportamientosDePrecioDeTodosLosApartamentos = async (metadatos) => {
    try {
        const fecha = metadatos.fecha
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
        const comportamientosDePrecios = []

        const configuracionesAlojamiento = await obtenerTodasLasConfiguracionDeLosApartamento()
        const apartamentosIDV = configuracionesAlojamiento.map(c => c.apartamentoIDV)

        const comportamientosDelApartamentoPorRango = await obtenerComportamientosPorRangoPorTipoIDV({
            fechaInicio: fechaObjeto.toISODate(),
            fechaFinal: fechaFinRangoObjeto.toISODate(),
            arrayApartamentos: apartamentosIDV,
            tipoIDV: "porRango",
            estadoArray: ["activado"],
        })
        comportamientosDePrecios.push(...comportamientosDelApartamentoPorRango)
        const comportamientosDelApartamentoPorCreacion = await obtenerComportamientosPorRangoPorTipoIDV({
            fechaInicio: fechaObjeto.toISODate(),
            fechaFinal: fechaFinRangoObjeto.toISODate(),
            arrayApartamentos: apartamentosIDV,
            tipoIDV: "porCreacion",
            estadoArray: ["activado"],
        })
        comportamientosDePrecios.push(...comportamientosDelApartamentoPorCreacion)

        const comportamientosUIDUnicos = new Set();
        const comportamientosDePreciosUnicos = comportamientosDePrecios.filter(o => {
            if (comportamientosUIDUnicos.has(o.comportamientoUID)) {

                return false; // Es un duplicado
            } else {
                comportamientosUIDUnicos.add(o.comportamientoUID);


                return true; // Es único
            }
        });

        for (const comportamiento of comportamientosDePreciosUnicos) {
            const comportamientoUID = comportamiento.comportamientoUID
            const nombreComportamiento = comportamiento.nombreComportamiento
            const contenedor = comportamiento.contenedor
            const apartamentoUID = comportamiento.componenteUID
            const fechaEntrada = contenedor.fechaInicio
            const fechaSalida = contenedor.fechaFinal
            //const comportamientoDelApartmento = contenedor.apartamentos.filter((c) => c.apartamentoIDV === apartamentoIDV)
            //const precioPorRano = comportamientoDelApartmento.precio
            const apartamentoIDVReserva = comportamiento.apartamentoIDV
            //comportamiento.fechaEntrada = fechaEntrada
            //comportamiento.fechaSalida = fechaSalida
            comportamiento.contenedorFechasDelEvento = [{
                fechaEntrada: fechaEntrada,
                fechaSalida: fechaSalida,
                duracion_en_dias: comportamiento.duracion_en_dias + 1
            }]
            //comportamiento.duracion_en_dias = comportamiento.duracion_en_dias + 1
            comportamiento.tipoEvento = "comportamientosPorApartamento"
            comportamiento.eventoUID = "precioPorApartamento_" + comportamientoUID
            // comportamiento.apartamentoUI = ((await obtenerApartamentoComoEntidadPorApartamentoIDV({
            //     apartamentoIDV: apartamentoIDV,
            //     errorSi: "noExiste"
            // }))).apartamentoUI
            const arrayConFechasInternas = obtenerFechasInternas(fechaEntrada, fechaSalida)


            for (const fechaInterna_ISO of arrayConFechasInternas) {
                const fechaInternaObjeto = DateTime.fromISO(fechaInterna_ISO)
                const diaFechaInterna = fechaInternaObjeto.day
                const mesFechaInterna = fechaInternaObjeto.month
                const anoFechaInterna = fechaInternaObjeto.year
                const fechaInternaHumana = `${anoFechaInterna}-${String(mesFechaInterna).padStart(2, "0")}-${String(diaFechaInterna).padStart(2, "0")}`

                const estructuraReservaEnDia = {
                    eventoUID: "precioPorApartamento_" + comportamientoUID,
                    fechaEntrada: fechaEntrada,
                    fechaSalida: fechaSalida
                }
                if (calendarioObjeto[fechaInternaHumana]) {
                    calendarioObjeto[fechaInternaHumana].push(estructuraReservaEnDia)
                }
            }
        }
        ok.eventosEnDetalle.push(...comportamientosDePreciosUnicos)

        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
