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
    def get_user_by_email(email):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
                return cursor.fetchone()
        finally:
            connection.close()
            
    @staticmethod
    def create_auth_user(name, email, google_id, is_verified):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                sql = "INSERT INTO users (name, email, google_id, is_verified) VALUES (%s, %s, %s, %s)"
                cursor.execute(sql, (name, email, google_id, is_verified))
            connection.commit()
            return cursor.lastrowid
        finally:
            connection.close()

    @staticmethod
    def set_user_verified(user_id):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("UPDATE users SET is_verified = TRUE WHERE user_id = %s", (user_id,))
            connection.commit()
        finally:
            connection.close()

    @staticmethod
    def update_google_id(user_id, google_id):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("UPDATE users SET google_id = %s WHERE user_id = %s", (google_id, user_id))
            connection.commit()
        finally:
            connection.close()

    @staticmethod
    def store_otp(email, hashed_otp, expires_at):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                 cursor.execute("INSERT INTO otp_codes (email, hashed_otp, expires_at) VALUES (%s, %s, %s)", (email, hashed_otp, expires_at))
            connection.commit()
        finally:
            connection.close()
            
    @staticmethod
    def get_latest_otp(email):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                 cursor.execute("SELECT * FROM otp_codes WHERE email = %s ORDER BY created_at DESC LIMIT 1", (email,))
                 return cursor.fetchone()
        finally:
            connection.close()
            
    @staticmethod
    def update_user_profile(user_id, name, c, d, so, n, sl, e):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                sql = """
                UPDATE users 
                SET name=%s, cleanliness=%s, discipline=%s, social=%s, noise=%s, sleep=%s, emotional=%s
                WHERE user_id=%s
                """
                cursor.execute(sql, (name, c, d, so, n, sl, e, user_id))
            connection.commit()
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
