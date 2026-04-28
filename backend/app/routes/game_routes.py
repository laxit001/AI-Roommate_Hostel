from flask import Blueprint, request, jsonify, abort
from app.services.user_service import UserService
from app.utils.validators import validate_game_payload

game_bp = Blueprint('game_bp', __name__)

@game_bp.route('/submit-game', methods=['POST'])
def submit_game():
    """
    Accepts game-based inputs, calculates the psychological vector, 
    and saves the user Profile into the database.
    """
    if not request.is_json:
        abort(400, description="Request must be application/json")
        
    payload = request.get_json()
    
    # 1. Validation
    is_valid, validation_msg = validate_game_payload(payload)
    if not is_valid:
        abort(400, description=validation_msg)
        
    # 2. Process via Service
    try:
        result = UserService.process_and_save_user(payload)
        return jsonify({
            "status": "success",
            "data": result
        }), 201
        
    except ValueError as ve:
        # e.g., User already exists
        abort(409, description=str(ve))
    except Exception as e:
        # System/DB failures fall into 500
        print(f"Error processing game submission: {e}")
        abort(500)
