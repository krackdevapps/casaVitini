import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";
import { obtenerNombreApartamentoUI } from "../../../../repositorio/arquitectura/obtenerNombreApartamentoUI.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/obtenerConfiguracionPorApartamentoIDV.mjs";
import { insertarConfiguracionApartamento } from "../../../../repositorio/arquitectura/insertarConfiguracionApartamento.mjs";
import { insertarPerfilPrecio } from "../../../../repositorio/precios/insertarPerfilPrecio.mjs";
import { Mutex } from "async-mutex";


export const crearConfiguracionAlojamiento = async (entrada, salida) => {
    const mutex = new Mutex()
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        mutex.acquire()

        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const apartamentoUI = await obtenerNombreApartamentoUI(apartamentoIDV)
        if (!apartamentoUI) {
            const error = "No existe el apartamento como entidad. Primero crea la entidad y luego podras crear la configuiracíon";
            throw new Error(error);
        }
        const configuracionApartamento = await obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)
        if (configuracionApartamento.length > 0) {
            const error = "Ya existe una configuracion para la entidad del apartamento por favor selecciona otro apartamento como entidad";
            throw new Error(error);
        }
        const estadoInicial = "nodisponible";

        const dataInsertarConfiguracionApartamento = {
            apartamentoIDV: apartamentoIDV,
            estadoInicial: estadoInicial
        }
        await insertarConfiguracionApartamento(dataInsertarConfiguracionApartamento).apartamentoIDV
        await insertarPerfilPrecio({
            apartamentoIDV: apartamentoIDV,
            precioInicial: "0.00"
        })
        const ok = {
            ok: "Se ha creado correctament la nuevo configuracion del apartamento",
            apartamentoIDV: apartamentoIDV
        };
        salida.json(ok);

    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
        if (mutex) {
            mutex.acquire()
        }
    }
}