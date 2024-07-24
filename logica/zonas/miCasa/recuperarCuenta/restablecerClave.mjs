import { DateTime } from "luxon";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

import { eliminarEnlacesDeRecuperacionPorFechaCaducidad } from "../../../repositorio/enlacesDeRecuperacion/eliminarEnlacesDeRecuperacionPorFechaCaducidad.mjs";
import { obtenerEnlacesRecuperacionPorCodigoUPID } from "../../../repositorio/enlacesDeRecuperacion/obtenerEnlacesRecuperacionPorCodigoUPID.mjs";
import { actualizarClave } from "../../../repositorio/usuarios/actualizarClave.mjs";
import { eliminarEnlacesDeRecuperacionPorUsuario } from "../../../repositorio/enlacesDeRecuperacion/eliminarEnlacesDeRecuperacionPorUsuario.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";
import { vitiniCrypto } from "../../../sistema/VitiniIDX/vitiniCrypto.mjs";

export const restablecerClave = async (entrada, salida) => {
    try {
        const codigo = validadoresCompartidos.tipos.cadena({
            string: entrada.body.codigo,
            nombreCampo: "El codigo de verificación",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        const clave = entrada.body.clave;
        const claveConfirmada = entrada.body.claveConfirmada;
        validadoresCompartidos.claves.minimoRequisitos(clave);

        if (clave !== claveConfirmada) {
            const error = "Las claves no coinciden. Por favor escribe tu nueva clave dos veces.";
            throw new Error(error);
        }

        const fechaActual_ISO = DateTime.utc().toISO();
        await eliminarEnlacesDeRecuperacionPorFechaCaducidad(fechaActual_ISO)
        await campoDeTransaccion("iniciar")
        const enlacesDeRecuperacion = await obtenerEnlacesRecuperacionPorCodigoUPID(codigo)


        if (enlacesDeRecuperacion.length === 0) {
            const error = "El código que has introducido no existe. Si estás intentando recuperar tu cuenta, recuerda que los códigos son de un solo uso y duran una hora. Si has generado varios códigos, solo es válido el más nuevo.";
            throw new Error(error);
        }
        if (enlacesDeRecuperacion.length === 1) {
            const usuario = enlacesDeRecuperacion[0].usuario;
            const crypto = {
                sentido: "cifrar",
                clavePlana: clave
            };
            const retorno = vitiniCrypto(crypto);
            const nuevaSal = retorno.nuevaSal;
            const hashCreado = retorno.hashCreado;
            await actualizarClave({
                hashCreado: hashCreado,
                nuevaSal: nuevaSal,
                usuarioIDX: usuario
            })
            await eliminarEnlacesDeRecuperacionPorUsuario(usuario)
            await campoDeTransaccion("confirmar")
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