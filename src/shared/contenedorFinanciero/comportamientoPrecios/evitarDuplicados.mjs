import Decimal from "decimal.js"
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs"
import { obtenerNombreComportamientoPorNombreUI } from "../../../infraestructure/repository/comportamientoDePrecios/obtenerComportamientoPorNombreUI.mjs"
import { obtenerComportamientosDistintosPorTipoIDVPorDiasArrayPorApartamentoIDV_ignorandoComportamientoUID } from "../../../infraestructure/repository/comportamientoDePrecios/obtenerComportamientosDistintosPorTipoIDVPorDiasArrayPorApartamentoIDV_ignorandoComportamientoUID.mjs"
import { obtenerComportamientosPorRangoPorCreacionPorTipoIDV } from "../../../infraestructure/repository/comportamientoDePrecios/obtenerComportamientosPorRangoPorCreacionPorTipoIDV.mjs"
import { obtenerComportamientosPorRangoPorTipoIDV } from "../../../infraestructure/repository/comportamientoDePrecios/obtenerComportamientosPorRangoPorTipoIDV.mjs"
import { obtenerComportamientosPorTipoPorApartamentoIDV } from "../../../infraestructure/repository/comportamientoDePrecios/obtenerComportamientosPorTipoPorApartamentoIDV.mjs"
import { DateTime } from "luxon"
import { obtenerComportamientosPorTipoIDVPorDiasArrayPorApartamentoIDVArray } from "../../../infraestructure/repository/comportamientoDePrecios/obtenerComportamientosPorTipoIDVPorDiasArrayPorApartamentoIDVArray.mjs"

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
        const comportamientosEnConflicto = []
        const diasMap = {
            1: 'lunes',
            2: 'martes',
            3: 'miercoles', // Sin acento
            4: 'jueves',
            5: 'viernes',
            6: 'sabado', // Sin acento
            7: 'domingo'
        }

        if (tipoIDV === "porCreacion" || tipoIDV === "porRango") {
            const comportamientosEnConflicto = []
            const fechaInicio_ISO = contenedor.fechaInicio
            const fechaFinal_ISO = contenedor.fechaFinal
            const fechaInicio_creacionReserva = contenedor.fechaInicio_creacionReserva
            const fechaFinal_creacionReserva = contenedor.fechaFinal_creacionReserva
            const apartamentos = contenedor.apartamentos
            const preContenedorApartamentos = {}
            const apartamentosIDVArray = apartamentos.map(c => c.apartamentoIDV)

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

            const fechaInicio_objeto = DateTime.fromISO(fechaInicio_ISO, { zone: 'utc' });
            const fechaFinal_objeto = DateTime.fromISO(fechaFinal_ISO, { zone: 'utc' });

            const contenedorNombresDiaSoliciados = {}

            let inicioDelRango = fechaInicio_objeto;
            while (inicioDelRango <= fechaFinal_objeto) {

                const diaComoPosicion = DateTime.fromISO(inicioDelRango).toFormat('c')
                if (Object.keys(contenedorNombresDiaSoliciados).length >= 7) {
                    break
                }
                const nombreDia = diasMap[diaComoPosicion]
                contenedorNombresDiaSoliciados[nombreDia] = true
                inicioDelRango = inicioDelRango.plus({ days: 1 });
            }

            const comportamientosPorDias = await obtenerComportamientosPorTipoIDVPorDiasArrayPorApartamentoIDVArray({
                tipoIDV: "porDias",
                diasArray: Object.keys(contenedorNombresDiaSoliciados),
                apartamentosIDVArray: apartamentosIDVArray

            })
            comportamientosEnConflicto.push(...comportamientosPorDias)

            if (transaccion === "actualizar") {
                const selector = comportamientosEnConflicto.findIndex((item) => {
                    const comportamientoUID_interno = Number(item.comportamientoUID)

                    return String(comportamientoUID_interno) === String(comportamientoUID)
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
            const comportamientosPorRango = []
            const apartamentosIDVArray = apartamentos.map(c => c.apartamentoIDV)


            const comportamientosCompartidosPorApartamentos = await obtenerComportamientosPorTipoPorApartamentoIDV({
                tiposIDVArray: ["porCreacion", "porRango"],
                apartamentosIDVArray: apartamentosIDVArray,
            })
            comportamientosPorRango.push(...comportamientosCompartidosPorApartamentos)

            if (transaccion === "crear") {
                const comportamientosPorDias = await obtenerComportamientosPorTipoIDVPorDiasArrayPorApartamentoIDVArray({
                    tipoIDV: "porDias",
                    diasArray: diasArray,
                    apartamentosIDVArray: apartamentosIDVArray

                })
                comportamientosEnConflicto.push(...comportamientosPorDias)
            }
            if (transaccion === "actualizar") {
                const comportamientosDistintosPorDiasArray = await obtenerComportamientosDistintosPorTipoIDVPorDiasArrayPorApartamentoIDV_ignorandoComportamientoUID({
                    tipoIDV: tipoIDV,
                    diasArray: diasArray,
                    apartamentosIDVArray: apartamentosIDVArray,
                    comportamientoUID: comportamientoUID,
                })
                comportamientosEnConflicto.push(...comportamientosDistintosPorDiasArray)
            }
            const contenedorApartamentosIDV = []

            apartamentos.forEach((detallesApartmento) => {
                const apartamentoIDV = detallesApartmento.apartamentoIDV
                contenedorApartamentosIDV.push(apartamentoIDV)
            })

            comportamientosPorRango.forEach((c) => {
                const fechaFinal = c.contenedor.fechaFinal
                const fechaInicio = c.contenedor.fechaInicio

                const fechaFinal_objeto = DateTime.fromISO(fechaFinal, { zone: 'utc' });
                const fechaInicio_objeto = DateTime.fromISO(fechaInicio, { zone: 'utc' });

                let inicioDelRango = fechaInicio_objeto;


                while (inicioDelRango <= fechaFinal_objeto) {
                    const diaComoPosicion = DateTime.fromISO(inicioDelRango).toFormat('c')
                    if (diasArray.includes(diasMap[diaComoPosicion])) {
                        comportamientosEnConflicto.push(c)
                        break
                    }
                    inicioDelRango = inicioDelRango.plus({ days: 1 });
                }
            })



            for (const detallesComportamiento of comportamientosEnConflicto) {
                const apartamentos = detallesComportamiento.contenedor.apartamentos

                for (const c of apartamentos) {
                    const apartamentoIDV = c.apartamentoIDV
                    const apartamento = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
                        apartamentoIDV: apartamentoIDV,
                        errorSi: "noExiste"
                    })).apartamentoUI
                    c.apartamentoUI = apartamento
                }
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

