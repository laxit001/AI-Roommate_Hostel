from flask import Flask
from flask_cors import CORS
from app.config import Config

def create_app():
    """
    Application Factory Pattern for creating and configuring the Flask app.
    """
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS for all routes
    CORS(app)
    
    # Register error handlers
    from app.utils.error_handlers import register_error_handlers
    register_error_handlers(app)
    
    # Register blueprints
    from app.routes.game_routes import game_bp
    app.register_blueprint(game_bp, url_prefix='/api')
    
    from app.routes.match_routes import match_bp
    app.register_blueprint(match_bp, url_prefix='/api')
    
    from app.routes.feedback_routes import feedback_bp
    app.register_blueprint(feedback_bp, url_prefix='/api')
    
    from app.routes.chat_routes import chat_bp
    app.register_blueprint(chat_bp, url_prefix='/api')
    
    from app.routes.mess_routes import mess_bp
    app.register_blueprint(mess_bp, url_prefix='/api/mess')
    
    from app.routes.laundry_routes import laundry_bp
    app.register_blueprint(laundry_bp, url_prefix='/api/laundry')
    
    return app
