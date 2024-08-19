import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { vitiniCrypto } from "../../../sistema/VitiniIDX/vitiniCrypto.mjs";
import { actualizarClave } from "../../../repositorio/usuarios/actualizarClave.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";

export const actualizarClaveUsuarioAdministracion = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const claveNueva = entrada.body.claveNueva;
        const claveNuevaDos = entrada.body.claveNuevaDos;

        const usuarioIDX = validadoresCompartidos.tipos.cadena({
            string: entrada.body.usuarioIDX,
            nombreCampo: "El nombre de usuario (VitiniIDX)",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        //validadoresCompartidos.claves.minimoRequisitos(claveNueva);
        if (claveNueva !== claveNuevaDos) {
            const error = "No has escrito dos veces la misma nueva contraseña";
            throw new Error(error);
        }
        validadoresCompartidos.claves.minimoRequisitos(claveNuevaDos);


        const cryptoData = {
            sentido: "cifrar",
            clavePlana: claveNueva
        };
        const retorno = vitiniCrypto(cryptoData);
        const nuevaSal = retorno.nuevaSal;
        const hashCreado = retorno.hashCreado;
        await campoDeTransaccion("iniciar")

        await actualizarClave({
            hashCreado: hashCreado,
            nuevaSal: nuevaSal,
            usuarioIDX: usuarioIDX
        })
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado la nueva clave"
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}