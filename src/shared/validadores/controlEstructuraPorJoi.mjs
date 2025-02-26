
export const controlEstructuraPorJoi = (data) => {
    try {

        const schema = data.schema
        const objeto = data.objeto

        if (Object.keys(objeto || {}).length === 0) {
            throw {
                error: "objetoVacio",
                errorUI: "El objeto esta vacio"
            };
        }

        const { value, error } = schema.validate(objeto);


        const errorTipo = error?.details[0].type
        if (errorTipo === "object.unknown") {
            const llavesDesconocidas = error.details[0].context.label
            const m = `El objeto tiene una propiedad inesperada: ${llavesDesconocidas}`;
            throw new Error(m)
        } else if (error) {
            const m = error?.details[0].message.replaceAll('"', "'")
            throw new Error(m)
        }

        return value
    } catch (error) {
        throw error
    }
}