import Decimal from "decimal.js";
import { DateTime } from "luxon";

export const utilidades = {
    deUTCaZonaHoraria: (fechaUTC, zonaHoraria) => {
        const regexUTC = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)$/;
        if (!regexUTC.test(fechaUTC)) {
            return "Fecha no válida. Debe estar en formato UTC y seguir el estándar ISO 8601.";
        }
        const fecha = new Date(fechaUTC);
        const opciones = { timeZone: zonaHoraria };
        return fecha.toLocaleString("sv-SE", opciones).replace(/\s+/g, 'T');
    },
    calcularPorcentajeTranscurridoUTC: (fechaHoraEntradaUTC, fechaHoraSalidaUTC, fechaActualUTC) => {
        console.log("fechaHoraEntradaUTC", fechaHoraEntradaUTC, "fechaHoraSalidaUTC", fechaHoraSalidaUTC, "fechaActualUTC", fechaActualUTC)
        const ahora = new Date(fechaActualUTC); // Fecha y hora actuales
        const fechaEntradaCompleta = new Date(fechaHoraEntradaUTC);
        const fechaSalidaCompleta = new Date(fechaHoraSalidaUTC);

        const diferenciaTotal = fechaSalidaCompleta - fechaEntradaCompleta;

        const diferenciaActual = ahora - fechaEntradaCompleta;

        const porcentajeTranscurrido = (diferenciaActual / diferenciaTotal) * 100;
        return porcentajeTranscurrido.toFixed(2);
    },
    calculadora: (numero1, numero2, operador) => {
        const validarNumero = (numero) => {

            const regex = /^-?\d+(\.\d{1,2})?$/;
            return regex.test(numero);
        }

        if (!validarNumero(numero1) || !validarNumero(numero2)) {
            return 'Entrada no válida. Por favor, ingrese números enteros o con hasta dos decimales.';
        }

        const decimalNum1 = new Decimal(numero1);
        const decimalNum2 = new Decimal(numero2);

        switch (operador) {
            case '+':
                return decimalNum1.plus(decimalNum2).toString();
            case '-':
                return decimalNum1.minus(decimalNum2).toString();
            case '*':
                return decimalNum1.times(decimalNum2).toString();
            case '%':
                return decimalNum1.times(decimalNum2).dividedBy(100);
            case '/':

                if (decimalNum2.isZero()) {
                    return 'No se puede dividir por cero.';
                }
                return decimalNum1.dividedBy(decimalNum2).toString();
            default:
                return 'Operador no válido';
        }
    },
    deFormatoSquareAFormatoSQL: (numero) => {
        const numeroInstanciado = new Decimal(numero).dividedBy(100);
        const valorString = numeroInstanciado.toString();
        return valorString;
    },
    calcularTiempoRestanteEnFormatoISO: (fechaSalida, fechaActual_ISO) => {
        const fechaHoy = DateTime.fromISO(fechaActual_ISO);
        const fechaSalidaObj = DateTime.fromISO(fechaSalida);
        const diferencia = fechaSalidaObj.diff(fechaHoy, ['days', 'hours']);
        const dias = diferencia.days;
        const horas = Math.floor(diferencia.hours);
        if (dias > 0) {
            return `${dias} ${dias === 1 ? 'día' : 'días'} y ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
        } else if (horas > 0) {
            return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
        } else {
            return 'Menos de una hora';
        }
    },
    calcularDiferenciaEnDias: (fechaInicio_ISO, fechaFin_ISO) => {
        const fechaInicio_Objeto = DateTime.fromISO(fechaInicio_ISO);
        const fechaFin_Objeto = DateTime.fromISO(fechaFin_ISO);
        const diferencia = fechaFin_Objeto.diff(fechaInicio_Objeto, ['days', 'hours']);
        const diasDiferencia = diferencia.days;
        const horasDiferencia = diferencia.hours;
        const estructua = {
            diasDiferencia: diasDiferencia,
            horasDiferencia: horasDiferencia
        }
        return estructua;
    },
    comparadorFechas_ISO: (fecha1, fecha2) => {

        const partesFecha1 = fecha1.split('-');
        const dia1 = parseInt(partesFecha1[2], 10)
        const mes1 = parseInt(partesFecha1[1], 10)
        const anio1 = parseInt(partesFecha1[0], 10)

        const partesFecha2 = fecha2.split('-');
        const dia2 = parseInt(partesFecha2[2], 10)
        const mes2 = parseInt(partesFecha2[1], 10)
        const anio2 = parseInt(partesFecha2[0], 10)

        const date1 = DateTime.local(anio1, mes1, dia1);
        const date2 = DateTime.local(anio2, mes2, dia2);
        return date1.toISODate() === date2.toISODate();
    },
    constructorComasEY: (data) => {
        const array = data.array
        const articulo = data.articulo


        if (array.length === 1) {
            return array[0];
        } else if (articulo.length > 0) {
            const formattedString = array.slice(0, -1).join(', ' + articulo + " ") + ' y ' + articulo + " " + array.slice(-1);
            return formattedString;
        } else if (articulo.length === 0) {
            const formattedString = array.slice(0, -1).join(', ' + articulo) + ' y ' + articulo + array.slice(-1);
            return formattedString;
        }

    },
    evitarLlavesDuplicas: (objeto) => {
        const keys = Object.keys(objeto);
        const set = new Set(keys);


        if (keys.length !== set.size) {
            return true; // Hay llaves duplicadas en este nivel
        }


        for (let key in objeto) {
            if (typeof objeto[key] === 'object' && objeto[key] !== null) {
                if (evitarLlavesDuplicas(objeto[key])) {
                    return true; // Hay llaves duplicadas en niveles más profundos
                }
            }
        }

        return false; // No se encontraron llaves duplicadas en ningún nivel

    },
    conversor: {
        fecha_humana_hacia_ISO: (fecha) => {
            try {
                const filtroFechaHumana = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(\d{4})$/;
                if (filtroFechaHumana.test(fecha)) {
                    const fechaArray = fecha.split("/")
                    const dia = fechaArray[0]
                    const mes = fechaArray[1]
                    const ano = fechaArray[2]
                    const fechaISO = `${ano}-${mes}-${dia}`
                    return fechaISO
                } else {
                    const m = "En fecha_humana_hacia_ISO no se reconoce el formato humano"
                    throw new Error(m)
                }
            } catch (error) {
                throw error
            }

        },
        fecha_ISO_hacia_humana: (fecha) => {
            try {
                const filtroFechaISO = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
                if (filtroFechaISO.test(fecha)) {
                    const fechaArray = fecha.split("-")
                    const dia = fechaArray[2]
                    const mes = fechaArray[1]
                    const ano = fechaArray[0]
                    const fechaHumana = `${dia}/${mes}/${ano}`
                    return fechaHumana
                } else {
                    const m = "En fecha_ISO_hacia_humana no se reconoce el formato ISO"
                    throw new Error(m)
                }
            } catch (error) {
                throw error
            }

        },
        extraerFechasInternas: (inicio, fin) => {
            const fechas = [];
            const inicio_objeto = new Date(inicio);
            const fin_objeto = new Date(fin);


            fin_objeto.setDate(fin_objeto.getDate() + 1);

            while (inicio_objeto < fin_objeto) {
                fechas.push(inicio_objeto.toISOString().split("T")[0]);
                inicio_objeto.setDate(inicio_objeto.getDate() + 1);
            }
            return fechas;
        },
        compararFechasYExtraerDiasQueNoEstenEnElRangoSegundo: (data) => {

            const fechaInicio_rango_uno = data.fechaInicio_rango_uno
            const fechaFin_rango_uno = data.fechaFin_rango_uno
            const fechaInicio_rango_dos = data.fechaInicio_rango_dos
            const fechaFin_rango_dos = data.fechaFin_rango_dos


            const fechaInicio_rango_uno_objeto = DateTime.fromISO(fechaInicio_rango_uno);
            const fechaFin_rango_uno_objeto = DateTime.fromISO(fechaFin_rango_uno);


            const fechaInicio_rango_dos_objeto = DateTime.fromISO(fechaInicio_rango_dos);
            const fechaFin_rango_dos_objeto = DateTime.fromISO(fechaFin_rango_dos);


            const generaListaDeDias = (inicio, fin) => {
                const fechas = [];
                let actual = inicio;
                while (actual <= fin) {
                    fechas.push(actual.toISODate());
                    actual = actual.plus({ days: 1 });
                }
                return fechas;
            }


            const fechasRango1 = generaListaDeDias(fechaInicio_rango_uno_objeto, fechaFin_rango_uno_objeto);
            const fechasRango2 = generaListaDeDias(fechaInicio_rango_dos_objeto, fechaFin_rango_dos_objeto);


            return fechasRango1.filter(fechaControl => !fechasRango2.includes(fechaControl));
        }
    },
    validarRutaObjeto: (data) => {
        
        const objetoParaValidar = data.objetoParaValidar
        const ruta = data.ruta

        const propiedades = ruta.split('.');
        let actual = objetoParaValidar;

        for (const prop of propiedades) {
            if (actual && typeof actual === 'object' && prop in actual) {
                actual = actual[prop];
            } else {
                return {
                    estado: false
                }; // La propiedad no existe
            }
        }
        return {
            estado: true,
            contenedor: actual
        }; // La propiedad existe
    },
    ralentizador: async (milisegundos) => {
        await new Promise(resolve => setTimeout(resolve, Number(milisegundos)));
    },
}