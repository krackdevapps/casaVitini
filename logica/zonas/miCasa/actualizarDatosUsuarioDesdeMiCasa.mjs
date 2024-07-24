import { actualizarDatos } from "../../repositorio/usuarios/actualizarDatos.mjs";
import { VitiniIDX } from "../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../sistema/validadores/validadoresCompartidos.mjs";

import { campoDeTransaccion } from "../../repositorio/globales/campoDeTransaccion.mjs";
import { desactivarCuenta } from "../../repositorio/usuarios/desactivarCuenta.mjs";
import { obtenerDatosPersonales } from "../../repositorio/usuarios/obtenerDatosPersonales.mjs";

export const actualizarDatosUsuarioDesdeMiCasa = async (entrada) => {

    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.control()

        const usuarioIDX = entrada.session.usuario;
        const datosUsuario = {
            nombre: entrada.body.nombre,
            primerApellido: entrada.body.primerApellido,
            segundoApellido: entrada.body.segundoApellido,
            pasaporte: entrada.body.pasaporte,
            mail: entrada.body.mail,
            telefono: entrada.body.telefono,
            operacion: "actualizar",
            usuario: usuarioIDX,
        }

        validadoresCompartidos.usuarios.datosUsuario(datosUsuario)
        await campoDeTransaccion("iniciar")
        await validadoresCompartidos.usuarios.unicidadCorreo({
            usuario: usuarioIDX,
            mail: datosUsuario.mail,
            operacion: "actualizar"
        })
        const datosAnteriores = await obtenerDatosPersonales(usuarioIDX)
        const usurarioActualizado = await actualizarDatos(datosUsuario)
        const mailAntiguo = datosAnteriores.mail
        const mailNuevo = usurarioActualizado.mail

        if (mailAntiguo !== mailNuevo) {
            await desactivarCuenta({
                usuario: usuarioIDX
            })
        }
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualiza correctamente los datos del usuario",
            datosActualizados: usurarioActualizado
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}
