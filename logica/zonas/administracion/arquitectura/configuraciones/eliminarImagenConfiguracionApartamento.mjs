
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

import { obtenerConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/obtenerConfiguracionPorApartamentoIDV.mjs";
import { actualizarImagenDelApartamentoPorApartamentoIDV } from "../../../../repositorio/arquitectura/actualizarImagenDelApartamentoPorApartamentoIDV.mjs";

export const eliminarImagenConfiguracionApartamento = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si"
        })

        const configuracionApartamento = await obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)
        if (configuracionApartamento.length === 0) {
            const error = "No existe el apartamento como entidad. Primero crea la entidad y luego podras crear la configuiracíon";
            throw new Error(error);
        }
        if (configuracionApartamento.estadoConfiguracion === "disponible") {
            const error = "No se puede actualizar la imagen de una configuracion de apartamento cuando esta disponbile,cambie el estado primero";
            throw new Error(error);
        }
        await actualizarImagenDelApartamentoPorApartamentoIDV(apartamentoIDV)
        const ok = {
            ok: "Se ha borrado imagen correctamnte"
        };
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }

}