# -*- coding: utf-8 -*-
import os
from flask import Flask, jsonify
from flask_cors import CORS

# Gerenciar a execução de pacotes e scripts
try:
    from .database import db
    from .routes import bp
except ImportError:
    from database import db
    from routes import bp


def create_app():
    app = Flask(__name__)

    # Ative o CORS para todas as rotas (frontend em origem diferente).
    CORS(app, resources={r"/*": {"origins": "*"}})

    # configuração
    database_url = os.getenv(
        'DATABASE_URL',
        'postgresql://postgres:postgres123@localhost/taskflow'
    )
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_recycle': 3600,
    }

    # Inicialize o banco de dados
    db.init_app(app)

    # Registre o modelo com rotas de API.
    app.register_blueprint(bp, url_prefix='')

    # Rota de verificação de saúde simples
    @app.route('/')
    def index():
        return jsonify({'message': 'TaskFlow API is running.'})

    # manipuladores de erros globais para respostas JSON consistentes
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500

    return app


if __name__ == '__main__':
    app = create_app()
    
    # Crie as tabelas se elas não existirem.
    with app.app_context():
        try:
            db.create_all()
            print('Database tables created/verified.')
        except Exception as e:
            print(f'Error creating database tables: {e}')
            print('Make sure PostgreSQL is running and DATABASE_URL is correct.')
    
    # Execute o servidor de desenvolvimento.
    print('Starting TaskFlow API server on http://localhost:5000/')
    app.run(debug=True, host='0.0.0.0', port=5000)