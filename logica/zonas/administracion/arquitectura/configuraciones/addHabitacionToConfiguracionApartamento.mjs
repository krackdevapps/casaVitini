import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { insertarHabitacionEnApartamento } from "../../../../repositorio/arquitectura/configuraciones/insertarHabitacionEnApartamento.mjs";
import { obtenerHabitacionComoEntidadPorHabitacionIDV } from "../../../../repositorio/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerHabitacionDelApartamentoPorHabitacionIDV } from "../../../../repositorio/arquitectura/configuraciones/obtenerHabitacionDelApartamentoPorHabitacionIDV.mjs";

export const addHabitacionToConfiguracionApartamento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()


        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const habitacionIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.habitacionIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const obtenerConfiguracionPorApartamento_ = await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })
        if (obtenerConfiguracionPorApartamento_.estadoConfiguracionIDV === "disponible") {
            const error = "No se puede añadir una habitación cuando el estado de la configuración es Disponible. Cambie el estado a no disponible para realizar añadir una cama.";
            throw new Error(error);
        }
        const apartamentoUI = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })).apartamentoUI
        const habitacionUI = (await obtenerHabitacionComoEntidadPorHabitacionIDV({
            habitacionIDV,
            errorSi: "noExiste"
        })).habitacionUI

        try {
            await obtenerHabitacionDelApartamentoPorHabitacionIDV({
                apartamentoIDV: apartamentoIDV,
                habitacionIDV: habitacionIDV,
                errorSi: "existe"
            })
        } catch (error) {
            const m = `Ya existe la ${habitacionUI} en esta configuración del ${apartamentoUI}`;
            throw new Error(m);
        }


        const dataInsertarHabitacionEnApartamento = {
            apartamentoIDV: apartamentoIDV,
            habitacionIDV: habitacionIDV
        }
        const nuevoHabitacion = await insertarHabitacionEnApartamento(dataInsertarHabitacionEnApartamento)

        const ok = {
            ok: "Se ha insertado correctamente la nueva habitación",
            habitacionUID: nuevoHabitacion.componenteUID,
            habitacionIDV: habitacionIDV,
            habitacionUI: habitacionUI
        };
        return ok


    } catch (errorCapturado) {
        throw errorCapturado
    }

}