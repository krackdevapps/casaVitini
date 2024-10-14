import { DateTime } from "luxon"
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { validadoresCompartidos } from "../../../validadores/validadoresCompartidos.mjs"
import { codigoZonaHoraria } from "../../../configuracion/codigoZonaHoraria.mjs"
import { obtenerTodoElAlojamientoDeLaSimulacionPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/alojamiento/obtenerTodoElAlojamientoDeLaSimulacionPorSimulacionUID.mjs"

export const validarDataGlobalSimulacion = async (data) => {
    try {
        const constructorError = (data) => {
            try {
                const llavesFaltantes = []
                const llavesExigidas = [
                    "fechaCreacion",
                    "fechaEntrada",
                    "fechaSalida",
                    //"apartamentosIDVARRAY",
                    "zonaIDV"
                ]
                const llavesEntrantes = Object.keys(data)
                for (const llaveOblitaria of llavesExigidas) {
                    if (!llavesEntrantes.includes(llaveOblitaria)) {
                        llavesFaltantes.push(llaveOblitaria)
                    } else {
                        const valorExistente = data[llaveOblitaria]
                        const constrol = (valorExistente === null || valorExistente === undefined || !valorExistente || valorExistente.length === 0)
                        if (constrol) {
                            llavesFaltantes.push(llaveOblitaria)
                        }
                    }
                }
                return llavesFaltantes
            } catch (error) {
                throw error
            }
        }
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: data,
            numeroDeLLavesMaximo: 6
        })
        const simulacionUID = validadoresCompartidos.tipos.cadena({
            string: data.simulacionUID,
            nombreCampo: "El  simulacionUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const controlLlaves = constructorError(data)
        await obtenerSimulacionPorSimulacionUID(simulacionUID)
        const alojamientoSimulacion = await obtenerTodoElAlojamientoDeLaSimulacionPorSimulacionUID(simulacionUID)
        if (alojamientoSimulacion.length === 0) {
            controlLlaves.push("apartamentosIDVARRAY")
        }
        if (controlLlaves.length > 0) {
            const custonError = {
                info: "Faltan las siguientes llaves para poder renderizar el contenedor financiero de la simulacion",
                llavesFaltantes: controlLlaves
            }
            throw custonError
        }

        const fechaCreacion = (await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: data.fechaCreacion,
            nombreCampo: "La fecha de fechaCreacion"
        }))

        const fechaEntrada = (await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: data.fechaEntrada,
            nombreCampo: "La fecha de entrada"
        }))
        const fechaSalida = (await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: data.fechaSalida,
            nombreCampo: "La fecha de salida"
        }))

        const zonaIDV = data.zonaIDV
        if (
            zonaIDV !== "global"
            &&
            zonaIDV !== "privada"
            &&
            zonaIDV !== "publica"
        ) {
            const m = "zonaIDV solo espera global, privada o publica"
            throw new Error(m)
        }
        await validadoresCompartidos.fechas.validacionVectorial({
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            tipoVector: "diferente"
        })

        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const fechaEntrada_objeto = DateTime.fromISO(fechaEntrada, { zone: zonaHoraria });
        const fechaCreacion_objeto = DateTime.fromISO(fechaCreacion, { zone: zonaHoraria });

        if (fechaEntrada_objeto < fechaCreacion_objeto) {
            const error = "La fecha de creación simulada no puede ser superior a la fecha de entrada simulada.";
            throw new Error(error);
        }

        const dataValidada = {
            simulacionUID,
            fechaCreacion,
            fechaEntrada,
            fechaSalida,
            zonaIDV
        }
        return dataValidada
    } catch (error) {
        throw error
    }
}