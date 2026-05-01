from app.db import get_db_connection

class ComplaintModel:
    @staticmethod
    def create_complaint(user_id, roommate_id, message):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                sql = "INSERT INTO complaints (user_id, roommate_id, message) VALUES (%s, %s, %s)"
                cursor.execute(sql, (user_id, roommate_id, message))
            connection.commit()
            return cursor.lastrowid
        finally:
            connection.close()

    @staticmethod
    def get_complaints_by_user(user_id):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM complaints WHERE user_id = %s", (user_id,))
                return cursor.fetchall()
        finally:
            connection.close()

    @staticmethod
    def penalize_trust_score(roommate_id, points=5):
        # Resolves automatically decaying reputation on negative complaints
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("UPDATE users SET trust_score = GREATEST(0, trust_score - %s) WHERE user_id = %s", (points, roommate_id))
            connection.commit()
        finally:
            connection.close()
