import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { configuracionApartamento as configuracionApartamento_ } from "../../../sistema/configuracionApartamento.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";


export const configuracionApartamento = async (entrada) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const apartamentos = validadoresCompartidos.tipos.array({
            array: entrada.body.apartamentos,
            nombreCampo: "El array de apartamentos",
            filtro: "soloCadenasIDV",
            sePermitenDuplicados: "no"
        })
        const transactor = await configuracionApartamento_(apartamentos);
        return transactor
    } catch (errorCapturado) {
        throw errorCapturado
    }
}