import { administracionJS } from "../../../componentes/administracionJS.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";

export const administracionUI = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const codigoJS = administracionJS();
        console.log(codigoJS)
        const ok = {
            ok: codigoJS
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}