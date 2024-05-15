import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { vitiniCrypto } from "../../../sistema/VitiniIDX/vitiniCrypto.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";


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
        validadoresCompartidos.claves.minimoRequisitos(claveNueva);
        validadoresCompartidos.claves.minimoRequisitos(claveNuevaDos);

        if (claveNueva !== claveNuevaDos) {
            const error = "No has escrito dos veces la misma nueva contrasena";
            throw new Error(error);
        }
        const cryptoData = {
            sentido: "cifrar",
            clavePlana: claveNueva
        };
        const retorno = vitiniCrypto(cryptoData);
        const nuevaSal = retorno.nuevaSal;
        const hashCreado = retorno.hashCreado;
        await campoDeTransaccion("iniciar")
        const actualizarClave = `
                            UPDATE usuarios
                            SET 
                                clave = $1,
                                sal = $2
                            WHERE 
                                usuario = $3
                            `;
        const datos = [
            hashCreado,
            nuevaSal,
            usuarioIDX
        ];
        const resuelveActualizarClave = await conexion.query(actualizarClave, datos);
        if (resuelveActualizarClave.rowCount === 1) {
            const ok = {
                "ok": "Se ha actualizado la nueva clave"
            };
            salida.json(ok);
        }
        await campoDeTransaccion("confirmar")
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
    }
}