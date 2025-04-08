import Joi from "joi";
import { utilidades } from "../../shared/utilidades.mjs";
import { validadoresCompartidos } from "../../shared/validadores/validadoresCompartidos.mjs";
import { controlEstructuraPorJoi } from "../../shared/validadores/controlEstructuraPorJoi.mjs";
import Decimal from "decimal.js";


export const calculadora = (entrada) => {
    try {

        const calculo = validadoresCompartidos.tipos.cadena({
            string: entrada.body.calculo,
            nombreCampo: "Falta la llave calulo, como cadena",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const redondeo = validadoresCompartidos.tipos.cadena({
            string: entrada.body.redondeo,
            nombreCampo: "El redondeo solo acepta el numero de ceros como cadena, es decir por ejemplo 2 para .00",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si",
            devuelveUnTipoBigInt: "no",
            impedirCero: "no"
        })


        if (calculo === "simple") {
            validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
                objeto: entrada.body,
                numeroDeLLavesMaximo: 5
            })
            const numero1 = entrada.body.numero1;
            const numero2 = entrada.body.numero2;
            const operador = entrada.body.operador;

            const validarNumero = (numero) => {
                const regex = /^-?\d+(\.\d{1,2})?$/;
                return regex.test(numero);
            };
            const validarOperador = (operador) => {
                const operadoresValidos = ['+', '-', '*', '/', '%'];
                return operadoresValidos.includes(operador);
            };

            if (!validarNumero(numero1) || !validarNumero(numero2)) {
                const error = 'Entrada no válida. Por favor, ingrese números enteros o con hasta dos decimales.';
                throw new Error(error);
            }
            if (!validarOperador(operador)) {
                const error = 'Operador no válido. Los operadores válidos son +, -, *, /.';
                throw new Error(error);
            }
            const resultado = utilidades.calculadora(numero1, numero2, operador)


            // Si es porcentaje
            const ok = {
                ok: "Resultado calculado",
                resultado,
            };
            if (operador === "%") {
                const resultadoRedondeado = parseFloat(resultado).toFixed(redondeo).toString();

                ok.diferencia = utilidades.calculadora(numero1, resultadoRedondeado, "-");
            }

            if (redondeo > 0) {
                ok.resultado = parseFloat(resultado).toFixed(redondeo).toString();
                if (ok.diferencia) {
                    ok.diferencia = parseFloat(ok.diferencia).toFixed(redondeo).toString();
                }
            }
            return ok
        } else if (calculo === "grupoDeNumeros") {

            const commonMessages = validadoresCompartidos.herramientasExternas.joi.mensajesErrorPersonalizados
            const schema = Joi.object({
                numeros: Joi.array().items(
                    Joi.string().custom((value, helpers) => {
                        try {

                            return validadoresCompartidos.tipos.cadena({
                                string: value,
                                nombreCampo: "El cajon del array",
                                filtro: "cadenaConNumerosConDosDecimales",
                                sePermiteVacio: "no",
                                limpiezaEspaciosAlrededor: "si",
                                devuelveUnTipoNumber: "no",
                                impedirCero: "no",
                                sePermitenNegativos: "no"
                            })
                        } catch (error) {
                            const path = helpers.state.path.join('.');
                            const mensajeError = `Error en ${path}: ${error.message}`;
                            return helpers.message(mensajeError);
                        }
                    }).required()
                ).min(1).required().messages(commonMessages),
                redondeo: Joi.string().custom((value, helpers) => {
                    return validadoresCompartidos.tipos.cadena({
                        string: value,
                        nombreCampo: "El redondeo solo acepta el numero de ceros como cadena, es decir por ejemplo 2 para .00",
                        filtro: "cadenaConNumerosEnteros",
                        sePermiteVacio: "si",
                        limpiezaEspaciosAlrededor: "si",
                        devuelveUnTipoNumber: "no",
                        devuelveUnTipoBigInt: "no"
                    })
                }),
                calculo: Joi.string()
            }).required().messages(commonMessages)


            const oval = controlEstructuraPorJoi({
                schema: schema,
                objeto: entrada.body
            })

            const numeros = oval.numeros

            let resultado = new Decimal(0);
            numeros.forEach(n => {
                resultado = resultado.plus(n);
            });

            const ok = {
                ok: "Resultado calculado",
                resultado,
            };
            if (redondeo > 0) {
                ok.resultado = parseFloat(resultado).toFixed(redondeo).toString();
            }

            return ok

        } else {
            const error = 'No se reconoce el tipo de calculo';
            throw new Error(error);
        }


    } catch (errorCapturado) {
        throw errorCapturado
    }
}