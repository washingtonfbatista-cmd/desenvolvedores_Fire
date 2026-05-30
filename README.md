# ⚡ OficinaAI — CRM com IA para Oficina Elétrica de Caminhão

App **web completo e funcional** para gestão de oficina elétrica especializada em caminhões pesados (Scania, Volvo, Mercedes-Benz, Iveco, Volkswagen, DAF, MAN, etc.).

## 🚀 Como usar

1. Abra o arquivo **`index.html`** no navegador (Chrome, Edge, Firefox, Safari)
2. Pronto! O app já está rodando.
3. Aceite carregar os **dados de exemplo** para explorar todas as funções rapidamente.

Não precisa de servidor, instalação ou internet. Tudo roda 100% no navegador.

## 📦 O que o app faz

### ✅ Cadastro completo
- **Clientes** (motoristas autônomos, frotistas, transportadoras)
- **Caminhões** (com placa, marca, modelo, ano, KM, sistema 12V/24V)
- **Serviços / Ordens de Serviço** com histórico completo

### ✅ Dashboard inteligente
- Total de clientes, caminhões e serviços
- Faturamento do mês
- Ticket médio
- Lembretes pendentes
- Últimos atendimentos

### ✅ Lembretes automáticos
- Gera lembretes de revisão por **tempo** (configurável — padrão 6 meses)
- Gera lembretes de revisão por **quilometragem** (padrão 30.000 km)
- Marca urgência (normal / urgente) baseado em quanto passou do prazo

### ✅ 🤖 Assistente IA (motor de regras inteligente)

#### Geração de mensagens personalizadas
Cria mensagens prontas para WhatsApp em 5 tipos:
- **Retorno de revisão** (varia conforme tempo desde última visita)
- **Follow-up de orçamento**
- **Agradecimento pós-serviço**
- **Manutenção preventiva**
- **Aniversário do cliente**

Em 3 tons diferentes: amigável, profissional, direto.

> 💬 Botão **"Abrir no WhatsApp"** abre a conversa direto com a mensagem pronta!

#### Sugestões de próximos serviços
A IA analisa o histórico de cada caminhão e sugere:
- O que precisa baseado em **categoria de serviço anterior** (bateria, alternador, chicote...)
- Recomendações por **idade do veículo**
- **Padrões conhecidos por marca**:
  - Scania → sensor de rotação e ECU
  - Volvo → chicote da cabine basculante
  - Mercedes-Benz → módulo PSM e fusíveis
  - Iveco → massas e aterramentos
  - VW → painel e iluminação
- Prioridades (alta / média / baixa)

### ✅ Backup e portabilidade
- **Exportar** todos os dados em JSON
- **Importar** backup
- Tudo salvo no navegador (localStorage)

## 🧠 Como funciona a IA

O app usa um **motor de regras inteligente** que analisa:
- Histórico real de cada caminhão
- Tempo desde última visita
- Quilometragem rodada
- Categoria dos serviços já feitos
- Idade do veículo
- Padrões conhecidos por marca

E gera mensagens **personalizadas e contextuais** sem depender de API externa.

### 🔌 Plugar uma IA real (opcional)

Se quiser usar OpenAI / Gemini / Claude, é só substituir o conteúdo das funções `gerarMensagemIA()` e `gerarSugestoesIA()` no arquivo `app.js` por uma chamada à API. A estrutura do app já está pronta pra receber.

Exemplo:
```javascript
async function gerarMensagemIA(caminhaoId, tipo, tom) {
  const cam = getCaminhao(caminhaoId);
  const cli = getCliente(cam.clienteId);
  const historico = getServicosDoCaminhao(caminhaoId);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer SUA_API_KEY', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: `Gere uma mensagem de ${tipo} em tom ${tom} para o cliente ${cli.nome},
                  dono do ${cam.marca} ${cam.modelo} placa ${cam.placa}.
                  Histórico: ${JSON.stringify(historico)}`
      }]
    })
  });
  const data = await response.json();
  return data.choices[0].message.content;
}
```

## 🏗️ Arquitetura

```
oficina-eletrica-crm/
├── index.html    ← Estrutura e telas
├── style.css     ← Design escuro profissional
├── app.js        ← Toda a lógica + IA
└── README.md     ← Este arquivo
```

- **Vanilla JavaScript** (sem frameworks, sem dependências)
- **localStorage** como banco de dados
- **Responsivo** (desktop + mobile)
- **Funciona offline**

## 💰 Como monetizar este app

Este código é uma base sólida para um SaaS real. Para virar produto:

1. **Adicionar autenticação** (Firebase Auth, Supabase, Auth0)
2. **Migrar localStorage para Firestore/Supabase** (multi-dispositivo)
3. **Plugar IA real** (OpenAI/Gemini/Claude)
4. **Gateway de pagamento** (Stripe, Asaas, Mercado Pago)
5. **Planos sugeridos:**
   - Free: até 5 caminhões
   - Pro: R$ 49/mês — ilimitado
   - Frotista: R$ 149/mês — múltiplos usuários + relatórios
   - White label para fabricantes de peças: R$ 999/mês

## 📱 Próximos passos sugeridos

- [ ] PWA (instalável como app no celular)
- [ ] Geração de laudo em PDF com logo da oficina
- [ ] Integração com API do Tabela Fipe / CRLV
- [ ] OCR para ler placa e chassi por foto
- [ ] Multi-usuário (mecânicos diferentes na mesma oficina)
- [ ] Estoque básico de peças
- [ ] Integração com WhatsApp Business API (envio automático)
- [ ] Relatórios mensais por cliente / frotista
- [ ] Modo voz (mãos sujas)

---

Feito com ⚡ pra eletricistas de caminhão que querem trabalhar menos e cobrar melhor.
