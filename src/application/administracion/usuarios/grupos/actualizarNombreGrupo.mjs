import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { actualizarNombreGrupoPorGrupoUID } from "../../../../infraestructure/repository/usuarios/grupos/actualizarNombreGrupoPorGrupoUID.mjs"
import { adminControlIntegrity } from "../../../../shared/secOps/adminControlIntegrity.mjs"
import { validarGrupoOps } from "../../../../shared/usuarios/grupos/validarGrupoOps.mjs"

export const actualizarNombreGrupo = async (entrada) => {
    try {
        

        const oVal = await validarGrupoOps({
            o: entrada.body,
            filtrosIDV: [
                "grupoUI",
                "grupoUID"
            ]
        })
        await campoDeTransaccion("iniciar")
        const grupoUI = oVal.grupoUI
        const grupoUID = oVal.grupoUID
        await adminControlIntegrity({
            grupoUID,
            contexto: "grupos"
        })

        const grupo = await actualizarNombreGrupoPorGrupoUID({
            grupoUI,
            grupoUID
        })

        await campoDeTransaccion("confirmar")
        return {
            ok: "Se ha actualizar el nombre del nuevo grupo",
            grupoUID: grupo.grupoUID
        }
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}