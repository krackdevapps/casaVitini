import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { actualizarPermisosVistaPorPermisoUID } from "../../../../infraestructure/repository/usuarios/grupos/actualizarPermisosVistaPorPermisoUID.mjs"
import { obtenerGrupoPorPermisoUIDVista } from "../../../../infraestructure/repository/usuarios/grupos/obtenerGrupoPorPermisoUIDVista.mjs"
import { adminControlIntegrity } from "../../../../shared/secOps/adminControlIntegrity.mjs"
import { validarGrupoOps } from "../../../../shared/usuarios/grupos/validarGrupoOps.mjs"

export const actualizarPermisoVistaDelGrupo = async (entrada) => {
    try {
        

        const oVal = await validarGrupoOps({
            o: entrada.body,
            filtrosIDV: [
                "permisoUID",
                "permisoIDV"
            ]
        })
        await campoDeTransaccion("iniciar")
        const permisoUID = oVal.permisoUID
        const permisoIDV = oVal.permisoIDV

        const permiso = await obtenerGrupoPorPermisoUIDVista(permisoUID)

        const grupoUID = permiso.grupoUID
        await adminControlIntegrity({
            grupoUID,
            contexto: "grupos"
        })


        const permisoActualizado = await actualizarPermisosVistaPorPermisoUID({
            permisoUID,
            permisoIDV
        })

        await campoDeTransaccion("confirmar")
        return {
            ok: "Se ha actualizado el permiso en el grupo",
            permisoActualizado
        }
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}