import { DateTime } from "luxon";
import { conexion } from "../../../db.mjs";
import { resolverApartamentoUI } from "../../resolverApartamentoUI.mjs";

const eventosPorApartamneto = async (metadatos) => {
    try {
        const fecha = metadatos.fecha
        const apartamentoIDV = metadatos.apartamentoIDV
        const filtroFecha = /^([1-9]|1[0-2])-(\d{1,})$/;

        if (!filtroFecha.test(fecha)) {
            const error = "La fecha no cumple el formato especifico para el calendario. En este caso se espera una cadena con este formado MM-YYYY, si el mes tiene un digio, es un digito, sin el cero delante."
            throw new Error(error)
        }
        const filtroCadena = /^[a-z0-9]+$/;
        if (!filtroCadena.test(apartamentoIDV) || typeof apartamentoIDV !== "string") {
            const error = "el campo 'apartamentoIDV' solo puede ser una cadena de letras minúsculas y numeros."
            throw new Error(error)
        }

        // Validar que le nombre del apartamento existe como tal
        const validacionNombreApartamento = `
               SELECT *
               FROM "configuracionApartamento"
               WHERE "apartamentoIDV" = $1
               `
        const resuelveValidacionNombreApartamento = await conexion.query(validacionNombreApartamento, [apartamentoIDV])
        if (resuelveValidacionNombreApartamento.rowCount === 0) {
            const error = "No existe el nombre del apartamento, revisa el nombre escrito"
            throw new Error(error)
        }
        const apartamentoUI = await resolverApartamentoUI(apartamentoIDV)


        const fechaArray = fecha.split("-")
        const mes = fechaArray[0]
        const ano = fechaArray[1]

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
        const reservaCancelada = "cancelada"

        const consultaReservas = `
        SELECT 
          r.reserva,
          ra.uid,
          to_char(r.entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
          to_char(r.salida, 'YYYY-MM-DD') as "fechaSalida_ISO",
          ra.apartamento as "apartamentoIDV",
          (salida - entrada) as duracion_en_dias

        FROM reservas r
        JOIN "reservaApartamentos" ra ON r.reserva = ra.reserva
        WHERE 
       ( 
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
        )
          AND ra.apartamento = $3
          AND "estadoReserva" <> $4;
        `
        const resuelveReservas = await conexion.query(consultaReservas, [mes, ano, apartamentoIDV, reservaCancelada])

        const reservasSelecciondas = []

        for (const detalles of resuelveReservas.rows) {
            const apartamentoIDV = detalles.apartamentoIDV
            detalles.apartamentoUI = await resolverApartamentoUI(apartamentoIDV)
            reservasSelecciondas.push(detalles)
        }
        for (const detallesReserva of reservasSelecciondas) {
            const reservaUID = detallesReserva.reserva
            const apartamentoUID = detallesReserva.uid
            const fechaEntrada_ISO = detallesReserva.fechaEntrada_ISO
            const fechaSalida_ISO = detallesReserva.fechaSalida_ISO
            const apartamentoIDVReserva = detallesReserva.apartamentoIDV
            detallesReserva.duracion_en_dias = detallesReserva.duracion_en_dias + 1
            detallesReserva.tipoEvento = "porApartamento"
            detallesReserva.eventoUID = "porApartamento_" + apartamentoUID

            detallesReserva.apartamentoUI = await resolverApartamentoUI(apartamentoIDVReserva)

            const arrayConFechasInternas = obtenerFechasInternas(fechaEntrada_ISO, fechaSalida_ISO)


            for (const fechaInterna_ISO of arrayConFechasInternas) {

                const fechaInternaObjeto = DateTime.fromISO(fechaInterna_ISO)
                const diaFechaInterna = fechaInternaObjeto.day
                const mesFechaInterna = fechaInternaObjeto.month
                const anoFechaInterna = fechaInternaObjeto.year

                const fechaInternaHumana = `${anoFechaInterna}-${mesFechaInterna}-${diaFechaInterna}`

                const estructuraReservaEnDia = {
                    eventoUID: "porApartamento_" + apartamentoUID,
                    fechaEntrada_ISO: fechaEntrada_ISO,
                    fechaSalida_ISO: fechaSalida_ISO
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

export {
    eventosPorApartamneto
}