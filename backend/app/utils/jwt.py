import jwt
from functools import wraps
from flask import request, jsonify, abort
from app.config import Config
from app.models.user import UserModel
import datetime

def generate_token(user_id):
    """ Encrypts payload safely with expiration headers tracking access limits """
    payload = {
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),
        'iat': datetime.datetime.utcnow()
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm='HS256')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # We enforce "Bearer JSONWebToken..." standard pattern inside headers uniquely
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            parts = auth_header.split(" ")
            if len(parts) == 2 and parts[0] == "Bearer":
                token = parts[1]
                
        if not token:
            return jsonify({'status': 'fail', 'message': 'Authentication Token is missing.'}), 401
            
        try:
            data = jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])
            # Verify if user exists globally using our standard DAO
            current_user = UserModel.get_user_by_id(data['user_id'])
            if not current_user:
                raise ValueError("Valid Token syntax but dead matching reference record mapped")
        except jwt.ExpiredSignatureError:
             return jsonify({'status': 'fail', 'message': 'Token Session Expired. Re-Auth required.'}), 401
        except jwt.InvalidTokenError:
             return jsonify({'status': 'fail', 'message': 'Forged or Malformed JWT Error.'}), 401
        except Exception as e:
             return jsonify({'status': 'fail', 'message': str(e)}), 401
             
        # Inject user object locally bypassing explicit query chains deeper into endpoints securely
        return f(current_user, *args, **kwargs)
        
    return decorated
