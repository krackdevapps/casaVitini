import { Mutex } from "async-mutex";
import { DateTime } from "luxon";
import { obtenerComportamientosPorTipoIDVPorDiasArrayPorApartamentoIDVArray } from "../../../../../infraestructure/repository/comportamientoDePrecios/obtenerComportamientosPorTipoIDVPorDiasArrayPorApartamentoIDVArray.mjs";
import { obtenerComportamientosPorRangoPorTipoIDV } from "../../../../../infraestructure/repository/comportamientoDePrecios/obtenerComportamientosPorRangoPorTipoIDV.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { insertarComportamientoDePrecio } from "../../../../../infraestructure/repository/comportamientoDePrecios/insertarComportamientoDePrecio.mjs";
import { actualizarComportamientoDePrecio } from "../../../../../infraestructure/repository/comportamientoDePrecios/actualizarComportamientoDePrecio.mjs";
import { validadorComportamientosDesdeCalendario } from "../../../../../shared/contenedorFinanciero/comportamientoPrecios/validadorComportamientosDesdeCalendario.mjs";

export const actualizarComportamientosSimplePorDia = async (entrada) => {
    const mutex = new Mutex();

    try {
        await mutex.acquire();
        const oVal = await validadorComportamientosDesdeCalendario({
            entrada,
            conf: "todo"
        })

        const cantidad = oVal.cantidad
        const simboloIDV = oVal.simboloIDV
        const fechasSel = oVal.fechasSel
        const apartamentosIDVSel = oVal.apartamentosIDVSel



        const diasMap = {
            1: 'lunes',
            2: 'martes',
            3: 'miercoles',
            4: 'jueves',
            5: 'viernes',
            6: 'sabado',
            7: 'domingo'
        }
        const contenedorNombresDiaSoliciados = {}
        const diasArray = []
        for (const f of fechasSel) {
            const diaComoPosicion = DateTime.fromISO(f).toFormat('c')
            if (Object.keys(contenedorNombresDiaSoliciados).length >= 7) {
                break
            }
            const nombreDia = diasMap[diaComoPosicion]
            contenedorNombresDiaSoliciados[nombreDia] = true
            diasArray.push(nombreDia)
        }


        const comportamientosEnConflicto = []
        const cPorDias = await obtenerComportamientosPorTipoIDVPorDiasArrayPorApartamentoIDVArray({
            tipoIDV: "porDias",
            diasArray: diasArray,
            apartamentosIDVArray: apartamentosIDVSel
        })

        comportamientosEnConflicto.push(...cPorDias)

        for (const f of fechasSel) {

            const cPorCreacion = await obtenerComportamientosPorRangoPorTipoIDV({
                fechaInicio: f,
                fechaFinal: f,
                arrayApartamentos: apartamentosIDVSel,
                tipoIDV: "porCreacion",
                estadoArray: ["activado", "desactivado"],
            })
            comportamientosEnConflicto.push(...cPorCreacion)
        }

        const preSelectorCPorRango = []
        for (const f of fechasSel) {
            // 


            const cPorCreacion = await obtenerComportamientosPorRangoPorTipoIDV({
                fechaInicio: f,
                fechaFinal: f,
                arrayApartamentos: apartamentosIDVSel,
                tipoIDV: "porRango",
                estadoArray: ["activado", "desactivado"],
            })
            preSelectorCPorRango.push(...cPorCreacion)
        }
        const comportamientosPorRangoSimpleParaActualizar = []
        preSelectorCPorRango.filter(c => {
            const duracionEnDias = c.duracion_en_dias
            const numeroApartametnos = c.contenedor.apartamentos.length
            if (duracionEnDias > 0 || numeroApartametnos > 1) {
                comportamientosEnConflicto.push(c)
            } else {
                comportamientosPorRangoSimpleParaActualizar.push(c)
            }
        })

        if (comportamientosEnConflicto.length > 0) {
            const errorCompuesto = {
                error: `No se puede realizar la operación por que hay comportamientos de precio complejos en los dias selecionados. A Continuación se muestran los comportamientos complejos que entra en conflicto con los días seleccionados. Si aun selecionando no ve los comportamientos de preico en el calendario. RECUERDE que el calendario solo muestra comportamientos de precio simples y complejos en estado activado.`,
                comportamientosEnConflicto: comportamientosEnConflicto
            }
            throw errorCompuesto
        }

        const comportamientosSimplesFormateados = {}

        comportamientosPorRangoSimpleParaActualizar.forEach(c => {
            const comportamientoUID = c.comportamientoUID
            const fechaInicio = c.contenedor.fechaInicio
            const apartamentoIDV = c.contenedor.apartamentos[0].apartamentoIDV
            if (!comportamientosSimplesFormateados.hasOwnProperty(fechaInicio)) {
                comportamientosSimplesFormateados[fechaInicio] = {}
            }
            const contenedorPorFecha = comportamientosSimplesFormateados[fechaInicio]
            contenedorPorFecha[apartamentoIDV] = comportamientoUID
        })

        const comportamientosResultantes = []
        for (const fechaSolicitada of fechasSel) {

            const cSimpleEnFecha = comportamientosSimplesFormateados[fechaSolicitada] || {}
            for (const apartamentoIDV of apartamentosIDVSel) {
                const cSimplePorApartamento = cSimpleEnFecha[apartamentoIDV] || false

                const estructura = {
                    tipo: "porRango",
                    fechaFinal: fechaSolicitada,
                    fechaInicio: fechaSolicitada,
                    apartamentos: [
                        {
                            cantidad: cantidad,
                            simboloIDV: simboloIDV,
                            apartamentoIDV: apartamentoIDV
                        }
                    ]
                }
                const apartamentoUI = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
                    apartamentoIDV,
                    errorSi: "noExiste"
                })).apartamentoUI

                if (cSimplePorApartamento) {

                    const cActualizado = await actualizarComportamientoDePrecio({
                        nombreComportamiento: `Comportamiento simple por rango creado desde el calendario para el ${fechaSolicitada} del ${apartamentoUI} (${apartamentoIDV})`,
                        contenedor: estructura,
                        comportamientoUID: cSimplePorApartamento
                    })
                    comportamientosResultantes.push(cActualizado)


                } else {

                    const cCreado = await insertarComportamientoDePrecio({
                        nombreComportamiento: `Comportamiento simple por rango creado desde el calendario para el ${fechaSolicitada} del ${apartamentoUI} (${apartamentoIDV})`,
                        contenedor: estructura,
                        estadoInicial: "activado"
                    })
                    comportamientosResultantes.push(cCreado)

                }
            }
        }




        const ok = {
            ok: "Se han actualizado los precios de los dias y los apartamentos seleccionados correctamente",
            comportamientosResultantes

        }
        return ok
    } catch (error) {
        throw error
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}