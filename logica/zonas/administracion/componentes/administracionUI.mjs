import { administracionJS } from "../../../componentes/administracionJS.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";

export const administracionUI = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const codigoJS = administracionJS();
        const ok = {
            ok: codigoJS
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}