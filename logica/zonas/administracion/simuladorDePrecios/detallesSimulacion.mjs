import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerSimulacionPorSimulacionUID } from "../../../repositorio/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
export const detallesSimulacion = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

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
        const fechaCreacion = simulacion.fechaCreacion
        const fechaEntrada = simulacion.fechaEntrada
        const fechaSalida = simulacion.fechaSalida
        const apartamentosIDVARRAY = simulacion.apartamentosIDVARRAY
        const apartamentos = []
        for (const apartamentoIDV of apartamentosIDVARRAY) {
             await obtenerConfiguracionPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "noExiste"
            })
            const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "noExiste"
            })

            const estructura = {
                apartamentoIDV,
                apartamentoUI: apartamento.apartamentoUI
            }
            apartamentos.push(estructura)
        }

        const ok = {
            ok: "Aquí tienes los detalles de la simulacion",
            nombre,
            fechaCreacion,
            fechaEntrada,
            fechaSalida,
            apartamentos,
            contenedorFinanciero: simulacion
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}