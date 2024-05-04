import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { configuracionApartamento as configuracionApartamento_ } from "../../../sistema/configuracionApartamento.mjs";

export const configuracionApartamento = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        const apartamentos = entrada.body.apartamentos;
        const transactor = await configuracionApartamento_(apartamentos);
        salida.json(transactor);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}