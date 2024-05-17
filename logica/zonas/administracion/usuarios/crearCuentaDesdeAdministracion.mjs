import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { eliminarCuentasNoVerificadas } from "../../../sistema/VitiniIDX/eliminarCuentasNoVerificadas.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { vitiniCrypto } from "../../../sistema/VitiniIDX/vitiniCrypto.mjs";
import { validarIDXUnico } from "../../../sistema/VitiniIDX/validarIDXUnico.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerRol } from "../../../repositorio/usuarios/obtenerRol.mjs";
import { insertarUsuario } from "../../../repositorio/usuarios/insertarUsuario.mjs";
import { insertarFilaDatosPersonales } from "../../../repositorio/usuarios/insertarFilaDatosPersonales.mjs";
import { Mutex } from "async-mutex";

export const crearCuentaDesdeAdministracion = async (entrada, salida) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        mutex.acquire()

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
        await validarIDXUnico(usuarioIDX)
        await eliminarCuentasNoVerificadas();
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
        const ok = {
            ok: "Se ha creado el nuevo usuario",
            usuarioIDX: nuevoUsuario.usuario
        };
        salida.json(ok);
        await campoDeTransaccion("confirmar");
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar");
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}