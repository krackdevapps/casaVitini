import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerSimulacionPorSimulacionUID } from "../../../repositorio/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { eliminarSimulacionPorSimulacionUID } from "../../../repositorio/simulacionDePrecios/eliminarSimulacionPorSimulacionUID.mjs";

export const eliminarSimulacion = async (entrada) => {
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
        await obtenerSimulacionPorSimulacionUID(simulacionUID)
        await eliminarSimulacionPorSimulacionUID(simulacionUID)

        const ok = {
            ok: "Se ha eliminado la simulacion con exito",
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}