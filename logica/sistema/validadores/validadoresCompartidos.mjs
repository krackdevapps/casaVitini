import { DateTime } from "luxon"
import { codigoZonaHoraria } from "../configuracion/codigoZonaHoraria.mjs"
import Decimal from "decimal.js"
import { obtenerClientesPorPasaporte } from "../../repositorio/clientes/obtenerClientesPorPasaporte.mjs"
import { obtenerDatosPersonalesPorMail } from "../../repositorio/usuarios/obtenerDatosPersonalesPorMail.mjs"
import { obtenerNombreColumnaPorTabla } from "../../repositorio/globales/obtenerNombreColumnaPorTabla.mjs"
import { obtenerDatosPersonalesPorMailIgnorandoUsuario } from "../../repositorio/usuarios/obtenerDatosPersonalesPorMailIgnorandoUsuario.mjs"
import { obtenerClientesPorPasaporteIgnorandoClienteUID } from "../../repositorio/clientes/obtenerClientesPorPasaporteIgnorandoClienteUID.mjs"
export const validadoresCompartidos = {
    clientes: {
        validarCliente: async (data) => {
            try {
                const operacion = data.operacion
                const cliente = data.cliente
                const clienteUID = cliente.clienteUID


                const nombre = validadoresCompartidos.tipos.cadena({
                    string: cliente.nombre,
                    nombreCampo: "El campo del nombre",
                    filtro: "strictoConEspacios",
                    sePermiteVacio: "no",
                    limpiezaEspaciosAlrededor: "si",
                    limpiezaEspaciosInternos: "si",
                    soloMayusculas: "si"
                })
                const primerApellido = validadoresCompartidos.tipos.cadena({
                    string: cliente.primerApellido,
                    nombreCampo: "El campo del primer apellido",
                    filtro: "strictoConEspacios",
                    sePermiteVacio: "si",
                    limpiezaEspaciosAlrededor: "si",
                    limpiezaEspaciosInternos: "si",
                    soloMayusculas: "si"
                })
                const segundoApellido = validadoresCompartidos.tipos.cadena({
                    string: cliente.segundoApellido,
                    nombreCampo: "El campo del segundo apellido",
                    filtro: "strictoConEspacios",
                    sePermiteVacio: "si",
                    limpiezaEspaciosAlrededor: "si",
                    limpiezaEspaciosInternos: "si",
                    soloMayusculas: "si"
                })
                const pasaporte = validadoresCompartidos.tipos.cadena({
                    string: cliente.pasaporte,
                    nombreCampo: "El campo del pasaporte",
                    filtro: "strictoConEspacios",
                    sePermiteVacio: "no",
                    limpiezaEspaciosAlrededor: "si",
                    limpiezaEspaciosInternos: "si"
                })

                const correoElectronico = validadoresCompartidos.tipos.correoElectronico({
                    mail: cliente.correoElectronico,
                    nombreCampo: "El coreo electronico instroducido",
                    sePermiteVacio: "si"
                })
                const telefono = validadoresCompartidos.tipos.telefono({
                    phone: cliente.telefono,
                    nombreCampo: "El teelfono instroducido",
                    sePermiteVacio: "si"
                })

                const notas = validadoresCompartidos.tipos.cadena({
                    string: cliente.notas || "",
                    nombreCampo: "El campo de notas",
                    filtro: "strictoConEspacios",
                    sePermiteVacio: "si",
                    limpiezaEspaciosAlrededor: "si",
                })

                if (operacion === "actualizar") {
                    await obtenerClientesPorPasaporteIgnorandoClienteUID({
                        clienteUID,
                        pasaporte,
                        errorSi: "existe"
                    })
                } else if (operacion === "crear") {
                    await obtenerClientesPorPasaporte({
                        pasaporte,
                        errorSi: "existe"
                    })
                } else {
                    const m = "validarClinete necesita el parametro operacion en actualizar o crear"
                    throw new Error(m)
                }

                // if (clienteConMismoPasaporte?.clienteUID) {
                //     const nombreClienteExistente = clienteConMismoPasaporte.nombre
                //     const primerApellidoClienteExistente = clienteConMismoPasaporte.primerApellido
                //     const segundoApellidoClienteExistente = clienteConMismoPasaporte.segundoApellido
                //     const error = `Ya existe un cliente con ese pasaporte: ${nombreClienteExistente} ${primerApellidoClienteExistente} ${segundoApellidoClienteExistente}`
                //     throw new Error(error)
                // }
                const datosValidados = {
                    nombre: nombre,
                    primerApellido: primerApellido,
                    segundoApellido: segundoApellido,
                    pasaporte: pasaporte,
                    telefono: telefono,
                    correoElectronico: correoElectronico,
                    notas: notas,
                    clienteUID
                }
                return datosValidados
            } catch (errorCapturado) {
                throw errorCapturado
            }
        },

    },
    usuarios: {
        unicidadCorreo: async (data) => {
            try {
                const usuario = data.usuario
                const mail = data.mail
                const operacion = data.operacion

                if (operacion === "actualizar") {
                    if (!usuario) {
                        const error = "En unicidadCorreo falta pasar el usuario"
                        throw new Error(error)
                    }
                    const otroUsuariosConMismoMail = await obtenerDatosPersonalesPorMailIgnorandoUsuario({
                        mail,
                        usuario
                    })
                    if (otroUsuariosConMismoMail.length > 0) {
                        const m = "Este email se esta usando en otra cuenta, por favor escoge otro o recupera tu cuenta."
                        throw new Error(m)
                    }
                } else if (operacion === "crear") {
                    const otroUsuariosConMismoMail = await obtenerDatosPersonalesPorMail(mail)
                    if (otroUsuariosConMismoMail.length > 0) {
                        const m = "Este email se esta usando en otra cuenta, por favor escoge otro o recupera tu cuenta."
                        throw new Error(m)
                    }
                } else {
                    const error = "El validador de unicidadCorreo esta mal configurado. Si la operacio es actualizar, falta el usuario."
                    throw new Error(error)
                }

            } catch (errorCapturado) {
                throw errorCapturado
            }
        },
        datosUsuario: (data) => {
            try {


                data.nombre = validadoresCompartidos.tipos.cadena({
                    string: data.nombre,
                    nombreCampo: "El campo del nombre",
                    filtro: "strictoConEspacios",
                    sePermiteVacio: "si",
                    limpiezaEspaciosAlrededor: "si",
                    soloMayusculas: "si"
                })
                data.primerApellido = validadoresCompartidos.tipos.cadena({
                    string: data.primerApellido,
                    nombreCampo: "El campo del primer apellido",
                    filtro: "strictoConEspacios",
                    sePermiteVacio: "si",
                    limpiezaEspaciosAlrededor: "si",
                    soloMayusculas: "si"

                })

                data.segundoApellido = validadoresCompartidos.tipos.cadena({
                    string: data.segundoApellido,
                    nombreCampo: "El campo del segundo apellido",
                    filtro: "strictoConEspacios",
                    sePermiteVacio: "si",
                    limpiezaEspaciosAlrededor: "si",
                    soloMayusculas: "si"
                })

                data.pasaporte = validadoresCompartidos.tipos.cadena({
                    string: data.pasaporte,
                    nombreCampo: "El campo del pasaporte",
                    filtro: "strictoConEspacios",
                    sePermiteVacio: "si",
                    limpiezaEspaciosAlrededor: "si",
                    limpiezaEspaciosInternos: "si",
                    soloMayusculas: "si"

                })
                if (data.mail) {

                    validadoresCompartidos.tipos.correoElectronico({
                        mail: data.mail,
                        nombreCampo: "El coreo electronico instroducido",
                        sePermiteVacio: "no"
                    })

                }

                if (data.telefono) {

                    validadoresCompartidos.tipos.telefono({
                        phone: data.telefono,
                        nombreCampo: "El telefono instroducido",
                        sePermiteVacio: "no"
                    })
                }


            } catch (errorCapturado) {
                throw errorCapturado
            }
        }
    },
    fechas: {
        validarFecha_ISO: async (configuracion) => {
            try {
                if (!configuracion.hasOwnProperty("nombreCampo")) {
                    throw new Error("El validador de fechas ISO mal configurado. no encuentra la llave nombreCampo en el objeto");
                }
                if (!configuracion.hasOwnProperty("fecha_ISO")) {
                    throw new Error("El validador de fechas ISO mal configurado. no encuentra la llave fecha_ISO en el objeto");
                }

                const fecha_ISO = configuracion.fecha_ISO
                const nombreCampo = configuracion.nombreCampo

                if (typeof fecha_ISO !== "string") {
                    const error = `${nombreCampo} no cumple el formato de cadena`
                    throw new Error(error)
                }
                const filtroFecha_ISO = /^\d{4}-\d{2}-\d{2}$/;
                if (!filtroFecha_ISO.test(fecha_ISO)) {
                    const error = `${nombreCampo} no cumple el formato ISO esperado`
                    throw new Error(error)
                }
                const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
                const fechaControl = DateTime.fromISO(fecha_ISO, { zone: zonaHoraria }).isValid;
                if (!fechaControl) {
                    const error = `${nombreCampo} no es valida, representacion no terraquea`
                    throw new Error(error)
                }
                return fecha_ISO
            } catch (errorCapturado) {
                throw errorCapturado
            }
        },
        validarFecha_Humana: async (fecha_Humana) => {
            try {
                if (typeof fecha_Humana !== "string") {
                    const error = "La fecha no cumple el formato cadena esperado"
                    throw new Error(error)
                }
                const filtroFecha_Humana = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
                if (!filtroFecha_Humana.test(fecha_Humana)) {
                    const error = "La fecha no cumple el formato Humano esperado"
                    throw new Error(error)
                }
                const fechaArreglo = fecha_Humana.split("/")
                const dia = fechaArreglo[0]
                const mes = fechaArreglo[1]
                const ano = fechaArreglo[2]
                const fecha_ISO = `${ano}-${mes}-${dia}`
                const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
                //const fechaControl = DateTime.fromISO(fecha_ISO, { zone: zonaHoraria }).isValid;
                const fechaControl = DateTime.fromObject({
                    day: dia,
                    month: mes,
                    year: ano
                }, { zone: zonaHoraria }).isValid;
                if (!fechaControl) {
                    const error = "La fecha no es valida, representacion no terraquea"
                    throw new Error(error)
                }
                const estructura = {
                    fechaGranulada: {
                        dia: dia,
                        mes: mes,
                        ano: ano,
                    },
                    fecha_ISO: fecha_ISO
                }
                return estructura
            } catch (errorCapturado) {
                throw errorCapturado
            }
        },
        fechaMesAno: async (fechaMesAno) => {
            try {
                if (typeof fechaMesAno !== "string") {
                    const error = "La fecha no cumple el formato cadena esperado"
                    throw new Error(error)
                }
                //Ojo por que esto es nes-ano:
                const filtroFecha = /^([1-9]|1[0-2])-(\d{1,})$/;
                if (!filtroFecha.test(fechaMesAno)) {
                    const error = "La fecha no cumple el formato especifico. En este caso se espera una cadena con este formado MM-YYYY, si el mes tiene un digio, es un digito, sin el cero delante. Por ejemplo 5-2024 o 10-2024";
                    throw new Error(error);
                }
            } catch (errorCapturado) {
                throw errorCapturado
            }
        },
        validacionVectorial: async (configuracion) => {
            try {
                const fechaEntrada = await validadoresCompartidos.fechas.validarFecha_ISO({
                    fecha_ISO: configuracion.fechaEntrada,
                    nombreCampo: "La fecha de entrada en el validor vectorial"
                })
                const fechaSalida = await validadoresCompartidos.fechas.validarFecha_ISO({
                    fecha_ISO: configuracion.fechaSalida,
                    nombreCampo: "La fecha de salida en el validador vectorial"
                })

                const fechaEntrada_obejto = DateTime.fromISO(fechaEntrada)
                const fechaSalida_obejto = DateTime.fromISO(fechaSalida)
                const tipoVector = configuracion.tipoVector

                if (tipoVector === "igual") {
                    if (fechaEntrada_obejto > fechaSalida_obejto) {
                        const error = "La fecha de entrada seleccionada es superior a la fecha de salida de la reserva";
                        throw new Error(error);
                    }
                } else if (tipoVector === "diferente") {
                    if (fechaEntrada_obejto >= fechaSalida_obejto) {
                        const error = "La fecha de entrada seleccionada es igual o superior a la fecha de salida de la reserva";
                        throw new Error(error);
                    }
                } else {
                    const error = "El validador de fechas validacionVectorail esta mas configurado. Necesita la especificaicon de tipoVector.                    "
                    throw new Error(error)
                }

            } catch (errorCapturado) {
                throw errorCapturado
            }

        },
        cadenaMes: (mes) => {
            try {
                const filtro = /(1[0-2]|[1-9])$/
                if (!filtro.test(mes)) {
                    const error = "El mes (mesCalendario) debe de ser una cadena que contenga un numero del 1 al 12";
                    throw new Error(error);
                }
            } catch (errorCapturado) {
                throw errorCapturado
            }

        },
        cadenaAno: (ano) => {
            try {
                const filtro = /^(2000|[2-4][0-9]{3}|5000)$/
                if (!filtro.test(ano)) {
                    const error = "El año no puede ser inferior a 2000 ni superior a 5000";
                    throw new Error(error);
                }
            } catch (errorCapturado) {
                throw errorCapturado
            }
        },
        fechaEnRango: async (data) => {
            try {

                const fechaAComprobrarDentroDelRango = data.fechaAComprobrarDentroDelRango
                const fechaInicioRango_ISO = data.fechaInicioRango_ISO
                const fechaFinRango_ISO = data.fechaFinRango_ISO

                await validadoresCompartidos.fechas.validarFecha_ISO({
                    fecha_ISO: fechaAComprobrarDentroDelRango,
                    nombreCampo: "La fecha a comprobar dentro del rango"
                })

                await validadoresCompartidos.fechas.validarFecha_ISO({
                    fecha_ISO: fechaInicioRango_ISO,
                    nombreCampo: "La fecha fe inicio del rango"
                })
                await validadoresCompartidos.fechas.validarFecha_ISO({
                    fecha_ISO: fechaFinRango_ISO,
                    nombreCampo: "La fecha del fin del rango"
                })

                const fechaObjetoAComprobar = DateTime.fromISO(fechaAComprobrarDentroDelRango);
                const fechaObjetoInicio = DateTime.fromISO(fechaInicioRango_ISO);
                const fechaObjetoFin = DateTime.fromISO(fechaFinRango_ISO);
                return fechaObjetoAComprobar >= fechaObjetoInicio && fechaObjetoAComprobar <= fechaObjetoFin;
            } catch (errorCapturado) {
                throw errorCapturado
            }
        }
    },
    claves: {
        minimoRequisitos: (clave) => {
            try {
                if (!clave &&
                    typeof clave !== "srting" &&
                    clave.length < 12) {
                    const error = "La contraseña debe de tener un minimo de 12 caracteres"
                    throw new Error(error)
                }
                let tieneMayuscula = false;
                let tieneNumero = false;
                let tieneCaracterEspecial = false;
                // Verifica cada carácter de la clave
                for (var i = 0; i < clave.length; i++) {
                    var caracter = clave.charAt(i);
                    // Verifica si el carácter es una mayúscula
                    if (caracter >= "A" && caracter <= "Z") {
                        tieneMayuscula = true;
                    }
                    // Verifica si el carácter es un número
                    else if (caracter >= "0" && caracter <= "9") {
                        tieneNumero = true;
                    }
                    // Verifica si el carácter es un carácter especial
                    else if ("!@#$%^&*()_+".indexOf(caracter) !== -1) {
                        tieneCaracterEspecial = true;
                    }
                }
                if (!tieneMayuscula) {
                    const error = "Por favor ponga como minimo una mayuscula en su contraseña"
                    throw new Error(error)
                }
                if (!tieneNumero) {
                    const error = "Por favor ponga como minimo un numero en su contraseña"
                    throw new Error(error)
                }
                if (!tieneCaracterEspecial) {
                    const error = "Por favor ponga como minimo un caracter especial en su contraseña, como por ejemplo: ! @ # $ % ^ & * ( ) _ +"
                    throw new Error(error)
                }
            } catch (errorCapturado) {
                throw errorCapturado
            }
        }
    },
    tipos: {
        cadena: (configuracion) => {
            let string = configuracion?.string
            const nombreCampo = configuracion.nombreCampo
            const filtro = configuracion.filtro
            const sePermiteVacio = configuracion.sePermiteVacio
            const limpiezaEspaciosAlrededor = configuracion.limpiezaEspaciosAlrededor
            const limpiezaEspaciosInternos = configuracion.limpiezaEspaciosInternos || "no"
            const limpiezaEspaciosInternosGrandes = configuracion.limpiezaEspaciosInternosGrandes || "no"
            const soloMinusculas = configuracion.soloMinusculas || "no"
            const soloMayusculas = configuracion.soloMayusculas || "no"


            if (!configuracion.hasOwnProperty("string")) {
                throw new Error("El validador de numeros no encuentra la llave string en el objeto");
            }

            if (!nombreCampo) {
                const mensaje = `El validador de cadenas, necesito un nombre de campo.`
                throw new Error(mensaje)
            }
            if (typeof string !== "string") {
                const mensaje = `${nombreCampo} debe de ser una cadena.`
                throw new Error(mensaje)
            }
            if (typeof sePermiteVacio !== "string" &&
                (sePermiteVacio !== "si" && sePermiteVacio !== "no")) {
                const mensaje = `El validor de cadena esta mal configurado, sePermiteVacio solo acepta si o no y es obligatorio declararlo en la configuracíon.`
                throw new Error(mensaje)
            }
            if (typeof limpiezaEspaciosAlrededor !== "string" &&
                (limpiezaEspaciosAlrededor !== "si" && limpiezaEspaciosAlrededor !== "no")) {
                const mensaje = `El validor de cadena esta mal configurado, limpiezaEspaciosAlrededor solo acepta si o no.`
                throw new Error(mensaje)
            }
            if (limpiezaEspaciosInternos &&
                typeof limpiezaEspaciosInternos !== "string" &&
                (limpiezaEspaciosInternos !== "si" && limpiezaEspaciosInternos !== "no")) {
                const mensaje = `El validor de cadena esta mal configurado, limpiezaEspaciosInternos solo acepta si o no.`
                throw new Error(mensaje)
            }
            if (limpiezaEspaciosInternos === "si") {
                string = string.replaceAll(" ", "")
            }

            if (limpiezaEspaciosInternosGrandes &&
                typeof limpiezaEspaciosInternosGrandes !== "string" &&
                (limpiezaEspaciosInternosGrandes !== "si" && limpiezaEspaciosInternosGrandes !== "no")) {
                const mensaje = `El validor de cadena esta mal configurado, limpiezaEspaciosInternosGrandes solo acepta si o no.`
                throw new Error(mensaje)
            }
            if (limpiezaEspaciosInternosGrandes === "si") {
                string = string.replace(/\s+/g, " ");
            }

            if (soloMinusculas &&
                typeof soloMayusculas !== "string" &&
                (soloMinusculas !== "si" && soloMinusculas !== "no")) {
                const mensaje = `El validor de cadena esta mal configurado, soloMinusculas solo acepta si o no.`
                throw new Error(mensaje)
            }
            if (soloMayusculas !== "si" && soloMayusculas !== "no") {
                const mensaje = `El validor de cadena esta mal configurado, soloMayusculas solo acepta si o no.`
                throw new Error(mensaje)
            }

            if (sePermiteVacio === "si" && string === "") {
                return string
            } else if (string.length === 0 || string === "") {
                const mensaje = `${nombreCampo} esta vacío.`
                throw new Error(mensaje)
            }
            if (limpiezaEspaciosAlrededor === "si") {
                string = string
                    .replace(/\s+/g, ' ')
                    .trim()
            }
            if (soloMinusculas === "si") {
                string = string
                    .toLowerCase()
            }
            if (soloMayusculas === "si") {
                string = string
                    .toUpperCase()
            }
            if (filtro === "strictoSinEspacios") {
                try {
                    const filtro = /^[a-zA-Z0-9_\-\/\.]+$/;
                    if (!filtro.test(string)) {
                        const mensaje = `${nombreCampo} solo acepta una cadena de mayusculas, minusculas, numeros y los siguientes caracteres: _, -, . y /`
                        throw new Error(mensaje)
                    }
                } catch (errorCapturado) {
                    throw errorCapturado
                }
            } else if (filtro === "strictoIDV") {
                try {
                    const filtro = /^[a-zA-Z0-9]+$/;
                    if (!filtro.test(string)) {
                        const mensaje = `${nombreCampo} solo acepta una cadena de mayusculas, minusculas y numeros.`
                        throw new Error(mensaje)
                    }
                } catch (errorCapturado) {
                    throw errorCapturado
                }
            } else if (filtro === "strictoConEspacios") {
                try {
                    const filtro = /^[a-zA-Z0-9_\s\-\/\.,:\u00F1ñ+]+$/;
                    if (!filtro.test(string)) {
                        const mensaje = `${nombreCampo} solo acepta una cadena de mayusculas, minusculas, numeros, espacios y los siguientes caracteres: _, -, . y /`
                        throw new Error(mensaje)
                    }

                } catch (errorCapturado) {
                    throw errorCapturado
                }
            } else if (filtro === "sustitucionSinEspacios") {
                const filtro = /[^a-zA-Z0-9_\-\/\.]/g;
                string = string.replace(filtro, '');
            } else if (filtro === "transformaABase64") {
                const codigoDescuentoComoBuffer = Buffer.from(string, "utf8")
                const codigoDescuentoB64 = codigoDescuentoComoBuffer.toString("base64")
                string = codigoDescuentoB64
            } else if (filtro === "sustitucionConEspacios") {
                const filtro = /^[a-zA-Z0-9_ \-\/\.]+$/;
                string = string.replace(filtro, '');
            } else if (filtro === "cadenaConNumerosConDosDecimales") {
                try {
                    const filtroComa = /^\d+\,\d{2}$/
                    if (filtroComa.test(string)) {
                        const mensaje = `${nombreCampo} cambia la coma por un punto, gracias.`
                        throw new Error(mensaje)
                    }

                    const filtro = /^\d+\.\d{2}$/
                    if (!filtro.test(string)) {
                        const mensaje = `${nombreCampo} solo acepta una cadena con numeros con dos decimales separados por punto, por ejemplo 00.00`
                        throw new Error(mensaje)
                    }

                    const impedirCero = configuracion.impedirCero || "si"
                    if (impedirCero !== "si" && impedirCero !== "no") {
                        const mensaje = `El validor de cadena esta mal configurado, impedirCero solo acepta si o no.`
                        throw new Error(mensaje)
                    }

                    if (impedirCero === "si") {
                        const numero = parseFloat(string)
                        if (numero === 0) {
                            const mensaje = `${nombreCampo} no permite valores de cero.`
                            throw new Error(mensaje)
                        }
                    }

                    const devuelveUnTipoNumber = configuracion.devuelveUnTipoNumber
                    if (typeof devuelveUnTipoNumber !== "string" &&
                        (devuelveUnTipoNumber !== "si" && devuelveUnTipoNumber !== "no")) {
                        const mensaje = `El validor de cadena esta mal configurado, devuelveUnTipoNumber solo acepta si o no.`
                        throw new Error(mensaje)
                    }

                    if (devuelveUnTipoNumber === "si") {
                        string = Number(string)
                    }

                } catch (errorCapturado) {
                    throw errorCapturado
                }
            } else if (filtro === "cadenaConNumerosEnteros") {
                try {
                    const filtro = /^[0-9]+$/
                    if (!filtro.test(string)) {
                        const mensaje = `${nombreCampo} solo acepta una cadena con numeros enteros`
                        throw new Error(mensaje)
                    }
                    const maximoDeLargo = configuracion.maximoDeLargo
                    if (maximoDeLargo && typeof maximoDeLargo !== "number") {
                        const mensaje = `El validor de cadena esta mal configurado, maximoDeLargo solo acepta numeros.`
                        throw new Error(mensaje)
                    }
                    if (maximoDeLargo) {
                        if (string.length > maximoDeLargo) {
                            const mensaje = `${nombreCampo} solo acepta un maximo de ${maximoDeLargo} numeros.`
                            throw new Error(mensaje)
                        }
                    }
                    const impedirCero = configuracion.impedirCero || "si"
                    if (impedirCero !== "si" && impedirCero !== "no") {
                        const mensaje = `El validor de cadena esta mal configurado, impedirCero solo acepta si o no.`
                        throw new Error(mensaje)
                    }

                    if (impedirCero === "si") {
                        const numero = parseFloat(string)
                        if (numero === 0) {
                            const mensaje = `${nombreCampo} no permite valores de cero.`
                            throw new Error(mensaje)
                        }
                    }
                    const devuelveUnTipoNumber = configuracion.devuelveUnTipoNumber
                    if (typeof devuelveUnTipoNumber !== "string" &&
                        (devuelveUnTipoNumber !== "si" && devuelveUnTipoNumber !== "no")) {
                        const mensaje = `El validor de cadena esta mal configurado, devuelveUnTipoNumber solo acepta si o no.`
                        throw new Error(mensaje)
                    }
                    if (devuelveUnTipoNumber === "si") {
                        string = Number(string)
                    }

                } catch (errorCapturado) {
                    throw errorCapturado
                }
            } else if (filtro === "cadenaBase64") {
                try {
                    const filtro = /^[A-Za-z0-9+/=]+$/
                    if (!filtro.test(string)) {
                        const mensaje = `${nombreCampo} solo acepta una cadena en base 64`
                        throw new Error(mensaje)
                    }
                } catch (errorCapturado) {
                    throw errorCapturado
                }
            } else if (filtro === "url") {
                try {
                    const filtro = /^[A-Za-z0-9_\-/%=:]*$/;
                    if (!filtro.test(string)) {
                        const mensaje = `${nombreCampo} solo acepta una cadena de minusculas, mayusculas, numeros y estos caracteres: _, \, %, -, /, = y :`
                        throw new Error(mensaje)
                    }
                } catch (errorCapturado) {
                    throw errorCapturado
                }
            }
            else {
                const mensaje = `El validador de cadenas, necesito un identificador de filtro valido`
                throw new Error(mensaje)
            }
            return string
        },
        numero: (configuracion) => {

            let number = configuracion.number
            const nombreCampo = configuracion.nombreCampo
            const filtro = configuracion.filtro
            const sePermiteVacio = configuracion.sePermiteVacio
            const sePermiteCero = configuracion.sePermiteCero
            const limpiezaEspaciosAlrededor = configuracion.limpiezaEspaciosAlrededor
            const sePermitenNegativos = configuracion.sePermitenNegativos || "no"


            if (!configuracion.hasOwnProperty("number")) {
                throw new Error("El validador de numeros no encuentra la llave number en el objeto");
            }

            if (!configuracion.hasOwnProperty("nombreCampo")) {
                throw new Error("El validador de numeros no encuentra la llave nombreCampo en el objeto");
            }


            if (!nombreCampo) {
                const mensaje = `El validador de cadenas, necesito un nombre de campo.`
                throw new Error(mensaje)
            }
            if (typeof number !== "number") {
                const mensaje = `${nombreCampo} debe de ser un numero.`
                throw new Error(mensaje)
            }
            if (typeof sePermiteVacio !== "string" &&
                (sePermiteVacio !== "si" && sePermiteVacio !== "no")) {
                const mensaje = `El validor de cadena esta mal configurado, sePermiteVacio solo acepta si o no y es obligatorio declararlo en la configuracíon.`
                throw new Error(mensaje)
            }

            if (typeof limpiezaEspaciosAlrededor !== "string" &&
                (limpiezaEspaciosAlrededor !== "si" && limpiezaEspaciosAlrededor !== "no")) {
                const mensaje = `El validor de cadena esta mal configurado, limpiezaEspaciosAlrededor solo acepta si o no.`
                throw new Error(mensaje)
            }

            if (sePermitenNegativos &&
                typeof sePermitenNegativos !== "string" &&
                (sePermitenNegativos !== "si" && sePermitenNegativos !== "no")) {
                const mensaje = `El validor de numero esta mal configurado, sePermitenNegativos solo acepta si o no.`
                throw new Error(mensaje)
            }
            if (sePermitenNegativos === "no") {
                if (number < 0) {
                    const mensaje = `No se permiten numeros negativos, por favor revisalo.`
                    throw new Error(mensaje)
                }
            }

            if (sePermiteCero === "no") {
                if (number === 0) {
                    const mensaje = `No se permiten el cero, por favor revisalo.`
                    throw new Error(mensaje)
                }
            }
            if (filtro === "numeroSimple") {
                try {
                    if (!Number.isInteger(number)) {
                        const mensaje = `${nombreCampo} solo acepta numeros enteros, sin decimales.`
                        throw new Error(mensaje)
                    }
                } catch (errorCapturado) {
                    throw errorCapturado
                }

            } else {
                const mensaje = `El validador de numeros, necesito un identificador de filtro valido`
                throw new Error(mensaje)

            }
            return number


        },
        correoElectronico: (configuracion) => {
            try {
                let mail = configuracion.mail
                const nombreCampo = configuracion.nombreCampo
                const sePermiteVacio = configuracion.sePermiteVacio

                if (!configuracion.hasOwnProperty("mail")) {
                    throw new Error("El validador de mail no encuentra la llave mail en el objeto");
                }

                if (!configuracion.hasOwnProperty("nombreCampo")) {
                    throw new Error("El validador de numeros no encuentra la llave nombreCampo en el objeto");
                }
                if (typeof sePermiteVacio !== "mail" &&
                    (sePermiteVacio !== "si" && sePermiteVacio !== "no")) {
                    const mensaje = `El validor de mail esta mal configurado, sePermiteVacio solo acepta si o no y es obligatorio declararlo en la configuracíon.`
                    throw new Error(mensaje)
                }

                if (sePermiteVacio === "si" && mail === "") {
                    return mail
                } else if (mail.length === 0 || mail === "") {
                    const mensaje = `${nombreCampo} esta vacío.`
                    throw new Error(mensaje)
                }
                if (typeof mail !== "string") {
                    const error = "El campo de correo electroníco debe de ser una cadena"
                    throw new Error(error)
                }
                const filtroCorreoElectronico = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/;
                const cadenaCorreoLimpia = mail
                    .trim()
                    .toLowerCase()
                if (!filtroCorreoElectronico.test(cadenaCorreoLimpia)) {
                    const error = "El campo de correo electroníco no cumple con el formato esperado, el formato esperado es asi como usuario@servidor.com"
                    throw new Error(error)
                }
                return cadenaCorreoLimpia
            } catch (errorCapturado) {
                throw errorCapturado
            }

        },
        telefono: (configuracion) => {
            try {

                let phone = configuracion.phone
                const nombreCampo = configuracion.nombreCampo
                const sePermiteVacio = configuracion.sePermiteVacio

                if (!configuracion.hasOwnProperty("phone")) {
                    throw new Error("El validador de phone no encuentra la llave phone en el objeto");
                }

                if (!configuracion.hasOwnProperty("nombreCampo")) {
                    throw new Error("El validador de mail no encuentra la llave nombreCampo en el objeto");
                }
                if (sePermiteVacio === "si" && phone === "") {
                    return phone
                } else if (phone.length === 0 || phone === "") {
                    const mensaje = `${nombreCampo} esta vacío.`
                    throw new Error(mensaje)
                }

                if (!phone) {
                    const error = "El campo del telefono está vacío."
                    throw new Error(error)
                }
                if (typeof phone !== "string") {
                    const error = "el campo Telefono debe de ser una cadena."
                    throw new Error(error)
                }
                const filtroTelefono = /[^0-9]+/g
                const telefonoLimpio = phone
                    .replace(/\s+/g, '')
                    .replace("+", '00')
                    .trim()

                if (filtroTelefono.test(telefonoLimpio)) {
                    const error = "el campo Telefono no cumple con el formato esperado, el formado esperado es una cadena con numeros"
                    throw new Error(error)
                }
                return telefonoLimpio
            } catch (errorCapturado) {
                throw errorCapturado
            }
        },
        array: (configuracion) => {
            try {
                const array = configuracion.array
                const nombreCampo = configuracion.nombreCampo
                const filtro = configuracion.filtro
                const sePermiteArrayVacio = configuracion?.sePermiteArrayVacio || "no"

                if (!nombreCampo) {
                    const mensaje = `El validador de arrays, necesito un nombre de campo.`
                    throw new Error(mensaje)
                }
                if (!Array.isArray(array) || array == null || array === undefined) {
                    const error = `${nombreCampo} se esperaba que fuera un array`;
                    throw new Error(error);
                }



                if (sePermiteArrayVacio !== "no" && sePermiteArrayVacio !== "si") {
                    const error = `${nombreCampo} el valdidador array mal configurado, si se define sePermiteArrayVacio tiene que esta en si o no. Predeterminadamente es no.`;
                    throw new Error(error);
                }

                if (array.length === 0 && sePermiteArrayVacio === "no") {
                    const error = `${nombreCampo} es un array vacío`;
                    throw new Error(error);
                }


                if (filtro === "strictoIDV") {
                    array.forEach((item, posicion) => {
                        validadoresCompartidos.tipos.cadena({
                            string: item,
                            nombreCampo: `${nombreCampo} es un array que en la posicion ${(posicion + 1)} tiene un tipo que no es cadena, este array solo acepta cadenas.`,
                            filtro: "strictoIDV",
                            sePermiteVacio: "no",
                            limpiezaEspaciosAlrededor: "si"
                        })
                    })
                } else if (filtro === "strictoConEspacios") {
                    array.forEach((item, posicion) => {
                        validadoresCompartidos.tipos.cadena({
                            string: item,
                            nombreCampo: `${nombreCampo} es un array que en la posicion ${(posicion + 1)}`,
                            filtro: "strictoConEspacios",
                            sePermiteVacio: "no",
                            limpiezaEspaciosAlrededor: "si"
                        })
                    })
                } else if (filtro === "soloNumerosEnteros") {
                    array.every((cadena, index) => {
                        validadoresCompartidos.tipos.cadena({
                            string: cadena,
                            nombreCampo: `En la posicion ${index} del array debe haber una cadena con numeros`,
                            filtro: "cadenaConNumerosEnteros",
                            sePermiteVacio: "no",
                            limpiezaEspaciosAlrededor: "si"
                        })
                    })
                }

                const sePermitenDuplicados = configuracion.sePermitenDuplicados
                if (sePermitenDuplicados) {
                    if (sePermitenDuplicados !== "si" && sePermitenDuplicados !== "no") {
                        const mensaje = `El validor de cadena esta mal configurado, sePermitenDuplicados solo acepta si o no.`
                        throw new Error(mensaje)
                    }
                    if (sePermitenDuplicados === "no") {
                        const arrayFiltrado = array.map((cadenaEnElArray) => {
                            if (typeof cadenaEnElArray === "string") {
                                return cadenaEnElArray.toLowerCase();
                            } else {
                                return cadenaEnElArray;
                            }
                        });
                        const controlDuplicados = new Set(arrayFiltrado).size !== arrayFiltrado.length;
                        if (controlDuplicados) {
                            const error = `${nombreCampo} que es un array filtrado, tiene duplicados y no deberia tener.`;
                            throw new Error(error);
                        }
                    }
                }



                return array
            } catch (errorCapturado) {
                throw errorCapturado
            }
        },
        objetoLiteral: (configuracion) => {
            try {
                const objetoLiteral = configuracion.objetoLiteral
                const nombreCampo = configuracion.nombreCampo

                if (!nombreCampo) {
                    const mensaje = `El validador de objetos, necesito un nombre de campo.`
                    throw new Error(mensaje)
                }
                const control = objetoLiteral !== null && typeof objetoLiteral === 'object' && objetoLiteral.constructor === Object;
                if (!control) {
                    const error = `${nombreCampo} se esperara que fuera un objeto literal`;
                    throw new Error(error);
                }
                return objetoLiteral
            } catch (errorCapturado) {
                throw errorCapturado

            }
        },
        url: (configuracion) => {

            const url = configuracion.url
            const nombreCampo = configuracion.nombreCampo
            const arrayDeDominiosPermitidos = configuracion.arrayDeDominiosPermitidos

            if (!url) {
                const error = `${nombreCampo} está vacío`;
                throw new Error(error);
            }
            const filtroURL = /^https:\/\/[^\s/$.?#].[^\s]*$/;
            if (!filtroURL.test(url)) {
                const error = `${nombreCampo} no cumple con el formato esperado de una url.`;
                throw new Error(error);
            }
            if (!validator.isURL(url)) {
                const error = "La url no cumple con el formato esperado, por favor revisa la url";
                throw new Error(error);
            }

            if (arrayDeDominiosPermitidos) {
                const arrayFiltrado = validadoresCompartidos.tipos.array({
                    array: arrayDeDominiosPermitidos,
                    nombreCampo: "El array de dominios permitidos dentro del tipo url",
                    filtro: "soloCadenasIDV",
                    sePermitenDuplicados: "no"
                })
                const controlDominio = new URL(url);
                const dominiofinal = controlDominio.hostname;
                if (!arrayFiltrado.includes(dominiofinal)) {
                    const error = "La url o el dominio no son los esperados. Revisa el formato de la url y el dominio. Solo se acepta el dominio airbnb.com";
                    throw new Error(error);
                }
            }
            return url
        },
        horas: (configuracion) => {

            const hora = configuracion.hora
            const nombreCampo = configuracion.nombreCampo
            const filtroHora = /^(0\d|1\d|2[0-3]):([0-5]\d)$/;

            if (!hora) {
                const error = `${nombreCampo} está vacío`;
                throw new Error(error);
            }
            if (!filtroHora.test(hora)) {
                const error = `${nombreCampo} debe de ser 00:00 y no puede ser superior a 23:59, si quieres poner la hora por ejemplo 7:35 -> Tienes que poner el 0 delante del siete, por ejemplo 07:35`;
                throw new Error(error);
            }
            return hora
        },
        urlPath: (configuracion) => {

            const urlPath = configuracion.urlPath
            const nombreCampo = configuracion.nombreCampo

            if (!urlPath) {
                const error = `${nombreCampo} está vacío`;
                throw new Error(error);
            }
            const filtroURL = /^[a-zA-Z0-9/_./]+$/;
            if (!filtroURL.test(urlPath)) {
                const error = `${nombreCampo} no cumple con el formato esperado de una url.`;
                throw new Error(error);
            }
            return urlPath
        },
        json: (configuracion) => {
            const json = configuracion.json
            if (Array.isArray(json)) {
                return json.map(quoteKeys);
            } else if (json !== null && typeof json === 'object') {
                return Object.keys(json).reduce((acc, key) => {
                    acc[`"${key}"`] = quoteKeys(json[key]);
                    return acc;
                }, {});
            }
            return json;
        }
    },
    baseDeDatos: {
        validarNombreColumna: async (configuracion) => {
            try {
                const nombreColumna = validadoresCompartidos.tipos.cadena({
                    string: configuracion.nombreColumna,
                    nombreCampo: "El campo de nombreColumna del validador de columnas",
                    filtro: "strictoIDV",
                    sePermiteVacio: "no",
                    limpiezaEspaciosAlrededor: "si",
                })

                const tabla = validadoresCompartidos.tipos.cadena({
                    string: configuracion.tabla,
                    nombreCampo: "El campo tabla dentro de validador de columnas",
                    filtro: "strictoIDV",
                    sePermiteVacio: "no",
                    limpiezaEspaciosAlrededor: "si",
                })

                const columna = await obtenerNombreColumnaPorTabla({
                    tabla: tabla,
                    nombreColumna: nombreColumna
                })

                if (columna?.length === 0) {
                    const error = `No existe el la columna ${nombreColumna}`;
                    throw new Error(error);
                }
            } catch (errorCapturado) {
                throw errorCapturado
            }
        }
    },
    filtros: {
        sentidoColumna: (sentidoColumna) => {
            try {
                if (sentidoColumna !== "ascendente" && sentidoColumna !== "descendente") {
                    const error = "El campo sentido columna solo acepta un sentido ascendente o descendente"
                    throw new Error(error)
                }
            } catch (errorCapturado) {
                throw errorCapturado
            }
        },
        estados: (estado) => {
            try {
                if (estado !== "activado" && estado !== "desactivado") {
                    const error = "El estado solo puede ser activado o desactivado"
                    throw new Error(error)
                }
            } catch (errorCapturado) {
                throw errorCapturado
            }
        },
        limiteCienNumero: (cantidad) => {
            try {
                if (new Decimal(cantidad).greaterThan(100)) {
                    const error = "Cuidado! No se puede acepatar un porcentaje superior a 100% por que sino la oferta podria generar numeros negativos.";
                    throw new Error(error);
                }
            } catch (errorCapturado) {
                throw errorCapturado
            }

        },
        comparadorArraysExactos: (data) => {
            const arrayPrimero = data.arrayPrimero
            const arraySegundo = data.arraySegundo

            const setPrimero = new Set(arrayPrimero);
            const setSegundo = new Set(arraySegundo);

            if (setPrimero.size !== setSegundo.size) {
                return false;
            }
            for (let elemento of setPrimero) {
                if (!setSegundo.has(elemento)) {
                    return false;
                }
            }
            return true;
        }
    },

}
