import { eventosPorApartamneto } from "../../../../sistema/calendarios/capas/eventosPorApartamento.mjs";
import { eliminarBloqueoCaducado } from "../../bloqueos/eliminarBloqueoCaducado.mjs";

export const porApartamento = async (entrada, salida) => {
    try {
        const fecha = entrada.body.fecha;
        const apartamentoIDV = entrada.body.apartamentoIDV;
        const filtroFecha = /^([1-9]|1[0-2])-(\d{1,})$/;
        if (!filtroFecha.test(fecha)) {
            const error = "La fecha no cumple el formato especifico para el calendario. En este caso se espera una cadena con este formado MM-YYYY, si el mes tiene un digio, es un digito, sin el cero delante.";
            throw new Error(error);
        }
        const filtroCadena = /^[a-z0-9]+$/;
        if (!filtroCadena.test(apartamentoIDV) || typeof apartamentoIDV !== "string") {
            const error = "el campo 'apartamentoIDV' solo puede ser una cadena de letras minúsculas y numeros.";
            throw new Error(error);
        }
        await eliminarBloqueoCaducado();
        const metadatosEventos = {
            fecha: fecha,
            apartamentoIDV: apartamentoIDV
        };
        const eventos = await eventosPorApartamneto(metadatosEventos);
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