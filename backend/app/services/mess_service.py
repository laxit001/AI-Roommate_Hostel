from app.models.mess import MessModel
import pymysql

class MessService:
    @staticmethod
    def get_menu(day_of_week):
        return MessModel.get_menu_by_day(day_of_week)

    @staticmethod
    def get_user_bookings(user_id):    
        bookings = MessModel.get_user_bookings(user_id)
        # Format dates visually for API transmission
        for b in bookings:
            b['booking_date'] = b['booking_date'].strftime('%Y-%m-%d')
            b['booked_at'] = b['booked_at'].strftime('%Y-%m-%d %H:%M:%S')
        return bookings

    @staticmethod
    def book_meal(user_id, booking_date, meal_type):
        valid_meals = ['Breakfast', 'Lunch', 'Dinner']
        if meal_type not in valid_meals:
            raise ValueError(f"Invalid meal type. Permitted values: {valid_meals}")
            
        try:
            booking_id = MessModel.create_booking(user_id, booking_date, meal_type)
            return {"booking_id": booking_id, "status": "Booked"}
        except pymysql.err.IntegrityError:
            # We strictly enforce Unique Constrains in the SQL natively. If it clashes, it enters here.
            raise ValueError("Duplicate Booking detected: You have already booked this specific meal sequence for this date.")
