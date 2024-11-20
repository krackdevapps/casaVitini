import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../../shared/configuracion/codigoZonaHoraria.mjs";
import { configuracionApartamento } from "../../../shared/configuracionApartamento.mjs";
import { interruptor } from "../../../shared/configuracion/interruptores/interruptor.mjs";
import { apartamentosPorRango } from "../../../shared/selectoresCompartidos/apartamentosPorRango.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { eliminarBloqueoCaducado } from "../../../shared/bloqueos/eliminarBloqueoCaducado.mjs";
import { mensajesUI } from "../../../shared/mensajesUI.mjs";
import { procesador } from "../../../shared/contenedorFinanciero/procesador.mjs";
import { utilidades } from "../../../shared/utilidades.mjs";
import { Mutex } from "async-mutex";
import { obtenerComplementosPorApartamentoIDV } from "../../../infraestructure/repository/complementosDeAlojamiento/obtenerComplementosPorApartamentoIDV.mjs";
import { obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV } from "../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV.mjs";

export const apartamentosDisponiblesPublico = async (entrada) => {
    const mutex = new Mutex()
    try {
        if (!await interruptor("aceptarReservasPublicas")) {
            throw new Error(mensajesUI.aceptarReservasPublicas);
        }
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })
        const fechaEntrada = (await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: entrada.body.fechaEntrada,
            nombreCampo: "La fecha de entrada en apartamentosDisponiblesPublico"
        }
        ))
        const fechaSalida = (await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: entrada.body.fechaSalida,
            nombreCampo: "La fecha de salida en apartametnosDisponbiblesPublico"
        }))
        await validadoresCompartidos.fechas.validacionVectorial({
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            tipoVector: "diferente"
        })
        await utilidades.ralentizador(2000)
        mutex.acquire()

        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const fechaEntrada_objeto = DateTime.fromISO(fechaEntrada, { zone: zonaHoraria });
        const fechaCreacion_simple = DateTime.utc().toISODate();
        if (fechaEntrada_objeto < tiempoZH.startOf('day')) {
            const error = "La fecha de entrada no puede ser inferior a la fecha actual. Solo se pueden hacer reservas a partir de hoy";
            throw new Error(error);
        }
        await eliminarBloqueoCaducado();
        const configuracionesApartamento = await obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV({
            estadoIDV: "activado",
            zonaArray: ["global", "publica"]
        })
        const apartamentosIDV = configuracionesApartamento.map(c => c.apartamentoIDV)

        const resuelveApartametnoDisponiblesPublico = await apartamentosPorRango({
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            apartamentosIDV: apartamentosIDV,
            zonaConfiguracionAlojamientoArray: ["publica", "global"],
            zonaBloqueo_array: ["publica", "global"],
        })

        const apartamentosDisponiblesEncontrados = resuelveApartametnoDisponiblesPublico.apartamentosDisponibles;
        const estructura = {
            ok: {}
        };
        if (apartamentosDisponiblesEncontrados.length === 0) {
            estructura.ok = {
                apartamentosDisponibles: []
            }
        }
        if (apartamentosDisponiblesEncontrados.length > 0) {
            const configuracionesApartamentosVerificadas = await configuracionApartamento(apartamentosDisponiblesEncontrados);
            estructura.ok = {
                contenedorFinanciero: {},
                complementosAlojamiento: {},
                apartamentosDisponibles: configuracionesApartamentosVerificadas.configuracionApartamento
            }
            for (const apartamentoIDV of apartamentosDisponiblesEncontrados) {
                const desgloseFinanciero = await procesador({
                    entidades: {
                        reserva: {
                            origen: "externo",
                            fechaEntrada: fechaEntrada,
                            fechaSalida: fechaSalida,
                            fechaActual: fechaCreacion_simple,
                            apartamentosArray: [apartamentoIDV],
                            origenSobreControl: "reserva"
                        },
                        servicios: {
                            origen: "hubServicios",
                            serviciosSolicitados: []
                        },
                    },
                    capas: {
                        ofertas: {
                            zonasArray: ["global", "publica"],
                            operacion: {
                                tipo: "insertarDescuentosPorCondicionPorCodigo",
                            },
                            codigoDescuentosArrayBASE64: [],
                            ignorarCodigosDescuentos: "no"

                        },
                        impuestos: {
                            origen: "hubImuestos"
                        }
                    }
                })
                estructura.ok.contenedorFinanciero[apartamentoIDV] = desgloseFinanciero
                const complementosDelAlojamientos = await obtenerComplementosPorApartamentoIDV(apartamentoIDV)
                complementosDelAlojamientos.forEach(complemento => {
                    delete complemento.testingVI
                    delete complemento.apartamentoIDV
                });
                const complementosDelAlojamientosActivos = complementosDelAlojamientos.filter((c) => c.estadoIDV === "activado")
                estructura.ok.complementosAlojamiento[apartamentoIDV] = complementosDelAlojamientosActivos
            }
        }

        return estructura
    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}