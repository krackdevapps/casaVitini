import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs"
import { obtenerApartamentosPorComportamientoUID_arrayPorApartamentoIDV_array } from "../../../repositorio/comportamientoDePrecios/obtenerApartamentosPorComportamientoUID_arrayPorApartamentoIDV_array.mjs"
import { obtenerNombreComportamientoPorNombreUI } from "../../../repositorio/comportamientoDePrecios/obtenerComportamientoPorNombreUI.mjs"
import { obtenerComportamientosDistintosPorNombreUI } from "../../../repositorio/comportamientoDePrecios/obtenerComportamientosDistintosPorNombreUI.mjs"
import { obtenerComportamientosDistintosPorRangoPorTipoIDVPorComportamientoUID } from "../../../repositorio/comportamientoDePrecios/obtenerComportamientosDistintosPorRangoPorTipoIDVPorComportamientoUID.mjs"
import { obtenerComportamientosDistintosPorTipoIDVPorDiasArray } from "../../../repositorio/comportamientoDePrecios/obtenerComportamientosDistintosPorTipoIDVPorDiasArray.mjs"
import { obtenerComportamientosPorRangoPorTipoIDV } from "../../../repositorio/comportamientoDePrecios/obtenerComportamientosPorRangoPorTipoIDV.mjs"
import { obtenerComportamientosPorTipoIDVPorDiasArray } from "../../../repositorio/comportamientoDePrecios/obtenerComportamientosPorTipoIDVPorDiasArray.mjs"

export const evitarDuplicados = async (data) => {
    try {
        const comportamientoUID = data.comportamientoUID
        const nombreComportamiento = date.nombreComportamiento
        const tipoIDV = data.tipoIDV
        const transaccion = data.transaccion
        const apartamentosIDV_array = data.apartamentosIDV_array

        if (transaccion !== "crear" && transaccion !== "actualizar") {
            const error = `El sistema de evitar duplicados necesita un tipo de transaccion para ver si es un operacion de creacion o actualizacion`
            throw new Error(error)
        }
        const mensajeNombreRepetido = "El nombre que tratas de poner a este comportamiento de precio ya existe. Por favor con el fin de evitar confusiones e ilegibilidad, escoge otro nombre para este comportamiento de precio";
        if (transaccion === "crear") {
            const comportamientosConNombreIgual = await obtenerNombreComportamientoPorNombreUI(nombreComportamiento)
            if (comportamientosConNombreIgual.length > 0) {
                throw new Error(mensajeNombreRepetido);
            }

        }
        if (transaccion === "actualizar") {
            const comportamientosDistintosConNombreIgual = await obtenerComportamientosDistintosPorNombreUI({
                nombreComportamiento: nombreComportamiento,
                comportamientoUID: comportamientoUID
            })
            if (comportamientosDistintosConNombreIgual.length > 0) {
                throw new Error(mensajeNombreRepetido);
            }
        }

        if (tipoIDV === "porRango") {
            const fechaInicio_ISO = data.fechaInicio_ISO
            const fechaFinal_ISO = data.fechaFinal_ISO

            const comportamientosEnElRango = [] // Los comportamiento de precio que estan en el rango de nuevo comportamiento
            if (transaccion === "crear") {
                const comportamientosPorRango = await obtenerComportamientosPorRangoPorTipoIDV({
                    fechaInicio_ISO: fechaInicio_ISO,
                    fechaFinal_ISO: fechaFinal_ISO,
                    tipoIDV: tipoIDV
                })
                comportamientosEnElRango.push(...comportamientosPorRango)
            }
            if (transaccion === "actualizar") {
                const comportamientosDistintosPorRango = await obtenerComportamientosDistintosPorRangoPorTipoIDVPorComportamientoUID({
                    fechaInicio_ISO: fechaInicio_ISO,
                    fechaFinal_ISO: fechaFinal_ISO,
                    tipoIDV: tipoIDV,
                    comportamientoUID: comportamientoUID
                })
                comportamientosEnElRango.push(...comportamientosDistintosPorRango)
            }
            const soloUIDComportamientosCoincidentes = comportamientosEnElRango.map((detallesDelComportamiento, posicion) => {
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
                        apartametnoUI: await obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV)
                    }
                    arbolComportamientoCoincidentes[componenteUID].apartamento.push(estructuraApartamentoCoincidente)

                    const errorCompuesto = {
                        error: `No se puede crear este comportamiento de precio por que hay apartamentos en este comportamiento que existen en otros comportamientos cuyos rangos de fechas se pisan`,
                        comportamientosCoincidentes: arbolComportamientoCoincidentes
                    }
                    throw errorCompuesto
                }
            }
        }
        if (tipoIDV === "porDias") {
            const diasArray = data.diasArray
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
                        apartametnoUI: await obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV)
                    }
                    arbolComportamientoCoincidentes[componenteUID].apartamento.push(estructuraApartamentoCoincidente)

                    const errorCompuesto = {
                        error: `No se puede crear este comportamiento de por dias por que hay apartamentos en este comportamiento que existen en otros comportamientos por dias que coinciden en el dias y el apartamento. Es decir hay comportamientos que tiene el mismo dia y el mismo apartamento coincidiendo.`,
                        comportamientosCoincidentes: arbolComportamientoCoincidentes
                    }
                    throw errorCompuesto
                }
            }

        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
