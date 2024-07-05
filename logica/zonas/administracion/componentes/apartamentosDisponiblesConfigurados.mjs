import { obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV } from "../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";


export const apartamentosDisponiblesConfigurados = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const apartamentosDisponiblesConfigurados_ = await obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV({
            estadoIDV: "disponible",
            zonaArray: ["publica", "global", "privada"]
        })

        if (apartamentosDisponiblesConfigurados_.length === 0) {
            const error = "No hay ningun apartamento disponible configurado";
            throw new Error(error);
        }


        for (const detallesApartamento of apartamentosDisponiblesConfigurados_) {
            const apartamentoIDV = detallesApartamento.apartamentoIDV
            const apartamentoEntidadad = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "desactivado"
            })
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