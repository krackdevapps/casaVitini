import { eliminarSessionPorUsuarioPorSessionIDX } from "../../repositorio/sessiones/eliminarSessionPorUsuarioPorSessionIDX.mjs";
import { eliminarTodasLasSessionesMenosPorUsuario } from "../../repositorio/sessiones/eliminarTodasLasSessionesMenosPorUsuario.mjs";
import { VitiniIDX } from "../../sistema/VitiniIDX/control.mjs";


export const cerrarSessionSelectivamenteDesdeMiCasa = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.control()

        const usuarioIDX = entrada.session.usuario;
        const tipoOperacion = entrada.body.tipoOperacion;
        if (tipoOperacion !== "cerrarUna" && tipoOperacion !== "todasMenosActual") {
            const error = "El campo tipoOperacion necesita especificar si es cerrarUna o todasMenosUna";
            throw new Error(error);
        }
        if (tipoOperacion === "cerrarUna") {
            const sessionIDX = entrada.body.sessionIDX;
            const filtroSessionIDX = /^[a-zA-Z0-9_-]+$/;
            if (!sessionIDX || !filtroSessionIDX.test(sessionIDX)) {
                const error = "El campo sessionIDX solo admite minúsculas, mayúsculas, numeros y nada mas";
                throw new Error(error);
            }

            await eliminarSessionPorUsuarioPorSessionIDX({
                sessionIDX: sessionIDX,
                usuarioIDX: usuarioIDX
            })

            const ok = {
                ok: "Se ha cerrado correctamente la session",
                sessionAtual: entrada.sessionID
            };
            return ok

        }
        if (tipoOperacion === "todasMenosActual") {
            const sessionIDXActual = entrada.sessionID;
            await eliminarTodasLasSessionesMenosPorUsuario({
                sessionIDXActual: sessionIDXActual,
                usuarioIDX: usuarioIDX
            })
            const ok = {
                ok: "Se ha cerrado correctament el resto de sessiones",
                sessionAtual: entrada.sessionID
            };
            return ok
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
