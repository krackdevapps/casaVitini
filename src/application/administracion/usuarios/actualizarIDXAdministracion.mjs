import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { actualizarUsuarioSessionActiva } from "../../../infraestructure/repository/usuarios/actualizarSessionActiva.mjs";
import { eliminarUsuarioPorRolPorEstadoVerificacion } from "../../../infraestructure/repository/usuarios/eliminarUsuarioPorRolPorEstadoVerificacion.mjs";
import { campoDeTransaccion } from "../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { actualizarIDX } from "../../../infraestructure/repository/usuarios/actualizarIDX.mjs";
import { usuariosLimite } from "../../../shared/usuarios/usuariosLimite.mjs";
import { obtenerUsuario } from "../../../infraestructure/repository/usuarios/obtenerUsuario.mjs";
import { validadorIDX } from "../../../shared/VitiniIDX/validadorIDX.mjs";
import { controlRol } from "../../../shared/usuarios/controlRol.mjs";

export const actualizarIDXAdministracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })

        const usuarioIDX = validadoresCompartidos.tipos.cadena({
            string: entrada.body.usuarioIDX,
            nombreCampo: "El usuarioIDX",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        const nuevoIDX = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nuevoIDX,
            nombreCampo: "El nombre nuevoIDX",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        await controlRol({
            usuarioOperacion: IDX.vitiniIDX(),
            usuarioDestino: usuarioIDX
        })
        await eliminarUsuarioPorRolPorEstadoVerificacion();
        usuariosLimite(nuevoIDX)
        await obtenerUsuario({
            usuario: nuevoIDX,
            errorSi: "existe"
        })

        await validadorIDX(nuevoIDX)

        await campoDeTransaccion("iniciar")
        await actualizarIDX({
            usuarioIDX: usuarioIDX,
            nuevoIDX: nuevoIDX
        })
        await actualizarUsuarioSessionActiva({
            usuarioIDX: usuarioIDX,
            nuevoIDX: nuevoIDX
        })
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado el IDX correctamente",
            usuarioIDX: nuevoIDX
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}