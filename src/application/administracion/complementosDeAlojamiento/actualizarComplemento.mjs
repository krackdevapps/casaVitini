import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";

import { Mutex } from "async-mutex";
import { campoDeTransaccion } from "../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { obtenerComplementoPorComplementoUID } from "../../../infraestructure/repository/complementosDeAlojamiento/obtenerComplementoPorComplementoUID.mjs";
import { validarObjeto } from "../../../shared/complementosDeAlojamiento/validarObjeto.mjs";
import { actualizarComplementoPorComplementoUID } from "../../../infraestructure/repository/complementosDeAlojamiento/actualizarComplementoPorComplementoUID.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerHabitacionesDelApartamentoPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/configuraciones/obtenerHabitacionesDelApartamentoPorApartamentoIDV.mjs";
import { obtenerHabitacionComoEntidadPorHabitacionIDV } from "../../../infraestructure/repository/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs";


export const actualizarComplemento = async (entrada) => {
    const mutex = new Mutex()
    try {


        await mutex.acquire()

        const complementoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.complementoUID,
            nombreCampo: "El identificador universal de complementoUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })

        const complementoControl = await obtenerComplementoPorComplementoUID(complementoUID)
        const estado = complementoControl.estadoIDV;
        if (estado === "activado") {
            const error = "No se puede modificar un complemento activo. Primero desactivalo con el botón de estado.";
            throw new Error(error);
        }

        const oV = await validarObjeto({
            o: entrada.body,
            modo: "actualizar"
        })

        await campoDeTransaccion("iniciar")
        const complemento = await actualizarComplementoPorComplementoUID(oV);
        const apartamentoIDV = complemento.apartamentoIDV
        const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
            apartamentoIDV: apartamentoIDV,
            errorSi: "noExiste"
        })
        const apartamentoUI = apartamento.apartamentoUI
        const habitacionUID = complemento.habitacionUID


        const habitacionesAlojamiento = []
        let habitacionSeleccionada

        const hDA = await obtenerHabitacionesDelApartamentoPorApartamentoIDV(apartamentoIDV)
        for (const h of hDA) {

            const hUID = h.componenteUID
            const hIDV = h.habitacionIDV

            const habitacionUI = (await obtenerHabitacionComoEntidadPorHabitacionIDV({
                habitacionIDV: hIDV,
                errorSi: "noExiste"
            })).habitacionUI
            h.habitacionUI = habitacionUI

            habitacionesAlojamiento.push(h)

            if (habitacionUID === hUID) {
                habitacionSeleccionada = h
            }
        }

        await campoDeTransaccion("confirmar")
        delete complemento.testingVI
        const ok = {
            ok: complemento,
            apartamentoUI,
            configuracionHabitacion: {
                habitacionSeleccionada,
                habitacionesAlojamiento,
            }
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