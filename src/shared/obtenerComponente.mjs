import { existsSync, readFileSync } from 'fs';
export const obtenerComponente = async (transaccion) => {
    try {
        const componente = transaccion.componente
        const arbol = componente.split("/").filter(n => n)
        const usuarioIDX = transaccion.usuario
        const rolIDV = transaccion.rolIDV
        let selectorRama = './ui/componentes'
        let urlResuelta = "";
        if (arbol.length === 0) {
            const m = "Vista debe tener datos del directorio, pasar solo una barra no es el formato esperado."
            throw new Error(m)
        }
        let zona = arbol[0].toLowerCase()
        if (arbol.length > 1 && arbol[0].toLowerCase() === "administracion") {
            zona = arbol[1].toLowerCase()
        }
        const controlFiltro = /^[a-z0-9_]+$/;
        let portal
        for (let rama of arbol) {
            rama = rama.toLowerCase()
            if (controlFiltro.test(rama)) {
                selectorRama = selectorRama + "/" + rama

                if (existsSync(selectorRama)) {

                    const archivoIDX = selectorRama + "/IDX.json"
                    if (existsSync(archivoIDX)) {

                        const secFile = readFileSync(archivoIDX, 'utf-8')
                        const secConf = JSON.parse(secFile)
                        const mode = secConf?.mode ?? "private"

                        const modes = [
                            "private",
                            "public"
                        ]
                        if (!modes.includes(mode)) {
                            return {
                                error: "mode en IDX mal configurado"
                            }
                        }
                        if (mode === "public") {
                            portal = null
                            urlResuelta + "/" + rama

                        } else if (mode === "private") {
                            const roles = secConf?.roles

                            const rolesVal = [
                                "administrador",
                                "empleado",
                                "cliente"
                            ]

                            const controlRol = roles.some(r => !rolesVal.includes(r));
                            if (controlRol || roles.length === 0) {
                                return {
                                    error: "rol en IDX mal configurado"
                                }
                            }

                            if (!usuarioIDX) {
                                portal = "IDX"
                            } else if (roles.length > 0 && !roles.includes(rolIDV)) {
                                portal = "ROL"
                            }
                        }
                    }
                } else {
                    break
                }
                urlResuelta = urlResuelta + "/" + rama
            } else {
                break
            }
        }

        if (portal === "IDX") {
            throw {
                tipo: "IDX",
                mensaje: "Tienes que identificarte para seguir."
            };

        } else if (portal === "ROL") {
            throw {
                tipo: "ROL",
                mensaje: "No estás autorizado, necesitas una cuenta de más autoridad para acceder aquí"
            }
        }

        const vistaSelector = "./ui/componentes" + urlResuelta + "/ui.ejs"
        if (existsSync(vistaSelector)) {
            const html = readFileSync(vistaSelector, 'utf-8');
            let css = ""
            const cssOptionalSelector = "./ui/componentes" + urlResuelta + "/ui.css"
            if (existsSync(cssOptionalSelector)) {
                css = readFileSync(cssOptionalSelector, 'utf-8')
            }
            return {
                ok: "Componente encontrado",
                html: html,
                css: css
            }
        } else {
            const error = "noExisteElComponente"
            throw new Error(error)
        }
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}