import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../../sistema/configuracion/codigoZonaHoraria.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { eliminarBloqueoCaducado } from "../../../sistema/bloqueos/eliminarBloqueoCaducado.mjs";
import { procesador } from "../../../sistema/contenedorFinanciero/procesador.mjs";
import { Mutex } from "async-mutex";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { obtenerSimulacionPorSimulacionUID } from "../../../repositorio/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs";
import { actualizarRangoFechasPorSimulacionUID } from "../../../repositorio/simulacionDePrecios/actualizarRangoFechasPorSimulacionUID.mjs";
import { actualizarDesgloseFinacieroPorSimulacionUID } from "../../../repositorio/simulacionDePrecios/desgloseFinanciero/actualizarDesgloseFinacieroPorSimulacionUID.mjs";

export const actualizarSimulacionPorFechasPorApartamentos = async (entrada) => {
    const mutex = new Mutex()
    try {

        const simulacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.simulacionUID,
            nombreCampo: "El  simulacionUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const fechaCreacion = (await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: entrada.body.fechaCreacion,
            nombreCampo: "La fecha de fechaCreacion en generarSimulacion"
        }))

        const fechaEntrada = (await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: entrada.body.fechaEntrada,
            nombreCampo: "La fecha de entrada en generarSimulacion"
        }))
        const fechaSalida = (await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: entrada.body.fechaSalida,
            nombreCampo: "La fecha de salida en generarSimulacion"
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
        await obtenerSimulacionPorSimulacionUID(simulacionUID)
        const controlIDVUnicos = {}
        for (const apartamentoIDV of apartamentosIDVARRAY) {
            if (controlIDVUnicos.hasOwnProperty(apartamentoIDV)) {
                const m = `El identificador visual ${apartamentoIDV} esta repetido.`
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
            const error = "La fecha de creacion simulada no puede ser superior a la fecha de entrada simulada.";
            throw new Error(error);
        }
        await eliminarBloqueoCaducado()
        await actualizarRangoFechasPorSimulacionUID({
            fechaCreacion,
            fechaEntrada,
            fechaSalida,
            apartamentosIDVARRAY,
            simulacionUID
        })
        const desgloseFinanciero = await procesador({
            entidades: {
                simulacion: {
                    tipoOperacion: "actualizarDesgloseFinancieroDesdeInstantaneas",
                    simulacionUID
                }
            },
        })
        await actualizarDesgloseFinacieroPorSimulacionUID({
            desgloseFinanciero,
            simulacionUID
        })
        const ok = {
            ok: "Se ha guarado la nueva simulacion",
            simulacionUID,
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