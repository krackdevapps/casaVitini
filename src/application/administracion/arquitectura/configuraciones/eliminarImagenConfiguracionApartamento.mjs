
import { actualizarImagenDelApartamentoPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/actualizarImagenDelApartamentoPorApartamentoIDV.mjs";

import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";


export const eliminarImagenConfiguracionApartamento = async (entrada, salida) => {
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
            limpiezaEspaciosAlrededor: "si"
        })

        const configuracionApartamento = await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })
        if (configuracionApartamento.estadoConfiguracionIDV === "disponible") {
            const error = "No se puede actualizar la imagen de una configuración de apartamento cuando está disponible. Cambie el estado primero.";
            throw new Error(error);
        }
        await actualizarImagenDelApartamentoPorApartamentoIDV({
            apartamentoIDV,
            imagen: null
        })
        const ok = {
            ok: "Se ha borrado la imagen correctamente"
        };
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }

}