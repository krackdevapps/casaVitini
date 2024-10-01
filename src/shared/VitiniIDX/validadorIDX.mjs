export const validadorIDX = async (usuario) => {
    try {
        const numeroMaximoCaracteres = 20
        if (usuario.length > numeroMaximoCaracteres) {
            const m = "Maximo 20 caracteres para el nombre de usuario"
            throw new Error(m)
        }
    }
    catch (errorCapturado) {
        throw errorCapturado
    }

}