import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerSimulacionPorSimulacionUID } from "../../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerServiciosPorSimulacionUID } from "../../../infraestructure/repository/simulacionDePrecios/servicios/obtenerServiciosPorSimulacionUID.mjs";
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
        const apartamentosIDVARRAY = simulacion.apartamentosIDVARRAY || []
        const apartamentos = []
        for (const apartamentoIDV of apartamentosIDVARRAY) {
            // await obtenerConfiguracionPorApartamentoIDV({
            //     apartamentoIDV,
            //     errorSi: "noExiste"
            // })
            const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "desactivado"
            })

            const estructura = {
                apartamentoIDV,
                apartamentoUI: apartamento?.apartamentoUI || "Sin informacion"
            }
            apartamentos.push(estructura)
        }

        const serviciosDeLaSimulacion = await obtenerServiciosPorSimulacionUID(simulacionUID)

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
            contenedorFinanciero: simulacion
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}