import { obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV } from "../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";



export const apartamentosDisponiblesConfigurados = async (entrada) => {
    try {


        const apartamentosDisponiblesConfigurados_ = await obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDV({
            estadoIDV: "activado",
            zonaArray: ["publica", "global", "privada"]
        })

        if (apartamentosDisponiblesConfigurados_.length === 0) {
            const error = "No hay ningún apartamento disponible configurado.";
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