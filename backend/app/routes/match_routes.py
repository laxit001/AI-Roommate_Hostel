from flask import Blueprint, jsonify, abort
from app.services.matching_service import MatchingService
from app.utils.jwt import token_required

match_bp = Blueprint('match_bp', __name__)

@match_bp.route('/', methods=['GET'])
@token_required
def get_matches(current_user):
    """ Wrapped natively protecting the engine returning top 5 matches """
    # Natively inject JWT parsed object mapping tracking back to isolated execution
    user_id = current_user['user_id']
    try:
        matches = MatchingService.get_top_matches(user_id)
        return jsonify({
            "status": "success",
            "message": "Top 5 matches retrieved.",
            "data": matches
        }), 200
    except ValueError as e:
        abort(404, description=str(e))
    except Exception as e:
        abort(500, description="Internal server error during cosine pipeline.")
