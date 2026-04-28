from flask import Blueprint, jsonify, request, abort
from app.services.laundry_service import LaundryService

laundry_bp = Blueprint('laundry_bp', __name__)

@laundry_bp.route('/slots', methods=['GET'])
def get_slots():
    """ Fetch mapping indicating exactly which 2-hour segments have been globally locked for a given valid Date string """
    date_str = request.args.get('date')
    if not date_str:
        abort(400, description="date query parameter is required (YYYY-MM-DD)")
    
    try:
        available_slots = LaundryService.get_available_slots(date_str)
        return jsonify({"status": "success", "data": available_slots}), 200
    except Exception as e:
        abort(500, description="Internal error fetching slots")

@laundry_bp.route('/book', methods=['POST'])
def book_slot():
    if not request.is_json:
        abort(400, description="Payload must be JSON")
    
    payload = request.get_json()
    user_id = payload.get('user_id')
    booking_date = payload.get('booking_date')
    slot_time = payload.get('slot_time')
    
    if not all([user_id, booking_date, slot_time]):
        abort(400, description="Missing properties: user_id, booking_date, slot_time")
        
    try:
        result = LaundryService.book_slot(user_id, booking_date, slot_time)
        return jsonify({"status": "success", "data": result}), 201
    except ValueError as e:
        abort(409, description=str(e))
    except Exception as e:
        abort(500)

@laundry_bp.route('/scan', methods=['POST'])
def scan_qr():
    """ Called externally natively parsing payload encoded directly into barcode to ensure authentic possession """
    if not request.is_json:
        abort(400, description="Payload must be JSON")
        
    payload = request.get_json()
    qr_data = payload.get('qr_data')
    
    if not qr_data or '_' not in qr_data:
        abort(400, description="Invalid structure binding in scanned code string")
        
    try:
        # Standard decode pattern based on encoding strategy used dynamically
        extracted_booking_id, extracted_user_id = qr_data.split('_')
        result = LaundryService.scan_qr_reservation(extracted_booking_id, extracted_user_id)
        return jsonify({"status": "success", "data": result}), 200
    except ValueError as e:
        abort(403, description=str(e))
    except Exception as e:
        abort(500)

@laundry_bp.route('/my-bookings', methods=['GET'])
def my_bookings():
    user_id = request.args.get('user_id')
    if not user_id:
        abort(400, description="user_id is strictly required")
        
    try:
        result = LaundryService.get_user_bookings(user_id)
        return jsonify({"status": "success", "data": result}), 200
    except Exception as e:
        abort(500)
