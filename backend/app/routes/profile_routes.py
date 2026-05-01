from flask import Blueprint, jsonify, request, abort
from app.models.user import UserModel
from app.utils.jwt import token_required

profile_bp = Blueprint('profile_bp', __name__)

@profile_bp.route('', methods=['GET'])
@profile_bp.route('/', methods=['GET'])
@token_required
def get_my_profile(current_user):
    # current_user is already populated natively from DAO by the wrapper!
    # Strip sensitive or irrelevant keys before transmitting
    safe_profile = {
        "user_id": current_user.get("user_id"),
        "name": current_user.get("name", "Unknown System Entity"),
        "email": current_user.get("email", "N/A"),
        "is_verified": current_user.get("is_verified", False),
        "trust_score": current_user.get("trust_score", 100),
        "confidence_score": current_user.get("confidence_score", 1.0),
        "created_at": str(current_user.get("created_at", "")),
        "compliance_factors": {
            "cleanliness": current_user.get("cleanliness", 5),
            "discipline": current_user.get("discipline", 5),
            "social": current_user["social"],
            "noise": current_user["noise"],
            "sleep": current_user["sleep"],
            "emotional": current_user["emotional"]
        }
    }
    return jsonify({"status": "success", "data": safe_profile}), 200

@profile_bp.route('', methods=['PUT'])
@profile_bp.route('/', methods=['PUT'])
@token_required
def update_profile_vector(current_user):
    if not request.is_json:
        abort(400)
        
    data = request.json
    name = data.get('name', current_user.get('name', ''))
    c = data.get('cleanliness', 5)
    d = data.get('discipline', 5)
    so = data.get('social', 5)
    n = data.get('noise', 5)
    sl = data.get('sleep', 5)
    e = data.get('emotional', 5)
    
    try:
        UserModel.update_user_profile(current_user['user_id'], name, c, d, so, n, sl, e)
        # Fetch clean updated object mapping directly reflecting new state
        updated_user = UserModel.get_user_by_id(current_user['user_id'])
        return jsonify({"status": "success", "message": "Profile and constraints overwritten safely."}), 200
    except Exception as err:
        abort(500)
