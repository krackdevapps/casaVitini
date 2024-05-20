import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { apartamentosPorRango } from "../../../sistema/selectoresCompartidos/apartamentosPorRango.mjs";
import { insertarTotalesReserva } from "../../../sistema/reservas/insertarTotalesReserva.mjs";
import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { eliminarBloqueoCaducado } from "../../../sistema/bloqueos/eliminarBloqueoCaducado.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerNombreApartamentoUI } from "../../../repositorio/arquitectura/obtenerNombreApartamentoUI.mjs";
import { obtenerTodasLasConfiguracionDeLosApartamentosSoloDisponibles } from "../../../repositorio/arquitectura/obtenerTodasLasConfiguracionDeLosApartamentosSoloDisponibles.mjs";
import { DateTime } from "luxon";
import { insertarReservaAdministrativa } from "../../../repositorio/reservas/reserva/insertarReservaAdministrativa.mjs";
import { insertarApartamentoEnReservaAdministrativa } from "../../../repositorio/reservas/reserva/insertarApartamentoEnReservaAdministrativa.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";

export const crearReservaSimpleAdministrativa = async (entrada, salida) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        await mutex.acquire();

        const fechaEntrada_ISO = entrada.body.fechaEntrada_ISO;
        const fechaSalida_ISO = entrada.body.fechaSalida_ISO;
        const apartamentos = validadoresCompartidos.tipos.array({
            array: entrada.body.apartamentos,
            nombreCampo: "El array de apartamentoIDV",
            filtro: "soloCadenasIDV",
            noSePermitenDuplicados: "si"
        })
        // Control validez fecha
        await validadoresCompartidos.fechas.validarFecha_ISO(fechaEntrada_ISO)
        await validadoresCompartidos.fechas.validarFecha_ISO(fechaSalida_ISO)
        const fechaEntrada_objeto = DateTime.fromISO(fechaEntrada_ISO)
        const fechaSalida_objeto = DateTime.fromISO(fechaSalida_ISO)

        await eliminarBloqueoCaducado();
        // validar que en el array hay un maximo de posiciones no superior al numero de filas que existen en los apartementos
        const configuracionesDisponibles = await obtenerTodasLasConfiguracionDeLosApartamentosSoloDisponibles()
        if (configuracionesDisponibles.length === 0) {
            const error = "No hay ningun apartamento disponible ahora mismo";
            throw new Error(error);
        }
        if (apartamentos.length > configuracionesDisponibles.length) {
            const error = "El tamano de posiciones del array de apartamentos es demasiado grande";
            throw new Error(error);
        }

        // validacion: la fecha de entrada no puede ser superior a la fecha de salida y al mimso tiempo la fecha de salida no puede ser inferior a la fecha de entrada
        if (fechaEntrada_objeto >= fechaSalida_objeto) {
            const error = "La fecha de entrada no puede ser igual o superior que la fecha de salida";
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
            // insertar fila reserva y en la tabla reservarAartametnos insertar las correspondientes filas
            const estadoReserva = "confirmada";
            const origen = "administracion";
            const creacionFechaReserva = new Date().toISOString();
            const estadoPago = "noPagado";
            await campoDeTransaccion("iniciar")
            const reservaInsertada = await insertarReservaAdministrativa({
                fechaEntrada_ISO: fechaEntrada_ISO,
                fechaSalida_ISO: fechaSalida_ISO,
                estadoReserva: estadoReserva,
                origen: origen,
                creacionFechaReserva: creacionFechaReserva,
                estadoPago: estadoPago
            })
            const reservaUIDNuevo = reservaInsertada.reservaUID;
            for (const apartamentoIDV of apartamentos) {
                const apartamentoUI = await obtenerNombreApartamentoUI(apartamento);
                await insertarApartamentoEnReservaAdministrativa({
                    reservaUIDNuevo: reservaUIDNuevo,
                    apartamentoIDV: apartamentoIDV,
                    apartamentoUI: apartamentoUI,
                })
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