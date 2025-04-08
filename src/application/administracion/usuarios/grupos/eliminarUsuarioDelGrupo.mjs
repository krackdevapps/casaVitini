import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { eliminarUsuarioDelGrupoPorGrupoUIDPorUsuario } from "../../../../infraestructure/repository/usuarios/grupos/eliminarUsuarioDelGrupoPorGrupoUIDPorUsuario.mjs"
import { adminControlIntegrity } from "../../../../shared/secOps/adminControlIntegrity.mjs"
import { validarGrupoOps } from "../../../../shared/usuarios/grupos/validarGrupoOps.mjs"

export const eliminarUsuarioDelGrupo = async (entrada) => {
    try {
        const oVal = await validarGrupoOps({
            o: entrada.body,
            filtrosIDV: [
                "grupoUID",
                "usuario"
            ]
        })

        await campoDeTransaccion("iniciar")
        // Debe haber un usuario minimo administrador en el grupo
        const grupoUID = oVal.grupoUID
        const usuario = oVal.usuario
        await adminControlIntegrity({
            contexto: "minimoUnAdministrador",
            grupoUID
        })


        const usuarioElimiando = await eliminarUsuarioDelGrupoPorGrupoUIDPorUsuario({
            grupoUID,
            usuario
        })

        await campoDeTransaccion("confirmar")
        return {
            ok: "Se ha eliminado el usuario del grupo",
            usuarioElimiando
        }
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}