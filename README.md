# Almoxarifado Inteligente

Sistema web de gestão de almoxarifado — Next.js + TypeScript + Tailwind CSS + Supabase.

Status: **Etapa 0 (Fundação) e Etapa 1 (Banco de Dados) concluídas.**
Consulte `docs/ARQUITETURA.md` para a proposta completa e o plano de etapas restantes.

---

## 1. Pré-requisitos

- Node.js 18+ e npm
- Uma conta gratuita em [supabase.com](https://supabase.com)
- Conta na [Vercel](https://vercel.com) (para deploy)

## 2. Instalação local

```bash
npm install
cp .env.example .env.local
```

Preencha o `.env.local` com as credenciais do seu projeto Supabase (passo 3).

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## 3. Configurando o Supabase

1. Crie um novo projeto em [supabase.com/dashboard](https://supabase.com/dashboard).
2. Em **Project Settings → API**, copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ nunca exponha esta chave no client)
3. No **SQL Editor** do Supabase, execute o conteúdo de `supabase/migrations/0001_init.sql`.
4. (Opcional, para testes) Execute `supabase/seed.sql` — antes, crie um usuário em
   **Authentication → Users → Add user** e substitua o UUID de exemplo no seed pelo id gerado.
5. Promova esse usuário a administrador:
   ```sql
   update usuarios set perfil = 'administrador' where id = 'UUID-DO-USUARIO';
   ```
   Se a linha em `usuarios` ainda não existir (primeiro login), veja a seção 5 abaixo.

## 4. Criando usuários

Fluxo recomendado (via Supabase Dashboard, enquanto o módulo de administração de usuários
da Etapa 2 não estiver ativo):

1. **Authentication → Users → Add user** — defina e-mail e senha.
2. Insira a linha correspondente na tabela `usuarios`:
   ```sql
   insert into usuarios (id, nome, perfil)
   values ('UUID-DO-AUTH-USER', 'Nome Completo', 'administrador'); -- ou 'almoxarife' / 'consulta'
   ```

A partir da Etapa 2, o próprio painel administrativo cuidará desse cadastro automaticamente.

## 5. Deploy na Vercel

1. Suba o projeto para um repositório no GitHub.
2. Em [vercel.com/new](https://vercel.com/new), importe o repositório.
3. Em **Environment Variables**, adicione as mesmas três variáveis do `.env.local`.
4. Deploy. A cada push na branch principal, a Vercel publica automaticamente.

## 6. Backup do banco

- **Supabase Dashboard → Database → Backups**: backups diários automáticos (planos pagos)
  ou backup manual via `pg_dump`:
  ```bash
  pg_dump "postgresql://postgres:[SENHA]@[HOST]:5432/postgres" > backup_$(date +%F).sql
  ```

## 7. Restaurar backup

```bash
psql "postgresql://postgres:[SENHA]@[HOST]:5432/postgres" < backup_2026-07-12.sql
```
⚠️ Restaurar sobrescreve dados existentes — use um projeto Supabase separado para testes de restore.

## 8. Atualizando o sistema

- Novas migrations serão adicionadas em `supabase/migrations/` de forma incremental
  (ex: `0002_modulo_x.sql`). Execute cada uma, em ordem, no SQL Editor do Supabase.
- `git pull` + `npm install` para atualizar o código, seguido de novo deploy na Vercel.

---

## Estrutura do projeto

Ver `docs/ARQUITETURA.md` para a explicação completa de cada pasta.

## Próximas etapas

Ver `docs/ARQUITETURA.md`, seção "Plano de Desenvolvimento em Etapas" — próxima é a
**Etapa 2: Autenticação e Perfis** (login/logout já têm uma base pronta em
`app/(auth)/login`; falta o CRUD de usuários e a página de recuperação de senha).
