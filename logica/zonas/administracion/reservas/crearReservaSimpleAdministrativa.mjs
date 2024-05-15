import { conexion } from "../../../componentes/db.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { apartamentosPorRango } from "../../../sistema/selectoresCompartidos/apartamentosPorRango.mjs";
import { insertarTotalesReserva } from "../../../sistema/reservas/insertarTotalesReserva.mjs";
import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { eliminarBloqueoCaducado } from "../../../sistema/bloqueos/eliminarBloqueoCaducado.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerNombreApartamentoUI } from "../../../repositorio/arquitectura/obtenerNombreApartamentoUI.mjs";

export const crearReservaSimpleAdministrativa = async (entrada, salida) => {
    let mutex
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        mutex = new Mutex();
        await mutex.acquire();


        const fechaEntrada = entrada.body.fechaEntrada;
        const fechaSalida = entrada.body.fechaSalida;
        const apartamentos = validadoresCompartidos.tipos.array({
            array: entrada.body.apartamentos,
            nombreCampo: "El array de apartamentos",
            filtro: "soloCadenasIDV",
            noSePermitenDuplicados: "si"
        })
        // Control validez fecha
        const fechaEntrada_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaEntrada)).fecha_ISO;
        const fechaSalida_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaSalida)).fecha_ISO;

        await eliminarBloqueoCaducado();
        // validar que en el array hay un maximo de posiciones no superior al numero de filas que existen en los apartementos
        const estadoDisonibleApartamento = "disponible";
        const validarNumeroApartamentosMaximoArrayEntrante = `
                        SELECT
                        "apartamentoIDV"
                        FROM "configuracionApartamento"
                        WHERE "estadoConfiguracion" = $1`;
        const resuelveValidarNumeroApartamentosMaximoArrayEntrante = await conexion.query(validarNumeroApartamentosMaximoArrayEntrante, [estadoDisonibleApartamento]);
        if (resuelveValidarNumeroApartamentosMaximoArrayEntrante.rowCount === 0) {
            const error = "No hay ningun apartamento disponible ahora mismo";
            throw new Error(error);
        }
        if (apartamentos.length > resuelveValidarNumeroApartamentosMaximoArrayEntrante.rowCount) {
            const error = "El tamano de posiciones del array de apartamentos es demasiado grande";
            throw new Error(error);
        }
        // Formateo fecha mucho ojo que los anglosajones tiene el formato mes/dia/ano y queremos usar dia/mes/ano y el objeto date de javascript por cojones usa ese formato
        const fechaEntradaEnArreglo = fechaEntrada.split("/");
        const fechaSalidaEnArreglo = fechaSalida.split("/");
        const constructorFechaEntradaFormatoMDA = `${fechaEntradaEnArreglo[1]}/${fechaEntradaEnArreglo[0]}/${fechaEntradaEnArreglo[2]}`;
        const constructorFechaSalidaFormatoMDA = `${fechaSalidaEnArreglo[1]}/${fechaSalidaEnArreglo[0]}/${fechaSalidaEnArreglo[2]}`;
        const controlFechaEntrada = new Date(constructorFechaEntradaFormatoMDA); // El formato es día/mes/ano
        const controlFechaSalida = new Date(constructorFechaSalidaFormatoMDA);
        // validacion: la fecha de entrada no puede ser superior a la fecha de salida y al mimso tiempo la fecha de salida no puede ser inferior a la fecha de entrada
        if (controlFechaEntrada >= controlFechaSalida) {
            const error = "La fecha de entrada no puede ser igual o superior que la fecha de salida";
            throw new Error(error);
        }
        const filtroApartamentoIDV = /^[a-z0-9]+$/;
        for (const apartamento of apartamentos) {
            if (!filtroApartamentoIDV.test(apartamento)) {
                const error = "Hay un apartamentoIDV dentro del array que no cumple los requisitos.";
                throw new Error(error);
            }
        }
        const rol = entrada.session.rol;
        const configuracionApartamentosPorRango = {
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_ISO,
            rol: rol,
            origen: "administracion"
        };
        const resuelveApartamentosDisponibles = await apartamentosPorRango(configuracionApartamentosPorRango);
        const apartamentosDisponibles = resuelveApartamentosDisponibles.apartamentosDisponibles;
        if (apartamentosDisponibles.length === 0) {
            const error = "No hay ningun apartamento disponible para estas fechas";
            throw new Error(error);
        }
        if (apartamentosDisponibles.length > 0) {
            const validarApartamentosDisonbiles = (apartamentosSolicitados, apartamentosDisponibles) => {
                return apartamentosSolicitados.every(apartamento => apartamentosDisponibles.includes(apartamento));
            };
            const controlApartamentosDisponibles = validarApartamentosDisonbiles(apartamentos, apartamentosDisponibles);
            if (!controlApartamentosDisponibles) {
                const error = "Los apartamentos solicitados para este rango de fechas no estan disponbiles.";
                throw new Error(error);
            }
            const formatoFechaEntradaDMA = `${fechaEntradaEnArreglo[0]}/${fechaEntradaEnArreglo[1]}/${fechaEntradaEnArreglo[2]}`;
            const formatoFechaSalidaDMA = `${fechaSalidaEnArreglo[0]}/${fechaSalidaEnArreglo[1]}/${fechaSalidaEnArreglo[2]}`;
            const formatearFechaDesdeISO8601 = (cadenaISO8601) => {
                // Importantisimo
                // Esto se usa para poner un cero si el numero de dia o de mes es 9 o menor para evitar la interpretacion de JS que resta 1 al numero en la interpretacion de fechas
                const fecha = new Date(cadenaISO8601);
                const year = fecha.getFullYear();
                const month = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Sumar 1 porque los meses van de 0 a 11
                const day = fecha.getDate().toString().padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            const fechaEntradaReservaISO8610 = new Date(formatearFechaDesdeISO8601(`${fechaEntradaEnArreglo[2]}-${fechaEntradaEnArreglo[1]}-${fechaEntradaEnArreglo[0]}`)).toISOString().split('T')[0];
            const fechaSalidaReservaISO8610 = new Date(formatearFechaDesdeISO8601(`${fechaSalidaEnArreglo[2]}-${fechaSalidaEnArreglo[1]}-${fechaSalidaEnArreglo[0]}`)).toISOString().split('T')[0];
            // insertar fila reserva y en la tabla reservarAartametnos insertar las correspondientes filas
            const estadoReserva = "confirmada";
            const origen = "administracion";
            const creacionFechaReserva = new Date().toISOString();
            const estadoPago = "noPagado";
            await campoDeTransaccion("iniciar")
            const insertarReserva = `
                            INSERT INTO
                            reservas 
                            (
                            entrada,
                            salida,
                            "estadoReserva",
                            origen,
                            creacion,
                            "estadoPago")
                            VALUES
                            ($1,$2,$3,$4,$5,$6)
                            RETURNING 
                            reserva `;
            const resuelveInsertarReserva = await conexion.query(insertarReserva, [fechaEntradaReservaISO8610, fechaSalidaReservaISO8610, estadoReserva, origen, creacionFechaReserva, estadoPago]);
            const reservaUIDNuevo = resuelveInsertarReserva.rows[0].reserva;
            for (const apartamento of apartamentos) {
                const apartamentoUI = await obtenerNombreApartamentoUI(apartamento);
                const InsertarApartamento = `
                                INSERT INTO
                                "reservaApartamentos"
                                (
                                reserva,
                                apartamento, 
                                "apartamentoUI"
                                )
                                VALUES ($1, $2, $3)
                                `;
                const resuelveInsertarApartamento = await conexion.query(InsertarApartamento, [reservaUIDNuevo, apartamento, apartamentoUI]);
                if (resuelveInsertarApartamento.rowCount === 0) {
                    const error = "Ha ocurrido un error insertando el apartamento " + apartamento + " se detiene y se deshache todo el proceso";
                    throw new Error(error);
                }
            }
            const transaccionPrecioReserva = {
                tipoProcesadorPrecio: "uid",
                reservaUID: Number(reservaUIDNuevo)
            };
            await insertarTotalesReserva(transaccionPrecioReserva);
            await campoDeTransaccion("confirmar")
            const ok = {
                ok: "Se ha anadido al reserva vacia",
                reservaUID: reservaUIDNuevo
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}