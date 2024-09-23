import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { campoDeTransaccion } from "../../../../repositorio/globales/campoDeTransaccion.mjs";
import { actualizarParConfiguracion } from "../../../../repositorio/configuracion/parConfiguracion/actualizarParConfiguracion.mjs";

export const actualizarNumero = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const telefonoPublicoWhatsApp = validadoresCompartidos.tipos.cadena({
            string: entrada.body.telefonoPublicoWhatsApp,
            nombreCampo: "El campo del telefonoPublicoWhatsApp",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no"
        })


        await campoDeTransaccion("iniciar")
        await actualizarParConfiguracion({
            "telefonoPublicoWhatsApp": telefonoPublicoWhatsApp,
        })
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado correctamente la configuración",
            telefonoPublicoWhatsApp
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }

}