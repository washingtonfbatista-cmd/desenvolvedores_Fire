/* =========================================================
   CIMENTEC - CRM para Oficina ELÉTRICA
   App completo funcional - vanilla JS + localStorage
   ========================================================= */

// ========= STATE =========
const STATE = {
  clientes:   [],
  caminhoes:  [],
  servicos:   [],
  lembretes:  [],
  config:     {
    nome: '', fone: '', end: '', resp: '',
    meses: 6, km: 30000
  }
};

const STORAGE_KEY = 'oficinaai_v1';

// ========= STORAGE =========
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE));
}
function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const data = JSON.parse(raw);
      Object.assign(STATE, data);
    } catch (e) { console.error('Erro ao carregar:', e); }
  }
}

// ========= UTILS =========
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function brl(v) {
  return (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function fmtDate(d) {
  if (!d) return '-';
  const date = new Date(d);
  return date.toLocaleDateString('pt-BR');
}
function daysBetween(a, b) {
  return Math.floor((new Date(b) - new Date(a)) / (1000*60*60*24));
}
function monthsSince(d) {
  if (!d) return 999;
  return Math.floor(daysBetween(d, new Date()) / 30);
}
function toast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (type === 'error' ? ' error' : '');
  setTimeout(() => t.className = 'toast', 2800);
}
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }

function getCliente(id)  { return STATE.clientes.find(c => c.id === id); }
function getCaminhao(id) { return STATE.caminhoes.find(c => c.id === id); }
function getServicosDoCaminhao(id) {
  return STATE.servicos.filter(s => s.caminhaoId === id)
    .sort((a,b) => new Date(b.data) - new Date(a.data));
}
function ultimoServico(caminhaoId) {
  const list = getServicosDoCaminhao(caminhaoId);
  return list[0] || null;
}

// ========= NAVIGATION =========
function go(view) {
  $$('.view').forEach(v => v.classList.remove('active'));
  $$('.nav-btn').forEach(b => b.classList.remove('active'));
  const target = $('#view-' + view);
  const btn = document.querySelector(`.nav-btn[data-view="${view}"]`);
  if (target) target.classList.add('active');
  if (btn) btn.classList.add('active');
  renderAll();
}

document.querySelectorAll('.nav-btn').forEach(b => {
  b.addEventListener('click', () => go(b.dataset.view));
});
document.querySelectorAll('[data-go]').forEach(el => {
  el.addEventListener('click', () => {
    const [view, action] = el.dataset.go.split('-');
    go(view);
    if (action === 'novo') {
      if (view === 'servicos') openServicoForm();
    }
  });
});

// ========= MODAL =========
function openModal(title, html) {
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = html;
  $('#modal').classList.add('active');
}
function closeModal() { $('#modal').classList.remove('active'); }
$('#modalClose').addEventListener('click', closeModal);
$('#modal').addEventListener('click', (e) => {
  if (e.target.id === 'modal') closeModal();
});

// ========= DASHBOARD =========
function renderDashboard() {
  $('#statClientes').textContent  = STATE.clientes.length;
  $('#statCaminhoes').textContent = STATE.caminhoes.length;

  const now = new Date();
  const month = now.getMonth(), year = now.getFullYear();
  const servMes = STATE.servicos.filter(s => {
    const d = new Date(s.data);
    return d.getMonth() === month && d.getFullYear() === year;
  });
  $('#statServicosMes').textContent = servMes.length;
  const fat = servMes.reduce((a,s) => a + (Number(s.valor) || 0), 0);
  $('#statFatMes').textContent = brl(fat);

  gerarLembretes(true);
  $('#statLembretes').textContent = STATE.lembretes.length;

  const ticket = STATE.servicos.length
    ? STATE.servicos.reduce((a,s) => a + (Number(s.valor) || 0), 0) / STATE.servicos.length
    : 0;
  $('#statTicket').textContent = brl(ticket);

  // Próximos lembretes
  const lembBox = $('#dashLembretes');
  const proxLemb = STATE.lembretes.slice(0, 5);
  if (proxLemb.length === 0) {
    lembBox.innerHTML = '<div class="empty">Sem lembretes pendentes 👍</div>';
  } else {
    lembBox.innerHTML = proxLemb.map(l => {
      const cam = getCaminhao(l.caminhaoId);
      const cli = cam ? getCliente(cam.clienteId) : null;
      return `<div class="list-item ${l.urgencia}">
        <div>
          <div class="title">${l.titulo}</div>
          <div class="meta">${cam ? cam.placa + ' • ' + cam.marca + ' ' + cam.modelo : ''} ${cli ? '• ' + cli.nome : ''}</div>
        </div>
      </div>`;
    }).join('');
  }

  // Últimos serviços
  const servBox = $('#dashServicos');
  const ult = [...STATE.servicos].sort((a,b) => new Date(b.data) - new Date(a.data)).slice(0,5);
  if (ult.length === 0) {
    servBox.innerHTML = '<div class="empty">Nenhum serviço registrado.</div>';
  } else {
    servBox.innerHTML = ult.map(s => {
      const cam = getCaminhao(s.caminhaoId);
      return `<div class="list-item">
        <div>
          <div class="title">${s.descricao || 'Serviço'}</div>
          <div class="meta">${fmtDate(s.data)} • ${cam ? cam.placa : '-'} • ${brl(s.valor)}</div>
        </div>
      </div>`;
    }).join('');
  }
}

// ========= CLIENTES =========
function renderClientes(filter = '') {
  const tbody = $('#tableClientes tbody');
  const empty = $('#emptyClientes');
  const list = STATE.clientes.filter(c =>
    !filter || c.nome.toLowerCase().includes(filter.toLowerCase()) ||
    (c.fone || '').includes(filter)
  );
  if (list.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    $('#tableClientes').style.display = 'none';
    return;
  }
  empty.style.display = 'none';
  $('#tableClientes').style.display = 'table';
  tbody.innerHTML = list.map(c => {
    const cams = STATE.caminhoes.filter(k => k.clienteId === c.id);
    const ultServ = cams.map(k => ultimoServico(k.id)).filter(Boolean)
      .sort((a,b) => new Date(b.data) - new Date(a.data))[0];
    return `<tr>
      <td><strong>${c.nome}</strong></td>
      <td>${c.fone || '-'}</td>
      <td>${c.tipo || 'Pessoa Física'}</td>
      <td>${cams.length}</td>
      <td>${ultServ ? fmtDate(ultServ.data) : '-'}</td>
      <td class="actions">
        <button onclick="editCliente('${c.id}')">✏️ Editar</button>
        <button class="del" onclick="delCliente('${c.id}')">🗑️</button>
      </td>
    </tr>`;
  }).join('');
}

function openClienteForm(cliente = null) {
  const c = cliente || { nome:'', fone:'', tipo:'Pessoa Física', email:'', obs:'' };
  openModal(cliente ? 'Editar Cliente' : 'Novo Cliente', `
    <div class="form-row"><label>Nome / Razão Social *</label>
      <input id="f-nome" value="${c.nome}"></div>
    <div class="form-grid">
      <div class="form-row"><label>Telefone / WhatsApp</label>
        <input id="f-fone" value="${c.fone || ''}" placeholder="(11) 99999-9999"></div>
      <div class="form-row"><label>Tipo</label>
        <select id="f-tipo">
          <option ${c.tipo === 'Pessoa Física' ? 'selected':''}>Pessoa Física</option>
          <option ${c.tipo === 'Frotista' ? 'selected':''}>Frotista</option>
          <option ${c.tipo === 'Transportadora' ? 'selected':''}>Transportadora</option>
          <option ${c.tipo === 'Autônomo' ? 'selected':''}>Autônomo</option>
        </select></div>
    </div>
    <div class="form-row"><label>E-mail</label>
      <input id="f-email" value="${c.email || ''}"></div>
    <div class="form-row"><label>Observações</label>
      <textarea id="f-obs">${c.obs || ''}</textarea></div>
    <button class="btn-primary" id="saveCliente" style="width:100%;margin-top:10px;">💾 Salvar</button>
  `);
  $('#saveCliente').addEventListener('click', () => {
    const nome = $('#f-nome').value.trim();
    if (!nome) return toast('Nome é obrigatório', 'error');
    const obj = {
      id: cliente?.id || uid(),
      nome,
      fone: $('#f-fone').value.trim(),
      tipo: $('#f-tipo').value,
      email: $('#f-email').value.trim(),
      obs: $('#f-obs').value.trim(),
      criado: cliente?.criado || new Date().toISOString()
    };
    if (cliente) {
      const i = STATE.clientes.findIndex(x => x.id === cliente.id);
      STATE.clientes[i] = obj;
    } else {
      STATE.clientes.push(obj);
    }
    save(); closeModal(); renderAll(); toast('Cliente salvo!');
  });
}
window.editCliente = (id) => openClienteForm(getCliente(id));
window.delCliente = (id) => {
  if (!confirm('Excluir este cliente? Os caminhões e serviços vinculados NÃO serão apagados, apenas ficarão sem cliente.')) return;
  STATE.clientes = STATE.clientes.filter(c => c.id !== id);
  STATE.caminhoes.forEach(k => { if (k.clienteId === id) k.clienteId = null; });
  save(); renderAll(); toast('Cliente excluído');
};

// ========= CAMINHÕES =========
function renderCaminhoes(filter = '') {
  const tbody = $('#tableCaminhoes tbody');
  const empty = $('#emptyCaminhoes');
  const list = STATE.caminhoes.filter(k =>
    !filter ||
    (k.placa || '').toLowerCase().includes(filter.toLowerCase()) ||
    (k.marca || '').toLowerCase().includes(filter.toLowerCase()) ||
    (k.modelo || '').toLowerCase().includes(filter.toLowerCase())
  );
  if (list.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    $('#tableCaminhoes').style.display = 'none';
    return;
  }
  empty.style.display = 'none';
  $('#tableCaminhoes').style.display = 'table';
  tbody.innerHTML = list.map(k => {
    const cli = getCliente(k.clienteId);
    const ult = ultimoServico(k.id);
    return `<tr>
      <td><strong>${k.placa}</strong></td>
      <td>${k.marca} ${k.modelo}</td>
      <td>${k.ano || '-'}</td>
      <td>${cli ? cli.nome : '<span style="color:#6e7681">-</span>'}</td>
      <td>${k.km ? Number(k.km).toLocaleString('pt-BR') + ' km' : '-'}</td>
      <td>${ult ? fmtDate(ult.data) : '-'}</td>
      <td class="actions">
        <button onclick="verCaminhao('${k.id}')">👁️ Ver</button>
        <button onclick="editCaminhao('${k.id}')">✏️</button>
        <button class="del" onclick="delCaminhao('${k.id}')">🗑️</button>
      </td>
    </tr>`;
  }).join('');
}

function openCaminhaoForm(caminhao = null) {
  const k = caminhao || { placa:'', marca:'Scania', modelo:'', ano:'', km:0, clienteId:'', voltagem:'24V', obs:'' };
  const clienteOpts = STATE.clientes.map(c =>
    `<option value="${c.id}" ${c.id === k.clienteId ? 'selected':''}>${c.nome}</option>`
  ).join('');
  openModal(caminhao ? 'Editar Caminhão' : 'Novo Caminhão', `
    <div class="form-grid">
      <div class="form-row"><label>Placa *</label>
        <input id="f-placa" value="${k.placa}" style="text-transform:uppercase"></div>
      <div class="form-row"><label>Ano</label>
        <input id="f-ano" type="number" value="${k.ano || ''}" placeholder="2018"></div>
    </div>
    <div class="form-grid">
      <div class="form-row"><label>Marca</label>
        <select id="f-marca">
          ${['Scania','Volvo','Mercedes-Benz','Iveco','Volkswagen','DAF','MAN','Ford','International']
            .map(m => `<option ${m === k.marca ? 'selected':''}>${m}</option>`).join('')}
        </select></div>
      <div class="form-row"><label>Modelo</label>
        <input id="f-modelo" value="${k.modelo}" placeholder="R450, FH540, Actros..."></div>
    </div>
    <div class="form-grid">
      <div class="form-row"><label>Quilometragem atual</label>
        <input id="f-km" type="number" value="${k.km || 0}"></div>
      <div class="form-row"><label>Sistema elétrico</label>
        <select id="f-volt">
          <option ${k.voltagem === '12V' ? 'selected':''}>12V</option>
          <option ${k.voltagem === '24V' ? 'selected':''}>24V</option>
        </select></div>
    </div>
    <div class="form-row"><label>Cliente</label>
      <select id="f-cliente">
        <option value="">-- selecione --</option>
        ${clienteOpts}
      </select></div>
    <div class="form-row"><label>Observações</label>
      <textarea id="f-obs">${k.obs || ''}</textarea></div>
    <button class="btn-primary" id="saveCaminhao" style="width:100%;margin-top:10px;">💾 Salvar</button>
  `);
  $('#saveCaminhao').addEventListener('click', () => {
    const placa = $('#f-placa').value.trim().toUpperCase();
    if (!placa) return toast('Placa é obrigatória', 'error');
    const obj = {
      id: caminhao?.id || uid(),
      placa,
      marca: $('#f-marca').value,
      modelo: $('#f-modelo').value.trim(),
      ano: $('#f-ano').value,
      km: Number($('#f-km').value) || 0,
      clienteId: $('#f-cliente').value || null,
      voltagem: $('#f-volt').value,
      obs: $('#f-obs').value.trim(),
      criado: caminhao?.criado || new Date().toISOString()
    };
    if (caminhao) {
      const i = STATE.caminhoes.findIndex(x => x.id === caminhao.id);
      STATE.caminhoes[i] = obj;
    } else {
      STATE.caminhoes.push(obj);
    }
    save(); closeModal(); renderAll(); toast('Caminhão salvo!');
  });
}
window.editCaminhao = (id) => openCaminhaoForm(getCaminhao(id));
window.delCaminhao = (id) => {
  if (!confirm('Excluir este caminhão e TODOS os seus serviços? Esta ação não pode ser desfeita.')) return;
  STATE.caminhoes = STATE.caminhoes.filter(k => k.id !== id);
  STATE.servicos  = STATE.servicos.filter(s => s.caminhaoId !== id);
  save(); renderAll(); toast('Caminhão excluído');
};
window.verCaminhao = (id) => {
  const k = getCaminhao(id);
  const cli = getCliente(k.clienteId);
  const servs = getServicosDoCaminhao(id);
  const sugs = gerarSugestoesIA(id);
  const sugHTML = sugs.length ? sugs.map(s => `
    <div class="suggestion">
      <div class="s-title">${s.titulo}</div>
      <div class="s-reason">${s.motivo}</div>
      <span class="s-priority priority-${s.prioridade}">${s.prioridade.toUpperCase()}</span>
    </div>`).join('') : '<p class="hint">Sem sugestões no momento. Cadastre mais serviços.</p>';

  const servHTML = servs.length ? servs.map(s => `
    <div class="list-item">
      <div>
        <div class="title">${s.descricao}</div>
        <div class="meta">${fmtDate(s.data)} • ${s.km ? Number(s.km).toLocaleString('pt-BR')+' km' : 'sem KM'} • ${brl(s.valor)}</div>
      </div>
    </div>`).join('') : '<p class="hint">Nenhum serviço registrado.</p>';

  openModal(`🚛 ${k.placa} - ${k.marca} ${k.modelo}`, `
    <div style="margin-bottom:20px;">
      <p><strong>Cliente:</strong> ${cli ? cli.nome : '-'}</p>
      <p><strong>Ano:</strong> ${k.ano || '-'} • <strong>KM:</strong> ${Number(k.km).toLocaleString('pt-BR')} • <strong>Sistema:</strong> ${k.voltagem}</p>
      ${k.obs ? `<p style="margin-top:6px;color:#8b949e">${k.obs}</p>` : ''}
    </div>
    <h4 style="color:#fdb022;margin-bottom:10px;">🔮 Sugestões da IA</h4>
    ${sugHTML}
    <h4 style="color:#fdb022;margin:20px 0 10px;">📋 Histórico de serviços (${servs.length})</h4>
    <div class="list-compact">${servHTML}</div>
  `);
};

// ========= SERVIÇOS =========
function renderServicos(filter = '') {
  const tbody = $('#tableServicos tbody');
  const empty = $('#emptyServicos');
  const list = [...STATE.servicos]
    .sort((a,b) => new Date(b.data) - new Date(a.data))
    .filter(s => {
      if (!filter) return true;
      const cam = getCaminhao(s.caminhaoId);
      const cli = cam ? getCliente(cam.clienteId) : null;
      const f = filter.toLowerCase();
      return (s.descricao || '').toLowerCase().includes(f) ||
             (cam?.placa || '').toLowerCase().includes(f) ||
             (cli?.nome || '').toLowerCase().includes(f);
    });
  if (list.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    $('#tableServicos').style.display = 'none';
    return;
  }
  empty.style.display = 'none';
  $('#tableServicos').style.display = 'table';
  tbody.innerHTML = list.map(s => {
    const cam = getCaminhao(s.caminhaoId);
    const cli = cam ? getCliente(cam.clienteId) : null;
    return `<tr>
      <td>${fmtDate(s.data)}</td>
      <td><strong>${cam?.placa || '-'}</strong> <span style="color:#8b949e;font-size:12px">${cam ? cam.marca + ' ' + cam.modelo : ''}</span></td>
      <td>${cli ? cli.nome : '-'}</td>
      <td>${s.descricao}</td>
      <td>${s.km ? Number(s.km).toLocaleString('pt-BR') : '-'}</td>
      <td><strong>${brl(s.valor)}</strong></td>
      <td class="actions">
        <button onclick="editServico('${s.id}')">✏️</button>
        <button class="del" onclick="delServico('${s.id}')">🗑️</button>
      </td>
    </tr>`;
  }).join('');
}

function openServicoForm(servico = null) {
  if (STATE.caminhoes.length === 0) {
    toast('Cadastre um caminhão primeiro!', 'error');
    return;
  }
  const s = servico || {
    caminhaoId: STATE.caminhoes[0]?.id,
    data: new Date().toISOString().slice(0,10),
    km: 0, descricao:'', detalhes:'', valor:0, categoria:'Diagnóstico'
  };
  const camOpts = STATE.caminhoes.map(k => {
    const cli = getCliente(k.clienteId);
    return `<option value="${k.id}" ${k.id === s.caminhaoId ? 'selected':''}>
      ${k.placa} - ${k.marca} ${k.modelo} ${cli ? '('+cli.nome+')' : ''}
    </option>`;
  }).join('');
  const cats = ['Diagnóstico','Bateria','Alternador','Motor de partida','Chicote/Fiação','Painel','Iluminação','Tacógrafo','ABS/Freios elétricos','Ar condicionado','ECU/Módulos','Sensor','Revisão geral','Outros'];
  openModal(servico ? 'Editar Serviço' : 'Nova Ordem de Serviço', `
    <div class="form-row"><label>Caminhão *</label>
      <select id="f-cam">${camOpts}</select></div>
    <div class="form-grid">
      <div class="form-row"><label>Data *</label>
        <input id="f-data" type="date" value="${s.data}"></div>
      <div class="form-row"><label>KM no atendimento</label>
        <input id="f-km" type="number" value="${s.km || 0}"></div>
    </div>
    <div class="form-row"><label>Categoria</label>
      <select id="f-cat">
        ${cats.map(c => `<option ${c === s.categoria ? 'selected':''}>${c}</option>`).join('')}
      </select></div>
    <div class="form-row"><label>Descrição resumida *</label>
      <input id="f-desc" value="${s.descricao}" placeholder="Ex: Troca de alternador 24V"></div>
    <div class="form-row"><label>Detalhes técnicos</label>
      <textarea id="f-det" placeholder="Sintoma, peças, mão de obra, testes feitos...">${s.detalhes || ''}</textarea></div>
    <div class="form-row"><label>Valor total (R$)</label>
      <input id="f-valor" type="number" step="0.01" value="${s.valor || 0}"></div>
    <button class="btn-primary" id="saveServico" style="width:100%;margin-top:10px;">💾 Salvar OS</button>
  `);
  $('#saveServico').addEventListener('click', () => {
    const desc = $('#f-desc').value.trim();
    if (!desc) return toast('Descrição é obrigatória', 'error');
    const obj = {
      id: servico?.id || uid(),
      caminhaoId: $('#f-cam').value,
      data: $('#f-data').value,
      km: Number($('#f-km').value) || 0,
      descricao: desc,
      detalhes: $('#f-det').value.trim(),
      valor: Number($('#f-valor').value) || 0,
      categoria: $('#f-cat').value,
      criado: servico?.criado || new Date().toISOString()
    };
    if (servico) {
      const i = STATE.servicos.findIndex(x => x.id === servico.id);
      STATE.servicos[i] = obj;
    } else {
      STATE.servicos.push(obj);
    }
    // atualizar km do caminhão se for maior
    const cam = getCaminhao(obj.caminhaoId);
    if (cam && obj.km > (cam.km || 0)) cam.km = obj.km;
    save(); closeModal(); renderAll(); toast('Serviço registrado!');
  });
}
window.editServico = (id) => openServicoForm(STATE.servicos.find(s => s.id === id));
window.delServico = (id) => {
  if (!confirm('Excluir este serviço?')) return;
  STATE.servicos = STATE.servicos.filter(s => s.id !== id);
  save(); renderAll(); toast('Serviço excluído');
};

// ========= LEMBRETES (motor inteligente) =========
function gerarLembretes(silent = false) {
  const lembretes = [];
  const cfg = STATE.config;

  STATE.caminhoes.forEach(cam => {
    const ult = ultimoServico(cam.id);
    if (!ult) return;
    const meses = monthsSince(ult.data);
    const kmDesde = (cam.km || 0) - (ult.km || 0);

    // Revisão por tempo
    if (meses >= cfg.meses) {
      lembretes.push({
        id: 'rev-tempo-' + cam.id,
        caminhaoId: cam.id,
        titulo: `Revisão elétrica vencida (${meses} meses sem visita)`,
        motivo: `Última visita há ${meses} meses. Recomendado revisão a cada ${cfg.meses} meses.`,
        urgencia: meses >= cfg.meses * 1.5 ? 'urgent' : 'normal',
        tipo: 'revisao'
      });
    }

    // Revisão por KM
    if (kmDesde >= cfg.km) {
      lembretes.push({
        id: 'rev-km-' + cam.id,
        caminhaoId: cam.id,
        titulo: `Revisão por quilometragem (${Number(kmDesde).toLocaleString('pt-BR')} km desde última visita)`,
        motivo: `Recomendado revisão a cada ${Number(cfg.km).toLocaleString('pt-BR')} km.`,
        urgencia: 'normal',
        tipo: 'km'
      });
    }
  });

  // Ordenar urgentes primeiro
  lembretes.sort((a,b) => (a.urgencia === 'urgent' ? -1 : 1));
  STATE.lembretes = lembretes;
  save();
  if (!silent) {
    renderLembretes();
    toast(`${lembretes.length} lembrete(s) gerados`);
  }
}

function renderLembretes() {
  const box = $('#listLembretes');
  const empty = $('#emptyLembretes');
  if (STATE.lembretes.length === 0) {
    box.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  box.innerHTML = STATE.lembretes.map(l => {
    const cam = getCaminhao(l.caminhaoId);
    const cli = cam ? getCliente(cam.clienteId) : null;
    return `<div class="list-item ${l.urgencia === 'urgent' ? 'urgent' : ''}">
      <div>
        <div class="title">${l.titulo}</div>
        <div class="meta">${cam ? cam.placa + ' • ' + cam.marca + ' ' + cam.modelo : ''} ${cli ? '• ' + cli.nome : ''}</div>
        <div class="meta" style="margin-top:4px;">${l.motivo}</div>
      </div>
      <div class="item-actions">
        ${cli && cli.fone ? `<button class="btn-secondary" onclick="lembreteWhats('${l.caminhaoId}')">💬 WhatsApp</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

window.lembreteWhats = (caminhaoId) => {
  const cam = getCaminhao(caminhaoId);
  const cli = getCliente(cam.clienteId);
  if (!cli || !cli.fone) return toast('Cliente sem telefone', 'error');
  const msg = gerarMensagemIA(caminhaoId, 'retorno', 'amigavel');
  const fone = cli.fone.replace(/\D/g,'');
  const url = `https://wa.me/55${fone}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
};

// ========= IA: GERADOR DE MENSAGENS =========
// Motor inteligente baseado em regras + contexto
function gerarMensagemIA(caminhaoId, tipo, tom) {
  const cam = getCaminhao(caminhaoId);
  if (!cam) return '';
  const cli = getCliente(cam.clienteId);
  const cfg = STATE.config;
  const ult = ultimoServico(caminhaoId);
  const meses = ult ? monthsSince(ult.data) : 0;
  const nomeOfi = cfg.nome || 'nossa oficina elétrica';
  const respOfi = cfg.resp || '';
  const primeiroNome = cli ? cli.nome.split(' ')[0] : 'amigo(a)';

  // Saudações por tom
  const saudacoes = {
    amigavel:     [`Opa, ${primeiroNome}! Tudo bem?`, `Fala, ${primeiroNome}! Como vai?`, `E aí, ${primeiroNome}, beleza?`],
    profissional: [`Olá ${primeiroNome}, tudo bem?`, `Prezado(a) ${primeiroNome}, boa tarde!`, `Olá ${primeiroNome}, espero que esteja bem.`],
    direto:       [`Oi ${primeiroNome},`, `${primeiroNome},`, `Olá ${primeiroNome}!`]
  };
  const fechamentos = {
    amigavel:     [`Qualquer dúvida me chama aqui! 🚛⚡`, `Forte abraço!`, `Tô à disposição!`],
    profissional: [`Fico à disposição.`, `Aguardo seu retorno.`, `Atenciosamente.`],
    direto:       [`Aguardo retorno.`, `Abraço.`, `Valeu!`]
  };
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  let corpo = '';
  const veiculo = `${cam.marca} ${cam.modelo} placa ${cam.placa}`;

  if (tipo === 'retorno') {
    if (meses >= 6) {
      corpo = `Passando pra avisar que já se passaram ${meses} meses desde a última revisão elétrica do seu ${veiculo}. ` +
              `A gente recomenda dar uma olhada na bateria, alternador e conexões pra evitar problema na estrada. ` +
              `Quer agendar uma revisão preventiva? Posso encaixar essa semana.`;
    } else {
      corpo = `Tô passando pra ver como tá o seu ${veiculo} depois do nosso último atendimento. ` +
              `Tudo funcionando direitinho? Se precisar de qualquer coisa, é só chamar.`;
    }
  }
  else if (tipo === 'orcamento') {
    corpo = `Te passei aquele orçamento do serviço elétrico do ${veiculo} e quero saber se você teve chance de olhar. ` +
            `Se tiver dúvida sobre alguma peça ou prazo, é só me chamar que explico melhor. ` +
            `Posso já reservar a agenda pra você?`;
  }
  else if (tipo === 'agradecimento') {
    const desc = ult ? ult.descricao : 'serviço elétrico';
    corpo = `Quero agradecer pela confiança no atendimento do seu ${veiculo} — ${desc.toLowerCase()}. ` +
            `Espero que esteja tudo rodando redondo! Se notar qualquer sintoma estranho, me chama na mesma hora que a gente resolve. ` +
            `Ah, e se puder indicar a oficina pra um amigo caminhoneiro, ajuda muito! 🙏`;
  }
  else if (tipo === 'preventiva') {
    const kmAtual = Number(cam.km).toLocaleString('pt-BR');
    corpo = `Dei uma olhada aqui no histórico do seu ${veiculo} (${kmAtual} km) e tem alguns pontos que vale a pena conferir agora ` +
            `pra evitar dor de cabeça depois: bateria, terminais, correia do alternador e os fusíveis principais. ` +
            `Se quiser, eu já encaixo na agenda pra fazer um check-up rapidinho. Quanto antes, melhor.`;
  }
  else if (tipo === 'aniversario') {
    corpo = `Hoje é dia especial e a equipe da ${nomeOfi} quer te desejar um feliz aniversário! 🎉 ` +
            `Que esse ano novo venha cheio de estrada boa, freio funcionando e farol aceso. Conte sempre com a gente!`;
  }

  const msg = `${pick(saudacoes[tom])}\n\n${corpo}\n\n${pick(fechamentos[tom])}${respOfi ? '\n— ' + respOfi : ''}${cfg.nome ? '\n' + cfg.nome : ''}`;
  return msg;
}

// ========= IA: SUGESTÕES DE PRÓXIMOS SERVIÇOS =========
function gerarSugestoesIA(caminhaoId) {
  const cam = getCaminhao(caminhaoId);
  if (!cam) return [];
  const servs = getServicosDoCaminhao(caminhaoId);
  const sugestoes = [];
  const hoje = new Date();
  const cfg = STATE.config;

  // Mapeamento de categoria -> intervalo recomendado (meses)
  const intervalos = {
    'Bateria':     { meses: 18, km: 80000, label: 'Verificar bateria e carga' },
    'Alternador':  { meses: 24, km: 100000, label: 'Inspeção do alternador e regulador' },
    'Motor de partida': { meses: 30, km: 120000, label: 'Verificar motor de partida' },
    'Chicote/Fiação':  { meses: 12, km: 60000, label: 'Inspeção de chicote e conexões' },
    'Revisão geral':   { meses: 6, km: 30000, label: 'Revisão elétrica geral' }
  };

  // 1. Análise por última visita
  const ult = servs[0];
  if (!ult) {
    sugestoes.push({
      titulo: 'Check-up elétrico inicial',
      motivo: 'Primeiro atendimento — recomenda-se uma inspeção completa para mapear o estado elétrico.',
      prioridade: 'media'
    });
    return sugestoes;
  }

  const mesesUlt = monthsSince(ult.data);
  if (mesesUlt >= cfg.meses) {
    sugestoes.push({
      titulo: 'Revisão preventiva geral',
      motivo: `Última visita foi há ${mesesUlt} meses. Inspeção de bateria, alternador, terminais e fusíveis recomendada.`,
      prioridade: mesesUlt >= 9 ? 'alta' : 'media'
    });
  }

  // 2. Análise por categoria
  Object.entries(intervalos).forEach(([cat, regra]) => {
    const ultDoTipo = servs.find(s => s.categoria === cat);
    if (ultDoTipo) {
      const m = monthsSince(ultDoTipo.data);
      if (m >= regra.meses) {
        sugestoes.push({
          titulo: regra.label,
          motivo: `Última intervenção em "${cat}" foi há ${m} meses (recomendado a cada ${regra.meses}).`,
          prioridade: m >= regra.meses * 1.3 ? 'alta' : 'media'
        });
      }
    }
  });

  // 3. KM rodado desde a última
  const kmDesde = (cam.km || 0) - (ult.km || 0);
  if (kmDesde >= cfg.km) {
    sugestoes.push({
      titulo: 'Revisão por quilometragem',
      motivo: `${Number(kmDesde).toLocaleString('pt-BR')} km rodados desde a última visita. Cabos, bateria e alternador sofrem desgaste.`,
      prioridade: kmDesde >= cfg.km * 1.5 ? 'alta' : 'media'
    });
  }

  // 4. Padrões por idade do veículo
  const idade = cam.ano ? (new Date().getFullYear() - Number(cam.ano)) : 0;
  if (idade >= 8) {
    sugestoes.push({
      titulo: 'Inspeção de chicote e isolamento',
      motivo: `Veículo com ${idade} anos. Chicotes antigos costumam ter ressecamento e perda de isolamento.`,
      prioridade: 'media'
    });
  }
  if (idade >= 10) {
    sugestoes.push({
      titulo: 'Avaliar substituição da bateria',
      motivo: `Em veículos acima de ${idade} anos, vale verificar capacidade e densidade da bateria, especialmente no inverno.`,
      prioridade: 'baixa'
    });
  }

  // 5. Padrões por marca (conhecimento de mercado simplificado)
  const padroesMarca = {
    'Scania':   { item: 'sensor de rotação e ECU', motivo: 'Scania mais novas têm histórico de falhas em sensores de rotação e nos módulos CAN.' },
    'Volvo':    { item: 'chicote da cabine basculante', motivo: 'Em Volvos, o chicote que passa pela articulação da cabine costuma romper com o tempo.' },
    'Mercedes-Benz': { item: 'módulo PSM e fusíveis principais', motivo: 'MB tem histórico de problemas no módulo PSM e oxidação no porta-fusíveis.' },
    'Iveco':    { item: 'massas e aterramentos', motivo: 'Iveco apresenta com frequência problemas de aterramento que geram sintomas elétricos diversos.' },
    'Volkswagen': { item: 'painel e iluminação', motivo: 'VWs costumam dar problema em conectores do painel e fiação de farol.' }
  };
  if (idade >= 5 && padroesMarca[cam.marca]) {
    const p = padroesMarca[cam.marca];
    if (!sugestoes.some(s => s.titulo.toLowerCase().includes(p.item.split(' ')[0]))) {
      sugestoes.push({
        titulo: `Verificar ${p.item} (${cam.marca})`,
        motivo: p.motivo,
        prioridade: 'baixa'
      });
    }
  }

  // Remover duplicatas e ordenar
  const ordemPrio = { alta: 0, media: 1, baixa: 2 };
  sugestoes.sort((a,b) => ordemPrio[a.prioridade] - ordemPrio[b.prioridade]);
  return sugestoes.slice(0, 6);
}

// ========= IA UI =========
function renderIAView() {
  const opts = STATE.caminhoes.map(k => {
    const cli = getCliente(k.clienteId);
    return `<option value="${k.id}">${k.placa} - ${k.marca} ${k.modelo} ${cli ? '('+cli.nome+')' : ''}</option>`;
  }).join('');
  $('#iaCaminhao').innerHTML = opts || '<option>Cadastre um caminhão primeiro</option>';
  $('#iaCaminhaoSug').innerHTML = opts || '<option>Cadastre um caminhão primeiro</option>';
}

$('#btnGerarMensagem').addEventListener('click', () => {
  const id = $('#iaCaminhao').value;
  const tipo = $('#iaTipo').value;
  const tom = $('#iaTom').value;
  if (!id) return toast('Selecione um caminhão', 'error');
  const msg = gerarMensagemIA(id, tipo, tom);
  $('#iaTexto').value = msg;
  $('#iaOutput').style.display = 'block';
});

$('#btnCopiar').addEventListener('click', () => {
  navigator.clipboard.writeText($('#iaTexto').value);
  toast('Mensagem copiada!');
});

$('#btnAbrirWA').addEventListener('click', () => {
  const id = $('#iaCaminhao').value;
  const cam = getCaminhao(id);
  const cli = getCliente(cam?.clienteId);
  if (!cli || !cli.fone) return toast('Cliente sem telefone cadastrado', 'error');
  const fone = cli.fone.replace(/\D/g,'');
  const url = `https://wa.me/55${fone}?text=${encodeURIComponent($('#iaTexto').value)}`;
  window.open(url, '_blank');
});

$('#btnGerarSugestoes').addEventListener('click', () => {
  const id = $('#iaCaminhaoSug').value;
  if (!id) return toast('Selecione um caminhão', 'error');
  const sugs = gerarSugestoesIA(id);
  const box = $('#iaSugList');
  if (sugs.length === 0) {
    box.innerHTML = '<p class="hint">Sem sugestões no momento.</p>';
  } else {
    box.innerHTML = sugs.map(s => `
      <div class="suggestion">
        <div class="s-title">${s.titulo}</div>
        <div class="s-reason">${s.motivo}</div>
        <span class="s-priority priority-${s.prioridade}">${s.prioridade.toUpperCase()}</span>
      </div>`).join('');
  }
  $('#iaSugOutput').style.display = 'block';
});

// ========= CONFIG =========
function renderConfig() {
  $('#cfgNome').value = STATE.config.nome || '';
  $('#cfgFone').value = STATE.config.fone || '';
  $('#cfgEnd').value  = STATE.config.end  || '';
  $('#cfgResp').value = STATE.config.resp || '';
  $('#cfgMeses').value = STATE.config.meses || 6;
  $('#cfgKm').value    = STATE.config.km    || 30000;
}
$('#btnSalvarCfg').addEventListener('click', () => {
  STATE.config = {
    nome: $('#cfgNome').value.trim(),
    fone: $('#cfgFone').value.trim(),
    end:  $('#cfgEnd').value.trim(),
    resp: $('#cfgResp').value.trim(),
    meses: Number($('#cfgMeses').value) || 6,
    km:    Number($('#cfgKm').value)    || 30000
  };
  save(); toast('Configurações salvas!');
});

$('#btnLimpar').addEventListener('click', () => {
  if (!confirm('APAGAR TODOS OS DADOS? Esta ação não pode ser desfeita.')) return;
  localStorage.removeItem(STORAGE_KEY);
  Object.assign(STATE, { clientes:[], caminhoes:[], servicos:[], lembretes:[], config:{ meses:6, km:30000 } });
  renderAll(); toast('Tudo apagado.');
});

$('#btnDemo').addEventListener('click', () => {
  carregarDemo();
});

// ========= EXPORT / IMPORT =========
$('#btnExport').addEventListener('click', () => {
  const data = JSON.stringify(STATE, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `oficinaai-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Backup baixado!');
});
$('#btnImport').addEventListener('click', () => $('#fileImport').click());
$('#fileImport').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      Object.assign(STATE, data);
      save(); renderAll(); toast('Dados importados!');
    } catch { toast('Arquivo inválido', 'error'); }
  };
  reader.readAsText(file);
});

// ========= EVENTOS =========
$('#btnNovoCliente').addEventListener('click', () => openClienteForm());
$('#btnNovoCaminhao').addEventListener('click', () => openCaminhaoForm());
$('#btnNovoServico').addEventListener('click', () => openServicoForm());
$('#btnGerarLembretes').addEventListener('click', () => gerarLembretes(false));

$('#searchCliente').addEventListener('input', e => renderClientes(e.target.value));
$('#searchCaminhao').addEventListener('input', e => renderCaminhoes(e.target.value));
$('#searchServico').addEventListener('input', e => renderServicos(e.target.value));

// ========= DADOS DEMO =========
function carregarDemo() {
  if (STATE.clientes.length > 0 && !confirm('Já existem dados. Adicionar dados demo mesmo assim?')) return;

  const c1 = { id: uid(), nome: 'João Silva Transportes', fone: '11987654321', tipo: 'Transportadora', email: 'joao@jstransp.com.br', obs: 'Cliente fiel há 5 anos', criado: new Date().toISOString() };
  const c2 = { id: uid(), nome: 'Carlos Motorista', fone: '11912345678', tipo: 'Autônomo', email: '', obs: '', criado: new Date().toISOString() };
  const c3 = { id: uid(), nome: 'Frota Norte Logística', fone: '11955554444', tipo: 'Frotista', email: 'manutencao@frotanorte.com', obs: '12 caminhões na frota', criado: new Date().toISOString() };
  STATE.clientes.push(c1, c2, c3);

  const k1 = { id: uid(), placa: 'ABC1D23', marca: 'Scania', modelo: 'R450', ano: 2018, km: 480000, clienteId: c1.id, voltagem: '24V', obs: '', criado: new Date().toISOString() };
  const k2 = { id: uid(), placa: 'XYZ4E56', marca: 'Volvo', modelo: 'FH540', ano: 2020, km: 320000, clienteId: c1.id, voltagem: '24V', obs: 'Cabine basculante já reparada', criado: new Date().toISOString() };
  const k3 = { id: uid(), placa: 'BRA2K19', marca: 'Mercedes-Benz', modelo: 'Actros 2651', ano: 2016, km: 620000, clienteId: c2.id, voltagem: '24V', obs: '', criado: new Date().toISOString() };
  const k4 = { id: uid(), placa: 'GHI7K88', marca: 'Iveco', modelo: 'Stralis 600', ano: 2014, km: 780000, clienteId: c3.id, voltagem: '24V', obs: 'Massas com histórico de oxidação', criado: new Date().toISOString() };
  STATE.caminhoes.push(k1, k2, k3, k4);

  const hoje = new Date();
  const diasAtras = (d) => new Date(hoje.getTime() - d*86400000).toISOString().slice(0,10);

  STATE.servicos.push(
    { id: uid(), caminhaoId: k1.id, data: diasAtras(220), km: 460000, categoria: 'Alternador', descricao: 'Troca de alternador 24V e regulador', detalhes: 'Alternador queimado, regulador externo substituído', valor: 1850, criado: new Date().toISOString() },
    { id: uid(), caminhaoId: k1.id, data: diasAtras(45), km: 478000, categoria: 'Bateria', descricao: 'Troca de baterias 24V (par)', detalhes: 'Baterias 150Ah Moura, terminais limpos', valor: 2400, criado: new Date().toISOString() },
    { id: uid(), caminhaoId: k2.id, data: diasAtras(180), km: 305000, categoria: 'Chicote/Fiação', descricao: 'Reparo chicote da cabine', detalhes: 'Rompimento no flexível, emendas refeitas', valor: 950, criado: new Date().toISOString() },
    { id: uid(), caminhaoId: k3.id, data: diasAtras(280), km: 600000, categoria: 'Motor de partida', descricao: 'Recondicionamento motor de partida', detalhes: 'Carvões e bendix trocados', valor: 1200, criado: new Date().toISOString() },
    { id: uid(), caminhaoId: k3.id, data: diasAtras(95), km: 615000, categoria: 'Diagnóstico', descricao: 'Diagnóstico falha intermitente painel', detalhes: 'Identificado mau contato no plug X14', valor: 350, criado: new Date().toISOString() },
    { id: uid(), caminhaoId: k4.id, data: diasAtras(400), km: 760000, categoria: 'Revisão geral', descricao: 'Revisão elétrica completa', detalhes: 'Limpeza geral, aperto de terminais, troca de fusíveis principais', valor: 780, criado: new Date().toISOString() }
  );

  STATE.config = {
    nome: 'Auto Elétrica do Zé',
    fone: '(11) 99999-0000',
    end: 'Av. dos Caminhoneiros, 1234 - São Paulo',
    resp: 'José',
    meses: 6,
    km: 30000
  };

  save(); renderAll(); toast('Dados demo carregados! 🎉');
}

// ========= RENDER ALL =========
function renderAll() {
  renderDashboard();
  renderClientes($('#searchCliente')?.value || '');
  renderCaminhoes($('#searchCaminhao')?.value || '');
  renderServicos($('#searchServico')?.value || '');
  renderLembretes();
  renderIAView();
  renderConfig();
}

// ========= INIT =========
load();
renderAll();

// Primeira vez? Pergunta se quer carregar demo
if (STATE.clientes.length === 0 && STATE.caminhoes.length === 0) {
  setTimeout(() => {
    if (confirm('👋 Bem-vindo ao CIMENTEC!\n\nQuer carregar dados de exemplo para explorar o app?\n\n(Você pode apagar a qualquer momento nas Configurações)')) {
      carregarDemo();
    }
  }, 500);
}
