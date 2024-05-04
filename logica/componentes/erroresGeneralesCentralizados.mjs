import { mensajesUI } from "./mensajesUI.mjs";
export const erroresGeneralesCentralizados = (mensajeError) => {
    const errorFinal = {};
    if (mensajeError.code === "ECONNREFUSED" ||
        mensajeError.code === "ENOTFOUND" ||
        mensajeError.message === "Connection terminated due to connection timeout") {
        errorFinal.codigo = "mantenimiento";
        errorFinal.error = mensajesUI.errorConexionRechazadaInternaBaseDeDatos;
    }
    return errorFinal;
}