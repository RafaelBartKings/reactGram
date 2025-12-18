ReactGram API - Backend

Esta é a API RESTful do projeto ReactGram, uma rede social inspirada no Instagram, desenvolvida com Node.js, Express e MongoDB.

🚀 Tecnologias Utilizadas

Node.js (Ambiente de execução)

Express (Framework web)

MongoDB & Mongoose (Banco de Dados NoSQL e Modelagem)

JWT (JSON Web Token) (Autenticação)

Bcryptjs (Criptografia de senhas)

Multer (Upload de imagens)

Express Validator (Validação de dados)

🛠️ Instalação e Configuração

Clone o repositório:

git clone <url-do-repositorio>

Instale as dependências:

npm install

Configure as variáveis de ambiente:
Crie um arquivo .env na raiz do diretório backend e preencha com as seguintes informações:

PORT=5000
MONGO_URI=mongodb+srv://<usuario>:<senha>@cluster.mongodb.net/<nome-do-banco>
JWT_SECRET=suachavemestraaqui

Inicie o servidor:

npm run dev

O servidor iniciará por padrão em: http://localhost:5000

📁 Estrutura de Pastas

config/: Configurações de banco de dados.

controllers/: Lógica de negócio e manipulação de requisições.

middlewares/: Filtros de autenticação, upload e validação.

models/: Definição dos schemas do Mongoose.

routes/: Definição dos endpoints da API.

uploads/: Armazenamento local das imagens (organizado por subpastas).

🛣️ Principais Rotas

Usuários (/api/users)

POST /register: Cria um novo usuário.

POST /login: Autentica um usuário e retorna um token.

GET /profile: Obtém os dados do usuário logado (Requer Token).

PUT /update: Atualiza nome, bio, senha ou imagem de perfil (Requer Token).

Fotos (/api/photos)

POST /: Upload de uma nova foto (Requer Token).

GET /: Retorna todas as fotos do sistema.

GET /user/:id: Retorna as fotos de um usuário específico.

GET /:id: Retorna uma foto pelo ID.

PUT /:id: Atualiza a descrição de uma foto.

DELETE /:id: Remove uma foto.

PUT /like/:id: Adiciona um "curtir" na foto.

PUT /unlike/:id: Remove o "curtir" da foto.

PUT /comment/:id: Adiciona um comentário na foto.

🔒 Segurança

A maioria das rotas de edição e visualização privada são protegidas pelo middleware authGuard, que verifica a validade do token JWT enviado no cabeçalho Authorization.

Desenvolvido como parte do curso React do Zero ao Avançado.
