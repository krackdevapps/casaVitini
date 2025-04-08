import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { insertarNuevoGrupo } from "../../../../infraestructure/repository/usuarios/grupos/insertarNuevoGrupo.mjs"
import { validarGrupoOps } from "../../../../shared/usuarios/grupos/validarGrupoOps.mjs"

export const crearNuevoGrupo = async (entrada) => {
    try {


        const oVal = await validarGrupoOps({
            o: entrada.body,
            filtrosIDV: [
                "grupoUI",
            ]
        })
        await campoDeTransaccion("iniciar")
        const grupoUI = oVal.grupoUI
        const testingVI = process.env.TESTINGVI
        const grupo = {
            grupoUI
        }
        if (testingVI) {
            grupo.testingVI = testingVI
        }

        const nuevoGrupo = await insertarNuevoGrupo(grupo)

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