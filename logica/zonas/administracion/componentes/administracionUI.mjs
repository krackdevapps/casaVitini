import { administracionJS } from "../../../componentes/administracionJS.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";

export const administracionUI = async (entrada, salida) => {
    try {
        
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        const codigoJS = administracionJS();
        const ok = {
            ok: codigoJS
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}