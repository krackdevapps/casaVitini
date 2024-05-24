import { obtenerTodasLasConfiguracionDeLosApartamentosSoloDisponibles } from "../../../repositorio/arquitectura/configuraciones/obtenerTodasLasConfiguracionDeLosApartamentosSoloDisponibles.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";


export const apartamentosDisponiblesConfigurados = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const apartamentosDisponiblesConfigurados_ = await obtenerTodasLasConfiguracionDeLosApartamentosSoloDisponibles()

        if (apartamentosDisponiblesConfigurados_.length === 0) {
            const error = "No hay ningun apartamento disponible configurado";
            throw new Error(error);
        }


        for (const detallesApartamento of apartamentosDisponiblesConfigurados_) {
            const apartamentoIDV = detallesApartamento.apartamentoIDV
            const apartamentoEntidadad = await obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV)
            detallesApartamento.apartamentoUI = apartamentoEntidadad.apartamentoUI
        }
 
        const ok = {
            ok: apartamentosDisponiblesConfigurados_
        }
        return ok
    } catch (errorCatpurado) {
        throw errorCatpurado
    }
}