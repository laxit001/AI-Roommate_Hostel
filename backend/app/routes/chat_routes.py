from flask import Blueprint, jsonify, request, abort
from app.services.chat_service import ChatService
from app.utils.jwt import token_required

chat_bp = Blueprint('chat_bp', __name__)

@chat_bp.route('', methods=['POST'])
@chat_bp.route('/', methods=['POST'])
@token_required
def get_chat_recommendations(current_user):
    """
    Accepts JSON text query to communicate back an AI response driven by vector metrics safely tracking local identity.
    """
    if not request.is_json:
        abort(400, description="Payload structure inherently invalid.")
        
    payload = request.get_json()
    message = payload.get('message')
    
    if not message:
        abort(400, description="Missing strict required field: message")
        
    try:
        # Pass payload mapping securely isolated from forged headers
        response_text = ChatService.get_chat_response(current_user['user_id'], message)
        return jsonify({
            "status": "success",
            "response": response_text
        }), 200
        
    except ValueError as ve:
        abort(404, description=str(ve))
    except Exception as e:
        print(f"Chat API internal handling Error: {e}")
        abort(500)
