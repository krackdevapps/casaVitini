import { obtenerConfiguracionPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs"
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs"
import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { insertarApartamentoEnSimulacion } from "../../../../infraestructure/repository/simulacionDePrecios/alojamiento/insertarApartamentoEnSimulacion.mjs"
import { obtenerAlojamientoDeLaSimulacionPorApartamentoIDV } from "../../../../infraestructure/repository/simulacionDePrecios/alojamiento/obtenerAlojamientoDeLaSimulacionPorApartamentoIDV.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { controladorGeneracionDesgloseFinanciero } from "../../../../shared/simuladorDePrecios/controladorGeneracionDesgloseFinanciero.mjs"
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs"
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs"


export const insertarAlojamientoEnSimulacion = async (entrada) => {
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
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })
        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })
        await obtenerSimulacionPorSimulacionUID(simulacionUID)
        const apartamentoEnSimulacion = await obtenerAlojamientoDeLaSimulacionPorApartamentoIDV({
            simulacionUID,
            apartamentoIDV
        })
        if (apartamentoEnSimulacion?.apartamentoIDV) {
            const m = "Ya existe el apartamento en la simulación"
            throw new Error(m)
        }
        await campoDeTransaccion("iniciar")

        const nuevoApartamento = await insertarApartamentoEnSimulacion({
            simulacionUID,
            apartamentoIDV
        })
        const apartamentoEntidad = await obtenerApartamentoComoEntidadPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })
        const apartamentoUI = apartamentoEntidad.apartamentoUI
        nuevoApartamento.apartamentoUI = apartamentoUI
        await campoDeTransaccion("confirmar")
        const postProcesadoSimualacion = await controladorGeneracionDesgloseFinanciero(simulacionUID)

        return {
            ok: "Se ha insertado el apartamento en la simulacion",
            simulacionUID,
            nuevoApartamento,
            ...postProcesadoSimualacion
        }
    } catch (error) {
        await campoDeTransaccion("cancelar")
        throw error
    }


}