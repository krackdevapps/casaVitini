import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";

export const listaComportamientosPrecios = async (entrada, salida) => {

    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const listaComportamientoPrecios = `
                            SELECT
                            "nombreComportamiento",
                            uid,
                            to_char("fechaInicio", 'DD/MM/YYYY') as "fechaInicio", 
                            to_char("fechaFinal", 'DD/MM/YYYY') as "fechaFinal",
                            explicacion,
                            estado,
                            tipo,
                            "diasArray"
                            FROM 
                            "comportamientoPrecios"
                            ORDER BY 
                            "fechaInicio" ASC;
                            `;
        const resuelveListaComportamientoPrecios = await conexion.query(listaComportamientoPrecios);
        const ok = {};
        if (resuelveListaComportamientoPrecios.rowCount === 0) {
            ok.ok = "No hay comportamiento de precios configurados";
            salida.json(ok);
        }
        if (resuelveListaComportamientoPrecios.rowCount > 0) {

            const listaComportamientos = resuelveListaComportamientoPrecios.rows;
            ok.ok = listaComportamientos;
            salida.json(ok);
        }
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}