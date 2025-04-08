import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { eliminarGrupoPorGrupoUID } from "../../../../infraestructure/repository/usuarios/grupos/eliminarGrupoPorGrupoUID.mjs"
import { adminControlIntegrity } from "../../../../shared/secOps/adminControlIntegrity.mjs"
import { validarGrupoOps } from "../../../../shared/usuarios/grupos/validarGrupoOps.mjs"

export const eliminarGrupo = async (entrada) => {
    try {
        

        const oVal = await validarGrupoOps({
            o: entrada.body,
            filtrosIDV: [
                "grupoUID",
            ]
        })
        await campoDeTransaccion("iniciar")
        const grupoUID = oVal.grupoUID
        await adminControlIntegrity({
            grupoUID,
            contexto: "grupos"
        })

        const nuevoGrupo = await eliminarGrupoPorGrupoUID(grupoUID)

        await campoDeTransaccion("confirmar")
        return {
            ok: "Se ha creado el nuevo grupo",
            grupoUID: nuevoGrupo.grupoUID
        }
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}