import { actualizarDatos } from "../../repositorio/usuarios/actualizarDatos.mjs";
import { VitiniIDX } from "../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../sistema/validadores/validadoresCompartidos.mjs";

import { campoDeTransaccion } from "../../repositorio/globales/campoDeTransaccion.mjs";

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

        const usuraioActualziad = await actualizarDatos(datosUsuario)

        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualiza correctamente los datos del usuario",
            datosActualizados: usuraioActualziad
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}
