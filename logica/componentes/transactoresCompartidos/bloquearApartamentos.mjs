import { conexion } from '../db.mjs';
import { validadoresCompartidos } from '../validadoresCompartidos.mjs';
const bloquearApartamentos = async (metadatos) => {
    try {
        const reserva = metadatos.reserva
        const apartamentoUID = metadatos.apartamentoUID
        const tipoBloqueo = metadatos.tipoBloqueo
        const fechaEntrada_ISO = metadatos.fechaEntrada_ISO
        const fechaSalida_ISO = metadatos.fechaSalida_ISO
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
        let estado = "disponible"
        const zonaBloqueo = "global"
        const motivo = `Bloqueo producido por eliminar este apartamento de la reserva ${reserva}`
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
                motivo,
                zonaBloqueo
            ]
            const resuelveinsertaBloqueoApartamento = await conexion.query(insertaBloqueoApartamento, datosBloqueo)
            if (resuelveinsertaBloqueoApartamento.rowCount === 0) {
                const error = "No se ha podido aplicar el bloquo temporal"
                throw new Error(error)
            }
        }
        if (tipoBloqueo === "permanente") {
            let insertaBloqueoApartamento = `
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
                motivo,
                zonaBloqueo
            ]
            let resuelveinsertaBloqueoApartamento = await conexion.query(insertaBloqueoApartamento, datosBloqueo)
            if (resuelveinsertaBloqueoApartamento.rowCount === 0) {
                let error = "No se ha podido aplicar el bloqeuo indefinido"
                throw new Error(error)
            }
        }
        let ok
        if (tipoBloqueo === "rangoTemporal") {
            ok = {
                "ok": "Se ha eliminado el apartamento y aplicado el bloqueo temporal"
            }
        }
        if (tipoBloqueo === "permanente") {
            ok = {
                "ok": "Se ha eliminado el apartamento y aplicado el bloqueo permanente"
            }
        }
        if (tipoBloqueo === "sinBloqueo") {
            ok = {
                "ok": "Se ha eliminado el apartamento de la reserva y se ha liberado"
            }
        }
        return ok
    } catch (error) {
        throw error;
    }
}
export {
    bloquearApartamentos
};