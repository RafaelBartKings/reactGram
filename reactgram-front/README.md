📸 ReactGram - Rede Social de Fotos
Uma aplicação web moderna para compartilhar e explorar fotos, construída com React, Redux e Node.js.

🚀 Funcionalidades Principais
✅ Autenticação de usuários - Cadastro e login seguro
✅ Upload de fotos - Poste suas melhores imagens
✅ Curtir fotos - Interaja com as publicações
✅ Comentários - Deixe sua opinião nas fotos
✅ Perfil de usuário - Página personalizada
✅ Busca inteligente - Encontre fotos facilmente
✅ Design responsivo - Funciona em todos dispositivos

🛠️ Tecnologias Utilizadas
Frontend:
⚛️ React 18

🎨 Redux Toolkit (gerenciamento de estado)

🚀 React Router (navegação)

💅 CSS3 (estilização)

Backend:
🟢 Node.js + Express

🔐 JWT (autenticação)

📁 Multer (upload de arquivos)

🗄️ MongoDB + Mongoose

📁 Estrutura do Projeto
text
reactgram/
├── frontend/                 # Aplicação React
│   ├── public/
│   └── src/
│       ├── components/       # Componentes reutilizáveis
│       ├── pages/           # Páginas da aplicação
│       ├── slices/          # Redux slices
│       ├── services/        # APIs services
│       └── utils/           # Configurações
│
└── backend/                 # API Node.js
    ├── controllers/
    ├── models/
    ├── routes/
    └── uploads/            # Imagens armazenadas
⚙️ Instalação e Configuração
1. Clone o repositório
bash
git clone https://github.com/seu-usuario/reactgram.git
cd reactgram
2. Configure o Backend
bash
cd backend
npm install
Crie um arquivo .env na pasta backend:

env
PORT=5000
MONGO_URI=sua_string_de_conexao_mongodb
JWT_SECRET=sua_chave_secreta_jwt
3. Configure o Frontend
bash
cd ../frontend
npm install
4. Execute a Aplicação
Terminal 1 - Backend:

bash
cd backend
npm start
Terminal 2 - Frontend:

bash
cd frontend
npm start
🌐 Acesse a Aplicação
Frontend: http://localhost:3000

Backend API: http://localhost:5000

Uploads: http://localhost:5000/uploads

🧪 Testando a Aplicação
Cadastre um novo usuário

Faça login

Faça upload de uma foto

Explore outras fotos

Curtir e comentar

🔧 Comandos Disponíveis
Frontend:
bash
npm start          # Inicia servidor de desenvolvimento
npm run build      # Cria build de produção
npm test           # Executa testes
Backend:
bash
npm start          # Inicia servidor
npm run dev        # Inicia com nodemon (desenvolvimento)
📱 Páginas da Aplicação
Página	Descrição
/	Home com todas as fotos
/login	Página de login
/register	Página de cadastro
/users/:id	Perfil do usuário
/photos/:id	Detalhes de uma foto
/search	Busca de fotos
🎨 Features Técnicas
Redux Toolkit para gerenciamento de estado global

Autenticação JWT com tokens seguros

Upload de imagens com preview

Lazy loading para melhor performance

Tratamento de erros em todas as requisições

Design responsivo mobile-first

🤝 Contribuindo
Faça um fork do projeto

Crie uma branch para sua feature (git checkout -b feature/incrivel)

Commit suas mudanças (git commit -m 'Adiciona feature incrível')

Push para a branch (git push origin feature/incrivel)

Abra um Pull Request

📄 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

📞 Suporte
Encontrou algum problema?

Abra uma issue

Entre em contato: seu-email@exemplo.com

Desenvolvido com ❤️ por [Seu Nome]
✨ Compartilhe momentos, compartilhe vida! ✨

Documentação gerada em Janeiro 2025