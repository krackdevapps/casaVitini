
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { actualizarApartamentoComoEntidadPorApartamentoIDV } from "../../../../repositorio/arquitectura/entidades/apartamento/actualizarApartamentoComoEntidadPorApartamentoIDV.mjs";
import { eliminarCaracteristicasDelApartamentoPorApartamentoIDV } from "../../../../repositorio/arquitectura/entidades/apartamento/eliminarCaracteristicasDelApartamentoPorApartamentoIDV.mjs";
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
import { actualizaApartamentoPorApartamentoIDVPorReservaUID } from "../../../../repositorio/reservas/apartamentos/actualizaApartamentoPorApartamentoIDVPorReservaUID.mjs";
import { insertarCaracteristicaArrayEnConfiguracionDeAlojamiento } from "../../../../repositorio/arquitectura/entidades/apartamento/insertarCaracteristicaArrayEnConfiguracionDeAlojamiento.mjs";
import { actualizarIDVenOfertas } from "../../../../sistema/arquitectura/entidades/actualizarIDVenOfertas.mjs";
import { actualizarIDVenInstantaneasContenedorFinanciero } from "../../../../sistema/arquitectura/entidades/actualizarIDVenInstantaneasContenedorFinanciero.mjs";
import { actualizarIDVenInstantaneasContenedorFinancieroDeSimulacion } from "../../../../sistema/arquitectura/entidades/actualizarIDVenInstantaneasContenedorFinancieroDeSimulacion.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";

export const modificarEntidadAlojamiento = async (entrada) => {
    const mutex = new Mutex();

    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
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
            console.log("entrad", entrada.body)

            validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
                objeto: entrada.body,
                numeroDeLLavesMaximo: 5
            })

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
            const caracteristicas = validadoresCompartidos.tipos.array({
                array: entrada.body.caracteristicas,
                nombreCampo: "El campo de caracteristicas",
                filtro: "strictoConEspacios",
                sePermitenDuplicados: "si",
                sePermiteArrayVacio: "si"
            })
            await campoDeTransaccion("iniciar")
            await obtenerApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDV: entidadIDV,
                errorSi: "noExiste"
            })

            // Comprobar que no existe el nuevo IDV
            if (entidadIDV !== apartamentoIDV) {
                await obtenerApartamentoComoEntidadPorApartamentoIDV({
                    apartamentoIDV,
                    errorSi: "existe"
                })
            }

            const apartamentoComoEntidadActualizado = await actualizarApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDVNuevo: apartamentoIDV,
                apartamentoUI: apartamentoUI,
                apartamentoIDVSelector: entidadIDV
            })
            if (apartamentoComoEntidadActualizado.rowCount === 0) {
                const error = "No se han podido guardar los datos porque no se ha encontrado el apartamento.";
                throw new Error(error);
            }


            await eliminarCaracteristicasDelApartamentoPorApartamentoIDV(apartamentoIDV)
            if (caracteristicas.length > 0) {
                await insertarCaracteristicaArrayEnConfiguracionDeAlojamiento({
                    caracteristicasArray: caracteristicas,
                    apartamentoIDV: apartamentoIDV
                })
            }

            const configuracionAlojamiento = await obtenerConfiguracionPorApartamentoIDV({
                apartamentoIDV: apartamentoIDV,
                errorSi: "desactivado"
            })
            if (configuracionAlojamiento) {
                // Hay que detectar si la entidad de alojamiento, existe en una configuracion de alojamiento para hcaer lo sigueinte

                const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
                const tiempoZH = DateTime.now().setZone(zonaHoraria);
                const fechaActual = tiempoZH.toISODate();

                const reservasActivas = await obtenerReservasPresentesFuturas({
                    fechaActual: fechaActual,
                })
                const reservasUIDArray = reservasActivas.map((reserva) => {
                    return reserva.reservaUID
                })

                //if (apartamentoIDV !== entidadIDV) {
                await actualizaApartamentoPorApartamentoIDVPorReservaUID({
                    reservasUIDArray,
                    antiguoApartamentoIDV: entidadIDV,
                    nuevoApartamentoIDV: apartamentoIDV,
                    apartamentoUI: apartamentoUI
                })

                // Actualizar en ofertas
                await actualizarIDVenOfertas({
                    origenIDV: entidadIDV,
                    destinoIDV: apartamentoIDV
                })
                // Actualizar todos los IDV de todas las instantaneas
                await actualizarIDVenInstantaneasContenedorFinanciero({
                    origenIDV: entidadIDV,
                    destinoIDV: apartamentoIDV,
                    reservasUIDArray
                })
                await actualizarIDVenInstantaneasContenedorFinancieroDeSimulacion({
                    origenIDV: entidadIDV,
                    destinoIDV: apartamentoIDV,
                })
            }

            await campoDeTransaccion("confirmar")

            const ok = {
                ok: "Se ha actualizado correctamente el apartamento",
                apartamentoComoEntidadActualizado
            }
            return ok

        } else if (tipoEntidad === "habitacion") {
            validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
                objeto: entrada.body,
                numeroDeLLavesMaximo: 4
            })
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
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })
            await campoDeTransaccion("iniciar")

            const habitacionEntidad = await obtenerHabitacionComoEntidadPorHabitacionIDV({
                habitacionIDV: entidadIDV,
                errorSi: "noExiste"
            })
            if (!habitacionEntidad?.habitacionIDV) {
                const error = "No existe la habitación, revisa el habitacionIDV";
                throw new Error(error);
            }
            // Comprobar que no existe el nuevo IDV
            if (entidadIDV !== habitacionIDV) {

                const habitacionEntidad = await obtenerHabitacionComoEntidadPorHabitacionIDV({
                    habitacionIDV,
                    errorSi: "existe"
                })
                if (habitacionEntidad?.habitacionIDV) {
                    const error = "El nuevo identificador de la entidad ya existe, escoge otro por favor";
                    throw new Error(error);
                }
            }

            await actualizarHabitacionComoEntidadPorHabitacionIDV({
                habitacionIDVNuevo: habitacionIDV,
                habitacionUI: habitacionUI,
                habitacionIDVSelector: entidadIDV
            })
            await campoDeTransaccion("confirmar")
            const ok = {
                ok: "Se ha actualizado correctamente la habitación."
            };
            return ok

        } else if (tipoEntidad === "cama") {
            validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
                objeto: entrada.body,
                numeroDeLLavesMaximo: 5
            })
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

            await obtenerCamaComoEntidadPorCamaIDVPorTipoIDV({
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
            const reservasUIDArray = reservasActivas.map((reserva) => {
                return reserva.reservaUID
            })
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
        if (mutex) {
            mutex.release();    
        }
        
    }
}