export const filtroError = (error) => {
    try {
        const objetoError = {}
        if (error.hasOwnProperty('message')) {
            objetoError.error = error.message
        } else {
            Object.assign(objetoError, error)
        }
        return objetoError
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
