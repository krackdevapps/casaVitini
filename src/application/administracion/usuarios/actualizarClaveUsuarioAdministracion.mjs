import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { vitiniCrypto } from "../../../shared/VitiniIDX/vitiniCrypto.mjs";
import { actualizarClave } from "../../../infraestructure/repository/usuarios/actualizarClave.mjs";
import { campoDeTransaccion } from "../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { obtenerUsuario } from "../../../infraestructure/repository/usuarios/obtenerUsuario.mjs";
import { controlRol } from "../../../shared/usuarios/controlRol.mjs";

export const actualizarClaveUsuarioAdministracion = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 3
        })

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

        if (claveNueva !== claveNuevaDos) {
            const error = "No has escrito dos veces la misma nueva contraseña";
            throw new Error(error);
        }
        validadoresCompartidos.claves.minimoRequisitos(claveNuevaDos);
     
        await controlRol({
            usuarioOperacion: IDX.vitiniIDX(),
            usuarioDestino: usuarioIDX
        })

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