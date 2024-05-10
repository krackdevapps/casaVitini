import { conexion } from "../../db.mjs";
export const actualizarReembolsosDelPagoDesdeSquare = async (pagoUID, pagoUIDPasarela) => {
    try {
        const plataformaDePago = "pasarela";
        const detallesDelPagoSquare = await componentes.pasarela.detallesDelPago(pagoUIDPasarela);
        if (detallesDelPagoSquare.error) {
            const error = `La pasarela no ha respondido con los detalles del pago actualizados al requerir ${pagoUIDPasarela} a la pasarela, esto son datos de la copia no actualizada en casa vitini`;
            throw new Error(error);
        }
        const identificadoresRembolsosDeEstaTransacion = detallesDelPagoSquare?.refundIds;
        for (const reembolsoUID of identificadoresRembolsosDeEstaTransacion) {
            const detallesDelReembolsoOL = await componentes.pasarela.detallesDelReembolso(reembolsoUID);
            if (detallesDelReembolsoOL.error) {
                const error = `La pasarela no ha respondido con los detalles del reembolso ${reembolsoUID} actualizados, esto son datos de la copia no actualizada en casa vitini`;
                throw new Error(error);
            }
            const estadoReembolso = detallesDelReembolsoOL.status;
            const cantidad = utilidades.deFormatoSquareAFormatoSQL(detallesDelReembolsoOL.amountMoney.amount);
            const creacionUTC = detallesDelReembolsoOL.createdAt;
            const actualizacionUTC = detallesDelReembolsoOL.updatedAt;
            const validarExistenciaReembolsoPasarela = `
                SELECT
                    "reembolsoUID"
                FROM 
                    "reservaReembolsos"
                WHERE 
                    "pagoUID" = $1 AND "reembolsoUIDPasarela" = $2;`;
            const resuelveValidarExistenciaReembolsoPasarela = await conexion.query(validarExistenciaReembolsoPasarela, [pagoUID, reembolsoUID]);
            if (resuelveValidarExistenciaReembolsoPasarela.rowCount === 0) {
                const insertarReembolso = `
                    INSERT INTO
                        "reservaReembolsos"
                        (
                        "pagoUID",
                        cantidad,
                        "plataformaDePago",
                        "reembolsoUIDPasarela",
                        estado,
                        "fechaCreacion",
                        "fechaActualizacion"
                        )
                    VALUES 
                        ($1,$2,$3,$4,$5,$6,$7)
                    `;
                const datosNuevoReembolso = [
                    pagoUID,
                    cantidad,
                    plataformaDePago,
                    reembolsoUID,
                    estadoReembolso,
                    creacionUTC,
                    actualizacionUTC,
                ];
                await conexion.query(insertarReembolso, datosNuevoReembolso);
            }
            if (resuelveValidarExistenciaReembolsoPasarela.rowCount === 1) {
                const actualizarReembolsoPasarela = `
                    UPDATE
                        "reservaReembolsos"
                    SET 
                        cantidad = $1,
                        "plataformaDePago" = $2,
                        estado = $3,
                        "fechaCreacion" = $4,
                        "fechaActualizacion" =
                    WHERE 
                    "pagoUID" = $6 AND "reembolsoUIDPasarela" = $7;
                    `;
                const datosActualizarReembolso = [
                    cantidad,
                    plataformaDePago,
                    estadoReembolso,
                    creacionUTC,
                    actualizacionUTC,
                    pagoUID,
                    reembolsoUID,
                ];
                await conexion.query(actualizarReembolsoPasarela, datosActualizarReembolso);
            }
        }
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        }
        return error;
    }
}