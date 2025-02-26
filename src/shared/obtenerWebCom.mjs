import { existsSync, readFileSync } from 'fs';
export const obtenerWebCom_ = async (transaccion) => {
    try {
        const componente = transaccion.componente
        const arbol = componente
        console.log("arbol", arbol)
        const usuarioIDX = transaccion.usuario
        const rolIDV = transaccion.rolIDV
        let selectorRama = './ui/componentes'
        let urlResuelta = "";
        if (arbol.length === 0) {
            return {
                error: "empyComponentID",
                errorUI: "Se espera la ruta del componente"
            }
        }
        let zona = arbol[0].toLowerCase()
        if (arbol.length > 1 && arbol[0].toLowerCase() === "administracion") {
            zona = arbol[1].toLowerCase()
        }
        const controlFiltro = /^[a-zA-Z0-9_]+$/;
        let portal
        for (let rama of arbol) {
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
                                error: "IDXBadFormat",
                                errorUI: "mode en IDX mal configurado"
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
                                    error: "IDXBadFormat",
                                    errorUI: "rol en IDX mal configurado"
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
            return {
                error: "IDX",
                errorUI: "Tienes que identificarte para seguir."
            };

        } else if (portal === "ROL") {
            return {
                error: "ROL",
                errorUI: "No estás autorizado, necesitas una cuenta de más autoridad para acceder aquí"
            }
        }
        const com = "./ui/componentes" + urlResuelta + "/com.json"
        let comData = ""
        console.log("com", com)
        if (existsSync(com)) {
            console.log("1")
            const comSelector = "./ui/componentes" + urlResuelta + "/com.js"
            if (existsSync(comSelector)) {
                comData = {
                    ok: "Componente encontrado",
                    data: readFileSync(comSelector, 'utf-8')
                }
            } else {
                comData = {
                    error: "404",
                    errorUI: "No se encuentra el archivo del componente"
                }
            }

            return comData
        } else {
            return {
                error: "404",
                errorUI: "No se encuentra el identificador del componente"
            }
        }
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}