# TaskFlow – Sistema de Gerenciamento de Tarefas

O **TaskFlow** é uma aplicação web simples para gerenciamento de tarefas desenvolvida como projeto acadêmico para a disciplina de **Software Product: Analysis, Specification, Project & Implementation**.

O sistema permite o cadastro de usuários e o gerenciamento de tarefas associadas a cada usuário, utilizando uma arquitetura full-stack com **frontend web**, **API REST em Flask** e **banco de dados PostgreSQL**.

---

# Tecnologias Utilizadas

### Backend

- Python 3
- Flask
- Flask-SQLAlchemy
- Flask-CORS

### Frontend

- HTML5
- CSS3
- Bootstrap 5
- JavaScript (ES6)

### Banco de Dados

- PostgreSQL

---

# Estrutura do Projeto

taskflow/
│
├── backend/
│ ├── app.py
│ ├── database.py
│ ├── models.py
│ └── routes.py
│
├── frontend/
│ ├── index.html
│ ├── tasks.html
│ ├── style.css
│ └── script.js
│
├── database/
│ └── schema.sql
│
├── requirements.txt
└── README.md

### Organização

O projeto foi dividido em três partes principais:

**Frontend**

Responsável pela interface do usuário e interação com a API.

**Backend**

Implementa a API REST utilizando Flask e gerencia a lógica da aplicação.

**Banco de Dados**

Armazena os dados de usuários e tarefas utilizando PostgreSQL.

---

# Funcionalidades

O sistema permite:

### Cadastro de usuários

- Registro com nome, email e senha
- Validação de email
- Geração de ID único para cada usuário

### Gerenciamento de tarefas

- Criar tarefas
- Listar tarefas de um usuário
- Atualizar status da tarefa
- Excluir tarefas

As tarefas são associadas ao usuário por meio de **relacionamento no banco de dados**.

---

# API REST

A aplicação utiliza uma API REST para comunicação entre frontend e backend.

### Usuários

**POST /users**

Cria um novo usuário.

Exemplo de requisição:

```json
{
  "name": "João",
  "email": "joao@email.com",
  "password": "123456"
}
```

## Tarefas

- POST /tasks - Cria uma nova tarefa.
- GET /tasks?user_id=1 - Lista tarefas de um usuário.
- PUT /tasks/<id> - Atualiza uma tarefa.
- DELETE /tasks/<id> - Remove uma tarefa.

## Como Executar o Projeto

1. Clonar o repositório
   git clone https://github.com/paulokumasaka/taskflow
2. Instalar dependências
   pip install -r requirements.txt
3. Criar banco de dados PostgreSQL
   CREATE DATABASE taskflow_db;

## Executar o script SQL:

database/schema.sql 4. Executar o backend

Dentro da pasta backend:

python app.py
O servidor iniciará em:http://localhost:5000

5. Abrir o frontend

Abrir o arquivo:frontend/index.html
Após o cadastro do usuário, o sistema direciona para:tasks.html
onde é possível gerenciar as tarefas.

## Demonstração do Sistema

Fluxo de uso da aplicação:

1.	Cadastro de usuário
2.	Exibição do ID do usuário
3.	Acesso à página de tarefas
4.	Criação de tarefas
5.	Atualização do status
6.	Exclusão de tarefas

## Observações

Este projeto foi desenvolvido para fins educacionais.
Algumas simplificações foram adotadas, como armazenamento de senha sem criptografia.

Em aplicações reais seria recomendado utilizar:

Hash de senha
Autenticação com tokens
Controle de sessão