import { DateTime } from 'luxon';
import { conexion } from '../db.mjs';
import { insertarTotalesReserva } from './insertarTotalesReserva.mjs';
import { validadoresCompartidos } from '../validadoresCompartidos.mjs';
const insertarReserva = async (reserva) => {
    try {
        const fechaEntrada_Humano = reserva.entrada
        const fechaSalida_Humano = reserva.salida
        
        const fechaEntrada_ISO =  (await validadoresCompartidos.fechas.validarFecha_Humana(fechaEntrada_Humano)).fecha_ISO
        const fechaSalida_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaSalida_Humano)).fecha_ISO
        const estadoReserva = "confirmada"
        const estadoPago = "noPagado"
        const origen = "cliente"
        const fechaReserva = DateTime.utc().toISO()
        const alojamiento = reserva.alojamiento
        const titularReservaPool = reserva.datosTitular.nombreTitular
        const pasaporteTitularPool = reserva.datosTitular.pasaporteTitular
        const correoTitular = reserva.datosTitular.correoTitular
        const telefonoTitular = reserva.datosTitular.telefonoTitular
        await conexion.query('BEGIN'); // Inicio de la transacción
        const consultaReserva = `
        INSERT INTO
        reservas
        (
        entrada,
        salida,
        "estadoReserva",
        origen,
        creacion,
        "estadoPago"
        )
        VALUES
        ($1,$2,$3,$4,$5,$6)
        RETURNING
        reserva;`
        const datosReservas = [
            fechaEntrada_ISO,
            fechaSalida_ISO,
            estadoReserva,
            origen,
            fechaReserva,
            estadoPago
        ]
        const insertarReserva = await conexion.query(consultaReserva, datosReservas)
        const reservaUID = insertarReserva.rows[0].reserva;
        const cosultaInsertarTitularPool = `
            INSERT INTO
            "poolTitularesReserva"
            (
            "nombreTitular",
            "pasaporteTitular",
            "emailTitular",
            "telefonoTitular",
            reserva
            )
            VALUES 
            ($1, $2, $3, $4, $5);`
        const datosInsertarTitularPool = [
            titularReservaPool,
            pasaporteTitularPool,
            correoTitular,
            telefonoTitular,
            reservaUID
        ]
        const insertarTitularPool = await conexion.query(cosultaInsertarTitularPool, datosInsertarTitularPool)
        if (insertarTitularPool.rowCount === 0) {
            const error = "No se ha podido insertar los datos del titular en la base de datos"
            throw new Error(error)
        }
        
        for (const apartamentoConfiguracion in alojamiento) {
            const apartamento = apartamentoConfiguracion
            const habitaciones = alojamiento[apartamentoConfiguracion].habitaciones
            const consultaNombreApartamento = `
            SELECT
            "apartamentoUI"
            FROM
            apartamentos
            WHERE
            apartamento = $1;`
            const resolucionNombreApartamento = await conexion.query(consultaNombreApartamento, [apartamento])
            if (resolucionNombreApartamento.rowCount === 0) {
                const error = "No existe el identificador del apartamentoIDV 3"
                throw new Error(error)
            }
            const apartamentoUI = resolucionNombreApartamento.rows[0].apartamentoUI
            const consultaInsertarApartamento = `
            INSERT INTO
            "reservaApartamentos"
            (
            reserva,
            apartamento,
            "apartamentoUI"
            )
            VALUES
            ($1,$2,$3) 
            RETURNING
            uid;`
            const datosInsertarApartamento = [
                reservaUID,
                apartamento,
                apartamentoUI
            ]
            const insertaApartamento = await conexion.query(consultaInsertarApartamento, datosInsertarApartamento)
            const apartamentoUID = insertaApartamento.rows[0].uid
            
            for (const habitacionConfiguracion in habitaciones) {
                const habitacion = habitacionConfiguracion
                const camaIDV = habitaciones[habitacion].camaSeleccionada.camaIDV
                const pernoctantesPool = habitaciones[habitacion]["pernoctantes"]
                const consultaNombreHabitacion = `
                SELECT
                "habitacionUI"
                FROM
                habitaciones
                WHERE
                habitacion = $1;`
                const resolucionNombreHabitacion = await conexion.query(consultaNombreHabitacion, [habitacion])
                if (resolucionNombreHabitacion.rowCount === 0) {
                    const error = "No existe el identificador de la habitacionIDV"
                    throw new Error(error)
                }
                const habitacionUI = resolucionNombreHabitacion.rows[0].habitacionUI
                const consultaInsertarHabitacion = `
                INSERT INTO
                "reservaHabitaciones"
                ( 
                apartamento,
                habitacion,
                reserva,
                "habitacionUI"
                )
                VALUES
                ($1,$2,$3,$4)  
                RETURNING
                uid;`
                const datosInsertarHabitacion = [
                    apartamentoUID,
                    habitacion,
                    reservaUID,
                    habitacionUI
                ]
                const insertaHabitacion = await conexion.query(consultaInsertarHabitacion, datosInsertarHabitacion)
                const habitacionUID = insertaHabitacion.rows[0].uid
                const consultaNombreCama = `
                SELECT 
                "camaUI" 
                FROM 
                camas 
                WHERE 
                cama = $1`
                const resolucionNombreCama = await conexion.query(consultaNombreCama, [camaIDV])
                if (resolucionNombreCama.rowCount === 0) {
                    const error = "No existe el identificador de la camaIDV"
                    throw new Error(error)
                }
                const camaUI = resolucionNombreCama.rows[0].camaUI
                const consultaInsertarCama = `
                INSERT INTO 
                "reservaCamas" 
                (
                habitacion,
                cama,
                reserva,
                "camaUI"
                )
                VALUES
                ($1,$2,$3,$4) 
                RETURNING 
                uid `
                const datosInsertarCama = [
                    habitacionUID,
                    camaIDV,
                    reservaUID,
                    camaUI
                ]
                const insertaCama = await conexion.query(consultaInsertarCama, datosInsertarCama)
                const camaUID = insertaCama.rows[0].uid
                /*
                for (const pernoctantePool of pernoctantesPool) {
                    let pernoctanteNombre = pernoctantePool.nombre
                    let pernoctantePasaporte = pernoctantePool.pasaporte
                    if (pernoctanteNombre || pernoctantePasaporte) {
                        pernoctanteNombre = pernoctanteNombre ? pernoctanteNombre : "(Sin nombre)"
                        pernoctantePasaporte = pernoctantePasaporte ? pernoctantePasaporte : "(Sin pasaporte)"
                        const consultaReservasPernoctante = `
                        INSERT INTO 
                        "reservaPernoctantes" 
                        (
                        reserva,
                        habitacion
                        )
                        VALUES
                        ($1,$2) 
                        RETURNING "pernoctanteUID";`
                        const datosReservarPernoctantes = [
                            reservaUID,
                            habitacionUID
                        ]
                        const reservasPernoctante = await conexion.query(consultaReservasPernoctante, datosReservarPernoctantes)
                        const pernoctanteUID = reservasPernoctante.rows[0].pernoctanteUID
                        const consultaPernoctantePool = `
                        INSERT INTO
                        "poolClientes"
                        (
                        "nombreCompleto",
                        pasaporte,
                        "pernoctanteUID"
                        )
                        VALUES
                        ($1,$2,$3) 
                        RETURNING 
                        uid;`
                        const datosPernoctantePool = [
                            pernoctanteNombre,
                            pernoctantePasaporte,
                            pernoctanteUID
                        ]
                        await conexion.query(consultaPernoctantePool, datosPernoctantePool)
                    }
                }*/
            }
        }
        
        const transaccion = {
            tipoProcesadorPrecio: "objeto",
            reserva: reserva,
            reservaUID: reservaUID
        }
        await insertarTotalesReserva(transaccion)
        
        //resolverPrecio = resolverPrecio.ok
        await conexion.query('COMMIT'); // Confirmar la transacción
        const ok = {
            ok: "reserva insertada con exito",
            reservaUID: reservaUID
        }
        return ok
    } catch (error) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        throw error;
    }
}
export {
    insertarReserva
}