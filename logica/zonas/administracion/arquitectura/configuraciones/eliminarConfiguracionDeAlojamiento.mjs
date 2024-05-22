import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

import { obtenerConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/obtenerConfiguracionPorApartamentoIDV.mjs";
import { eliminarConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/eliminarConfiguracionPorApartamentoIDV.mjs";

export const eliminarConfiguracionDeAlojamiento = async (entrada, salida) => {
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
            limpiezaEspaciosAlrededor: "si",
        })

        const configuracionApartamento = await obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)
        if (configuracionApartamento.length === 0) {
            const error = "No existe el perfil de configuracion del apartamento";
            throw new Error(error);
        }
        await eliminarConfiguracionPorApartamentoIDV(apartamentoIDV)
        const ok = {
            ok: "Se ha eliminado correctamente la configuracion de apartamento",
        };
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }

}