import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../../sistema/configuracion/codigoZonaHoraria.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { eliminarBloqueoCaducado } from "../../../sistema/bloqueos/eliminarBloqueoCaducado.mjs";
import { procesador } from "../../../sistema/contenedorFinanciero/procesador.mjs";
import { Mutex } from "async-mutex";
import { insertarSimulacion } from "../../../repositorio/simulacionDePrecios/insertarSimulacion.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { generadorReservaUID } from "../../../componentes/generadorReservaUID.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";

export const guardarSimulacion_obsoleto = async (entrada) => {
    const mutex = new Mutex()
    try {
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 5
        })

        const nombre = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nombre,
            nombreCampo: "El campo del nombre de la simulación",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const fechaCreacion = (await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: entrada.body.fechaCreacion,
            nombreCampo: "La fecha de fechaCreacion"
        }))

        const fechaEntrada = (await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: entrada.body.fechaEntrada,
            nombreCampo: "La fecha de entrada"
        }))
        const fechaSalida = (await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: entrada.body.fechaSalida,
            nombreCampo: "La fecha de salida"
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
        await campoDeTransaccion("iniciar")

        const controlIDVUnicos = {}
        for (const apartamentoIDV of apartamentosIDVARRAY) {
            if (controlIDVUnicos.hasOwnProperty(apartamentoIDV)) {
                const m = `El identificador visual ${apartamentoIDV} está repetido.`
                throw new Error(m)
            }
            controlIDVUnicos[apartamentoIDV] = true

            await obtenerConfiguracionPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "noExiste"
            })
        }
        mutex.acquire()
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const fechaEntrada_objeto = DateTime.fromISO(fechaEntrada, { zone: zonaHoraria });
        const fechaCreacion_objeto = DateTime.fromISO(fechaCreacion, { zone: zonaHoraria });

        if (fechaEntrada_objeto < fechaCreacion_objeto) {
            const error = "La fecha de creación simulada no puede ser superior a la fecha de entrada simulada.";
            throw new Error(error);
        }
        await eliminarBloqueoCaducado();
        // const desgloseFinanciero = await procesador({
        //     entidades: {
        //         reserva: {
        //             tipoOperacion: "crearDesglose",
        //             fechaEntrada: fechaEntrada,
        //             fechaSalida: fechaSalida,
        //             fechaCreacion: fechaCreacion,
        //             apartamentosArray: apartamentosIDVARRAY,
        //             capaOfertas: "si",
        //             zonasArray: ["global", "publica", "privada"],
        //             descuentosParaRechazar: [],
        //             capaDescuentosPersonalizados: "no",
        //             descuentosArray: [],
        //             capaImpuestos: "si",
        //         }
        //     },
        // })
        const serviciosSiReconocidos = []
        const codigosDescuentosSiReconocidos = []

        const desgloseFinanciero = await procesador({
            entidades: {
                reserva: {
                    origen: "externo",
                    fechaEntrada: fechaEntrada,
                    fechaSalida: fechaSalida,
                    apartamentosArray: apartamentosIDVARRAY,
                },
                servicios: {
                    origen: "hubServicios",
                    serviciosUIDSolicitados: serviciosSiReconocidos
                },
            },
            capas: {
                ofertas: {
                    zonasArray: ["global", "publica"],
                    configuracion: {
                        descuentosPersonalizados: "no",
                        descuentosArray: []
                    },
                    operacion: {
                        tipo: "insertarDescuentosPorCondiconPorCoodigo",
                        codigoDescuentosArrayBASE64: codigosDescuentosSiReconocidos
                    }
                },
                impuestos: {
                    origen: "hubImuestos"
                }
            }
        })




        const reservaUID = await generadorReservaUID()

        const simulacion = await insertarSimulacion({
            desgloseFinanciero,
            nombre,
            fechaCreacion,
            fechaEntrada,
            fechaSalida,
            apartamentosIDVARRAY,
            reservaUID,
            testingVI
        })
        await campoDeTransaccion("confirmar")

        const ok = {
            ok: "Se ha guardado la nueva simulación",
            simulacionUID: simulacion.simulacionUID
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")

        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}