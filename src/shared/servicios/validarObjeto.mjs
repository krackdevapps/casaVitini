import Joi from "joi"
import { controlEstructuraPorJoi } from "../validadores/controlEstructuraPorJoi.mjs"
import { validadoresCompartidos } from "../validadores/validadoresCompartidos.mjs"

export const validarServicio = async (data) => {
    try {
        const commonMessages = validadoresCompartidos.herramientasExternas.joi.mensajesErrorPersonalizados

        const servicio = data.servicio

        const gruposDeOpciones = Joi.array().items(
            Joi.object({
                nombreGrupo: Joi.string().custom((value, helpers) => {
                    try {

                        return validadoresCompartidos.tipos.cadena({
                            string: value,
                            nombreCampo: "El campo del nombre del grupo de opciones",
                            filtro: "strictoConEspacios",
                            sePermiteVacio: "no",
                            soloMayusculas: "no",
                            limpiezaEspaciosAlrededor: "si",
                            limpiezaEspaciosInternosGrandes: "si"
                        })
                    } catch (error) {
                        const path = helpers.state.path.join('.');
                        const mensajeError = `Error en ${path}: ${error.message}`;
                        return helpers.message(mensajeError);
                    }

                }).required().messages(commonMessages),
                configuracionGrupo: Joi.object({
                    confSelObligatoria: Joi.array().items(
                        Joi.string().custom((value, helpers) => {
                            try {
                                const validado = validadoresCompartidos.tipos.cadena({
                                    string: value,
                                    nombreCampo: `El identificador visual de confSelObligatoria`,
                                    filtro: "strictoIDV",
                                    sePermiteVacio: "no",
                                    limpiezaEspaciosAlrededor: "si",
                                })
                                const confsIDV = [
                                    "unaObligatoria",
                                    "ningunaObligatoria"
                                ]
                                if (!confsIDV.includes(validado)) {
                                    const m = `No se reconoce el identificador visual de la configuracion confSelObligatoria, solo se espera, unaObligatoria o ningunaObligatoria`
                                    throw new Error(m)
                                }
                                return validado
                            } catch (error) {
                                const path = helpers.state.path.join('.');
                                const mensajeError = `Error en ${path}: ${error.message}`;
                                return helpers.message(mensajeError);
                            }

                        }).required().messages(commonMessages),
                    ).required().messages(commonMessages),
                    confSelNumero: Joi.array().items(
                        Joi.string().custom((value, helpers) => {
                            try {
                                const validado = validadoresCompartidos.tipos.cadena({
                                    string: value,
                                    nombreCampo: `El identificador visual de confSelNumero`,
                                    filtro: "strictoIDV",
                                    sePermiteVacio: "no",
                                    limpiezaEspaciosAlrededor: "si",
                                })
                                const confsIDV = [
                                    "maximoUnaOpcion",
                                    "variasOpcionesAlMismoTiempo"
                                ]
                                if (!confsIDV.includes(validado)) {
                                    const m = `No se reconoce el identificador visual de la configuracion confSelNumero, solo se espera, maximoUnaOpcion o variasOpcionesAlMismoTiempo`
                                    throw new Error(m)
                                }
                                return validado
                            } catch (error) {
                                const path = helpers.state.path.join('.');
                                const mensajeError = `Error en ${path}: ${error.message}`;
                                return helpers.message(mensajeError);
                            }

                        }).required().messages(commonMessages),
                    ).required().messages(commonMessages)
                }).required(),
                opcionesGrupo: Joi.array().items(
                    Joi.object({
                        nombreOpcion: Joi.string().required().custom((value, helpers) => {
                            try {

                                return validadoresCompartidos.tipos.cadena({
                                    string: value,
                                    nombreCampo: "El campo del nombre de la opcion",
                                    filtro: "strictoConEspacios",
                                    sePermiteVacio: "no",
                                    soloMayusculas: "no",
                                    limpiezaEspaciosAlrededor: "si",
                                    limpiezaEspaciosInternosGrandes: "si"
                                })


                            } catch (error) {
                                const path = helpers.state.path.join('.');
                                const mensajeError = `Error en ${path}: ${error.message}`;
                                return helpers.message(mensajeError);
                            }

                        }).messages(commonMessages),
                        precioOpcion: Joi.string().allow('').required().custom((value, helpers) => {
                            try {

                                const precioOpcion = validadoresCompartidos.tipos.cadena({
                                    string: value,
                                    nombreCampo: "El campo del precio",
                                    filtro: "cadenaConNumerosConDosDecimales",
                                    sePermiteVacio: "si",
                                    impedirCero: "si",
                                    devuelveUnTipoNumber: "no",
                                    limpiezaEspaciosAlrededor: "si",
                                })
                                
                                return precioOpcion;  
                            } catch (error) {
                                const path = helpers.state.path.join('.');
                                const mensajeError = `Error en ${path}: ${error.message}`;
                                return helpers.message(mensajeError);
                            }

                        }).messages(commonMessages),
                        interruptorCantidad: Joi.string().allow('').required().custom((value, helpers) => {
                            try {
                                const estadoIDV = validadoresCompartidos.tipos.cadena({
                                    string: value,
                                    nombreCampo: "El campo del interruptorCantidad solo espera un numero entero",
                                    filtro: "strictoIDV",
                                    sePermiteVacio: "no",
                                    limpiezaEspaciosAlrededor: "si",
                                })
                                const estados = [
                                    "activado",
                                    "desactivado"
                                ]
                                if (!estados.includes(estadoIDV)) {
                                    throw new Error("solo espera 'activado' o 'desactivado'")
                                }
                                return estadoIDV

                            } catch (error) {
                                const path = helpers.state.path.join('.');
                                const mensajeError = `Error en ${path}: ${error.message}`;
                                return helpers.message(mensajeError);
                            }

                        }).messages(commonMessages),
                    }).required()
                ).required()
            }).required()
        ).required()



        const schema = Joi.object({
            nombreServicio: Joi.string().messages(commonMessages),
            zonaIDV: Joi.string().messages(commonMessages),
            contenedor: Joi.object({
                fechaInicio: Joi.string(),
                fechaFinal: Joi.string(),
                disponibilidadIDV: Joi.string().messages(commonMessages),
                tituloPublico: Joi.string().messages(commonMessages),
                definicion: Joi.string().messages(commonMessages),
                duracionIDV: Joi.string().messages(commonMessages),
                gruposDeOpciones: gruposDeOpciones
            }).required().messages(commonMessages),
        }).required().messages(commonMessages)

        const objectoValidado = controlEstructuraPorJoi({
            schema: schema,
            objeto: servicio
        })



        validadoresCompartidos.tipos.cadena({
            string: objectoValidado.nombreServicio,
            nombreCampo: "El nombreServicio",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            limpiezaEspaciosInternos: "si",
        })

        validadoresCompartidos.tipos.cadena({
            string: objectoValidado?.zonaIDV,
            nombreCampo: "El campo de zonaIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const zonas = [
            "publica",
            "privada",
            "global"
        ]
        if (!zonas.includes(objectoValidado.zonaIDV)) {
            const m = "El selector de zonaIDV solo espera publica, privada, global"
            throw new Error(m)
        }

        const contenedor = objectoValidado.contenedor
        const duracionIDV = contenedor.duracionIDV
        const duraciones = [
            "permanente",
            "rango"
        ]

        if (typeof duracionIDV !== "string" || !duraciones.includes(duracionIDV)) {
            const m = "El campo duracionIDV solo espera permanente o rango"
            throw new Error(m)
        }

        if (duracionIDV === "rango") {
            const fechaInicio = contenedor.fechaInicio
            const fechaFinal = contenedor.fechaFinal
            
            await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: fechaInicio,
                nombreCampo: "La fecha de inico del servicio"
            })
            await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: fechaFinal,
                nombreCampo: "La fecha de final del servicio"
            })

            await validadoresCompartidos.fechas.validacionVectorial({
                fechaEntrada: fechaInicio,
                fechaSalida: fechaFinal,
                tipoVector: "igual"
            })


        } else if (duracionIDV === "permanente") {
            delete contenedor.fechaInicio
            delete contenedor.fechaFinal

        }

        const disponibilidadIDV = contenedor.disponibilidadIDV
        const disponibilidades = [
            "constante",
            "variable"
        ]
        if (typeof disponibilidadIDV !== "string" || !disponibilidades.includes(disponibilidadIDV)) {
            const m = "El campo disponibilidadIDV solo espera constante o variable"
            throw new Error(m)
        }

        validadoresCompartidos.tipos.cadena({
            string: contenedor.disponibilidadIDV,
            nombreCampo: "La disponibilidad",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            limpiezaEspaciosInternos: "si",
        })

        validadoresCompartidos.tipos.cadena({
            string: contenedor.definicion,
            nombreCampo: "El definicion",
            filtro: "cadenaBase64",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            limpiezaEspaciosInternos: "si",
        })
        

        objectoValidado.contenedor.gruposDeOpciones.forEach((grupo, ig) => {
            const grupoIDV = `grupo${ig}`
            grupo.grupoIDV = grupoIDV

            const opcionesGrupo = grupo.opcionesGrupo

            opcionesGrupo.forEach((opcion, io) => {
                const opcionIDV = `${grupoIDV}opcion${io}`
                opcion.opcionIDV = opcionIDV
            })

        })
        const opcionesFormateadasComoObjeto = {}
        objectoValidado.contenedor.gruposDeOpciones.forEach(gp => {
            const grupoIDV = gp.grupoIDV
            opcionesFormateadasComoObjeto[grupoIDV] = gp
        })

        objectoValidado.contenedor.gruposDeOpciones = opcionesFormateadasComoObjeto

        return objectoValidado


    } catch (error) {
        throw error
    }
}
