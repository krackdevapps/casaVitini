import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { insertarPerfilPrecio } from "../../../../repositorio/precios/insertarPerfilPrecio.mjs";
import { Mutex } from "async-mutex";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { insertarConfiguracionApartamento } from "../../../../repositorio/arquitectura/configuraciones/insertarConfiguracionApartamento.mjs";

export const crearConfiguracionAlojamiento = async (entrada, salida) => {
    const mutex = new Mutex()
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        mutex.acquire()

        // Esto tiene que ser una transaccion

        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const apartamentoUI = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })).apartamentoUI
        if (!apartamentoUI) {
            const error = "No existe el apartamento como entidad. Primero crea la entidad y luego podras crear la configuiracíon";
            throw new Error(error);
        }
        const configuracionApartamento = await obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)
        if (configuracionApartamento.length > 0) {
            const error = "Ya existe una configuracion para la entidad del apartamento por favor selecciona otro apartamento como entidad";
            throw new Error(error);
        }

        await insertarConfiguracionApartamento({
            apartamentoIDV: apartamentoIDV,
            estadoInicial: "nodisponible",
            zonaIDV: "privada"
        })
        await insertarPerfilPrecio({
            apartamentoIDV: apartamentoIDV,
            precioInicial: "0.00"
        })
        const ok = {
            ok: "Se ha creado correctament la nuevo configuracion del apartamento",
            apartamentoIDV: apartamentoIDV
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.acquire()
        }
    }
}