import { DateTime } from 'luxon';
import { conexion } from '../db.mjs';
import { validadoresCompartidos } from '../validadoresCompartidos.mjs';
import { apartamentosOcupadosAirbnb } from './calendariosSincronizados/airbnb/apartamentosOcudaosAirbnb.mjs';
import { sincronizarCalendariosAirbnbPorIDV } from './calendariosSincronizados/airbnb/sincronizarCalendariosAirbnbPorIDV.mjs';
import { verificarRangoContenidoAirbnb } from './calendariosSincronizados/airbnb/verificarRangoContenidoAirbnb.mjs';
import { codigoZonaHoraria } from './codigoZonaHoraria.mjs';

const apartamentosDisponiblesPublico = async (fecha) => {
    try {
        const fechaEntrada_ISO = fecha.fechaEntrada_ISO
        const fechaSalida_ISO = fecha.fechaSalida_ISO

        await validadoresCompartidos.fechas.validarFecha_ISO(fechaEntrada_ISO)
        await validadoresCompartidos.fechas.validarFecha_ISO(fechaSalida_ISO)

        const fechaEntradaReserva_Objeto = DateTime.fromISO(fechaEntrada_ISO); // El formato es día/mes/ano
        const fechaSalidaReserva_Objeto =  DateTime.fromISO(fechaSalida_ISO);

        if (fechaEntradaReserva_Objeto >= fechaSalidaReserva_Objeto) {
            const error = "La fecha de entrada no puede ser igual o superior que la fecha de salida"
            throw new Error(error)
        }
        // Validar con limite de un año para las reservas    
        const apartamentosDisponiblesArray = []
        const zonaBloqueoPublico = "publico"
        const zonaBloqueoGlobal = "global"
        const consultaReservas = `
            SELECT reserva 
            FROM reservas 
            WHERE 
            entrada < $1::DATE AND
            salida > $2::DATE    
            AND "estadoReserva" <> 'cancelada';`

        const resuelveReservas = await conexion.query(consultaReservas, [fechaSalida_ISO, fechaEntrada_ISO])
        const reservas = resuelveReservas.rows

        const apartamentosNoDiponbilesV2 = []
        const bloqueoTemporal = "rangoTemporal"
        const apartamenosBloqueadosTemporalmente = `
        SELECT apartamento 
        FROM "bloqueosApartamentos" 
        WHERE 
        "tipoBloqueo" = $1 AND
        entrada <= $2::DATE AND
        salida >= $3::DATE AND
        ("zona" = $4 OR "zona" = $5);`
        const resuelveApartamentosBloqueadosTemporalmente = await conexion.query(apartamenosBloqueadosTemporalmente, [bloqueoTemporal, fechaSalida_ISO, fechaEntrada_ISO, zonaBloqueoPublico, zonaBloqueoGlobal])
        resuelveApartamentosBloqueadosTemporalmente.rows.map((apartamento) => {
            apartamentosNoDiponbilesV2.push(apartamento.apartamento)
        })

        const bloqueoIndefinido = "permanente"
        const apartamenosBloqueadosIndefinidamente = `
        SELECT apartamento 
        FROM "bloqueosApartamentos" 
        WHERE "tipoBloqueo" = $1 AND
        ("zona" = $2 OR "zona" = $3);`
        const resuelveApartamenosBloqueadosIndefinidamente = await conexion.query(apartamenosBloqueadosIndefinidamente, [bloqueoIndefinido, zonaBloqueoPublico, zonaBloqueoGlobal])
        resuelveApartamenosBloqueadosIndefinidamente.rows.map((apartamento) => {
            apartamentosNoDiponbilesV2.push(apartamento.apartamento)
        })

        for (const reserva of reservas) {
            const reservaUID = reserva["reserva"]
            const consultaApartamentosNoDisponibles = `
                SELECT apartamento 
                FROM "reservaApartamentos" 
                WHERE reserva = $1;`
            const ApartamentosNoDisponibles = await conexion.query(consultaApartamentosNoDisponibles, [reservaUID])
            ApartamentosNoDisponibles.rows.map((apartamento) => {
                const apartamentoIDV = apartamento.apartamento
                apartamentosNoDiponbilesV2.push(apartamentoIDV)
            })
        }

        const estadoDisponibleApartamento = "disponible"
        const consultaFinalDinamica = `
                SELECT 
                "apartamentoIDV"
                FROM 
                "configuracionApartamento" 
                WHERE 
                "estadoConfiguracion" = $1;`
        const apartamentosDisponibles = await conexion.query(consultaFinalDinamica, [estadoDisponibleApartamento])
        if (apartamentosDisponibles.rowCount === 0) {
            const error = "No hay ningun apartamento disponible"
            throw new Error(error)
        }
        const estadoNoDisponibleApartamento = "nodisponible"

        const consultaApartamentosNoDispopnbiles = `
        SELECT 
        "apartamentoIDV"
        FROM 
        "configuracionApartamento" 
        WHERE 
        "estadoConfiguracion" = $1;`
        const resuelveConsultaApartamentosNoDisponibles = await conexion.query(consultaApartamentosNoDispopnbiles, [estadoNoDisponibleApartamento])
        if (resuelveConsultaApartamentosNoDisponibles.rowCount > 0) {
            resuelveConsultaApartamentosNoDisponibles.rows.map((apartamentoNoDisponible) => {
                apartamentosNoDiponbilesV2.push(apartamentoNoDisponible.apartamentoIDV)
            })
        }
        apartamentosDisponibles.rows.map((apartamento) => {
            apartamentosDisponiblesArray.push(apartamento.apartamentoIDV)
        })
        const apartamentosNoDisponiblesArray = Array.from(new Set(apartamentosNoDiponbilesV2));
        const apartamentosDisponiblesFinal = apartamentosDisponiblesArray.filter(apartamento => !apartamentosNoDisponiblesArray.includes(apartamento));
        const datosAirbnb = {
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_ISO,
            apartamentosDisponibles: apartamentosDisponiblesFinal,
        }
        const apartamentosOcupadosPorEliminar_Airbnb = await apartamentosOcupadosAirbnb(datosAirbnb)

        for (const apartamentoIDV of apartamentosOcupadosPorEliminar_Airbnb) {
            const elementoParaBorrar = apartamentosDisponiblesFinal.indexOf(apartamentoIDV);
            if (elementoParaBorrar !== -1) {
                apartamentosDisponiblesFinal.splice(elementoParaBorrar, 1);
                apartamentosNoDisponiblesArray.push(apartamentoIDV)

            }
        }
     
        const ok = {
            apartamentosNoDisponibles: apartamentosNoDisponiblesArray,
            apartamentosDisponibles: apartamentosDisponiblesFinal,
            detalles: "Se esta teniendo en cuenta, el estado de los apartamentos, los bloqueos y las reservas"
        }
        return ok


    } catch (error) {

        throw error;
    }

}



export {
    apartamentosDisponiblesPublico
};