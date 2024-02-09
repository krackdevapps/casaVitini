import crypto from 'crypto';

const vitiniCrypto = (metadatos) => {
  try {
    const sentido = metadatos.sentido
    const clavePlana = metadatos.clavePlana

    if (sentido !== "cifrar" && sentido !== "comparar") {
      const error = "Sentido carece de cifrar o comparar"
      throw new Error(error)
    }
    if (!clavePlana) {
      const error = "Sin clavePlana para procesar"
      throw new Error(error)
    }

    // Función para crear un hash de una contrasena
    const crearHash = (contrasena, salt) => {
      const hash = crypto.createHmac('sha3-512', salt);
      return hash.update(contrasena).digest('hex');
    }

    // Generar un salt aleatorio para cada usuario
    const salt = crypto.randomBytes(16).toString('hex');

    // Verificar una contrasena ingresada por el usuario
    const verificarContrasena = (contrasenaIngresada, salt, hashAlmacenado) => {
      const hashEntrada = crearHash(contrasenaIngresada, salt);
      return hashEntrada === hashAlmacenado;
    }

    if (sentido === "cifrar") {
      const hashContrasena = crearHash(clavePlana, salt);
      const salida = {
        hashCreado: hashContrasena,
        nuevaSal: salt
      }
      return salida
    }
    if (sentido === "comparar") {
      const claveHash = metadatos.claveHash
      const salt = metadatos.sal
      if (!claveHash) {
        const error = "Sin claveHash para comparar"
        throw new Error(error)
      }
      if (!salt) {
        const error = "Sin sal para comparar"
        throw new Error(error)
      }
      return verificarContrasena(clavePlana, salt, claveHash);
    }

  } catch (error) {
    throw error;
  }
}

export {
  vitiniCrypto
}