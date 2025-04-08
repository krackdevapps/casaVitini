
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";
import { eliminarReembolsoPorReembosloUID } from "../../../../../infraestructure/repository/reservas/transacciones/reembolsos/eliminarReembolsoPorReembosloUID.mjs";
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";

export const eliminarReembolsoManual = async (entrada, salida) => {
    try {


        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })

        const palabra = validadoresCompartidos.tipos.cadena({
            string: entrada.body.palabra,
            nombreCampo: "El campo de la palabra",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        if (palabra !== "eliminar") {
            const error = "Necesario escribir la palabra, eliminar para confirmar la eliminación y evitar falsos clics";
            throw new Error(error);
        }
        const reembolsoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reembolsoUID,
            nombreCampo: "El campo reembolsoUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })
        await campoDeTransaccion("iniciar")
        await eliminarReembolsoPorReembosloUID(reembolsoUID)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha eliminado irreversiblemente el reembolso.",
            reembolsoUID: reembolsoUID
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}