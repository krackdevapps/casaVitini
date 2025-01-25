import helmet from "helmet";

export const csp = helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      frameSrc: ["'self'"],
      // Puedes añadir más directivas según tus necesidades
    }
  })