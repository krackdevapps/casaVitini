import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerPerfilPrecioPorApartamentoUID } from "../../../../infraestructure/repository/precios/obtenerPerfilPrecioPorApartamentoUID.mjs";
import { Mutex } from "async-mutex";
import { obtenerHabitacionComoEntidadPorHabitacionIDV } from "../../../../infraestructure/repository/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs";
import { obtenerHabitacionesDelApartamentoPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerHabitacionesDelApartamentoPorApartamentoIDV.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { obtenerCamasDeLaHabitacionPorHabitacionUID } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerCamasDeLaHabitacionPorHabitacionUID.mjs";
import { actualizarEstadoPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/actualizarEstadoPorApartamentoIDV.mjs";

export const cambiarEstadoConfiguracionAlojamiento = async (entrada) => {
    const mutex = new Mutex()
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })
        mutex.acquire()

        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const nuevoEstado = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nuevoEstado,
            nombreCampo: "El nuevoEstado",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })


        const configuracionApartamento = await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })

        if (nuevoEstado !== "disponible" && nuevoEstado !== "nodisponible") {
            const m = "El campo nuevoEstado solo puede ser disponible o nodisponible"
            throw new Error(m)
        }
        if (nuevoEstado === "disponible") {

            const zonaIDV = configuracionApartamento.zonaIDV
            if (zonaIDV !== "privada" && zonaIDV !== "global" && zonaIDV !== "publica") {
                const error = "No se puede poner en disponible esta configuración porque no es válida. Necesitas establecer la zona de esta configuración de alojamiento en privada, publica o global";
                throw new Error(error);
            }

            const habitacionesPorApartmento = await obtenerHabitacionesDelApartamentoPorApartamentoIDV(apartamentoIDV)
            if (habitacionesPorApartmento.length === 0) {
                const error = "No se puede poner en disponible esta configuración porque no es válida. Necesitas al menos una habitación en esta configuración y este apartamento no la tiene";
                throw new Error(error);
            }
            // Mirar que todas las habitaciones tengan una cama asignada
            if (habitacionesPorApartmento.length > 0) {
                const habitacionesSinCama = [];
                const habitacionesEnConfiguracion = habitacionesPorApartmento;
                for (const detalleHabitacion of habitacionesEnConfiguracion) {
                    const habitacionUID = detalleHabitacion.componenteUID;
                    const habitacionIDV = detalleHabitacion.habitacionIDV;
                    const habitacion = await obtenerHabitacionComoEntidadPorHabitacionIDV({
                        habitacionIDV,
                        errorSi: "noExiste"
                    })
                    const habitacionUI = habitacion.habitacionUI
                    const camasPorHabitacionUID = await obtenerCamasDeLaHabitacionPorHabitacionUID(habitacionUID)
                    if (camasPorHabitacionUID.length === 0) {
                        habitacionesSinCama.push(habitacionUI);
                    }
                }
                if (habitacionesSinCama.length > 0) {
                    const funsionArray = habitacionesSinCama.join(", ").replace(/,([^,]*)$/, ' y $1');
                    const error = `No se puede establecer el estado disponible porque la configuración no es válida. Por favor, revisa las camas asignadas en las habitaciones. En las habitaciones ${funsionArray} no hay una sola cama signada como opción. Por favor, asigna la cama`;
                    throw new Error(error);
                }
            }
            // Mira que tenga un perfil de precio creado y superiro 0
            const perfilPrecioDelApartamento = await obtenerPerfilPrecioPorApartamentoUID(apartamentoIDV)
            if (perfilPrecioDelApartamento.length === 0) {
                const error = "La configuración no es válida. No se puede establecer en disponible porque esta configuración no tiene asignado un perfil de precio para poder calcular los impuestos. Por favor, establece un perfil de precio para esta configuración.";
                throw new Error(error);
            }
            if (perfilPrecioDelApartamento.precio <= 0) {
                const error = "El apartamento tiene una configuración correcta y también tiene un perfil de precio, pero en el perfil de precio está establecido 0.00 como precio base y no está permitido.";
                throw new Error(error);
            }
            // No puede haber un estado disponible con precio base en 0.00
        }

        const dataActualizarEstadoPorApartamentoIDV = {
            nuevoEstado: nuevoEstado,
            apartamentoIDV: apartamentoIDV
        }
        await actualizarEstadoPorApartamentoIDV(dataActualizarEstadoPorApartamentoIDV)
        const ok = {
            ok: "Se ha actualizado el estado correctamente",
            nuevoEstado: nuevoEstado
        };
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        mutex.release()
    }

}