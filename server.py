from flask import Flask, request, jsonify
from flask_cors import CORS
import swisseph as swe
from datetime import datetime
import os

app = Flask(__name__)
# Enable CORS for all domains
CORS(app, resources={r"/*": {"origins": "*"}})

# Planet mapping
PLANETS = {
    0: "Sun",
    1: "Moon",
    2: "Mercury",
    3: "Venus",
    4: "Mars",
    5: "Jupiter",
    6: "Saturn",
    11: "True Node"
}

# Zodiac signs
SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 
    'Leo', 'Virgo', 'Libra', 'Scorpio', 
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
]

def calculate_planet_position(julian_day, planet_id):
    """Calculate position for a specific planet."""
    try:
        # Calculate planet position using basic calculations
        flag = swe.FLG_SWIEPH
        position = swe.calc_ut(julian_day, planet_id, flag)[0]
        
        # Get longitude
        longitude = position[0]
        
        # Calculate sign and degrees
        sign_num = int(longitude / 30)
        degrees = int(longitude % 30)
        minutes = int((longitude % 1) * 60)
        seconds = int(((longitude % 1) * 60 % 1) * 60)
        
        return {
            "name": PLANETS[planet_id],
            "sign": SIGNS[sign_num],
            "degrees": degrees,
            "minutes": minutes,
            "seconds": seconds,
            "absolute_position": longitude
        }
    except Exception as e:
        return {"error": str(e)}

@app.route('/calculate', methods=['POST'])
def calculate_positions():
    try:
        data = request.get_json()
        date_str = data.get('date')
        
        if not date_str:
            return jsonify({"error": "Date is required"}), 400
        
        # Convert date string to Julian Day
        date = datetime.strptime(date_str, '%Y-%m-%d')
        julian_day = swe.julday(date.year, date.month, date.day, 0)
        
        # Calculate positions for all planets
        results = []
        for planet_id in PLANETS.keys():
            position = calculate_planet_position(julian_day, planet_id)
            results.append(position)
        
        return jsonify(results)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

@app.route('/', methods=['GET'])
def root():
    return jsonify({"message": "Swisseph API is running"}), 200

if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    # Important: Listen on all interfaces
    app.run(host='0.0.0.0', port=port)
