import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../shared/configuracion/codigoZonaHoraria.mjs";
import { obtenerParametroConfiguracion } from "../../shared/configuracion/obtenerParametroConfiguracion.mjs";
import { validadoresCompartidos } from "../../shared/validadores/validadoresCompartidos.mjs";
import { controlEstructuraPorJoi } from "../../shared/validadores/controlEstructuraPorJoi.mjs";
import Joi from "joi";

export const calendario = async (entrada) => {
    try {
        const commonMessages = validadoresCompartidos.herramientasExternas.joi.mensajesErrorPersonalizados

        const schema = Joi.object({
            tipo: Joi.string().messages(commonMessages),
            ano: Joi.number().messages(commonMessages),
            mes: Joi.number().messages(commonMessages),
        }).required().messages(commonMessages)

        controlEstructuraPorJoi({
            schema: schema,
            objeto: entrada.body
        })

        const tipo = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipo,
            nombreCampo: "El campo del tipo de calenadrio",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "no"
        })

        if (tipo !== "actual" && tipo !== "personalizado" && tipo !== "rangoAnualDesdeFecha") {
            const error = "El campo de tipo solo puede ser actual, personalizado, rangoAnualDesdeFecha"
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
            }
        }


        const primeraFechaDisponible_objeto = tiempoZH.plus({ days: diasAntelacionReserva });
        const primeraFechaDisponible = primeraFechaDisponible_objeto.toObject();
        const primerDiaDelMes_primeraFechaDisponible = primeraFechaDisponible_objeto.set({ day: 1 });
        const posicionDia1_primeraFechaDiponible = primerDiaDelMes_primeraFechaDisponible.weekday;
        const numeroDeDiasPorMes_primeraFechaDisponible = primeraFechaDisponible_objeto.daysInMonth;

        const mes_primeraFechaDisponible = primeraFechaDisponible.month
        const ano_primeraFechaDisponible = primeraFechaDisponible.year


        let tiempo_primeraFechaDisponible = "presente"
        if (anoPresenteTZ > ano_primeraFechaDisponible) {
            tiempo_primeraFechaDisponible = "futuro"
        } else if (anoPresenteTZ === ano_primeraFechaDisponible && mesPresenteTZ === mes_primeraFechaDisponible) {
            tiempo_primeraFechaDisponible = "presente"
        } else if (anoPresenteTZ === ano_primeraFechaDisponible && mesPresenteTZ < mes_primeraFechaDisponible) {
            tiempo_primeraFechaDisponible = "futuro"
        }

        if (tipo === "actual") {
            validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
                objeto: entrada.body,
                numeroDeLLavesMaximo: 2
            })

            const anoActual = anoPresenteTZ;
            const mesActual = mesPresenteTZ;
            const diaActual = diaHoyTZ;
            const posicionDia1 = tiempoZH.set({ day: 1 }).weekday;
            const numeroDeDiasPorMes = tiempoZH.daysInMonth;

            const estructuraGlobal_DiasAntelacion = {};


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
                ok: "Aqui tienes los datos de contrucción del calendario",
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
                        ano: primeraFechaDisponible.year,
                        numeroDiasPorMes: numeroDeDiasPorMes_primeraFechaDisponible,
                        posicionDia1: posicionDia1_primeraFechaDiponible,
                        tiempo: tiempo_primeraFechaDisponible
                    }
                }
            };
            return respuesta
        } else if (tipo === "personalizado") {

            validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
                objeto: entrada.body,
                numeroDeLLavesMaximo: 3
            })

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
            calendario.ok = "Aqui tienes los datos de contrucción del calendario"
            calendario.calendario = "ok";
            calendario.ano = ano;
            calendario.mes = mes;

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
                    ano: primeraFechaDisponible.year,
                    numeroDiasPorMes: numeroDeDiasPorMes_primeraFechaDisponible,
                    posicionDia1: posicionDia1_primeraFechaDiponible,
                    tiempo: tiempo_primeraFechaDisponible
                }
            };
            return calendario
        } if (tipo === "rangoAnualDesdeFecha") {
            validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
                objeto: entrada.body,
                numeroDeLLavesMaximo: 3
            })

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
            // Crear un DateTime para el primer día del mes y año dado
            const fechaInicial = DateTime.local(ano, mes, 1);
            const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
            const fechaPresente = DateTime.now().setZone(zonaHoraria).startOf('day');
            const unAñoAntes = fechaInicial.minus({ years: 1 });
            const unAñoDespues = fechaInicial.plus({ years: 1 }).endOf('month');

            // Inicializamos un array para las fechas
            let fechas = [];

            // Iteramos desde unAñoAntes hasta unAñoDespues
            let fechaActual = unAñoAntes;

            let arbolFechas = {};

            // Iteramos desde unAñoAntes hasta unAñoDespues

            while (fechaActual <= unAñoDespues) {
                // Obtener el año y mes actuales
                const añoActual = fechaActual.year;
                const mesActual = fechaActual.month;

                // Si el año no existe en el objeto, lo inicializamos
                if (!arbolFechas[añoActual]) {
                    arbolFechas[añoActual] = {};
                }

                // Si el mes no existe en el objeto dentro del año, lo inicializamos
                if (!arbolFechas[añoActual][mesActual]) {
                    arbolFechas[añoActual][mesActual] = {
                        dias: [],
                        posicionDia1: fechaActual.weekday
                    };
                }

                // Agregamos la fecha actual al array correspondiente
                arbolFechas[añoActual][mesActual].dias.push(fechaActual.toISODate());

                // Pasamos al siguiente día
                fechaActual = fechaActual.plus({ days: 1 });
            }
            const ok = {
                ok: "Aqui tienes los datos de contrucción del calendario",
                calendario: "ok",
                fechaPresente: fechaPresente.toISODate(),
                arbolFechas
            }
            return ok
        }





    } catch (errorCapturado) {
        throw errorCapturado
    }
}