from app.db import get_db_connection

class UserModel:
    """
    Data Access Object for the `users` table.
    """
    
    @staticmethod
    def create_user(user_data):
        """
        Inserts a newly converted user and their vector into the database.
        
        :param user_data: dict containing name, email, and the 7 psychological parameters.
        :return: user_id (int) that was just inserted, or None if error.
        """
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                sql = """
                    INSERT INTO users (
                        name, email, cleanliness, discipline, 
                        social, noise, sleep, emotional, trust_score
                    ) VALUES (
                        %(name)s, %(email)s, %(cleanliness)s, %(discipline)s, 
                        %(social)s, %(noise)s, %(sleep)s, %(emotional)s, %(trust_score)s
                    )
                """
                cursor.execute(sql, user_data)
            connection.commit()
            return cursor.lastrowid
        except Exception as e:
            # Here we could log the exception.
            connection.rollback()
            raise e
        finally:
            connection.close()

    @staticmethod
    def get_user_by_email(email):
        """
        Retrieves a user by email.
        """
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                sql = "SELECT * FROM users WHERE email = %s"
                cursor.execute(sql, (email,))
                result = cursor.fetchone()
                return result
        finally:
            connection.close()

    @staticmethod
    def get_user_by_id(user_id):
        """
        Retrieves a user by ID.
        """
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                sql = "SELECT * FROM users WHERE user_id = %s"
                cursor.execute(sql, (user_id,))
                return cursor.fetchone()
        finally:
            connection.close()

    @staticmethod
    def get_all_users():
        """
        Retrieves all users from the database.
        """
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                sql = "SELECT * FROM users"
                cursor.execute(sql)
                return cursor.fetchall()
        finally:
            connection.close()

    @staticmethod
    def update_user_stats(user_id, trust_score, confidence_score, complaints_count, penalty_level):
        """
        Updates the trust and behavioral variables for a user.  
        """
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                sql = """
                    UPDATE users 
                    SET trust_score = %s, 
                        confidence_score = %s,
                        complaints_count = %s,
                        penalty_level = %s
                    WHERE user_id = %s
                """
                cursor.execute(sql, (trust_score, confidence_score, complaints_count, penalty_level, user_id))
            connection.commit()
        finally:
            connection.close()
