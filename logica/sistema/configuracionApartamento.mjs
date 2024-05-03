import { conexion } from "../componentes/db.mjs"

const configuracionApartamento = async (apartamentos) => {
    if (!apartamentos || !Array.isArray(apartamentos)) {
        const error = {
            error: "el identificador del 'apartamentos' debe de ser un array"
        }
        return error
    }
    const filtroApartamento = /^[a-z0-9]+$/
    for (const apartamento of apartamentos) {
        if (!apartamento || !filtroApartamento.test(apartamento)) {
            const error = {
                error: "el identificador del 'apartamento' solo puede contener minúsculas, ni siquera espacios"
            }
            return error
        }
    }
    let apartamentosValidados = []
    const configuracion = {}
    try {
        for (const apartamentoID of apartamentos) {
            const consultaApartamento = `
            SELECT "apartamentoIDV"
            FROM "configuracionApartamento" 
            WHERE "apartamentoIDV" = $1;`
            const resuelveConsultaApartamento = await conexion.query(consultaApartamento, [apartamentoID])
            if (resuelveConsultaApartamento.rowCount === 1) {
                const apartamentosEncontrados = resuelveConsultaApartamento.rows[0]
                const estructuraApartamentoInicial = {
                    apartamentoIDV: apartamentosEncontrados.apartamentoIDV,
                    //imagen: apartamentosEncontrados.imagen
                }
                apartamentosValidados.push(estructuraApartamentoInicial)
            }
        }
        apartamentosValidados = Array.from(new Set(apartamentosValidados));
        for (const detallesApartamento of apartamentosValidados) {
            const apartamento = detallesApartamento.apartamentoIDV
            const imagenApartamento = detallesApartamento.imagen
            configuracion[apartamento] = {}
            // Ojo con esto que es la cadena binaria del apartamento y la lia muy fuerte por que se renderiz secuencialmente
            //configuracion[apartamento]["imagenApartamento"] = imagenApartamento
            const consultaNombreApartamento = `
            SELECT "apartamentoUI"
            FROM apartamentos 
            WHERE apartamento = $1;`
            const resolverNombreApartamento = await conexion.query(consultaNombreApartamento, [apartamento])
            const apartamentoIDV = resolverNombreApartamento.rows[0].apartamentoUI
            configuracion[apartamento]["apartamentoUI"] = apartamentoIDV
            const consultaCaracteristicas = `
            SELECT caracteristica
            FROM "apartamentosCaracteristicas" 
            WHERE "apartamentoIDV" = $1;`
            const resolverCaracteristicas = await conexion.query(consultaCaracteristicas, [apartamento])
            const caracteristicas = resolverCaracteristicas.rows
            configuracion[apartamento]["caracteristicas"] = caracteristicas
            const consultaHabitaciones = `
            SELECT uid, habitacion 
            FROM "configuracionHabitacionesDelApartamento"
            WHERE apartamento = $1;`
            const resuelveConsultaHabitaciones = await conexion.query(consultaHabitaciones, [apartamento])
            const hagitaciones = resuelveConsultaHabitaciones.rows
            configuracion[apartamento]["habitaciones"] = {}
            for (const habitacion of hagitaciones) {
                const habiacionIDV = habitacion["habitacion"]
                const habitacionUID = habitacion["uid"]
                configuracion[apartamento]["habitaciones"][habiacionIDV] = {}
                const consultaNombreHabitacion = `
                SELECT "habitacionUI"
                FROM habitaciones 
                WHERE habitacion = $1;`
                let resolverNombreHabitacion = await conexion.query(consultaNombreHabitacion, [habiacionIDV])
                resolverNombreHabitacion = resolverNombreHabitacion.rows[0].habitacionUI
                configuracion[apartamento]["habitaciones"][habiacionIDV]["habitacionUI"] = resolverNombreHabitacion
                const consultaCamas = `
                SELECT cama
                FROM "configuracionCamasEnHabitacion" 
                WHERE habitacion = $1;`
                const consultaHabitaciones = await conexion.query(consultaCamas, [habitacionUID])
                const camaEncontradas = consultaHabitaciones.rows
                let configuracionNumero = 0
                configuracion[apartamento]["habitaciones"][habiacionIDV]["configuraciones"] = {}
                for (const configuracionHabitacion of camaEncontradas) {
                    configuracionNumero += 1
                    const camaIDV = configuracionHabitacion["cama"]
                    const consultaNombreCamaUI = `
                    SELECT "camaUI", capacidad
                    FROM camas 
                    WHERE cama = $1;`
                    const resolverNombreCama = await conexion.query(consultaNombreCamaUI, [camaIDV])
                    const camaUI = resolverNombreCama.rows[0].camaUI
                    const capacidad = resolverNombreCama.rows[0].capacidad
                    configuracion[apartamento]["habitaciones"][habiacionIDV]["configuraciones"]["configuracion" + configuracionNumero] = {}
                    configuracion[apartamento]["habitaciones"][habiacionIDV]["configuraciones"]["configuracion" + configuracionNumero] = {
                        camaIDV: camaIDV,
                        camaUI: camaUI,
                        capacidad: capacidad
                    }
                }
            }
        }
    } catch (error) {
        throw error;
    }
    const ok = {
        configuracionApartamento: configuracion
    }
    return ok
}
export {
    configuracionApartamento
};