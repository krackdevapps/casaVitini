
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { actualizarApartamentoComoEntidadPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/entidades/apartamento/actualizarApartamentoComoEntidadPorApartamentoIDV.mjs";
import { eliminarCaracteristicasDelApartamentoPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/entidades/apartamento/eliminarCaracteristicasDelApartamentoPorApartamentoIDV.mjs";
import { obtenerHabitacionComoEntidadPorHabitacionIDV } from "../../../../infraestructure/repository/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs";
import { actualizarHabitacionComoEntidadPorHabitacionIDV } from "../../../../infraestructure/repository/arquitectura/entidades/habitacion/actualizarHabitacionComoEntidadPorHabitacionIDV.mjs";
import { actualizarCamaComoEntidadPorCamaIDV } from "../../../../infraestructure/repository/arquitectura/entidades/cama/actualizarCamaComoEntidadPorCamaIDV.mjs";
import { obtenerCamaComoEntidadPorCamaIDVPorTipoIDV } from "../../../../infraestructure/repository/arquitectura/entidades/cama/obtenerCamaComoEntidadPorCamaIDVPorTipoIDV.mjs";
import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { Mutex } from "async-mutex";
import { obtenerReservasPresentesFuturas } from "../../../../infraestructure/repository/reservas/selectoresDeReservas/obtenerReservasPresentesFuturas.mjs";
import { codigoZonaHoraria } from "../../../../shared/configuracion/codigoZonaHoraria.mjs";
import { DateTime } from "luxon";
import { actualizaCamaPorCamaIDVPorReservaUID } from "../../../../infraestructure/repository/reservas/apartamentos/actualizaCamaPorCamaIDVPorReservaUID.mjs";
import { actualizaApartamentoPorApartamentoIDVPorReservaUID } from "../../../../infraestructure/repository/reservas/apartamentos/actualizaApartamentoPorApartamentoIDVPorReservaUID.mjs";
import { insertarCaracteristicaArrayEnConfiguracionDeAlojamiento } from "../../../../infraestructure/repository/arquitectura/entidades/apartamento/insertarCaracteristicaArrayEnConfiguracionDeAlojamiento.mjs";
import { actualizarIDVenOfertas } from "../../../../shared/arquitectura/entidades/actualizarIDVenOfertas.mjs";
import { actualizarIDVenInstantaneasContenedorFinanciero } from "../../../../shared/arquitectura/entidades/actualizarIDVenInstantaneasContenedorFinanciero.mjs";
import { actualizarIDVenInstantaneasContenedorFinancieroDeSimulacion } from "../../../../shared/arquitectura/entidades/actualizarIDVenInstantaneasContenedorFinancieroDeSimulacion.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";

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
            validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
                objeto: entrada.body,
                numeroDeLLavesMaximo: 7
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

            const apartamentoUIPublico = validadoresCompartidos.tipos.cadena({
                string: entrada.body.apartamentoUIPublico,
                nombreCampo: "El campo del apartamentoUIPublico",
                filtro: "strictoConEspacios",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })
            const definicionPublica = validadoresCompartidos.tipos.cadena({
                string: entrada.body.definicionPublica,
                nombreCampo: "El campo del definicionPublica",
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


            if (entidadIDV !== apartamentoIDV) {
                await obtenerApartamentoComoEntidadPorApartamentoIDV({
                    apartamentoIDV,
                    errorSi: "existe"
                })
            }

            const apartamentoComoEntidadActualizado = await actualizarApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDVNuevo: apartamentoIDV,
                apartamentoUI: apartamentoUI,
                apartamentoIDVSelector: entidadIDV,
                apartamentoUIPublico,
                definicionPublica
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
                const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
                const tiempoZH = DateTime.now().setZone(zonaHoraria);
                const fechaActual = tiempoZH.toISODate();

                const reservasActivas = await obtenerReservasPresentesFuturas({
                    fechaActual: fechaActual,
                })
                const reservasUIDArray = reservasActivas.map((reserva) => {
                    return reserva.reservaUID
                })


                await actualizaApartamentoPorApartamentoIDVPorReservaUID({
                    reservasUIDArray,
                    antiguoApartamentoIDV: entidadIDV,
                    nuevoApartamentoIDV: apartamentoIDV,
                    apartamentoUI: apartamentoUI
                })


                await actualizarIDVenOfertas({
                    origenIDV: entidadIDV,
                    destinoIDV: apartamentoIDV,
                    apartamentoUI: apartamentoUI
                })



                await actualizarIDVenInstantaneasContenedorFinanciero({
                    origenIDV: entidadIDV,
                    destinoIDV: apartamentoIDV,
                    apartamentoUI: apartamentoUI,
                    reservasUIDArray
                })
                await actualizarIDVenInstantaneasContenedorFinancieroDeSimulacion({
                    origenIDV: entidadIDV,
                    destinoIDV: apartamentoIDV,
                    apartamentoUI: apartamentoUI,

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
                devuelveUnTipoNumber: "no",
                devuelveUnTipoBigInt: "si"
            })
            await campoDeTransaccion("iniciar")

            await obtenerCamaComoEntidadPorCamaIDVPorTipoIDV({
                camaIDV: entidadIDV,
                tipoIDVArray: ["compartida", "fisica"],
                errorSi: "noExiste"
            })

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