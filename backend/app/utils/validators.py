def validate_game_payload(payload):
    """
    Validates that all required fields are present in the JSON payload and are of the right type.
    """
    if not payload:
        return False, "Payload must be a valid JSON object."
        
    required_fields = ['name', 'email', 'room_choice', 'sleep', 'noise', 'planning', 'conflict']
    
    missing = [field for field in required_fields if field not in payload]
    if missing:
        return False, f"Missing required fields: {', '.join(missing)}"
        
    # Optional further validation: check types and bounds (e.g., between 0 and 10)
    numeric_fields = ['room_choice', 'sleep', 'noise', 'planning', 'conflict']
    for field in numeric_fields:
        try:
            val = float(payload[field])
            if val < 0 or val > 10:
                return False, f"Field '{field}' must be between 0 and 10."
        except (ValueError, TypeError):
            return False, f"Field '{field}' must be a numeric value."
            
    return True, "Valid"
