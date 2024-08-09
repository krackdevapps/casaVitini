
import { actualizarImagenDelApartamentoPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/actualizarImagenDelApartamentoPorApartamentoIDV.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";


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