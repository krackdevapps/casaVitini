import { DateTime } from 'luxon';
import { codigoZonaHoraria } from '../../../configuracion/codigoZonaHoraria.mjs';
import { validadoresCompartidos } from '../../../validadores/validadoresCompartidos.mjs'
import { obtenerHabitacionesDelApartamentoPorApartamentoIDV } from '../../../../repositorio/arquitectura/configuraciones/obtenerHabitacionesDelApartamentoPorApartamentoIDV.mjs';
import { obtenerCamaDeLaHabitacionPorHabitacionUID } from '../../../../repositorio/arquitectura/configuraciones/obtenerCamaDeLaHabitacionPorHabitacionUID.mjs';
import { obtenerHabitacionComoEntidadPorHabitacionIDV } from '../../../../repositorio/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs';
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from '../../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs';
import Joi from 'joi';
import { obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDVPorApartamentosIDV } from '../../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDVPorApartamentosIDV.mjs';

export const validarObjetoReservaPublica = async (data) => {
    try {
        const reservaPublica = data?.reservaPublica
        const filtroTitular = data?.filtroTitular
        const filtroHabitacionesCamas = data?.filtroHabitacionesCamas

        const camaSeleccionada = Joi.object({
            camaUI: Joi.string().required()
                .custom((value, helpers) => {
                    try {
                        return validadoresCompartidos.tipos.cadena({
                            string: value,
                            nombreCampo: `La llave camaUI`,
                            filtro: "strictoConEspacios",
                            sePermiteVacio: "no",
                            limpiezaEspaciosAlrededor: "si",
                        })
                    } catch (error) {
                        const path = helpers.state.path.join('.');
                        const mensajeError = `Error en ${path}: ${error.message}`;
                        return helpers.message(mensajeError);
                    }
                })
                .messages({
                    'string.base': '{{#label}} debe ser una cadena de texto',
                    'string.empty': '{{#label}} no puede estar vacío',
                    'any.required': '{{#label}} es una llave obligatoria'
                }),
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
                .messages({
                    'string.base': '{{#label}} debe ser una cadena de texto',
                    'string.empty': '{{#label}} no puede estar vacío',
                    'any.required': '{{#label}} es una llave obligatoria'
                }),
        });


        const habitacionSchema = Joi.object({
            habitacionUI: Joi.string().required()
                .custom((value, helpers) => {
                    try {
                        return validadoresCompartidos.tipos.cadena({
                            string: value,
                            nombreCampo: `La llave habitacionUI`,
                            filtro: "strictoConEspacios",
                            sePermiteVacio: "no",
                            limpiezaEspaciosAlrededor: "si",
                        })
                    } catch (error) {
                        const path = helpers.state.path.join('.');
                        const mensajeError = `Error en ${path}: ${error.message}`;
                        return helpers.message(mensajeError);
                    }
                })
                .messages({
                    'string.base': '{{#label}} debe ser una cadena de texto',
                    'string.empty': '{{#label}} no puede estar vacío',
                    'any.required': '{{#label}} es una llave obligatoria'
                }),
            camaSeleccionada: camaSeleccionada.required()
        })

        const apartamentoSchemaConHabitacion = Joi.object({
            apartamentoUI: Joi.string().required()
                .custom((value, helpers) => {
                    try {
                        return validadoresCompartidos.tipos.cadena({
                            string: value,
                            nombreCampo: `La llave apartamentoUI`,
                            filtro: "strictoConEspacios",
                            sePermiteVacio: "no",
                            limpiezaEspaciosAlrededor: "si",
                        })
                    } catch (error) {
                        const path = helpers.state.path.join('.');
                        const mensajeError = `Error en ${path}: ${error.message}`;
                        return helpers.message(mensajeError);
                    }
                })
                .messages({
                    'string.base': '{{#label}} debe ser una cadena de texto',
                    'string.empty': '{{#label}} no puede estar vacío',
                    'any.required': '{{#label}} es una llave obligatoria'
                }),
            habitaciones: Joi.object().pattern(
                Joi.string(),
                habitacionSchema.required()
            )
                .min(1)
                .required()
                .messages({
                    'object.base': '{{#label}} debe ser un objeto',
                    'object.min': '{{#label}} debe contener al menos una habitación',
                    'any.required': '{{#label}} es un campo obligatorio',
                })

        })

        const apartamentoSchemaSimple = Joi.object().empty().required().messages({
            'object.base': '{{#label}} debe ser una cadena de texto',
            'string.empty': '{{#label}} no puede estar vacío',
            'any.required': '{{#label}} es una llave obligatoria'
        })


        const esquemaBase = {
            fechaEntrada: Joi.string()
                .isoDate()
                .required()
                .messages({
                    'string.base': '{{#label}} debe ser una cadena de texto',
                    'string.empty': '{{#label}} no puede estar vacío',
                    'string.isoDate': '{{#label}} debe ser una fecha válida en formato ISO',
                    'any.required': '{{#label}} es una llave obligatoria'
                }),
            fechaSalida: Joi.string()
                .isoDate()
                .required()
                .messages({
                    'string.base': '{{#label}} debe ser una cadena de texto',
                    'string.empty': '{{#label}} no puede estar vacío',
                    'string.isoDate': '{{#label}} debe ser una fecha válida en formato ISO',
                    'any.required': '{{#label}} es una llave obligatoria'
                }),
            servicios: Joi.array().items(
                Joi.object({
                    servicioUID: Joi.string().required().messages({
                        'string.base': '{{#label}} debe ser una cadena',
                        'any.required': '{{#label}} es una campo obligatorio',
                    }),
                    servicioUI: Joi.string().required().messages({
                        'string.base': '{{#label}} debe ser una cadena',
                        'any.required': '{{#label}} es una campo obligatorio',
                    })
                }).messages({
                    'object.base': '{{#label}} debe ser un objeto',
                    'any.required': '{{#label}} es una llave obligatoria',
                }),

            )
                .min(1)
                .messages({
                    'array.base': '{{#label}} debe ser un array',
                    'any.required': '{{#label}} es un array campo obligatorio',
                    'array.min': '{{#label}} debe contener al menos un servicios si de declara la llave servicios',

                }),
            codigosDescuento: Joi.array().items(
                Joi.object({
                    codigoUID: Joi.string().required().messages({
                        'string.base': '{{#label}} debe ser una cadena',
                        'any.required': '{{#label}} es una campo obligatorio',
                    }),
                    descuentoUI: Joi.string().required().messages({
                        'string.base': '{{#label}} debe ser una cadena',
                        'any.required': '{{#label}} es una campo obligatorio',
                    })
                }).messages({
                    'object.base': '{{#label}} debe ser un objeto',
                    'any.required': '{{#label}} es una llave obligatoria',
                }),

            )
                .min(1)
                .messages({
                    'array.base': '{{#label}} debe ser un array',
                    'any.required': '{{#label}} es un array campo obligatorio',
                    'array.min': '{{#label}} debe contener al menos un servicios si de declara la llave servicios',

                })



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
                .messages({
                    'string.base': 'El nombre del titular debe ser una cadena de texto',
                    'string.empty': 'El nombre del titular no puede estar vacío',
                    'any.required': 'El nombre del titular es una llave obligatoria'
                }),
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
                .required()
                .messages({
                    'string.base': 'El pasaporte del titular debe ser una cadena de texto',
                    'string.empty': 'El pasaporte del titular no puede estar vacío',
                    'any.required': 'El pasaporte del titular es una llave obligatoria'
                }),
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
                .messages({
                    'string.base': 'El telefono debe ser una cadena de texto',
                    'string.empty': 'El telefono no puede estar vacío',
                    'any.required': 'El telefono es una llave obligatoria'
                }),
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
                .messages({
                    'string.base': 'El correo debe ser una cadena de texto',
                    'string.empty': 'El correo no puede estar vacío',
                    'any.required': 'El correo es una llave obligatoria'
                }),
        }).required()
            .messages({
                'string.base': '{{#label}} debe ser una cadena de texto',
                'string.empty': '{{#label}} no puede estar vacío',
                'string.isoDate': '{{#label}} debe ser una fecha válida en formato ISO',
                'any.required': '{{#label}} es una llave obligatoria'
            })

        if (filtroHabitacionesCamas === "activado") {
            const alojamiento = Joi.object().pattern(
                Joi.string(),
                apartamentoSchemaConHabitacion.required())
                .required().messages({
                    'object.base': '{{#label}} debe ser un ojeto',
                    'any.required': '{{#label}} es un ojeto obligatorio'
                })
            esquemaBase.alojamiento = alojamiento
        } else if (filtroHabitacionesCamas === "desactivado") {
            const alojamiento = Joi.object().pattern(
                Joi.string(),
                apartamentoSchemaSimple.required())
                .required().messages({
                    'object.base': '{{#label}} debe ser un ojeto',
                    'any.required': '{{#label}} es un ojeto obligatorio'
                })
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
        codigosDescuento.forEach((contenedor, i) => {
            const codigoASCI = contenedor.codigoUID

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

            })
            codigosDescuento[i].codigoUID = codigoB64
        })
        
        const servicios = reservaPublica.servicios || []
        servicios.forEach((contenedor, i) => {
            const servicioUID = contenedor.servicioUID
            validadoresCompartidos.tipos.cadena({
                string: servicioUID,
                nombreCampo: `En la llave servicioUID de la posicion ${i + 1} del array de servicios, se esperaba una cadena con un numero entero`,
                filtro: "cadenaConNumerosEnteros",
                sePermiteVacio: "no",
                impedirCero: "si",
                devuelveUnTipoNumber: "no",
                limpiezaEspaciosAlrededor: "si",
            })
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
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const fechaActualTZ = tiempoZH.toISODate()
        const fechaEntradaReserva_ISO = DateTime.fromISO(fechaEntrada, { zone: zonaHoraria });
        const fechaSalidaReserva_ISO = DateTime.fromISO(fechaSalida, { zone: zonaHoraria });

        await validadoresCompartidos.fechas.validacionVectorial({
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            tipoVector: "diferente"
        })

        if (fechaEntradaReserva_ISO < fechaActualTZ) {
            const error = "La fecha de entrada no puede ser anterior a la fecha actual"
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



        // Comprobar apartamentoIDV
        for (const [apartamentoIDV, contenedor] of Object.entries(alojamiento)) {
            const apartamentoUI_entrada = contenedor.apartamentoUI
            try {
                await obtenerConfiguracionesDeAlojamientoPorEstadoIDVPorZonaIDVPorApartamentosIDV({
                    estadoConfiguracionIDV: "disponible",
                    zonaArray: ["global", "publica"],
                    apartamentoIDV: apartamentoIDV,
                    errorSi: "noExiste"
                })
            } catch (error) {
                const m = `La configuración de alojamiento ${apartamentoUI_entrada} no esta disponible`
                throw new Error(m)
            }

            const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "noExiste"
            })
            const apartamentoUI = apartamento.apartamentoUI

            const habitacionesDelApartamentoPorValidar = contenedor.habitaciones
            const habitacionesPorApartamento = await obtenerHabitacionesDelApartamentoPorApartamentoIDV(apartamentoIDV)

            const habitacionesEstructura = {}
            const habitacionesSoloIDV = []

            habitacionesPorApartamento.forEach((habitacionApartamento) => {
                const habitacionIDV = habitacionApartamento.habitacionIDV
                const habitacionUID = habitacionApartamento.componenteUID
                habitacionesEstructura[habitacionIDV] = habitacionUID
                habitacionesSoloIDV.push(habitacionIDV)
            })

            if (filtroHabitacionesCamas === "activado") {
                // Comprobar haitacionIDV
                for (const [habitacionIDV, contenedor] of Object.entries(habitacionesDelApartamentoPorValidar)) {
                    const habitacionUI_entrada = contenedor.habitacionUI

                    if (!habitacionesSoloIDV.includes(habitacionIDV)) {
                        const error = `El ${apartamentoUI} contiene una habitacion que no existe, concretamente la ${habitacionUI_entrada} hace referencia a un habitacionIDV: ${habitacionIDV}`
                        throw new Error(error)
                    }
                    const habitacionComoEntidad = await obtenerHabitacionComoEntidadPorHabitacionIDV({
                        habitacionIDV,
                        errorSi: "noExiste"
                    })
                    const habitacionUID = habitacionesEstructura[habitacionIDV]
                    const habitacionUI = habitacionComoEntidad.habitacionUI

                    const camaUI_entrada = contenedor.camaSeleccionada.camaUI

                    const camaIDV = validadoresCompartidos.tipos.cadena({
                        string: contenedor?.camaSeleccionada?.camaIDV,
                        nombreCampo: `El identificador visual camaIDV, en la habitacion ${habitacionUI}`,
                        filtro: "strictoIDV",
                        sePermiteVacio: "no",
                        limpiezaEspaciosAlrededor: "si",
                    })
                    const camaPorHabitacion = await obtenerCamaDeLaHabitacionPorHabitacionUID({
                        habitacionUID: habitacionUID,
                        camaIDV: camaIDV,
                    })
                    if (!camaPorHabitacion) {
                        const error = `No existe la ${camaUI_entrada}, dentro de ${habitacionUI} del ${apartamentoUI} por que no se puede encontrar su identificador visual: ${camaIDV}`
                        throw new Error(error)
                    }
                }
            }
        }
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}
