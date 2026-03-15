# -*- coding: utf-8 -*-
from flask_sqlalchemy import SQLAlchemy

# Crie uma instância global do SQLAlchemy para ser importada em todos os módulos de backend
# Isso permite que os modelos sejam definidos separadamente e importados no aplicativo

db = SQLAlchemy()
