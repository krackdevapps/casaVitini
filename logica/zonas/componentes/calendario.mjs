import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../sistema/codigoZonaHoraria.mjs";
import { obtenerParametroConfiguracion } from "../../sistema/obtenerParametroConfiguracion.mjs";

export const calendario = async (entrada, salida) => {
    try {
        let tipo = entrada.body.tipo;
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const diaHoyTZ = tiempoZH.day;
        const mesPresenteTZ = tiempoZH.month;
        const anoPresenteTZ = tiempoZH.year;
        if (tipo === "actual") {
            const anoActual = anoPresenteTZ;
            const mesActual = mesPresenteTZ;
            const diaActual = diaHoyTZ;
            const posicionDia1 = tiempoZH.set({ day: 1 }).weekday;
            const numeroDeDiasPorMes = tiempoZH.daysInMonth;
            const limiteFuturoReserva = await obtenerParametroConfiguracion("limiteFuturoReserva");
            const diasAntelacionReserva = await obtenerParametroConfiguracion("diasAntelacionReserva");
            const diasMaximosReserva = await obtenerParametroConfiguracion("diasMaximosReserva");
            const estructuraGlobal_DiasAntelacion = {};
            const primeraFechaDisponible = tiempoZH.plus({ day: diasAntelacionReserva }).toObject();
            for (let index = 0; index < diasAntelacionReserva; index++) {
                const fechaAntelacionObjeto = tiempoZH.plus({ day: index }).toObject();
                const anoObjeto = String(fechaAntelacionObjeto.year);
                const mesObjeto = String(fechaAntelacionObjeto.month);
                const diaObjeto = String(fechaAntelacionObjeto.day);
                estructuraGlobal_DiasAntelacion[anoObjeto] ||= {};
                const estructuraAno = estructuraGlobal_DiasAntelacion[anoObjeto];
                estructuraAno[mesObjeto] ||= {};
                const estructuraMes = estructuraAno[mesObjeto];
                estructuraMes[diaObjeto] ||= true;
            }
            const fechaLimiteFuturo = tiempoZH.plus({ day: limiteFuturoReserva }).toObject();
            const estructuraGlobal_limiteFuturo = {
                ano: fechaLimiteFuturo.year,
                mes: fechaLimiteFuturo.month,
                dia: fechaLimiteFuturo.day,
            };
            const respuesta = {
                calendario: "ok",
                ano: anoActual,
                mes: mesActual,
                dia: diaActual,
                tiempo: "presente",
                posicionDia1: posicionDia1,
                numeroDiasPorMes: numeroDeDiasPorMes,
                limites: {
                    diasAntelacion: estructuraGlobal_DiasAntelacion,
                    limiteFuturo: estructuraGlobal_limiteFuturo,
                    diasMaximoReserva: diasMaximosReserva,
                    primeraFechaDisponible: {
                        dia: primeraFechaDisponible.day,
                        mes: primeraFechaDisponible.month,
                        ano: primeraFechaDisponible.year
                    }
                }
            };
            salida.json(respuesta);
        }
        if (tipo === "personalizado") {
            const ano = entrada.body.ano;
            const mes = entrada.body.mes;
            const calendario = {};
            if (typeof ano !== 'number' || typeof mes !== 'number') {
                const error = "H el 'Mes' y el 'Ano' tienen que ser numeros y no cadenas, es decir numeros a saco sin comillas";
                throw new Error(error);
            }
            if (mes < 1 || mes > 12) {
                const error = "El mes solo puede ser un campo entre 1 y 12";
                throw new Error(error);
            }
            if (ano < 1 || ano > 9999) {
                const error = "El ano solo puede ser un numero entre 1 y 9999";
                throw new Error(error);
            }
            // Limite del presente
            const anoActual = anoPresenteTZ;
            const mesActual = mesPresenteTZ;
            if (anoActual > ano) {
                calendario.tiempo = "pasado";
                calendario.detalleTemporal = "pasadoPorAno";
            }
            if (anoActual === ano && mesActual > mes) {
                calendario.tiempo = "pasado";
                calendario.detalleTemporal = "pasadoPorMes";
            }
            let tiempoConfig;
            if (anoActual === ano && mesActual === mes) {
                tiempoConfig = "presente";
                calendario.tiempo = "presente";
            }
            if (anoActual < ano) {
                tiempoConfig = "futuroPorAno";
                calendario.tiempo = "futuro";
                calendario.detalleTemporal = "futuroPorAno";
            }
            if (anoActual === ano && mesActual < mes) {
                calendario.tiempo = "futuro";
                calendario.detalleTemporal = "futuroPorMes";
            }
            if (tiempoConfig === "presente") {
                const diaActual = diaHoyTZ;
                calendario.dia = diaActual;
            }
            const fecha = DateTime.fromObject({ year: ano, month: mes, day: 1 });
            const numeroDeDiasPorMes = fecha.daysInMonth;
            const posicionDiaComienzoMes = fecha.weekday;
            calendario.calendario = "ok";
            calendario.ano = ano;
            calendario.mes = mes;
            // Calendario["Tiempo"] = Tiempo
            calendario.numeroDiasPorMes = numeroDeDiasPorMes;
            calendario.posicionDia1 = posicionDiaComienzoMes;
            const limiteFuturoReserva = await obtenerParametroConfiguracion("limiteFuturoReserva");
            const diasAntelacionReserva = await obtenerParametroConfiguracion("diasAntelacionReserva");
            const diasMaximosReserva = await obtenerParametroConfiguracion("diasMaximosReserva");
            const estructuraGlobal_DiasAntelacion = {};
            const primeraFechaDisponible = tiempoZH.plus({ day: diasAntelacionReserva }).toObject();
            for (let index = 0; index < diasAntelacionReserva; index++) {
                const fechaAntelacionObjeto = tiempoZH.plus({ day: index }).toObject();
                const anoObjeto = String(fechaAntelacionObjeto.year);
                const mesObjeto = String(fechaAntelacionObjeto.month);
                const diaObjeto = String(fechaAntelacionObjeto.day);
                estructuraGlobal_DiasAntelacion[anoObjeto] ||= {};
                const estructuraAno = estructuraGlobal_DiasAntelacion[anoObjeto];
                estructuraAno[mesObjeto] ||= {};
                const estructuraMes = estructuraAno[mesObjeto];
                estructuraMes[diaObjeto] ||= true;
            }
            const fechaLimiteFuturo = tiempoZH.plus({ day: limiteFuturoReserva }).toObject();
            const estructuraGlobal_limiteFuturo = {
                ano: fechaLimiteFuturo.year,
                mes: fechaLimiteFuturo.month,
                dia: fechaLimiteFuturo.day,
            };
            calendario.limites = {
                diasAntelacion: estructuraGlobal_DiasAntelacion,
                limiteFuturo: estructuraGlobal_limiteFuturo,
                diasMaximoReserva: diasMaximosReserva,
                primeraFechaDisponible: {
                    dia: primeraFechaDisponible.day,
                    mes: primeraFechaDisponible.month,
                    ano: primeraFechaDisponible.year
                }
            };
            salida.json(calendario);
        }
        /*
        if (tipo === "actualConDiasDeAntelacion") {
            const limiteFuturoReserva = await obtenerParametroConfiguracion("limiteFuturoReserva")
            const diasAntelacionReserva = await obtenerParametroConfiguracion("diasAntelacionReserva")
            const diasMaximosReserva = await obtenerParametroConfiguracion("diasMaximosReserva")
            const fechaActualTZConDiasDeAntelacion = tiempoZH.plus({ day: diasAntelacionReserva })
            const anoActualConDiasDeAntelacion = fechaActualTZConDiasDeAntelacion.year;
            const mesActualConDiasDeAntelacion = fechaActualTZConDiasDeAntelacion.month;
            const diaActualConDiasDeAntelacion = fechaActualTZConDiasDeAntelacion.day;
            const posicionDia1 = fechaActualTZConDiasDeAntelacion.set({ day: 1 }).weekday
            const numeroDeDiasPorMes = fechaActualTZConDiasDeAntelacion.daysInMonth;
            const estructuraGlobal_DiasAntelacion = {}
            const primeraFechaDisponible = tiempoZH.plus({ day: diasAntelacionReserva }).toObject();
            for (let index = 0; index < diasAntelacionReserva; index++) {
                const fechaAntelacionObjeto = tiempoZH.plus({ day: index }).toObject();
                const anoObjeto = String(fechaAntelacionObjeto.year)
                const mesObjeto = String(fechaAntelacionObjeto.month)
                const diaObjeto = String(fechaAntelacionObjeto.day)
                estructuraGlobal_DiasAntelacion[anoObjeto] ||= {};
                const estructuraAno = estructuraGlobal_DiasAntelacion[anoObjeto]
                estructuraAno[mesObjeto] ||= {}
                const estructuraMes = estructuraAno[mesObjeto]
                estructuraMes[diaObjeto] ||= true
            }
            const fechaLimiteFuturo = tiempoZH.plus({ day: limiteFuturoReserva }).toObject();
            const estructuraGlobal_limiteFuturo = {
                ano: fechaLimiteFuturo.year,
                mes: fechaLimiteFuturo.month,
                dia: fechaLimiteFuturo.day,
            }
            let tiempoFinal
            if (anoActualConDiasDeAntelacion > anoPresenteTZ) {
                tiempoFinal = "futuro"
            } else if (anoActualConDiasDeAntelacion === anoPresenteTZ) {
                if (mesActualConDiasDeAntelacion === mesPresenteTZ) {
                    tiempoFinal = "presente"
                } else if (mesActualConDiasDeAntelacion > mesPresenteTZ) {
                    tiempoFinal = "futuro"
                }
            }
            const respuesta = {
                calendario: "ok",
                ano: anoActualConDiasDeAntelacion,
                mes: mesActualConDiasDeAntelacion,
                dia: diaActualConDiasDeAntelacion,
                tiempo: tiempoFinal,
                posicionDia1: posicionDia1,
                numeroDiasPorMes: numeroDeDiasPorMes,
                limites: {
                    diasAntelacion: estructuraGlobal_DiasAntelacion,
                    limiteFuturo: estructuraGlobal_limiteFuturo,
                    diasMaximoReserva: diasMaximosReserva,
                    primeraFechaDisponible: {
                        dia: primeraFechaDisponible.day,
                        mes: primeraFechaDisponible.month,
                        ano: primeraFechaDisponible.year
                    }
                }
            }
            salida.json(respuesta)
        }
        */
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error)
    }
}