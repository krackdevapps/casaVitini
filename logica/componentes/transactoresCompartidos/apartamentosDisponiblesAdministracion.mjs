import { DateTime } from 'luxon';
import { conexion } from '../db.mjs';
import { verificarRangoContenidoAirbnb } from './calendariosSincronizados/airbnb/verificarRangoContenidoAirbnb.mjs';
import { sincronizarCalendariosAirbnbPorIDV } from './calendariosSincronizados/airbnb/sincronizarCalendariosAirbnbPorIDV.mjs';
import { apartamentosOcupadosAirbnb } from './calendariosSincronizados/airbnb/apartamentosOcudaosAirbnb.mjs';


const apartamentosDisponiblesAdministracion = async (fecha) => {
    const fechaEntrada = fecha.fechaEntrada
    const fechaSalida = fecha.fechaSalida
    try {
        const filtroFecha = /^(?:(?:31(\/)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/)(?:0?[1,3-9]|1[0-2]))\2|(?:(?:0?[1-9])|(?:1[0-9])|(?:2[0-8]))(\/)(?:0?[1-9]|1[0-2]))\3(?:(?:19|20)[0-9]{2})$/;
        if (!filtroFecha.test(fechaEntrada)) {
            const error = "el formato fecha de entrada no esta correctametne formateado"
            throw new Error(error)
        }

        if (!filtroFecha.test(fechaSalida)) {
            const error = "el formato fecha de salida no esta correctametne formateado"
            throw new Error(error)

        }
        // Formateo fecha mucho ojo que los anglosajones tiene el formato mes/dia/ano y queremos usar dia/mes/ano y el objeto date de javascript por cojones usa ese formato
        const desgloseEntrada = fechaEntrada.split("/")
        const diaEntrada = desgloseEntrada[0]
        const mesEntrada = desgloseEntrada[1]
        const anoEntrada = desgloseEntrada[2]
        const fechaEntrada_ISO = `${anoEntrada}-${mesEntrada}-${diaEntrada}`

        const desgloseSalida = fechaSalida.split("/")
        const diaSalida = desgloseSalida[0]
        const mesSalida = desgloseSalida[1]
        const anoSalida = desgloseSalida[2]
        const fechaSalida_ISO = `${anoSalida}-${mesSalida}-${diaSalida}`


        const fechaEntrada_Objeto = DateTime.fromISO(fechaEntrada_ISO); // El formato es día/mes/ano
        const fechaSalida_Objeto = DateTime.fromISO(fechaSalida_ISO);

        if (fechaEntrada_Objeto >= fechaSalida_Objeto) {
            const error = "La fecha de entrada no puede ser igual o superior que la fecha de salida"
            throw new Error(error)
        }

        const apartamentosDisponiblesArray = []
        const apartamentoDisponiblesFinal = []
        const zonaBloqueoPrivado = "privado"
        const zonaBloqueoGlobal = "global"
        const consultaReservas = `
            SELECT reserva 
            FROM reservas 
            WHERE entrada < $1::DATE AND salida > $2::DATE
            AND "estadoReserva" <> 'cancelada';`



        const resuelveRreservas = await conexion.query(consultaReservas, [fechaSalida_ISO, fechaEntrada_ISO])
        const reservas = resuelveRreservas.rows

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
        const resuelveApartamentosBloqueadosTemporalmente = await conexion.query
            (apartamenosBloqueadosTemporalmente, [bloqueoTemporal, fechaSalida_ISO, fechaEntrada_ISO, zonaBloqueoPrivado, zonaBloqueoGlobal])
        resuelveApartamentosBloqueadosTemporalmente.rows.map((apartamento) => {
            apartamentosNoDiponbilesV2.push(apartamento.apartamento)
        })

        const bloqueoIndefinido = "permanente"
        const apartamenosBloqueadosIndefinidamente = `
        SELECT apartamento 
        FROM "bloqueosApartamentos" 
        WHERE 
        "tipoBloqueo" = $1 AND
        ("zona" = $2 OR "zona" = $3);`
        const resuelveApartamenosBloqueadosIndefinidamente = await conexion.query(apartamenosBloqueadosIndefinidamente, [bloqueoIndefinido, zonaBloqueoPrivado, zonaBloqueoGlobal])
        resuelveApartamenosBloqueadosIndefinidamente.rows.map((apartamento) => {
            apartamentosNoDiponbilesV2.push(apartamento.apartamento)
        })


        for (let reserva of reservas) {
            const reservaUID = reserva["reserva"]
            const consultaApartamentosNoDisponibles = `
                SELECT apartamento 
                FROM "reservaApartamentos" 
                WHERE reserva = $1`
            const ApartamentosNoDisponibles = await conexion.query(consultaApartamentosNoDisponibles, [reservaUID])

            if (ApartamentosNoDisponibles.rows.length > 0) {
                ApartamentosNoDisponibles.rows.map((apartamento) => {
                    const apartamentoIDV = apartamento.apartamento
                    apartamentosNoDiponbilesV2.push(apartamentoIDV)
                })
            }
        }
        const estadoDisponibleApartamento = "disponible"

        const consultaFinalDinamica = `
        SELECT "apartamentoIDV" 
        FROM "configuracionApartamento" 
        WHERE "estadoConfiguracion" = $1
        `
        const apartamentosDisponibles = await conexion.query(consultaFinalDinamica, [estadoDisponibleApartamento])
        if (apartamentosDisponibles.rowCount === 0) {
            const error = "No hay ningun apartamento disponible"
            throw new Error(error)
        }
        const estadoNoDisponibleApartamento = "noDisponible"
        const consultaApartamentosNoDispopnbiles = `
        SELECT "apartamentoIDV" 
        FROM "configuracionApartamento" 
        WHERE "estadoConfiguracion" = $1
        `
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
                console.log("Cadena eliminada:", apartamentoIDV);
                console.log("Nuevo array:", apartamentosDisponiblesFinal);
                apartamentosNoDisponiblesArray.push(apartamentoIDV)

            }
        }
       
        const ok = {
            apartamentosNoDisponibles: apartamentosNoDisponiblesArray,
            apartamentosDisponibles: apartamentosDisponiblesFinal,
            detalles: "Se esta teniendo en cuenta, los apartamentos en reservas y los apartamentos no disponbiles definidos por la configuración global de alojamiento"
        }
        return ok
    } catch (error) {
        throw error;
    }

}



export {
    apartamentosDisponiblesAdministracion
};