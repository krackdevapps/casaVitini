import { DateTime } from 'luxon';
import { conexion } from '../../db.mjs';
import { apartamentosOcupadosAirbnb } from '../calendariosSincronizados/airbnb/apartamentosOcudaosAirbnb.mjs';
import { validadoresCompartidos } from '../../validadoresCompartidos.mjs';
import { reservasPorRango } from './reservasPorRango.mjs';
import { bloqueosPorRango_apartamentoIDV } from './bloqueosPorRango_apartamentoIDV.mjs';
const apartamentosPorRango = async (metadatos) => {
    const fechaEntrada_ISO = metadatos.fechaEntrada_ISO
    const fechaSalida_ISO = metadatos.fechaSalida_ISO
    const apartamentosIDV = metadatos.apartamentosIDV || []
    const origen = metadatos.origen || "plaza"
    const rol = metadatos.rol || ""
    try {
        await validadoresCompartidos.fechas.validarFecha_ISO(fechaEntrada_ISO)
        await validadoresCompartidos.fechas.validarFecha_ISO(fechaSalida_ISO)
        const fechaEntrada_Objeto = DateTime.fromISO(fechaEntrada_ISO); // El formato es día/mes/ano
        const fechaSalida_Objeto = DateTime.fromISO(fechaSalida_ISO);
        if (fechaEntrada_Objeto >= fechaSalida_Objeto) {
            const error = "La fecha de entrada no puede ser igual o superior que la fecha de salida"
            throw new Error(error)
        }
        const apartamentosDisponiblesArray = []
        const configuracionReservas = {
            fechaIncioRango_ISO: fechaEntrada_ISO,
            fechaFinRango_ISO: fechaSalida_ISO,
        }
        const reservas = await reservasPorRango(configuracionReservas)
        console.log("reserevas", reservas)
        const apartametnosIDVBloqueoados = []
        const configuracionBloqueos = {
            fechaInicioRango_ISO: fechaEntrada_ISO,
            fechaFinRango_ISO: fechaSalida_ISO,
            apartamentoIDV: apartamentosIDV,
            zonaBloqueo_array: ["publico", "global"],
        }
        if (
            origen === "administracion"
            &&
            (rol === "administrador" || rol === "empleado")
        ) {
            configuracionBloqueos.zonaBloqueo_array = ["privado", "global"]
        }
        const bloqueos = await bloqueosPorRango_apartamentoIDV(configuracionBloqueos)
        bloqueos.map((apartamento) => {
            apartametnosIDVBloqueoados.push(apartamento.apartamento)
        })
        for (const reserva of reservas) {
            const reservaUID = reserva["reserva"]
            const consultaApartamentosNoDisponibles = `
                SELECT apartamento 
                FROM "reservaApartamentos" 
                WHERE reserva = $1`
            const ApartamentosNoDisponibles = await conexion.query(consultaApartamentosNoDisponibles, [reservaUID])
            if (ApartamentosNoDisponibles.rows.length > 0) {
                ApartamentosNoDisponibles.rows.map((apartamento) => {
                    const apartamentoIDV = apartamento.apartamento
                    apartametnosIDVBloqueoados.push(apartamentoIDV)
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
                apartametnosIDVBloqueoados.push(apartamentoNoDisponible.apartamentoIDV)
            })
        }
        apartamentosDisponibles.rows.map((apartamento) => {
            apartamentosDisponiblesArray.push(apartamento.apartamentoIDV)
        })
        const apartamentosNoDisponiblesArray = Array.from(new Set(apartametnosIDVBloqueoados));
        const apartamentosDisponiblesFinal = apartamentosDisponiblesArray.filter(apartamento => !apartamentosNoDisponiblesArray.includes(apartamento));
        const datosAirbnb = {
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_ISO,
            apartamentosDisponibles: apartamentosDisponiblesFinal,
        }
        const apartamentosOcupadosPorEliminar_Airbnb = await apartamentosOcupadosAirbnb(datosAirbnb)
        console.log("apartamentosOcupadosPorEliminar_Airbnb", apartamentosOcupadosPorEliminar_Airbnb)

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
            detalles: "Se esta teniendo en cuenta, los apartamentos en reservas y los apartamentos no disponbiles definidos por la configuración global de alojamiento"
        }
        return ok
    } catch (error) {
        throw error;
    }
}
export {
    apartamentosPorRango
};