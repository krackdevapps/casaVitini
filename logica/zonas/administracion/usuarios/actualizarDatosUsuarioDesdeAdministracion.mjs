import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerIDX } from "../../../repositorio/usuarios/obtenerIDX.mjs";
import { actualizarDatos } from "../../../repositorio/usuarios/actualizarDatos.mjs";

export const actualizarDatosUsuarioDesdeAdministracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()
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
        })
        const primerApellido = validadoresCompartidos.tipos.cadena({
            string: entrada.body.primerApellido,
            nombreCampo: "El campo del primer apellido",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })

        const segundoApellido = validadoresCompartidos.tipos.cadena({
            string: entrada.body.segundoApellido,
            nombreCampo: "El campo del segundo apellido",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })

        const pasaporte = validadoresCompartidos.tipos.cadena({
            string: entrada.body.pasaporte,
            nombreCampo: "El campo del pasaporte",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
            limpiezaEspaciosInternos: "si"
        })

        const email = validadoresCompartidos.tipos
            .correoElectronico(entrada.body.email)
        const telefono = validadoresCompartidos.tipos
            .telefono(entrada.body.telefono)

        const validarDatosUsuario = {
            usuarioIDX: usuarioIDX,
            pasaporte: pasaporte,
            email: email
        };
        await validadoresCompartidos.usuarios.unicidadPasaporteYCorrreo(validarDatosUsuario);
        await campoDeTransaccion("iniciar")

        // validar existencia de contrasena
        await obtenerIDX(usuarioIDX)

        const datosUsuario = {
            usuario: usuarioIDX,
            email: email,
            nombre: nombre,
            primerApellido: primerApellido,
            segundoApellido: segundoApellido,
            pasaporte: pasaporte,
            telefono: telefono,
        }
        await actualizarDatos(datosUsuario)
        const ok = {
            ok: "El comportamiento se ha actualizado bien junto con los apartamentos dedicados",
            datosActualizados: datosUsuario
        };
        salida.json(ok);

        await campoDeTransaccion("confirmar")
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}