import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../../configuracion/codigoZonaHoraria.mjs";
import { validadoresCompartidos } from "../../../validadores/validadoresCompartidos.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { totalesBasePorRango } from "./totalesBasePorRango.mjs";
import { aplicarDescuentosDesdeInstantanea } from "../../../ofertas/entidades/reserva/aplicarDescuentosDesdeInstantanea.mjs";
import { aplicarOfertas } from "../../../ofertas/entidades/reserva/aplicarOfertas.mjs";

export const actualizarDesgloseFinanciero = async (data) => {
    try {
        const estructura = data.estructura
        estructura.entidades.reserva = {
            desglosePorNoche: {
                "2024-05-22": {
                    "fechaDiaConNoche": "2024-05-22",
                    "precioNetoNoche": "150.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "50.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "70.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                },
                "2024-05-23": {
                    "fechaDiaConNoche": "2024-05-23",
                    "precioNetoNoche": "167.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "60.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "77.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                },
                "2024-05-24": {
                    "fechaDiaConNoche": "2024-05-24",
                    "precioNetoNoche": "167.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "60.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "77.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                },
                "2024-05-25": {
                    "fechaDiaConNoche": "2024-05-25",
                    "precioNetoNoche": "150.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "50.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "70.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                },
                "2024-05-26": {
                    "fechaDiaConNoche": "2024-05-26",
                    "precioNetoNoche": "150.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "50.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "70.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                },
                "2024-05-27": {
                    "fechaDiaConNoche": "2024-05-27",
                    "precioNetoNoche": "150.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "50.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "70.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                },
                "2024-05-28": {
                    "fechaDiaConNoche": "2024-05-28",
                    "precioNetoNoche": "167.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "60.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "77.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                },
                "2024-05-29": {
                    "fechaDiaConNoche": "2024-05-29",
                    "precioNetoNoche": "150.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "50.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "70.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                },
                "2024-05-30": {
                    "fechaDiaConNoche": "2024-05-30",
                    "precioNetoNoche": "167.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "60.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "77.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                },
                "2024-05-31": {
                    "fechaDiaConNoche": "2024-05-31",
                    "precioNetoNoche": "167.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "60.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "77.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                },
                "2024-06-01": {
                    "fechaDiaConNoche": "2024-06-01",
                    "precioNetoNoche": "150.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "50.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "70.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                },
                "2024-06-02": {
                    "fechaDiaConNoche": "2024-06-02",
                    "precioNetoNoche": "150.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "50.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "70.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                },
                "2024-06-03": {
                    "fechaDiaConNoche": "2024-06-03",
                    "precioNetoNoche": "150.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "50.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "70.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                },
                "2024-06-04": {
                    "fechaDiaConNoche": "2024-06-04",
                    "precioNetoNoche": "167.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "60.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "77.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                },
                "2024-06-05": {
                    "fechaDiaConNoche": "2024-06-05",
                    "precioNetoNoche": "150.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "50.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "70.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                },
                "2024-06-06": {
                    "fechaDiaConNoche": "2024-06-06",
                    "precioNetoNoche": "167.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "60.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "77.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                },
                "2024-06-07": {
                    "fechaDiaConNoche": "2024-06-07",
                    "precioNetoNoche": "167.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "60.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "77.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                },
                "2024-06-08": {
                    "fechaDiaConNoche": "2024-06-08",
                    "precioNetoNoche": "150.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "50.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "70.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                },
                "2024-06-09": {
                    "fechaDiaConNoche": "2024-06-09",
                    "precioNetoNoche": "150.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "50.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "70.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                },
                "2024-06-10": {
                    "fechaDiaConNoche": "2024-06-10",
                    "precioNetoNoche": "150.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "50.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "70.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                },
                "2024-06-11": {
                    "fechaDiaConNoche": "2024-06-11",
                    "precioNetoNoche": "167.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "60.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "77.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                },
                "2024-06-12": {
                    "fechaDiaConNoche": "2024-06-12",
                    "precioNetoNoche": "150.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "50.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "70.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                },
                "2024-06-13": {
                    "fechaDiaConNoche": "2024-06-13",
                    "precioNetoNoche": "167.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "60.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "77.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                },
                "2024-06-14": {
                    "fechaDiaConNoche": "2024-06-14",
                    "precioNetoNoche": "167.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "60.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "77.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                },
                "2024-06-15": {
                    "fechaDiaConNoche": "2024-06-15",
                    "precioNetoNoche": "150.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "50.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "70.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                },
                "2024-06-16": {
                    "fechaDiaConNoche": "2024-06-16",
                    "precioNetoNoche": "150.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "50.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "70.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                },
                "2024-06-17": {
                    "fechaDiaConNoche": "2024-06-17",
                    "precioNetoNoche": "150.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "50.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "70.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                },
                "2024-06-18": {
                    "fechaDiaConNoche": "2024-06-18",
                    "precioNetoNoche": "167.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "60.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "77.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                },
                "2024-06-19": {
                    "fechaDiaConNoche": "2024-06-19",
                    "precioNetoNoche": "150.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "50.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "70.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                },
                "2024-06-20": {
                    "fechaDiaConNoche": "2024-06-20",
                    "precioNetoNoche": "167.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "60.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "77.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                },
                "2024-06-21": {
                    "fechaDiaConNoche": "2024-06-21",
                    "precioNetoNoche": "167.00",
                    "apartamentosPorNoche": {
                        "apartamento5": {
                            "precioNetoApartamento": "60.00"
                        },
                        "apartamento7": {
                            "precioNetoApartamento": "77.00"
                        },
                        "apartamento3": {
                            "precioNetoApartamento": "30.00"
                        }
                    }
                }
            }
        }
        const fechaEntrada = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: data.fechaEntrada,
            nombreCampo: "La fecha de entrada del procesador de precios"
        })

        const fechaSalida = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: data.fechaSalida,
            nombreCampo: "La fecha de salida del procesador de precios"
        })

        await validadoresCompartidos.fechas.validacionVectorial({
            fechaEntrada_ISO: data.fechaEntrada,
            fechaSalida_ISO: data.fechaSalida,
            tipoVector: "diferente"
        })

        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const fechaActual = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: data?.fechaActual || DateTime.now().setZone(zonaHoraria).toISODate(),
            nombreCampo: "La fecha de actual del procesador de precios"
        })

        const apartamentosArray = validadoresCompartidos.tipos.array({
            array: data.apartamentosArray,
            nombreCampo: "El array de apartamentos en el procesador de precios",
            filtro: "soloCadenasIDV",
            sePermitenDuplicados: "no"
        })

        
        // Ojo por que puede que la reserva tenga un apartametnoque ya no existe en configuraciones de alojamiento entonces aqui hay un debate
        for (const apartamentoIDV of apartamentosArray) {
            await obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)
        }

        const capaOfertas = data?.capaOfertas
        const capaDescuentosPersonalizados = data?.capaDescuentosPersonalizados

        if (capaOfertas !== "si" && capaOfertas !== "no") {
            const error = "El procesador de precios esta mal configurado, necesita parametro capaOfertas"
            throw new Error(error)
        }
        if (capaDescuentosPersonalizados !== "si" && capaDescuentosPersonalizados !== "no") {
            const error = "El procesador de precios esta mal configurado, necesita parametro capaDescuentosPersonalizados con un si o un no"
            throw new Error(error)
        }
        const descuentosArray = validadoresCompartidos.tipos.array({
            array: data.descuentosArray,
            nombreCampo: "El array de descuentosArray en el procesador de precios",
            filtro: "cadenaConNumerosEnteros",
            sePermitenDuplicados: "si"
        })

        await totalesBasePorRango({
            estructura,
            fechaEntrada_ISO: fechaEntrada,
            fechaSalida_ISO: fechaSalida,
            apartamentosArray
        })

        const zonasDeLaOferta = ["publica", "privada", "global"]

        const descuentosParaRechazar = validadoresCompartidos.tipos.array({
            array: data?.descuentosParaRechazar || [],
            nombreCampo: "descuentosParaRechazar en el procesador de precios",
            filtro: "soloCadenasIDV",
            sePermitenDuplicados: "si",
            sePermiteArrayVacio: "si"
        })

        await aplicarOfertas({
            estructura,
            fechaActual,
            fechaEntrada,
            fechaSalida,
            apartamentosArray,
            zonasDeLaOferta,
            descuentosParaRechazar
        })

        await aplicarDescuentosDesdeInstantanea({
            estructura,
            descuentosArray,
            fechaEntradaReserva_ISO: fechaEntrada,
            fechaSalidaReserva_ISO: fechaSalida
        })
    } catch (error) {
        throw error
    }
}