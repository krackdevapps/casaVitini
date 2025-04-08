
import { obtenerPermisosDeLosGruposDeLaVista } from "../../infraestructure/repository/secOps/obtenerPermisosDeLosGruposDeLaVista.mjs"
import { obtenerPermisosDeLosGruposDeLosControladores } from "../../infraestructure/repository/secOps/obtenerPermisosDeLosGruposDeLosControladores.mjs"
import { obtenerGruposDelUsuario } from "../../infraestructure/repository/secOps/obtenerGruposDelUsuario.mjs"
import { obtenerOCrearVistaUIDPorVista } from "../../infraestructure/repository/secOps/obtenerOCrearVistaUIDPorVista.mjs"
import { obtenerOCrearControladorUIDPorControlador } from "../../infraestructure/repository/secOps/obtenerOCrearControladorUIDPorControlador.mjs"

export const secPort = async (data) => {
    try {
        const arbol = data?.arbol
        const usuario = data.usuario
        const zonaIDV = "/" + arbol.join("/")
        const tipoPermiso = data?.tipoPermiso

        const secPortMalConfigurado = "secPort mal configurado"
        const IDX = function (data) {
            const tipoPermiso = data.tipoPermiso
            const usuario = data?.usuario
            if (!usuario && tipoPermiso === "controlador") {
                const error = new Error("Tienes que identificarte.");
                error.tipo = "IDX";
                throw error;
            } else if (!usuario && tipoPermiso === "vista") {
                return "IDX"
            }
        }

        const mensajeDenegado = (data) => {
            const permisoDelGrupo = data.permisoDelGrupo
            const tipoPermiso = data.tipoPermiso
            const controlador = data.controlador
            const vista = data.vista

            const limpiezaNombre = (d) => {
                const selectorIDV = d.selectorIDV
                const rama = d.rama
                const pM = rama.charAt(0).toUpperCase() + rama.slice(1)

                if (selectorIDV === "vistaIDV") {
                    return pM
                        .replaceAll("_", " ")
                        .split('/')
                        .map(section => {
                            return section
                                .charAt(0)
                                .toUpperCase() +
                                section.slice(1)
                        })
                        .join(" > ")
                        .trim()
                } else if (selectorIDV === "controladorIDV") {
                    const camelToHuman = rama
                        .replace(/([A-Z])/g, ' $1')
                        .toLowerCase()
                        .split('/')
                        .map(section => {
                            return section
                                .charAt(0)
                                .toUpperCase() +
                                section.slice(1)
                        })
                    return camelToHuman
                        .join(" > ")
                        .trim()
                }
            }

            const error = new Error();
            error.error = `No estás autorizado a usar esta entidad porque no estás en ningún grupo que lo permita. Indíquele al administrador que active el permiso siguiente:`
            error.detallesDelPermiso = {}

            if (tipoPermiso === "controlador") {
                error.detallesDelPermiso.controlador = "Controlador " + limpiezaNombre({
                    selectorIDV: "controladorIDV",
                    rama: controlador.controladorIDV,

                })
            } else if (tipoPermiso === "vista") {
                error.detallesDelPermiso.vista = "Vista " + limpiezaNombre({
                    selectorIDV: "vistaIDV",
                    rama: vista.vistaIDV,

                })
            }
            throw error
        }

        const controlPorGrupos = async (data) => {
            const permisosDeLosGrupos = data.permisosDeLosGrupos
            const gruposUIDUsuario = data.gruposUIDUsuario
            const tipoPermiso = data.tipoPermiso
            const controlador = data?.controlador
            const vista = data?.vista

            //  
            let permisoFinal = "noPermitido"
            for (const permisoDelGrupo of permisosDeLosGrupos) {

                const grupoUID = permisoDelGrupo.grupoUID

                if (gruposUIDUsuario.includes(grupoUID)) {
                    const permiso = permisoDelGrupo.permiso

                    if (permiso === "permitido") {
                        permisoFinal = "permitido"
                        break
                    }
                }

            }
            if (permisoFinal === "noPermitido") {
                mensajeDenegado({
                    permisosDeLosGrupos,
                    tipoPermiso,
                    controlador,
                    vista
                })
            }
        }

        if (arbol[0].toLowerCase() !== "administracion" && arbol[0].toLowerCase() !== "micasa") { return }

        const gruposDelUsuario = async (usuario) => {
            const gruposDelUsuario = await obtenerGruposDelUsuario(usuario)
            if (gruposDelUsuario.length === 0) {
                throw new Error("No estas autorizado a usar este controlador por que la cuenta de usuario no esta en ningun grupo administrativo")
            }
            const gruposUIDUsuario = []
            for (const gDU of gruposDelUsuario) {
                const grupodUID = gDU.grupoUID
                gruposUIDUsuario.push(grupodUID)
                if (grupodUID === "1") {
                    break
                }
            }
            return gruposUIDUsuario
        }

        if (tipoPermiso === "controlador") {

            if (arbol[0].toLowerCase() === "administracion") {
                IDX({
                    usuario,
                    tipoPermiso
                })

                const gDU = await gruposDelUsuario(usuario)
                if (gDU.includes("1")) {
                    return
                }

                const controlador = await obtenerOCrearControladorUIDPorControlador(zonaIDV)
                const controladorUID = controlador.controladorUID
                const permisosDeLosGrupos = await obtenerPermisosDeLosGruposDeLosControladores({
                    controladorUID,
                    gruposUIDArray: gDU

                })
                if (permisosDeLosGrupos.length === 0) {
                    throw new Error("No estas autorizado a usar este controlador por que esta zona no tiene grupos definidos")
                }

                await controlPorGrupos({
                    permisosDeLosGrupos: permisosDeLosGrupos,
                    gruposUIDUsuario: gDU,
                    tipoPermiso: "controlador",
                    controlador
                })
            } else if (arbol[0].toLowerCase() === "micasa") {

                if (
                    arbol[1] === "crearCuentaDesdeMiCasa"
                    ||
                    (arbol[1] === "recuperarCuenta" && arbol[2] === "enviarCorreo")
                    ||
                    (arbol[1] === "recuperarCuenta" && arbol[2] === "restablecerClave")
                ) {
                    return
                }

                IDX({
                    usuario,
                    tipoPermiso
                })

            }
        } else if (tipoPermiso === "vista") {
            if (arbol[0].toLowerCase() === "administracion") {
                const control = IDX({
                    usuario,
                    tipoPermiso
                })

                if (control === "IDX") {
                    return "IDX"
                }

                const gDU = await gruposDelUsuario(usuario)
                if (gDU.includes("1")) {
                    return
                }
                const vista = await obtenerOCrearVistaUIDPorVista(zonaIDV)
                const vistaUID = vista.vistaUID

                const permisosDeLosGrupos = await obtenerPermisosDeLosGruposDeLaVista({
                    vistaUID,
                    gruposUIDArray: gDU
                })

                if (permisosDeLosGrupos.length === 0) {
                    throw new Error("No estas autorizado a usar esta vista por que no tiene grupos definidos")
                }

                await controlPorGrupos({
                    permisosDeLosGrupos: permisosDeLosGrupos,
                    gruposUIDUsuario: gDU,
                    tipoPermiso: "vista",
                    vista
                })
            } else if (arbol[0].toLowerCase() === "micasa") {
                if (
                    arbol[1] === "crear_nueva_cuenta"
                    ||
                    arbol[1] === "recuperar_cuenta"
                ) {
                    return
                }
                const control = IDX({
                    usuario,
                    tipoPermiso
                })

                if (control === "IDX") {
                    return "IDX"
                }

                if (!usuario) {
                    return "IDX"
                }
            } else {
                throw new Error(secPortMalConfigurado)
            }
        }
    } catch (error) {
        throw error
    }

}