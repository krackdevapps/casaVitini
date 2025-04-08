import { actualizarDatos } from "../../infraestructure/repository/usuarios/actualizarDatos.mjs";
;
import { validadoresCompartidos } from "../../shared/validadores/validadoresCompartidos.mjs";
import { campoDeTransaccion } from "../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { desactivarCuenta } from "../../infraestructure/repository/usuarios/desactivarCuenta.mjs";
import { obtenerDatosPersonales } from "../../infraestructure/repository/usuarios/obtenerDatosPersonales.mjs";

export const actualizarDatosUsuarioDesdeMiCasa = async (entrada) => {

    try {
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 6
        })

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
            ok: "Se han actualizado correctamente los datos del usuario.",
            datosActualizados: usurarioActualizado
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}
