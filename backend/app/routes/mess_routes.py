from flask import Blueprint, jsonify, request, abort
from app.services.mess_service import MessService

mess_bp = Blueprint('mess_bp', __name__)

@mess_bp.route('/book', methods=['POST'])
def book_meal():
    """ Enrolls user into a meal segment matching the date and prevents duplicates locally """
    if not request.is_json:
        abort(400, description="Payload must be JSON")
    
    payload = request.get_json()
    user_id = payload.get('user_id')
    booking_date = payload.get('booking_date')  # ISO Date YYYY-MM-DD
    meal_type = payload.get('meal_type')
    
    if not all([user_id, booking_date, meal_type]):
        abort(400, description="Missing required fields: user_id, booking_date, meal_type")
        
    try:
        result = MessService.book_meal(user_id, booking_date, meal_type)
        return jsonify({"status": "success", "data": result}), 201
    except ValueError as ve:
        # Expected collision on duplicate Unique Booking constraint handled cleanly
        abort(409, description=str(ve))
    except Exception as e:
        abort(500, description="Internal server error")

@mess_bp.route('/menu', methods=['GET'])
def get_menu():
    """ Serves up matching templates configured in DB for particular week days """
    day = request.args.get('day_of_week', 'Monday')
    try:
        menu = MessService.get_menu(day)
        return jsonify({"status": "success", "data": menu}), 200
    except Exception as e:
        abort(500)

@mess_bp.route('/bookings', methods=['GET'])
def get_bookings():
    """ Sweeps all historical booking references natively mapped to account ID """
    user_id = request.args.get('user_id')
    if not user_id:
        abort(400, description="user_id query param is required")
        
    try:
        bookings = MessService.get_user_bookings(user_id)
        return jsonify({"status": "success", "data": bookings}), 200
    except Exception as e:
        abort(500)
