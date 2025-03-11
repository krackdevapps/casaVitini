import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerComplementosPorApartamentoIDV } from "../../../infraestructure/repository/complementosDeAlojamiento/obtenerComplementosPorApartamentoIDV.mjs";
import { acoplarHabitacionesAComplemento } from "../../../shared/complementosDeAlojamiento/acoplarHabitacionesAComplemento.mjs";
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
        const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
            apartamentoIDV: apartamentoIDV,
            errorSi: "noExiste"
        })
        const apartamentoUI = apartamento.apartamentoUI

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
        for (const cPA of complementosPorApartamentoIDV) {

            const apartamentoIDV = cPA.apartamentoIDV
            const habitacionUID = cPA.habitacionUID

            const habitacionesDelComplemento = await acoplarHabitacionesAComplemento({
                habitacionUID,
                apartamentoIDV
            })

            cPA.configuracionHabitacion = habitacionesDelComplemento
        }
        const ok = {
            ok: "Aquí tienes los complementos",
            apartamentoIDV,
            apartamentoUI,
            complementosPorApartamentoIDV: complementosDeAlojamiento
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}