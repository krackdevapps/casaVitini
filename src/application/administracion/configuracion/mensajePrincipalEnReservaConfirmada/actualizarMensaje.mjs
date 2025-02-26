import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";
import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { actualizarParConfiguracion } from "../../../../infraestructure/repository/configuracion/parConfiguracion/actualizarParConfiguracion.mjs";

export const actualizarMensaje = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })


        const mensajePrincipalEnReservaConfirmada = validadoresCompartidos.tipos.cadena({
            string: entrada.body.mensajePrincipalEnReservaConfirmada,
            nombreCampo: "El campo del mensajePrincipalEnReservaConfirmada",
            filtro: "transformaABase64",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no"
        })


        await campoDeTransaccion("iniciar")
        await actualizarParConfiguracion({
            "mensajePrincipalEnReservaConfirmada": mensajePrincipalEnReservaConfirmada,
        })
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado correctamente la configuración",
            mensajePrincipalEnReservaConfirmada: Buffer.from(mensajePrincipalEnReservaConfirmada, "base64").toString()
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }

}