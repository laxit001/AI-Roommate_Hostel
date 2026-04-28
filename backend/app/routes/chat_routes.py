from flask import Blueprint, jsonify, request, abort
from app.services.chat_service import ChatService

chat_bp = Blueprint('chat_bp', __name__)

@chat_bp.route('/chat', methods=['POST'])
def get_chat_recommendations():
    """
    Accepts user ID and text query to communicate back an AI response driven by vector metrics.
    """
    if not request.is_json:
        abort(400, description="Payload must be JSON")
        
    payload = request.get_json()
    user_id = payload.get('user_id')
    prompt = payload.get('prompt')
    
    if not user_id or not prompt:
        abort(400, description="Missing required fields: user_id, prompt")
        
    try:
        response_text = ChatService.get_ai_response(user_id, prompt)
        return jsonify({
            "status": "success",
            "data": {
                "response": response_text
            }
        }), 200
        
    except ValueError as ve:
        abort(404, description=str(ve))
    except Exception as e:
        print(f"Chat API internal handling Error: {e}")
        abort(500)
