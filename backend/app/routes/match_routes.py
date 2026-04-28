from flask import Blueprint, jsonify, abort
from app.services.matching_service import MatchingService

match_bp = Blueprint('match_bp', __name__)

@match_bp.route('/matches/<int:user_id>', methods=['GET'])
def get_user_matches(user_id):
    """
    Returns the top 5 optimal roommate matches for a given user id.
    """
    try:
        matches = MatchingService.get_top_matches(user_id)
        return jsonify({
            "status": "success",
            "target_user_id": user_id,
            "top_matches": matches
        }), 200
        
    except ValueError as ve:
        # User not found
        abort(404, description=str(ve))
    except Exception as e:
        print(f"Error fetching matches: {e}")
        abort(500)
