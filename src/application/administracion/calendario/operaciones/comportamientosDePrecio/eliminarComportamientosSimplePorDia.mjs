import Joi from "joi";
import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { obtenerComportamientosPorRangoPorTipoIDV } from "../../../../../infraestructure/repository/comportamientoDePrecios/obtenerComportamientosPorRangoPorTipoIDV.mjs";
import { validadorComportamientosDesdeCalendario } from "../../../../../shared/contenedorFinanciero/comportamientoPrecios/validadorComportamientosDesdeCalendario.mjs";
import { eliminarComportamientoDePrecioPorComportamientoUID } from "../../../../../infraestructure/repository/comportamientoDePrecios/eliminarComportamientoDePrecioPorComportamientoUID.mjs";

export const eliminarComportamientosSimplePorDia = async (entrada) => {
    const mutex = new Mutex();

    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.control()

        await mutex.acquire();

        await validadorComportamientosDesdeCalendario({
            entrada
        })

        const fechasSel = entrada.body.fechasSel
        const apartamentosIDVSel = entrada.body.apartamentosIDVSel

        const preSelectorCPorRango = []
        for (const f of fechasSel) {
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
                if (cSimplePorApartamento) {
                    const cEliminado = await eliminarComportamientoDePrecioPorComportamientoUID(cSimplePorApartamento)
                    comportamientosResultantes.push(cEliminado)
                }
            }
        }
        const ok = {
            ok: "Se han eliminado los precios de los dias y los apartamentos seleccionados correctamente",
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