import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'super-secret-key'
    
    # MySQL Database Config
    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_USER = os.environ.get('DB_USER', 'root')
    DB_PASSWORD = os.environ.get('DB_PASSWORD', 'Laxit@#123')
    DB_NAME = os.environ.get('DB_NAME', 'roommate_matching')
    DB_PORT = int(os.environ.get('DB_PORT', 3306))
    
    # AI Integration
    OPENROUTER_API_KEY = os.environ.get('OPENROUTER_API_KEY', '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')
    
    # Secure JWT Encryption Keys
    JWT_SECRET = os.environ.get('JWT_SECRET', 'super_secret_hostel_fallback_key')
    
    # SMTP Protocol Email Auth
    SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
    SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
    SMTP_USER = os.environ.get('SMTP_USER', 'youremail@gmail.com')
    SMTP_PASS = os.environ.get('SMTP_PASS', 'app_password')
    
    # Google OAuth Context Validation Key
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', 'placeholder-id-here.apps.googleusercontent.com')
