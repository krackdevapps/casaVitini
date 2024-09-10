import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerIDX } from "../../../repositorio/usuarios/obtenerIDX.mjs";
import { actualizarDatos } from "../../../repositorio/usuarios/actualizarDatos.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";

export const actualizarDatosUsuarioDesdeAdministracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 7
        })

        const usuarioIDX = validadoresCompartidos.tipos.cadena({
            string: entrada.body.usuarioIDX,
            nombreCampo: "El nombre de usuario (VitiniIDX)",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        const nombre = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nombre,
            nombreCampo: "El campo del nombre",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
            soloMayusculas: "si"
        })
        const primerApellido = validadoresCompartidos.tipos.cadena({
            string: entrada.body.primerApellido,
            nombreCampo: "El campo del primer apellido",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
            soloMayusculas: "si"

        })

        const segundoApellido = validadoresCompartidos.tipos.cadena({
            string: entrada.body.segundoApellido,
            nombreCampo: "El campo del segundo apellido",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
            soloMayusculas: "si"

        })

        const pasaporte = validadoresCompartidos.tipos.cadena({
            string: entrada.body.pasaporte,
            nombreCampo: "El campo del pasaporte",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
            limpiezaEspaciosInternos: "si",
            soloMayusculas: "si"

        })

        const mail = validadoresCompartidos.tipos
            .correoElectronico({
                mail: entrada.body.mail,
                nombreCampo: "El campo del mail",
                sePermiteVacio: "si"
            })
        const telefono = validadoresCompartidos.tipos
            .telefono(
                {
                    phone: entrada.body.telefono,
                    nombreCampo: "el campo del telefono",
                    sePermiteVacio: "si"
                })

        const validarDatosUsuario = {
            usuario: usuarioIDX,
            operacion: "actualizar",
            mail: mail
        };
        await validadoresCompartidos.usuarios.unicidadCorreo(validarDatosUsuario);
        await campoDeTransaccion("iniciar")

        // validar existencia de contrasena
        await obtenerIDX(usuarioIDX)

        const datosUsuario = {
            usuario: usuarioIDX,
            mail: mail,
            nombre: nombre,
            primerApellido: primerApellido,
            segundoApellido: segundoApellido,
            pasaporte: pasaporte,
            telefono: telefono,
        }

        await actualizarDatos(datosUsuario)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "El comportamiento se ha actualizado bien junto con los apartamentos dedicados",
            datosActualizados: datosUsuario
        };
        return ok

    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}