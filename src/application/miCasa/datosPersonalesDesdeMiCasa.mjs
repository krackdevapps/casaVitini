import { Mutex } from "async-mutex";
import { obtenerDatosPersonales } from "../../infraestructure/repository/usuarios/obtenerDatosPersonales.mjs";
import { obtenerUsuario } from "../../infraestructure/repository/usuarios/obtenerUsuario.mjs";
;
import { campoDeTransaccion } from "../../infraestructure/repository/globales/campoDeTransaccion.mjs";

export const datosPersonalesDesdeMiCasa = async (entrada) => {

    const mutex = new Mutex()
    try {

        mutex.acquire()
        await campoDeTransaccion("iniciar")
        const usuarioIDX = entrada.session.usuario;
        const ok = {
            ok: {}
        };
        const cuentaDeUsuario = await obtenerUsuario({
            usuario: usuarioIDX,
            errorSi: "noExiste"
        })
        const rolIDV = cuentaDeUsuario.rolIDV;
        const estadoCuentaIDV = cuentaDeUsuario.estadoCuentaIDV;
        ok.ok.usuarioIDX = usuarioIDX;
        ok.ok.rolIDV = rolIDV;
        ok.ok.estadoCuentaIDV = estadoCuentaIDV;

        const datosDelUsuario = await obtenerDatosPersonales(usuarioIDX)
        await campoDeTransaccion("confirmar")
        for (const [dato, valor] of Object.entries(datosDelUsuario)) {
            ok.ok[dato] = valor;
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        await campoDeTransaccion("cancelar")
        if (mutex) {
            mutex.release()
        }
    }
}
