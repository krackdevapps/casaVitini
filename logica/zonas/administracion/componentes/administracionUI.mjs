import { administracionJS } from "../../../componentes/administracionJS.mjs";
export const administracionUI = async (entrada, salida) => {
    try {
        
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