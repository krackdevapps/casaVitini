import { obtenerUsuariosUnicosConRevisiones } from "../../../../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/obtenerUsuariosUnicosConRevisiones.mjs";

export const obtenerUsuariosConRevisiones = async () => {
    try {

        const usuariosConRevisiones = await obtenerUsuariosUnicosConRevisiones()
        const ok = {
            ok: "Usuarios con revisiones",
            usuariosConRevisiones
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}