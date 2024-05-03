import { DateTime } from "luxon";
import { conexion } from "../../../componentes/db.mjs";
import { controlCaducidadEnlacesDePago } from "../../../sistema/controlCaducidadEnlacesDePago.mjs";

export const modificarEnlace = async (entrada, salida) => {
    try {
        const enlaceUID = entrada.body.enlaceUID;
        const nombreEnlace = entrada.body.nombreEnlace;
        const cantidad = entrada.body.cantidad;
        let horasCaducidad = entrada.body.horasCaducidad;
        const descripcion = entrada.body.descripcion;
        const filtroCadena = /^[0-9]+$/;
        if (!enlaceUID || !filtroCadena.test(enlaceUID)) {
            const error = "el campo 'enlaceUID' solo puede ser una cadena de numeros.";
            throw new Error(error);
        }
        const filtroTextoSimple = /^[a-zA-Z0-9\s]+$/;
        if (!nombreEnlace || !filtroTextoSimple.test(nombreEnlace)) {
            const error = "el campo 'nombreEnlace' solo puede ser una cadena de letras minúsculas y numeros sin espacios.";
            throw new Error(error);
        }
        if (descripcion) {
            if (!filtroTextoSimple.test(descripcion)) {
                const error = "el campo 'descripcion' solo puede ser una cadena de letras, numeros y espacios.";
                throw new Error(error);
            }
        }
        if (horasCaducidad) {
            if (!filtroCadena.test(horasCaducidad)) {
                const error = "el campo cantidad solo puede ser una cadena de numeros con dos decimales separados por punto, ejemplo 10.00.";
                throw new Error(error);
            }
        } else {
            horasCaducidad = 72;
        }
        if (!cantidad || !filtroDecimales.test(cantidad)) {
            const error = "el campo cantidad solo puede ser una cadena de numeros con dos decimales separados por punto, ejemplo 10.00.";
            throw new Error(error);
        }
        await controlCaducidadEnlacesDePago();
        const validarEnlaceUID = await conexion.query(`SELECT reserva FROM "enlacesDePago" WHERE "enlaceUID" = $1`, [enlaceUID]);
        if (validarEnlaceUID.rowCount === 0) {
            const error = "No existe el enlace de pago verifica el enlaceUID";
            throw new Error(error);
        }
        const fechaDeCaducidad = new Date(fechaActual.getTime() + (horasCaducidad * 60 * 60 * 1000));
        const actualizarEnlace = `
                            UPDATE "enlacesDePago"
                            SET 
                            "nombreEnlace" = $1,
                            descripcion = $2,
                            cantidad = $3,
                            caducidad = $4
                            WHERE reserva = $5;
                            `;
        const datosParaActualizar = [
            nombreEnlace,
            descripcion,
            cantidad,
            fechaDeCaducidad
        ];
        const resuelveActualizarEnlace = await conexion.query(actualizarEnlace, datosParaActualizar);
        if (resuelveActualizarEnlace.rowCount === 0) {
            const error = "No se ha podido actualizar los datos del enlace, reintentalo.";
            throw new Error(error);
        }
        if (resuelveActualizarEnlace.rowCount === 1) {
            const ok = {
                "ok": "Se ha actualizado corratmente los datos del enlace"
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}