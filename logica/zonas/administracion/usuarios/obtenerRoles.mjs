import { obtenerTodosLosRoles } from "../../../repositorio/usuarios/obtenerTodosLosRoles.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";


export const obtenerRoles = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const roles = await obtenerTodosLosRoles()
        const ok = {
            ok: roles
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}