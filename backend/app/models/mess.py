from app.db import get_db_connection

class MessModel:
    @staticmethod
    def get_menu_by_day(day_of_week):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM mess_menu WHERE day_of_week = %s", (day_of_week,))
                return cursor.fetchall()
        finally:
            connection.close()
            
    @staticmethod
    def create_booking(user_id, booking_date, meal_type):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                sql = """
                    INSERT INTO mess_bookings (user_id, booking_date, meal_type) 
                    VALUES (%s, %s, %s)
                """
                cursor.execute(sql, (user_id, booking_date, meal_type))
            connection.commit()
            return cursor.lastrowid
        finally:
            connection.close()
            
    @staticmethod
    def get_user_bookings(user_id):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM mess_bookings WHERE user_id = %s ORDER BY booking_date DESC, meal_type", (user_id,))
                return cursor.fetchall()
        finally:
            connection.close()
