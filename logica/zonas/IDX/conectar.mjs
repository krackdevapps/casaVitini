import { DateTime } from "luxon";
import { conexion } from "../../componentes/db.mjs";
import { vitiniCrypto } from "../../sistema/vitiniCrypto.mjs";
import { eliminarCuentasNoVerificadas } from "../../sistema/VitiniIDX/eliminarCuentasNoVerificadas.mjs";
import { borrarCuentasCaducadas } from "../../sistema/VitiniIDX/borrarCuentasCaducadas.mjs";

export const conectar = async (entrada, salida) => {
    try {
        await eliminarCuentasNoVerificadas();
        await borrarCuentasCaducadas();

        const usuario = entrada.body.usuario;
        const filtroIDX = /^[a-z0-9_\-\.]+$/;
        const filtroCadena = /['"\\;\r\n<>\t\b]/g;
        if (!usuario || !filtroIDX.test(usuario) || filtroCadena.test(usuario)) {
            const error = "Datos de identificación incorrectos.";
            throw new Error(error);
        }
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
                    const actualizarIntentos = `
                            UPDATE 
                                usuarios
                            SET     
                                intentos = $1
                            WHERE 
                                usuario = $2
                            RETURNING
                                intentos;`;
                    const resuelveIntento = await conexion.query(actualizarIntentos, [intento, IDX_]);
                    return resuelveIntento.rows[0].intentos;
                } catch (error) {
                    throw error;
                }
            },
            restablece: async (IDX_) => {
                try {
                    const intento = 0;
                    const actualizarIntentos = `
                            UPDATE 
                                usuarios
                            SET     
                                intentos = $1
                            WHERE 
                                usuario = $2;`;
                    await conexion.query(actualizarIntentos, [intento, IDX_]);
                } catch (error) {
                    throw error;
                }
            }
        };
        // Se valida si existe el usuario
        const consultaControlIDX = `
                SELECT
                usuario,
                rol,
                sal,
                clave,
                "estadoCuenta",
                "cuentaVerificada",
                intentos
                FROM 
                usuarios 
                WHERE 
                usuario = $1
                `;
        const resuelveControlIDX = await conexion.query(consultaControlIDX, [usuario]);
        if (resuelveControlIDX.rowCount === 0) {
            const error = "Datos de identificación incorrectos.";
            throw new Error(error);
        }
        // Se recupera el hash y la sal
        const IDX_ = resuelveControlIDX.rows[0].usuario;
        const rol = resuelveControlIDX.rows[0].rol;
        const sal = resuelveControlIDX.rows[0].sal;
        const claveHash = resuelveControlIDX.rows[0].clave;
        const estadoCuenta = resuelveControlIDX.rows[0].estadoCuenta;
        const cuentaVerificada = resuelveControlIDX.rows[0].cuentaVerificada;
        const intentos = resuelveControlIDX.rows[0].intentos || 0;
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
            const intentoActual = await controladorIntentos.suma(intentos, IDX_);
            if (intentoActual >= intentosMaximos) {
                const error = "Cuenta bloqueada tras 10 intentos. Recupera tu cuenta con tu correo.";
                throw new Error(error);
            } else {
                const error = "Datos de identificación incorrectos.";
                throw new Error(error);
            }
        }
        await controladorIntentos.restablece(IDX_);
        if (estadoCuenta === "desactivado") {
            const error = "Esta cuenta esta desactivada";
            throw new Error(error);
        }
        const fechaActualISO = DateTime.utc().toISO();
        const actualizarUltimoLogin = `
                UPDATE usuarios
                SET 
                    "ultimoLogin" = $1
                WHERE 
                    usuario = $2;
                `;
        await conexion.query(actualizarUltimoLogin, [fechaActualISO, usuario]);
        entrada.session.usuario = IDX_;
        entrada.session.IDX = IDX_;
        entrada.session.rol = rol;
        entrada.session.ip = ip;
        entrada.session.userAgent = userAgent;
        const ok = {
            ok: IDX_,
            rol: rol,
            //controlEstado: "Objeto en IF IDX",
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}
