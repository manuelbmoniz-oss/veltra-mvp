/**
 * Wrapper de arranque para dev — responde imediatamente na porta 3000
 * enquanto o Next.js compila, depois faz proxy de todos os pedidos.
 */
const http = require('http')
const net = require('net')
const { spawn } = require('child_process')
const path = require('path')

// Muda para o diretório do projeto antes de qualquer coisa
process.chdir(__dirname)

const PORT = parseInt(process.env.PORT || '3000', 10)
const NEXT_PORT = PORT + 1  // Next.js corre internamente nesta porta

let nextReady = false

// Inicia o Next.js na porta NEXT_PORT
const nextProcess = spawn(
  process.execPath,
  [path.join(__dirname, 'node_modules/next/dist/bin/next'), 'dev', '-p', String(NEXT_PORT)],
  { stdio: 'inherit', env: { ...process.env } }
)

nextProcess.on('exit', (code) => {
  if (code !== 0) process.exit(code)
})

// Polling: verifica quando o Next.js está pronto
function checkNextReady() {
  const sock = net.createConnection({ port: NEXT_PORT, host: '127.0.0.1' })
  sock.on('connect', () => { sock.destroy(); nextReady = true })
  sock.on('error', () => { if (!nextReady) setTimeout(checkNextReady, 500) })
}
checkNextReady()

// Proxy de pedidos para o Next.js
function proxyRequest(req, res) {
  const options = {
    hostname: '127.0.0.1',
    port: NEXT_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers,
  }
  const proxy = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers)
    proxyRes.pipe(res, { end: true })
  })
  proxy.on('error', (e) => {
    res.writeHead(502)
    res.end('Proxy error: ' + e.message)
  })
  req.pipe(proxy, { end: true })
}

// Servidor principal — responde imediatamente (loading) até o Next.js estar pronto
const server = http.createServer((req, res) => {
  if (nextReady) {
    proxyRequest(req, res)
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Refresh': '2' })
    res.end(`<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8"/>
  <meta http-equiv="refresh" content="2"/>
  <title>Veltra — A arrancar...</title>
  <style>
    body { font-family: Inter, sans-serif; display: flex; align-items: center; justify-content: center;
           min-height: 100vh; margin: 0; background: #1F4E79; color: white; }
    .box { text-align: center; }
    .spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.2);
               border-top-color: white; border-radius: 50%;
               animation: spin 0.8s linear infinite; margin: 0 auto 20px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    h1 { font-size: 24px; margin: 0 0 8px; }
    p  { opacity: 0.7; font-size: 14px; margin: 0; }
  </style>
</head>
<body>
  <div class="box">
    <div class="spinner"></div>
    <h1>Veltra Business Solutions</h1>
    <p>A compilar o servidor de desenvolvimento…</p>
  </div>
</body>
</html>`)
  }
})

server.listen(PORT, () => {
  console.log(`> Veltra wrapper pronto em http://localhost:${PORT}`)
  console.log(`> Next.js a compilar na porta ${NEXT_PORT}...`)
})
