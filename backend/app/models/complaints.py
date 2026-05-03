from app.db import get_db_connection


class ComplaintModel:

    @staticmethod
    def create_complaint(user_id, roommate_id, message):
        """Inserts a new complaint record."""
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
        """Returns all complaints filed BY the given user."""
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM complaints WHERE user_id = %s ORDER BY created_at DESC",
                    (user_id,)
                )
                return cursor.fetchall()
        finally:
            connection.close()

    @staticmethod
    def count_complaints_against(roommate_id):
        """Returns total number of complaints filed AGAINST a user."""
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT COUNT(*) as cnt FROM complaints WHERE roommate_id = %s",
                    (roommate_id,)
                )
                row = cursor.fetchone()
                return row['cnt'] if row else 0
        finally:
            connection.close()

    @staticmethod
    def penalize_trust_score(roommate_id, points=5):
        """
        Decrements trust score by `points` and recalculates penalty_level
        based on total complaints received:
          - 1-2 complaints  → penalty_level 1 (visibility -20%)
          - 3-5 complaints  → penalty_level 2 (visibility -50%)
          - 6+ complaints   → penalty_level 3 (excluded from matches)
        """
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                # Decrement trust score (floor at 0)
                cursor.execute(
                    "UPDATE users SET trust_score = GREATEST(0, trust_score - %s) WHERE user_id = %s",
                    (points, roommate_id)
                )
                # Count total complaints against this user
                cursor.execute(
                    "SELECT COUNT(*) as cnt FROM complaints WHERE roommate_id = %s",
                    (roommate_id,)
                )
                row = cursor.fetchone()
                total_complaints = row['cnt'] if row else 0

                # Determine penalty level
                if total_complaints >= 6:
                    penalty_level = 3
                elif total_complaints >= 3:
                    penalty_level = 2
                elif total_complaints >= 1:
                    penalty_level = 1
                else:
                    penalty_level = 0

                cursor.execute(
                    "UPDATE users SET complaints_count = %s, penalty_level = %s WHERE user_id = %s",
                    (total_complaints, penalty_level, roommate_id)
                )
            connection.commit()
        finally:
            connection.close()
