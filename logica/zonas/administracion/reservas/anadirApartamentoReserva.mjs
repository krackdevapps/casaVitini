import { Mutex } from "async-mutex";
import { conexion } from "../../../componentes/db.mjs";
import { apartamentosPorRango } from "../../../sistema/selectoresCompartidos/apartamentosPorRango.mjs";
import { resolverApartamentoUI } from "../../../sistema/sistemaDeResolucion/resolverApartamentoUI.mjs";
import { insertarTotalesReserva } from "../../../sistema/sistemaDeReservas/insertarTotalesReserva.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { eliminarBloqueoCaducado } from "../../../sistema/sistemaDeBloqueos/eliminarBloqueoCaducado.mjs";


export const anadirApartamentoReserva = async (entrada, salida) => {
    let mutex
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        mutex = new Mutex();
        await mutex.acquire();

        const reserva = entrada.body.reserva;
        const apartamento = entrada.body.apartamento;
        if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
            const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo";
            throw new Error(error);
        }
        const filtroCadena = /^[a-z0-9]+$/;
        if (!filtroCadena.test(apartamento) || typeof apartamento !== "string") {
            const error = "el campo 'apartamento' solo puede ser una cadena de letras minúsculas y numeros.";
            throw new Error(error);
        }
        await eliminarBloqueoCaducado();
        // Validar que le nombre del apartamento existe como tal
        const validacionNombreApartamento = `
                        SELECT *
                        FROM "configuracionApartamento"
                        WHERE "apartamentoIDV" = $1
                        `;
        const resuelveValidacionNombreApartamento = await conexion.query(validacionNombreApartamento, [apartamento]);
        if (resuelveValidacionNombreApartamento.rowCount === 0) {
            const error = "No existe el nombre del apartamento, revisa el nombre escrito";
            throw new Error(error);
        }
        // valida reserva y obten fechas
        const validacionReserva = `
                        SELECT 
                        to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
                        to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO",
                        "estadoReserva", 
                        "estadoPago"
                        FROM reservas
                        WHERE reserva = $1
                        `;
        const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva]);
        if (resuelveValidacionReserva.rowCount === 0) {
            const error = "No existe la reserva";
            throw new Error(error);
        }
        if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
            const error = "La reserva no se puede modificar por que esta cancelada";
            throw new Error(error);
        }
        const fechaEntrada_ISO = resuelveValidacionReserva.rows[0].fechaEntrada_ISO;
        const fechaSalida_ISO = resuelveValidacionReserva.rows[0].fechaSalida_ISO;
        // ACABAR ESTA SENTENCIA DE ABAJO--
        // validar que el apartamento no este ya en la reserva
        const validacionHabitacionYaExisteneEnReserva = `
                        SELECT 
                        apartamento
                        FROM "reservaApartamentos"
                        WHERE reserva = $1 AND apartamento = $2
                        `;
        const resuelvevalidacionHabitacionYaExisteneEnReserva = await conexion.query(validacionHabitacionYaExisteneEnReserva, [reserva, apartamento]);
        if (resuelvevalidacionHabitacionYaExisteneEnReserva.rowCount === 1) {
            const error = "El apartamento ya existe en la reserva";
            throw new Error(error);
        }
        const rol = entrada.session.rol;
        const configuracionApartamentosPorRango = {
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_ISO,
            rol: rol,
            origen: "administracion"
        };
        const resuelveApartamentosDisponibles = await apartamentosPorRango(configuracionApartamentosPorRango);
        const apartamentosDisponiblesResueltos = resuelveApartamentosDisponibles.apartamentosDisponibles;
        if (apartamentosDisponiblesResueltos.length === 0) {
            const error = "No hay ningun apartamento disponbile para las fechas de la reserva";
            throw new Error(error);
        }
        if (apartamentosDisponiblesResueltos.length > 0) {
            let resultadoValidacion = null;
            for (const apartamentosDisponible of apartamentosDisponiblesResueltos) {
                if (apartamento === apartamentosDisponible) {
                    resultadoValidacion = apartamento;
                }
            }
            const apartamentoUI = await resolverApartamentoUI(apartamento);
            const insertarApartamento = `
                                INSERT INTO "reservaApartamentos"
                                (
                                reserva,
                                apartamento,
                                "apartamentoUI"
                                )
                                VALUES ($1, $2, $3) RETURNING uid
                                `;
            const resuelveInsertarApartamento = await conexion.query(insertarApartamento, [reserva, apartamento, apartamentoUI]);
            if (resuelveInsertarApartamento.rowCount === 1) {
                const transaccionPrecioReserva = {
                    tipoProcesadorPrecio: "uid",
                    reservaUID: reserva
                };
                await insertarTotalesReserva(transaccionPrecioReserva);
                const ok = {
                    ok: "apartamento anadido correctamente",
                    apartamentoIDV: apartamento,
                    apartamentoUI: apartamentoUI,
                    nuevoUID: resuelveInsertarApartamento.rows[0].uid,
                };
                salida.json(ok);
            }
        }
        // En el modo forzoso el apartamento entra igual
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}