from flask import Blueprint, jsonify, request, abort
from app.models.user import UserModel
from app.utils.jwt import token_required

profile_bp = Blueprint('profile_bp', __name__)


@profile_bp.route('', methods=['GET'])
@profile_bp.route('/', methods=['GET'])
@token_required
def get_my_profile(current_user):
    """Returns the authenticated user's full profile."""
    safe_profile = {
        "user_id":        current_user.get("user_id"),
        "name":           current_user.get("name", "Student"),
        "email":          current_user.get("email", ""),
        "is_verified":    current_user.get("is_verified", False),
        "trust_score":    current_user.get("trust_score", 100.0),
        "confidence_score": current_user.get("confidence_score", 1.0),
        "complaints_count": current_user.get("complaints_count", 0),
        "penalty_level":  current_user.get("penalty_level", 0),
        "created_at":     str(current_user.get("created_at", "")),
        "compliance_factors": {
            "cleanliness": current_user.get("cleanliness", 5),
            "discipline":  current_user.get("discipline", 5),
            "social":      current_user.get("social", 5),
            "noise":       current_user.get("noise", 5),
            "sleep":       current_user.get("sleep", 5),
            "emotional":   current_user.get("emotional", 5),
        }
    }
    return jsonify({"status": "success", "data": safe_profile}), 200


@profile_bp.route('', methods=['PUT'])
@profile_bp.route('/', methods=['PUT'])
@token_required
def update_profile(current_user):
    """Updates the authenticated user's name and personality trait vector."""
    if not request.is_json:
        abort(400, description="Request body must be JSON.")

    data = request.json
    name = data.get('name', current_user.get('name', 'Student'))

    # Clamp all trait values between 1 and 10
    def clamp(val, default=5):
        try:
            v = float(val)
            return max(1.0, min(10.0, v))
        except (TypeError, ValueError):
            return float(default)

    c  = clamp(data.get('cleanliness', current_user.get('cleanliness', 5)))
    d  = clamp(data.get('discipline',  current_user.get('discipline', 5)))
    so = clamp(data.get('social',      current_user.get('social', 5)))
    n  = clamp(data.get('noise',       current_user.get('noise', 5)))
    sl = clamp(data.get('sleep',       current_user.get('sleep', 5)))
    e  = clamp(data.get('emotional',   current_user.get('emotional', 5)))

    try:
        UserModel.update_user_profile(current_user['user_id'], name, c, d, so, n, sl, e)
        updated = UserModel.get_user_by_id(current_user['user_id'])
        return jsonify({
            "status": "success",
            "message": "Profile updated successfully.",
            "data": {
                "name": updated.get("name"),
                "compliance_factors": {
                    "cleanliness": updated.get("cleanliness"),
                    "discipline":  updated.get("discipline"),
                    "social":      updated.get("social"),
                    "noise":       updated.get("noise"),
                    "sleep":       updated.get("sleep"),
                    "emotional":   updated.get("emotional"),
                }
            }
        }), 200
    except Exception as err:
        print(f"Profile update error: {err}")
        abort(500, description="Failed to update profile.")
