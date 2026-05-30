<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CIMENTEC - CRM para Oficina ELÉTRICA</title>
<link rel="stylesheet" href="style.css">
</head>
<body>

<!-- ========= SIDEBAR ========= -->
<aside class="sidebar">
  <div class="logo">
    <img src="assets/cimentec_transparent.png" alt="Cimentec Logo" style="width: 60px; height: auto; object-fit: contain;">
    <div>
      <h1>CIMENTEC</h1>
      <span>ELÉTRICA</span>
    </div>
  </div>


  <nav>
    <button class="nav-btn active" data-view="dashboard">📊 Dashboard</button>
    <button class="nav-btn" data-view="clientes">👤 Clientes</button>
    <button class="nav-btn" data-view="caminhoes">🚛 Caminhões</button>
    <button class="nav-btn" data-view="servicos">🔧 Serviços</button>
    <button class="nav-btn" data-view="lembretes">🔔 Lembretes</button>
    <button class="nav-btn" data-view="ia">🤖 Assistente IA</button>
    <button class="nav-btn" data-view="config">⚙️ Configurações</button>
  </nav>

  <div class="sidebar-footer">
    <button class="btn-ghost" id="btnExport">⬇️ Exportar dados</button>
    <button class="btn-ghost" id="btnImport">⬆️ Importar dados</button>
    <input type="file" id="fileImport" accept=".json" hidden>
  </div>
</aside>

<!-- ========= MAIN ========= -->
<main class="main">

  <!-- ===== DASHBOARD ===== -->
  <section class="view active" id="view-dashboard">
    <header class="page-header">
      <div>
        <h2>Dashboard</h2>
        <p class="subtitle">Visão geral da oficina</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" data-go="servicos-novo">+ Novo Serviço</button>
      </div>
    </header>

    <div class="cards-grid">
      <div class="card stat">
        <span class="stat-label">Clientes</span>
        <span class="stat-value" id="statClientes">0</span>
      </div>
      <div class="card stat">
        <span class="stat-label">Caminhões</span>
        <span class="stat-value" id="statCaminhoes">0</span>
      </div>
      <div class="card stat">
        <span class="stat-label">Serviços no mês</span>
        <span class="stat-value" id="statServicosMes">0</span>
      </div>
      <div class="card stat">
        <span class="stat-label">Faturamento do mês</span>
        <span class="stat-value" id="statFatMes">R$ 0</span>
      </div>
      <div class="card stat alert">
        <span class="stat-label">Lembretes ativos</span>
        <span class="stat-value" id="statLembretes">0</span>
      </div>
      <div class="card stat success">
        <span class="stat-label">Ticket médio</span>
        <span class="stat-value" id="statTicket">R$ 0</span>
      </div>
    </div>

    <div class="two-col">
      <div class="card">
        <h3>🔔 Lembretes próximos</h3>
        <div id="dashLembretes" class="list-compact"></div>
      </div>
      <div class="card">
        <h3>🕒 Últimos serviços</h3>
        <div id="dashServicos" class="list-compact"></div>
      </div>
    </div>
  </section>

  <!-- ===== CLIENTES ===== -->
  <section class="view" id="view-clientes">
    <header class="page-header">
      <div>
        <h2>Clientes</h2>
        <p class="subtitle">Cadastro de motoristas, frotistas e empresas</p>
      </div>
      <div class="header-actions">
        <input type="text" id="searchCliente" placeholder="🔎 Buscar cliente...">
        <button class="btn-primary" id="btnNovoCliente">+ Novo Cliente</button>
      </div>
    </header>

    <div class="card">
      <table class="data-table" id="tableClientes">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Telefone</th>
            <th>Tipo</th>
            <th>Caminhões</th>
            <th>Último serviço</th>
            <th></th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
      <div class="empty" id="emptyClientes">Nenhum cliente cadastrado ainda.</div>
    </div>
  </section>

  <!-- ===== CAMINHÕES ===== -->
  <section class="view" id="view-caminhoes">
    <header class="page-header">
      <div>
        <h2>Caminhões</h2>
        <p class="subtitle">Frota cadastrada</p>
      </div>
      <div class="header-actions">
        <input type="text" id="searchCaminhao" placeholder="🔎 Placa, marca, modelo...">
        <button class="btn-primary" id="btnNovoCaminhao">+ Novo Caminhão</button>
      </div>
    </header>

    <div class="card">
      <table class="data-table" id="tableCaminhoes">
        <thead>
          <tr>
            <th>Placa</th>
            <th>Marca/Modelo</th>
            <th>Ano</th>
            <th>Cliente</th>
            <th>KM</th>
            <th>Último serviço</th>
            <th></th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
      <div class="empty" id="emptyCaminhoes">Nenhum caminhão cadastrado ainda.</div>
    </div>
  </section>

  <!-- ===== SERVIÇOS ===== -->
  <section class="view" id="view-servicos">
    <header class="page-header">
      <div>
        <h2>Serviços</h2>
        <p class="subtitle">Histórico de ordens de serviço elétricas</p>
      </div>
      <div class="header-actions">
        <input type="text" id="searchServico" placeholder="🔎 Buscar serviço...">
        <button class="btn-primary" id="btnNovoServico">+ Nova OS</button>
      </div>
    </header>

    <div class="card">
      <table class="data-table" id="tableServicos">
        <thead>
          <tr>
            <th>Data</th>
            <th>Caminhão</th>
            <th>Cliente</th>
            <th>Descrição</th>
            <th>KM</th>
            <th>Valor</th>
            <th></th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
      <div class="empty" id="emptyServicos">Nenhum serviço registrado ainda.</div>
    </div>
  </section>

  <!-- ===== LEMBRETES ===== -->
  <section class="view" id="view-lembretes">
    <header class="page-header">
      <div>
        <h2>Lembretes Automáticos</h2>
        <p class="subtitle">Retornos e revisões geradas a partir do histórico</p>
      </div>
      <div class="header-actions">
        <button class="btn-secondary" id="btnGerarLembretes">⚙️ Gerar lembretes agora</button>
      </div>
    </header>

    <div class="card">
      <div id="listLembretes" class="list-compact"></div>
      <div class="empty" id="emptyLembretes">Nenhum lembrete pendente. Cadastre serviços para gerar lembretes automaticamente.</div>
    </div>
  </section>

  <!-- ===== IA ===== -->
  <section class="view" id="view-ia">
    <header class="page-header">
      <div>
        <h2>🤖 Assistente IA</h2>
        <p class="subtitle">Mensagens personalizadas e sugestões inteligentes baseadas no histórico</p>
      </div>
    </header>

    <div class="two-col">
      <div class="card">
        <h3>📩 Gerar mensagem de retorno</h3>
        <p class="hint">Escolha um cliente/caminhão e a IA cria a mensagem perfeita pra WhatsApp.</p>
        <div class="form-row">
          <label>Caminhão</label>
          <select id="iaCaminhao"></select>
        </div>
        <div class="form-row">
          <label>Tipo de mensagem</label>
          <select id="iaTipo">
            <option value="retorno">Retorno de revisão</option>
            <option value="orcamento">Follow-up de orçamento</option>
            <option value="agradecimento">Agradecimento pós-serviço</option>
            <option value="preventiva">Manutenção preventiva</option>
            <option value="aniversario">Aniversário de cliente</option>
          </select>
        </div>
        <div class="form-row">
          <label>Tom da mensagem</label>
          <select id="iaTom">
            <option value="amigavel">Amigável e próximo</option>
            <option value="profissional">Profissional</option>
            <option value="direto">Curto e direto</option>
          </select>
        </div>
        <button class="btn-primary" id="btnGerarMensagem">✨ Gerar mensagem</button>

        <div class="ia-output" id="iaOutput" style="display:none;">
          <h4>Mensagem gerada</h4>
          <textarea id="iaTexto" rows="8"></textarea>
          <div class="output-actions">
            <button class="btn-secondary" id="btnCopiar">📋 Copiar</button>
            <button class="btn-secondary" id="btnAbrirWA">💬 Abrir no WhatsApp</button>
          </div>
        </div>
      </div>

      <div class="card">
        <h3>🔮 Sugestões de próximos serviços</h3>
        <p class="hint">A IA analisa o histórico do caminhão e sugere o que provavelmente precisa.</p>
        <div class="form-row">
          <label>Caminhão</label>
          <select id="iaCaminhaoSug"></select>
        </div>
        <button class="btn-primary" id="btnGerarSugestoes">✨ Analisar e sugerir</button>

        <div class="ia-output" id="iaSugOutput" style="display:none;">
          <h4>Sugestões</h4>
          <div id="iaSugList"></div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:20px;">
      <h3>💡 Como funciona a IA deste app</h3>
      <p class="hint" style="line-height:1.7;">
        Este app usa um <b>motor de regras inteligente</b> que analisa o histórico real de cada caminhão
        (serviços feitos, quilometragem, tempo desde última visita, padrões de falha por marca/modelo)
        e gera mensagens e sugestões personalizadas — sem depender de internet ou de uma API externa.
        <br><br>
        Em produção, basta plugar uma API de IA (OpenAI, Gemini, Claude) na função <code>gerarMensagemIA()</code>
        e <code>gerarSugestoesIA()</code> dentro do arquivo <code>app.js</code> que tudo continua funcionando igual,
        mas com mensagens ainda mais naturais.
      </p>
    </div>
  </section>

  <!-- ===== CONFIG ===== -->
  <section class="view" id="view-config">
    <header class="page-header">
      <div>
        <h2>Configurações</h2>
        <p class="subtitle">Dados da oficina e parâmetros</p>
      </div>
    </header>

    <div class="card">
      <h3>Dados da Oficina</h3>
      <div class="form-row">
        <label>Nome da oficina</label>
        <input type="text" id="cfgNome" placeholder="Ex: Auto Elétrica do João">
      </div>
      <div class="form-row">
        <label>Telefone / WhatsApp</label>
        <input type="text" id="cfgFone" placeholder="(11) 99999-9999">
      </div>
      <div class="form-row">
        <label>Endereço</label>
        <input type="text" id="cfgEnd" placeholder="Rua, número, cidade">
      </div>
      <div class="form-row">
        <label>Responsável</label>
        <input type="text" id="cfgResp" placeholder="Nome do dono ou eletricista chefe">
      </div>

      <h3 style="margin-top:30px;">Parâmetros de Lembrete</h3>
      <div class="form-row">
        <label>Lembrete de revisão a cada (meses)</label>
        <input type="number" id="cfgMeses" value="6" min="1" max="24">
      </div>
      <div class="form-row">
        <label>Lembrete por quilometragem (km)</label>
        <input type="number" id="cfgKm" value="30000" min="1000" step="1000">
      </div>

      <button class="btn-primary" id="btnSalvarCfg" style="margin-top:20px;">💾 Salvar configurações</button>
    </div>

    <div class="card" style="margin-top:20px;">
      <h3>⚠️ Zona de perigo</h3>
      <p class="hint">Apaga TODOS os dados do app. Use apenas para testes.</p>
      <button class="btn-danger" id="btnLimpar">🗑️ Apagar todos os dados</button>
    </div>

    <div class="card" style="margin-top:20px;">
      <h3>🎁 Dados de exemplo</h3>
      <p class="hint">Carregar clientes, caminhões e serviços de demonstração para testar o app.</p>
      <button class="btn-secondary" id="btnDemo">✨ Carregar dados de exemplo</button>
    </div>
  </section>

</main>

<!-- ========= MODAL ========= -->
<div class="modal-overlay" id="modal">
  <div class="modal">
    <header class="modal-header">
      <h3 id="modalTitle">Título</h3>
      <button class="modal-close" id="modalClose">✕</button>
    </header>
    <div class="modal-body" id="modalBody"></div>
  </div>
</div>

<!-- ========= TOAST ========= -->
<div class="toast" id="toast"></div>

<script src="app.js"></script>


<div style="
width:100%;
display:flex;
justify-content:center;
padding:20px 0 5px 0;">
<img src="assets/cimentec_transparent.png" style="
width:140px;
object-fit:contain;
opacity:0.95;">
</div>

</body>
</html>
