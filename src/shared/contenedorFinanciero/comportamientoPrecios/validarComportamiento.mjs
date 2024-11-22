import { validadoresCompartidos } from "../../validadores/validadoresCompartidos.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import Joi from "joi";
import { controlEstructuraPorJoi } from "../../validadores/controlEstructuraPorJoi.mjs";
export const validarComportamiento = async (comportamiento) => {
    try {

        const schema = Joi.object({
            comportamientoUID: Joi.optional(),
            nombreComportamiento: Joi.required(),
            // testingVI: Joi.string(),
            estadoInicialDesactivado: Joi.string(),
            transaccion: Joi.string(),
            contenedor: Joi.object({
                tipo: Joi.required(),
                fechaInicio: Joi.date(),
                fechaFinal: Joi.date(),
                dias: Joi.array(),
                fechaInicio_creacionReserva: Joi.date(),
                fechaFinal_creacionReserva: Joi.date(),
                apartamentos: Joi.array().items(Joi.object({
                    apartamentoIDV: Joi.required(),
                    simboloIDV: Joi.required(),
                    cantidad: Joi.required(),
                }).messages({
                    'object.base': '{{#label}} debe ser un objeto'
                }))
            }).required().messages({
                'array.base': '{{#label}} debe ser un array'
            }),
        }).required().messages({
            'any.required': '{{#label}} es una llave obligatoria',
            'string.base': '{{#label}} debe de ser una cadena'

        })

        controlEstructuraPorJoi({
            schema: schema,
            objeto: comportamiento
        })


        validadoresCompartidos.tipos.cadena({
            string: comportamiento.nombreComportamiento,
            nombreCampo: "El campo del nombreComportamiento",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const contenedor = validadoresCompartidos.tipos.objetoLiteral({
            objetoLiteral: comportamiento.contenedor,
            nombreCampo: "El array de apartamentos",
        })
        const testingVI = comportamiento.testingVI
        if (testingVI) {
            validadoresCompartidos.tipos.cadena({
                string: testingVI,
                nombreCampo: "El campo testingVI",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })
        }
        const tipo = contenedor?.tipo
        if (tipo === "porRango") {
            const llaves_nivel_1 = [
                "fechaInicio",
                "fechaFinal",
                "apartamentos",
                "tipo"
            ]

            const llaves_objeto_nivel_1 = Object.keys(contenedor)
            if (llaves_objeto_nivel_1.length > llaves_nivel_1.length) {
                const m = `En el objeto de ${tipo} no se esperan más de ${llaves_nivel_1.length} llaves`
                throw new Error(m)
            }

            const fechaInicio_ISO = await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: contenedor.fechaInicio,
                nombreCampo: "La fecha de inicio del comportamiento"
            });
            const fechaFinal_ISO = await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: contenedor.fechaFinal,
                nombreCampo: "La fecha final del comportamiento"
            });

            await validadoresCompartidos.fechas.validacionVectorial({
                fechaEntrada: fechaInicio_ISO,
                fechaSalida: fechaFinal_ISO,
                tipoVector: "igual"
            })

        } else if (tipo === "porCreacion") {
            const fechaInicio_ISO = await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: contenedor.fechaInicio,
                nombreCampo: "La fecha de inicio del comportamiento"
            });
            const fechaFinal_ISO = await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: contenedor.fechaFinal,
                nombreCampo: "La fecha final del comportamiento"
            });

            await validadoresCompartidos.fechas.validacionVectorial({
                fechaEntrada: fechaInicio_ISO,
                fechaSalida: fechaFinal_ISO,
                tipoVector: "igual"
            })
            const fechaInicio_creacionReserva = await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: contenedor.fechaInicio_creacionReserva,
                nombreCampo: "La fecha de inicio del rango de creación"
            });
            const fechaFinal_creacionReserva = await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: contenedor.fechaFinal_creacionReserva,
                nombreCampo: "La fecha del fin del rango de creación"
            });

            await validadoresCompartidos.fechas.validacionVectorial({
                fechaEntrada: fechaInicio_creacionReserva,
                fechaSalida: fechaFinal_creacionReserva,
                tipoVector: "igual"
            })


            const llaves_nivel_1 = [
                "fechaInicio",
                "fechaFinal",
                "apartamentos",
                "tipo",
                "fechaFinal_creacionReserva",
                "fechaInicio_creacionReserva"
            ]

            const llaves_objeto_nivel_1 = Object.keys(contenedor)
            if (llaves_objeto_nivel_1.length > llaves_nivel_1.length) {
                const m = `En el objeto de ${tipo} no se esperan mas de ${llaves_nivel_1.length} llaves`
                throw new Error(m)
            }


        } else if (tipo === "porDias") {
            const diasArray = validadoresCompartidos.tipos.array({
                array: contenedor.dias,
                nombreCampo: "El diasArray",
                filtro: "strictoIDV",
                nombreCompleto: "En diasArray",
                sePermitenDuplicados: "no"
            })

            const diasIDV = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
            const elementosNoEnArray = (diasArray, diasIDV) => {
                return diasArray.filter(elemento => !diasIDV.includes(elemento));
            };
            const elementosNoEnArreglo2 = elementosNoEnArray(diasArray, diasIDV);
            if (elementosNoEnArreglo2.length > 0) {
                const error = "En el array de diasArray no se reconoce: " + elementosNoEnArreglo2;
                throw new Error(error);
            }

            const llaves_nivel_1 = [
                "apartamentos",
                "tipo",
                "dias",
            ]

            const llaves_objeto_nivel_1 = Object.keys(contenedor)
            if (llaves_objeto_nivel_1.length > llaves_nivel_1.length) {
                const m = `En el objeto de ${tipo} no se esperan más de ${llaves_nivel_1.length} llaves`
                throw new Error(m)
            }

        } else {
            const error = "Por favor determine si el tipo de bloqueo es porRango, porDias o porCreacion.";
            throw new Error(error);
        }
        const apartamentos = validadoresCompartidos.tipos.array({
            array: contenedor.apartamentos,
            nombreCampo: "Dentro del contenedor, en apartamentos"
        })
        const controladorIDVRepetidos = {}
        for (const detallesApartamento of apartamentos) {

            const llaves_nivel_1_apartamentos = [
                "cantidad",
                "simboloIDV",
                "apartamentoIDV",
            ]

            const llaves_objeto_nivel_1_apartamentos = Object.keys(detallesApartamento)
            if (llaves_objeto_nivel_1_apartamentos.length > llaves_nivel_1_apartamentos.length) {
                const m = "En el objeto de porRango no se esperan más de 4 llaves"
                throw new Error(m)
            }

            const apartamentoIDV = validadoresCompartidos.tipos.cadena({
                string: detallesApartamento.apartamentoIDV,
                nombreCampo: "El campo apartamentoIDV",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })

            const simboloIDV = detallesApartamento.simboloIDV
            const cantidad = detallesApartamento.cantidad

            const apartamentoIDV_minusculas = apartamentoIDV.toLowerCase()
            if (controladorIDVRepetidos.hasOwnProperty(apartamentoIDV_minusculas)) {
                const error = `El identificador visual ${apartamentoIDV} está repetido en el array de apartamentos`;
                throw new Error(error);
            }
            controladorIDVRepetidos[apartamentoIDV_minusculas] = null
            await obtenerConfiguracionPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "noExiste"
            })

            if (
                simboloIDV !== "aumentoPorcentaje" &&
                simboloIDV !== "aumentoCantidad" &&
                simboloIDV !== "reducirCantidad" &&
                simboloIDV !== "reducirPorcentaje" &&
                simboloIDV !== "precioEstablecido"
            ) {
                const error = `El campo símbolo de ${apartamentoIDV} solo admite aumentoPorcentaje, aumentoCantidad, reducirCantidad, reducirPorcentaje y precioEstablecido`;
                throw new Error(error);
            }
            validadoresCompartidos.tipos.cadena({
                string: cantidad,
                nombreCampo: "El campo cantidad",
                filtro: "cadenaConNumerosConDosDecimales",
                sePermiteVacio: "no",
                impedirCero: "si",
                devuelveUnTipoNumber: "no",
                limpiezaEspaciosAlrededor: "si",
            })
        }

    } catch (errorCapturado) {
        throw errorCapturado
    }
}