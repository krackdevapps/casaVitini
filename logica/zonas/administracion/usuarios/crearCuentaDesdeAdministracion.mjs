import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { vitiniCrypto } from "../../../sistema/VitiniIDX/vitiniCrypto.mjs";

import { obtenerRol } from "../../../repositorio/usuarios/obtenerRol.mjs";
import { insertarUsuario } from "../../../repositorio/usuarios/insertarUsuario.mjs";
import { insertarFilaDatosPersonales } from "../../../repositorio/usuarios/insertarFilaDatosPersonales.mjs";
import { Mutex } from "async-mutex";
import { eliminarUsuarioPorRolPorEstadoVerificacion } from "../../../repositorio/usuarios/eliminarUsuarioPorRolPorEstadoVerificacion.mjs";
import { obtenerUsuario } from "../../../repositorio/usuarios/obtenerUsuario.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";

export const crearCuentaDesdeAdministracion = async (entrada, salida) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        mutex.acquire()
        await campoDeTransaccion("iniciar")

        const clave = entrada.body.clave;
        const usuarioIDX = validadoresCompartidos.tipos.cadena({
            string: entrada.body.usuarioIDX,
            nombreCampo: "El nombre de usuario (VitiniIDX)",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        const rolIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.rolIDV,
            nombreCampo: "El nombre del rolIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        // validar rol      
        await obtenerRol(rolIDV)
        // comporbar que no exista la el usuario
        await obtenerUsuario(usuarioIDX)
        await eliminarUsuarioPorRolPorEstadoVerificacion();
        const estadoCuenta = "desactivado";
        await campoDeTransaccion("iniciar")
        const cryptoData = {
            sentido: "cifrar",
            clavePlana: clave
        };
        const retorno = vitiniCrypto(cryptoData);
        const nuevaSal = retorno.nuevaSal;
        const hashCreado = retorno.hashCreado;
        const cuentaVerificada = "no";

        const nuevoUsuario = await insertarUsuario({
            usuarioIDX: usuarioIDX,
            rolIDV: rolIDV,
            estadoCuenta: estadoCuenta,
            nuevaSal: nuevaSal,
            hashCreado: hashCreado,
            cuentaVerificada: cuentaVerificada
        })
        await insertarFilaDatosPersonales(usuarioIDX)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha creado el nuevo usuario",
            usuarioIDX: nuevoUsuario.usuario
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar");
        throw errorFinal
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}