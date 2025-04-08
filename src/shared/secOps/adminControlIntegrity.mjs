import { obtenerGruposDelUsuario } from "../../infraestructure/repository/secOps/obtenerGruposDelUsuario.mjs"
import { obtenerUsuariosDelGrupoPorGrupoUID } from "../../infraestructure/repository/secOps/obtenerUsuariosDelGrupoPorGrupoUID.mjs"
import { numeroGlobalGrupoAdministradores } from "./numeroGlobalGrupoAdministradores.mjs"

export const adminControlIntegrity = async (data) => {
    try {
        const adminUID = numeroGlobalGrupoAdministradores()
        const contexto = data.contexto
        if (contexto === "grupos") {
            const grupoUID = data.grupoUID

            if (grupoUID === adminUID) {
                throw new Error("Por questiones de integridad, el grupo Administradores es inmutable")
            }
        } else if (contexto === "cuentas") {
            const usuario = data.usuario
            const gruposDelUsuario = await obtenerGruposDelUsuario(usuario)
            if (gruposDelUsuario.includes(adminUID)) {
                const usuariosDelGrupo = await obtenerUsuariosDelGrupoPorGrupoUID(adminUID)
                if (usuariosDelGrupo.length === 1) {
                    throw new Error("Por questiones de integridad, siempre tiene que existir un usuario administrador")
                }
            }
        } if (contexto === "minimoUnAdministrador") {
            const grupoUID = data.grupoUID
            const usuariosDelGrupo = await obtenerUsuariosDelGrupoPorGrupoUID(adminUID)
            if (usuariosDelGrupo.length === 1 && grupoUID === adminUID) {
                throw new Error("Por questiones de integridad, siempre tiene que existir un usuario administrador")
            }
        }
    } catch (error) {
        throw error
    }

}