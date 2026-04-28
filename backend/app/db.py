import pymysql
from app.config import Config

# Connection pool pattern or simply a connection factory.
# For simplicity and thread-safety in Flask, we create a new connection per request 
# or use a global config approach. PyMySQL native connections.

def get_db_connection():
    """
    Returns a PyMySQL database connection instance.
    """
    connection = pymysql.connect(
        host=Config.DB_HOST,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME,
        port=Config.DB_PORT,
        cursorclass=pymysql.cursors.DictCursor
    )
    return connection
