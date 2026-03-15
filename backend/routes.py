# -*- coding: utf-8 -*-
from flask import Blueprint, request, jsonify
from werkzeug.exceptions import BadRequest
from .database import db
from .models import User, Task

bp = Blueprint('api', __name__)


# Registrar rota de criação de usuário e endpoints de gerenciamento de tarefas
@bp.route('/users', methods=['POST'])
def create_user():
    """Cria um novo usuário."""
    try:
        data = request.get_json(force=True)
        
        # Validação básica de entrada
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        required_fields = ('name', 'email', 'password')
        if not all(field in data for field in required_fields):
            return jsonify({
                'error': f'Missing required fields: {", ".join(required_fields)}'
            }), 400

        # Checar se o email já está registrado
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error': 'Email already registered'}), 409

        # Criar novo usuário
        user = User(
            name=data['name'],
            email=data['email'],
            password=data['password']  # Em produção, use o hash da senha!
        )
        db.session.add(user)
        db.session.commit()
        
        # Retornar dados do usuário com o ID exibido de forma destacada
        return jsonify({
            'success': True,
            'message': f'User registered successfully. Your ID is: {user.id}',
            'user': user.to_dict()
        }), 201
        
    except BadRequest:
        return jsonify({'error': 'Invalid JSON format'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Server error: {str(e)}'}), 500


# Criar endpoint de tarefa
@bp.route('/tasks', methods=['POST'])
def create_task():
    """Cria uma nova tarefa."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        if 'title' not in data or not data['title'].strip():
            return jsonify({'error': 'Task title is required'}), 400
        
        if 'user_id' not in data:
            return jsonify({'error': 'user_id is required'}), 400

        # Verificar se o usuário existe
        user = User.query.get(data['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Criar tarefa
        task = Task(
            title=data['title'].strip(),
            description=data.get('description', '').strip(),
            user_id=data['user_id']
        )
        db.session.add(task)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'task': task.to_dict()
        }), 201
        
    except BadRequest:
        return jsonify({'error': 'Invalid JSON format'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Server error: {str(e)}'}), 500


# Obter endpoints de tarefas
@bp.route('/tasks', methods=['GET'])
def get_tasks():
    """Obter tarefas, opcionalmente filtradas por user_id."""
    try:
        user_id = request.args.get('user_id', type=int)
        
        if user_id:
            # Verificar se o usuário existe
            user = User.query.get(user_id)
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            tasks = Task.query.filter_by(user_id=user_id).all()
        else:
            tasks = Task.query.all()
        
        return jsonify({
            'success': True,
            'tasks': [t.to_dict() for t in tasks]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500


# Atualizar endpoint de tarefa
@bp.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Atualizar os campos de uma tarefa."""
    try:
        task = Task.query.get(task_id)
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400

        # Atualizar campos permitidos
        if 'title' in data and data['title'].strip():
            task.title = data['title'].strip()
        if 'description' in data:
            task.description = data['description'].strip()
        if 'status' in data and data['status'] in ('pending', 'completed'):
            task.status = data['status']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'task': task.to_dict()
        }), 200
        
    except BadRequest:
        return jsonify({'error': 'Invalid JSON format'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Server error: {str(e)}'}), 500


# Deletar endpoint de tarefa
@bp.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Deletar uma tarefa."""
    try:
        task = Task.query.get(task_id)
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        db.session.delete(task)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Task deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

