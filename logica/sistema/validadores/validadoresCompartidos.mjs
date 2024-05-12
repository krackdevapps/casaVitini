import { DateTime } from "luxon"
import { codigoZonaHoraria } from "../configuracion/codigoZonaHoraria.mjs"
import { conexion } from "../../componentes/db.mjs"
export const validadoresCompartidos = {
    clientes: {
        validarCliente: async (cliente) => {
            try {
                const nombre = validadoresCompartidos.tipos.cadena({
                    string: cliente.nombre,
                    nombreCampo: "El campo del nombre",
                    filtro: "strictoConEspacios",
                    sePermiteVacio: "no",
                    limpiezaEspaciosAlrededor: "si",
                    limpiezaEspaciosInternos: "si"

                })
                const primerApellido = validadoresCompartidos.tipos.cadena({
                    string: cliente.primerApellido,
                    nombreCampo: "El campo del primer apellido",
                    filtro: "strictoConEspacios",
                    sePermiteVacio: "no",
                    limpiezaEspaciosAlrededor: "si",
                    limpiezaEspaciosInternos: "si"

                })
                const segundoApellido = validadoresCompartidos.tipos.cadena({
                    string: cliente.segundoApellido,
                    nombreCampo: "El campo del segundo apellido",
                    filtro: "strictoConEspacios",
                    sePermiteVacio: "no",
                    limpiezaEspaciosAlrededor: "si",
                    limpiezaEspaciosInternos: "si"

                })
                const pasaporte = validadoresCompartidos.tipos.cadena({
                    string: cliente.pasaporte,
                    nombreCampo: "El campo del pasaporte",
                    filtro: "strictoConEspacios",
                    sePermiteVacio: "no",
                    limpiezaEspaciosAlrededor: "si",
                    limpiezaEspaciosInternos: "si"
                })
                const correoElectronico = validadoresCompartidos.tipos
                    .correoElectronico(entrada.body.correoElectronico)
                const telefono = validadoresCompartidos.tipos
                    .telefono(entrada.body.telefono)

                const notas = validadoresCompartidos.tipos.cadena({
                    string: cliente.notas,
                    nombreCampo: "El campo de notas",
                    filtro: "strictoConEspacios",
                    sePermiteVacio: "no",
                    limpiezaEspaciosAlrededor: "si",
                })

                const consultaPasaporte = `
                SELECT 
                nombre,
                "primerApellido",
                "segundoApellido"
                FROM clientes
                WHERE pasaporte = $1;
                `
                const resuelveUnicidadPasaporte = await conexion.query(consultaPasaporte, [pasaporte])
                if (resuelveUnicidadPasaporte.rowCount > 0) {
                    const nombreClienteExistente = resuelveUnicidadPasaporte.rows[0].nombre
                    const primerApellidoClienteExistente = resuelveUnicidadPasaporte.rows[0].primerApellido
                    const segundoApellidoClienteExistente = resuelveUnicidadPasaporte.rows[0].segundoApellido
                    const error = `Ya existe un cliente con ese pasaporte: ${nombreClienteExistente} ${primerApellidoClienteExistente} ${segundoApellidoClienteExistente}`
                    throw new Error(error)
                }
                const datosValidados = {
                    nombre: nombre,
                    primerApellido: primerApellido,
                    segundoApellido: segundoApellido,
                    pasaporte: pasaporte,
                    telefono: telefono,
                    correoElectronico: correoElectronico,
                }
                if (notas) {
                    datosValidados.notas = notas
                }
                return datosValidados
            } catch (error) {
                throw error
            }
        },

    },
    usuarios: {
        unicidadPasaporteYCorrreo: async (datosUsuario) => {
            try {
                const usuarioIDX = datosUsuario.usuarioIDX
                const pasaporte = datosUsuario.pasaporte
                const email = datosUsuario.email
                const operacion = datosUsuario.operacion

                if (!usuarioIDX && operacion !== "actualizar") {
                    const error = "El validador de unicidadPasaporteYCorrreo esta mal configurado. Si la operacio es actualizar, falta el usuarioIDX."
                    throw new Error(error)
                }

                const constructorSQL = (operacion, usuario) => {
                    try {
                        if (operacion === "actualizar") {
                            return `AND "usuariosIDX" <> '${usuario}'`
                        } else if (operacion === "crear") {
                            return ""
                        } else {
                            const error = "El validador de unicidadPasaporteYCorrreo esta mal configurado. Debe de especificarse el tipo de operacion."
                            throw new Error(error)
                        }
                    } catch (error) {
                        throw error
                    }
                }
                const inyectorSQL = constructorSQL(operacion, usuarioIDX)
                // validar existencia de correo
                const consultaControlCorreo = `
                SELECT 
                "usuarioIDX"
                FROM "datosDeUsuario"
                WHERE email = $1 ${inyectorSQL};
                `
                const resuelveUnicidadCorreo = await conexion.query(consultaControlCorreo, [email])
                if (resuelveUnicidadCorreo.rowCount > 0) {
                    const usuariosExistentes = resuelveUnicidadCorreo.rows.map((usuario) => {
                        return usuario.usuarioIDX
                    })
                    const ultimoElemento = usuariosExistentes.pop();
                    const constructorCadenaFinalUI = usuariosExistentes.join(", ") + (usuariosExistentes.length > 0 ? " y " : "") + ultimoElemento;
                    const error = `Ya existe un usuario con el correo electroníco que estas intentando guardar: ${constructorCadenaFinalUI}`
                    throw new Error(error)
                }
                // validar existencia de pasaporte
                const consultaControlPasaporte = `
                    SELECT 
                    "usuarioIDX"
                    FROM "datosDeUsuario"
                    WHERE pasaporte = $1 ${inyectorSQL};
                    `
                const resuelveUnicidadPasaporte = await conexion.query(consultaControlPasaporte, [pasaporte])
                if (resuelveUnicidadPasaporte.rowCount > 0) {
                    const usuariosExistentes = resuelveUnicidadPasaporte.rows.map((usuario) => {
                        return usuario.usuarioIDX
                    })
                    const ultimoElemento = usuariosExistentes.pop();
                    const constructorCadenaFinalUI = usuariosExistentes.join(", ") + (usuariosExistentes.length > 0 ? " y " : "") + ultimoElemento;
                    const error = `Ya existe un usuario con el pasaporte que estas intentando guardar: ${constructorCadenaFinalUI}`
                    throw new Error(error)
                }

            } catch (error) {
                throw error
            }
        },
        datosUsuario: (data) => {
            try {
                const nombre = validadoresCompartidos.tipos.cadena({
                    string: data.nombre,
                    nombreCampo: "El campo del nombre",
                    filtro: "strictoConEspacios",
                    sePermiteVacio: "si",
                    limpiezaEspaciosAlrededor: "si",
                })
                const primerApellido = validadoresCompartidos.tipos.cadena({
                    string: data.primerApellido,
                    nombreCampo: "El campo del primer apellido",
                    filtro: "strictoConEspacios",
                    sePermiteVacio: "si",
                    limpiezaEspaciosAlrededor: "si",
                })

                const segundoApellido = validadoresCompartidos.tipos.cadena({
                    string: data.segundoApellido,
                    nombreCampo: "El campo del segundo apellido",
                    filtro: "strictoConEspacios",
                    sePermiteVacio: "si",
                    limpiezaEspaciosAlrededor: "si",
                })

                const pasaporte = validadoresCompartidos.tipos.cadena({
                    string: data.pasaporte,
                    nombreCampo: "El campo del pasaporte",
                    filtro: "strictoConEspacios",
                    sePermiteVacio: "si",
                    limpiezaEspaciosAlrededor: "si",
                    limpiezaEspaciosInternos: "si"
                })

                const email = validadoresCompartidos.tipos
                    .correoElectronico(data.email)
                const telefono = validadoresCompartidos.tipos
                    .telefono(data.telefono)

            } catch (error) {
                throw error
            }
        }
    },
    fechas: {
        validarFecha_ISO: async (configuracion) => {
            try {

                if (!configuracion.hasOwnProperty("nombreCampo")) {
                    throw new Error("El validador de fechas ISO mal configurado. no encuentra la llave nombreCampo en el objeto");
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
            } catch (error) {
                throw error
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
            } catch (error) {
                throw error
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
            } catch (error) {
                throw error
            }
        },
        validacionVectorial: async (configuracion) => {
            try {
                const fechaEntrada_ISO = await validadoresCompartidos.fechas.validarFecha_ISO({
                    fecha_ISO: configuracion.fechaEntrada_ISO,
                    nombreCampo: "La fecha de entrada en el validor vectorial"
                })
                const fechaSalida_ISO = await validadoresCompartidos.fechas.validarFecha_ISO({
                    fecha_ISO: configuracion.fechaSalida_ISO,
                    nombreCampo: "La fecha de salida en el validador vectorial"
                })


                const fechaEntrada_obejto = DateTime.fromISO(fechaEntrada_ISO)
                const fechaSalida_obejto = DateTime.fromISO(fechaSalida_ISO)

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

            } catch (error) {
                throw error
            }

        }
    },
    reservas: {
        validarReserva: async (reservaUIDRaw) => {
            try {

                const reservaUID = validadoresCompartidos.tipos.numero({
                    string: reservaUIDRaw,
                    nombreCampo: "El identificador universal de la reserva (reservaUID)",
                    filtro: "numeroSimple",
                    sePermiteVacio: "no",
                    limpiezaEspaciosAlrededor: "si",
                    sePermitenNegativos: "no"
                })

                const validarReserva = `
                SELECT
                *
                FROM 
                reservas
                WHERE
                reserva = $1
                ;`
                const resuelveValidarReserva = await conexion.query(validarReserva, [reservaUID])
                if (resuelveValidarReserva.rowCount === 0) {
                    const error = "No existe la reserva comprueba es reservaUID"
                    throw new Error(error)
                }
                return resuelveValidarReserva.rows[0]
            } catch (errorCapturado) {
                throw errorCapturado
            }
        },
        resolverNombreApartamento: async (apartamentoIDV) => {
            try {
                const consultaNombreApartamento = `
                SELECT "apartamentoUI"
                FROM apartamentos 
                WHERE apartamento = $1;`
                const resolverNombreApartamento = await conexion.query(consultaNombreApartamento, [apartamentoIDV])
                if (resolverNombreApartamento.rowCount === 0) {
                    const error = "No existe el apartamentoIDV para resolver"
                    throw new new Error(error)
                }
                const apartamentoUI = resolverNombreApartamento.rows[0].apartamentoUI
                return apartamentoUI
            } catch (error) {
                throw error
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
            let string = configuracion.string
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
            }
            if (string.length === 0 || string === "") {
                const mensaje = `${nombreCampo} esta vacío.`
                return mensaje
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
                    .toLowerCase()
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
                const string = this.string
                const filtro = /[^a-zA-Z0-9_\-\/\.]/g;
                stringLimpio = string.replace(filtro, '');
            } else if (filtro === "sustitucionConEspacios") {
                const string = this.string
                const filtro = /^[a-zA-Z0-9_ \-\/\.]+$/;
                stringLimpio = string.replace(filtro, '');
            } else if (filtro === "cadenaConNumerosConDosDecimales") {
                try {
                    const filtro = /^\d+\.\d{2}$/
                    if (!filtro.test(string)) {
                        const mensaje = `${nombreCampo} solo acepta una cadena con numeros con dos decimales separados por punto, por ejemplo 00.00`
                        throw new Error(mensaje)
                    }

                    const impedirCero = configuracion.impedirCero
                    if (typeof impedirCero !== "string" &&
                        (impedirCero !== "si" && impedirCero !== "no")) {
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
                        const mensaje = `${nombreCampo} solo acepta una cadena con numeros con dos decimales separados por punto, por ejemplo 00.00`
                        throw new Error(mensaje)
                    }
                    const maximoDeLargo = configuracion.maximoDeLargo
                    if (typeof maximoDeLargo !== "number") {
                        const mensaje = `El validor de cadena esta mal configurado, maximoDeLargo solo acepta numeros.`
                        throw new Error(mensaje)
                    }
                    if (maximoDeLargo) {
                        if (string.length > maximoDeLargo) {
                            const mensaje = `${nombreCampo} solo acepta un maximo de ${maximoDeLargo} numeros.`
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
                    const filtro = /^[A-Za-z0-9_\-/=:]*$/;
                    if (!filtro.test(string)) {
                        const mensaje = `${nombreCampo} solo acepta una cadena de minusculas, mayusculas, numeros y estos caracteres: _, \, -, /, = y :`
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

            if (filtro === "numeroSimple") {
                try {
                    const filtro = /^[0-9]+$/;
                    if (!filtro.test(number)) {
                        const mensaje = `${nombreCampo} solo acepta numeros`
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
        correoElectronico: (correoElectronico) => {
            try {
                if (!correoElectronico) {
                    const error = "El campo de correo electroníco está vacío."
                    throw new Error(error)
                }
                if (typeof correoElectronico !== "string") {
                    const error = "El campo de correo electroníco debe de ser una cadena"
                    throw new Error(error)
                }
                const filtroCorreoElectronico = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/;
                const cadenaCorreoLimpia = correoElectronico
                    .trim()
                    .toLowerCase()
                if (!filtroCorreoElectronico.test(cadenaCorreoLimpia)) {
                    const error = "El campo de correo electroníco no cumple con el formato esperado, el formato esperado es asi como usuario@servidor.com"
                    throw new Error(error)
                }
                return cadenaCorreoLimpia
            } catch (error) {
                throw error
            }

        },
        telefono: (telefono) => {
            try {
                if (!telefono) {
                    const error = "El campo del telefono está vacío."
                    throw new Error(error)
                }
                if (typeof telefono !== "string") {
                    const error = "el campo Telefono debe de ser una cadena."
                    throw new Error(error)
                }
                const filtroTelefono = /[^0-9]+/g
                const telefonoLimpio = telefono
                    .replace(/\s+/g, '')
                    .replace("+", '00')
                    .trim()

                if (!filtroTelefono.test(telefonoLimpio)) {
                    const error = "el campo Telefono no cumple con el formato esperado, el formado esperado es una cadena con numeros"
                    throw new Error(error)
                }
                return telefonoLimpio
            } catch (error) {
                throw error
            }
        },
        array: (configuracion) => {
            try {
                const array = configuracion.array
                const nombreCampo = configuracion.nombreCampo
                const filtro = configuracion.filtro
                if (!nombreCampo) {
                    const mensaje = `El validador de arrays, necesito un nombre de campo.`
                    throw new Error(mensaje)
                }
                if (!Array.isArray(array) || array == null || array === undefined) {
                    const error = `${nombreCampo} se esperaba un array`;
                    throw new Error(error);
                }
                if (array.length === 0) {
                    const error = `${nombreCampo} está array vacío`;
                    throw new Error(error);
                }
                if (filtro === "soloCadenasIDV") {
                    array.every((cadena, index) => {
                        validadoresCompartidos.tipos.cadena({
                            string: cadena,
                            nombreCampo: `En la posicion ${index} del array debe haber una cadena`,
                            filtro: "strictoIDV",
                            sePermiteVacio: "no",
                            limpiezaEspaciosAlrededor: "si"
                        })
                    });
                }

                const noSePermitenDuplicados = configuracion.noSePermitenDuplicados
                if (typeof noSePermitenDuplicados !== "string" &&
                    (noSePermitenDuplicados !== "si" && noSePermitenDuplicados !== "no")) {
                    const mensaje = `El validor de cadena esta mal configurado, noSePermitenDuplicados solo acepta si o no.`
                    throw new Error(mensaje)
                }
                if (noSePermitenDuplicados === "si") {
                    const arrayFiltrado = array.map((array) => {
                        if (typeof elemento === "string") {
                            return elemento.toLowerCase();
                        } else {
                            return elemento;
                        }
                    });
                    const controlDuplicados = new Set(arrayFiltrado).size !== arrayFiltrado.length;
                    if (controlDuplicados) {
                        const error = `${nombreCampo} que es un arrayFiltrado, tiene duplicados y no deberia tener.`;
                        throw new Error(error);
                    }
                }

                return array
            } catch (error) {
                throw error
            }
        },
        objetoLiteral: (configuracion) => {
            try {
                const objetoLiteral = configuracion.objetoLiteral
                const nombreCampo = configuracion.nombreCampo
                const filtro = configuracion.filtro

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
            } catch (error) {
                throw error

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
                    noSePermitenDuplicados: "si"
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
        }


    },
    baseDeDatos: {
        validarNombreColumna: async (configuracion) => {

            try {
                const nombreColumna = validadoresCompartidos.tipos.cadena({
                    string: configuracion.nombreColumna,
                    nombreCampo: "El campo de nombreColumnade validador de columnas",
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

                const consultaExistenciaNombreColumna = `
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = $1 AND column_name = $2;
                `;
                const configuracionConsulta = [
                    tabla,
                    nombreColumna
                ]
                const resuelveNombreColumna = await conexion.query(consultaExistenciaNombreColumna, configuracionConsulta);
                if (resuelveNombreColumna.rowCount === 0) {
                    const error = `No existe el nombre de la columna ${nombreColumna} en la tabla ${tabla}`;
                    throw new Error(error);
                }
            } catch (error) {
                throw error
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
            } catch (error) {
                throw error
            }
        },
        estados: (estado) => {
            try {
                if (estado !== "activado" && estado !== "desactivado") {
                    const error = "El estado solo puede ser activado o desactivado"
                    throw new Error(error)
                }
            } catch (error) {
                throw error
            }
        }
    },

}
