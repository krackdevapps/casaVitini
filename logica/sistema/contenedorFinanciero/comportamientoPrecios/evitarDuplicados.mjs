import Decimal from "decimal.js"
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs"
import { obtenerNombreComportamientoPorNombreUI } from "../../../repositorio/comportamientoDePrecios/obtenerComportamientoPorNombreUI.mjs"
import { obtenerComportamientosDistintosPorTipoIDVPorDiasArray } from "../../../repositorio/comportamientoDePrecios/obtenerComportamientosDistintosPorTipoIDVPorDiasArray.mjs"
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
            const error = `El sistema de evitar duplicados necesita un tipo de transacción para ver si es una operación de creación o actualización.`
            throw new Error(error)
        }
        const mensajeNombreRepetido = "El nombre que tratas de poner a este comportamiento de precio ya existe. Por favor, con el fin de evitar confusiones e ilegibilidad, escoge otro nombre para este comportamiento de precio.";
        const comportamientosConNombreIgual = await obtenerNombreComportamientoPorNombreUI(nombreComportamiento)

        if (transaccion === "actualizar") {
            const selector = comportamientosConNombreIgual.findIndex((item) => {
                const comportamientoUID_interno = Number(item.comportamientoUID)
                return comportamientoUID_interno === comportamientoUID
            });
            if (selector !== -1) {
                comportamientosConNombreIgual.splice(comportamientosConNombreIgual, 1);
            }
        }

        if (transaccion === "crear" && comportamientosConNombreIgual.length > 0) {
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

            for (const apartamento of apartamentos) {
                const apartamentoIDV = apartamento.apartamentoIDV
                if (preContenedorApartamentos.hasOwnProperty(apartamentoIDV)) {
                    const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                        apartamentoIDV,
                        errorSi: "noExiste"
                    })
                    const apartamentoUI = apartamento.apartamentoUI
                    const m = `El ${apartamentoUI} (${apartamentoIDV}) esta repetido`
                    throw new Error(m)
                } else if (!preContenedorApartamentos.hasOwnProperty(apartamentoIDV)) {
                    preContenedorApartamentos[apartamentoIDV] = new Decimal(0)
                }
            }


            const contenedorApartamentosIDV = []

            apartamentos.forEach((detallesApartmento) => {
                const apartamentoIDV = detallesApartmento.apartamentoIDV
                contenedorApartamentosIDV.push(apartamentoIDV)
            })


            const arrayApartamentos = Object.keys(preContenedorApartamentos)
            const comportamientosPorRango = await obtenerComportamientosPorRangoPorTipoIDV({
                fechaInicio: fechaInicio_ISO,
                fechaFinal: fechaFinal_ISO,
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
                const selector = comportamientosEnConflicto.findIndex((item) => {
                    const comportamientoUID_interno = Number(item.comportamientoUID)
                    return comportamientoUID_interno === comportamientoUID
                })
                if (selector !== -1) {
                    comportamientosEnConflicto.splice(comportamientosEnConflicto, 1);
                }
            }
            if (comportamientosEnConflicto.length > 0) {
                for (const comportamiento of comportamientosEnConflicto) {
                    const apartamentos = comportamiento.contenedor.apartamentos
                    for (const [i, detallesApartmento] of apartamentos.entries()) {

                        const apartamentoIDV = detallesApartmento.apartamentoIDV
                        console.log(apartamentoIDV, i)

                        if (contenedorApartamentosIDV.includes(apartamentoIDV)) {
                            const apartamento = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
                                apartamentoIDV: apartamentoIDV,
                                errorSi: "noExiste"
                            })).apartamentoUI
                            detallesApartmento.apartamentoUI = apartamento
                        } else {
                            apartamentos.splice(i, 1);

                        }
                    }
                }
                const error = {
                    error: "No se puede crear este comportamiento porque entra en conflicto con los apartamentos en otros comportamientos.",
                    comportamientosEnConflicto: comportamientosEnConflicto,
                }
                throw error
            }
        } else if (tipoIDV === "porDias") {
            const diasArray = contenedor.dias
            const apartamentos = contenedor.apartamentos

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
            const contenedorApartamentosIDV = []

            apartamentos.forEach((detallesApartmento) => {
                const apartamentoIDV = detallesApartmento.apartamentoIDV
                contenedorApartamentosIDV.push(apartamentoIDV)
            })

            const comportamientosEnConflicto = []

            for (const detallesComportamiento of comportamientosPorTipoPorDiasEnElRango) {
                const comportamientoUID = detallesComportamiento.comportamientoUID
                const nombreComportamiento = detallesComportamiento.nombreComportamiento
                const apartamentos = detallesComportamiento.contenedor.apartamentos


                let interruptorInsercion = false
                for (const [i, detallesApartmento] of apartamentos.entries()) {
                    const apartamentoIDV = detallesApartmento.apartamentoIDV
                    if (contenedorApartamentosIDV.includes(apartamentoIDV)) {
                        const apartamento = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
                            apartamentoIDV: apartamentoIDV,
                            errorSi: "noExiste"
                        })).apartamentoUI
                        detallesApartmento.apartamentoUI = apartamento
                        interruptorInsercion = true
                    } else {
                        apartamentos.splice(i, 1);
                    }
                }
                if (interruptorInsercion) {
                    comportamientosEnConflicto.push(detallesComportamiento)
                }

                // for (const detallesApartmento of apartamentos) {
                //     const apartamentoIDV = detallesApartmento.apartamentoIDV
                //     if (contenedorApartamentosIDV.includes(apartamentoIDV)) {

                //         const apartamentoUI = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
                //             apartamentoIDV,
                //             errorSi: "noExiste"
                //         })).apartamentoUI
                //         const apartamentosEnClicto = {
                //             apartamentoIDV,
                //             apartamentoUI
                //         }
                //         apartamentosEnConflicto.push(apartamentosEnClicto)
                //     }
                // }
                // if (apartamentosEnConflicto.length > 0) {
                //     arbolComportamientoCoincidentes[comportamientoUID] = {
                //         nombreComportamiento: nombreComportamiento,
                //         comportamientoUID: comportamientoUID,
                //         apartamentos: apartamentosEnConflicto
                //     }
                // }
            }

            if (comportamientosEnConflicto.length > 0) {
                const errorCompuesto = {
                    error: `No se puede crear este comportamiento de porDias porque hay apartamentos en este comportamiento que existen en otros comportamientos por días que coinciden en el día y el apartamento. Es decir, hay comportamientos que tienen el mismo día y el mismo apartamento coincidiendo.`,
                    comportamientosEnConflicto: comportamientosEnConflicto
                }
                throw errorCompuesto
            }
        } else {
            const m = "No se reconode el tipoIDV"
            throw new Error(m);

        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

