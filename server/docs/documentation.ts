/**
 * Documentação completa da API
 * Acessível via GET /api e GET /api/docs
 */

export const API_DOCUMENTATION = {
  name: 'QA Playground API Mock',
  version: '1.0.0',
  description: 'API mockada para prática de testes QA',
  baseUrl: {
    local: 'http://localhost:3001/api',
    production: 'https://qa-playground-azure.vercel.app/api',
  },
  
  // Credenciais de teste
  credentials: {
    admin: { email: 'admin@example.com', password: 'admin123' },
    user: { email: 'user@example.com', password: 'user123' },
    viewer: { email: 'viewer@example.com', password: 'viewer123' },
  },

  // Endpoints disponíveis
  endpoints: {
    health: {
      method: 'GET',
      path: '/api/health',
      description: 'Verifica o status da API',
      auth: false,
      example: {
        request: 'GET /api/health',
        response: {
          status: 'ok',
          timestamp: '2024-01-20T10:00:00.000Z',
          service: 'QA Playground API Mock',
        },
      },
    },
    documentation: {
      method: 'GET',
      path: '/api ou /api/docs',
      description: 'Retorna esta documentação completa',
      auth: false,
    },
    auth: {
      login: {
        method: 'POST',
        path: '/api/auth/login',
        description: 'Faz login e retorna token JWT',
        auth: false,
        body: {
          email: 'string (obrigatório)',
          password: 'string (obrigatório)',
        },
        example: {
          request: {
            url: 'POST /api/auth/login',
            headers: { 'Content-Type': 'application/json' },
            body: {
              email: 'admin@example.com',
              password: 'admin123',
            },
          },
          response: {
            success: true,
            data: {
              token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              user: {
                id: 1,
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'admin',
              },
            },
          },
        },
      },
      logout: {
        method: 'POST',
        path: '/api/auth/logout',
        description: 'Faz logout e invalida token',
        auth: true,
        example: {
          request: {
            url: 'POST /api/auth/logout',
            headers: { Authorization: 'Bearer SEU_TOKEN' },
          },
        },
      },
      me: {
        method: 'GET',
        path: '/api/auth/me',
        description: 'Retorna informações do usuário autenticado',
        auth: true,
        example: {
          request: {
            url: 'GET /api/auth/me',
            headers: { Authorization: 'Bearer SEU_TOKEN' },
          },
        },
      },
      validate: {
        method: 'POST',
        path: '/api/auth/validate',
        description: 'Valida um token JWT',
        auth: false,
        body: {
          token: 'string (obrigatório)',
        },
      },
    },
    users: {
      list: {
        method: 'GET',
        path: '/api/users',
        description: 'Lista todos os usuários (requer role admin)',
        auth: true,
        roles: ['admin'],
        example: {
          request: {
            url: 'GET /api/users',
            headers: { Authorization: 'Bearer SEU_TOKEN' },
          },
        },
      },
      getById: {
        method: 'GET',
        path: '/api/users/:id',
        description: 'Retorna um usuário específico',
        auth: true,
        example: {
          request: {
            url: 'GET /api/users/1',
            headers: { Authorization: 'Bearer SEU_TOKEN' },
          },
        },
      },
      create: {
        method: 'POST',
        path: '/api/users',
        description: 'Cria um novo usuário (requer role admin)',
        auth: true,
        roles: ['admin'],
        body: {
          name: 'string (obrigatório)',
          email: 'string (obrigatório, único)',
          role: 'string (admin|user|viewer)',
          active: 'boolean',
        },
        example: {
          request: {
            url: 'POST /api/users',
            headers: {
              Authorization: 'Bearer SEU_TOKEN',
              'Content-Type': 'application/json',
            },
            body: {
              name: 'Novo Usuário',
              email: 'novo@example.com',
              role: 'user',
              active: true,
            },
          },
        },
      },
      update: {
        method: 'PUT',
        path: '/api/users/:id',
        description: 'Atualiza um usuário',
        auth: true,
        body: {
          name: 'string (opcional)',
          email: 'string (opcional)',
          role: 'string (opcional)',
          active: 'boolean (opcional)',
        },
      },
      delete: {
        method: 'DELETE',
        path: '/api/users/:id',
        description: 'Deleta um usuário (requer role admin)',
        auth: true,
        roles: ['admin'],
      },
    },
    orders: {
      list: {
        method: 'GET',
        path: '/api/orders',
        description: 'Lista pedidos (próprios ou todos se admin)',
        auth: true,
        example: {
          request: {
            url: 'GET /api/orders',
            headers: { Authorization: 'Bearer SEU_TOKEN' },
          },
        },
      },
      getById: {
        method: 'GET',
        path: '/api/orders/:id',
        description: 'Retorna um pedido específico',
        auth: true,
      },
      create: {
        method: 'POST',
        path: '/api/orders',
        description: 'Cria um novo pedido',
        auth: true,
        body: {
          items: 'array (obrigatório)',
        },
        example: {
          request: {
            url: 'POST /api/orders',
            headers: {
              Authorization: 'Bearer SEU_TOKEN',
              'Content-Type': 'application/json',
            },
            body: {
              items: [
                {
                  productId: 101,
                  productName: 'Notebook',
                  quantity: 1,
                  price: 2500,
                },
                {
                  productId: 102,
                  productName: 'Mouse',
                  quantity: 2,
                  price: 50,
                },
              ],
            },
          },
        },
      },
      update: {
        method: 'PUT',
        path: '/api/orders/:id',
        description: 'Atualiza um pedido',
        auth: true,
      },
      delete: {
        method: 'DELETE',
        path: '/api/orders/:id',
        description: 'Deleta um pedido (requer role admin)',
        auth: true,
        roles: ['admin'],
      },
    },
  },

  // Sistema de cenários
  scenarios: {
    description: 'Use ?scenario=<tipo> ou header x-mock-scenario para controlar comportamentos da API',
    usage: {
      queryParam: 'GET /api/users?scenario=error-401',
      header: 'x-mock-scenario: error-500',
    },
    types: [
      {
        name: 'success',
        description: 'Resposta de sucesso (padrão)',
        statusCode: 200,
      },
      {
        name: 'error-400',
        description: 'Bad Request - Payload inválido',
        statusCode: 400,
      },
      {
        name: 'error-401',
        description: 'Unauthorized - Não autenticado',
        statusCode: 401,
      },
      {
        name: 'error-403',
        description: 'Forbidden - Sem permissão',
        statusCode: 403,
      },
      {
        name: 'error-404',
        description: 'Not Found - Recurso inexistente',
        statusCode: 404,
      },
      {
        name: 'error-409',
        description: 'Conflict - Conflito de dados',
        statusCode: 409,
      },
      {
        name: 'error-422',
        description: 'Unprocessable Entity - Erro de validação',
        statusCode: 422,
      },
      {
        name: 'error-429',
        description: 'Too Many Requests - Rate limit',
        statusCode: 429,
      },
      {
        name: 'error-500',
        description: 'Internal Server Error - Erro inesperado',
        statusCode: 500,
      },
      {
        name: 'error-503',
        description: 'Service Unavailable - Serviço indisponível',
        statusCode: 503,
      },
      {
        name: 'timeout',
        description: 'Gateway Timeout - Requisição demorada (10 segundos)',
        statusCode: 504,
      },
    ],
  },

  // Guia de uso com Postman
  postman: {
    title: 'Como usar com Postman',
    steps: [
      {
        step: 1,
        title: 'Importar Coleção',
        description: 'Importe a coleção pronta: api/QA-Playground-API.postman_collection.json',
        details: [
          'Abra o Postman',
          'Clique em Import',
          'Selecione o arquivo QA-Playground-API.postman_collection.json',
          'A coleção será importada com todas as requisições prontas',
        ],
      },
      {
        step: 2,
        title: 'Configurar Variáveis de Ambiente',
        description: 'Crie um ambiente para facilitar a troca entre local e produção',
        environments: {
          local: {
            name: 'QA Playground Local',
            variables: {
              base_url: 'http://localhost:3001/api',
              token: '(será preenchido após login)',
            },
          },
          production: {
            name: 'QA Playground Production',
            variables: {
              base_url: 'https://qa-playground-azure.vercel.app/api',
              token: '(será preenchido após login)',
            },
          },
        },
        instructions: [
          'Clique em Environments → +',
          'Crie um novo ambiente',
          'Adicione as variáveis base_url e token',
          'Selecione o ambiente antes de fazer requisições',
        ],
      },
      {
        step: 3,
        title: 'Fazer Login',
        description: 'Execute a requisição de login para obter o token',
        example: {
          method: 'POST',
          url: '{{base_url}}/auth/login',
          body: {
            email: 'admin@example.com',
            password: 'admin123',
          },
        },
        note: 'A coleção já inclui um script que salva o token automaticamente após o login',
      },
      {
        step: 4,
        title: 'Usar Token nas Requisições',
        description: 'O token será usado automaticamente nas requisições que requerem autenticação',
        example: {
          method: 'GET',
          url: '{{base_url}}/users',
          headers: {
            Authorization: 'Bearer {{token}}',
          },
        },
      },
      {
        step: 5,
        title: 'Testar Cenários de Erro',
        description: 'Use query params ou headers para simular diferentes cenários',
        examples: [
          'GET {{base_url}}/users?scenario=error-401',
          'GET {{base_url}}/users?scenario=error-500',
          'Header: x-mock-scenario: error-403',
        ],
      },
    ],
  },

  // Guia de uso com Insomnia
  insomnia: {
    title: 'Como usar com Insomnia',
    steps: [
      {
        step: 1,
        title: 'Criar Novo Projeto',
        instructions: [
          'Abra o Insomnia',
          'Clique em Create → New Design Document',
          'Nomeie como: QA Playground API',
        ],
      },
      {
        step: 2,
        title: 'Configurar Variáveis de Ambiente',
        instructions: [
          'Clique no ícone de Environment (canto superior direito)',
          'Clique em Manage Environments → Create Environment',
          'Nomeie como: Local',
          'Adicione as variáveis:',
        ],
        variables: {
          base_url: 'http://localhost:3001/api',
          token: '',
        },
      },
      {
        step: 3,
        title: 'Criar Requisições',
        examples: [
          {
            name: 'Health Check',
            method: 'GET',
            url: '{{ _.base_url }}/health',
          },
          {
            name: 'Login',
            method: 'POST',
            url: '{{ _.base_url }}/auth/login',
            body: {
              email: 'admin@example.com',
              password: 'admin123',
            },
          },
          {
            name: 'Get Users',
            method: 'GET',
            url: '{{ _.base_url }}/users',
            auth: 'Bearer Token: {{ _.token }}',
          },
        ],
      },
    ],
  },

  // Exemplos de requisições HTTP
  examples: {
    login: {
      description: 'Login e obter token',
      request: `POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}`,
      response: `{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}`,
    },
    listUsers: {
      description: 'Listar usuários (requer autenticação)',
      request: `GET /api/users
Authorization: Bearer SEU_TOKEN_AQUI`,
      response: `{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin"
    }
  ]
}`,
    },
    createUser: {
      description: 'Criar novo usuário',
      request: `POST /api/users
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "role": "user",
  "active": true
}`,
    },
    errorScenario: {
      description: 'Simular erro 401',
      request: `GET /api/users?scenario=error-401
Authorization: Bearer token-invalido`,
      response: `{
  "error": "Unauthorized",
  "message": "Token de autenticação inválido ou ausente",
  "details": "Faça login novamente para obter um token válido"
}`,
    },
  },

  // Troubleshooting
  troubleshooting: {
    title: 'Solução de Problemas',
    issues: [
      {
        problem: 'API não inicia',
        solutions: [
          'Verifique se a porta 3001 está livre',
          'Verifique se as dependências foram instaladas: npm install',
          'Verifique se o TypeScript foi compilado: npm run build:ts:api',
        ],
      },
      {
        problem: 'Erro de conexão no Postman/Insomnia',
        solutions: [
          'Verifique se a API está rodando: GET http://localhost:3001/api/health',
          'Verifique se a URL está correta',
          'Verifique se não há firewall bloqueando',
        ],
      },
      {
        problem: 'Token inválido',
        solutions: [
          'Faça login novamente para obter um novo token',
          'Tokens expiram após 1 hora',
          'Verifique se está usando Bearer antes do token no header',
        ],
      },
      {
        problem: 'Erro 401 Unauthorized',
        solutions: [
          'Verifique se o token está sendo enviado no header Authorization',
          'Use o formato: Authorization: Bearer SEU_TOKEN',
          'Faça login novamente se o token expirou',
        ],
      },
      {
        problem: 'Erro 403 Forbidden',
        solutions: [
          'Verifique se o usuário tem permissão (role) adequada',
          'Algumas rotas requerem role admin',
          'Use as credenciais de admin para testes',
        ],
      },
      {
        problem: 'CORS Errors',
        solutions: [
          'A API já está configurada com CORS habilitado',
          'Use http://localhost:3001 e não http://127.0.0.1:3001',
        ],
      },
    ],
  },

  // Dicas importantes
  tips: [
    'Sempre faça login primeiro para obter o token',
    'Use variáveis de ambiente para facilitar a troca entre ambientes',
    'Teste cenários de erro usando o parâmetro scenario',
    'Salve o token automaticamente usando scripts de teste no Postman',
    'Use a documentação da API (GET /api) para ver todos os endpoints disponíveis',
    'A coleção do Postman já inclui todas as requisições prontas',
  ],
};
