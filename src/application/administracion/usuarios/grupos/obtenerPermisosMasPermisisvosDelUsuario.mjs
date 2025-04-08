import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { obtenerGruposDelUsuario } from "../../../../infraestructure/repository/secOps/obtenerGruposDelUsuario.mjs"
import { obtenerPermisosDeLasVistasPorGrupoUID } from "../../../../infraestructure/repository/secOps/obtenerPermisosDeLasVistasPorGrupoUID.mjs"
import { obtenerTodasLasVistas } from "../../../../infraestructure/repository/secOps/obtenerTodasLasVistas.mjs"
import { numeroGlobalGrupoAdministradores } from "../../../../shared/secOps/numeroGlobalGrupoAdministradores.mjs"

export const obtenerPermisosMasPermisisvosDelUsuario = async (entrada) => {
    try {
        const usuario = entrada.session.usuario
        await campoDeTransaccion("iniciar")

        const gruposDelUsuarios = await obtenerGruposDelUsuario(usuario)

        const permisosMasRestrictivos = {}
        const grupoUIDAdmin = numeroGlobalGrupoAdministradores()
        let adminUser = false
        for (const grupo of gruposDelUsuarios) {
            const grupoUID = grupo.grupoUID
            if (Number(grupoUID) === Number(grupoUIDAdmin)) {
                adminUser = true
                break
            }
            const permisosDeLasVistasDelGrupo = await obtenerPermisosDeLasVistasPorGrupoUID(grupoUID)
            //   

            for (const permisoDeLaVista of permisosDeLasVistasDelGrupo) {


                const vistaUID = permisoDeLaVista.vistaUID
                const permiso = permisoDeLaVista.permiso


                // 
                if (!permisosMasRestrictivos.hasOwnProperty(vistaUID)) {
                    permisosMasRestrictivos[vistaUID] = permiso
                } else if (permisosMasRestrictivos.vistaUID === "permitido") {
                    continue
                } else if (permisosMasRestrictivos.vistaUID === "noPermitido") {
                    permisosMasRestrictivos[vistaUID] = permiso
                }
                if (vistaUID === "3859") {


                }
            }


        }



        const arbolPermisos = {}
        const vistas = await obtenerTodasLasVistas()
        for (const vista of vistas) {
            const vistaUID = vista.vistaUID
            const vistaIDV = vista.vistaIDV
            if (adminUser) {
                arbolPermisos[vistaIDV] = "permitido"
            } else if (!permisosMasRestrictivos.hasOwnProperty(vistaUID)) {
                arbolPermisos[vistaIDV] = "noPermitido"
            } else {
                arbolPermisos[vistaIDV] = permisosMasRestrictivos[vistaUID]
            }
        }
        // 

        await campoDeTransaccion("confirmar")
        return {
            ok: "Permisos de la vista administración",
            arbolPermisos,
            gruposDelUsuarios
        }
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}