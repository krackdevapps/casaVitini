import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
export const validarComportamiento = async (comportamiento) => {
    try {

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

        const tipo = contenedor?.tipo
        if (tipo !== "porDias" && tipo !== "porRango") {
            const error = "Por favor determine si el tipo de bloqueo es porRango o porDias.";
            throw new Error(error);
        }



        if (tipo === "porRango") {

            const fechaInicio_ISO = await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: contenedor.fechaInicio,
                nombreCampo: "La fecha de inicio del comportamiento"
            });
            const fechaFinal_ISO = await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: contenedor.fechaFinal,
                nombreCampo: "La fecha final del comportameinto"
            });

            await validadoresCompartidos.fechas.validacionVectorial({
                fechaEntrada_ISO: fechaInicio_ISO,
                fechaSalida_ISO: fechaFinal_ISO,
                tipoVector: "igual"
            })

            const apartamentos = validadoresCompartidos.tipos.array({
                array: contenedor.apartamentos,
                nombreCampo: "Dentro del contenedor, en apartamentos"
            })
 
            const controladorIDVRepetidos = {}

            for (const detallesApartamento of apartamentos) {
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
                    const error = `El identificador visual ${apartamentoIDV} esta repetido en el array de apartamentos`;
                    throw new Error(error);
                }
                controladorIDVRepetidos[apartamentoIDV_minusculas] = null
                await obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)

                if (
                    simboloIDV !== "aumentoPorcentaje" &&
                    simboloIDV !== "aumentoCantidad" &&
                    simboloIDV !== "reducirCantidad" &&
                    simboloIDV !== "reducirPorcentaje" &&
                    simboloIDV !== "precioEstablecido"
                ) {
                    const error = `El campo simbolo de ${apartamentoIDV} solo admite aumentoPorcentaje,aumentoCantidad,reducirCantidad,reducirPorcentaje y precioEstablecido`;
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

        }
        if (tipo === "porDias") {
            const diasArray = validadoresCompartidos.tipos.array({
                array: contenedor.dias,
                nombreCampo: "El diasArray",
                filtro: "soloCadenasIDV",
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
        }

    } catch (errorCapturado) {
        throw errorCapturado
    }
}