# Academia Estilo Livre

App de acompanhamento de treino mobile-first, construído em HTML/CSS/JS puro com persistência em `localStorage`.

---

## Problema resolvido

A ficha de treino em papel não permite:
- Registrar o **peso utilizado** em cada exercício
- Saber **quais treinos foram feitos** na semana
- Marcar a **dificuldade** de cada exercício
- Acompanhar a **progressão de carga** ao longo do tempo
- Gerenciar e **editar os treinos** sem depender do professor

---

## Funcionalidades

### Autenticação
- Cadastro e login por email/senha
- Dados isolados por usuário via `localStorage`
- Upload de foto de perfil (recortada em quadrado, salva em base64)

### Gestão de Treinos (CRUD)
- Criar treinos A, B, C, D, E... com nome e cor personalizados
- Exercícios numerados automaticamente por ordem (A1, A2, A3...)
- Cada exercício tem: número da máquina, nome, séries, reps, peso e código OBS
- Editar e excluir treinos e exercícios livremente

### Ciclo de Treino
- Rastreamento do ciclo A→E: quais treinos já foram feitos
- Indicador visual (dots) com cor por treino
- Barra de progresso do ciclo atual
- Contagem de ciclos completos

### Treino Ativo
- Timer total do treino em tempo real
- Exibição clara: **peso (kg)** e **repetições** lado a lado
- Controle de séries com dots (concluída / atual / pendente)
- Ajuste de peso durante o treino (botões − / +, incremento 2,5kg)
- Descanso automático de 30s entre séries (45s entre exercícios) com beep sonoro
- Opção de pular descanso
- Preview do próximo exercício

### Avaliação de Dificuldade
- Após completar todas as séries de um exercício: slider RPE 0–10
- 0 = sem esforço · 10 = máximo
- Código de cores: verde (fácil) → amarelo → vermelho (pesado)

### Relatório de Treino
- Gerado ao final de cada sessão (e ao clicar no histórico)
- Mostra: duração, volume total, dificuldade média
- Por exercício: séries × reps, peso usado, barra de dificuldade, tempo gasto
- Opção de salvar ou descartar a sessão

### Dashboard (Home)
1. **Próximo treino** — banner com play direto
2. **Ciclo atual** — progresso visual A→E
3. **Tendência de dificuldade** — gráfico SVG das últimas 12 sessões (verde = melhorando, vermelho = ficando mais difícil)
4. **Histórico** — últimas sessões clicáveis que abrem o relatório completo

### Progressão de Carga
- Após 2+ sessões do mesmo treino, calcula a dificuldade média por exercício
- Se média ≤ 4/10 (exercício fácil): sugere aumentar 2,5kg no próximo ciclo

---

## Stack

| Item | Tecnologia |
|---|---|
| Frontend | HTML + CSS + JavaScript (vanilla) |
| Persistência | `localStorage` |
| Gráficos | SVG inline gerado por JS |
| Áudio | Web Audio API (beep de descanso) |
| Deploy | Arquivo estático (`index.html`) |

---

## Estrutura de arquivos

```
estilo-livre/
├── index.html       # App completo (HTML + CSS + JS)
├── logo.jpeg        # Logo Academia Estilo Livre
└── ficha-treino.md  # Ficha original extraída da foto
```

---

## Como usar

Abrir `index.html` diretamente no browser — sem servidor, sem dependências.

Em produção: qualquer host de arquivos estáticos (GitHub Pages, Netlify, etc).

---

## Identidade visual

Baseada na Academia Estilo Livre:
- **Azul marinho** `#06091a` → `#1B3487` (backgrounds e destaques)
- **Amarelo** `#F5C400` (accent, botões, destaques — do logo da academia)
