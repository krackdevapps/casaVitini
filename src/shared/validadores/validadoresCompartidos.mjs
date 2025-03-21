import { DateTime } from "luxon"
import { codigoZonaHoraria } from "../configuracion/codigoZonaHoraria.mjs"
import Decimal from "decimal.js"
import { obtenerClientesPorPasaporte } from "../../infraestructure/repository/clientes/obtenerClientesPorPasaporte.mjs"
import { obtenerDatosPersonalesPorMail } from "../../infraestructure/repository/usuarios/obtenerDatosPersonalesPorMail.mjs"
import { obtenerNombreColumnaPorTabla } from "../../infraestructure/repository/globales/obtenerNombreColumnaPorTabla.mjs"
import { obtenerDatosPersonalesPorMailIgnorandoUsuario } from "../../infraestructure/repository/usuarios/obtenerDatosPersonalesPorMailIgnorandoUsuario.mjs"
import { obtenerClientesPorPasaporteIgnorandoClienteUID } from "../../infraestructure/repository/clientes/obtenerClientesPorPasaporteIgnorandoClienteUID.mjs"
import validator from "validator"

export const validadoresCompartidos = {
    clientes: {
        validarCliente: async (data) => {
            try {
                const operacion = data.operacion
                const cliente = data.cliente
                const clienteUID = cliente?.clienteUID


                const nombre = validadoresCompartidos.tipos.cadena({
                    string: cliente.nombre,
                    nombreCampo: "El campo del nombre",
                    filtro: "strictoConEspacios",
                    sePermiteVacio: "no",
                    limpiezaEspaciosAlrededor: "si",
                    limpiezaEspaciosInternos: "no",
                    soloMayusculas: "si"
                })
                const primerApellido = validadoresCompartidos.tipos.cadena({
                    string: cliente.primerApellido,
                    nombreCampo: "El campo del primer apellido",
                    filtro: "strictoConEspacios",
                    sePermiteVacio: "si",
                    limpiezaEspaciosAlrededor: "si",
                    limpiezaEspaciosInternos: "no",
                    soloMayusculas: "si"
                })
                const segundoApellido = validadoresCompartidos.tipos.cadena({
                    string: cliente.segundoApellido,
                    nombreCampo: "El campo del segundo apellido",
                    filtro: "strictoConEspacios",
                    sePermiteVacio: "si",
                    limpiezaEspaciosAlrededor: "si",
                    limpiezaEspaciosInternos: "no",
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
                    nombreCampo: "El coreo electrónico introducido",
                    sePermiteVacio: "si"
                })
                const telefono = validadoresCompartidos.tipos.telefono({
                    phone: cliente.telefono,
                    nombreCampo: "El teléfono introducido",
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
                    const m = "validarClinete necesita el parámetro de operación en actualizar o crear"
                    throw new Error(m)
                }
                const testingVI = process.env.TESTINGVI
                if (testingVI) {
                    validadoresCompartidos.tipos.cadena({
                        string: testingVI,
                        nombreCampo: "El campo testingVI",
                        filtro: "strictoIDV",
                        sePermiteVacio: "no",
                        limpiezaEspaciosAlrededor: "si",
                    })
                    cliente.testingVI = testingVI
                }








                const datosValidados = {
                    nombre: nombre,
                    primerApellido: primerApellido,
                    segundoApellido: segundoApellido,
                    pasaporte: pasaporte,
                    telefono: telefono,
                    correoElectronico: correoElectronico,
                    notas: notas,
                    mail: correoElectronico,
                    clienteUID,
                    testingVI
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
                        const m = "Este correo se está usando en otra cuenta, por favor escoge otro o recupera tu cuenta."
                        throw new Error(m)
                    }
                } else if (operacion === "crear") {
                    const otroUsuariosConMismoMail = await obtenerDatosPersonalesPorMail(mail)
                    if (otroUsuariosConMismoMail.length > 0) {
                        const m = "Este correo se está usando en otra cuenta, por favor escoge otro o recupera tu cuenta."
                        throw new Error(m)
                    }
                } else {
                    const error = "El validador de unicidadCorreo está mal configurado. Si la operación es actualizar, falta el usuario."
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
                        nombreCampo: "El correo electrónico introducido",
                        sePermiteVacio: "no"
                    })
                }
                if (data.telefono) {
                    validadoresCompartidos.tipos.telefono({
                        phone: data.telefono,
                        nombreCampo: "El teléfono introducido",
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
                    throw new Error("El validador de fechas ISO mal configurado. No encuentra la llave nombreCampo en el objeto");
                }
                if (!configuracion.hasOwnProperty("fecha_ISO")) {
                    throw new Error("El validador de fechas ISO mal configurado. No encuentra la llave fecha_ISO en el objeto");
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
                    const error = `${nombreCampo} no es válida, representación no terráquea`
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

                const fechaControl = DateTime.fromObject({
                    day: dia,
                    month: mes,
                    year: ano
                }, { zone: zonaHoraria }).isValid;
                if (!fechaControl) {
                    const error = "La fecha no es válida, representación no terráquea"
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

                const filtroFecha = /^([1-9]|1[0-2])-(\d{1,})$/;
                if (!filtroFecha.test(fechaMesAno)) {
                    const error = "La fecha no cumple el formato específico. En este caso se espera una cadena con este formado MM-YYYY. Si el mes tiene un dígito, es un dígito, sin el cero delante. Por ejemplo, 5-2024 o 10-2024";
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
                    const error = "El validador de fechas validacionVectorail está más configurado. Necesita la especificación de tipoVector"
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
                    const error = "El mes (mesCalendario) debe de ser una cadena que contenga un número del 1 al 12";
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
                    nombreCampo: "La fecha de inicio del rango"
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
                    const error = "La contraseña debe de tener un mínimo de 12 caracteres"
                    throw new Error(error)
                }
                if (clave.length > 70) {
                    const error = "La contraseña no debe tener mas de 70 caracteres"
                    throw new Error(error)
                }
                let tieneMayuscula = false;
                let tieneNumero = false;
                let tieneCaracterEspecial = false;

                for (var i = 0; i < clave.length; i++) {
                    var caracter = clave.charAt(i);

                    if (caracter >= "A" && caracter <= "Z") {
                        tieneMayuscula = true;
                    }

                    else if (caracter >= "0" && caracter <= "9") {
                        tieneNumero = true;
                    }

                    else if ("!@#$%^&*()_+".indexOf(caracter) !== -1) {
                        tieneCaracterEspecial = true;
                    }
                }
                if (!tieneMayuscula) {
                    const error = "Por favor, ponga como mínimo una mayúscula en su contraseña"
                    throw new Error(error)
                }
                if (!tieneNumero) {
                    const error = "Por favor, ponga como mínimo un número en su contraseña"
                    throw new Error(error)
                }
                if (!tieneCaracterEspecial) {
                    const error = "Por favor ponga como mínimo un carácter especial en su contraseña, como por ejemplo: ! @ # $ % ^ & * ( ) _ +"
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
                throw new Error("El validador de números no encuentra la llave string en el objeto");
            }

            if (!nombreCampo) {
                const mensaje = `El validador de cadenas, necesita un nombre de campo.`
                throw new Error(mensaje)
            }
            if (typeof string !== "string") {
                const mensaje = `${nombreCampo} debe de ser una cadena.`
                throw new Error(mensaje)
            }
            if (typeof sePermiteVacio !== "string" &&
                (sePermiteVacio !== "si" && sePermiteVacio !== "no")) {
                const mensaje = `El validador de cadena está mal configurado, sePermiteVacio solo acepta sí o no y es obligatorio declararlo en la configuración.`
                throw new Error(mensaje)
            }
            if (typeof limpiezaEspaciosAlrededor !== "string" &&
                (limpiezaEspaciosAlrededor !== "si" && limpiezaEspaciosAlrededor !== "no")) {
                const mensaje = `El validador de cadena está mal configurado, limpiezaEspaciosAlrededor solo acepta si o no.`
                throw new Error(mensaje)
            }
            if (limpiezaEspaciosInternos &&
                typeof limpiezaEspaciosInternos !== "string" &&
                (limpiezaEspaciosInternos !== "si" && limpiezaEspaciosInternos !== "no")) {
                const mensaje = `El validador de cadena está mal configurado, limpiezaEspaciosInternos solo acepta si o no.`
                throw new Error(mensaje)
            }
            if (limpiezaEspaciosInternos === "si") {
                string = string.replaceAll(" ", "")
            }

            if (limpiezaEspaciosInternosGrandes &&
                typeof limpiezaEspaciosInternosGrandes !== "string" &&
                (limpiezaEspaciosInternosGrandes !== "si" && limpiezaEspaciosInternosGrandes !== "no")) {
                const mensaje = `El validador de cadena está mal configurado, limpiezaEspaciosInternosGrandes solo acepta si o no.`
                throw new Error(mensaje)
            }
            if (limpiezaEspaciosInternosGrandes === "si") {
                string = string.replace(/\s+/g, " ");
            }

            if (soloMinusculas &&
                typeof soloMayusculas !== "string" &&
                (soloMinusculas !== "si" && soloMinusculas !== "no")) {
                const mensaje = `El validador de cadena está mal configurado, soloMinusculas solo acepta si o no.`
                throw new Error(mensaje)
            }
            if (soloMayusculas !== "si" && soloMayusculas !== "no") {
                const mensaje = `El validador de cadena está mal configurado, soloMayusculas solo acepta si o no.`
                throw new Error(mensaje)
            }
            if (limpiezaEspaciosAlrededor === "si") {
                string = string.trim()
            }
            if (sePermiteVacio === "si" && string === "") {
                return string
            } else if (string.length === 0 || string === "") {
                const mensaje = `${nombreCampo} está vacío.`
                throw new Error(mensaje)
            }

            if (soloMinusculas === "si") {
                string = string
                    .toLowerCase()
            }
            if (soloMayusculas === "si") {
                string = string.toUpperCase()
            }
            if (filtro === "strictoSinEspacios") {
                try {
                    const filtro = /^[a-zA-Z0-9_\-\/\.\@]+$/;
                    if (!filtro.test(string)) {
                        const mensaje = `${nombreCampo} solo acepta una cadena de mayúsculas, minúsculas, números y los siguientes caracteres: _, -, ., / y @`
                        throw new Error(mensaje)
                    }
                } catch (errorCapturado) {
                    throw errorCapturado
                }
            } else if (filtro === "strictoIDV") {
                try {
                    const filtro = /^[a-zA-Z0-9]+$/;
                    if (!filtro.test(string)) {
                        const mensaje = `${nombreCampo} solo acepta una cadena de mayúsculas, minúsculas, números y no se permite Ñ ni Ç.`
                        throw new Error(mensaje)
                    }
                } catch (errorCapturado) {
                    throw errorCapturado
                }
            } else if (filtro === "rutaArbol") {
                try {
                    const filtro = /^[a-zA-Z0-9.]+$/;
                    if (!filtro.test(string)) {
                        const mensaje = `${nombreCampo} solo acepta una cadena como una ruta de un arbol compuesta por de mayúsculas, minúsculas, números y puntos unicamente.`
                        throw new Error(mensaje)
                    }
                } catch (errorCapturado) {
                    throw errorCapturado
                }
            } else if (filtro === "strictoConEspacios") {
                try {
                    const filtro = /^[a-zA-Z0-9_\s\-\/\.,:\u00F1ñ\+@\u00E1ç\u00E9\u00ED\u00F3\u00FA\u00C1\u00C9\u00CD\u00D3\u00DA()%$%]+$/g;

                    if (!filtro.test(string)) {
                        const mensaje = `${nombreCampo} solo acepta una cadena de mayúsculas, minúsculas, números, vocales acentuadas, espacios y los siguientes caracteres: _, -, ., /, (), y %`
                        throw new Error(mensaje)
                    }

                } catch (errorCapturado) {
                    throw errorCapturado
                }
            } else if (filtro === "strictoConEspaciosConSaltosDeLinea") {
                try {
                    const filtro = /^[a-zA-Z0-9_\s\-\/\.,:\u00F1ñ\+@\u00E1\u00E9\u00ED\u00F3\u00FA\u00C1\u00C9\u00CD\u00D3\u00DA\r\n]+$/g;

                    if (!filtro.test(string)) {
                        const mensaje = `${nombreCampo} solo acepta una cadena de mayúsculas, minúsculas, números, vocales acentuadas, espacios y los siguientes caracteres: _, -, . y /`
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
                        const mensaje = `${nombreCampo} solo acepta una cadena con números con dos decimales separados por punto, por ejemplo 00.00`
                        throw new Error(mensaje)
                    }

                    const impedirCero = configuracion.impedirCero || "si"
                    if (impedirCero !== "si" && impedirCero !== "no") {
                        const mensaje = `El validador de cadena está mal configurado, impedirCero solo acepta si o no.`
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
                        const mensaje = `El validador de cadena está mal configurado, devuelveUnTipoNumber solo acepta si o no.`
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
                        const mensaje = `${nombreCampo} solo acepta una cadena con números enteros.`
                        throw new Error(mensaje)
                    }
                    const maximoDeLargo = configuracion.maximoDeLargo
                    if (maximoDeLargo && typeof maximoDeLargo !== "bigint") {
                        const mensaje = `El validador de cadena está mal configurado, maximoDeLargo solo acepta números.`
                        throw new Error(mensaje)
                    }
                    if (maximoDeLargo) {
                        if (string.length > maximoDeLargo) {
                            const mensaje = `${nombreCampo} solo acepta un máximo de ${maximoDeLargo} números.`
                            throw new Error(mensaje)
                        }
                    }
                    const impedirCero = configuracion.impedirCero || "si"
                    if (impedirCero !== "si" && impedirCero !== "no") {
                        const mensaje = `El validador de cadena está mal configurado, impedirCero solo acepta si o no.`
                        throw new Error(mensaje)
                    }

                    if (impedirCero === "si") {
                        const numero = parseFloat(string)
                        if (numero === 0) {
                            const mensaje = `${nombreCampo} no permite valores de cero.`
                            throw new Error(mensaje)
                        }
                    }

                    const sePermitenNegativos = configuracion.sePermitenNegativos || "si"

                    if (sePermitenNegativos === "no") {
                        const numero = parseFloat(string)
                        if (numero < 0) {
                            const mensaje = `No se permiten números negativos, por favor revísalo.`
                            throw new Error(mensaje)
                        }
                    }

                    const devuelveUnTipoNumber = configuracion.devuelveUnTipoNumber
                    if (typeof devuelveUnTipoNumber !== "string" &&
                        (devuelveUnTipoNumber !== "si" && devuelveUnTipoNumber !== "no")) {
                        const mensaje = `El validador de cadena está mal configurado, devuelveUnTipoNumber solo acepta si o no.`
                        throw new Error(mensaje)
                    }
                    if (devuelveUnTipoNumber === "si") {
                        string = Number(string)
                    } else {
                        const devuelveUnTipoBigInt = configuracion.devuelveUnTipoBigInt
                        if (typeof devuelveUnTipoBigInt !== "string" &&
                            (devuelveUnTipoBigInt !== "si" && devuelveUnTipoBigInt !== "no")) {
                            const mensaje = `El validador de cadena está mal configurado, devuelveUnTipoBigInt solo acepta si o no.`
                            throw new Error(mensaje)
                        }
                        if (devuelveUnTipoBigInt === "si") {
                            string = BigInt(string)
                        }




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
                        const mensaje = `${nombreCampo} solo acepta una cadena de minúsculas, mayúsculas, números y estos caracteres: _, \, %, -, /, = y :`
                        throw new Error(mensaje)
                    }
                } catch (errorCapturado) {
                    throw errorCapturado
                }
            }
            else {
                const mensaje = `El validador de cadenas, necesita un identificador de filtro válido`
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
                throw new Error("El validador de números no encuentra la llave number en el objeto");
            }

            if (!configuracion.hasOwnProperty("nombreCampo")) {
                throw new Error("El validador de números no encuentra la llave nombreCampo en el objeto");
            }


            if (!nombreCampo) {
                const mensaje = `El validador de cadenas, necesita un nombre de campo.`
                throw new Error(mensaje)
            }
            // esto afecta a calendarios
            if (typeof number !== "number") {
                const mensaje = `${nombreCampo} debe de ser un número.`
                throw new Error(mensaje)
            }
            if (typeof sePermiteVacio !== "string" &&
                (sePermiteVacio !== "si" && sePermiteVacio !== "no")) {
                const mensaje = `El validador de cadena está mal configurado, sePermiteVacio solo acepta sí o no y es obligatorio declararlo en la configuración.`
                throw new Error(mensaje)
            }

            if (typeof limpiezaEspaciosAlrededor !== "string" &&
                (limpiezaEspaciosAlrededor !== "si" && limpiezaEspaciosAlrededor !== "no")) {
                const mensaje = `El validador de cadena está mal configurado, limpiezaEspaciosAlrededor solo acepta si o no.`
                throw new Error(mensaje)
            }

            if (sePermitenNegativos &&
                typeof sePermitenNegativos !== "string" &&
                (sePermitenNegativos !== "si" && sePermitenNegativos !== "no")) {
                const mensaje = `El validador de número está mal configurado, sePermitenNegativos solo acepta si o no.`
                throw new Error(mensaje)
            }
            if (sePermitenNegativos === "no") {
                if (number < 0) {
                    const mensaje = `No se permiten números negativos, por favor revísalo.`
                    throw new Error(mensaje)
                }
            }

            if (sePermiteCero === "no") {
                if (number === 0) {
                    const mensaje = `No se permite el cero, por favor revísalo.`
                    throw new Error(mensaje)
                }
            }
            if (filtro === "numeroSimple") {
                try {
                    if (!Number.isInteger(number)) {
                        const mensaje = `${nombreCampo} solo acepta números enteros, sin decimales.`
                        throw new Error(mensaje)
                    }
                } catch (errorCapturado) {
                    throw errorCapturado
                }

            } else {
                const mensaje = `El validador de números, necesitó un identificador de filtro válido`
                throw new Error(mensaje)

            }
            return number
        },
        granEntero: (configuracion) => {

            let number = configuracion.number
            const nombreCampo = configuracion.nombreCampo
            const sePermiteVacio = configuracion.sePermiteVacio
            const sePermiteCero = configuracion.sePermiteCero
            const limpiezaEspaciosAlrededor = configuracion.limpiezaEspaciosAlrededor
            const sePermitenNegativos = configuracion.sePermitenNegativos || "no"

            if (!configuracion.hasOwnProperty("number")) {
                throw new Error("El validador de granEntero no encuentra la llave number en el objeto");
            }

            if (!configuracion.hasOwnProperty("nombreCampo")) {
                throw new Error("El validador de granEntero no encuentra la llave nombreCampo en el objeto");
            }


            if (!nombreCampo) {
                const mensaje = `El validador de cadenas, necesita un nombre de campo.`
                throw new Error(mensaje)
            }
            // esto afecta a calendarios
            if (typeof number !== "bigint") {
                const mensaje = `${nombreCampo} debe de ser un granEntero.`
                throw new Error(mensaje)
            }
            if (typeof sePermiteVacio !== "string" &&
                (sePermiteVacio !== "si" && sePermiteVacio !== "no")) {
                const mensaje = `El validador de granEntero está mal configurado, sePermiteVacio solo acepta sí o no y es obligatorio declararlo en la configuración.`
                throw new Error(mensaje)
            }

            if (typeof limpiezaEspaciosAlrededor !== "string" &&
                (limpiezaEspaciosAlrededor !== "si" && limpiezaEspaciosAlrededor !== "no")) {
                const mensaje = `El validador de granEntero está mal configurado, limpiezaEspaciosAlrededor solo acepta si o no.`
                throw new Error(mensaje)
            }

            if (sePermitenNegativos &&
                typeof sePermitenNegativos !== "string" &&
                (sePermitenNegativos !== "si" && sePermitenNegativos !== "no")) {
                const mensaje = `El validador de granEntero está mal configurado, sePermitenNegativos solo acepta si o no.`
                throw new Error(mensaje)
            }
            if (sePermitenNegativos === "no") {
                if (number < 0) {
                    const mensaje = `No se permiten granEntero negativos, por favor revísalo.`
                    throw new Error(mensaje)
                }
            }

            if (sePermiteCero === "no") {
                if (number === 0) {
                    const mensaje = `No se permite el cero, por favor revísalo.`
                    throw new Error(mensaje)
                }
            }

            try {
                number = BigInt(number)
            } catch (error) {
                const mensaje = `No se puede procesar el numero, solo se espera un entero en cadena o en numero`
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
                    throw new Error("El validador de correo no encuentra la llave de correo en el objeto.");
                }

                if (!configuracion.hasOwnProperty("nombreCampo")) {
                    throw new Error("El validador de números no encuentra la llave nombreCampo en el objeto");
                }
                if (typeof sePermiteVacio !== "mail" &&
                    (sePermiteVacio !== "si" && sePermiteVacio !== "no")) {
                    const mensaje = `El validador de mail está mal configurado, sePermiteVacio solo acepta sí o no y es obligatorio declararlo en la configuración.`
                    throw new Error(mensaje)
                }
                if (typeof mail !== "string") {
                    const error = "El campo de correo electrónico debe de ser una cadena."
                    throw new Error(error)
                }
                mail = mail
                    .trim()
                    .toLowerCase()
                if (sePermiteVacio === "si" && mail === "") {
                    return mail
                } else if (mail.length === 0 || mail === "") {
                    const mensaje = `${nombreCampo} está vacío.`
                    throw new Error(mensaje)
                }

                const filtroCorreoElectronico = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/;

                if (!filtroCorreoElectronico.test(mail)) {
                    const error = "El campo de correo electrónico no cumple con el formato esperado. El formato esperado es así como usuario@servidor.com"
                    throw new Error(error)
                }
                return mail
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
                    throw new Error("El validador de correo no encuentra la llave nombreCampo en el objeto");
                }
                if (sePermiteVacio === "si" && phone === "") {
                    return phone
                } else if (phone.length === 0 || phone === "") {
                    const mensaje = `${nombreCampo} está vacío.`
                    throw new Error(mensaje)
                }

                if (!phone) {
                    const error = "El campo del teléfono está vacío."
                    throw new Error(error)
                }
                if (typeof phone !== "string") {
                    const error = "El campo teléfono debe de ser una cadena."
                    throw new Error(error)
                }
                const filtroTelefono = /[^0-9]+/g
                const telefonoLimpio = phone
                    .replace(/\s+/g, '')
                    .replace("+", '00')
                    .trim()

                if (filtroTelefono.test(telefonoLimpio)) {
                    const error = "El campo Teléfono no cumple con el formato esperado. El formado esperado es una cadena con números."
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
                    const mensaje = `El validador de arrays, necesita un nombre de campo.`
                    throw new Error(mensaje)
                }
                if (!Array.isArray(array) || array == null || array === undefined) {
                    const error = `${nombreCampo} se esperaba que fuera un array`;
                    throw new Error(error);
                }

                if (sePermiteArrayVacio !== "no" && sePermiteArrayVacio !== "si") {
                    const error = `${nombreCampo} el valdidador array mal configurado, si se define sePermiteArrayVacio tiene que está en sí o no. Predeterminadamente es no.`;
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
                            nombreCampo: `${nombreCampo} es un array que en la posición ${(posicion + 1)} tiene un tipo que no es cadena. Este array solo acepta cadenas.`,
                            filtro: "strictoIDV",
                            sePermiteVacio: "no",
                            limpiezaEspaciosAlrededor: "si"
                        })
                    })
                } else if (filtro === "url") {
                    array.forEach((item, posicion) => {

                        validadoresCompartidos.tipos.cadena({
                            string: item,
                            nombreCampo: `${nombreCampo} es un array que en la posición ${(posicion + 1)} tiene un tipo que no es cadena. Este array solo acepta cadenas.`,
                            filtro: "url",
                            sePermiteVacio: "no",
                            limpiezaEspaciosAlrededor: "si"
                        })
                    })
                } else if (filtro === "strictoConEspacios") {
                    array.forEach((item, posicion) => {
                        validadoresCompartidos.tipos.cadena({
                            string: item,
                            nombreCampo: `${nombreCampo} es un array que en la posición ${(posicion + 1)}`,
                            filtro: "strictoConEspacios",
                            sePermiteVacio: "no",
                            limpiezaEspaciosAlrededor: "si"
                        })
                    })
                } else if (filtro === "soloNumerosEnteros") {
                    array.every((cadena, index) => {
                        validadoresCompartidos.tipos.cadena({
                            string: cadena,
                            nombreCampo: `En la posición ${index} del array debe haber una cadena con números`,
                            filtro: "cadenaConNumerosEnteros",
                            sePermiteVacio: "no",
                            limpiezaEspaciosAlrededor: "si"
                        })
                    })
                } else if (filtro === "filtroDesactivado") {
                } else {
                    const m = "No se reconoce el filtro"
                    throw Error(m)
                }

                const sePermitenDuplicados = configuracion.sePermitenDuplicados
                if (sePermitenDuplicados) {
                    if (sePermitenDuplicados !== "si" && sePermitenDuplicados !== "no") {
                        const mensaje = `El validador de cadena está mal configurado, sePermitenDuplicados solo acepta si o no.`
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
                            const error = `${nombreCampo} que es un array filtrado, tiene duplicados y no debería tener.`;
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
                    const mensaje = `El validador de objetos, necesita un nombre de campo.`
                    throw new Error(mensaje)
                }
                const control = objetoLiteral !== null && typeof objetoLiteral === 'object' && objetoLiteral.constructor === Object;
                if (!control) {
                    const error = `${nombreCampo} se esperará que fuera un objeto literal`;
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

            try {
                new URL(url)
            } catch (e) {
                const error = "La url no cumple con el formato esperado, por favor revisa la url";
                throw error
            }

            if (arrayDeDominiosPermitidos) {
                const filtroDominioSimple = /^[A-Za-z0-9\/:.]*$/;
                arrayDeDominiosPermitidos.forEach((url, i) => {
                    if (!filtroDominioSimple.test(url)) {
                        const error = `En el arrayDeDominiosPermitos, en la posicion ${i} hay una url que no cumple le formato`
                        throw error
                    }
                })

                const controlDominio = new URL(url);
                const dominiofinal = controlDominio.hostname;

                if (!arrayDeDominiosPermitidos.includes(dominiofinal)) {
                    const error = "La url o el dominio no son los esperados. Revisa el formato de la url y el dominio. Solo se acepta el dominio airbnb.com";
                    throw new Error(error);
                }
            }
            return url
        },
        horas: (configuracion) => {

            const hora = configuracion?.hora
            const nombreCampo = configuracion?.nombreCampo
            const filtroHora = /^(0\d|1\d|2[0-3]):([0-5]\d)$/;

            if (!hora) {
                const error = `${nombreCampo} está vacío`;
                throw new Error(error);
            }
            if (!filtroHora.test(hora)) {
                const error = `${nombreCampo} debe de ser 00:00 y no puede ser superior a 23:59. Si quieres poner la hora, por ejemplo 7:35 -> Tienes que poner el 0 delante del siete, por ejemplo 07:35`;
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
            const filtroURL = /^[a-zA-Z0-9/_.:/]+$/;
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
        },
        codigosInternacionalesTel: (configuracion) => {
            try {

                let codigo = configuracion.codigo
                const nombreCampo = configuracion.nombreCampo
                const sePermiteVacio = configuracion.sePermiteVacio

                if (!configuracion.hasOwnProperty("codigo")) {
                    throw new Error("El validador de codigosInternacionales no encuentra la llave codigo en el objeto");
                }

                if (!configuracion.hasOwnProperty("nombreCampo")) {
                    throw new Error("El validador de correo no encuentra la llave nombreCampo en el objeto");
                }
                if (sePermiteVacio === "si" && codigo === "") {
                    return codigo
                } else if (codigo.length === 0 || codigo === "") {
                    const mensaje = `${nombreCampo} está vacío.`
                    throw new Error(mensaje)
                }

                if (!codigo) {
                    const error = "El campo del codigo está vacío."
                    throw new Error(error)
                }
                if (typeof codigo !== "string") {
                    const error = "El campo codigo debe de ser una cadena."
                    throw new Error(error)
                }
                const codigoLimpio = codigo.trim()
                const lista = [
                    { pais: "Afganistán", codigo: "+93" },
                    { pais: "Albania", codigo: "+355" },
                    { pais: "Alemania", codigo: "+49" },
                    { pais: "Andorra", codigo: "+376" },
                    { pais: "Angola", codigo: "+244" },
                    { pais: "Argentina", codigo: "+54" },
                    { pais: "Armenia", codigo: "+374" },
                    { pais: "Australia", codigo: "+61" },
                    { pais: "Austria", codigo: "+43" },
                    { pais: "Azerbaiyán", codigo: "+994" },
                    { pais: "Bahamas", codigo: "+1-242" },
                    { pais: "Bahréin", codigo: "+973" },
                    { pais: "Bangladés", codigo: "+880" },
                    { pais: "Barbados", codigo: "+1-246" },
                    { pais: "Bélgica", codigo: "+32" },
                    { pais: "Bielorrusia", codigo: "+375" },
                    { pais: "Bolivia", codigo: "+591" },
                    { pais: "Bosnia y Herzegovina", codigo: "+387" },
                    { pais: "Botsuana", codigo: "+267" },
                    { pais: "Brasil", codigo: "+55" },
                    { pais: "Brunéi", codigo: "+673" },
                    { pais: "Bulgaria", codigo: "+359" },
                    { pais: "Cabo Verde", codigo: "+238" },
                    { pais: "Camboya", codigo: "+855" },
                    { pais: "Canadá", codigo: "+1" },
                    { pais: "Chile", codigo: "+56" },
                    { pais: "China", codigo: "+86" },
                    { pais: "Colombia", codigo: "+57" },
                    { pais: "Comoras", codigo: "+269" },
                    { pais: "Corea del Norte", codigo: "+850" },
                    { pais: "Corea del Sur", codigo: "+82" },
                    { pais: "Costa Rica", codigo: "+506" },
                    { pais: "Croacia", codigo: "+385" },
                    { pais: "Cuba", codigo: "+53" },
                    { pais: "Dinamarca", codigo: "+45" },
                    { pais: "Dominica", codigo: "+1-767" },
                    { pais: "Ecuador", codigo: "+593" },
                    { pais: "Egipto", codigo: "+20" },
                    { pais: "El Salvador", codigo: "+503" },
                    { pais: "Emiratos Árabes Unidos", codigo: "+971" },
                    { pais: "Eslovaquia", codigo: "+421" },
                    { pais: "Eslovenia", codigo: "+386" },
                    { pais: "España", codigo: "+34" },
                    { pais: "Estados Unidos", codigo: "+1" },
                    { pais: "Estonia", codigo: "+372" },
                    { pais: "Eswatini", codigo: "+268" },
                    { pais: "Etiopía", codigo: "+251" },
                    { pais: "Filipinas", codigo: "+63" },
                    { pais: "Finlandia", codigo: "+358" },
                    { pais: "Francia", codigo: "+33" },
                    { pais: "Gabón", codigo: "+241" },
                    { pais: "Gambia", codigo: "+220" },
                    { pais: "Georgia", codigo: "+995" },
                    { pais: "Ghana", codigo: "+233" },
                    { pais: "Grecia", codigo: "+30" },
                    { pais: "Guatemala", codigo: "+502" },
                    { pais: "Guinea", codigo: "+224" },
                    { pais: "Guinea Ecuatorial", codigo: "+240" },
                    { pais: "Guyana", codigo: "+592" },
                    { pais: "Haití", codigo: "+509" },
                    { pais: "Honduras", codigo: "+504" },
                    { pais: "Hungría", codigo: "+36" },
                    { pais: "India", codigo: "+91" },
                    { pais: "Indonesia", codigo: "+62" },
                    { pais: "Irán", codigo: "+98" },
                    { pais: "Irak", codigo: "+964" },
                    { pais: "Irlanda", codigo: "+353" },
                    { pais: "Islandia", codigo: "+354" },
                    { pais: "Islas Caimán", codigo: "+1-345" },
                    { pais: "Islas Malvinas", codigo: "+500" },
                    { pais: "Islas Marshall", codigo: "+692" },
                    { pais: "Islas Salomón", codigo: "+677" },
                    { pais: "Italia", codigo: "+39" },
                    { pais: "Jamaica", codigo: "+1-876" },
                    { pais: "Japón", codigo: "+81" },
                    { pais: "Jordania", codigo: "+962" },
                    { pais: "Kazajistán", codigo: "+7" },
                    { pais: "Kenia", codigo: "+254" },
                    { pais: "Kirguistán", codigo: "+996" },
                    { pais: "Kiribati", codigo: "+686" },
                    { pais: "Kuwait", codigo: "+965" },
                    { pais: "Laos", codigo: "+856" },
                    { pais: "Letonia", codigo: "+371" },
                    { pais: "Líbano", codigo: "+961" },
                    { pais: "Liberia", codigo: "+231" },
                    { pais: "Libia", codigo: "+218" },
                    { pais: "Liechtenstein", codigo: "+423" },
                    { pais: "Lituania", codigo: "+370" },
                    { pais: "Luxemburgo", codigo: "+352" },
                    { pais: "Malasia", codigo: "+60" },
                    { pais: "Malawi", codigo: "+265" },
                    { pais: "Maldivas", codigo: "+960" },
                    { pais: "Mali", codigo: "+223" },
                    { pais: "Malta", codigo: "+356" },
                    { pais: "Marruecos", codigo: "+212" },
                    { pais: "Mauricio", codigo: "+230" },
                    { pais: "Mauritania", codigo: "+222" },
                    { pais: "México", codigo: "+52" },
                    { pais: "Moldavia", codigo: "+373" },
                    { pais: "Mónaco", codigo: "+377" },
                    { pais: "Mongolia", codigo: "+976" },
                    { pais: "Mozambique", codigo: "+258" },
                    { pais: "Namibia", codigo: "+264" },
                    { pais: "Nepal", codigo: "+977" },
                    { pais: "Nicaragua", codigo: "+505" },
                    { pais: "Nigeria", codigo: "+234" },
                    { pais: "Noruega", codigo: "+47" },
                    { pais: "Nueva Zelanda", codigo: "+64" },
                    { pais: "Omán", codigo: "+968" },
                    { pais: "Pakistán", codigo: "+92" },
                    { pais: "Palaos", codigo: "+680" },
                    { pais: "Panamá", codigo: "+507" },
                    { pais: "Papúa Nueva Guinea", codigo: "+675" },
                    { pais: "Paraguay", codigo: "+595" },
                    { pais: "Países Bajos", codigo: "+31" },
                    { pais: "Perú", codigo: "+51" },
                    { pais: "Polonia", codigo: "+48" },
                    { pais: "Portugal", codigo: "+351" },
                    { pais: "Reino Unido", codigo: "+44" },
                    { pais: "República Centroafricana", codigo: "+236" },
                    { pais: "República Checa", codigo: "+420" },
                    { pais: "República del Congo", codigo: "+242" },
                    { pais: "República Dominicana", codigo: "+1-809" },
                    { pais: "Rumania", codigo: "+40" },
                    { pais: "Rusia", codigo: "+7" },
                    { pais: "Rwanda", codigo: "+250" },
                    { pais: "Samoa", codigo: "+685" },
                    { pais: "San Cristóbal y Nieves", codigo: "+1-869" },
                    { pais: "San Marino", codigo: "+378" },
                    { pais: "Santa Lucía", codigo: "+1-758" },
                    { pais: "Santo Tomé y Príncipe", codigo: "+239" },
                    { pais: "Senegal", codigo: "+221" },
                    { pais: "Serbia", codigo: "+381" },
                    { pais: "Seychelles", codigo: "+248" },
                    { pais: "Singapur", codigo: "+65" },
                    { pais: "Siria", codigo: "+963" },
                    { pais: "Somalia", codigo: "+252" },
                    { pais: "Sudáfrica", codigo: "+27" },
                    { pais: "Sudán", codigo: "+249" },
                    { pais: "Sudán del Sur", codigo: "+211" },
                    { pais: "Suecia", codigo: "+46" },
                    { pais: "Suiza", codigo: "+41" },
                    { pais: "Tailandia", codigo: "+66" },
                    { pais: "Taiwán", codigo: "+886" },
                    { pais: "Tanzania", codigo: "+255" },
                    { pais: "Tayikistán", codigo: "+992" },
                    { pais: "Togo", codigo: "+228" },
                    { pais: "Tonga", codigo: "+676" },
                    { pais: "Trinidad y Tobago", codigo: "+1-868" },
                    { pais: "Túnez", codigo: "+216" },
                    { pais: "Turkmenistán", codigo: "+993" },
                    { pais: "Turquía", codigo: "+90" },
                    { pais: "Tuvalu", codigo: "+688" },
                    { pais: "Uganda", codigo: "+256" },
                    { pais: "Ucrania", codigo: "+380" },
                    { pais: "Emiratos Árabes Unidos", codigo: "+971" },
                    { pais: "Repub. de Macedonia del Norte", codigo: "+389" },
                    { pais: "Vanuatu", codigo: "+678" },
                    { pais: "Vaticano", codigo: "+39" },
                    { pais: "Venezuela", codigo: "+58" },
                    { pais: "Vietnam", codigo: "+84" },
                    { pais: "Zambia", codigo: "+260" },
                    { pais: "Zimbabue", codigo: "+263" },
                ]
                const listaArray = lista.map((c) => { return c.codigo })


                if (!listaArray.includes(codigoLimpio)) {
                    const error = "El campo codigo internacional tiene un codigo internacional no reconocido."
                    throw new Error(error)
                }
                return codigoLimpio.replaceAll("+", "").replaceAll("-", "")
            } catch (errorCapturado) {
                throw errorCapturado
            }
        },
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
                    const error = "Cuidado! No se puede aceptar un porcentaje superior a 100% porque, sino la oferta podría generar números negativos.";
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
        },
        numeroDeLLavesEsperadas: (data) => {
            try {
                const objeto = data.objeto
                const numeroDeLLavesMaximo = data.numeroDeLLavesMaximo
                const numeroLlaves = Object.keys(objeto)

                const fraseUI = (numero) => {
                    if (numero === 0) {
                        return "No se esperan llaves en el objeto de entrada"
                    } else if (numero === 1) {
                        return "Solo se espera una llave en el objeto de entrada"
                    } else if (numero > 1) {
                        return `Solo se esperan ${numero} en el objeto de entrada`
                    }
                }
                if (numeroLlaves.length > numeroDeLLavesMaximo) {
                    const m = fraseUI(numeroDeLLavesMaximo)
                    throw new Error(m)
                }
            } catch (error) {
                throw error
            }


        }
    },
    expresionesRegulares: {
        cadenas: {
            strictoIDV: {
                expresion: /^[a-zA-Z0-9]+$/,
                definicionUI: "solo espera minusculas, mayusculas y numeros enteros."
            },
            strictoSinEspacio: {
                expresion: /^[a-zA-Z0-9_\-\/\.\@]+$/,
                definicionUI: "solo espera minusculas, mayusculas, numeros, @, ., /, _, y espacios"
            },
            cadenaConNumerosConDosDecimales: {
                expresion: /^\d+\.\d{2}$/,
                definicionUI: "solo espera un numero con dos decimales separados por punto, por ejemplo 0.00"
            },
            cadenaConNumerosEnteros: {
                expresion: /^[0-9]+$/,
                definicionUI: "solo acepta una cadena con números enteros."
            },
            cadenaBase64: {
                expresion: /^[A-Za-z0-9+/=]+$/,
                definicionUI: "solo acepta una cadena en base 64."
            },
            url: {
                expresion: /^[A-Za-z0-9_\-/%=:]*$/,
                definicionUI: "solo acepta una cadena de minúsculas, mayúsculas, números y estos caracteres: _, \, %, -, /, = y :"
            },
            url: {
                expresion: /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/,
                definicionUI: "El campo de correo electrónico no cumple con el formato esperado. El formato esperado es así como usuario@servidor.com"
            },
            cadenaConTelefono: {
                expresion: /[^0-9]/g,
                definicionUI: "El campo Teléfono no cumple con el formato esperado. El formado esperado es una cadena con números."
            },

        },

    },
    herramientasExternas: {
        joi: {
            mensajesErrorPersonalizados: {
                'any.required': '{{#label}} es una llave obligatoria',
                'string.base': '{{#label}} debe ser una cadena',
                'string.empty': '{{#label}} no puede estar vacío',
                'string.isoDate': '{{#label}} debe ser una fecha válida en formato ISO',
                'array.min': '{{#label}} debe contener al menos un elemento seleccionado',
                'array.base': '{{#label}} debe ser un array',
                'object.base': '{{#label}} debe ser un objeto',
                'array.includesRequiredUnknowns': '{{#label}} debe contener al menos 1 valor requerido',
                'date.base': '{{#label}} debe de ser una fecha en formado estandar ISO'
            }
        }
    },
    diccionarios: {
        configuracionesUsuario: {
            arbol: {
                calendario: {
                    tipoSeleccion: ["porDiasIndividual", "porRango"],
                    tipoVision: ["horizontal", "vertical"]
                }
            }
        }
    }
}
