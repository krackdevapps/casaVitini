import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import Decimal from "decimal.js";
import { utilidades } from "../../../componentes/utilidades.mjs";
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

        if (tipo === "porAntelacion") {

            const fechaInicio_ISO = await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: contenedor.fechaInicio,
                nombreCampo: "La fecha de inicio del comportamiento"
            });
            const fechaFinal_ISO = await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: contenedor.fechaFinal,
                nombreCampo: "La fecha final del comportameinto"
            });

            await validadoresCompartidos.fechas.validacionVectorial({
                fechaEntrada: fechaInicio_ISO,
                fechaSalida: fechaFinal_ISO,
                tipoVector: "igual"
            })

            // const apartamentos = validadoresCompartidos.tipos.array({
            //     array: contenedor.apartamentos,
            //     nombreCampo: "Dentro del contenedor, en apartamentos"
            // })


            const perfilesAntelacion = validadoresCompartidos.tipos.array({
                array: contenedor.perfilesAntelacion,
                nombreCampo: "Dentro del contenedor, en perfilesAntelacion"
            })

            const diasAntelacionRepeditos = {}

            for (const perfil of perfilesAntelacion) {
                const diasAntelacion = validadoresCompartidos.tipos.cadena({
                    string: perfil.diasAntelacion,
                    nombreCampo: "El campo diasAntelacion en el perfil " + tipo,
                    filtro: "cadenaConNumerosEnteros",
                    sePermiteVacio: "no",
                    devuelveUnTipoNumber: "no",
                    impedirCero: "si",
                    limpiezaEspaciosAlrededor: "si",
                })

                if (!diasAntelacionRepeditos.hasOwnProperty(diasAntelacion)) {
                    diasAntelacionRepeditos[diasAntelacion] = new Decimal(0)
                } else {
                    const valorActual = diasAntelacionRepeditos[diasAntelacion]
                    diasAntelacionRepeditos[diasAntelacion] = valorActual.plus(1)
                }
                const conteoActual = diasAntelacionRepeditos[diasAntelacion]
                if (conteoActual > 1) {
                    const error = `Hay mas de un perfil con ${diasAntelacion}, no se pueden repetir perfiles con los mismos dias de antelacion.`;
                    throw new Error(error);
                }

                const apartamentos = perfil.apartamentos
                for (const [apartamentoIDV, comportamiento] of Object.entries(apartamentos)) {

                    validadoresCompartidos.tipos.cadena({
                        string: apartamentoIDV,
                        nombreCampo: "El campo apartamentoIDV",
                        filtro: "strictoIDV",
                        sePermiteVacio: "no",
                        limpiezaEspaciosAlrededor: "si",
                    })
                    await obtenerConfiguracionPorApartamentoIDV({
                        apartamentoIDV,
                        errorSi: "noExiste"
                    })


                    const simboloIDV = comportamiento.simboloIDV
                    const cantidad = comportamiento.cantidad
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
                        nombreCampo: `El campo cantidad en el ${apartamentoIDV}`,
                        filtro: "cadenaConNumerosConDosDecimales",
                        sePermiteVacio: "no",
                        impedirCero: "si",
                        devuelveUnTipoNumber: "no",
                        limpiezaEspaciosAlrededor: "si",
                    })
                }

            }


            // for (const detallesApartamento of apartamentos) {
            //     const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            //         string: detallesApartamento.apartamentoIDV,
            //         nombreCampo: "El campo apartamentoIDV",
            //         filtro: "strictoIDV",
            //         sePermiteVacio: "no",
            //         limpiezaEspaciosAlrededor: "si",
            //     })

            //     const simboloIDV = detallesApartamento.simboloIDV
            //     const cantidad = detallesApartamento.cantidad

            //     const apartamentoIDV_minusculas = apartamentoIDV.toLowerCase()
            //     if (controladorIDVRepetidos.hasOwnProperty(apartamentoIDV_minusculas)) {
            //         const error = `El identificador visual ${apartamentoIDV} esta repetido en el array de apartamentos`;
            //         throw new Error(error);
            //     }
            //     controladorIDVRepetidos[apartamentoIDV_minusculas] = null
            //     await obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)

            //     if (
            //         simboloIDV !== "aumentoPorcentaje" &&
            //         simboloIDV !== "aumentoCantidad" &&
            //         simboloIDV !== "reducirCantidad" &&
            //         simboloIDV !== "reducirPorcentaje" &&
            //         simboloIDV !== "precioEstablecido"
            //     ) {
            //         const error = `El campo simbolo de ${apartamentoIDV} solo admite aumentoPorcentaje,aumentoCantidad,reducirCantidad,reducirPorcentaje y precioEstablecido`;
            //         throw new Error(error);
            //     }
            //     validadoresCompartidos.tipos.cadena({
            //         string: cantidad,
            //         nombreCampo: "El campo cantidad",
            //         filtro: "cadenaConNumerosConDosDecimales",
            //         sePermiteVacio: "no",
            //         impedirCero: "si",
            //         devuelveUnTipoNumber: "no",
            //         limpiezaEspaciosAlrededor: "si",
            //     })
            // }

        } else if (tipo === "porRango") {

            const fechaInicio_ISO = await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: contenedor.fechaInicio,
                nombreCampo: "La fecha de inicio del comportamiento"
            });
            const fechaFinal_ISO = await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: contenedor.fechaFinal,
                nombreCampo: "La fecha final del comportameinto"
            });

            await validadoresCompartidos.fechas.validacionVectorial({
                fechaEntrada: fechaInicio_ISO,
                fechaSalida: fechaFinal_ISO,
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

        } else if (tipo === "porCreacion") {

            const fechaInicio_ISO = await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: contenedor.fechaInicio,
                nombreCampo: "La fecha de inicio del comportamiento"
            });
            const fechaFinal_ISO = await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: contenedor.fechaFinal,
                nombreCampo: "La fecha final del comportameinto"
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
                    const error = `El campo simbolo de ${apartamentoIDV} solo admite aumentoPorcentaje,aumentoCantidad,reducirCantidad,reducirPorcentaje y precioEstablecido`;
                    throw new Error(error);
                }
                validadoresCompartidos.tipos.cadena({
                    string: cantidad,
                    nombreCampo: `El campo cantidad del ${apartamentoIDV}`,
                    filtro: "cadenaConNumerosConDosDecimales",
                    sePermiteVacio: "no",
                    impedirCero: "si",
                    devuelveUnTipoNumber: "no",
                    limpiezaEspaciosAlrededor: "si",
                })
            }

        } else if (tipo === "porDias") {
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
        } else {
            const error = "Por favor determine si el tipo de bloqueo es porRango o porDias o por antelacion.";
            throw new Error(error);
        }

    } catch (errorCapturado) {
        throw errorCapturado
    }
}