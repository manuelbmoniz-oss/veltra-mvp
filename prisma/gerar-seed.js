// Gera o SQL de seed com passwords encriptadas
const bcrypt = require('bcryptjs')

const passCliente   = bcrypt.hashSync('Veltra2025!', 10)
const passPrestador = bcrypt.hashSync('Veltra2025!', 10)

const sql = `
-- ─── SEED: Dados de exemplo para Veltra ───────────────────────────────────────
-- Password de ambas as contas: Veltra2025!

-- Empresas
INSERT INTO "Empresa" ("id","nif","nome","email","telefone","morada","tipo","status","criadoEm")
VALUES
  ('empresa-cliente-001', '501234560', 'TechCorp Lda', 'cliente@veltra.pt', '912000001', 'Rua da Inovação, 10, Lisboa', 'CLIENTE', 'ATIVO', NOW()),
  ('empresa-prestador-001', '502345671', 'CleanPro Serviços', 'prestador@veltra.pt', '912000002', 'Av. da Limpeza, 25, Porto', 'PRESTADOR', 'ATIVO', NOW());

-- Utilizadores
INSERT INTO "User" ("id","name","email","passwordHash","empresaId")
VALUES
  ('user-cliente-001', 'Ana Silva', 'cliente@veltra.pt', '${passCliente}', 'empresa-cliente-001'),
  ('user-prestador-001', 'Bruno Costa', 'prestador@veltra.pt', '${passPrestador}', 'empresa-prestador-001');

-- Prestador
INSERT INTO "Prestador" ("id","empresaId","categorias","raioKm","ratingGlobal","totalAvaliacoes")
VALUES
  ('prestador-001', 'empresa-prestador-001', '{LIMPEZA}', 50, NULL, 0);

-- Pedido de exemplo
INSERT INTO "Pedido" ("id","empresaClienteId","categoria","titulo","descricao","localizacao","status","criadoEm","atualizadoEm")
VALUES
  ('pedido-001', 'empresa-cliente-001', 'LIMPEZA', 'Limpeza de escritório semanal',
   'Precisamos de serviço de limpeza semanal para escritório de 200m² em Lisboa. Inclui casas de banho, cozinha e zona de trabalho.',
   'Lisboa', 'ABERTO', NOW(), NOW());
`

console.log(sql)
