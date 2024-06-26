export const detectorDeLlavesRepetidas = (req, res, next) => {
    try {
        const objeto = req.body;

        // Función para detectar claves duplicadas
        const hasDuplicateKeys = (obj) => {
            const keys = new Set();
            const checkDuplicates = (item) => {
                if (item && typeof item === 'object') {
                    for (const key in item) {

                        if (keys.has(key)) {
                            throw new Error(`Duplicate key detected: ${key}`);
                        }
                        keys.add(key);
                        checkDuplicates(item[key]);
                    }
                }
            };
            checkDuplicates(obj);
        };
        hasDuplicateKeys(objeto);

        next()
    } catch (errorCapturado) {
        salida.json({ error: errorCapturado.message });
    }

}