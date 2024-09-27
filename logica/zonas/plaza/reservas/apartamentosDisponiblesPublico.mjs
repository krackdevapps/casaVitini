import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../../sistema/configuracion/codigoZonaHoraria.mjs";
import { configuracionApartamento } from "../../../sistema/configuracionApartamento.mjs";
import { interruptor } from "../../../sistema/configuracion/interruptor.mjs";
import { apartamentosPorRango } from "../../../sistema/selectoresCompartidos/apartamentosPorRango.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { eliminarBloqueoCaducado } from "../../../sistema/bloqueos/eliminarBloqueoCaducado.mjs";
import { mensajesUI } from "../../../componentes/mensajesUI.mjs";
import { procesador } from "../../../sistema/contenedorFinanciero/procesador.mjs";
import { utilidades } from "../../../componentes/utilidades.mjs";
import { Mutex } from "async-mutex";

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
        const fechaActual_ISO = tiempoZH.toISODate();

        //const resuelveADP = await apartamentosDisponiblesPublico(fecha)
        const resuelveApartametnoDisponiblesPublico = await apartamentosPorRango({
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            zonaConfiguracionAlojamientoArray: ["publica", "global"],
            zonaBloqueo_array: ["publico", "global"],
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
                            serviciosUIDSolicitados: []
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