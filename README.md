# Backend - Sistema de Gestão de Tarefas com Times

Backend desenvolvido com Node.js, Express, Prisma e PostgreSQL para o sistema de gestão de tarefas em equipe.

## 🛠️ Tecnologias

- **Node.js** - Runtime JavaScript (Verificar versão exata no `package.json`)
- **React** - (Utilizado no Frontend - verificar versão no frontend/package.json)
- **Express.js** - Framework web
- **Prisma** - ORM para banco de dados (Verificar versão exata no `package.json`)
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **express-validator** - Validação de dados
- **CORS** - Configurado para permitir requisições do frontend

## Frontend

As instruções para instalação e execução do frontend podem ser encontradas no README.md correspondente no diretório `frontend/README.md`.

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── controllers/        # Lógica de negócio (e.g., auth, team, task, plan)
│   ├── middleware/         # Middlewares (e.g., auth)
│   ├── routes/            # Definição de rotas (e.g., auth, team, task, user, plan, notification)
│   ├── prisma/            # Schema do banco e seeds
│   │   ├── migrations/
│   │   └── schema.prisma
│   │   └── seed.js
│   └── server.js          # Servidor principal
├── .env.example           # Exemplo de variáveis de ambiente
├── package.json           # Dependências e scripts
└── README.md
```

## 🚀 Como Configurar e Executar Localmente

Siga os passos abaixo para configurar e rodar o backend na sua máquina local:

### 1. Clonar o repositório

```bash
git clone <URL_DO_SEU_REPOSITORIO_BACKEND>
cd <diretorio_backend>
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Copie o arquivo de exemplo e preencha com suas configurações:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações de banco de dados, JWT Secret, porta, etc. Exemplo:

```env
DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/seu_banco_de_dados?schema=public"
JWT_SECRET="sua_chave_secreta_para_jwt"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

### 4. Configurar e Popular o Banco de Dados (Prisma)

Primeiro, gere o cliente Prisma e aplique as migrações:

```bash
npx prisma generate
npx prisma migrate dev --name initial_migration # Use um nome descritivo para sua migração inicial
```

Em seguida, execute o script de seed para popular o banco de dados com dados iniciais (como planos de assinatura):

```bash
npx prisma db seed
```

_(Opcional) Abrir Prisma Studio para visualizar e gerenciar seus dados:_ `npx prisma studio`

### 5. Executar o Servidor

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:<PORTA_CONFIGURADA_NO_.ENV>` (por padrão, 3001).

## �� API Endpoints

### Autenticação

- \`POST /api/auth/register\` - Cadastrar usuário
- \`POST /api/auth/login\` - Login
- \`GET /api/auth/profile\` - Perfil do usuário

### Times

- \`POST /api/teams\` - Criar time
- \`GET /api/teams\` - Listar times do usuário
- \`GET /api/teams/:id\` - Detalhes do time
- \`POST /api/teams/:id/members\` - Adicionar membro
- \`DELETE /api/teams/:id/members/:memberId\` - Remover membro

### Tarefas

- \`POST /api/tasks\` - Criar tarefa
- \`GET /api/tasks\` - Listar tarefas (com filtros)
- \`GET /api/tasks/:id\` - Detalhes da tarefa
- \`PUT /api/tasks/:id\` - Atualizar tarefa
- \`DELETE /api/tasks/:id\` - Deletar tarefa

### Usuários

- \`GET /api/users\` - Listar usuários

## 🔒 Autenticação

Todas as rotas (exceto registro e login) requerem autenticação via JWT.

Inclua o token no header:
\`\`\`
Authorization: Bearer <seu-token-jwt>
\`\`\`

## 📊 Banco de Dados

### Modelos

#### User

- \`id\` - UUID único
- \`name\` - Nome do usuário
- \`email\` - Email único
- \`password\` - Senha hasheada
- \`createdAt\` - Data de criação

#### Team

- \`id\` - UUID único
- \`name\` - Nome do time
- \`ownerId\` - ID do proprietário
- \`createdAt\` - Data de criação

#### TeamMember

- \`id\` - UUID único
- \`teamId\` - ID do time
- \`userId\` - ID do usuário
- \`createdAt\` - Data de adição

#### Task

- \`id\` - UUID único
- \`title\` - Título da tarefa
- \`description\` - Descrição
- \`status\` - Status (pendente, andamento, concluída)
- \`teamId\` - ID do time
- \`assignedToId\` - ID do usuário atribuído
- \`createdAt\` - Data de criação

## 🧪 Scripts Disponíveis

- \`npm run dev\` - Executar em modo desenvolvimento
- \`npm start\` - Executar em produção
- \`npm run migrate\` - Executar migrações
- \`npm run generate\` - Gerar cliente Prisma
- \`npm run studio\` - Abrir Prisma Studio

## 🔧 Configuração de Produção / Deployment

Para deploy em ambientes de produção (como Render, Vercel, etc.), certifique-se de:

1. Configurar corretamente as variáveis de ambiente de produção.
2. Executar as migrações (`npx prisma migrate deploy`).
3. **Executar o script de seed (`npx prisma db seed` ou `node prisma/seed.js`) APÓS as migrações para popular o banco de dados.** Configure sua plataforma de hospedagem para rodar este comando no processo de build ou deploy.
4. Iniciar o servidor (`npm start`).

**Link do Backend Hospedado:**

[INSERIR LINK DO BACKEND AQUI]

## 📝 Notas Importantes

- Senhas são hasheadas com bcryptjs
- Tokens JWT expiram em 7 dias por padrão
- Validação de dados em todas as rotas
- Middleware de autenticação protege rotas sensíveis
- CORS configurado para o frontend
