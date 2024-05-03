import { detallesReserva as detallesReserva_ } from "../../../sistema/sistemaDeReservas/detallesReserva.mjs";

export const detallesReserva = async (entrada, salida) => {
    try {
        const reservaUID = entrada.body.reserva;
        const solo = entrada.body.solo;
        if (!reservaUID) {
            const error = "Se necesita un id de 'reserva'";
            throw new Error(error);
        }
        if (typeof reservaUID !== "number" || !Number.isInteger(reservaUID) || reservaUID <= 0) {
            const error = "Se ha definico correctamente  la clave 'reserva' pero el valor de esta debe de ser un numero positivo, si has escrito un numero positivo, revisa que en el objeto no este numero no este envuelvo entre comillas";
            throw new Error(error);
        }
        if (solo) {
            if (solo !== "detallesAlojamiento" &&
                solo !== "desgloseTotal" &&
                solo !== "informacionGlobal" &&
                solo !== "globalYFinanciera" &&
                solo !== "pernoctantes") {
                const error = "el campo 'zona' solo puede ser detallesAlojamiento, desgloseTotal, informacionGlobal o pernoctantes.";
                throw new Error(error);
            }
        }
        const metadatos = {
            reservaUID: reservaUID,
            solo: solo
        };
        const resuelveDetallesReserva = await detallesReserva_(metadatos);
        salida.json(resuelveDetallesReserva);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}