# Academia Estilo Livre

App de acompanhamento de treino mobile-first — HTML/CSS/JS puro, dados em `localStorage`.

## Problema

Ficha de papel não permite:
- Registrar **peso por exercício**
- Ver **quais treinos foram feitos** na semana
- Marcar **dificuldade** (RPE) por exercício
- Acompanhar **progressão de carga**
- Gerenciar treinos **sem depender do professor**

## Funcionalidades

| Módulo | Destaques |
|---|---|
| **Auth** | Cadastro/login, foto de perfil (base64, crop quadrado) |
| **Treinos (CRUD)** | Nome + cor, exercícios com numeração automática (A1, A2…), máquina / séries / reps / peso / OBS |
| **Ciclo A→E** | Dots coloridos por treino, barra de progresso, contagem de ciclos completos |
| **Treino Ativo** | Timer, ajuste de peso (±2,5kg), rest timer 30s/45s com beep, preview próximo exercício |
| **RPE** | Slider 0–10 após cada exercício; cor verde→amarelo→vermelho |
| **Relatório** | Duração, volume, dificuldade média, detalhes por exercício; salvar ou descartar |
| **Dashboard** | Próximo treino, ciclo atual, gráfico SVG últimas 12 sessões, histórico clicável |
| **Progressão** | Média RPE ≤ 4 → sugere +2,5kg no próximo ciclo |

## Stack

| Item | Tecnologia |
|---|---|
| Frontend | HTML + CSS + JS (vanilla) |
| Persistência | `localStorage` |
| Gráficos | SVG inline gerado por JS |
| Áudio | Web Audio API |
| Deploy | Arquivo estático |

## Como usar

```bash
open index.html   # sem servidor, sem dependências
```

Em produção: qualquer host estático (GitHub Pages, Netlify, etc).

## Identidade visual

- **Azul** `#06091a` → `#1B3487` (backgrounds)
- **Amarelo** `#F5C400` (accent — do logo da academia)
