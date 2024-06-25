import Decimal from 'decimal.js';
import { constructorObjetoEstructuraPrecioDia } from './constructorObjetoEstructuraPrecioDia.mjs';
import { DateTime } from 'luxon';
const precisionDecimal = Number(process.env.PRECISION_DECIMAL)
Decimal.set({ precision: precisionDecimal });
export const constructorIndiceDias = async (data) => {
    try {
        const fechaEntrada_ISO = data.fechaEntrada_ISO
        const fechaSalida_ISO = data.fechaSalida_ISO
        const diasArray = constructorObjetoEstructuraPrecioDia(fechaEntrada_ISO, fechaSalida_ISO)
        diasArray.pop()
        const diasAgrupados = []
        const indiceDias = {
            nombresDiasAgrupados: new Set(diasAgrupados),
            nombresConFechas: {}
        }
        const nombresDiasAgrupados = indiceDias.nombresDiasAgrupados
        const nombresConFechas = indiceDias.nombresConFechas

        diasArray.forEach((fechaISO) => {
            const fechaDelDia = DateTime.fromISO(fechaISO)
            const nombreDelDia = fechaDelDia.setLocale('es')
                .toFormat('cccc')
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
            nombresDiasAgrupados.add(nombreDelDia);
            nombresConFechas[fechaISO] = nombreDelDia
        })
        indiceDias.nombresDiasAgrupados = [...nombresDiasAgrupados]

        return indiceDias
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
