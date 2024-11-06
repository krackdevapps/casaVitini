import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoUI } from "../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoUI.mjs";
import { insertarApartamentoComoEntidad } from "../../../../infraestructure/repository/arquitectura/entidades/apartamento/insertarApartamentoComoEntidad.mjs";
import { obtenerHabitacionComoEntidadPorHabitacionIDV } from "../../../../infraestructure/repository/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs";
import { obtenerHabitacionComoEntidadPorHabitacionUI } from "../../../../infraestructure/repository/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionUI.mjs";
import { insertarHabitacionComoEntidad } from "../../../../infraestructure/repository/arquitectura/entidades/habitacion/insertarHabitacionComoEntidad.mjs";
import { obtenerCamaComoEntidadPorCamaUI } from "../../../../infraestructure/repository/arquitectura/entidades/cama/obtenerCamaComoEntidadPorCamaUI.mjs";
import { insertarCamaComoEntidad } from "../../../../infraestructure/repository/arquitectura/entidades/cama/insertarCamaComoEntidad.mjs";
import { obtenerCamaComoEntidadPorCamaIDVPorTipoIDV } from "../../../../infraestructure/repository/arquitectura/entidades/cama/obtenerCamaComoEntidadPorCamaIDVPorTipoIDV.mjs";

export const crearEntidadAlojamiento = async (entrada, salida) => {
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
            limpiezaEspaciosAlrededor: "no",
        })

        const testingVI = process.env.TESTINGVI
        if (tipoEntidad === "apartamento") {
            validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
                objeto: entrada.body,
                numeroDeLLavesMaximo: 5
            })
            const apartamentoUI = validadoresCompartidos.tipos.cadena({
                string: entrada.body.apartamentoUI,
                nombreCampo: "El campo del apartamentoUI",
                filtro: "strictoConEspacios",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })

            const apartamentoIDV = validadoresCompartidos.tipos.cadena({
                string: entrada.body.apartamentoIDV || apartamentoUI.toLowerCase().replace(/[^a-z0-9]/g, ''),
                nombreCampo: "El apartamentoIDV",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })

            const apartamentoUIPublico = validadoresCompartidos.tipos.cadena({
                string: entrada.body.apartamentoUIPublico,
                nombreCampo: "El campo del apartamentoUIPublico",
                filtro: "strictoConEspacios",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })
            const desfinicionPublica = validadoresCompartidos.tipos.cadena({
                string: entrada.body.desfinicionPublica,
                nombreCampo: "El campo del desfinicionPublica",
                filtro: "strictoConEspacios",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })

            const validarCodigo = async (apartamentoIDV) => {
                const detallesApartamentoComoEntidad = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                    apartamentoIDV,
                    errorSi: "desactivado"
                })
                if (detallesApartamentoComoEntidad?.apartamentoIDV) {
                    return true;
                }
            };
            const controlApartamentoIDV = async (apartamentoIDV) => {
                let codigoGenerado = apartamentoIDV;
                let codigoExiste;
                do {
                    codigoExiste = await validarCodigo(codigoGenerado);
                    if (codigoExiste) {

                        codigoGenerado = codigoGenerado + "0";
                    }
                } while (codigoExiste);
                return codigoGenerado;
            };
            const apartamentoIDV_unico = await controlApartamentoIDV(apartamentoIDV);
            await obtenerApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDV: apartamentoIDV_unico,
                errorSi: "existe"
            })
            await obtenerApartamentoComoEntidadPorApartamentoUI({
                apartamentoUI,
                errorSi: "existe"
            })

            const dataInsertarApartamentoComoEntidad = {
                apartamentoIDV: apartamentoIDV_unico,
                apartamentoUI: apartamentoUI,
                apartamentoUIPublico,
                desfinicionPublica
            }
            const nuevoApartamentoComEntidad = await insertarApartamentoComoEntidad(dataInsertarApartamentoComoEntidad)
            const ok = {
                ok: "Se ha creado correctamente la nueva entidad como apartamento.",
                nuevoUID: nuevoApartamentoComEntidad.apartamentoIDV
            };
            return ok
        } else if (tipoEntidad === "habitacion") {
            validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
                objeto: entrada.body,
                numeroDeLLavesMaximo: 3
            })
            const habitacionUI = validadoresCompartidos.tipos.cadena({
                string: entrada.body.habitacionUI,
                nombreCampo: "El campo del habitacionUI",
                filtro: "strictoConEspacios",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })

            const habitacionIDV = validadoresCompartidos.tipos.cadena({
                string: entrada.body.habitacionIDV || habitacionUI.toLowerCase().replace(/[^a-z0-9]/g, ''),
                nombreCampo: "El habitacionIDV",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
                soloMinusculas: "si"
            })
            const validarCodigo = async (habitacionIDV) => {

                const habitacion = await obtenerHabitacionComoEntidadPorHabitacionIDV({
                    habitacionIDV,
                    errorSi: "desactivado"
                })
                if (habitacion?.habitacionIDV) {
                    return true;
                } else {
                    return false
                }
            };
            const controlHabitacionIDV = async (habitacionIDV) => {
                let codigoGenerado = habitacionIDV;
                let codigoExiste;
                do {
                    codigoExiste = await validarCodigo(codigoGenerado);
                    if (codigoExiste) {

                        codigoGenerado = codigoGenerado + "_0";
                    }
                } while (codigoExiste);
                return codigoGenerado;
            };
            const habitacionIDV_unico = await controlHabitacionIDV(habitacionIDV);

            const habitacionComoEntidad = await obtenerHabitacionComoEntidadPorHabitacionIDV({
                habitacionIDV: habitacionIDV_unico,
                errorSi: "existe"
            })

            if (habitacionComoEntidad?.habitacionIDV) {
                const error = "Ya existe un identificador visual igual que el que propones, escoge otro";
                throw new Error(error);
            }

            await obtenerHabitacionComoEntidadPorHabitacionUI({
                habitacionUI,
                errorSi: "existe"
            })


            const dataInsertarHabitacionComoEntidad = {
                habitacionIDV: habitacionIDV_unico,
                habitacionUI: habitacionUI
            }

            const nuevaHabitacionComoEntidad = await insertarHabitacionComoEntidad(dataInsertarHabitacionComoEntidad)

            const ok = {
                ok: "Se ha creado correctamente la nueva entidad como habitación",
                nuevoUID: nuevaHabitacionComoEntidad.habitacionIDV
            };
            return ok

        } else if (tipoEntidad === "cama") {
            validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
                objeto: entrada.body,
                numeroDeLLavesMaximo: 5
            })
            const camaUI = validadoresCompartidos.tipos.cadena({
                string: entrada.body.camaUI,
                nombreCampo: "El campo del camaUI",
                filtro: "strictoConEspacios",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })

            const camaIDV = validadoresCompartidos.tipos.cadena({
                string: entrada.body.camaIDV || camaUI.toLowerCase().replace(/[^a-z0-9]/g, ''),
                nombreCampo: "El camaIDV",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
                soloMinusculas: "si"
            })

            const capacidad = validadoresCompartidos.tipos.cadena({
                string: entrada.body.capacidad,
                nombreCampo: "El campo capacidad",
                filtro: "cadenaConNumerosEnteros",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
                sePermitenNegativos: "no",
                devuelveUnTipoNumber: "si"
            })


            const tipoCama = validadoresCompartidos.tipos.cadena({
                string: entrada.body.tipoCama,
                nombreCampo: "El campo tipoCama",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })

            const validarCodigo = async (camaIDV) => {
                try {
                    const camaEntidad = await obtenerCamaComoEntidadPorCamaIDVPorTipoIDV({
                        camaIDV,
                        tipoIDVArray: ["compartida", "fisica"],
                        errorSi: "desactivado"
                    })

                    if (camaEntidad?.camaIDV) {
                        return true;
                    }
                } catch (error) {
                    throw error
                }

            };
            const controlCamaIDV = async (camaIDV) => {
                let codigoGenerado = camaIDV;
                let codigoExiste;
                do {
                    codigoExiste = await validarCodigo(codigoGenerado);
                    if (codigoExiste) {
                        codigoGenerado = codigoGenerado + "0";
                    }
                } while (codigoExiste);
                return codigoGenerado;
            };
            const camaIDV_unico = await controlCamaIDV(camaIDV);

            await obtenerCamaComoEntidadPorCamaIDVPorTipoIDV({
                camaIDV,
                tipoIDVArray: ["compartida", "fisica"],
                errorSi: "existe"
            })

            await obtenerCamaComoEntidadPorCamaUI({
                camaUI,
                errorSi: "existe"
            })

            const dataInsertarCamaComoEntidad = {
                camaIDV: camaIDV_unico,
                camaUI,
                capacidad,
                tipoCama,
                testingVI
            }

            const nuevaCama = await insertarCamaComoEntidad(dataInsertarCamaComoEntidad)
            const ok = {
                ok: "Se ha creado correctamente la nueva entidad como cama.",
                nuevoUID: nuevaCama.camaIDV
            };
            return ok

        } else {
            const error = "No se reconoce el tipo de entidad";
            throw new Error(error);
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}