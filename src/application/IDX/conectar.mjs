import { DateTime } from "luxon";
import { vitiniCrypto } from "../../shared/VitiniIDX/vitiniCrypto.mjs";
import { validadoresCompartidos } from "../../shared/validadores/validadoresCompartidos.mjs";
import { actualizarIntentoLogin } from "../../infraestructure/repository/usuarios/actualizarIntentoLogin.mjs";
import { obtenerIDX } from "../../infraestructure/repository/usuarios/obtenerIDX.mjs";
import { eliminarSessionPorRolPorCaducidad } from "../../infraestructure/repository/sessiones/eliminarSessionPorRolPorCaducidad.mjs";
import { eliminarUsuarioPorRolPorEstadoVerificacion } from "../../infraestructure/repository/usuarios/eliminarUsuarioPorRolPorEstadoVerificacion.mjs";
import { actualizarUltimoLogin } from "../../infraestructure/repository/usuarios/actualizarUltimoLogin.mjs";

export const conectar = async (entrada) => {
    try {
        await eliminarUsuarioPorRolPorEstadoVerificacion();
        await eliminarSessionPorRolPorCaducidad();
        const errorUI_IDX = "Datos de identificación incorrectos.";

        const numeroLlaves = Object.keys(entrada.body)
        if (numeroLlaves.length > 2) {
            const m = "No se esperan mas de dos llaves en el objeto de identificacion"
            throw new Error(m)
        }
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
                    const intento = Number(numeroIntentosActuales) + 1;
                    const nuevoIntento = await actualizarIntentoLogin({
                        usuarioIDX: IDX_,
                        intento: intento
                    })
                    return nuevoIntento.intentos;

                } catch (errorCapturado) {
                    throw errorCapturado;
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
                    throw errorCapturado;
                }
            }
        }


        try {
            await obtenerIDX(usuario)
        } catch (error) {
            const m = errorUI_IDX
            throw new Error(m);
        }

        const cuentaUsuario = await obtenerIDX(usuario)

        const rolIDV = cuentaUsuario.rolIDV;
        const sal = cuentaUsuario.sal;
        const claveHash = cuentaUsuario.clave;
        const estadoCuenta = cuentaUsuario.estadoCuentaIDV;
        const intentos = cuentaUsuario.intentos || 0;
        const ip = entrada.socket?.remoteAddress;
        const userAgent = entrada.get('User-Agent');
        if (intentos >= intentosMaximos) {
            const error = "Cuenta bloqueada tras 10 intentos. Recupera tu cuenta con tu correo.";
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
                const error = errorUI_IDX
                throw new Error(error);
            }
        }
        await controladorIntentos.restablece(usuario);
        if (estadoCuenta === "desactivado") {
            const error = "Esta cuenta está desactivada.";
            throw new Error(error);
        }
        const fechaActualISO = DateTime.utc().toISO();
        await actualizarUltimoLogin({
            usuario: usuario,
            fechaActualISO: fechaActualISO
        })
        entrada.session.usuario = usuario;

        entrada.session.rolIDV = rolIDV;
        entrada.session.ip = ip;
        entrada.session.userAgent = userAgent;
        const ok = {
            ok: usuario,
            rolIDV: rolIDV,

        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
