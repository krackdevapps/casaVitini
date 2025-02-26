import { actualizarIDX as aIDX } from "../../infraestructure/repository/usuarios/actualizarIDX.mjs";
import { actualizarUsuarioSessionActiva } from "../../infraestructure/repository/usuarios/actualizarSessionActiva.mjs";

export const actualizarIDX = async (data) => {

    try {
        const actualIDX = data.actualIDX
        const nuevoIDX = data.nuevoIDX

        await aIDX({
            usuarioIDX: actualIDX,
            nuevoIDX: nuevoIDX
        })

        await actualizarUsuarioSessionActiva({
            usuarioIDX: actualIDX,
            nuevoIDX: nuevoIDX
        })

    }
    catch (errorCapturado) {
        throw errorCapturado
    }

}