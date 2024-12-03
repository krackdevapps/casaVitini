import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";
import { apartamentosPorRango } from "../../../../shared/selectoresCompartidos/apartamentosPorRango.mjs";
import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";
import { eliminarBloqueoCaducado } from "../../../../shared/bloqueos/eliminarBloqueoCaducado.mjs";
import { DateTime } from "luxon";
import { insertarReservaAdministrativa } from "../../../../infraestructure/repository/reservas/reserva/insertarReservaAdministrativa.mjs";
import { insertarApartamentoEnReservaAdministrativa } from "../../../../infraestructure/repository/reservas/reserva/insertarApartamentoEnReservaAdministrativa.mjs";
import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV.mjs";
import { procesador } from "../../../../shared/contenedorFinanciero/procesador.mjs";
import { insertarDesgloseFinacieroPorReservaUID } from "../../../../infraestructure/repository/reservas/transacciones/desgloseFinanciero/insertarDesgloseFinacieroPorReservaUID.mjs";
import { generadorReservaUID } from "../../../../shared/reservas/utilidades/generadorReservaUID.mjs";
import { codigoZonaHoraria } from "../../../../shared/configuracion/codigoZonaHoraria.mjs";
import { semaforoCompartidoReserva } from "../../../../shared/semaforosCompartidos/semaforoCompartidoReserva.mjs";

export const crearReservaSimpleAdministrativa = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        await semaforoCompartidoReserva.acquire();

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 5
        })

        const fechaEntrada = entrada.body.fechaEntrada;
        const fechaSalida = entrada.body.fechaSalida;
        const apartamentos = validadoresCompartidos.tipos.array({
            array: entrada.body.apartamentos,
            nombreCampo: "El array de apartamentoIDV",
            filtro: "strictoIDV",
            sePermitenDuplicados: "no"
        })

        await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: fechaEntrada,
            nombreCampo: "La fecha de entrada de la reserva"
        })
        await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: fechaSalida,
            nombreCampo: "La fecha de salida de la reserva"
        })

        await validadoresCompartidos.fechas.validacionVectorial({
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            tipoVector: "diferente"
        })

        const fechaEntrada_objeto = DateTime.fromISO(fechaEntrada)
        const fechaSalida_objeto = DateTime.fromISO(fechaSalida)

        const estadoInicialIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.estadoInicialIDV,
            nombreCampo: "El selector de estadoInicialIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const estadoInicialesIDV = ["pendiente", "confirmada"]
        if (!estadoInicialesIDV.includes(estadoInicialIDV)) {
            const error = "El campo de estadoInicialIDV solo acepta pendiente o confirmada";
            throw new Error(error);
        }

        const estadoInicialOfertasIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.estadoInicialOfertasIDV,
            nombreCampo: "El selector de estadoInicialOfertasIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const selectoresOfertas = [
            "aplicarTodasLasOfertas",
            "aplicarTodasRechazandoLasQueTenganCodigosDeDescuento",
            "noAplicarOfertas"

        ]
        if (!selectoresOfertas.includes(estadoInicialOfertasIDV)) {
            const error = "El campo de estadoInicialOfertasIDV solo acepta aplicarTodasLasOfertas, aplicarTodasRechazandoLasQueTenganCodigosDeDescuento, noAplicarOfertas";
            throw new Error(error);
        }

        await eliminarBloqueoCaducado();

        const configuracionesDisponibles = await obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV({
            estadoIDV: "activado",
            zonaArray: ["privada", "global"]
        })
        if (configuracionesDisponibles.length === 0) {
            const error = "No hay ningún apartamento disponible ahora mismo.";
            throw new Error(error);
        }
        if (apartamentos.length > configuracionesDisponibles.length) {
            const error = "El tamaño de posiciones del array de apartamentos es demasiado grande";
            throw new Error(error);
        }


        if (fechaEntrada_objeto >= fechaSalida_objeto) {
            const error = "La fecha de entrada no puede ser igual o superior que la fecha de salida";
            throw new Error(error);
        }
        const apartamentosIDV = configuracionesDisponibles.map(c => c.apartamentoIDV)

        const resuelveApartamentosDisponibles = await apartamentosPorRango({
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            apartamentosIDV: apartamentosIDV,
            zonaConfiguracionAlojamientoArray: ["privada", "global"],
            zonaBloqueo_array: ["privada", "global"],
        });
        const apartamentosDisponibles = resuelveApartamentosDisponibles.apartamentosDisponibles;
        if (apartamentosDisponibles.length === 0) {
            const error = "No hay ningún apartamento disponible para estas fechas.";
            throw new Error(error);
        }
        if (apartamentosDisponibles.length > 0) {
            const validarApartamentosDisonbiles = (apartamentosSolicitados, apartamentosDisponibles) => {
                return apartamentosSolicitados.every(apartamento => apartamentosDisponibles.includes(apartamento));
            };
            const controlApartamentosDisponibles = validarApartamentosDisonbiles(apartamentos, apartamentosDisponibles);
            if (!controlApartamentosDisponibles) {
                const contenedorError = {
                    code: "hostingNoAvaible",
                    error: "Los apartamentos solicitados para este rango de fechas no están disponibles.",
                    apartamentosDisponibles
                }
                throw contenedorError
            }
            const testingVI = process.env.TESTINGVI
            if (testingVI) {
                validadoresCompartidos.tipos.cadena({
                    string: testingVI,
                    nombreCampo: "El campo testingVI",
                    filtro: "strictoIDV",
                    sePermiteVacio: "no",
                    limpiezaEspaciosAlrededor: "si",
                })
            }
            const origen = "administracion";
            const fechaCreacionUTC = DateTime.utc().toISO();
            const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
            const fechaCreacion_simple_TZ = DateTime.now().setZone(zonaHoraria).toISODate();

            const estadoPago = "noPagado";
            await campoDeTransaccion("iniciar")
            const reservaUID = await generadorReservaUID()
            await insertarReservaAdministrativa({
                fechaEntrada: fechaEntrada,
                fechaSalida: fechaSalida,
                estadoReserva: estadoInicialIDV,
                origen: origen,
                fechaCreacion: fechaCreacionUTC,
                estadoPago: estadoPago,
                reservaUID: reservaUID,
                testingVI: testingVI
            })
            for (const apartamentoIDV of apartamentos) {
                const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                    apartamentoIDV,
                    errorSi: "noExiste"
                });
                const apartamentoUI = apartamento.apartamentoUI
                await insertarApartamentoEnReservaAdministrativa({
                    reservaUIDNuevo: reservaUID,
                    apartamentoIDV: apartamentoIDV,
                    apartamentoUI: apartamentoUI,
                })
            }

            const configuracionOfertasInicial = (data) => {
                if (data === "aplicarTodasLasOfertas") {
                    return {
                        tipo: "insertarDescuentosPorCondicionPorCodigo",
                        ignorarCodigosDescuentos: "si"
                    }
                } else if (data === "aplicarTodasRechazandoLasQueTenganCodigosDeDescuento") {
                    return {
                        tipo: "insertarDescuentosPorCondicionPorCodigo",
                        ignorarCodigosDescuentos: "no"
                    }
                } else if (data === "noAplicarOfertas") {
                    return {
                        tipo: "",
                        ignorarCodigosDescuentos: "no"
                    }
                } else {
                    const m = "en configuracionOfertasInicial no se reconoce el identificador"
                    throw new Error(m)
                }
            }

            const desgloseFinanciero = await procesador({
                entidades: {
                    reserva: {
                        origen: "externo",
                        fechaEntrada: fechaEntrada,
                        fechaSalida: fechaSalida,
                        fechaActual: fechaCreacion_simple_TZ,
                        apartamentosArray: apartamentos,
                        origenSobreControl: "reserva"
                    },
                    complementosAlojamiento: {
                        origen: "hubComplementosAlojamiento",
                        complementosUIDSolicitados: []
                    },
                    servicios: {
                        origen: "hubServicios",
                        serviciosSolicitados: []
                    },
                },
                capas: {
                    ofertas: {
                        zonasArray: ["global", "privada"],
                        operacion: {
                            tipo: configuracionOfertasInicial(estadoInicialOfertasIDV).tipo
                        },
                        ignorarCodigosDescuentos: configuracionOfertasInicial(estadoInicialOfertasIDV).ignorarCodigosDescuentos
                    },
                    impuestos: {
                        origen: "hubImuestos"
                    }
                }
            })

            await insertarDesgloseFinacieroPorReservaUID({
                reservaUID: String(reservaUID),
                desgloseFinanciero
            })

            await campoDeTransaccion("confirmar")
            const ok = {
                ok: "Se ha creado la reserva",
                reservaUID: reservaUID,
                desgloseFinanciero
            };
            return ok
        }
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        if (semaforoCompartidoReserva) {
            semaforoCompartidoReserva.release();
        }
    }
}