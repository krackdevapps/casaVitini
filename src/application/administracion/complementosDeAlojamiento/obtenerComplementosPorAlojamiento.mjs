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

        const filtro = validadoresCompartidos.tipos.cadena({
            string: entrada.body.filtro,
            nombreCampo: "El filtro",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const complementosPorApartamentoIDV = await obtenerComplementosPorApartamentoIDV(apartamentoIDV)

        const complementosDeAlojamiento = []
        if (filtro === "soloActivos") {
            const complementosActivos = complementosPorApartamentoIDV.filter(c => c.estadoIDV === "activado")
            complementosDeAlojamiento.push(...complementosActivos)
        } else if (filtro === "todos") {
            complementosDeAlojamiento.push(...complementosPorApartamentoIDV)
        } else {
            const m = "El campo filtroIDV solo espera soloActivso o todos"
            throw new Error(m)
        }

        const ok = {
            ok: "Aquí tienes los complementos",
            apartamentoIDV,
            complementosPorApartamentoIDV: complementosDeAlojamiento
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}