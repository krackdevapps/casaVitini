

export const IDX = (entrada) => {
    try {
        const grupos = {
            administradores: () => {
                contenedorGrupos.push("administradores")
            },
            empleados: () => {
                contenedorGrupos.push("empleados")
            },
            clientes: () => {
                contenedorGrupos.push("clientes")
            },
        }

        const contenedorGrupos = []
        const VitiniIDX = entrada.session.usuario
        if (!VitiniIDX) {
            throw new Error()
        }
        if (contenedorGrupos.length > 0) {
            const rol = entrada.session.rol
            if (!contenedorGrupos.includes(rol)) {
                const respuesta = {
                    tipo: "ROL",
                    mensaje: "No estas autorizado, necesitas una cuenta de mas autoridad para acceder aqui"
                }
                return salida.json(respuesta)
            }
        }
    } catch (errorCapturado) {
        const error = {
            tipo: "IDX",
            mensaje: "Tienes que identificarte para seguir"
        }
        return salida.json(error)
    }






}