from flask import jsonify

def register_error_handlers(app):
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            "error": "Bad Request",
            "message": getattr(error, 'description', 'The request could not be processed due to invalid payload.')
        }), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            "error": "Unauthorized",
            "message": "Authentication is required to access this resource."
        }), 401
        
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "error": "Not Found",
            "message": "The requested endpoint was not found on this server."
        }), 404

    @app.errorhandler(409)
    def conflict(error):
        return jsonify({
            "error": "Conflict",
            "message": getattr(error, 'description', 'Resource already exists or conflict occurred.')
        }), 409

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "error": "Internal Server Error",
            "message": "An unexpected error occurred while processing your request."
        }), 500
