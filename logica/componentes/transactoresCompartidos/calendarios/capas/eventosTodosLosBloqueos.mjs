import { DateTime } from "luxon";
import { conexion } from "../../../db.mjs";


const eventosTodosLosBloqueos = async (fecha) => {
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

        const consultaBloqueos = `
        SELECT 
            bA.uid,
            bA."tipoBloqueo",
            bA.apartamento AS "apartamentoIDV",
            to_char(bA.entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
            to_char(bA.salida, 'YYYY-MM-DD') as "fechaSalida_ISO",
            (bA.salida - bA.entrada) as duracion_en_dias,

            a."apartamentoUI"
        FROM "bloqueosApartamentos" bA
        JOIN apartamentos a ON bA.apartamento = a.apartamento
        WHERE 
        (
            DATE_PART('YEAR', entrada) < $2
            OR (
                DATE_PART('YEAR', entrada) = $2
                AND DATE_PART('MONTH', entrada) <= $1
            )
        )
        AND (
            DATE_PART('YEAR', salida) > $2
            OR (
                DATE_PART('YEAR', salida) = $2
                AND DATE_PART('MONTH', salida) >= $1
            )
        )
          OR
          bA."tipoBloqueo" = $3;
        `
        const bloqueoPermanente = "permanente"
        const resuelveBloqueos = await conexion.query(consultaBloqueos, [mes, ano, bloqueoPermanente])
        const bloqueosSeleccionados = resuelveBloqueos.rows.map((detallesBloqueo) => {
            return detallesBloqueo
        })


        for (const detallesReserva of bloqueosSeleccionados) {

            const bloqueoUID = detallesReserva.uid
            const tipoBloqueo = detallesReserva.tipoBloqueo
            const fechaEntrada_ISO = detallesReserva.fechaEntrada_ISO
            const fechaSalida_ISO = detallesReserva.fechaSalida_ISO
            const apartamentoUI = detallesReserva.apartamentoUI
            const apartamentoIDV = detallesReserva.apartamentoIDV
            detallesReserva.duracion_en_dias = detallesReserva.duracion_en_dias + 1
            detallesReserva.tipoEvento = "todosLosBloqueos"
            detallesReserva.eventoUID = "todosLosBloqueos_" + bloqueoUID



            if (tipoBloqueo === "rangoTemporal") {

                const arrayConFechasInternas = obtenerFechasInternas(fechaEntrada_ISO, fechaSalida_ISO)
                for (const fechaInterna_ISO of arrayConFechasInternas) {

                    const fechaInternaObjeto = DateTime.fromISO(fechaInterna_ISO)
                    const diaFechaInterna = fechaInternaObjeto.day
                    const mesFechaInterna = fechaInternaObjeto.month
                    const anoFechaInterna = fechaInternaObjeto.year

                    const fechaInternaHumana = `${anoFechaInterna}-${mesFechaInterna}-${diaFechaInterna}`

                    const estructuraBloqueoDia = {
                        eventoUID: "todosLosBloqueos_" + bloqueoUID,
                        fechaEntrada_ISO: fechaEntrada_ISO,
                        fechaSalida_ISO: fechaSalida_ISO

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
export {
    eventosTodosLosBloqueos
}