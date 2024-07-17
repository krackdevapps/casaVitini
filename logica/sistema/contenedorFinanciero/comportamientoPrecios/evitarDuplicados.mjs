import Decimal from "decimal.js"
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs"
import { obtenerApartamentosPorComportamientoUID_arrayPorApartamentoIDV_array } from "../../../repositorio/comportamientoDePrecios/obtenerApartamentosPorComportamientoUID_arrayPorApartamentoIDV_array.mjs"
import { obtenerNombreComportamientoPorNombreUI } from "../../../repositorio/comportamientoDePrecios/obtenerComportamientoPorNombreUI.mjs"
import { obtenerComportamientosDistintosPorNombreUI } from "../../../repositorio/comportamientoDePrecios/obtenerComportamientosDistintosPorNombreUI.mjs"
import { obtenerComportamientosDistintosPorRangoPorTipoIDVPorComportamientoUID } from "../../../repositorio/comportamientoDePrecios/obtenerComportamientosDistintosPorRangoPorTipoIDVPorComportamientoUID.mjs"
import { obtenerComportamientosDistintosPorTipoIDVPorDiasArray } from "../../../repositorio/comportamientoDePrecios/obtenerComportamientosDistintosPorTipoIDVPorDiasArray.mjs"
import { obtenerComportamientosPorAntelacionPorTipo } from "../../../repositorio/comportamientoDePrecios/obtenerComportamientosPorAntelacionPorTipo.mjs"
import { obtenerComportamientosPorRangoPorCreacionPorTipoIDV } from "../../../repositorio/comportamientoDePrecios/obtenerComportamientosPorRangoPorCreacionPorTipoIDV.mjs"
import { obtenerComportamientosPorRangoPorTipoIDV } from "../../../repositorio/comportamientoDePrecios/obtenerComportamientosPorRangoPorTipoIDV.mjs"
import { obtenerComportamientosPorTipoIDVPorDiasArray } from "../../../repositorio/comportamientoDePrecios/obtenerComportamientosPorTipoIDVPorDiasArray.mjs"

export const evitarDuplicados = async (data) => {
    try {
        const comportamiento = data.comportamiento
        const comportamientoUID = comportamiento.comportamientoUID
        const nombreComportamiento = comportamiento.nombreComportamiento
        const contenedor = comportamiento.contenedor
        const tipoIDV = contenedor.tipo
        const transaccion = data.transaccion

        if (transaccion !== "crear" && transaccion !== "actualizar") {
            const error = `El sistema de evitar duplicados necesita un tipo de transaccion para ver si es un operacion de creacion o actualizacion`
            throw new Error(error)
        }
        const mensajeNombreRepetido = "El nombre que tratas de poner a este comportamiento de precio ya existe. Por favor con el fin de evitar confusiones e ilegibilidad, escoge otro nombre para este comportamiento de precio";
        const comportamientosConNombreIgual = await obtenerNombreComportamientoPorNombreUI(nombreComportamiento)

        if (transaccion === "actualizar") {
            const selector = comportamientosConNombreIgual.findIndex(item => item.comportamientoUID === comportamientoUID);
            if (selector !== -1) {
                comportamientosConNombreIgual.splice(comportamientosConNombreIgual, 1);
            }
        }
        if (comportamientosConNombreIgual.length > 0) {
            throw new Error(mensajeNombreRepetido);
        }
        if (tipoIDV === "porCreacion" || tipoIDV === "porRango") {
            const comportamientosEnConflicto = []
            const apartamentosIDVContenedor = {}
            // const perfilesAntelacion = contenedor.perfilesAntelacion
            const fechaInicio_ISO = contenedor.fechaInicio
            const fechaFinal_ISO = contenedor.fechaFinal
            const fechaInicio_creacionReserva = contenedor.fechaInicio_creacionReserva
            const fechaFinal_creacionReserva = contenedor.fechaFinal_creacionReserva
            const apartamentos = contenedor.apartamentos
            const preContenedorApartamentos = {}

            apartamentos.forEach((apartamento) => {
                const apartamentoIDV = apartamento.apartamentoIDV

                if (preContenedorApartamentos.hasOwnProperty(apartamentoIDV)) {
                    const apartamentoUI = obtenerApartamentoComoEntidadPorApartamentoIDV({
                        apartamentoIDV,
                        errorSi: "noExiste"
                    })
                    const m = `El ${apartamentoUI} (${apartamentoIDV}) esta repetido`
                    throw new Error(m)
                } else if (!preContenedorApartamentos.hasOwnProperty(apartamentoIDV)) {
                    preContenedorApartamentos[apartamentoIDV] = new Decimal(0)
                }
            })

            // perfilesAntelacion.forEach((perfil) => {
            //     const contenedorApartamentos = perfil.apartamentos
            //     Object.keys(contenedorApartamentos).forEach(idv => apartamentosIDVContenedor[idv] = true)
            // })
            const arrayApartamentos = Object.keys(preContenedorApartamentos)

            const comportamientosPorRango = await obtenerComportamientosPorRangoPorTipoIDV({
                fechaInicio_ISO: fechaInicio_ISO,
                fechaFinal_ISO: fechaFinal_ISO,
                arrayApartamentos,
                tipoIDV: "porRango",
                estadoArray: ["activado", "desactivado"]
            })

            comportamientosEnConflicto.push(...comportamientosPorRango)
            const comportamientosPorAntelacion = await obtenerComportamientosPorRangoPorCreacionPorTipoIDV({
                fechaInicio_ISO: fechaInicio_ISO,
                fechaFinal_ISO: fechaFinal_ISO,
                fechaInicio_creacionReserva: fechaInicio_creacionReserva,
                fechaFinal_creacionReserva: fechaFinal_creacionReserva,
                arrayApartamentos,
                tipoIDV: "porCreacion",
                estadoArray: ["activado", "desactivado"]
            })
            comportamientosEnConflicto.push(...comportamientosPorAntelacion)




            if (transaccion === "actualizar") {
                const selector = comportamientosEnConflicto.findIndex(item => item.comportamientoUID === comportamientoUID);
                if (selector !== -1) {
                    comportamientosEnConflicto.splice(comportamientosEnConflicto, 1);
                }
            }
            if (comportamientosEnConflicto.length > 0) {
                const error = {
                    error: "No se puede crear este comportamiento por que entra en conflicto con los apartamentos en otros comportamientos",
                    comportamientosEnConflicto: comportamientosEnConflicto,
                }
                throw error
            }
        }
        // else if (tipoIDV === "porRango") {
        //     const fechaInicio_ISO = contenedor.fechaInicio
        //     const fechaFinal_ISO = contenedor.fechaFinal

        //     const comportamientosEnElRango = [] // Los comportamiento de precio que estan en el rango de nuevo comportamiento
        //     if (transaccion === "crear") {
        //         const comportamientosPorRango = await obtenerComportamientosPorRangoPorTipoIDV({
        //             fechaInicio_ISO: fechaInicio_ISO,
        //             fechaFinal_ISO: fechaFinal_ISO,
        //             tipoIDV: "porRango",

        //         })
        //         comportamientosEnElRango.push(...comportamientosPorRango)
        //         const comportamientosPorAntelacion = await obtenerComportamientosPorAntelacionPorTipo({
        //             fechaInicio_ISO: fechaInicio_ISO,
        //             fechaFinal_ISO: fechaFinal_ISO,
        //             tipoIDV: "porAntelacion"
        //         })
        //         
        //         comportamientosEnElRango.push(...comportamientosPorAntelacion)
        //     }
        //     throw new Error("test")
        //     if (transaccion === "actualizar") {
        //         const comportamientosDistintosPorRango = await obtenerComportamientosDistintosPorRangoPorTipoIDVPorComportamientoUID({
        //             fechaInicio_ISO: fechaInicio_ISO,
        //             fechaFinal_ISO: fechaFinal_ISO,
        //             tipoIDV: "porRango",
        //             comportamientoUID: comportamientoUID
        //         })
        //         comportamientosEnElRango.push(...comportamientosDistintosPorRango)
        //     }
        //     const soloUIDComportamientosCoincidentes = comportamientosEnElRango.map((detallesDelComportamiento, posicion) => {
        //         return detallesDelComportamiento.comportamientoUID
        //     })

        //     if (soloUIDComportamientosCoincidentes.length > 0) {

        //         const arbolComportamientoCoincidentes = {}
        //         comportamientosEnElRango.forEach(detallesComportamiento => {
        //             const comportamientoUID = detallesComportamiento.comportamientoUID
        //             const nombreComportamiento = detallesComportamiento.nombreComportamiento

        //             arbolComportamientoCoincidentes[comportamientoUID] = {
        //                 nombreComportamiento: nombreComportamiento,
        //                 comportamientoUID: comportamientoUID,
        //                 apartamentos: []
        //             }
        //         })

        //         const apartamentosDeLosComportamientos = await obtenerApartamentosPorComportamientoUID_arrayPorApartamentoIDV_array({
        //             apartamentosIDV_array: apartamentosIDV_array,
        //             comportamientosUID_array: soloUIDComportamientosCoincidentes
        //         })

        //         for (const detallesDelApartamento of apartamentosDeLosComportamientos) {
        //             const comportamientoUID = detallesDelApartamento.comportamientoUID
        //             const apartamentoIDV = detallesDelApartamento.apartamentoIDV
        //             const componenteUID = detallesDelApartamento.componenteUID

        //             const estructuraApartamentoCoincidente = {
        //                 comportamientoUID: comportamientoUID,
        //                 apartamentoIDV: apartamentoIDV,
        //                 componenteUID: componenteUID,
        //                 apartamentoUI: await obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV)
        //             }
        //             arbolComportamientoCoincidentes[componenteUID].apartamento.push(estructuraApartamentoCoincidente)

        //             const errorCompuesto = {
        //                 error: `No se puede crear este comportamiento de precio por que hay apartamentos en este comportamiento que existen en otros comportamientos cuyos rangos de fechas se pisan`,
        //                 comportamientosCoincidentes: arbolComportamientoCoincidentes
        //             }
        //             throw errorCompuesto
        //         }
        //     }
        // }
        else if (tipoIDV === "porDias") {
            const diasArray = comportamiento.diasArray
            const comportamientosPorTipoPorDiasEnElRango = []
            if (transaccion === "crear") {
                const comportamientosPorDiasArray = await obtenerComportamientosPorTipoIDVPorDiasArray({
                    tipoIDV: tipoIDV,
                    diasArray: diasArray
                })
                comportamientosPorTipoPorDiasEnElRango.push(...comportamientosPorDiasArray)
            }
            if (transaccion === "actualizar") {
                const comportamientosDistintosPorDiasArray = await obtenerComportamientosDistintosPorTipoIDVPorDiasArray({
                    tipoIDV: tipoIDV,
                    diasArray: diasArray,
                    comportamientoUID: comportamientoUID,
                })
                comportamientosPorTipoPorDiasEnElRango.push(...comportamientosDistintosPorDiasArray)
            }
            const soloUIDComportamientosCoincidentes = comportamientosPorTipoPorDiasEnElRango.map((detallesDelComportamiento) => {
                return detallesDelComportamiento.comportamientoUID
            })

            if (soloUIDComportamientosCoincidentes.length > 0) {
                const arbolComportamientoCoincidentes = {}
                comportamientosEnElRango.forEach(detallesComportamiento => {
                    const comportamientoUID = detallesComportamiento.comportamientoUID
                    const nombreComportamiento = detallesComportamiento.nombreComportamiento

                    arbolComportamientoCoincidentes[comportamientoUID] = {
                        nombreComportamiento: nombreComportamiento,
                        comportamientoUID: comportamientoUID,
                        apartamentos: []
                    }
                })
                const apartamentosDeLosComportamientos = await obtenerApartamentosPorComportamientoUID_arrayPorApartamentoIDV_array({
                    apartamentosIDV_array: apartamentosIDV_array,
                    comportamientosUID_array: soloUIDComportamientosCoincidentes
                })
                for (const detallesDelApartamento of apartamentosDeLosComportamientos) {
                    const comportamientoUID = detallesDelApartamento.comportamientoUID
                    const apartamentoIDV = detallesDelApartamento.apartamentoIDV
                    const componenteUID = detallesDelApartamento.componenteUID

                    const estructuraApartamentoCoincidente = {
                        comportamientoUID: comportamientoUID,
                        apartamentoIDV: apartamentoIDV,
                        componenteUID: componenteUID,
                        apartamentoUI: await obtenerApartamentoComoEntidadPorApartamentoIDV({
                            apartamentoIDV,
                            errorSi: "noExiste"
                        }).apartamentoUI
                    }
                    arbolComportamientoCoincidentes[componenteUID].apartamento.push(estructuraApartamentoCoincidente)

                    const errorCompuesto = {
                        error: `No se puede crear este comportamiento de por dias por que hay apartamentos en este comportamiento que existen en otros comportamientos por dias que coinciden en el dias y el apartamento. Es decir hay comportamientos que tiene el mismo dia y el mismo apartamento coincidiendo.`,
                        comportamientosCoincidentes: arbolComportamientoCoincidentes
                    }
                    throw new Error(errorCompuesto)
                }
            }
        } else {
            const m = "No se reconode el tipoIDV"
            throw new Error(m);

        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

