import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs";
import { eventosPorApartamentoAirbnb } from "../../../../../sistema/calendarios/capas/calendariosSincronizados/airbnb/eventosPorApartamentoAirbnb.mjs";


export const airbnb = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        const fecha = entrada.body.fecha;
        const calendarioUID = entrada.body.calendarioUID;
        const filtroFecha = /^([1-9]|1[0-2])-(\d{1,})$/;
        if (!filtroFecha.test(fecha)) {
            const error = "La fecha no cumple el formato especifico para el calendario. En este caso se espera una cadena con este formado MM-YYYY, si el mes tiene un digio, es un digito, sin el cero delante.";
            throw new Error(error);
        }
        const filtroCadena = /^[0-9]+$/;
        if (!filtroCadena.test(calendarioUID) || typeof calendarioUID !== "string") {
            const error = "el campo 'calendarioUID' solo puede ser una cadena de letras minúsculas y numeros.";
            throw new Error(error);
        }
        const metadatosEventos = {
            fecha: fecha,
            calendarioUID: calendarioUID
        };
        const eventos = await eventosPorApartamentoAirbnb(metadatosEventos);
        const ok = {
            ok: "Aqui tienes las reservas de este mes",
            ...eventos
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        return salida.json(error);
    }
}