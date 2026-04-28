class VectorService:
    """
    Holds the deterministic logic for converting raw game interaction variables 
    into standard psychological traits mapping.
    
    Parameters expected scale: 0.0 to 1.0 continuously or bounded mapping.
    Vectors to generate out: cleanliness, discipline, social, noise, sleep, emotional, trust_score
    """

    @staticmethod
    def calculate_vector(game_inputs):
        """
        Translates raw interaction points from the game to the unified roommate psychological vector.
        
        :param game_inputs: dict of raw game characteristics
                            e.g. {'room_choice': 0.8, 'sleep': 0.5, 'noise': 0.2, 'planning': 0.9, 'conflict': 0.7}
        :return: dict of calculated vector mapping 0.0 - 1.0 (float)
        """
        
        # Extracted inputs
        # Assuming inputs are already validated and bounded 0 to 10
        room_choice = game_inputs.get('room_choice', 0)     # e.g. Tidy (10) vs Messy (0)
        sleep_pref = game_inputs.get('sleep', 0)            # e.g. Early Bird (10) vs Night Owl (0)
        noise_tolerance = game_inputs.get('noise', 0)       # e.g. Loud (10) vs Quiet (0)
        planning = game_inputs.get('planning', 0)           # e.g. Strict Planner (10) vs Spontaneous (0)
        conflict_reso = game_inputs.get('conflict', 0)      # e.g. Calm (10) vs Aggressive (0)
        
        # Example Business Logic Rules mapping game events to vector outputs:
        # cleanliness heavily relies on 'room_choice'
        cleanliness = room_choice 
        
        # discipline stems from both planning and room_choice (organization aspects)
        discipline = (planning * 0.7) + (room_choice * 0.3)
        
        # social relates to noise tolerance and inverse of strict planning
        social = (noise_tolerance * 0.6) + ((10 - planning) * 0.4)
        
        # noise maps directly
        noise = noise_tolerance
        
        # sleep maps directly 
        sleep = sleep_pref
        
        # emotional relates to conflict resolution and planning stress
        emotional = (conflict_reso * 0.8) + (planning * 0.2)
        
        # trust_score can be derived from the consistency logic (e.g. baseline or game honesty element)
        # We simplify it by using conflict resilience and planning predictability
        trust_score = (conflict_reso * 0.5) + (planning * 0.5)

        # Normalize boundaries (ensuring they remain 0 to 10 scale hypothetically, depending on frontend sending max 10)
        vector = {
            'cleanliness': round(min(max(cleanliness, 0), 10), 2),
            'discipline': round(min(max(discipline, 0), 10), 2),
            'social': round(min(max(social, 0), 10), 2),
            'noise': round(min(max(noise, 0), 10), 2),
            'sleep': round(min(max(sleep, 0), 10), 2),
            'emotional': round(min(max(emotional, 0), 10), 2),
            'trust_score': round(min(max(trust_score, 0), 10), 2)
        }
        
        return vector
