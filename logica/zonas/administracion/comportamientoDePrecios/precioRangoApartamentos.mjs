import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { precioRangoApartamento } from "../../../sistema/sistemaDePrecios/precioRangoApartamento.mjs";

export const precioRangoApartamentos = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        const fechaEntrada = entrada.body.fechaEntrada;
        const fechaSalida = entrada.body.fechaSalida;
        const apartamentosIDVArreglo = entrada.body.apartamentosIDVArreglo;
        const filtroCadenaSinEspacio = /^[a-z0-9]+$/;
        const filtroFecha = /^(?:(?:31(\/)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/)(?:0?[1,3-9]|1[0-2]))\2|(?:(?:0?[1-9])|(?:1[0-9])|(?:2[0-8]))(\/)(?:0?[1-9]|1[0-2]))\3(?:(?:19|20)[0-9]{2})$/;
        if (!filtroFecha.test(fechaEntrada)) {
            const error = "el formato fecha de inicio no esta correctametne formateado debe ser una cadena asi 00/00/0000";
            throw new Error(error);
        }
        if (!filtroFecha.test(fechaSalida)) {
            const error = "el formato fecha de fin no esta correctametne formateado debe ser una cadena asi 00/00/0000";
            throw new Error(error);
        }
        if (typeof apartamentosIDVArreglo !== 'object' && !Array.isArray(apartamentosIDVArreglo)) {
            const error = "El campo apartamentosIDVArreglo solo admite un arreglo";
            throw new Error(error);
        }
        if (apartamentosIDVArreglo.length === 0) {
            const error = "Anada al menos un apartmentoIDV en el arreglo";
            throw new Error(error);
        }
        for (const apartamentoIDV of apartamentosIDVArreglo) {
            if (!filtroCadenaSinEspacio.test(apartamentoIDV)) {
                const error = "El identificador visual del apartmento, el apartmentoIDV solo puede estar hecho de minuscuals y numeros y nada mas, ni espacios";
                throw new Error(error);
            }
        }
        const metadatos = {
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            apartamentosIDVArreglo: apartamentosIDVArreglo
        };
        const preciosApartamentosResuelos = await precioRangoApartamento(metadatos);
        const ok = {
            ok: preciosApartamentosResuelos
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}