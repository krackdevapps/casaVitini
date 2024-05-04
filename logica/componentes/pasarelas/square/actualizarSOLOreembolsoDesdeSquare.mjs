import { conexion } from "../../db.mjs";
import { utilidades } from "../../utilidades.mjs";
import { detallesDelReembolso } from "./detallesDelReembolso.mjs";


export const actualizarSOLOreembolsoDesdeSquare = async (reembolsoUID) => {
    try {
        const validarReembolso = `
        SELECT
            "pagoUID",
            cantidad,
            "plataformaDePago",
            "reembolsoUIDPasarela",
            "estado",
            "fechaCreacion"::text AS "fechaCreacion",
            "fechaActualizacion"::text AS "fechaActualizacion"
        FROM 
            "reservaReembolsos"
        WHERE 
            "reembolsoUID" = $1;`;
        const resuelveValidarReembolso = await conexion.query(validarReembolso, [reembolsoUID]);
        if (resuelveValidarReembolso.rowCount === 0) {
            const error = "No existe ningún reembolso con ese reembolsoUID";
            throw new Error(error);
        }
        const detallesDelReembolso = resuelveValidarReembolso.rows[0];
        const pagoUID = detallesDelReembolso.pagoUID;
        const plataformaDePago = detallesDelReembolso.plataformaDePago;
        if (plataformaDePago !== "pasarela") {
            const error = "El reembolso no es de pasarela";
            throw new Error(error);
        }
        const reembolsoUIDPasarela = detallesDelReembolso.reembolsoUIDPasarela;
        if (!reembolsoUIDPasarela) {
            const error = "El reembolso de pasarela no tiene un idenfiticador de Square";
            throw new Error(error);
        }
        const detallesDelReembolsoOL = await detallesDelReembolso(reembolsoUIDPasarela);
        if (detallesDelReembolsoOL.error) {
            const error = `La pasarela no ha respondido con los detalles del reembolso ${reembolsoUIDPasarela} actualizados, esto son datos de la copia no actualizada en casa vitini`;
            throw new Error(error);
        }
        const estadoReembolso = detallesDelReembolsoOL.status;
        const cantidad = utilidades.deFormatoSquareAFormatoSQL(detallesDelReembolsoOL.amountMoney.amount);
        const creacionUTC = detallesDelReembolsoOL.createdAt;
        const actualizacionUTC = detallesDelReembolsoOL.updatedAt;
        const actualizarReembolsoPasarela = `
                    UPDATE
                        "reservaReembolsos"
                    SET 
                        cantidad = $1,
                        "plataformaDePago" = $2,
                        estado = $3,
                        "fechaCreacion" = $4,
                        "fechaActualizacion" = $5
                    WHERE 
                    "reembolsoUID" = $6;
                    `;
        const datosActualizarReembolso = [
            cantidad,
            plataformaDePago,
            estadoReembolso,
            creacionUTC,
            actualizacionUTC,
            reembolsoUID,
        ];
        await conexion.query(actualizarReembolsoPasarela, datosActualizarReembolso);
        const ok = {
            ok: "Se ha actualziad correctamente los datos del reembolso en la pasarela"
        };
        return ok;
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        return error;
    }
}