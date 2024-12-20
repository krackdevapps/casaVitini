import { actualizarReembolsoPorReembolsoUID } from "../../../infraestructure/repository/reservas/transacciones/actualizarReembolsoPorReembolsoUID.mjs";
import { obtenerReembolsoPorReembolsoUID } from "../../../infraestructure/repository/reservas/transacciones/obtenerReembolsoPorReembolsoUID.mjs";
import { utilidades } from "../../utilidades.mjs";
import { detallesDelReembolso } from "./detallesDelReembolso.mjs";

export const actualizarSOLOreembolsoDesdeSquare = async (reembolsoUID) => {
    const reembolso = await obtenerReembolsoPorReembolsoUID(reembolsoUID)
    const plataformaDePagoIDV = reembolso.plataformaDePagoIDV;
    if (plataformaDePagoIDV !== "pasarela") {
        const error = "El reembolso no es de pasarela";
        throw new Error(error);
    }
    const reembolsoUIDPasarela = reembolso.reembolsoUIDPasarela;
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

    await actualizarReembolsoPorReembolsoUID({
        reembolsoUID: reembolsoUID,
        cantidad: cantidad,
        plataformaDePagoIDV: plataformaDePagoIDV,
        estadoReembolso: estadoReembolso,
        fechaCreacion: creacionUTC,
        fechaActualizacion: actualizacionUTC,
    })
    const ok = {
        ok: "Se han actualizado correctamente los datos del reembolso en la pasarela."
    };
    return ok;
}