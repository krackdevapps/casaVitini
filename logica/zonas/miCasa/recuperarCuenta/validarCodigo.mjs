import { DateTime } from "luxon";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { eliminarEnlacesDeRecuperacionPorFechaCaducidad } from "../../../repositorio/enlacesDeRecuperacion/eliminarEnlacesDeRecuperacionPorFechaCaducidad.mjs";
import { obtenerEnlacesRecuperacionPorCodigoUPID } from "../../../repositorio/enlacesDeRecuperacion/obtenerEnlacesRecuperacionPorCodigoUPID.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";

export const validarCodigo = async (entrada) => {
    try {

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })

        const codigo = validadoresCompartidos.tipos.cadena({
            string: entrada.body.codigo,
            nombreCampo: "El codigo de verificación",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        const fechaActual_ISO = DateTime.utc().toISO();
        await eliminarEnlacesDeRecuperacionPorFechaCaducidad(fechaActual_ISO)


        await campoDeTransaccion("iniciar")
        const enlacesDeRecuperacion = await obtenerEnlacesRecuperacionPorCodigoUPID(codigo)

        await campoDeTransaccion("confirmar")

        if (enlacesDeRecuperacion.length === 0) {
            const error = "El código que has introducido no existe. Si estás intentando recuperar tu cuenta, recuerda que los códigos son de un solo uso y duran una hora. Si has generado varios códigos, solo es válido el más nuevo.";
            throw new Error(error);
        }
        if (enlacesDeRecuperacion.length === 1) {
            const usuario = enlacesDeRecuperacion[0].usuario;
            const ok = {
                ok: "El enlace temporal sigue vigente",
                usuario: usuario
            };
            return ok
        }
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}