from flask import Blueprint, jsonify, request, abort
from app.services.auth_service import AuthService

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/google', methods=['POST'])
def google_auth():
    if not request.is_json:
        abort(400, description="Payload structure inherently invalid.")
        
    token = request.json.get('token')
    if not token:
        abort(400, description="Google OAuth Context variable is missing.")
        
    try:
        data = AuthService.verify_google_oauth(token)
        return jsonify({"status": "success", "data": data}), 200
    except ValueError as e:
        abort(401, description=str(e))
    except Exception as e:
        abort(500, description="Internal Authentication Layer Error")

@auth_bp.route('/send-otp', methods=['POST'])
def send_otp():
    if not request.is_json:
        abort(400, description="Invalid payload mapping")
        
    email = request.json.get('email')
    if not email:
        abort(400, description="Email parameter missing")
        
    try:
        AuthService.generate_and_send_otp(email)
        return jsonify({"status": "success", "message": f"OTP dispatched securely to {email}."}), 200
    except Exception as e:
        abort(500, description="SMTP Engine failure")

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    if not request.is_json:
        abort(400)
    
    email = request.json.get('email')
    otp_code = request.json.get('otp_code')
    
    if not email or not otp_code:
        abort(400, description="Structure missing constraints mapping")
        
    try:
        data = AuthService.verify_otp(email, otp_code)
        return jsonify({"status": "success", "data": data}), 200
    except ValueError as e:
        abort(401, description=str(e))
    except Exception as e:
        abort(500)
