
import { eliminarBloqueoCaducado } from "../../../shared/bloqueos/eliminarBloqueoCaducado.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { obtenerBloqueosDelApartamentoPorApartamentoIDV } from "../../../infraestructure/repository/bloqueos/obtenerBloqueosDelApartamentoPorApartamentoIDV.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";

export const listaBloquoeosDelApartamento = async (entrada, salida) => {
    try {

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        await eliminarBloqueoCaducado();
        await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })
        const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })
        const apartamentoUI = apartamento.apartamentoUI
        const bloqueosDelApartamento = await obtenerBloqueosDelApartamentoPorApartamentoIDV(apartamentoIDV)

        const ok = {};
        if (bloqueosDelApartamento.length === 0) {
            ok.apartamentoIDV = apartamentoIDV;
            ok.apartamentoUI = apartamentoUI;
            ok.ok = [];
        }
        if (bloqueosDelApartamento.length > 0) {
            const bloqueosDelApartamentoEntonctrado = [];
            bloqueosDelApartamento.forEach((bloqueoDelApartamento) => {

                if (bloqueoDelApartamento.motivo) {
                    const bufferObjPreDecode = Buffer.from(bloqueoDelApartamento.motivo, "base64");
                    bloqueoDelApartamento.motivo = bufferObjPreDecode.toString("utf8");

                }


                const bloqueoUID = bloqueoDelApartamento.bloqueoUID;
                const tipoBloqueoIDV = bloqueoDelApartamento.tipoBloqueoIDV;
                const fechaInicio = bloqueoDelApartamento.fechaInicio;
                const fechaFin = bloqueoDelApartamento.fechaFin;
                const motivo = bloqueoDelApartamento.motivo;
                const zonaIDV = bloqueoDelApartamento.zonaIDV;
                const estructuraBloqueo = {
                    bloqueoUID,
                    tipoBloqueoIDV,
                    fechaInicio,
                    fechaFin,
                    motivo,
                    zonaIDV
                };
                bloqueosDelApartamentoEntonctrado.push(estructuraBloqueo);
            });
            ok.apartamentoIDV = apartamentoIDV;
            ok.apartamentoUI = apartamentoUI;
            ok.ok = bloqueosDelApartamentoEntonctrado;
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }

}