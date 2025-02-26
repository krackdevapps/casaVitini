import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { insertarHabitacionEnApartamento } from "../../../../infraestructure/repository/arquitectura/configuraciones/insertarHabitacionEnApartamento.mjs";
import { obtenerHabitacionComoEntidadPorHabitacionIDV } from "../../../../infraestructure/repository/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerHabitacionDelApartamentoPorHabitacionIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerHabitacionDelApartamentoPorHabitacionIDV.mjs";

export const addHabitacionToConfiguracionApartamento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })
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