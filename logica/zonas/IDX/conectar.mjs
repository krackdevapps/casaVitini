import { DateTime } from "luxon";
import { vitiniCrypto } from "../../sistema/VitiniIDX/vitiniCrypto.mjs";
import { validadoresCompartidos } from "../../sistema/validadores/validadoresCompartidos.mjs";

import { actualizarIntentoLogin } from "../../repositorio/usuarios/actualizarIntentoLogin.mjs";
import { obtenerIDX } from "../../repositorio/usuarios/obtenerIDX.mjs";
import { eliminarSessionPorRolPorCaducidad } from "../../repositorio/sessiones/eliminarSessionPorRolPorCaducidad.mjs";
import { eliminarUsuarioPorRolPorEstadoVerificacion } from "../../repositorio/usuarios/eliminarUsuarioPorRolPorEstadoVerificacion.mjs";
import { actualizarUltimoLogin } from "../../repositorio/usuarios/actualizarUltimoLogin.mjs";

export const conectar = async (entrada, salida) => {
    try {
        await eliminarUsuarioPorRolPorEstadoVerificacion();
        await eliminarSessionPorRolPorCaducidad();

        const usuario = validadoresCompartidos.tipos.cadena({
            string: entrada.body.usuario,
            nombreCampo: "El nombre de usuario (VitiniIDX)",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        const clave = entrada.body.clave;
        if (!clave) {
            const error = "Falta especificar la clave";
            throw new Error(error);
        }
        const intentosMaximos = 10;
        const controladorIntentos = {
            suma: async (numeroIntentosActuales, IDX_) => {
                try {
                    const intento = numeroIntentosActuales + 1;
                    const nuevoIntento = await actualizarIntentoLogin({
                        usuarioIDX: IDX_,
                        intento: intento
                    })
                    return nuevoIntento.intentos;

                } catch (errorCapturado) {
                    throw error;
                }
            },
            restablece: async (IDX_) => {
                try {
                    const intento = 0;
                    await actualizarIntentoLogin({
                        usuarioIDX: IDX_,
                        intento: intento
                    })
                } catch (errorCapturado) {
                    throw error;
                }
            }
        }

        // Se valida si existe el usuario
        const cuentaUsuario = await obtenerIDX(usuario)
        // Se recupera el hash y la sal
        const rol = cuentaUsuario.rolIDV;
        const sal = cuentaUsuario.sal;
        const claveHash = cuentaUsuario.clave;
        const estadoCuenta = cuentaUsuario.estadoCuentaIDV;
        const intentos = cuentaUsuario.intentos || 0;
        const ip = entrada.socket.remoteAddress;
        const userAgent = entrada.get('User-Agent');
        if (intentos >= intentosMaximos) {
            const error = "1Cuenta bloqueada tras 10 intentos. Recupera tu cuenta con tu correo.";
            throw new Error(error);
        }
        const metadatos = {
            sentido: "comparar",
            clavePlana: clave,
            sal: sal,
            claveHash: claveHash
        };
        const controlClave = vitiniCrypto(metadatos);
        if (!controlClave) {
            const intentoActual = await controladorIntentos.suma(intentos, usuario);
            if (intentoActual >= intentosMaximos) {
                const error = "Cuenta bloqueada tras 10 intentos. Recupera tu cuenta con tu correo.";
                throw new Error(error);
            } else {
                const error = "Datos de identificación incorrectos.";
                throw new Error(error);
            }
        }
        await controladorIntentos.restablece(usuario);
        if (estadoCuenta === "desactivado") {
            const error = "Esta cuenta esta desactivada";
            throw new Error(error);
        }
        const fechaActualISO = DateTime.utc().toISO();
        await actualizarUltimoLogin({
            usuario: usuario,
            fechaActualISO: fechaActualISO
        })
        entrada.session.usuario = usuario;
        entrada.session.IDX = usuario;
        entrada.session.rol = rol;
        entrada.session.ip = ip;
        entrada.session.userAgent = userAgent;
        const ok = {
            ok: usuario,
            rol: rol,
            //controlEstado: "Objeto en IF IDX",
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
