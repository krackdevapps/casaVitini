import { obtenerComplementosPorApartamentoIDV } from "../../../infraestructure/repository/complementosDeAlojamiento/obtenerComplementosPorApartamentoIDV.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";

export const obtenerComplementosPorAlojamiento = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const complementosPorApartamentoIDV = await obtenerComplementosPorApartamentoIDV(apartamentoIDV)
        const ok = {
            ok: "Aquí tienes los complementos",
            apartamentoIDV,
            complementosPorApartamentoIDV
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}