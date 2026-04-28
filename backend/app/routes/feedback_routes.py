from flask import Blueprint, jsonify, request, abort
from app.services.feedback_service import FeedbackService

feedback_bp = Blueprint('feedback_bp', __name__)

@feedback_bp.route('/feedback', methods=['POST'])
def submit_feedback():
    """
    Accepts feedback reports specifying whether a user deviated from their mapped psychology vector.
    """
    if not request.is_json:
        abort(400, description="Payload must be JSON")
        
    payload = request.get_json()
    target_id = payload.get('target_user_id')
    feedback_type = payload.get('feedback_type') 
    
    if not target_id or not feedback_type:
        abort(400, description="Missing required fields: target_user_id, feedback_type")
        
    try:
        result = FeedbackService.process_feedback(target_id, feedback_type)
        return jsonify({
            "status": "success",
            "message": "Feedback submitted and behavioral index recalculated.",
            "data": result
        }), 200
        
    except ValueError as ve:
        # Invalid arguments handled as bad request or not found user
        abort(400, description=str(ve))
    except Exception as e:
        print(f"Server Error handling feedback: {e}")
        abort(500)
