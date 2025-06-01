from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from datetime import timedelta
from models import db
from routes.auth import auth_bp
from routes.books import books_bp
from routes.borrowings import borrowings_bp
from routes.reservations import reservations_bp
from config import Config

def create_app():
    app = Flask(__name__)
    CORS(app, origins=["http://localhost:3000"], supports_credentials=True)
    
    # Configuration
    app.config.from_object(Config)
    
    # Initialize extensions
    db.init_app(app)
    migrate = Migrate(app, db)
    # Créer les tables si elles n'existent pas (utile pour l'initialisation sans migrations complètes)
    with app.app_context():
        db.create_all()
    jwt = JWTManager(app)


    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(books_bp, url_prefix='/api/books')
    app.register_blueprint(borrowings_bp, url_prefix='/api/borrowings')
    app.register_blueprint(reservations_bp, url_prefix='/api/reservations')
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return jsonify({'status': 'healthy'}), 200
    
    return app

app = create_app()


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
    