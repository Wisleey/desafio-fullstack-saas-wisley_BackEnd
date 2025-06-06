# Backend - Sistema de Gestão de Tarefas com Times

Backend desenvolvido com Node.js, Express, Prisma e PostgreSQL para o sistema de gestão de tarefas em equipe.

## 🛠️ Tecnologias

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **express-validator** - Validação de dados

## 📁 Estrutura do Projeto

\`\`\`
backend/
├── src/
│   ├── controllers/        # Lógica de negócio
│   │   ├── authController.js
│   │   ├── teamController.js
│   │   └── taskController.js
│   ├── middleware/         # Middlewares
│   │   └── auth.js
│   ├── routes/            # Definição de rotas
│   │   ├── authRoutes.js
│   │   ├── teamRoutes.js
│   │   ├── taskRoutes.js
│   │   └── userRoutes.js
│   ├── prisma/            # Schema do banco
│   │   └── schema.prisma
│   └── server.js          # Servidor principal
├── .env.example           # Exemplo de variáveis
├── package.json
└── README.md
\`\`\`

## 🚀 Como Executar

### 1. Instalar dependências
\`\`\`bash
npm install
\`\`\`

### 2. Configurar variáveis de ambiente
\`\`\`bash
cp .env.example .env
\`\`\`

Edite o arquivo \`.env\` com suas configurações:

\`\`\`env
DATABASE_URL="postgresql://username:password@localhost:5432/task_management"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
\`\`\`

### 3. Configurar banco de dados
\`\`\`bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate dev

# (Opcional) Abrir Prisma Studio
npx prisma studio
\`\`\`

### 4. Executar o servidor
\`\`\`bash
# Desenvolvimento
npm run dev

# Produção
npm start
\`\`\`

O servidor estará rodando em \`http://localhost:3001\`

## 📚 API Endpoints

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

## 🔧 Configuração de Produção

1. Configure as variáveis de ambiente de produção
2. Execute as migrações: \`npx prisma migrate deploy\`
3. Inicie o servidor: \`npm start\`

## 📝 Notas Importantes

- Senhas são hasheadas com bcryptjs
- Tokens JWT expiram em 7 dias por padrão
- Validação de dados em todas as rotas
- Middleware de autenticação protege rotas sensíveis
- CORS configurado para o frontend
