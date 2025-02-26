import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerSimulacionPorSimulacionUID } from "../../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerServiciosPorSimulacionUID } from "../../../infraestructure/repository/simulacionDePrecios/servicios/obtenerServiciosPorSimulacionUID.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { obtenerTodoElAlojamientoDeLaSimulacionPorSimulacionUID } from "../../../infraestructure/repository/simulacionDePrecios/alojamiento/obtenerTodoElAlojamientoDeLaSimulacionPorSimulacionUID.mjs";
import { obtenerComplementosAlojamientoPorSimulacionUID } from "../../../infraestructure/repository/simulacionDePrecios/complementosDeAlojamiento/obtenerComplementosAlojamientoPorSimulacionUID.mjs";
import { controladorGeneracionDesgloseFinanciero } from "../../../shared/simuladorDePrecios/controladorGeneracionDesgloseFinanciero.mjs";
export const detallesSimulacion = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })

        const simulacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.simulacionUID,
            nombreCampo: "El  simulacionUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        const simulacion = await obtenerSimulacionPorSimulacionUID(simulacionUID)

        const nombre = simulacion.nombre
        const zonaIDV = simulacion.zonaIDV
        const fechaCreacion = simulacion.fechaCreacion
        const fechaEntrada = simulacion.fechaEntrada
        const fechaSalida = simulacion.fechaSalida  
        const alojamientosSimulacion = await obtenerTodoElAlojamientoDeLaSimulacionPorSimulacionUID(simulacionUID)

        const apartamentos = []
        for (const apartamento of alojamientosSimulacion) {
            const apartamentoIDV = apartamento.apartamentoIDV
            const apartamentoUID = apartamento.apartamentoUID

            let apartamentoUI
            const configuracionAlojamiento = await obtenerConfiguracionPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "desactivado"
            })
            if (configuracionAlojamiento?.apartamentoIDV) {
                apartamentoUI = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
                    apartamentoIDV,
                    errorSi: "desactivado"
                }))?.apartamentoUI
            } else {
                apartamentoUI = `IDV no reconocido (${apartamentoIDV})`
            }
            apartamentos.push({
                apartamentoIDV,
                apartamentoUI,
                apartamentoUID
            })
        }
        const serviciosDeLaSimulacion = await obtenerServiciosPorSimulacionUID(simulacionUID)
        const complementosDeAlojamientoDeLaSimulacion = await obtenerComplementosAlojamientoPorSimulacionUID(simulacionUID)
        const postProcesadoSimualacion = await controladorGeneracionDesgloseFinanciero(simulacionUID)

        const ok = {
            ok: "Aquí tienes los detalles de la simulación",
            nombre,
            zonaIDV,
            simulacionUID,
            fechaCreacion,
            fechaEntrada,
            fechaSalida,
            apartamentos,
            servicios: serviciosDeLaSimulacion,
            complementosDeAlojamiento: complementosDeAlojamientoDeLaSimulacion,
            //contenedorFinanciero: simulacion,
            ...postProcesadoSimualacion
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}