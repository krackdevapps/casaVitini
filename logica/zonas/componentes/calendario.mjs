import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../sistema/configuracion/codigoZonaHoraria.mjs";
import { obtenerParametroConfiguracion } from "../../sistema/configuracion/obtenerParametroConfiguracion.mjs";
import { validadoresCompartidos } from "../../sistema/validadores/validadoresCompartidos.mjs";

export const calendario = async (entrada) => {
    try {
        const tipo = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipo,
            nombreCampo: "El campo del tipo de calenadrio",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        if (tipo !== "actual" && tipo !== "personalizado") {
            const error = "El campo de tipo solo puede ser actual o personalizado"
            throw new Error(error)
        }

        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const diaHoyTZ = tiempoZH.day;
        const mesPresenteTZ = tiempoZH.month;
        const anoPresenteTZ = tiempoZH.year;


        const paresConfiguracion = await obtenerParametroConfiguracion([
            "limiteFuturoReserva",
            "diasAntelacionReserva",
            "diasMaximosReserva",
            "horaLimiteDelMismoDia"
        ])
        const limiteFuturoReserva = paresConfiguracion.limiteFuturoReserva
        let diasAntelacionReserva = paresConfiguracion.diasAntelacionReserva
        const diasMaximosReserva = paresConfiguracion.diasMaximosReserva
        const horaLimiteDelMismoDia = paresConfiguracion.horaLimiteDelMismoDia

        const horaComparar = DateTime.fromFormat(horaLimiteDelMismoDia, "HH:mm", { zone: zonaHoraria });


        if (diasAntelacionReserva === "0") {
            if (tiempoZH > horaComparar) {

                diasAntelacionReserva = "1"
            } else {

            }
        }


        if (tipo === "actual") {
            const anoActual = anoPresenteTZ;
            const mesActual = mesPresenteTZ;
            const diaActual = diaHoyTZ;
            const posicionDia1 = tiempoZH.set({ day: 1 }).weekday;
            const numeroDeDiasPorMes = tiempoZH.daysInMonth;

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
                ok: "Aqui tienes los datos de contruccio del calendario",
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
            return respuesta
        } else if (tipo === "personalizado") {
            const ano = validadoresCompartidos.tipos.numero({
                number: entrada.body.ano,
                nombreCampo: "El campo del año",
                filtro: "numeroSimple",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })
            const mes = validadoresCompartidos.tipos.numero({
                number: entrada.body.mes,
                nombreCampo: "El campo del mes",
                filtro: "numeroSimple",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })

            if (mes < 1 || mes > 12) {
                const error = "El mes solo puede ser un campo entre 1 y 12";
                throw new Error(error);
            }
            if (ano < 1 || ano > 9999) {
                const error = "El año solo puede ser un número entre 1 y 9999";
                throw new Error(error);
            }
            const calendario = {};

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
            calendario.ok = "Aqui tienes los datos de contruccio del calendario"
            calendario.calendario = "ok";
            calendario.ano = ano;
            calendario.mes = mes;
            // Calendario["Tiempo"] = Tiempo
            calendario.numeroDiasPorMes = numeroDeDiasPorMes;
            calendario.posicionDia1 = posicionDiaComienzoMes;
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
            return calendario
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}