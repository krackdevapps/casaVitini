export const constructorEstructuraDescuentos = (estructura) => {
    if (!estructura.hasOwnProperty("contenedorOfertas")) {
        estructura.contenedorOfertas = {
            entidades: {
            }
        }
    }
} 