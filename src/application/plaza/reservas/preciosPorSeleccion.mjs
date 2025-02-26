import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../../shared/configuracion/codigoZonaHoraria.mjs";
import { interruptor } from "../../../shared/configuracion/interruptores/interruptor.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { eliminarBloqueoCaducado } from "../../../shared/bloqueos/eliminarBloqueoCaducado.mjs";
import { mensajesUI } from "../../../shared/mensajesUI.mjs";
import { procesador } from "../../../shared/contenedorFinanciero/procesador.mjs";
import { utilidades } from "../../../shared/utilidades.mjs";
import { Mutex } from "async-mutex";
import Decimal from "decimal.js";
import { validarHoraLimitePublica } from "../../../shared/reservas/validarHoraLimitePublica.mjs";
import { limitesReservaPublica } from "../../../shared/reservas/limitesReservaPublica.mjs";
import { disponibilidadApartamentos } from "../../../shared/reservas/nuevaReserva/reservaPulica/disponibilidadApartamentos.mjs";

export const preciosPorSeleccion = async (entrada) => {
    const mutex = new Mutex()
    try {
        if (!await interruptor("aceptarReservasPublicas")) {
            throw new Error(mensajesUI.aceptarReservasPublicas);
        }
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 3
        })

        const fechaEntrada = (await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: entrada.body.fechaEntrada,
            nombreCampo: "La fecha de entrada en preciosPorSeleccion"
        }
        ))
        const fechaSalida = (await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: entrada.body.fechaSalida,
            nombreCampo: "La fecha de salida en preciosPorSeleccion"
        }))
        const apartamentosIDVARRAY = validadoresCompartidos.tipos.array({
            array: entrada.body.apartamentosIDVARRAY,
            filtro: "strictoIDV",
            nombreCampo: "El campo apartamentosIDVARRAY"
        })
        await validadoresCompartidos.fechas.validacionVectorial({
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            tipoVector: "diferente"
        })

        const controlIDVUnicos = {}
        apartamentosIDVARRAY.forEach((apartamentoIDV) => {
            if (controlIDVUnicos.hasOwnProperty(apartamentoIDV)) {
                const m = `El identificador visual ${apartamentoIDV} esta repetido.`
                throw new Error(m)
            }
            controlIDVUnicos[apartamentoIDV] = true
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
        await validarHoraLimitePublica({
            fechaEntrada
        })
        await limitesReservaPublica({
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida
        })
        await disponibilidadApartamentos({
            fechaEntrada,
            fechaSalida,
            apartamentosIDVArray: apartamentosIDVARRAY
        })
        const desgloseFinanciero = await procesador({
            entidades: {
                reserva: {
                    origen: "externo",
                    fechaEntrada: fechaEntrada,
                    fechaSalida: fechaSalida,
                    fechaActual: fechaCreacion_simple,
                    apartamentosArray: apartamentosIDVARRAY,
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
        const impuestosAplicados = desgloseFinanciero.global.totales.impuestosAplicados
        const desglosePorApartamento = desgloseFinanciero.entidades.reserva.desglosePorApartamento
        const totalNeto = desgloseFinanciero.global.totales.totalNeto

        const totalDescuentos = desgloseFinanciero.global.totales.totalDescuentos
        const contenedorDescuentos = desgloseFinanciero.contenedorOfertas.entidades.reserva.desgloses

        const descuentosPorDias = contenedorDescuentos.porDia
        const descuentosPorApartamentos = contenedorDescuentos.porApartamento
        const descuentosPorTotal = contenedorDescuentos.porTotal

        const preciosPorSeleccion = {}
        const numeroApartamentosSeleccionados = apartamentosIDVARRAY.length

        let descuentosEnProporcion = new Decimal(0);
        const descuentosPorApartamento = {};

        Object.values(descuentosPorDias).forEach((contenedorDia) => {
            if (contenedorDia.hasOwnProperty("porTotalNetoDia")) {
                const totalDescuentosAplicados = contenedorDia.totalDescuentosAplicados;
                descuentosEnProporcion = descuentosEnProporcion.plus(totalDescuentosAplicados)
            } else if (contenedorDia.hasOwnProperty("porApartamento")) {
                const contenedorApartamentos = contenedorDia.porApartamento;
                Object.entries(contenedorApartamentos).forEach(
                    ([apartamentoIDV, contenedor]) => {
                        const totalDescuentoAplicadoAlAparamento = contenedor.totalDescuentosAplicados;
                        if (!descuentosPorApartamento.hasOwnProperty(apartamentoIDV)) {
                            descuentosPorApartamento[apartamentoIDV] = new Decimal(0)
                        }
                        const suma = descuentosPorApartamento[apartamentoIDV];
                        descuentosPorApartamento[apartamentoIDV] = suma.plus(totalDescuentoAplicadoAlAparamento)
                    }
                );
            }
        });

        Object.entries(descuentosPorApartamentos).forEach(([apartamentoIDV, contenedor]) => {
            const totalDescuentoAplicadoAlAparamento = contenedor.totalDescuentosAplicados;
            if (!descuentosPorApartamento.hasOwnProperty(apartamentoIDV)) {
                descuentosPorApartamento[apartamentoIDV] = new Decimal(0)
            }
            const suma = descuentosPorApartamento[apartamentoIDV]
            descuentosPorApartamento[apartamentoIDV] = suma.plus(totalDescuentoAplicadoAlAparamento);
        })

        descuentosPorTotal.forEach(contenedorTotal => {
            const descuentoAplicadoAlTotal = contenedorTotal.descuentoAplicado
            descuentosEnProporcion = descuentosEnProporcion.plus(descuentoAplicadoAlTotal);
        })

        apartamentosIDVARRAY.forEach((apartamentoIDV) => {
            const netoDelApartamento = desglosePorApartamento[apartamentoIDV].totalNeto
            const proporcionImpuestos = new Decimal(impuestosAplicados)
                .div(numeroApartamentosSeleccionados)
            const proporcionDescuentos = new Decimal(totalDescuentos)
                .mul(netoDelApartamento)
                .dividedBy(totalNeto)
            const descuentoDelApartamento = descuentosPorApartamento[apartamentoIDV] || 0
            const precioApartamentoSeleccionadoNeto = new Decimal(netoDelApartamento)
                .minus(proporcionDescuentos).minus(descuentoDelApartamento)
            const prePrecioApartamentoSeleccionadoFinal = (precioApartamentoSeleccionadoNeto)
                .plus(proporcionImpuestos)
            preciosPorSeleccion[apartamentoIDV] = {
                precioEnBaseASeleccion: prePrecioApartamentoSeleccionadoFinal.isNegative() ? "0.00" : prePrecioApartamentoSeleccionadoFinal.toFixed(2)
            }
        })

        const ok = {
            ok: "Aquí tienes el desglose financiero basándose en las fechas seleccionadas y los apartamentos seleccionados.",
            preciosPorSeleccion,
            desgloseFinanciero
        }

        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}