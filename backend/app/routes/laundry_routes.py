from flask import Blueprint, jsonify, request, abort
from app.services.laundry_service import LaundryService
from app.utils.jwt import token_required

laundry_bp = Blueprint('laundry_bp', __name__)


@laundry_bp.route('/slots', methods=['GET'])
@token_required
def get_slots(current_user):
    """Returns availability for all laundry slots on a given date."""
    date_str = request.args.get('date')
    if not date_str:
        abort(400, description="date query parameter is required (YYYY-MM-DD)")
    try:
        available_slots = LaundryService.get_available_slots(date_str)
        return jsonify({"status": "success", "data": available_slots}), 200
    except Exception as e:
        print(f"Slot fetch error: {e}")
        abort(500, description="Internal error fetching slots")


@laundry_bp.route('/book', methods=['POST'])
@token_required
def book_slot(current_user):
    """Books a laundry slot for the authenticated user."""
    if not request.is_json:
        abort(400, description="Payload must be JSON")

    payload = request.get_json()
    booking_date = payload.get('booking_date')
    slot_time = payload.get('slot_time')

    if not all([booking_date, slot_time]):
        abort(400, description="Missing required fields: booking_date, slot_time")

    try:
        result = LaundryService.book_slot(current_user['user_id'], booking_date, slot_time)
        return jsonify({"status": "success", "data": result}), 201
    except ValueError as e:
        abort(409, description=str(e))
    except Exception as e:
        print(f"Laundry booking error: {e}")
        abort(500)


@laundry_bp.route('/scan', methods=['POST'])
@token_required
def scan_qr(current_user):
    """Validates a scanned QR code and marks the booking as scanned."""
    if not request.is_json:
        abort(400, description="Payload must be JSON")

    payload = request.get_json()
    qr_data = payload.get('qr_data')

    if not qr_data or '_' not in qr_data:
        abort(400, description="Invalid QR code format")

    try:
        parts = qr_data.split('_')
        extracted_booking_id = parts[0]
        extracted_user_id = parts[1]
        result = LaundryService.scan_qr_reservation(extracted_booking_id, extracted_user_id)
        return jsonify({"status": "success", "data": result}), 200
    except ValueError as e:
        abort(403, description=str(e))
    except Exception as e:
        print(f"QR scan error: {e}")
        abort(500)


@laundry_bp.route('/my-bookings', methods=['GET'])
@token_required
def my_bookings(current_user):
    """Returns all laundry bookings for the authenticated user."""
    try:
        result = LaundryService.get_user_bookings(current_user['user_id'])
        return jsonify({"status": "success", "data": result}), 200
    except Exception as e:
        print(f"Laundry bookings fetch error: {e}")
        abort(500)
