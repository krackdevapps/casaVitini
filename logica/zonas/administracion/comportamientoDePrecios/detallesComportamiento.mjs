import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerComportamientoDePrecioPorComportamientoUID } from "../../../repositorio/comportamientoDePrecios/obtenerComportamientoDePrecioPorComportamientoUID.mjs";
import { obtenerApartamentosDelComportamientoDePrecio } from "../../../repositorio/comportamientoDePrecios/obtenerApartamentosDelComportamientoDePrecio.mjs";

export const detallesComportamiento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const comportamientoUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.comportamientoUID,
            nombreCampo: "El identificador universal de la habitación (habitacionUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const detallesComportamiento = await obtenerComportamientoDePrecioPorComportamientoUID(comportamientoUID)
        detallesComportamiento["apartamentos"] = [];

        const apartamentosDelComportamiento = await obtenerApartamentosDelComportamientoDePrecio(comportamientoUID)
        apartamentosDelComportamiento.map((apartamento) => {
            const cantidad = apartamento.cantidad;
            const apartamentoIDV = apartamento.apartamentoIDV;
            const comportamientoUID = apartamento.comportamientoUID;
            const simbolo = apartamento.simbolo;
            const apartamentoUI = apartamento.apartamentoUI;
            const detallesApartamentoDedicado = {
                apartamentoIDV: apartamentoIDV,
                apartamentoUI: apartamentoUI,
                cantidad: cantidad,
                comportamientoUID: comportamientoUID,
                simbolo: simbolo
            };
            detallesComportamiento["apartamentos"].push(detallesApartamentoDedicado);
        });

        const ok = {
            ok: detallesComportamiento
        };
        salida.json(ok);

    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}