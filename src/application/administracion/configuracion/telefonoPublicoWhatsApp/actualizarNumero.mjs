
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";
import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { actualizarParConfiguracion } from "../../../../infraestructure/repository/configuracion/parConfiguracion/actualizarParConfiguracion.mjs";


export const actualizarNumero = async (entrada) => {
    try {

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