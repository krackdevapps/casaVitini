export const robots = async (entrada, salida) => {
    const robotsTxtContent = `
User-agent: *
Allow: /
Crawl-delay: 60

    `;

    // Configura el tipo de contenido de la respuesta como text/plain
    salida.set('Content-Type', 'text/plain');

    // Envía el contenido del robots.txt
    salida.send(robotsTxtContent);
};
