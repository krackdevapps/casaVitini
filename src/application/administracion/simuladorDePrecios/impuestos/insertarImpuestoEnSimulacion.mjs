import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { obtenerImpuestosPorImppuestoUID } from "../../../../infraestructure/repository/impuestos/obtenerImpuestosPorImpuestoUID.mjs"
import { actualizarDesgloseFinacieroPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/desgloseFinanciero/actualizarDesgloseFinacieroPorSimulacionUID.mjs"
import { insertarImpuestoPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/desgloseFinanciero/insertarImpuestoPorSimulacionUID.mjs"
import { obtenerImpuestoPorImpuestoUIDPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/desgloseFinanciero/obtenerImpuestoPorImpuestoUIDPorSimulacionUID.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs"
import { procesador } from "../../../../shared/contenedorFinanciero/procesador.mjs"
import { generarDesgloseSimpleGuardarlo } from "../../../../shared/simuladorDePrecios/generarDesgloseSimpleGuardarlo.mjs"
import { validarDataGlobalDeSimulacion } from "../../../../shared/simuladorDePrecios/validarDataGlobalDeSimulacion.mjs"
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs"

export const insertarImpuestoEnSimulacion = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })

        const simulacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.simulacionUID,
            nombreCampo: "El identificador universal de la simulacionUID (simulacionUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const impuestoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.impuestoUID,
            nombreCampo: "El identificador universal del impuesto (impuestoUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        await obtenerSimulacionPorSimulacionUID(simulacionUID)
        await validarDataGlobalDeSimulacion(simulacionUID)
        await obtenerImpuestoPorImpuestoUIDPorSimulacionUID({
            simulacionUID,
            impuestoUID,
            errorSi: "existe"
        })

        // Insertar el impuesto en la instantanea
        const impuesto = await obtenerImpuestosPorImppuestoUID(impuestoUID)
        await campoDeTransaccion("iniciar")
        await insertarImpuestoPorSimulacionUID({
            simulacionUID,
            impuesto
        })
        await generarDesgloseSimpleGuardarlo(simulacionUID)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha insertado el impuesto correctamente en la reserva y el contenedor financiero se ha renderizado.",
            simulacionUID
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}