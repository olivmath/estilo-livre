# ACL — Controle de Acesso

## Apps

| Role | App |
|---|---|
| Aluno | `index.html` |
| Professor | `prof.html` |
| Admin | `admin.html` |

---

## Alunos

| Ação | Aluno | Professor | Admin |
|---|:---:|:---:|:---:|
| Criar aluno | — | ✅ | ✅ |
| Editar aluno | — | ❌ | ✅ |
| Apagar aluno | — | ❌ | ✅ |
| Bloquear / desbloquear aluno | — | ✅ | ✅ |
| Ver lista de todos os alunos | — | ✅ | ✅ |
| Ver detalhe + progresso de aluno | — | ✅ | ✅ |

## Treino (execução)

| Ação | Aluno | Professor | Admin |
|---|:---:|:---:|:---:|
| Executar treino (app mobile) | ✅ | — | — |
| Ver próprio histórico | ✅ | — | — |
| Atribuir treino a aluno | — | ✅ | ✅ |

## Conteúdo

| Ação | Aluno | Professor | Admin |
|---|:---:|:---:|:---:|
| Biblioteca de exercícios (CRUD) | — | ✅ | ✅ |
| Templates de treino (CRUD) | — | ✅ | ✅ |

## Painel / Analytics

| Ação | Aluno | Professor | Admin |
|---|:---:|:---:|:---:|
| Dashboard + KPIs | — | ✅ | ✅ |
| Ranking de alunos | — | ✅ | ✅ |

## Gestão de contas

| Ação | Aluno | Professor | Admin |
|---|:---:|:---:|:---:|
| Criar professor | — | ❌ | ✅ |
| Remover professor | — | ❌ | ✅ |
| Criar admin | — | ❌ | ✅ |
| Remover admin | — | ❌ | ✅ |

---

## Dados

```js
// Role no localStorage
admins[email] = { name, email, pw, role: "admin" | "professor" }

// Status do aluno
users[email] = { name, email, pw, active: true | false }
```
