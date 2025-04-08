import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { actualizarPermisosControladorPorPermisoUID } from "../../../../infraestructure/repository/usuarios/grupos/actualizarPermisosControladorPorPermisoUID.mjs"
import { obtenerGrupoPorPermisoUIDControlador } from "../../../../infraestructure/repository/usuarios/grupos/obtenerGrupoPorPermisoUIDControlador.mjs"
import { adminControlIntegrity } from "../../../../shared/secOps/adminControlIntegrity.mjs"
import { validarGrupoOps } from "../../../../shared/usuarios/grupos/validarGrupoOps.mjs"

export const actualizarPermisoControladorDelGrupo = async (entrada) => {
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

        const permiso = await obtenerGrupoPorPermisoUIDControlador(permisoUID)

        const grupoUID = permiso.grupoUID
        await adminControlIntegrity({
            grupoUID,
            contexto: "grupos"
        })

        const permisoActualizado = await actualizarPermisosControladorPorPermisoUID({
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