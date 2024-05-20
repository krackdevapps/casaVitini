import Decimal from "decimal.js";
import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../sistema/configuracion/codigoZonaHoraria.mjs";

const utilidades = {
    deUTCaZonaHoraria: (fechaUTC, zonaHoraria) => {
        const regexUTC = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)$/;
        if (!regexUTC.test(fechaUTC)) {
            return "Fecha no válida. Debe estar en formato UTC y seguir el estándar ISO 8601.";
        }
        const fecha = new Date(fechaUTC);
        const opciones = { timeZone: zonaHoraria };
        return fecha.toLocaleString("sv-SE", opciones).replace(/\s+/g, 'T');
    },
    convertirFechaUTCaTZ: (fechaUTC, zonaHoraria) => {
        // Esta funcion solo devuelve la fecha no confundir con deUTCaZonaHoraria que devuelve la fecha y la hora
        // Agregar la hora 00:00:00 al objeto Date
        const fechaConHoraCero = new Date(fechaUTC);
        fechaConHoraCero.setUTCHours(0, 0, 0, 0);
        // Configurar las opciones de formato
        const opciones = { timeZone: zonaHoraria, year: 'numeric', month: '2-digit', day: '2-digit' };
        // Formatear la fecha con la zona horaria especificada
        const formatoFecha = new Intl.DateTimeFormat('en-US', opciones);
        const fechaEnRegion = new Date(formatoFecha.format(fechaConHoraCero));
        return fechaEnRegion.toISOString().slice(0, 10);
    },
    convertirFechaTZaUTC: (fechaTZ, zonaHoraria) => {
        const fechaLocal = new Date(fechaTZ.toLocaleString('en-US', { timeZone: zonaHoraria }));
        const offsetUTC = fechaLocal.getTimezoneOffset();
        const fechaEnUTC = new Date(fechaLocal.getTime() + offsetUTC * 60000);
        return fechaEnUTC;
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
    convertirFechaUTCaHumano: (fechaUTC) => {
        // Expresión regular para verificar si la fecha es UTC y cumple con ISO 8601
        const regexUTC = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)$/;
        // Verificar si la fecha cumple con el formato UTC y ISO 8601
        if (!regexUTC.test(fechaUTC)) {
            return "Fecha no válida. Debe estar en formato UTC y seguir el estándar ISO 8601.";
        }
        // Obtener la fecha y la hora en formato UTC
        const fecha = new Date(fechaUTC);
        // Formatear la fecha y hora como "dd/mm/yyyy, hh:mm:ss"
        const dia = String(fecha.getUTCDate()).padStart(2, "0");
        const mes = String(fecha.getUTCMonth() + 1).padStart(2, "0");
        const año = fecha.getUTCFullYear();
        const horas = String(fecha.getUTCHours()).padStart(2, "0");
        const minutos = String(fecha.getUTCMinutes()).padStart(2, "0");
        const segundos = String(fecha.getUTCSeconds()).padStart(2, "0");
        return `${dia}/${mes}/${año}, ${horas}:${minutos}:${segundos}`;
    },
    convertirFechaHaciaISO8601: (fechaEnCadena) => {
        const partes = fechaEnCadena.split(' ');
        if (partes.length !== 2) {
            throw new Error('Formato de fecha y hora no válido.');
        }
        const [fecha, tiempoConMilesimas] = partes;
        const [dia, mes, ano] = fecha.split('/');
        const [tiempo, milisegundos] = tiempoConMilesimas.split('.');
        const [hora, minutos, segundos] = tiempo.split(':');
        const fechaISO = `${ano}-${mes}-${dia}T${hora}:${minutos}:${segundos}.${milisegundos}Z`;
        return fechaISO;
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
        const horas =  Math.floor(diferencia.hours);
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
    convertirFechaSQLAFormatoISO: (fechaString) => {
        // Dividir la cadena en partes: día, mes, año y tiempo
        const partes = fechaString.split(' ');
        // Obtener las partes de la fecha
        const fechaPartes = partes[0].split('/');
        const dia = fechaPartes[0];
        const mes = fechaPartes[1];
        const anio = fechaPartes[2];
        // Obtener las partes del tiempo
        const tiempoPartes = partes[1].split(':');
        const horas = tiempoPartes[0];
        const minutos = tiempoPartes[1];
        const segundos = tiempoPartes[2];
        // Construir la fecha en formato ISO con indicación de UTC
        const fechaISO = `${anio}-${mes}-${dia}T${horas}:${minutos}:${segundos}Z`;
        return fechaISO;
    },
    calculoImpuestosEnPagoParcial: (cantidadPagoParcial, totalNeto, sumaImpuestos) => {
        const filtroNumero = /^\d+\.\d{2}$/;
        if (!filtroNumero.test(cantidadPagoParcial)) {
            console.error(
                "Formato incorrecto para 'cantidadPagoParcial'. Introduce una cadena con un número con dos decimales."
            );
            return null;
        }
        if (!filtroNumero.test(totalNeto)) {
            console.error(
                "Formato incorrecto para 'totalNeto'. Introduce una cadena con un número con dos decimales."
            );
            return null;
        }
        if (!filtroNumero.test(sumaImpuestos)) {
            console.error(
                "Formato incorrecto para 'sumaImpuestos'. Introduce una cadena con un número con dos decimales."
            );
            return null;
        }
        // Convertir las cadenas a números antes de realizar el cálculo
        const cantidadPagoParcialNum = parseFloat(cantidadPagoParcial);
        const totalNetoNum = parseFloat(totalNeto);
        const sumaImpuestosNum = parseFloat(sumaImpuestos);
        // Realizar el cálculo
        const resultado = ((cantidadPagoParcialNum * 100) / totalNetoNum) * (sumaImpuestosNum / 100);
        // Redondear el resultado a dos decimales y devolver como cadena
        return resultado.toFixed(2);
    },
}
export {
    utilidades
}