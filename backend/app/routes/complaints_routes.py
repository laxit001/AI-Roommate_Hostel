from flask import Blueprint, jsonify, request, abort
from app.models.complaints import ComplaintModel
from app.utils.jwt import token_required

complaints_bp = Blueprint('complaints_bp', __name__)

@complaints_bp.route('/', methods=['POST'])
@token_required
def submit_complaint(current_user):
    if not request.is_json:
        abort(400)
    msg = request.json.get('message')
    roommate_id = request.json.get('roommate_id')
    
    if not msg or not roommate_id:
        abort(400, description="Constraints isolated: Missing message or roommate_id payload.")
        
    try:
        ComplaintModel.create_complaint(current_user['user_id'], roommate_id, msg)
        ComplaintModel.penalize_trust_score(roommate_id, 5) # Decimate 5 trust points naturally per hit
        return jsonify({"status": "success", "message": "Complaint tracked. Their Trust Score was automatically penalized by -5."}), 201
    except Exception as e:
        abort(500)

@complaints_bp.route('/', methods=['GET'])
@token_required
def my_complaints(current_user):
    try:
        logs = ComplaintModel.get_complaints_by_user(current_user['user_id'])
        return jsonify({"status": "success", "data": logs}), 200
    except Exception:
        abort(500)
