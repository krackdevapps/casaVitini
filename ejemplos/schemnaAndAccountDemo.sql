--
-- PostgreSQL database dump
--

-- Dumped from database version 17.0 (Postgres.app)
-- Dumped by pg_dump version 17.0 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: tipo_estadoConfiguracionAlojamiento; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."tipo_estadoConfiguracionAlojamiento" AS ENUM (
    'disponible',
    'nodisponible'
);


ALTER TYPE public."tipo_estadoConfiguracionAlojamiento" OWNER TO postgres;

--
-- Name: tipo_estadoCuenta; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."tipo_estadoCuenta" AS ENUM (
    'activado',
    'desactivado'
);


ALTER TYPE public."tipo_estadoCuenta" OWNER TO postgres;

--
-- Name: tipo_estadosReserva; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."tipo_estadosReserva" AS ENUM (
    'confirmada',
    'pendiente',
    'cancelada'
);


ALTER TYPE public."tipo_estadosReserva" OWNER TO postgres;

--
-- Name: tipo_interrupores; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_interrupores AS ENUM (
    'aceptarReservasPublicas'
);


ALTER TYPE public.tipo_interrupores OWNER TO postgres;

--
-- Name: tipo_plataformaDePago; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."tipo_plataformaDePago" AS ENUM (
    'cheque',
    'efectivo',
    'pasarela',
    'tarjeta',
    'transferenciaBancaria'
);


ALTER TYPE public."tipo_plataformaDePago" OWNER TO postgres;

--
-- Name: tipo_usuariosRoles; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."tipo_usuariosRoles" AS ENUM (
    'administrador',
    'empleado',
    'cliente'
);


ALTER TYPE public."tipo_usuariosRoles" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: apartamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.apartamentos (
    "apartamentoIDV" text NOT NULL,
    "apartamentoUI" text,
    "apartamentoUIPublico" text,
    "desfinicionPublica" text
);


ALTER TABLE public.apartamentos OWNER TO postgres;

--
-- Name: apartamentosCaracteristicas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."apartamentosCaracteristicas" (
    "caracteristicaUID" bigint NOT NULL,
    "apartamentoIDV" text,
    "caracteristicaUI" text
);


ALTER TABLE public."apartamentosCaracteristicas" OWNER TO postgres;

--
-- Name: apartamentosCaracteristicas_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."apartamentosCaracteristicas" ALTER COLUMN "caracteristicaUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."apartamentosCaracteristicas_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: bloqueosApartamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."bloqueosApartamentos" (
    "bloqueoUID" bigint NOT NULL,
    "apartamentoIDV" text NOT NULL,
    "tipoBloqueoIDV" text NOT NULL,
    "fechaInicio" date,
    "fechaFin" date,
    motivo text,
    "zonaIDV" text NOT NULL,
    "calendarioIDV" text,
    "testingVI" text
);


ALTER TABLE public."bloqueosApartamentos" OWNER TO postgres;

--
-- Name: bloqueosApartamentos_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."bloqueosApartamentos" ALTER COLUMN "bloqueoUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."bloqueosApartamentos_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: calendariosSincronizados; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."calendariosSincronizados" (
    "calendarioUID" bigint NOT NULL,
    url text,
    nombre text,
    "apartamentoIDV" text,
    "plataformaOrigenIDV" text,
    "dataIcal" text,
    "publicoUID" text,
    "testingVI" text
);


ALTER TABLE public."calendariosSincronizados" OWNER TO postgres;

--
-- Name: calendariosSincronizados_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."calendariosSincronizados" ALTER COLUMN "calendarioUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."calendariosSincronizados_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: camas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.camas (
    "camaIDV" text NOT NULL,
    "camaUI" text NOT NULL,
    capacidad bigint NOT NULL,
    "tipoIDV" text NOT NULL,
    "testingVI" text
);


ALTER TABLE public.camas OWNER TO postgres;

--
-- Name: clientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clientes (
    "clienteUID" bigint NOT NULL,
    nombre text,
    "primerApellido" text,
    "segundoApellido" text,
    pasaporte text,
    telefono text,
    mail text,
    notas text,
    "testingVI" text
);


ALTER TABLE public.clientes OWNER TO postgres;

--
-- Name: clientes_ID_Cliente_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.clientes ALTER COLUMN "clienteUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."clientes_ID_Cliente_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: complementosDeAlojamiento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."complementosDeAlojamiento" (
    "complementoUID" bigint NOT NULL,
    "apartamentoIDV" text,
    "estadoIDV" text,
    definicion text,
    "tipoPrecio" text,
    precio numeric(10,2),
    "testingVI" text,
    "complementoUI" text
);


ALTER TABLE public."complementosDeAlojamiento" OWNER TO postgres;

--
-- Name: complementosDeAlojamiento_complementoUID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."complementosDeAlojamiento" ALTER COLUMN "complementoUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."complementosDeAlojamiento_complementoUID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: comportamientoPrecios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."comportamientoPrecios" (
    "comportamientoUID" bigint NOT NULL,
    "nombreComportamiento" text,
    "estadoIDV" text,
    contenedor jsonb,
    "testingVI" text
);


ALTER TABLE public."comportamientoPrecios" OWNER TO postgres;

--
-- Name: comportamientoPrecios_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."comportamientoPrecios" ALTER COLUMN "comportamientoUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."comportamientoPrecios_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: configuracionApartamento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."configuracionApartamento" (
    "configuracionUID" bigint NOT NULL,
    "apartamentoIDV" text NOT NULL,
    imagen text,
    "zonaIDV" text NOT NULL,
    "estadoConfiguracionIDV" public."tipo_estadoConfiguracionAlojamiento" NOT NULL
);


ALTER TABLE public."configuracionApartamento" OWNER TO postgres;

--
-- Name: configuracionApartamentoDisponibildiad_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."configuracionApartamento" ALTER COLUMN "configuracionUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."configuracionApartamentoDisponibildiad_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: configuracionHabitacionesDelApartamento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."configuracionHabitacionesDelApartamento" (
    "componenteUID" bigint NOT NULL,
    "apartamentoIDV" text NOT NULL,
    "habitacionIDV" text NOT NULL
);


ALTER TABLE public."configuracionHabitacionesDelApartamento" OWNER TO postgres;

--
-- Name: configuracionApartamento_UID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."configuracionHabitacionesDelApartamento" ALTER COLUMN "componenteUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."configuracionApartamento_UID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: configuracionCamasEnHabitacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."configuracionCamasEnHabitacion" (
    "componenteUID" bigint NOT NULL,
    "habitacionUID" bigint NOT NULL,
    "camaIDV" text NOT NULL
);


ALTER TABLE public."configuracionCamasEnHabitacion" OWNER TO postgres;

--
-- Name: configuracionGlobal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."configuracionGlobal" (
    "configuracionUID" text NOT NULL,
    valor text
);


ALTER TABLE public."configuracionGlobal" OWNER TO postgres;

--
-- Name: configuracionHabitacion_UID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."configuracionCamasEnHabitacion" ALTER COLUMN "componenteUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."configuracionHabitacion_UID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: datosDeUsuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."datosDeUsuario" (
    usuario text NOT NULL,
    mail text,
    nombre text,
    "primerApellido" text,
    "segundoApellido" text,
    pasaporte text,
    telefono text,
    "estadoCorreoIDV" text
);


ALTER TABLE public."datosDeUsuario" OWNER TO postgres;

--
-- Name: enlaceDeRecuperacionCuenta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."enlaceDeRecuperacionCuenta" (
    "enlaceUID" bigint NOT NULL,
    usuario text NOT NULL,
    "codigoUPID" text NOT NULL,
    "fechaCaducidad" timestamp without time zone NOT NULL
);


ALTER TABLE public."enlaceDeRecuperacionCuenta" OWNER TO postgres;

--
-- Name: enlaceDeRecuperacionCuenta_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."enlaceDeRecuperacionCuenta" ALTER COLUMN "enlaceUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."enlaceDeRecuperacionCuenta_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: enlacesDePago; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."enlacesDePago" (
    "nombreEnlace" text,
    codigo text,
    "reservaUID" numeric(1000,0) NOT NULL,
    descripcion text,
    "fechaCaducidad" timestamp without time zone,
    cantidad numeric(10,2),
    "enlaceUID" bigint NOT NULL,
    "estadoPagoIDV" text,
    "testingVI" text
);


ALTER TABLE public."enlacesDePago" OWNER TO postgres;

--
-- Name: enlacesDePago_enlaceUID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."enlacesDePago" ALTER COLUMN "enlaceUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."enlacesDePago_enlaceUID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: enlacesPdf; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."enlacesPdf" (
    "enlaceUID" bigint NOT NULL,
    "publicoUID" text,
    "reservaUID" numeric(1000,0) NOT NULL,
    "fechaCaducidad" timestamp without time zone
);


ALTER TABLE public."enlacesPdf" OWNER TO postgres;

--
-- Name: enlacesPdf_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."enlacesPdf" ALTER COLUMN "enlaceUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."enlacesPdf_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: habitaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.habitaciones (
    "habitacionIDV" text NOT NULL,
    "habitacionUI" text NOT NULL
);


ALTER TABLE public.habitaciones OWNER TO postgres;

--
-- Name: impuestos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.impuestos (
    "impuestoUID" bigint NOT NULL,
    nombre text,
    "tipoImpositivo" numeric(10,2),
    "tipoValorIDV" text,
    "entidadIDV" text,
    "estadoIDV" text,
    "testingVI" text
);


ALTER TABLE public.impuestos OWNER TO postgres;

--
-- Name: impuestos_idv_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.impuestos_idv_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER SEQUENCE public.impuestos_idv_seq OWNER TO postgres;

--
-- Name: impuestos_impuestoUID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.impuestos ALTER COLUMN "impuestoUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."impuestos_impuestoUID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: interruptoresGlobales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."interruptoresGlobales" (
    "interruptorIDV" text NOT NULL,
    "estadoIDV" text
);


ALTER TABLE public."interruptoresGlobales" OWNER TO postgres;

--
-- Name: mensaesEnPortada_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."mensaesEnPortada_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER SEQUENCE public."mensaesEnPortada_uid_seq" OWNER TO postgres;

--
-- Name: mensajesEnPortada; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."mensajesEnPortada" (
    "mensajeUID" bigint NOT NULL,
    mensaje text NOT NULL,
    "estadoIDV" text,
    posicion bigint,
    "testingVI" text
);


ALTER TABLE public."mensajesEnPortada" OWNER TO postgres;

--
-- Name: mensajesEnPortada_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."mensajesEnPortada" ALTER COLUMN "mensajeUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."mensajesEnPortada_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ofertas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ofertas (
    "ofertaUID" bigint NOT NULL,
    "nombreOferta" text NOT NULL,
    "condicionesArray" jsonb NOT NULL,
    "descuentosJSON" jsonb NOT NULL,
    "fechaInicio" date NOT NULL,
    "estadoIDV" text NOT NULL,
    "fechaFinal" date NOT NULL,
    "zonaIDV" text NOT NULL,
    "entidadIDV" text NOT NULL,
    "testingVI" text
);


ALTER TABLE public.ofertas OWNER TO postgres;

--
-- Name: ofertas_ofertaUID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.ofertas ALTER COLUMN "ofertaUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."ofertas_ofertaUID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: poolClientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."poolClientes" (
    "clienteUID" bigint NOT NULL,
    "nombreCompleto" text NOT NULL,
    pasaporte text,
    "pernoctanteUID" bigint NOT NULL,
    "testingVI" text
);


ALTER TABLE public."poolClientes" OWNER TO postgres;

--
-- Name: poolClientesPreFormateo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."poolClientes" ALTER COLUMN "clienteUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."poolClientesPreFormateo_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: poolTitularesReserva; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."poolTitularesReserva" (
    "titularPoolUID" bigint NOT NULL,
    "nombreTitular" text,
    "pasaporteTitular" text,
    "mailTitular" text,
    "telefonoTitular" text,
    "reservaUID" numeric(1000,0) NOT NULL
);


ALTER TABLE public."poolTitularesReserva" OWNER TO postgres;

--
-- Name: poolTitularesReserva_ud_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."poolTitularesReserva" ALTER COLUMN "titularPoolUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."poolTitularesReserva_ud_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: preciosApartamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."preciosApartamentos" (
    "precioUID" bigint NOT NULL,
    "apartamentoIDV" text,
    precio numeric(10,2)
);


ALTER TABLE public."preciosApartamentos" OWNER TO postgres;

--
-- Name: precios_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."preciosApartamentos" ALTER COLUMN "precioUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.precios_uid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservaApartamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reservaApartamentos" (
    "componenteUID" bigint NOT NULL,
    "reservaUID" numeric(1000,0) NOT NULL,
    "apartamentoIDV" text NOT NULL,
    "apartamentoUI" text
);


ALTER TABLE public."reservaApartamentos" OWNER TO postgres;

--
-- Name: reservaApartamentos_UID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaApartamentos" ALTER COLUMN "componenteUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."reservaApartamentos_UID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservaCamas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reservaCamas" (
    "componenteUID" bigint NOT NULL,
    "habitacionUID" bigint NOT NULL,
    "camaIDV" text NOT NULL,
    "reservaUID" numeric(1000,0) NOT NULL,
    "camaUI" text
);


ALTER TABLE public."reservaCamas" OWNER TO postgres;

--
-- Name: reservaCamasFisicas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reservaCamasFisicas" (
    "componenteUID" bigint NOT NULL,
    "camaIDV" text NOT NULL,
    "reservaUID" numeric(1000,0) NOT NULL,
    "habitacionUID" bigint,
    "camaUI" text NOT NULL
);


ALTER TABLE public."reservaCamasFisicas" OWNER TO postgres;

--
-- Name: reservaCamasFisicas_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaCamasFisicas" ALTER COLUMN "componenteUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."reservaCamasFisicas_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservaCamas_UID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaCamas" ALTER COLUMN "componenteUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."reservaCamas_UID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservaComplementosAlojamiento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reservaComplementosAlojamiento" (
    "complementoUID" bigint NOT NULL,
    "complementoUI" text NOT NULL,
    definicion text,
    precio numeric(10,2) NOT NULL,
    "tipoPrecio" text NOT NULL,
    "apartamentoIDV" text,
    "reservaUID" numeric(1000,0),
    "apartamentoUID" bigint NOT NULL
);


ALTER TABLE public."reservaComplementosAlojamiento" OWNER TO postgres;

--
-- Name: reservaComplementosAlojamiento_complementoUID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaComplementosAlojamiento" ALTER COLUMN "complementoUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."reservaComplementosAlojamiento_complementoUID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservaFinanciero; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reservaFinanciero" (
    "componenteUID" bigint NOT NULL,
    "reservaUID" numeric(1000,0) NOT NULL,
    "desgloseFinanciero" json,
    "instantaneaNoches" jsonb,
    "instantaneaOfertasPorCondicion" jsonb,
    "instantaneaSobreControlPrecios" jsonb,
    "instantaneaOfertasPorAdministrador" jsonb,
    "instantaneaImpuestos" jsonb
);


ALTER TABLE public."reservaFinanciero" OWNER TO postgres;

--
-- Name: reservaHabitaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reservaHabitaciones" (
    "componenteUID" bigint NOT NULL,
    "apartamentoUID" bigint NOT NULL,
    "habitacionIDV" text NOT NULL,
    "reservaUID" numeric(1000,0),
    "habitacionUI" text
);


ALTER TABLE public."reservaHabitaciones" OWNER TO postgres;

--
-- Name: reservaHabitaciones_ID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaHabitaciones" ALTER COLUMN "componenteUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."reservaHabitaciones_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservaPagos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reservaPagos" (
    "pagoUID" bigint NOT NULL,
    "tarjetaDigitos" text,
    "pagoUIDPasarela" text,
    "reservaUID" numeric(1000,0) NOT NULL,
    tarjeta text,
    cantidad numeric(10,2) NOT NULL,
    "fechaPago" timestamp without time zone,
    "pagadorNombre" text,
    "pagadorPasaporte" text,
    "chequeUID" text,
    "transferenciaUID" text,
    "plataformaDePagoIDV" public."tipo_plataformaDePago" NOT NULL
);


ALTER TABLE public."reservaPagos" OWNER TO postgres;

--
-- Name: reservaPagos_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaPagos" ALTER COLUMN "pagoUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."reservaPagos_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservaPernoctantes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reservaPernoctantes" (
    "componenteUID" bigint NOT NULL,
    "reservaUID" numeric(1000,0) NOT NULL,
    "habitacionUID" bigint,
    "clienteUID" bigint,
    "fechaCheckIn" date,
    "fechaCheckOutAdelantado" date
);


ALTER TABLE public."reservaPernoctantes" OWNER TO postgres;

--
-- Name: reservaPernoctante_UID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaPernoctantes" ALTER COLUMN "componenteUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."reservaPernoctante_UID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservaReembolsos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reservaReembolsos" (
    "reembolsoUID" bigint NOT NULL,
    "pagoUID" bigint NOT NULL,
    cantidad numeric(10,2) NOT NULL,
    "reembolsoUIDPasarela" text,
    "estadoIDV" text,
    "fechaCreacion" timestamp without time zone,
    "fechaActualizacion" timestamp without time zone,
    "plataformaDePagoIDV" public."tipo_plataformaDePago" NOT NULL
);


ALTER TABLE public."reservaReembolsos" OWNER TO postgres;

--
-- Name: reservaReembolsos_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaReembolsos" ALTER COLUMN "reembolsoUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."reservaReembolsos_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservaServicios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reservaServicios" (
    "servicioUID" bigint NOT NULL,
    "reservaUID" numeric(1000,0),
    nombre text,
    contenedor jsonb,
    "opcionesSel" jsonb NOT NULL
);


ALTER TABLE public."reservaServicios" OWNER TO postgres;

--
-- Name: reservaServicios_servicioUID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaServicios" ALTER COLUMN "servicioUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."reservaServicios_servicioUID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservaTitulares; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reservaTitulares" (
    "titularUID" bigint NOT NULL,
    "clienteUID" bigint NOT NULL,
    "reservaUID" numeric(1000,0) NOT NULL,
    "testingVI" text
);


ALTER TABLE public."reservaTitulares" OWNER TO postgres;

--
-- Name: reservaTitulares_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaTitulares" ALTER COLUMN "titularUID" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."reservaTitulares_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservaTotales_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reservaFinanciero" ALTER COLUMN "componenteUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."reservaTotales_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservas (
    "fechaEntrada" date NOT NULL,
    "fechaSalida" date NOT NULL,
    "estadoPagoIDV" text,
    "origenIDV" text,
    "fechaCreacion" timestamp without time zone,
    "fechaCancelacion" timestamp without time zone,
    "testingVI" text,
    "reservaUID" numeric(1000,0) NOT NULL,
    "estadoReservaIDV" public."tipo_estadosReserva" NOT NULL
);


ALTER TABLE public.reservas OWNER TO postgres;

--
-- Name: servicios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.servicios (
    "servicioUID" bigint NOT NULL,
    nombre text NOT NULL,
    "zonaIDV" text NOT NULL,
    contenedor jsonb NOT NULL,
    "testingVI" text,
    "estadoIDV" text NOT NULL
);


ALTER TABLE public.servicios OWNER TO postgres;

--
-- Name: servicios_servicioUID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.servicios ALTER COLUMN "servicioUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."servicios_servicioUID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: sessiones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessiones (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.sessiones OWNER TO postgres;

--
-- Name: simulacionesDePrecio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."simulacionesDePrecio" (
    "simulacionUID" bigint NOT NULL,
    "desgloseFinanciero" jsonb,
    "instantaneaNoches" jsonb,
    "instantaneaSobreControlPrecios" jsonb,
    "instantaneaOfertasPorCondicion" jsonb,
    "instantaneaOfertasPorAdministrador" jsonb,
    "instantaneaImpuestos" jsonb,
    nombre text,
    "fechaCreacion" date,
    "fechaEntrada" date,
    "fechaSalida" date,
    "reservaUID" numeric(10,0) NOT NULL,
    "testingVI" text,
    "zonaIDV" text
);


ALTER TABLE public."simulacionesDePrecio" OWNER TO postgres;

--
-- Name: simulacionesDePrecioAlojamiento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."simulacionesDePrecioAlojamiento" (
    "apartamentoUID" bigint NOT NULL,
    "apartamentoIDV" text NOT NULL,
    "simulacionUID" bigint NOT NULL
);


ALTER TABLE public."simulacionesDePrecioAlojamiento" OWNER TO postgres;

--
-- Name: simulacionesDePrecioAlojamiento_apartamentoUID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."simulacionesDePrecioAlojamiento" ALTER COLUMN "apartamentoUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."simulacionesDePrecioAlojamiento_apartamentoUID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: simulacionesDePrecioComplementosAlojamiento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."simulacionesDePrecioComplementosAlojamiento" (
    "complementoUID" bigint NOT NULL,
    "complementoUI" text,
    definicion text,
    precio numeric(10,2),
    "tipoPrecio" text,
    "apartamentoIDV" text,
    "simulacionUID" bigint NOT NULL,
    "apartamentoUID" bigint NOT NULL
);


ALTER TABLE public."simulacionesDePrecioComplementosAlojamiento" OWNER TO postgres;

--
-- Name: simulacionesDePrecioComplementosAlojamiento_complementoUID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."simulacionesDePrecioComplementosAlojamiento" ALTER COLUMN "complementoUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."simulacionesDePrecioComplementosAlojamiento_complementoUID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: simulacionesDePrecioServicios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."simulacionesDePrecioServicios" (
    "servicioUID" bigint NOT NULL,
    nombre text,
    contenedor jsonb,
    "simulacionUID" bigint NOT NULL,
    "opcionesSel" jsonb NOT NULL
);


ALTER TABLE public."simulacionesDePrecioServicios" OWNER TO postgres;

--
-- Name: simulacionesDePrecioServicios_servicioUID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."simulacionesDePrecioServicios" ALTER COLUMN "servicioUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."simulacionesDePrecioServicios_servicioUID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: simulacionesDePrecio_simulacionUID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."simulacionesDePrecio" ALTER COLUMN "simulacionUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."simulacionesDePrecio_simulacionUID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    usuario text NOT NULL,
    clave text NOT NULL,
    sal text NOT NULL,
    "zonaHoraria" text,
    intentos bigint,
    "cuentaVerificadaIDV" text,
    "codigoVerificacion" text,
    "fechaCaducidadCuentaNoVerificada" timestamp without time zone,
    "ultimoLogin" timestamp without time zone,
    "testingVI" text,
    "estadoCuentaIDV" public."tipo_estadoCuenta" NOT NULL,
    "rolIDV" public."tipo_usuariosRoles" NOT NULL
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuariosConfiguracion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."usuariosConfiguracion" (
    "configuracionUID" bigint NOT NULL,
    usuario text,
    "configuracionIDV" text,
    valor text
);


ALTER TABLE public."usuariosConfiguracion" OWNER TO postgres;

--
-- Name: usuariosConfiguracion_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."usuariosConfiguracion" ALTER COLUMN "configuracionUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."usuariosConfiguracion_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: usuariosZonaHoraria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."usuariosZonaHoraria" (
    "zonaUID" bigint NOT NULL,
    "configuracionIDV" text,
    "zonaHoraria" text,
    usuario text
);


ALTER TABLE public."usuariosZonaHoraria" OWNER TO postgres;

--
-- Name: usuariosZonaHoraria_uid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."usuariosZonaHoraria" ALTER COLUMN "zonaUID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."usuariosZonaHoraria_uid_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: apartamentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.apartamentos ("apartamentoIDV", "apartamentoUI", "apartamentoUIPublico", "desfinicionPublica") FROM stdin;
\.


--
-- Data for Name: apartamentosCaracteristicas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."apartamentosCaracteristicas" ("caracteristicaUID", "apartamentoIDV", "caracteristicaUI") FROM stdin;
\.


--
-- Data for Name: bloqueosApartamentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."bloqueosApartamentos" ("bloqueoUID", "apartamentoIDV", "tipoBloqueoIDV", "fechaInicio", "fechaFin", motivo, "zonaIDV", "calendarioIDV", "testingVI") FROM stdin;
\.


--
-- Data for Name: calendariosSincronizados; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."calendariosSincronizados" ("calendarioUID", url, nombre, "apartamentoIDV", "plataformaOrigenIDV", "dataIcal", "publicoUID", "testingVI") FROM stdin;
\.


--
-- Data for Name: camas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.camas ("camaIDV", "camaUI", capacidad, "tipoIDV", "testingVI") FROM stdin;
\.


--
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clientes ("clienteUID", nombre, "primerApellido", "segundoApellido", pasaporte, telefono, mail, notas, "testingVI") FROM stdin;
\.


--
-- Data for Name: complementosDeAlojamiento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."complementosDeAlojamiento" ("complementoUID", "apartamentoIDV", "estadoIDV", definicion, "tipoPrecio", precio, "testingVI", "complementoUI") FROM stdin;
\.


--
-- Data for Name: comportamientoPrecios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."comportamientoPrecios" ("comportamientoUID", "nombreComportamiento", "estadoIDV", contenedor, "testingVI") FROM stdin;
\.


--
-- Data for Name: configuracionApartamento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."configuracionApartamento" ("configuracionUID", "apartamentoIDV", imagen, "zonaIDV", "estadoConfiguracionIDV") FROM stdin;
\.


--
-- Data for Name: configuracionCamasEnHabitacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."configuracionCamasEnHabitacion" ("componenteUID", "habitacionUID", "camaIDV") FROM stdin;
\.


--
-- Data for Name: configuracionGlobal; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."configuracionGlobal" ("configuracionUID", valor) FROM stdin;
\.


--
-- Data for Name: configuracionHabitacionesDelApartamento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."configuracionHabitacionesDelApartamento" ("componenteUID", "apartamentoIDV", "habitacionIDV") FROM stdin;
\.


--
-- Data for Name: datosDeUsuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."datosDeUsuario" (usuario, mail, nombre, "primerApellido", "segundoApellido", pasaporte, telefono, "estadoCorreoIDV") FROM stdin;
\.


--
-- Data for Name: enlaceDeRecuperacionCuenta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."enlaceDeRecuperacionCuenta" ("enlaceUID", usuario, "codigoUPID", "fechaCaducidad") FROM stdin;
\.


--
-- Data for Name: enlacesDePago; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."enlacesDePago" ("nombreEnlace", codigo, "reservaUID", descripcion, "fechaCaducidad", cantidad, "enlaceUID", "estadoPagoIDV", "testingVI") FROM stdin;
\.


--
-- Data for Name: enlacesPdf; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."enlacesPdf" ("enlaceUID", "publicoUID", "reservaUID", "fechaCaducidad") FROM stdin;
\.


--
-- Data for Name: habitaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.habitaciones ("habitacionIDV", "habitacionUI") FROM stdin;
\.


--
-- Data for Name: impuestos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.impuestos ("impuestoUID", nombre, "tipoImpositivo", "tipoValorIDV", "entidadIDV", "estadoIDV", "testingVI") FROM stdin;
\.


--
-- Data for Name: interruptoresGlobales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."interruptoresGlobales" ("interruptorIDV", "estadoIDV") FROM stdin;
\.


--
-- Data for Name: mensajesEnPortada; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."mensajesEnPortada" ("mensajeUID", mensaje, "estadoIDV", posicion, "testingVI") FROM stdin;
\.


--
-- Data for Name: ofertas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ofertas ("ofertaUID", "nombreOferta", "condicionesArray", "descuentosJSON", "fechaInicio", "estadoIDV", "fechaFinal", "zonaIDV", "entidadIDV", "testingVI") FROM stdin;
\.


--
-- Data for Name: poolClientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."poolClientes" ("clienteUID", "nombreCompleto", pasaporte, "pernoctanteUID", "testingVI") FROM stdin;
\.


--
-- Data for Name: poolTitularesReserva; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."poolTitularesReserva" ("titularPoolUID", "nombreTitular", "pasaporteTitular", "mailTitular", "telefonoTitular", "reservaUID") FROM stdin;
\.


--
-- Data for Name: preciosApartamentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."preciosApartamentos" ("precioUID", "apartamentoIDV", precio) FROM stdin;
\.


--
-- Data for Name: reservaApartamentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."reservaApartamentos" ("componenteUID", "reservaUID", "apartamentoIDV", "apartamentoUI") FROM stdin;
\.


--
-- Data for Name: reservaCamas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."reservaCamas" ("componenteUID", "habitacionUID", "camaIDV", "reservaUID", "camaUI") FROM stdin;
\.


--
-- Data for Name: reservaCamasFisicas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."reservaCamasFisicas" ("componenteUID", "camaIDV", "reservaUID", "habitacionUID", "camaUI") FROM stdin;
\.


--
-- Data for Name: reservaComplementosAlojamiento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."reservaComplementosAlojamiento" ("complementoUID", "complementoUI", definicion, precio, "tipoPrecio", "apartamentoIDV", "reservaUID", "apartamentoUID") FROM stdin;
\.


--
-- Data for Name: reservaFinanciero; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."reservaFinanciero" ("componenteUID", "reservaUID", "desgloseFinanciero", "instantaneaNoches", "instantaneaOfertasPorCondicion", "instantaneaSobreControlPrecios", "instantaneaOfertasPorAdministrador", "instantaneaImpuestos") FROM stdin;
\.


--
-- Data for Name: reservaHabitaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."reservaHabitaciones" ("componenteUID", "apartamentoUID", "habitacionIDV", "reservaUID", "habitacionUI") FROM stdin;
\.


--
-- Data for Name: reservaPagos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."reservaPagos" ("pagoUID", "tarjetaDigitos", "pagoUIDPasarela", "reservaUID", tarjeta, cantidad, "fechaPago", "pagadorNombre", "pagadorPasaporte", "chequeUID", "transferenciaUID", "plataformaDePagoIDV") FROM stdin;
\.


--
-- Data for Name: reservaPernoctantes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."reservaPernoctantes" ("componenteUID", "reservaUID", "habitacionUID", "clienteUID", "fechaCheckIn", "fechaCheckOutAdelantado") FROM stdin;
\.


--
-- Data for Name: reservaReembolsos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."reservaReembolsos" ("reembolsoUID", "pagoUID", cantidad, "reembolsoUIDPasarela", "estadoIDV", "fechaCreacion", "fechaActualizacion", "plataformaDePagoIDV") FROM stdin;
\.


--
-- Data for Name: reservaServicios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."reservaServicios" ("servicioUID", "reservaUID", nombre, contenedor, "opcionesSel") FROM stdin;
\.


--
-- Data for Name: reservaTitulares; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."reservaTitulares" ("titularUID", "clienteUID", "reservaUID", "testingVI") FROM stdin;
\.


--
-- Data for Name: reservas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservas ("fechaEntrada", "fechaSalida", "estadoPagoIDV", "origenIDV", "fechaCreacion", "fechaCancelacion", "testingVI", "reservaUID", "estadoReservaIDV") FROM stdin;
\.


--
-- Data for Name: servicios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.servicios ("servicioUID", nombre, "zonaIDV", contenedor, "testingVI", "estadoIDV") FROM stdin;
\.


--
-- Data for Name: sessiones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessiones (sid, sess, expire) FROM stdin;
\.


--
-- Data for Name: simulacionesDePrecio; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."simulacionesDePrecio" ("simulacionUID", "desgloseFinanciero", "instantaneaNoches", "instantaneaSobreControlPrecios", "instantaneaOfertasPorCondicion", "instantaneaOfertasPorAdministrador", "instantaneaImpuestos", nombre, "fechaCreacion", "fechaEntrada", "fechaSalida", "reservaUID", "testingVI", "zonaIDV") FROM stdin;
\.


--
-- Data for Name: simulacionesDePrecioAlojamiento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."simulacionesDePrecioAlojamiento" ("apartamentoUID", "apartamentoIDV", "simulacionUID") FROM stdin;
\.


--
-- Data for Name: simulacionesDePrecioComplementosAlojamiento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."simulacionesDePrecioComplementosAlojamiento" ("complementoUID", "complementoUI", definicion, precio, "tipoPrecio", "apartamentoIDV", "simulacionUID", "apartamentoUID") FROM stdin;
\.


--
-- Data for Name: simulacionesDePrecioServicios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."simulacionesDePrecioServicios" ("servicioUID", nombre, contenedor, "simulacionUID", "opcionesSel") FROM stdin;
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (usuario, clave, sal, "zonaHoraria", intentos, "cuentaVerificadaIDV", "codigoVerificacion", "fechaCaducidadCuentaNoVerificada", "ultimoLogin", "testingVI", "estadoCuentaIDV", "rolIDV") FROM stdin;
demo	92c51476462967d9572057f5f97a70839d86937ca74699832695c6a873c78c947c2ea1bfe6a362fde05abb243bbe86b1840152c41c2302075cad60554d51fc9f	1b102a825806d5774903d0037e67d970	\N	\N	\N	\N	\N	\N	\N	activado	administrador
\.


--
-- Data for Name: usuariosConfiguracion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."usuariosConfiguracion" ("configuracionUID", usuario, "configuracionIDV", valor) FROM stdin;
\.


--
-- Data for Name: usuariosZonaHoraria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."usuariosZonaHoraria" ("zonaUID", "configuracionIDV", "zonaHoraria", usuario) FROM stdin;
\.


--
-- Name: apartamentosCaracteristicas_uid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."apartamentosCaracteristicas_uid_seq"', 1, false);


--
-- Name: bloqueosApartamentos_uid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."bloqueosApartamentos_uid_seq"', 1, false);


--
-- Name: calendariosSincronizados_uid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."calendariosSincronizados_uid_seq"', 1, false);


--
-- Name: clientes_ID_Cliente_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."clientes_ID_Cliente_seq"', 1, false);


--
-- Name: complementosDeAlojamiento_complementoUID_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."complementosDeAlojamiento_complementoUID_seq"', 1, false);


--
-- Name: comportamientoPrecios_uid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."comportamientoPrecios_uid_seq"', 1, false);


--
-- Name: configuracionApartamentoDisponibildiad_uid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."configuracionApartamentoDisponibildiad_uid_seq"', 1, false);


--
-- Name: configuracionApartamento_UID_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."configuracionApartamento_UID_seq"', 1, false);


--
-- Name: configuracionHabitacion_UID_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."configuracionHabitacion_UID_seq"', 1, false);


--
-- Name: enlaceDeRecuperacionCuenta_uid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."enlaceDeRecuperacionCuenta_uid_seq"', 1, false);


--
-- Name: enlacesDePago_enlaceUID_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."enlacesDePago_enlaceUID_seq"', 1, false);


--
-- Name: enlacesPdf_uid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."enlacesPdf_uid_seq"', 1, false);


--
-- Name: impuestos_idv_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.impuestos_idv_seq', 1, false);


--
-- Name: impuestos_impuestoUID_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."impuestos_impuestoUID_seq"', 1, false);


--
-- Name: mensaesEnPortada_uid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."mensaesEnPortada_uid_seq"', 1, false);


--
-- Name: mensajesEnPortada_uid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."mensajesEnPortada_uid_seq"', 1, false);


--
-- Name: ofertas_ofertaUID_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ofertas_ofertaUID_seq"', 1, false);


--
-- Name: poolClientesPreFormateo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."poolClientesPreFormateo_id_seq"', 1, false);


--
-- Name: poolTitularesReserva_ud_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."poolTitularesReserva_ud_seq"', 1, false);


--
-- Name: precios_uid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.precios_uid_seq', 1, false);


--
-- Name: reservaApartamentos_UID_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."reservaApartamentos_UID_seq"', 1, false);


--
-- Name: reservaCamasFisicas_uid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."reservaCamasFisicas_uid_seq"', 1, false);


--
-- Name: reservaCamas_UID_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."reservaCamas_UID_seq"', 1, false);


--
-- Name: reservaComplementosAlojamiento_complementoUID_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."reservaComplementosAlojamiento_complementoUID_seq"', 1, false);


--
-- Name: reservaHabitaciones_ID_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."reservaHabitaciones_ID_seq"', 1, false);


--
-- Name: reservaPagos_uid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."reservaPagos_uid_seq"', 1, false);


--
-- Name: reservaPernoctante_UID_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."reservaPernoctante_UID_seq"', 1, false);


--
-- Name: reservaReembolsos_uid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."reservaReembolsos_uid_seq"', 1, false);


--
-- Name: reservaServicios_servicioUID_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."reservaServicios_servicioUID_seq"', 1, false);


--
-- Name: reservaTitulares_uid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."reservaTitulares_uid_seq"', 1, false);


--
-- Name: reservaTotales_uid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."reservaTotales_uid_seq"', 1, false);


--
-- Name: servicios_servicioUID_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."servicios_servicioUID_seq"', 1, false);


--
-- Name: simulacionesDePrecioAlojamiento_apartamentoUID_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."simulacionesDePrecioAlojamiento_apartamentoUID_seq"', 1, false);


--
-- Name: simulacionesDePrecioComplementosAlojamiento_complementoUID_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."simulacionesDePrecioComplementosAlojamiento_complementoUID_seq"', 1, false);


--
-- Name: simulacionesDePrecioServicios_servicioUID_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."simulacionesDePrecioServicios_servicioUID_seq"', 1, false);


--
-- Name: simulacionesDePrecio_simulacionUID_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."simulacionesDePrecio_simulacionUID_seq"', 1, false);


--
-- Name: usuariosConfiguracion_uid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."usuariosConfiguracion_uid_seq"', 1, false);


--
-- Name: usuariosZonaHoraria_uid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."usuariosZonaHoraria_uid_seq"', 1, false);


--
-- Name: apartamentos apartamento; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.apartamentos
    ADD CONSTRAINT apartamento UNIQUE ("apartamentoIDV") INCLUDE ("apartamentoIDV");


--
-- Name: apartamentosCaracteristicas apartamentosCaracteristicas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."apartamentosCaracteristicas"
    ADD CONSTRAINT "apartamentosCaracteristicas_pkey" PRIMARY KEY ("caracteristicaUID");


--
-- Name: apartamentos apartamentos_apartamentoUI_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.apartamentos
    ADD CONSTRAINT "apartamentos_apartamentoUI_key" UNIQUE ("apartamentoUI");


--
-- Name: apartamentos apartamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.apartamentos
    ADD CONSTRAINT apartamentos_pkey PRIMARY KEY ("apartamentoIDV");


--
-- Name: bloqueosApartamentos bloqueosApartamentos_calendarioIDV_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."bloqueosApartamentos"
    ADD CONSTRAINT "bloqueosApartamentos_calendarioIDV_key" UNIQUE ("calendarioIDV");


--
-- Name: bloqueosApartamentos bloqueosApartamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."bloqueosApartamentos"
    ADD CONSTRAINT "bloqueosApartamentos_pkey" PRIMARY KEY ("bloqueoUID");


--
-- Name: calendariosSincronizados calendariosSincronizados_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."calendariosSincronizados"
    ADD CONSTRAINT "calendariosSincronizados_pkey" PRIMARY KEY ("calendarioUID");


--
-- Name: camas cama; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camas
    ADD CONSTRAINT cama UNIQUE ("camaIDV") INCLUDE ("camaIDV");


--
-- Name: camas camas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.camas
    ADD CONSTRAINT camas_pkey PRIMARY KEY ("camaIDV");


--
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY ("clienteUID");


--
-- Name: complementosDeAlojamiento complementosDeAlojamiento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."complementosDeAlojamiento"
    ADD CONSTRAINT "complementosDeAlojamiento_pkey" PRIMARY KEY ("complementoUID");


--
-- Name: comportamientoPrecios comportamientoPrecios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."comportamientoPrecios"
    ADD CONSTRAINT "comportamientoPrecios_pkey" PRIMARY KEY ("comportamientoUID");


--
-- Name: configuracionApartamento configuracionApartamentoDisponibildiad_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionApartamento"
    ADD CONSTRAINT "configuracionApartamentoDisponibildiad_pkey" PRIMARY KEY ("configuracionUID");


--
-- Name: configuracionApartamento configuracionApartamento_apartamentoIDV_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionApartamento"
    ADD CONSTRAINT "configuracionApartamento_apartamentoIDV_key" UNIQUE ("apartamentoIDV");


--
-- Name: configuracionApartamento configuracionApartamento_configuracionUID_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionApartamento"
    ADD CONSTRAINT "configuracionApartamento_configuracionUID_key" UNIQUE ("configuracionUID");


--
-- Name: configuracionHabitacionesDelApartamento configuracionApartamento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionHabitacionesDelApartamento"
    ADD CONSTRAINT "configuracionApartamento_pkey" PRIMARY KEY ("componenteUID");


--
-- Name: configuracionGlobal configuracionGlobal_configuracionUID_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionGlobal"
    ADD CONSTRAINT "configuracionGlobal_configuracionUID_key" UNIQUE ("configuracionUID");


--
-- Name: configuracionGlobal configuracionGlobal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionGlobal"
    ADD CONSTRAINT "configuracionGlobal_pkey" PRIMARY KEY ("configuracionUID");


--
-- Name: configuracionCamasEnHabitacion configuracionHabitacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionCamasEnHabitacion"
    ADD CONSTRAINT "configuracionHabitacion_pkey" PRIMARY KEY ("componenteUID");


--
-- Name: datosDeUsuario datosDeUsuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."datosDeUsuario"
    ADD CONSTRAINT "datosDeUsuario_pkey" PRIMARY KEY (usuario);


--
-- Name: datosDeUsuario datosDeUsuario_usuarioIDX_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."datosDeUsuario"
    ADD CONSTRAINT "datosDeUsuario_usuarioIDX_key" UNIQUE (usuario);


--
-- Name: datosDeUsuario datosDeUsuiario_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."datosDeUsuario"
    ADD CONSTRAINT "datosDeUsuiario_email_key" UNIQUE (mail);


--
-- Name: datosDeUsuario datosDeUsuiario_pasaporte_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."datosDeUsuario"
    ADD CONSTRAINT "datosDeUsuiario_pasaporte_key" UNIQUE (pasaporte);


--
-- Name: enlaceDeRecuperacionCuenta enlaceDeRecuperacionCuenta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."enlaceDeRecuperacionCuenta"
    ADD CONSTRAINT "enlaceDeRecuperacionCuenta_pkey" PRIMARY KEY ("enlaceUID");


--
-- Name: enlaceDeRecuperacionCuenta enlaceDeRecuperacionCuenta_usuario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."enlaceDeRecuperacionCuenta"
    ADD CONSTRAINT "enlaceDeRecuperacionCuenta_usuario_key" UNIQUE (usuario);


--
-- Name: enlacesDePago enlacesDePago_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."enlacesDePago"
    ADD CONSTRAINT "enlacesDePago_codigo_key" UNIQUE (codigo);


--
-- Name: enlacesDePago enlacesDePago_enlaceTVI_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."enlacesDePago"
    ADD CONSTRAINT "enlacesDePago_enlaceTVI_key" UNIQUE ("testingVI");


--
-- Name: enlacesDePago enlacesDePago_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."enlacesDePago"
    ADD CONSTRAINT "enlacesDePago_pkey" PRIMARY KEY ("enlaceUID");


--
-- Name: enlacesPdf enlacesPdf_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."enlacesPdf"
    ADD CONSTRAINT "enlacesPdf_pkey" PRIMARY KEY ("enlaceUID");


--
-- Name: habitaciones habitacion; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habitaciones
    ADD CONSTRAINT habitacion UNIQUE ("habitacionIDV") INCLUDE ("habitacionIDV");


--
-- Name: habitaciones habitaciones_habitacionUI_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habitaciones
    ADD CONSTRAINT "habitaciones_habitacionUI_key" UNIQUE ("habitacionUI");


--
-- Name: habitaciones habitaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.habitaciones
    ADD CONSTRAINT habitaciones_pkey PRIMARY KEY ("habitacionIDV");


--
-- Name: impuestos impuestos_impuesto_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.impuestos
    ADD CONSTRAINT impuestos_impuesto_key UNIQUE (nombre);


--
-- Name: impuestos impuestos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.impuestos
    ADD CONSTRAINT impuestos_pkey PRIMARY KEY ("impuestoUID");


--
-- Name: interruptoresGlobales interruptoresGlobales_interruptorIDV_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."interruptoresGlobales"
    ADD CONSTRAINT "interruptoresGlobales_interruptorIDV_key" UNIQUE ("interruptorIDV");


--
-- Name: interruptoresGlobales interruptoresGlobales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."interruptoresGlobales"
    ADD CONSTRAINT "interruptoresGlobales_pkey" PRIMARY KEY ("interruptorIDV");


--
-- Name: mensajesEnPortada mensaesEnPortada_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."mensajesEnPortada"
    ADD CONSTRAINT "mensaesEnPortada_pkey" PRIMARY KEY ("mensajeUID", mensaje);


--
-- Name: ofertas ofertasV2_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ofertas
    ADD CONSTRAINT "ofertasV2_pkey" PRIMARY KEY ("ofertaUID");


--
-- Name: ofertas ofertas_nombreOferta_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ofertas
    ADD CONSTRAINT "ofertas_nombreOferta_key" UNIQUE ("nombreOferta");


--
-- Name: poolClientes poolClientesPreFormateo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."poolClientes"
    ADD CONSTRAINT "poolClientesPreFormateo_pkey" PRIMARY KEY ("clienteUID");


--
-- Name: poolTitularesReserva poolTitularesReserva_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."poolTitularesReserva"
    ADD CONSTRAINT "poolTitularesReserva_pkey" PRIMARY KEY ("titularPoolUID");


--
-- Name: mensajesEnPortada posicion; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."mensajesEnPortada"
    ADD CONSTRAINT posicion UNIQUE (posicion) INCLUDE (posicion);


--
-- Name: preciosApartamentos precios_apartamento_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."preciosApartamentos"
    ADD CONSTRAINT precios_apartamento_key UNIQUE ("apartamentoIDV");


--
-- Name: preciosApartamentos precios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."preciosApartamentos"
    ADD CONSTRAINT precios_pkey PRIMARY KEY ("precioUID");


--
-- Name: reservaApartamentos reservaApartamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaApartamentos"
    ADD CONSTRAINT "reservaApartamentos_pkey" PRIMARY KEY ("componenteUID");


--
-- Name: reservaCamasFisicas reservaCamasFisicas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaCamasFisicas"
    ADD CONSTRAINT "reservaCamasFisicas_pkey" PRIMARY KEY ("componenteUID");


--
-- Name: reservaCamasFisicas reservaCamasFisicas_uid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaCamasFisicas"
    ADD CONSTRAINT "reservaCamasFisicas_uid_key" UNIQUE ("componenteUID");


--
-- Name: reservaCamas reservaCamas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaCamas"
    ADD CONSTRAINT "reservaCamas_pkey" PRIMARY KEY ("componenteUID");


--
-- Name: reservaComplementosAlojamiento reservaComplementosAlojamiento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaComplementosAlojamiento"
    ADD CONSTRAINT "reservaComplementosAlojamiento_pkey" PRIMARY KEY ("complementoUID");


--
-- Name: reservaFinanciero reservaDesgloseFinanciero_componenteUID_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaFinanciero"
    ADD CONSTRAINT "reservaDesgloseFinanciero_componenteUID_key" UNIQUE ("componenteUID");


--
-- Name: reservaHabitaciones reservaHabitaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaHabitaciones"
    ADD CONSTRAINT "reservaHabitaciones_pkey" PRIMARY KEY ("componenteUID");


--
-- Name: reservaPagos reservaPagos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaPagos"
    ADD CONSTRAINT "reservaPagos_pkey" PRIMARY KEY ("pagoUID");


--
-- Name: reservaPernoctantes reservaPernoctante_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaPernoctantes"
    ADD CONSTRAINT "reservaPernoctante_pkey" PRIMARY KEY ("componenteUID");


--
-- Name: reservaReembolsos reservaReembolsos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaReembolsos"
    ADD CONSTRAINT "reservaReembolsos_pkey" PRIMARY KEY ("reembolsoUID");


--
-- Name: reservaServicios reservaServicios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaServicios"
    ADD CONSTRAINT "reservaServicios_pkey" PRIMARY KEY ("servicioUID");


--
-- Name: reservaTitulares reservaTitulares_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaTitulares"
    ADD CONSTRAINT "reservaTitulares_pkey" PRIMARY KEY ("titularUID");


--
-- Name: reservaFinanciero reservaTotales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaFinanciero"
    ADD CONSTRAINT "reservaTotales_pkey" PRIMARY KEY ("componenteUID");


--
-- Name: reservas reservas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT reservas_pkey PRIMARY KEY ("reservaUID");


--
-- Name: reservas reservas_reservaUIDnuevo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT "reservas_reservaUIDnuevo_key" UNIQUE ("reservaUID");


--
-- Name: servicios servicios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicios
    ADD CONSTRAINT servicios_pkey PRIMARY KEY ("servicioUID");


--
-- Name: sessiones session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessiones
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: simulacionesDePrecioServicios simulacionDePrecioServicios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."simulacionesDePrecioServicios"
    ADD CONSTRAINT "simulacionDePrecioServicios_pkey" PRIMARY KEY ("servicioUID");


--
-- Name: simulacionesDePrecioAlojamiento simulacionesDePrecioAlojamiento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."simulacionesDePrecioAlojamiento"
    ADD CONSTRAINT "simulacionesDePrecioAlojamiento_pkey" PRIMARY KEY ("apartamentoUID");


--
-- Name: simulacionesDePrecioComplementosAlojamiento simulacionesDePrecioComplementosAlojamiento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."simulacionesDePrecioComplementosAlojamiento"
    ADD CONSTRAINT "simulacionesDePrecioComplementosAlojamiento_pkey" PRIMARY KEY ("complementoUID");


--
-- Name: simulacionesDePrecio simulacionesDePrecio_reservaUID_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."simulacionesDePrecio"
    ADD CONSTRAINT "simulacionesDePrecio_reservaUID_key" UNIQUE ("reservaUID");


--
-- Name: simulacionesDePrecio simulacionesDePrecio_uid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."simulacionesDePrecio"
    ADD CONSTRAINT "simulacionesDePrecio_uid_key" UNIQUE ("simulacionUID");


--
-- Name: simulacionesDePrecio simuladorPrecios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."simulacionesDePrecio"
    ADD CONSTRAINT "simuladorPrecios_pkey" PRIMARY KEY ("simulacionUID");


--
-- Name: usuariosConfiguracion usuariosConfiguracion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."usuariosConfiguracion"
    ADD CONSTRAINT "usuariosConfiguracion_pkey" PRIMARY KEY ("configuracionUID");


--
-- Name: usuariosZonaHoraria usuariosZonaHoraria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."usuariosZonaHoraria"
    ADD CONSTRAINT "usuariosZonaHoraria_pkey" PRIMARY KEY ("zonaUID");


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (usuario);


--
-- Name: usuarios usuarios_usuario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_usuario_key UNIQUE (usuario);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_session_expire" ON public.sessiones USING btree (expire);


--
-- Name: configuracionHabitacionesDelApartamento Apartamento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionHabitacionesDelApartamento"
    ADD CONSTRAINT "Apartamento" FOREIGN KEY ("apartamentoIDV") REFERENCES public."configuracionApartamento"("apartamentoIDV") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaHabitaciones Apartamento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaHabitaciones"
    ADD CONSTRAINT "Apartamento" FOREIGN KEY ("apartamentoUID") REFERENCES public."reservaApartamentos"("componenteUID") ON DELETE CASCADE NOT VALID;


--
-- Name: configuracionCamasEnHabitacion Cama; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionCamasEnHabitacion"
    ADD CONSTRAINT "Cama" FOREIGN KEY ("camaIDV") REFERENCES public.camas("camaIDV") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: configuracionHabitacionesDelApartamento Habitacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionHabitacionesDelApartamento"
    ADD CONSTRAINT "Habitacion" FOREIGN KEY ("habitacionIDV") REFERENCES public.habitaciones("habitacionIDV") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: configuracionCamasEnHabitacion Habitacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionCamasEnHabitacion"
    ADD CONSTRAINT "Habitacion" FOREIGN KEY ("habitacionUID") REFERENCES public."configuracionHabitacionesDelApartamento"("componenteUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaCamas Habitacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaCamas"
    ADD CONSTRAINT "Habitacion" FOREIGN KEY ("habitacionUID") REFERENCES public."reservaHabitaciones"("componenteUID") ON DELETE CASCADE NOT VALID;


--
-- Name: reservaPernoctantes Habitacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaPernoctantes"
    ADD CONSTRAINT "Habitacion" FOREIGN KEY ("habitacionUID") REFERENCES public."reservaHabitaciones"("componenteUID") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: usuariosZonaHoraria IDX; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."usuariosZonaHoraria"
    ADD CONSTRAINT "IDX" FOREIGN KEY (usuario) REFERENCES public.usuarios(usuario) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaPernoctantes Pernoctante; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaPernoctantes"
    ADD CONSTRAINT "Pernoctante" FOREIGN KEY ("clienteUID") REFERENCES public.clientes("clienteUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaApartamentos Reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaApartamentos"
    ADD CONSTRAINT "Reserva" FOREIGN KEY ("reservaUID") REFERENCES public.reservas("reservaUID") ON DELETE CASCADE;


--
-- Name: preciosApartamentos apartamento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."preciosApartamentos"
    ADD CONSTRAINT apartamento FOREIGN KEY ("apartamentoIDV") REFERENCES public."configuracionApartamento"("apartamentoIDV") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: configuracionApartamento apartamentoIDV; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."configuracionApartamento"
    ADD CONSTRAINT "apartamentoIDV" FOREIGN KEY ("apartamentoIDV") REFERENCES public.apartamentos("apartamentoIDV") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: apartamentosCaracteristicas apartamentoIDV; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."apartamentosCaracteristicas"
    ADD CONSTRAINT "apartamentoIDV" FOREIGN KEY ("apartamentoIDV") REFERENCES public.apartamentos("apartamentoIDV") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: calendariosSincronizados apartamentoIDV; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."calendariosSincronizados"
    ADD CONSTRAINT "apartamentoIDV" FOREIGN KEY ("apartamentoIDV") REFERENCES public."configuracionApartamento"("apartamentoIDV") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: bloqueosApartamentos apartamentos; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."bloqueosApartamentos"
    ADD CONSTRAINT apartamentos FOREIGN KEY ("apartamentoIDV") REFERENCES public."configuracionApartamento"("apartamentoIDV") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaCamasFisicas camaIDV; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaCamasFisicas"
    ADD CONSTRAINT "camaIDV" FOREIGN KEY ("camaIDV") REFERENCES public.camas("camaIDV") ON UPDATE CASCADE;


--
-- Name: complementosDeAlojamiento complementosDeAlojamiento_apartamentoIDV_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."complementosDeAlojamiento"
    ADD CONSTRAINT "complementosDeAlojamiento_apartamentoIDV_fkey" FOREIGN KEY ("apartamentoIDV") REFERENCES public."configuracionApartamento"("apartamentoIDV") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: datosDeUsuario datosDeUsuiario_usuarioIDX_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."datosDeUsuario"
    ADD CONSTRAINT "datosDeUsuiario_usuarioIDX_fkey" FOREIGN KEY (usuario) REFERENCES public.usuarios(usuario) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaCamasFisicas habitacionUID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaCamasFisicas"
    ADD CONSTRAINT "habitacionUID" FOREIGN KEY ("habitacionUID") REFERENCES public."reservaHabitaciones"("componenteUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaReembolsos pagoUID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaReembolsos"
    ADD CONSTRAINT "pagoUID" FOREIGN KEY ("pagoUID") REFERENCES public."reservaPagos"("pagoUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: poolClientes pernoctanteUID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."poolClientes"
    ADD CONSTRAINT "pernoctanteUID" FOREIGN KEY ("pernoctanteUID") REFERENCES public."reservaPernoctantes"("componenteUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: enlacesPdf reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."enlacesPdf"
    ADD CONSTRAINT reserva FOREIGN KEY ("reservaUID") REFERENCES public.reservas("reservaUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: poolTitularesReserva reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."poolTitularesReserva"
    ADD CONSTRAINT reserva FOREIGN KEY ("reservaUID") REFERENCES public.reservas("reservaUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaCamas reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaCamas"
    ADD CONSTRAINT reserva FOREIGN KEY ("reservaUID") REFERENCES public.reservas("reservaUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaHabitaciones reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaHabitaciones"
    ADD CONSTRAINT reserva FOREIGN KEY ("reservaUID") REFERENCES public.reservas("reservaUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaPagos reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaPagos"
    ADD CONSTRAINT reserva FOREIGN KEY ("reservaUID") REFERENCES public.reservas("reservaUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaPernoctantes reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaPernoctantes"
    ADD CONSTRAINT reserva FOREIGN KEY ("reservaUID") REFERENCES public.reservas("reservaUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaTitulares reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaTitulares"
    ADD CONSTRAINT reserva FOREIGN KEY ("reservaUID") REFERENCES public.reservas("reservaUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaComplementosAlojamiento reservaComplementosAlojamiento_apartamentoIDV_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaComplementosAlojamiento"
    ADD CONSTRAINT "reservaComplementosAlojamiento_apartamentoIDV_fkey" FOREIGN KEY ("apartamentoIDV") REFERENCES public."configuracionApartamento"("apartamentoIDV") ON UPDATE CASCADE;


--
-- Name: reservaComplementosAlojamiento reservaComplementosAlojamiento_apartamentoUID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaComplementosAlojamiento"
    ADD CONSTRAINT "reservaComplementosAlojamiento_apartamentoUID_fkey" FOREIGN KEY ("apartamentoUID") REFERENCES public."reservaApartamentos"("componenteUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaComplementosAlojamiento reservaComplementosAlojamiento_reservaUID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaComplementosAlojamiento"
    ADD CONSTRAINT "reservaComplementosAlojamiento_reservaUID_fkey" FOREIGN KEY ("reservaUID") REFERENCES public.reservas("reservaUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaCamasFisicas reservaUID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaCamasFisicas"
    ADD CONSTRAINT "reservaUID" FOREIGN KEY ("reservaUID") REFERENCES public.reservas("reservaUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaFinanciero reservaUID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaFinanciero"
    ADD CONSTRAINT "reservaUID" FOREIGN KEY ("reservaUID") REFERENCES public.reservas("reservaUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaServicios reservaUID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaServicios"
    ADD CONSTRAINT "reservaUID" FOREIGN KEY ("reservaUID") REFERENCES public.reservas("reservaUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: enlacesDePago reservas; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."enlacesDePago"
    ADD CONSTRAINT reservas FOREIGN KEY ("reservaUID") REFERENCES public.reservas("reservaUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: simulacionesDePrecioServicios simulacionUID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."simulacionesDePrecioServicios"
    ADD CONSTRAINT "simulacionUID" FOREIGN KEY ("simulacionUID") REFERENCES public."simulacionesDePrecio"("simulacionUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: simulacionesDePrecioAlojamiento simulacionesDePrecioAlojamiento_alojamientoIDV_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."simulacionesDePrecioAlojamiento"
    ADD CONSTRAINT "simulacionesDePrecioAlojamiento_alojamientoIDV_fkey" FOREIGN KEY ("apartamentoIDV") REFERENCES public."configuracionApartamento"("apartamentoIDV") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: simulacionesDePrecioAlojamiento simulacionesDePrecioAlojamiento_simulacionUID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."simulacionesDePrecioAlojamiento"
    ADD CONSTRAINT "simulacionesDePrecioAlojamiento_simulacionUID_fkey" FOREIGN KEY ("simulacionUID") REFERENCES public."simulacionesDePrecio"("simulacionUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: simulacionesDePrecioComplementosAlojamiento simulacionesDePrecioComplementosAlojamiento_apartamentoIDV_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."simulacionesDePrecioComplementosAlojamiento"
    ADD CONSTRAINT "simulacionesDePrecioComplementosAlojamiento_apartamentoIDV_fkey" FOREIGN KEY ("apartamentoIDV") REFERENCES public."configuracionApartamento"("apartamentoIDV") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: simulacionesDePrecioComplementosAlojamiento simulacionesDePrecioComplementosAlojamiento_apartamentoUID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."simulacionesDePrecioComplementosAlojamiento"
    ADD CONSTRAINT "simulacionesDePrecioComplementosAlojamiento_apartamentoUID_fkey" FOREIGN KEY ("apartamentoUID") REFERENCES public."simulacionesDePrecioAlojamiento"("apartamentoUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: simulacionesDePrecioComplementosAlojamiento simulacionesDePrecioComplementosAlojamiento_simulacionUID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."simulacionesDePrecioComplementosAlojamiento"
    ADD CONSTRAINT "simulacionesDePrecioComplementosAlojamiento_simulacionUID_fkey" FOREIGN KEY ("simulacionUID") REFERENCES public."simulacionesDePrecio"("simulacionUID") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservaTitulares titular; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reservaTitulares"
    ADD CONSTRAINT titular FOREIGN KEY ("clienteUID") REFERENCES public.clientes("clienteUID") ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: enlaceDeRecuperacionCuenta usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."enlaceDeRecuperacionCuenta"
    ADD CONSTRAINT usuario FOREIGN KEY (usuario) REFERENCES public.usuarios(usuario) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: usuariosConfiguracion usuarios; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."usuariosConfiguracion"
    ADD CONSTRAINT usuarios FOREIGN KEY (usuario) REFERENCES public.usuarios(usuario) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

