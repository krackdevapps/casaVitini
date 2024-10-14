import { DateTime } from 'luxon';
import { codigoZonaHoraria } from '../../../configuracion/codigoZonaHoraria.mjs';
import { validadoresCompartidos } from '../../../validadores/validadoresCompartidos.mjs'
import { obtenerHabitacionesDelApartamentoPorApartamentoIDV } from '../../../../infraestructure/repository/arquitectura/configuraciones/obtenerHabitacionesDelApartamentoPorApartamentoIDV.mjs';
import { obtenerHabitacionComoEntidadPorHabitacionIDV } from '../../../../infraestructure/repository/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs';
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from '../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs';
import Joi from 'joi';
import { obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDVPorApartamentosIDV } from '../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDVPorApartamentosIDV.mjs';
import { obtenerCamasDeLaHabitacionPorHabitacionUID } from '../../../../infraestructure/repository/arquitectura/configuraciones/obtenerCamasDeLaHabitacionPorHabitacionUID.mjs';

export const validarObjetoReservaPublica = async (data) => {
    try {
        const reservaPublica = data?.reservaPublica
        const filtroTitular = data?.filtroTitular
        const filtroHabitacionesCamas = data?.filtroHabitacionesCamas
        const commonMessages = validadoresCompartidos.herramientasExternas.joi.mensajesErrorPersonalizados

        const camaSeleccionada = Joi.object({
            // camaUI: Joi.string().required()
            //     .custom((value, helpers) => {
            //         try {
            //             return validadoresCompartidos.tipos.cadena({
            //                 string: value,
            //                 nombreCampo: `La llave camaUI`,
            //                 filtro: "strictoConEspacios",
            //                 sePermiteVacio: "no",
            //                 limpiezaEspaciosAlrededor: "si",
            //             })
            //         } catch (error) {
            //             const path = helpers.state.path.join('.');
            //             const mensajeError = `Error en ${path}: ${error.message}`;
            //             return helpers.message(mensajeError);
            //         }
            //     })
            //     .messages({
            //         'string.base': '{{#label}} debe ser una cadena de texto',
            //         'string.empty': '{{#label}} no puede estar vacío',
            //         'any.required': '{{#label}} es una llave obligatoria'
            //     }),
            camaIDV: Joi.string().required()
                .custom((value, helpers) => {
                    try {
                        return validadoresCompartidos.tipos.cadena({
                            string: value,
                            nombreCampo: `El identificador visual camaIDV`,
                            filtro: "strictoIDV",
                            sePermiteVacio: "no",
                            limpiezaEspaciosAlrededor: "si",
                        })
                    } catch (error) {
                        const path = helpers.state.path.join('.');
                        const mensajeError = `Error en ${path}: ${error.message}`;
                        return helpers.message(mensajeError);
                    }
                })
                .messages(commonMessages)
        })

        const habitacionSchema = Joi.object({
            // habitacionUI: Joi.string().required()
            //     .custom((value, helpers) => {
            //         try {
            //             return validadoresCompartidos.tipos.cadena({
            //                 string: value,
            //                 nombreCampo: `La llave habitacionUI`,
            //                 filtro: "strictoConEspacios",
            //                 sePermiteVacio: "no",
            //                 limpiezaEspaciosAlrededor: "si",
            //             })
            //         } catch (error) {
            //             const path = helpers.state.path.join('.');
            //             const mensajeError = `Error en ${path}: ${error.message}`;
            //             return helpers.message(mensajeError);
            //         }
            //     })
            //     .messages({
            //         'string.base': '{{#label}} debe ser una cadena de texto',
            //         'string.empty': '{{#label}} no puede estar vacío',
            //         'any.required': '{{#label}} es una llave obligatoria'
            //     }),
            camaSeleccionada: camaSeleccionada.optional().messages(commonMessages)
        })

        const apartamentoSchemaConHabitacion = Joi.object({
            // apartamentoUI: Joi.string().optional()
            //     .custom((value, helpers) => {
            //         try {
            //             return validadoresCompartidos.tipos.cadena({
            //                 string: value,
            //                 nombreCampo: `La llave apartamentoUI`,
            //                 filtro: "strictoConEspacios",
            //                 sePermiteVacio: "no",
            //                 limpiezaEspaciosAlrededor: "si",
            //             })
            //         } catch (error) {
            //             const path = helpers.state.path.join('.');
            //             const mensajeError = `Error en ${path}: ${error.message}`;
            //             return helpers.message(mensajeError);
            //         }
            //     })
            //     .messages({
            //         'string.base': '{{#label}} debe ser una cadena de texto',
            //         'string.empty': '{{#label}} no puede estar vacío',
            //         'any.required': '{{#label}} es una llave obligatoria'
            //     }),
            habitaciones: Joi.object().pattern(
                Joi.string(),
                habitacionSchema.required()
            ).min(1)
                .optional()
                .messages(commonMessages)

        })

        const apartamentoSchemaSimple = Joi.object().empty().required().messages(commonMessages)

        const serviciosEsquema = Joi.array().items(
            Joi.object({
                servicioUID: Joi
                    .string()
                    .required()
                    .custom((value, helpers) => {
                        try {
                            return validadoresCompartidos.tipos.cadena({
                                string: value,
                                nombreCampo: "El identificador universal (servicioUID)",
                                filtro: "cadenaConNumerosEnteros",
                                sePermiteVacio: "no",
                                limpiezaEspaciosAlrededor: "si",
                                devuelveUnTipoNumber: "si"
                            })


                        } catch (error) {
                            const path = helpers.state.path.join('.');
                            const mensajeError = `Error en ${path}: ${error.message}`;
                            return helpers.message(mensajeError);
                        }
                    })
                    .messages(commonMessages),
                opcionesSeleccionadas: Joi.object().pattern(
                    Joi.string()
                        .required()
                        .custom((value, helpers) => {
                            try {
                                return validadoresCompartidos.tipos.cadena({
                                    string: value,
                                    nombreCampo: "El identificador del grupoIDV",
                                    filtro: "strictoIDV",
                                    sePermiteVacio: "no",
                                    limpiezaEspaciosAlrededor: "si",
                                })
                            } catch (error) {
                                const path = helpers.state.path.join('.');
                                const mensajeError = `Error en ${path}: ${error.message}`;
                                return helpers.message(mensajeError);
                            }
                        }).messages(commonMessages),  // Claves dinámicas que sigan el patrón "grupo0", "grupo1", "grupo2", etc.
                    Joi.array().items(
                        Joi.string().custom((value, helpers) => {
                            try {
                                return validadoresCompartidos.tipos.cadena({
                                    string: value,
                                    nombreCampo: "El identificador de opcionIDV",
                                    filtro: "strictoIDV",
                                    sePermiteVacio: "no",
                                    limpiezaEspaciosAlrededor: "si",
                                })
                            } catch (error) {
                                const path = helpers.state.path.join('.');
                                const mensajeError = `Error en ${path}: ${error.message}`;
                                return helpers.message(mensajeError);
                            }
                        }).messages(commonMessages)).required(),// Los valores deben ser arrays de objetos
                ).required().messages(commonMessages),
            })
        ).min(1)
            .messages(commonMessages)


        const esquemaBase = {
            fechaEntrada: Joi.string()
                .isoDate()
                .required()
                .messages(commonMessages),
            fechaSalida: Joi.string()
                .isoDate()
                .required()
                .messages(commonMessages),
            servicios: serviciosEsquema,
            codigosDescuento: Joi.array().items(
                Joi.object({
                    codigosUID: Joi.array().items(
                        Joi.string().required().messages(commonMessages)
                    ).min(1)
                        .messages(commonMessages),
                    descuentoUI: Joi.string().required().messages(commonMessages),
                    ofertaUID: Joi.string().required().messages(commonMessages)
                }).messages(commonMessages),
            )
                .min(1)
                .messages(commonMessages),
            complementosAlojamiento: Joi.array().items(
                Joi.object({
                    complementoUI: Joi.string().required().messages(commonMessages),
                    complementoUID: Joi.string().required().messages(commonMessages)
                }).messages(commonMessages),
            )
                .min(1)
                .messages(commonMessages)
        }

        const esquemaTitular = Joi.object({
            nombreTitular: Joi
                .string()
                .custom((value, helpers) => {
                    try {
                        return validadoresCompartidos.tipos.cadena({
                            string: value,
                            nombreCampo: "El campo del nombre del titular",
                            filtro: "strictoConEspacios",
                            sePermiteVacio: "no",
                            soloMayusculas: "si",
                            limpiezaEspaciosAlrededor: "si",
                            limpiezaEspaciosInternosGrandes: "si"
                        })
                    } catch (error) {
                        const path = helpers.state.path.join('.');
                        const mensajeError = `Error en ${path}: ${error.message}`;
                        return helpers.message(mensajeError);
                    }

                })
                .required()
                .messages(commonMessages),
            pasaporteTitular: Joi
                .string()
                .custom((value, helpers) => {
                    try {
                        return validadoresCompartidos.tipos.cadena({
                            string: value,
                            nombreCampo: "El campo del pasaporte del titular",
                            filtro: "strictoConEspacios",
                            sePermiteVacio: "no",
                            limpiezaEspaciosAlrededor: "si",
                            limpiezaEspaciosInternos: "si"

                        })
                    } catch (error) {
                        const path = helpers.state.path.join('.');
                        const mensajeError = `Error en ${path}: ${error.message}`;
                        return helpers.message(mensajeError);
                    }
                })
                .optional()
                .messages(commonMessages),
            telefonoTitular: Joi
                .string()
                .custom((value, helpers) => {
                    try {
                        return validadoresCompartidos.tipos.telefono({
                            phone: value,
                            nombreCampo: "El telelfono instroducido",
                            sePermiteVacio: "no"
                        })
                    } catch (error) {
                        const path = helpers.state.path.join('.');
                        const mensajeError = `Error en ${path}: ${error.message}`;
                        return helpers.message(mensajeError);
                    }
                })
                .required()
                .messages(commonMessages),
            codigoInternacional: Joi
                .string()
                .custom((value, helpers) => {
                    try {

                        return validadoresCompartidos.tipos.codigosInternacionalesTel({
                            codigo: value,
                            nombreCampo: "El código internacional instroducido",
                            sePermiteVacio: "no"
                        })
                    } catch (error) {
                        const path = helpers.state.path.join('.');
                        const mensajeError = `Error en ${path}: ${error.message}`;
                        return helpers.message(mensajeError);
                    }
                })
                .required()
                .messages(commonMessages),
            correoTitular: Joi
                .string()
                .custom((value, helpers) => {
                    try {
                        return validadoresCompartidos.tipos.correoElectronico({
                            mail: value,
                            nombreCampo: "El coreo electronico instroducido",
                            sePermiteVacio: "no"
                        })
                    } catch (error) {
                        const path = helpers.state.path.join('.');
                        const mensajeError = `Error en ${path}: ${error.message}`;
                        return helpers.message(mensajeError);
                    }
                })
                .required()
                .messages(commonMessages),
        }).required()
            .messages(commonMessages)

        if (filtroHabitacionesCamas === "activado") {
            const alojamiento = Joi.object().pattern(
                Joi.string(),
                apartamentoSchemaConHabitacion.required()
            ).required().messages(commonMessages)
            esquemaBase.alojamiento = alojamiento
        } else if (filtroHabitacionesCamas === "desactivado") {
            const alojamiento = Joi.object().pattern(
                Joi.string(),
                apartamentoSchemaSimple.required())
                .required().messages(commonMessages)
            esquemaBase.alojamiento = alojamiento
        } else {
            const m = "filtroHabitacionesCamas solo puede estar en activado o desactivado"
            throw new Error(m)
        }

        if (filtroTitular === "activado") {
            esquemaBase.titular = esquemaTitular
        } else if (filtroTitular !== "activado" && filtroTitular !== "desactivado") {
            const m = "El filtroTitular solo puede estar en activado o desactivado"
            throw new Error(m)
        }

        const esquemaReservaPublica = Joi.object(esquemaBase).unknown(false);
        const { error, value } = esquemaReservaPublica.validate(reservaPublica);
        const errorTipo = error?.details[0].type

        if (errorTipo === "object.unknown") {
            const llavesDesconocidas = error.details[0].context.label
            const m = `El objeto tiene una propiedad inesperada: ${llavesDesconocidas}`;
            throw new Error(m)
        } else if (error) {
            const m = error?.details[0].message.replaceAll('"', "'")
            throw new Error(m)
        }

        if (filtroTitular === "activado") {
            reservaPublica.titular = value.titular
        }

        const codigosDescuento = reservaPublica.codigosDescuento || []
        const codigosUIDUnicos = {}
        codigosDescuento.forEach((contenedor) => {
            const codigosASCI = contenedor.codigosUID

            codigosASCI.forEach((codigoASCI, i) => {
                if (codigosUIDUnicos[codigoASCI]) {
                    const m = `El codigo ${codigoASCI} esta repetido, no se permite codigos de descuentos repetidos`
                    throw new Error(m)
                }

                codigosUIDUnicos[codigoASCI] = true
                const codigoB64 = validadoresCompartidos.tipos.cadena({
                    string: codigoASCI,
                    nombreCampo: "Te falta el código de descuento en la condición de código de descuento.",
                    filtro: "transformaABase64",
                    sePermiteVacio: "no",
                    limpiezaEspaciosAlrededor: "si",
                    soloMinusculas: "si"
                })
                codigosASCI[i] = codigoB64
            })
        })

        const servicios = reservaPublica.servicios || []
        const servicioUIDDuplicados = {}
        servicios.forEach((contenedor, i) => {
            const servicioUID = contenedor.servicioUID
            const opcionesSeleccionadas = contenedor.opcionesSeleccionadas



            validadoresCompartidos.tipos.cadena({
                string: servicioUID,
                nombreCampo: `En la llave servicioUID de la posicion ${i + 1} del array de servicios, se esperaba una cadena con un numero entero`,
                filtro: "cadenaConNumerosEnteros",
                sePermiteVacio: "no",
                impedirCero: "si",
                devuelveUnTipoNumber: "no",
                limpiezaEspaciosAlrededor: "si",
            })

            if (servicioUIDDuplicados.hasOwnProperty(servicioUID)) {
                const m = "No se permite identificadorwes de servicioUID duplicados."
                throw new Error(m)
            }
            servicioUIDDuplicados[servicioUID] = true

            // const grupoIDVDuplicados = {}
            // Object.entries(opcionesSeleccionadas).forEach(([grupoIDV, os]) => {

            //     if (grupoIDVDuplicados.hasOwnProperty(grupoIDV)) {
            //         const m = `No se permite identificadores de grupoIDV duplicados en ${servicioUID}.`
            //         throw new Error(m)
            //     }
            //     grupoIDVDuplicados[grupoIDV] = true
    
            // })


        })
        const fechaEntrada = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: reservaPublica?.fechaEntrada,
            nombreCampo: "El campo fechaEntrada del objetoReserva"
        })
        const fechaSalida = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: reservaPublica?.fechaSalida,
            nombreCampo: "El campo fechaSalida del objetoReserva"
        })

        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
        const fechaPresenteTZ = DateTime.now().setZone(zonaHoraria).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
        const fechaActualTZ = fechaPresenteTZ.toISODate()
        const fechaEntradaReserva_ISO = DateTime.fromISO(fechaEntrada, { zone: zonaHoraria });
        const fechaSalidaReserva_ISO = DateTime.fromISO(fechaSalida, { zone: zonaHoraria });

        await validadoresCompartidos.fechas.validacionVectorial({
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            tipoVector: "diferente"
        })
        if (fechaEntradaReserva_ISO < fechaPresenteTZ) {
            const error = `La fecha de entrada seleccionada (${fechaEntrada}) es anterior a la fecha actual (${fechaActualTZ}). Por favor, revise la fecha de entrada para que sea presente o futura. Gracias`
            throw new Error(error)
        }
        if (fechaEntradaReserva_ISO >= fechaSalidaReserva_ISO) {
            const error = "La fecha de entrada no puede ser anterior o igual a la fecha de salida"
            throw new Error(error)
        }

        const alojamiento = reservaPublica?.alojamiento
        const apartemtosIDVarray = Object.keys(alojamiento)

        const controlApartamentosIDVUnicos = new Set(apartemtosIDVarray);
        if (controlApartamentosIDVUnicos.size !== apartemtosIDVarray.length) {
            const error = "Existen apartamentosIDV repetidos en el objeto de la reserva"
            throw new Error(error)
        }

        for (const [apartamentoIDV, contenedor_apartamento] of Object.entries(alojamiento)) {
            try {
                await obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDVPorApartamentosIDV({
                    estadoConfiguracionIDV: "disponible",
                    zonaArray: ["global", "publica"],
                    apartamentoIDV: apartamentoIDV,
                    errorSi: "noExiste"
                })
            } catch (error) {
                const m = `La configuración de alojamiento ${apartamentoIDV} no esta disponible`
                throw new Error(m)
            }

            const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "noExiste"
            })

            const apartamentoUI = apartamento.apartamentoUI

            if (filtroHabitacionesCamas === "activado") {

                const habitacionesDelApartamento = await obtenerHabitacionesDelApartamentoPorApartamentoIDV(apartamentoIDV)
                const habitacionesIDVDelApartamento = habitacionesDelApartamento.map(obj => obj.habitacionIDV);
                const habitacionDelApartamento_solicitadas = contenedor_apartamento.habitaciones || {}
                const habitacionesIDV_solicitadas = Object.keys(habitacionDelApartamento_solicitadas)
                habitacionesIDV_solicitadas.forEach((h) => {
                    if (!habitacionesIDVDelApartamento.includes(h)) {
                        const m = `No se reconoce la habitacion con identificador visual ${h} en el ${apartamentoUI} con identificador visual ${apartamentoIDV}`
                        throw new Error(m)
                    }
                })

                for (const habitacionDelApartamento of habitacionesDelApartamento) {
                    const habitacionUID = habitacionDelApartamento.componenteUID
                    const habitacionIDV = habitacionDelApartamento.habitacionIDV

                    const camasSeleccionablesHabitacion = await obtenerCamasDeLaHabitacionPorHabitacionUID(habitacionUID)
                    if (camasSeleccionablesHabitacion.length === 1) {
                        delete habitacionDelApartamento_solicitadas[habitacionIDV]
                        if (Object.keys(habitacionDelApartamento_solicitadas).length === 0) {
                            delete contenedor_apartamento?.habitaciones
                        }

                    } else if (camasSeleccionablesHabitacion.length > 1) {
                        const habitacionComoEntidad = await obtenerHabitacionComoEntidadPorHabitacionIDV({
                            habitacionIDV: habitacionIDV,
                            errorSi: "noExiste"
                        })
                        const habitacionUI = habitacionComoEntidad.habitacionUI

                        const camaSolicitada = habitacionDelApartamento_solicitadas[habitacionIDV]?.camaSeleccionada?.camaIDV
                        if (!camaSolicitada) {
                            const m = `Por favor selecciona el tipo de cama en la ${habitacionUI} del ${apartamentoUI}. Gracias.`
                            throw new Error(m)
                        }
                        const camaIDV = validadoresCompartidos.tipos.cadena({
                            string: camaSolicitada,
                            nombreCampo: `El identificador visual camaIDV, en la habitacion ${habitacionUI}`,
                            filtro: "strictoIDV",
                            sePermiteVacio: "no",
                            limpiezaEspaciosAlrededor: "si",
                        })
                        const existe = camasSeleccionablesHabitacion.some(obj => obj.camaIDV === camaIDV);
                        if (!existe) {
                            const error = `No existe la cama solicitada dentro de la ${habitacionUI} del ${apartamentoUI} por que no se puede encontrar su identificador visual: ${camaIDV}`
                            throw new Error(error)
                        }
                    }
                }
            }
        }

    } catch (errorCapturado) {
        throw errorCapturado;
    }
}
