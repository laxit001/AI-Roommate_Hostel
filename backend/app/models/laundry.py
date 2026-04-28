from app.db import get_db_connection

class LaundryModel:
    @staticmethod
    def get_booked_slots(booking_date):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT slot_time FROM laundry_bookings WHERE booking_date = %s", (booking_date,))
                rows = cursor.fetchall()
                # Return primitive array mapping active slot times mapping directly
                return [row['slot_time'] for row in rows]
        finally:
            connection.close()
            
    @staticmethod
    def get_user_bookings(user_id):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM laundry_bookings WHERE user_id = %s ORDER BY booking_date DESC, slot_time ASC", (user_id,))
                return cursor.fetchall()
        finally:
            connection.close()
            
    @staticmethod
    def create_booking(user_id, booking_date, slot_time):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                sql = """
                    INSERT INTO laundry_bookings (user_id, booking_date, slot_time, status) 
                    VALUES (%s, %s, %s, 'booked')
                """
                cursor.execute(sql, (user_id, booking_date, slot_time))
            connection.commit()
            return cursor.lastrowid
        finally:
            connection.close()

    @staticmethod
    def update_booking_status(booking_id, status):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                sql = "UPDATE laundry_bookings SET status = %s WHERE booking_id = %s"
                cursor.execute(sql, (status, booking_id))
            connection.commit()
            return cursor.rowcount > 0
        finally:
            connection.close()
            
    @staticmethod
    def get_booking_by_id(booking_id):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM laundry_bookings WHERE booking_id = %s", (booking_id,))
                return cursor.fetchone()
        finally:
            connection.close()
