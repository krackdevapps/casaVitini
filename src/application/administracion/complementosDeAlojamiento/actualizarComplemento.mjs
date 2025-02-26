import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { Mutex } from "async-mutex";
import { campoDeTransaccion } from "../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { obtenerComplementoPorComplementoUID } from "../../../infraestructure/repository/complementosDeAlojamiento/obtenerComplementoPorComplementoUID.mjs";
import { validarObjeto } from "../../../shared/complementosDeAlojamiento/validarObjeto.mjs";
import { actualizarComplementoPorComplementoUID } from "../../../infraestructure/repository/complementosDeAlojamiento/actualizarComplementoPorComplementoUID.mjs";

export const actualizarComplemento = async (entrada) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.control()

        await mutex.acquire()

        const complementoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.complementoUID,
            nombreCampo: "El identificador universal de complementoUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no",
            devuelveUnTipoNumber: "si"
        })

        const complemento = await obtenerComplementoPorComplementoUID(complementoUID)
        const estado = complemento.estadoIDV;
        if (estado === "activado") {
            const error = "No se puede modificar un complemento activo. Primero desactivalo con el botón de estado.";
            throw new Error(error);
        }

        await validarObjeto(entrada.body)
        const complementoActualizar = {
            apartamentoIDV: entrada.body.apartamentoIDV,
            complementoUI: entrada.body.complementoUI,
            definicion: entrada.body.definicion,
            tipoPrecio: entrada.body.tipoPrecio,
            precio: entrada.body.precio,
        }
        complementoActualizar.complementoUID = complementoUID
        await campoDeTransaccion("iniciar")
        const complementoActualizado = await actualizarComplementoPorComplementoUID(complementoActualizar);
        await campoDeTransaccion("confirmar")

        delete complementoActualizado.testingVI
        const ok = {
            ok: "El Complemento se ha actualizado bien",
            complementoActualizado
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}