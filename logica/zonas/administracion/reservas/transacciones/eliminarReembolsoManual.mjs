import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";
import { eliminarReembolsoPorReembosloUID } from "../../../../repositorio/reservas/transacciones/eliminarReembolsoPorReembosloUID.mjs";
import { campoDeTransaccion } from "../../../../componentes/campoDeTransaccion.mjs";

export const eliminarReembolsoManual = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const palabra = validadoresCompartidos.tipos.cadena({
            string: entrada.body.palabra,
            nombreCampo: "El campo de la palabra",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        if (palabra !== "eliminar") {
            const error = "Necesario escribir la la palabra eliminar para confirmar la eliminación y evitar falsos clicks";
            throw new Error(error);
        }
        const reembolsoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reembolsoUID,
            nombreCampo: "El campo reembolsoUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        await campoDeTransaccion("iniciar")
        await eliminarReembolsoPorReembosloUID(reembolsoUID)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha eliminado irreversiblemente el el reembolso",
            reembolsoUID: reembolsoUID
        };
        salida.json(ok);
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}