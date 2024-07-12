import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { apartamentosPorRango } from "../../../../sistema/selectoresCompartidos/apartamentosPorRango.mjs";
import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { eliminarBloqueoCaducado } from "../../../../sistema/bloqueos/eliminarBloqueoCaducado.mjs";
import { DateTime } from "luxon";
import { insertarReservaAdministrativa } from "../../../../repositorio/reservas/reserva/insertarReservaAdministrativa.mjs";
import { insertarApartamentoEnReservaAdministrativa } from "../../../../repositorio/reservas/reserva/insertarApartamentoEnReservaAdministrativa.mjs";
import { campoDeTransaccion } from "../../../../repositorio/globales/campoDeTransaccion.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV } from "../../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV.mjs";
import { actualizadorIntegradoDesdeInstantaneas } from "../../../../sistema/contenedorFinanciero/entidades/reserva/actualizadorIntegradoDesdeInstantaneas.mjs";
import { procesador } from "../../../../sistema/contenedorFinanciero/procesador.mjs";
import { insertarDesgloseFinacieroPorReservaUID } from "../../../../repositorio/reservas/transacciones/desgloseFinanciero/insertarDesgloseFinacieroPorReservaUID.mjs";

export const crearReservaSimpleAdministrativa = async (entrada, salida) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        await mutex.acquire();

        const fechaEntrada = entrada.body.fechaEntrada;
        const fechaSalida = entrada.body.fechaSalida;
        const apartamentos = validadoresCompartidos.tipos.array({
            array: entrada.body.apartamentos,
            nombreCampo: "El array de apartamentoIDV",
            filtro: "soloCadenasIDV",
            sePermitenDuplicados: "no"
        })
        // Control validez fecha
        await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: fechaEntrada,
            nombreCampo: "La fecha de entrada de la reserva"
        })
        await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: fechaSalida,
            nombreCampo: "La fecha de salida de la reserva"
        })
        const fechaEntrada_objeto = DateTime.fromISO(fechaEntrada)
        const fechaSalida_objeto = DateTime.fromISO(fechaSalida)

        await eliminarBloqueoCaducado();
        // validar que en el array hay un maximo de posiciones no superior al numero de filas que existen en los apartementos
        const configuracionesDisponibles = await obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV({
            estadoIDV: "disponible",
            zonaArray: ["privada", "global"]
        })
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

        const resuelveApartamentosDisponibles = await apartamentosPorRango({
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            zonaConfiguracionAlojamientoArray: ["privada", "global"],
            zonaBloqueo_array: ["privado", "global"],
        });
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
            const fechaCreacion = DateTime.utc().toISO();
            const estadoPago = "noPagado";
            await campoDeTransaccion("iniciar")
            const reservaInsertada = await insertarReservaAdministrativa({
                fechaEntrada: fechaEntrada,
                fechaSalida: fechaSalida,
                estadoReserva: estadoReserva,
                origen: origen,
                fechaCreacion: fechaCreacion,
                estadoPago: estadoPago
            })
            const reservaUIDNuevo = reservaInsertada.reservaUID;
            for (const apartamentoIDV of apartamentos) {
                const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                    apartamentoIDV,
                    errorSi: "noExiste"
                });
                const apartamentoUI = apartamento.apartamentoUI
                await insertarApartamentoEnReservaAdministrativa({
                    reservaUIDNuevo: reservaUIDNuevo,
                    apartamentoIDV: apartamentoIDV,
                    apartamentoUI: apartamentoUI,
                })
            }


            const desgloseFinanciero = await procesador({
                entidades: {
                    reserva: {
                        tipoOperacion: "crearDesglose",
                        fechaEntrada: fechaEntrada,
                        fechaSalida: fechaSalida,
                        apartamentosArray: apartamentos,
                        capaOfertas: "si",
                        zonasArray: ["global", "privada"],
                        capaDescuentosPersonalizados: "no",
                        capaImpuestos: "si"
                    }
                },
            })

            await insertarDesgloseFinacieroPorReservaUID({
                reservaUID: reservaUIDNuevo,
                desgloseFinanciero
            })

            //await actualizadorIntegradoDesdeInstantaneas(reservaUIDNuevo)
            await campoDeTransaccion("confirmar")
            const ok = {
                ok: "Se ha anadido al reserva vacia",
                reservaUID: reservaUIDNuevo
            };
            return ok
        }
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}