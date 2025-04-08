import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { insertarUsuarioEnGrupoPorGrupoUID } from "../../../../infraestructure/repository/usuarios/grupos/insertarUsuarioEnGrupoPorGrupoUID.mjs"
import { obtenerUsuarioDelGrupo } from "../../../../infraestructure/repository/usuarios/grupos/obtenerUsuarioDelGrupo.mjs"
import { obtenerUsuario } from "../../../../infraestructure/repository/usuarios/obtenerUsuario.mjs"
import { validarGrupoOps } from "../../../../shared/usuarios/grupos/validarGrupoOps.mjs"

export const insertarUsuarioEnGrupo = async (entrada) => {
    try {

        
        const oVal = await validarGrupoOps({
            o: entrada.body,
            filtrosIDV: [
                "grupoUID",
                "usuario"
            ]
        })

        await campoDeTransaccion("iniciar")
        const grupoUID = oVal.grupoUID
        const usuario = oVal.usuario

        // Que se compruiebe uqe existe la cuenta de usuario
        await obtenerUsuario({
            usuario,
            errorSi: "noExiste"
        })

        const usuarioEnElGrupo = await obtenerUsuarioDelGrupo({
            usuario,
            grupoUID
        })

        if (usuarioEnElGrupo) {
            throw new Error("El usuario ya está en el grupo")
        }
        const nuevoUsuarioEnElGrupo = await insertarUsuarioEnGrupoPorGrupoUID({
            grupoUID,
            usuario
        })

        await campoDeTransaccion("confirmar")
        return {
            ok: "Se ha insetar el usuario en el grupo",
            usuario: nuevoUsuarioEnElGrupo
        }
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}