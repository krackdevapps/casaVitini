
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../repositorio/arquitectura/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { actualizarApartamentoComoEntidadPorApartamentoIDV } from "../../../../repositorio/arquitectura/actualizarApartamentoComoEntidadPorApartamentoIDV.mjs";
import { eliminarCaracteristicasDelApartamentoPorApartamentoIDV } from "../../../../repositorio/arquitectura/eliminarCaracteristicasDelApartamentoPorApartamentoIDV.mjs";
import { insertarCaracteristicaDelApartamento } from "../../../../repositorio/arquitectura/insertarCaracteristicaDelApartamento.mjs";
import { obtenerHabitacionComoEntidadPorHabitacionIDV } from "../../../../repositorio/arquitectura/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs";
import { actualizarHabitacionComoEntidadPorHabitacionIDV } from "../../../../repositorio/arquitectura/actualizarHabitacionComoEntidadPorHabitacionIDV.mjs";
import { obtenerCamaComoEntidadPorCamaIDV } from "../../../../repositorio/arquitectura/obtenerCamaComoEntidadPorCamaIDV.mjs";
import { actualizarCamaComoEntidadPorCamaIDV } from "../../../../repositorio/arquitectura/actualizarCamaComoEntidadPorCamaIDV.mjs";

export const modificarEntidadAlojamiento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const tipoEntidad = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoEntidad,
            nombreCampo: "El tipoEntidad",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const entidadIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.entidadIDV,
            nombreCampo: "El entidadIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        if (tipoEntidad === "apartamento") {
            const apartamentoIDV = validadoresCompartidos.tipos.cadena({
                string: entrada.body.apartamentoIDV,
                nombreCampo: "El apartamentoIDV",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
                soloMinusculas: "si"
            })
            const apartamentoUI = validadoresCompartidos.tipos.cadena({
                string: entrada.body.apartamentoUI,
                nombreCampo: "El campo del apartamentoUI",
                filtro: "strictoConEspacios",
                sePermiteVacio: "si",
                limpiezaEspaciosAlrededor: "si",
            })
            const caracteristicas = entrada.body.caracteristicas;

            if (!Array.isArray(caracteristicas)) {
                const error = "el campo 'caractaristicas' solo puede ser un array";
                throw new Error(error);
            }
            for (const caractaristica of caracteristicas) {
                validadoresCompartidos.tipos.cadena({
                    string: caractaristica,
                    nombreCampo: "El campo caracteristicas",
                    filtro: "strictoConEspacios",
                    sePermiteVacio: "no",
                    limpiezaEspaciosAlrededor: "si",
                })
            }

            const apartamentEntidad = await obtenerApartamentoComoEntidadPorApartamentoIDV(entidadIDV)
            if (!apartamentEntidad.apartamento) {
                const error = "No existe el apartamento, revisa el apartamentopIDV";
                throw new Error(error);
            }
            // Comprobar que no existe el nuevo IDV
            if (entidadIDV !== apartamentoIDV) {
                const apartamentEntidad = await obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV)

                if (apartamentEntidad.apartamento) {
                    const error = "El nuevo identificador de la entidad ya existe, escoge otro por favor";
                    throw new Error(error);
                }
            }

            const dataActualizarApartamentoComoEntidadPorApartamentoIDV = {
                apartamentoIDV: apartamentoIDV,
                apartamentoUI: apartamentoUI,
                entidadIDV: entidadIDV
            }
            const nuevoApartamentoComoEntidad = await actualizarApartamentoComoEntidadPorApartamentoIDV(dataActualizarApartamentoComoEntidadPorApartamentoIDV)
            if (nuevoApartamentoComoEntidad.rowCount === 0) {
                const error = "No se ha podido guardar los datos por que no se han encontrado el apartamento";
                throw new Error(error);
            }
            if (nuevoApartamentoComoEntidad.rowCount === 1) {
                await eliminarCaracteristicasDelApartamentoPorApartamentoIDV(apartamentoIDV)

                if (caracteristicas.length > 0) {
                    const dataInsertarCaracteristicaDelApartamento = {
                        caracteristicas: caracteristicas,
                        apartamentoIDV: apartamentoIDV
                    }
                    await insertarCaracteristicaDelApartamento(dataInsertarCaracteristicaDelApartamento)
                }
                const ok = {
                    ok: "Se ha actualizado correctamente el apartamento"
                };
                return ok
            }
        }
        if (tipoEntidad === "habitacion") {

            const habitacionIDV = validadoresCompartidos.tipos.cadena({
                string: entrada.body.habitacionIDV,
                nombreCampo: "El habitacionIDV",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
                soloMinusculas: "si"
            })
            const habitacionUI = validadoresCompartidos.tipos.cadena({
                string: entrada.body.habitacionUI,
                nombreCampo: "El campo habitacionUI",
                filtro: "strictoConEspacios",
                sePermiteVacio: "si",
                limpiezaEspaciosAlrededor: "si",
            })

            const habitacionEntidad = await obtenerHabitacionComoEntidadPorHabitacionIDV(entidadIDV)
            if (!habitacionEntidad.habitacion) {
                const error = "No existe la habitacion, revisa el habitacionIDV";
                throw new Error(error);
            }
            // Comprobar que no existe el nuevo IDV
            if (entidadIDV !== habitacionIDV) {

                const habitacionEntidad = await obtenerHabitacionComoEntidadPorHabitacionIDV(habitacionIDV)
                if (habitacionEntidad.habitacion) {
                    const error = "El nuevo identificador de la entidad ya existe, escoge otro por favor";
                    throw new Error(error);
                }
            }

            const dataActualizarHabitacionComoEntidadPorHabitacionIDV = {
                habitacionIDV: habitacionIDV,
                habitacionUI: habitacionUI,
                entidadIDV: entidadIDV
            }
            const habitacionActualizada = await actualizarHabitacionComoEntidadPorHabitacionIDV(dataActualizarHabitacionComoEntidadPorHabitacionIDV)
            if (habitacionActualizada.rowCount === 0) {
                const error = "No se ha podido guardar los datosd por que no se han encontrado la habitacion";
                throw new Error(error);
            }
            if (habitacionActualizada.rowCount === 1) {
                const ok = {
                    ok: "Se ha actualizado correctamente la habitacion"
                };
                return ok
            }
        }
        if (tipoEntidad === "cama") {
            const camaIDV = validadoresCompartidos.tipos.cadena({
                string: entrada.body.camaIDV,
                nombreCampo: "El camaIDV",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
                soloMinusculas: "si"
            })
            const camaUI = validadoresCompartidos.tipos.cadena({
                string: entrada.body.camaUI,
                nombreCampo: "El campo del camaUI",
                filtro: "strictoConEspacios",
                sePermiteVacio: "si",
                limpiezaEspaciosAlrededor: "si",
            })


            const capacidad = validadoresCompartidos.tipos.cadena({
                string: entrada.body.capacidad,
                nombreCampo: "El campo capacidad",
                filtro: "cadenaConNumerosEnteros",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
                devuelveUnTipoNumber: "si"
            })

            const camaEntidad = await obtenerCamaComoEntidadPorCamaIDV(entidadIDV)
            if (!camaEntidad.cama) {
                const error = "No existe la habitacion, revisa el habitacionIDV";
                throw new Error(error);
            }
            // Comprobar que no existe el nuevo IDV
            if (entidadIDV !== camaIDV) {
                const camaEntidad = await obtenerCamaComoEntidadPorCamaIDV(camaIDV)

                if (camaEntidad.cama) {
                    const error = "El nuevo identificador de la entidad ya existe, escoge otro por favor";
                    throw new Error(error);
                }
            }
            const dataActualizarCamaComoEntidadPorCamaIDV = [
                camaIDV,
                camaUI,
                capacidad,
                entidadIDV,
            ];
            const nuevaCamaEntidad = await actualizarCamaComoEntidadPorCamaIDV(dataActualizarCamaComoEntidadPorCamaIDV)
            if (nuevaCamaEntidad.rowCount === 0) {
                const error = "No se ha podido guardar los datosd por que no se han encontrado la cama";
                throw new Error(error);
            }
            if (nuevaCamaEntidad.rowCount === 1) {
                const ok = {
                    ok: "Se ha actualizado correctamente la cama"
                };
                return ok
            }
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}