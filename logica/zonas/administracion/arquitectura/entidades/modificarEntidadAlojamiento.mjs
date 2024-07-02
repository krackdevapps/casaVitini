
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { actualizarApartamentoComoEntidadPorApartamentoIDV } from "../../../../repositorio/arquitectura/entidades/apartamento/actualizarApartamentoComoEntidadPorApartamentoIDV.mjs";
import { eliminarCaracteristicasDelApartamentoPorApartamentoIDV } from "../../../../repositorio/arquitectura/entidades/apartamento/eliminarCaracteristicasDelApartamentoPorApartamentoIDV.mjs";
import { insertarCaracteristicaDelApartamento } from "../../../../repositorio/arquitectura/entidades/apartamento/insertarCaracteristicaDelApartamento.mjs";
import { obtenerHabitacionComoEntidadPorHabitacionIDV } from "../../../../repositorio/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs";
import { actualizarHabitacionComoEntidadPorHabitacionIDV } from "../../../../repositorio/arquitectura/entidades/habitacion/actualizarHabitacionComoEntidadPorHabitacionIDV.mjs";
import { actualizarCamaComoEntidadPorCamaIDV } from "../../../../repositorio/arquitectura/entidades/cama/actualizarCamaComoEntidadPorCamaIDV.mjs";
import { obtenerCamaComoEntidadPorCamaIDVPorTipoIDV } from "../../../../repositorio/arquitectura/entidades/cama/obtenerCamaComoEntidadPorCamaIDVPorTipoIDV.mjs";
import { campoDeTransaccion } from "../../../../repositorio/globales/campoDeTransaccion.mjs";
import { Mutex } from "async-mutex";
import { obtenerReservasPresentesFuturas } from "../../../../repositorio/reservas/selectoresDeReservas/obtenerReservasPresentesFuturas.mjs";
import { codigoZonaHoraria } from "../../../../sistema/configuracion/codigoZonaHoraria.mjs";
import { DateTime } from "luxon";
import { actualizaCamaPorCamaIDVPorReservaUID } from "../../../../repositorio/reservas/apartamentos/actualizaCamaPorCamaIDVPorReservaUID.mjs";

export const modificarEntidadAlojamiento = async (entrada, salida) => {
    const mutex = new Mutex();

    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()
        await mutex.acquire();

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
            await campoDeTransaccion("iniciar")

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
                await campoDeTransaccion("confirmar")

                const ok = {
                    ok: "Se ha actualizado correctamente el apartamento"
                };
                return ok
            }
        } else if (tipoEntidad === "habitacion") {

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
            await campoDeTransaccion("iniciar")

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
            await actualizarHabitacionComoEntidadPorHabitacionIDV(dataActualizarHabitacionComoEntidadPorHabitacionIDV)
            await campoDeTransaccion("confirmar")
            const ok = {
                ok: "Se ha actualizado correctamente la habitacion"
            };
            return ok

        } else if (tipoEntidad === "cama") {
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
            await campoDeTransaccion("iniciar")

            const camaEntidad = await obtenerCamaComoEntidadPorCamaIDVPorTipoIDV({
                camaIDV: entidadIDV,
                tipoIDVArray: ["compartida", "fisica"],
                errorSi: "noExiste"
            })
            // Comprobar que no existe el nuevo IDV
            if (entidadIDV !== camaIDV) {
                await obtenerCamaComoEntidadPorCamaIDVPorTipoIDV({
                    camaIDV: camaIDV,
                    tipoIDVArray: ["compartida", "fisica"],
                    errorSi: "existe"

                })
            }
            await actualizarCamaComoEntidadPorCamaIDV({
                camaIDVNuevo: camaIDV,
                camaUI,
                capacidad,
                camaIDV: entidadIDV,
            })
            const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
            const tiempoZH = DateTime.now().setZone(zonaHoraria);
            const fechaActual = tiempoZH.toISODate();
            // Selecionar reservas presentes y futuras
            const reservasActivas = await obtenerReservasPresentesFuturas({
                fechaActual: fechaActual,
            })
            console.log("reservasActivas", reservasActivas)
            // Actualizar las camas de reseervas presentes y futuras
            const reservasUIDArray = reservasActivas.map((reserva) => {
                return reserva.reservaUID
            })
            console.log("reservasUIDArray", reservasUIDArray)
            await actualizaCamaPorCamaIDVPorReservaUID({
                reservasUIDArray,
                antiguoCamaIDV: entidadIDV,
                nuevoCamaIDV: camaIDV,
                camaUI: camaUI

            })
            await campoDeTransaccion("confirmar")
            const ok = {
                ok: "Se ha actualizado correctamente la cama"
            };
            return ok

        } else {
            const m = "No se reconoce el tipo de entidad"
            throw new Error(m)
        }
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        mutex.release();
    }
}