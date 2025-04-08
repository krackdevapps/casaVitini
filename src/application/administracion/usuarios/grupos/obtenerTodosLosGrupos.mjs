import { obtenerGrupos } from "../../../../infraestructure/repository/usuarios/grupos/obtenerGrupos.mjs"

export const obtenerTodosLosGrupos = async (entrada) => {
    try {
        const grupos = await obtenerGrupos()
        return {
            ok: "Todos los grupos",
            grupos,
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}