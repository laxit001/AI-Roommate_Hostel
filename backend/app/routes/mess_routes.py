from flask import Blueprint, jsonify, request, abort
from app.services.mess_service import MessService
from app.utils.jwt import token_required

mess_bp = Blueprint('mess_bp', __name__)


@mess_bp.route('/menu', methods=['GET'])
def get_menu():
    """Returns the menu for a given day of the week. Public endpoint."""
    day = request.args.get('day_of_week', 'Monday')
    valid_days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    if day not in valid_days:
        abort(400, description=f"Invalid day. Must be one of: {valid_days}")
    try:
        menu = MessService.get_menu(day)
        return jsonify({"status": "success", "data": menu}), 200
    except Exception as e:
        print(f"Menu fetch error: {e}")
        abort(500)


@mess_bp.route('/book', methods=['POST'])
@token_required
def book_meal(current_user):
    """Books a meal for the authenticated user. Prevents duplicate bookings."""
    if not request.is_json:
        abort(400, description="Payload must be JSON")

    payload = request.get_json()
    booking_date = payload.get('booking_date')  # YYYY-MM-DD
    meal_type = payload.get('meal_type')

    if not all([booking_date, meal_type]):
        abort(400, description="Missing required fields: booking_date, meal_type")

    try:
        result = MessService.book_meal(current_user['user_id'], booking_date, meal_type)
        return jsonify({"status": "success", "data": result}), 201
    except ValueError as ve:
        abort(409, description=str(ve))
    except Exception as e:
        print(f"Mess booking error: {e}")
        abort(500, description="Internal server error")


@mess_bp.route('/bookings', methods=['GET'])
@token_required
def get_bookings(current_user):
    """Returns all mess bookings for the authenticated user."""
    try:
        bookings = MessService.get_user_bookings(current_user['user_id'])
        return jsonify({"status": "success", "data": bookings}), 200
    except Exception as e:
        print(f"Bookings fetch error: {e}")
        abort(500)


@mess_bp.route('/today', methods=['GET'])
@token_required
def get_today_summary(current_user):
    """Returns today's menu + which meals the user has already booked."""
    from datetime import date
    import calendar
    today = date.today()
    day_name = calendar.day_name[today.weekday()]
    date_str = today.strftime('%Y-%m-%d')

    try:
        menu = MessService.get_menu(day_name)
        all_bookings = MessService.get_user_bookings(current_user['user_id'])
        today_booked = [b['meal_type'] for b in all_bookings if b['booking_date'] == date_str]

        result = []
        for item in menu:
            result.append({
                "meal_type": item['meal_type'],
                "items":     item['items'],
                "booked":    item['meal_type'] in today_booked
            })

        return jsonify({
            "status": "success",
            "data": {
                "day": day_name,
                "date": date_str,
                "menu": result
            }
        }), 200
    except Exception as e:
        print(f"Today summary error: {e}")
        abort(500)
