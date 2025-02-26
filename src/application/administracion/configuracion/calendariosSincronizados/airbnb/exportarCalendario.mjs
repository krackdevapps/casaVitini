import { obtenerCalendarioPorCalendarioUID } from "../../../../../infraestructure/repository/calendario/obtenerCalendarioPorCalendarioUID.mjs";
import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";

export const exportarCalendario = async (entrada) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.control()

        const m = "metodo obsoleto"
        throw new Error(m)
        return

        const calendarioUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.calendarioUID,
            nombreCampo: "El campo calendarioUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        await obtenerCalendarioPorCalendarioUID(calendarioUID)




    } catch (errorCapturado) {
        throw errorCapturado
    }

}