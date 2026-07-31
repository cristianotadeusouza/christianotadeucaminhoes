export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Esta página não carregou | Christiano Tadeu</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.6 system-ui, -apple-system, sans-serif; background: #071A2F; color: #fff; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 30rem; width: 100%; text-align: center; padding: 2.5rem; border-top: 3px solid #E6332A; background: #0A2340; }
      h1 { font-size: 1.5rem; margin: 0 0 0.75rem; }
      p { color: #B8C1CC; margin: 0 0 1.75rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #E6332A; color: #fff; }
      .secondary { background: transparent; color: #fff; border-color: #B8C1CC; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Esta página não carregou</h1>
      <p>Ocorreu uma falha temporária. Você pode tentar novamente ou voltar para o início.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Tentar novamente</button>
        <a class="secondary" href="/">Voltar ao início</a>
      </div>
    </div>
  </body>
</html>`;
}
