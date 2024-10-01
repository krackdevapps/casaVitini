import { eliminarSessionPorUsuarioPorSessionIDX } from "../../infraestructure/repository/sessiones/eliminarSessionPorUsuarioPorSessionIDX.mjs";
import { eliminarTodasLasSessionesMenosPorUsuario } from "../../infraestructure/repository/sessiones/eliminarTodasLasSessionesMenosPorUsuario.mjs";
import { validadoresCompartidos } from "../../shared/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../shared/VitiniIDX/control.mjs";


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
        } else if (tipoOperacion === "cerrarUna") {

            validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
                objeto: entrada.body,
                numeroDeLLavesMaximo: 2
            })
            const sessionIDX = entrada.body.sessionIDX;
            const filtroSessionIDX = /^[a-zA-Z0-9_-]+$/;
            if (!sessionIDX || !filtroSessionIDX.test(sessionIDX)) {
                const error = "El campo sessionIDX solo admite minúsculas, mayúsculas, números y nada más";
                throw new Error(error);
            }

            await eliminarSessionPorUsuarioPorSessionIDX({
                sessionIDX: sessionIDX,
                usuarioIDX: usuarioIDX
            })

            const ok = {
                ok: "Se ha cerrado correctamente la sesión",
                sessionAtual: entrada.sessionID
            };
            return ok

        } else if (tipoOperacion === "todasMenosActual") {
            validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
                objeto: entrada.body,
                numeroDeLLavesMaximo: 1
            })
            const sessionIDXActual = entrada.sessionID;
            await eliminarTodasLasSessionesMenosPorUsuario({
                sessionIDX: sessionIDXActual,
                usuarioIDX: usuarioIDX
            })
            const ok = {
                ok: "Se ha cerrado correctamente el resto de sesiones",
                sessionAtual: entrada.sessionID
            };
            return ok
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
