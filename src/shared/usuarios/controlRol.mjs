import { obtenerUsuario } from "../../infraestructure/repository/usuarios/obtenerUsuario.mjs"

export const controlRol = async (data) => {
    try {

        const usuarioOperacion = await obtenerUsuario({
            usuario: data.usuarioOperacion,
            errorSi: "noExiste"
        })

        const rol_operacion = usuarioOperacion.rolIDV

        const usuarioDestino = await obtenerUsuario({
            usuario: data.usuarioDestino,
            errorSi: "noExiste"
        })


        const rol_destino = usuarioDestino.rolIDV

        const diccionarioRol = {
            administrador: "Administrador",
            empleado: "Empleado",
            cliente: "Cliente"
        }

        if (rol_operacion === "empleado" || rol_operacion !== "administrador") {
            const rolesNoAutorizados = [
                "administrador",
                "empleado"
            ]
            if (rolesNoAutorizados.includes(rol_destino)) {
                const m = `Las cuentas ${diccionarioRol[rol_operacion]} no estan autorizadas a operar con cuentas ${diccionarioRol[rol_destino]} `
                throw new Error(m)
            }
        }
    } catch (error) {
        throw error
    }
}