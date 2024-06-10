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
        const ahora = new Date(fechaActualUTC); // Fecha y hora actuales
        const fechaEntradaCompleta = new Date(fechaHoraEntradaUTC);
        const fechaSalidaCompleta = new Date(fechaHoraSalidaUTC);
        // Calcular la diferencia total en milisegundos
        const diferenciaTotal = fechaSalidaCompleta - fechaEntradaCompleta;
        // Calcular la diferencia actual en milisegundos
        const diferenciaActual = ahora - fechaEntradaCompleta;
        // Calcular el porcentaje transcurrido
        const porcentajeTranscurrido = (diferenciaActual / diferenciaTotal) * 100;
        return porcentajeTranscurrido.toFixed(2);
    },
    calculadora: (numero1, numero2, operador) => {
        const validarNumero = (numero) => {
            // Expresión regular para validar números enteros o con hasta dos decimales
            const regex = /^-?\d+(\.\d{1,2})?$/;
            return regex.test(numero);
        }
        // Validar que num1 y num2 sean números válidos
        if (!validarNumero(numero1) || !validarNumero(numero2)) {
            return 'Entrada no válida. Por favor, ingrese números enteros o con hasta dos decimales.';
        }
        // Convierte los números a objetos Decimal
        const decimalNum1 = new Decimal(numero1);
        const decimalNum2 = new Decimal(numero2);
        // Realiza la operación según el operador
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
                // Manejo de división por cero
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
    calcularTiempoRestanteEnFormatoISO: (fechaSalida_ISO, fechaActual_ISO) => {
        const fechaHoy = DateTime.fromISO(fechaActual_ISO);
        const fechaSalidaObj = DateTime.fromISO(fechaSalida_ISO);
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
        // Obtener componentes de la primera fecha
        const partesFecha1 = fecha1.split('-');
        const dia1 = parseInt(partesFecha1[2], 10);
        const mes1 = parseInt(partesFecha1[1], 10) - 1; // Restar 1 al mes porque en JavaScript los meses van de 0 a 11
        const anio1 = parseInt(partesFecha1[0], 10);
        // Obtener componentes de la segunda fecha
        const partesFecha2 = fecha2.split('-');
        const dia2 = parseInt(partesFecha2[2], 10);
        const mes2 = parseInt(partesFecha2[1], 10) - 1;
        const anio2 = parseInt(partesFecha2[1], 10);
        // Crear objetos Date para ambas fechas
        const date1 = new Date(anio1, mes1, dia1);
        const date2 = new Date(anio2, mes2, dia2);
        // Comparar las fechas
        return date1.getTime() === date2.getTime();
    },
    contructorComasEY: (array) => {
        if (array.length === 1) {
            return array[0];
        } else {
            const formattedString = array.slice(0, -1).join(', ') + ' y ' + array.slice(-1);
            return formattedString;
        }

    }
}