-- Veltra Business Solutions — Setup SQL para Supabase
-- Corre este ficheiro no SQL Editor do Supabase

-- ─── Enums ────────────────────────────────────────────────────────────────────

CREATE TYPE "TipoEmpresa" AS ENUM ('CLIENTE', 'PRESTADOR', 'AMBOS');
CREATE TYPE "StatusEmpresa" AS ENUM ('PENDENTE', 'ATIVO', 'SUSPENSO');
CREATE TYPE "CategoriaServico" AS ENUM ('LIMPEZA', 'CONTABILIDADE', 'IT', 'RH', 'MARKETING');
CREATE TYPE "StatusPedido" AS ENUM ('ABERTO', 'ADJUDICADO', 'CONCLUIDO', 'CANCELADO');
CREATE TYPE "StatusProposta" AS ENUM ('PENDENTE', 'ADJUDICADA', 'REJEITADA');
CREATE TYPE "CarregadaPor" AS ENUM ('PRESTADOR', 'CLIENTE');
CREATE TYPE "TipoRating" AS ENUM ('CLIENTE_AVALIA_PRESTADOR', 'PRESTADOR_AVALIA_CLIENTE');

-- ─── NextAuth ─────────────────────────────────────────────────────────────────

CREATE TABLE "User" (
  "id"            TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name"          TEXT,
  "email"         TEXT NOT NULL UNIQUE,
  "emailVerified" TIMESTAMP(3),
  "passwordHash"  TEXT,
  "image"         TEXT,
  "empresaId"     TEXT UNIQUE
);

CREATE TABLE "Account" (
  "id"                TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"            TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "type"              TEXT NOT NULL,
  "provider"          TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token"     TEXT,
  "access_token"      TEXT,
  "expires_at"        INTEGER,
  "token_type"        TEXT,
  "scope"             TEXT,
  "id_token"          TEXT,
  "session_state"     TEXT,
  UNIQUE("provider", "providerAccountId")
);

CREATE TABLE "Session" (
  "id"           TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sessionToken" TEXT NOT NULL UNIQUE,
  "userId"       TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "expires"      TIMESTAMP(3) NOT NULL
);

CREATE TABLE "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token"      TEXT NOT NULL UNIQUE,
  "expires"    TIMESTAMP(3) NOT NULL,
  UNIQUE("identifier", "token")
);

CREATE TABLE "EmailToken" (
  "id"        TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "token"     TEXT NOT NULL UNIQUE,
  "userId"    TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "expires"   TIMESTAMP(3) NOT NULL,
  "usado"     BOOLEAN NOT NULL DEFAULT false,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

-- ─── Empresa ──────────────────────────────────────────────────────────────────

CREATE TABLE "Empresa" (
  "id"        TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "nif"       TEXT NOT NULL UNIQUE,
  "nome"      TEXT NOT NULL,
  "cae"       TEXT,
  "morada"    TEXT,
  "email"     TEXT NOT NULL UNIQUE,
  "telefone"  TEXT,
  "tipo"      "TipoEmpresa" NOT NULL,
  "status"    "StatusEmpresa" NOT NULL DEFAULT 'PENDENTE',
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

ALTER TABLE "User" ADD CONSTRAINT "User_empresaId_fkey"
  FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id");

-- ─── Prestador ────────────────────────────────────────────────────────────────

CREATE TABLE "Prestador" (
  "id"              TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "empresaId"       TEXT NOT NULL UNIQUE REFERENCES "Empresa"("id") ON DELETE CASCADE,
  "categorias"      "CategoriaServico"[] NOT NULL DEFAULT '{}',
  "raioKm"          INTEGER,
  "ratingGlobal"    DOUBLE PRECISION,
  "totalAvaliacoes" INTEGER NOT NULL DEFAULT 0
);

-- ─── Pedido ───────────────────────────────────────────────────────────────────

CREATE TABLE "Pedido" (
  "id"               TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "empresaClienteId" TEXT NOT NULL REFERENCES "Empresa"("id"),
  "categoria"        "CategoriaServico" NOT NULL,
  "titulo"           TEXT NOT NULL,
  "descricao"        TEXT NOT NULL,
  "localizacao"      TEXT NOT NULL,
  "latLng"           TEXT,
  "status"           "StatusPedido" NOT NULL DEFAULT 'ABERTO',
  "criadoEm"        TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "atualizadoEm"    TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

CREATE TABLE "Anexo" (
  "id"        TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "pedidoId"  TEXT NOT NULL REFERENCES "Pedido"("id") ON DELETE CASCADE,
  "nome"      TEXT NOT NULL,
  "url"       TEXT NOT NULL,
  "tamanho"   INTEGER,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

-- ─── Proposta ─────────────────────────────────────────────────────────────────

CREATE TABLE "Proposta" (
  "id"                 TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "pedidoId"           TEXT NOT NULL REFERENCES "Pedido"("id"),
  "prestadorId"        TEXT NOT NULL REFERENCES "Prestador"("id"),
  "preco"              DOUBLE PRECISION NOT NULL,
  "dataInicio"         TIMESTAMP(3) NOT NULL,
  "dataConclusao"      TIMESTAMP(3) NOT NULL,
  "validadeProposta"   TIMESTAMP(3),
  "descricaoAbordagem" TEXT,
  "observacoes"        TEXT,
  "status"             "StatusProposta" NOT NULL DEFAULT 'PENDENTE',
  "criadoEm"          TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "atualizadoEm"      TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

-- ─── Fatura ───────────────────────────────────────────────────────────────────

CREATE TABLE "Fatura" (
  "id"           TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "pedidoId"     TEXT NOT NULL REFERENCES "Pedido"("id"),
  "propostaId"   TEXT NOT NULL REFERENCES "Proposta"("id"),
  "prestadorId"  TEXT NOT NULL REFERENCES "Prestador"("id"),
  "clienteId"    TEXT NOT NULL REFERENCES "Empresa"("id"),
  "numeroFatura" TEXT NOT NULL,
  "valor"        DOUBLE PRECISION NOT NULL,
  "ficheiroUrl"  TEXT,
  "carregadaPor" "CarregadaPor",
  "confirmada"   BOOLEAN NOT NULL DEFAULT false,
  "criadoEm"    TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "confirmadaEm" TIMESTAMP(3)
);

-- ─── Rating ───────────────────────────────────────────────────────────────────

CREATE TABLE "Rating" (
  "id"                    TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "faturaId"              TEXT NOT NULL REFERENCES "Fatura"("id"),
  "avaliadorId"           TEXT NOT NULL REFERENCES "Empresa"("id"),
  "avaliadoId"            TEXT NOT NULL REFERENCES "Empresa"("id"),
  "tipo"                  "TipoRating" NOT NULL,
  "qualidade"             DOUBLE PRECISION,
  "prazos"                DOUBLE PRECISION,
  "fidelidadeOrcamental"  DOUBLE PRECISION,
  "pontualidadePagamento" DOUBLE PRECISION,
  "clareza"               DOUBLE PRECISION,
  "facilidadeColaboracao" DOUBLE PRECISION,
  "mediaPonderada"        DOUBLE PRECISION,
  "criadoEm"             TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  UNIQUE("faturaId", "avaliadorId")
);
