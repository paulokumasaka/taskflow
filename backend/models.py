# -*- coding: utf-8 -*-
from datetime import datetime
from .database import db


class User(db.Model):
    """Modelo de usuário para sistema de gerenciamento de tarefas."""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password = db.Column(db.String(128), nullable=False)
    tasks = db.relationship('Task', backref='user', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        """Converter objeto de usuário em dicionário."""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
        }


class Task(db.Model):
    """Modelo de tarefa para tarefas de usuário."""
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True, default='')
    status = db.Column(db.String(20), default='pending', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    def to_dict(self):
        """Converter objeto de tarefa em dicionário."""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'user_id': self.user_id,
        }
