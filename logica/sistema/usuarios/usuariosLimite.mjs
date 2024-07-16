
export const usuariosLimite = (usuario) => {
    try {
        if (!usuario) {
            const m = "No se ha pasado ningun usuario en usuariosLimite"
            throw new Error(m)
        }
        // Lista de usuarios limitados por el sistema   
        const listaUsuarios  = [
            "nuevo"
        ]
        if (listaUsuarios.includes(usuario)) {
            const m = "El usuario que has elegido no esta disponbile, por favor escoge otro nombre de usuarios"
            throw new Error(m)
        }
        return true
       } catch (error) {
        throw error
    }
}