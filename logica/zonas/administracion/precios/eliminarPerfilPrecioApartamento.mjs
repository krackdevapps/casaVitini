import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../repositorio/arquitectura/obtenerConfiguracionPorApartamentoIDV.mjs";
import { eliminarPerfilDelPRecio } from "../../../repositorio/precios/eliminarPerfilDelPRecio.mjs";

export const eliminarPerfilPrecioApartamento = async (entrada, salida) => {
    const mutex = new Mutex()

    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        await mutex.acquire();

        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El campo apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const configuracionApartamento = await obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)

        if (configuracionApartamento.estadoConfiguracion === "disponible") {
            const error = "No se puede eliminar un perfil de precio de una configuracion de apartamento mientras esta configuracion esta disponible para su uso. Por favor primero ponga la configuracion en no disponible y luego realiza las modificaciones pertinentes.";
            throw new Error(error);
        }
        await eliminarPerfilDelPRecio(apartamentoIDV)
        const ok = {
            ok: "Se ha eliminado correctamnte el perfil de apartamento"
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}