import { Mutex } from "async-mutex";
import { obtenerDatosPersonales } from "../../repositorio/usuarios/obtenerDatosPersonales.mjs";
import { obtenerUsuario } from "../../repositorio/usuarios/obtenerUsuario.mjs";
import { VitiniIDX } from "../../sistema/VitiniIDX/control.mjs";
import { filtroError } from "../../sistema/error/filtroError.mjs";
import { campoDeTransaccion } from "../../repositorio/globales/campoDeTransaccion.mjs";

export const datosPersonalesDesdeMiCasa = async (entrada, salida) => {

    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.control()

        mutex.acquire()
        await campoDeTransaccion("iniciar")
        const usuarioIDX = entrada.session.usuario;
        const ok = {
            ok: {}
        };
        const cuentaDeUsuario = await obtenerUsuario(usuarioIDX)
        const rol = cuentaDeUsuario.rolIDV;
        const estadoCuenta = cuentaDeUsuario.estadoCuentaIDV;
        ok.ok.usuarioIDX = usuarioIDX;
        ok.ok.rol = rol;
        ok.ok.estadoCuenta = estadoCuenta;

        const datosDelUsuario = await obtenerDatosPersonales(usuarioIDX)
        await campoDeTransaccion("confirmar")
        for (const [dato, valor] of Object.entries(datosDelUsuario)) {
            ok.ok[dato] = valor;
        }
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
        await campoDeTransaccion("cancelar")
        if (mutex) {
            mutex.release()
        }
    }
}
