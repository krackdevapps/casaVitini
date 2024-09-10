import { DateTime } from "luxon"
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../../../repositorio/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { validadoresCompartidos } from "../../../validadores/validadoresCompartidos.mjs"
import { codigoZonaHoraria } from "../../../configuracion/codigoZonaHoraria.mjs"

export const validarDataGlobalSimulacion = async (data) => {
    try {
        const constructorError = (data) => {
            try {
                const llavesFaltantes = []
                const llavesExigidas = [
                    "fechaCreacion",
                    "fechaEntrada",
                    "fechaSalida",
                    "apartamentosIDVARRAY",
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
                if (llavesFaltantes.length > 0) {
                    const custonError = {
                        info: "Faltan las siguientes llaves para poder renderizar el contenedor financiero de la simulacion",
                        llavesFaltantes: llavesFaltantes
                    }
                    throw custonError
                }
            } catch (error) {
                throw error
            }
        }

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: data,
            numeroDeLLavesMaximo: 6
        })
        constructorError(data)

        const simulacionUID = validadoresCompartidos.tipos.cadena({
            string: data.simulacionUID,
            nombreCampo: "El  simulacionUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

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
        const apartamentosIDVARRAY = validadoresCompartidos.tipos.array({
            array: data.apartamentosIDVARRAY,
            filtro: "strictoIDV",
            nombreCampo: "El campo apartamentosIDVARRAY"
        })

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
        await obtenerSimulacionPorSimulacionUID(simulacionUID)
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

        const dataValidada = {
            simulacionUID,
            fechaCreacion,
            fechaEntrada,
            fechaSalida,
            apartamentosIDVARRAY,
            zonaIDV
        }
        return dataValidada
    } catch (error) {
        throw error
    }
}