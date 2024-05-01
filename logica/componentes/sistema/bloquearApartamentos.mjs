import { conexion } from '../db.mjs';
import { validadoresCompartidos } from '../validadoresCompartidos.mjs';
const bloquearApartamentos = async (metadatos) => {
    try {
        const reserva = metadatos.reserva
        const apartamentoUID = metadatos.apartamentoUID
        const tipoBloqueo = metadatos.tipoBloqueo
        const fechaEntrada_ISO = metadatos.fechaEntrada_ISO
        const fechaSalida_ISO = metadatos.fechaSalida_ISO
        const zonaBloqueo = metadatos.zonaBloqueo
        const origen = metadatos.origen


        await validadoresCompartidos.fechas.validarFecha_ISO(fechaEntrada_ISO)
        await validadoresCompartidos.fechas.validarFecha_ISO(fechaSalida_ISO)
        if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
            const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo"
            throw new Error(error)
        }
        if (typeof apartamentoUID !== "number" || !Number.isInteger(apartamentoUID) || apartamentoUID <= 0) {
            const error = "El campo 'apartamentoUID' debe ser un tipo numero, entero y positivo"
            throw new Error(error)
        }
        if (tipoBloqueo !== "rangoTemporal" && tipoBloqueo !== "permanente" && tipoBloqueo !== "sinBloqueo") {
            const error = "El campo 'tipoBloqueo' solo puede ser rangoTemporal, permanente, sinBloqueo"
            throw new Error(error)
        }
        if (zonaBloqueo !== "publico" && zonaBloqueo !== "privado" && zonaBloqueo !== "global") {
            const error = "El campo 'zonaBloqueo' solo puede ser publico, privado, global"
            throw new Error(error)
        }
        if (origen !== "cancelacionDeReserva" && origen !== "eliminacionApartamentoDeReserva") {
            const error = "El campo 'origen' solo puede ser cancelacionDeReserva o eliminacionApartamentoDeReserva"
            throw new Error(error)
        }

        const validarReserva = `
        SELECT 
        reserva
        FROM reservas 
        WHERE reserva = $1;`
        const resuelveValidarReserva = await conexion.query(validarReserva, [reserva])
        if (resuelveValidarReserva.rowCount === 0) {
            const error = "No existe al reserva"
            throw new Error(error)
        }
        const validarApartamento = `
        SELECT 
        apartamento 
        FROM "reservaApartamentos" 
        WHERE reserva = $1 and uid = $2;`
        const resuelveValidarApartamento = await conexion.query(validarApartamento, [reserva, apartamentoUID])
        if (resuelveValidarApartamento.rowCount === 0) {
            const error = "No existe el apartamento dentro de esta reserva"
            throw new Error(error)
        }
        const apartamentoIDV = resuelveValidarApartamento.rows[0].apartamento
        const validarConfiguracionApartamento = `
        SELECT 
        "apartamentoIDV"
        FROM "configuracionApartamento" 
        WHERE "apartamentoIDV" = $1;`
        const resuelveValidarConfiguracionApartamento = await conexion.query(validarConfiguracionApartamento, [apartamentoIDV])
        if (resuelveValidarConfiguracionApartamento.rowCount === 0) {
            const error = "No existe el apartamento como configuracion, solo puede eliminarse de la reserva, pero sin bloqueo adquirido."
            throw new Error(error)
        }

        let motivoFinal

        if (origen === "cancelacionDeReserva") {
            motivoFinal = `Bloqueo producido por la cancelación de la reserva ${reserva}`
        }
        if (origen === "eliminacionApartamentoDeReserva") {
            motivoFinal = `Bloqueo producido por eliminar este apartamento de la reserva ${reserva}`
        }
        if (tipoBloqueo === "rangoTemporal") {

            const insertaBloqueoApartamento = `
            INSERT INTO 
            "bloqueosApartamentos"
            (
            apartamento,
            "tipoBloqueo",
            entrada,
            salida,
            motivo,
            zona
            )
            VALUES ($1,$2,$3,$4,$5,$6)
            `
            const datosBloqueo = [
                apartamentoIDV,
                tipoBloqueo,
                fechaEntrada_ISO,
                fechaSalida_ISO,
                motivoFinal,
                zonaBloqueo
            ]

            const resuelveinsertaBloqueoApartamento = await conexion.query(insertaBloqueoApartamento, datosBloqueo)
            if (resuelveinsertaBloqueoApartamento.rowCount === 0) {
                const error = "No se ha podido aplicar el bloquo temporal"
                throw new Error(error)
            }
        }
        if (tipoBloqueo === "permanente") {
            const insertaBloqueoApartamento = `
            INSERT INTO 
            "bloqueosApartamentos"
            (
            apartamento,
            "tipoBloqueo",
            motivo,
            zona
            )
            VALUES ($1,$2,$3,$4)
            `
            const datosBloqueo = [
                apartamentoIDV,
                tipoBloqueo,
                motivoFinal,
                zonaBloqueo
            ]
            const resuelveinsertaBloqueoApartamento = await conexion.query(insertaBloqueoApartamento, datosBloqueo)
            if (resuelveinsertaBloqueoApartamento.rowCount === 0) {
                const error = "No se ha podido aplicar el bloqeuo indefinido"
                throw new Error(error)
            }
        }
        const ok = {}
        if (tipoBloqueo === "rangoTemporal") {
            ok.ok = "Se ha eliminado el apartamento y aplicado el bloqueo temporal"

        }
        if (tipoBloqueo === "permanente") {
            ok.ok = "Se ha eliminado el apartamento y aplicado el bloqueo permanente"

        }
        if (tipoBloqueo === "sinBloqueo") {
            ok.ok = "Se ha eliminado el apartamento de la reserva y se ha liberado"

        }
        return ok
    } catch (error) {
        throw error;
    }
}
export {
    bloquearApartamentos
};