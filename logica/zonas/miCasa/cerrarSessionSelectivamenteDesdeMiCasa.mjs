import { conexion } from "../../componentes/db.mjs";
import { VitiniIDX } from "../../sistema/VitiniIDX/control.mjs";

export const cerrarSessionSelectivamenteDesdeMiCasa = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        if (IDX.control()) return

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
            const cerrarSessionSelectivamente = `
                    DELETE FROM sessiones
                    WHERE sid = $1 AND sess->> 'usuario' = $2;
                    `;
            const resuelveCerrarSessionSelectivamente = await conexion.query(cerrarSessionSelectivamente, [sessionIDX, usuarioIDX]);
            if (resuelveCerrarSessionSelectivamente.rowCount === 0) {
                const error = "No existe la session que intentas cerrar";
                throw new Error(error);
            }
            if (resuelveCerrarSessionSelectivamente.rowCount === 1) {
                const ok = {
                    ok: "Se ha cerrado correctamente la session",
                    sessionAtual: entrada.sessionID
                };
                salida.json(ok);
            }
        }
        if (tipoOperacion === "todasMenosActual") {
            const sessionIDXActual = entrada.sessionID;
            const cerrarSessionTodasMenosActual = `
                    DELETE FROM sessiones
                    WHERE sid != $1 AND sess->> 'usuario' = $2;
                    `;
            const resuelveCerrarSessionTodasMenosActual = await conexion.query(cerrarSessionTodasMenosActual, [sessionIDXActual, usuarioIDX]);
            if (resuelveCerrarSessionTodasMenosActual.rowCount === 0) {
                const error = "No se ha encontrado ninguna sesión a parte de esta que cerrar ";
                throw new Error(error);
            }
            if (resuelveCerrarSessionTodasMenosActual.rowCount > 0) {
                const ok = {
                    ok: "Se ha cerrado correctament el resto de sessiones",
                    sessionAtual: entrada.sessionID
                };
                salida.json(ok);
            }
        }
        // await conexion.query('COMMIT');
    } catch (errorCapturado) {
        // await conexion.query('ROLLBACK');
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}
