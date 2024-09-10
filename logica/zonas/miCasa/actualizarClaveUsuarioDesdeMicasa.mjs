import { VitiniIDX } from "../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../sistema/validadores/validadoresCompartidos.mjs";
import { vitiniCrypto } from "../../sistema/VitiniIDX/vitiniCrypto.mjs";
import { obtenerUsuario } from "../../repositorio/usuarios/obtenerUsuario.mjs";
import { campoDeTransaccion } from "../../repositorio/globales/campoDeTransaccion.mjs";
import { actualizarClave } from "../../repositorio/usuarios/actualizarClave.mjs";

export const actualizarClaveUsuarioDesdeMicasa = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 3
        })
        
        const usuarioIDX = entrada.session.usuario;
        const claveActual = entrada.body.claveActual;
        const claveNueva = entrada.body.claveNueva;
        const claveConfirmada = entrada.body.claveConfirmada;

        if (claveNueva !== claveConfirmada) {
            const error = "No has escrito dos veces la misma nueva contraseña, revisa las claves que has escrito y cerciórate que ambas claves nuevas son iguales.";
            throw new Error(error);
        }

        validadoresCompartidos.claves.minimoRequisitos(claveNueva);
        //validadoresCompartidos.claves.minimoRequisitos(claveConfirmada);


        if (claveNueva === claveActual) {
            const error = "Has escrito una clave nueva que es la misma que la actual. Por favor, revisa los campos.";
            throw new Error(error);
        }
        await campoDeTransaccion("iniciar")

        const cuentaDeUsuario = await obtenerUsuario({
            usuario: usuarioIDX,
            errorSi: "noExiste"
        })
        const claveActualHASH = cuentaDeUsuario.clave;
        const sal = cuentaDeUsuario.sal;
        const metadatos = {
            sentido: "comparar",
            clavePlana: claveActual,
            sal: sal,
            claveHash: claveActualHASH
        };
        const controlClave = vitiniCrypto(metadatos);
        if (!controlClave) {
            const error = "Revisa la contraseña actual que has escrito porque no es correcta, por lo tanto, no se puede cambiar la contraseña";
            throw new Error(error);
        }
        const cryptoData = {
            sentido: "cifrar",
            clavePlana: claveNueva
        };
        const retorno = vitiniCrypto(cryptoData);
        const nuevaSal = retorno.nuevaSal;
        const hashCreado = retorno.hashCreado;

        await actualizarClave({
            hashCreado: hashCreado,
            nuevaSal: nuevaSal,
            usuarioIDX: usuarioIDX
        })
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado la nueva contraseña."
        };
        return ok

    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}
