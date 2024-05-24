import { DateTime } from 'luxon';
import { validadoresCompartidos } from '../validadores/validadoresCompartidos.mjs';
import { codigoZonaHoraria } from '../configuracion/codigoZonaHoraria.mjs';
import { obtenerTodasLasConfiguracionDeLosApartamentosSoloDisponibles } from '../../repositorio/arquitectura/configuraciones/obtenerTodasLasConfiguracionDeLosApartamentosSoloDisponibles.mjs';
export const validarObjetoReservaSoloFormato = async (reserva) => {
    try {
        const fechaRegex = /^(0[1-9]|[1-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/;
        if (!fechaRegex.test(reserva.entrada)) {
            const error = "La fecha de entrada no tiene un formato valido, el formato valido es DD/MM/AAAAA"
            throw new Error(error)
        }
        if (!fechaRegex.test(reserva.salida)) {
            const error = "La fecha de salida no tiene un formato valido, el formato valido es DD/MM/AAAAA"
            throw new Error(error)
        }
        // Control validez fecha
        const fechaEntrada_Humano = reserva.entrada
        const fechaSalida_Humano = reserva.salida
        const fechaEntrada_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaEntrada_Humano)).fecha_ISO
        const fechaSalida_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaSalida_Humano)).fecha_ISO

        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const fechaActualTZ = tiempoZH.toISODate()

        const fechaEntrada_Objeto = DateTime.fromISO(fechaEntrada_ISO, { zone: zonaHoraria });
        const fechaSalida_Objeto = DateTime.fromISO(fechaSalida_ISO, { zone: zonaHoraria });
        if (fechaEntrada_Objeto >= fechaSalida_Objeto) {
            const error = "La fecha de entrada no puede ser igual o superior que la fecha de salida"
            throw new Error(error)
        }
        // Comprobar que existen los datos de fecha en formato number
        const alojamiento = reserva?.alojamiento
        if (!alojamiento) {
            const error = "No exite la llave de 'Alojamiento' esperada dentro del objeto, por lo tante hasta aquí hemos llegado"
            throw new Error(error)
        }
        if (alojamiento !== null && typeof alojamiento !== 'object' && alojamiento?.constructor !== Object) {
            const error = "Se esparaba un objeto para validar el alojamiento"
            throw new Error(error)
        }
        const apartemtosIDVarray = Object.keys(alojamiento)
        const controlApartamentosIDVUnicos = new Set(apartemtosIDVarray);
        if (controlApartamentosIDVUnicos.size !== apartemtosIDVarray.length) {
            const error = "Existen apartamentosIDV repetidos en el objeto de la reserva"
            throw new Error(error)
        }
        const configuracionesApartamentosSoloDisponibles = await obtenerTodasLasConfiguracionDeLosApartamentosSoloDisponibles()
        if (configuracionesApartamentosSoloDisponibles.length === 0) {
            const error = "No hay ningun apartamento disponible por confirguracion global"
            throw new Error(error)
        }
        configuracionesApartamentosSoloDisponibles.forEach((configuracionApartamento, i) => {
            configuracionesApartamentosSoloDisponibles[i] = configuracionApartamento.apartamenntoIDV
        })
        for (const [apartamentoIDV, detalleApartamento] of Object.entries(alojamiento)) {
            if (configuracionesApartamentosSoloDisponibles.includes(apartamentoIDV)) {
                const error = `Atencion, el apartamento con identificador visual '${apartamentoIDV}' no esta disponible para reservar`
                throw new Error(error)
            }
        }
        const ok = {
            ok: "No hay errores en la validacion"
        }
        return ok
    } catch (errorCapturado) {
        throw error;
    }
}
