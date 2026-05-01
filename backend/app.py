import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import formula_db

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, '..', 'frontend')

app = Flask(
    __name__,
    template_folder = os.path.join(FRONTEND_DIR, 'templates'),
    static_folder = os.path.join(FRONTEND_DIR, 'static')
)

# CORS(app) # Optional: uncomment if you need Cross-Origin Resource Sharing

# ==========================================
# --- PAGE ROUTES ---
# ==========================================

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/pit-stops')
def pit_stops_page():
    return render_template('pit_stops.html')

@app.route('/drivers')
def drivers_page():
    return render_template('drivers.html')

@app.route('/circuits')
def circuits_page():
    return render_template('circuits.html')

@app.route('/seasons')
def seasons_page():
    return render_template('seasons.html')


# ==========================================
# --- API ROUTES: PIT STOPS ---
# ==========================================

@app.route('/api/pit-stop-correlation')
def get_pit_stop_correlation():
    try:
        data = formula_db.avg_position_per_pit_stop_count()
        return jsonify(data)
    except Exception as e:
        print(f"Error fetching pit stop correlation data: {e}")
        return jsonify({"error": "Failed to fetch data"}), 500

@app.route('/api/pit-stops-per-year')
def get_pit_stops_per_year():
    try:
        data = formula_db.pit_stop_count_per_year()
        return jsonify(data)
    except Exception as e:
        print(f"Error fetching pit stops per year data: {e}")
        return jsonify({"error": "Failed to fetch data"}), 500

@app.route('/api/avg-pit-stop-duration')
def get_avg_pit_stop_duration():
    try:
        data = formula_db.avg_pit_stop_duration_per_year()
        return jsonify(data)
    except Exception as e:
        print(f"Error fetching avg pit stop duration data: {e}")
        return jsonify({"error": "Failed to fetch data"}), 500

@app.route('/api/fastest-pit-crews')
def get_fastest_pit_crews():
    try:
        data = formula_db.fastest_pit_crews_by_constructor()
        return jsonify(data)
    except Exception as e:
        print(f"Error fetching fastest pit crews data: {e}")
        return jsonify({"error": "Failed to fetch data"}), 500


# ==========================================
# --- API ROUTES: DRIVERS ---
# ==========================================

@app.route('/api/drivers/most-wins')
def get_driver_most_wins():
    try:
        data = formula_db.driver_with_most_wins()
        return jsonify(data)
    except Exception as e:
        print(f"Error fetching most wins data: {e}")
        return jsonify({"error": "Failed to fetch data"}), 500

@app.route('/api/drivers/win-percentage')
def get_driver_win_percentage():
    try:
        data = formula_db.driver_win_percentage()
        return jsonify(data)
    except Exception as e:
        print(f"Error fetching win percentage data: {e}")
        return jsonify({"error": "Failed to fetch data"}), 500

@app.route('/api/drivers/best-overtakers')
def get_best_overtakers():
    try:
        data = formula_db.best_overtakers()
        return jsonify(data)
    except Exception as e:
        print(f"Error fetching best overtakers data: {e}")
        return jsonify({"error": "Failed to fetch data"}), 500

@app.route('/api/drivers/dataset-summary')
def get_driver_dataset_summary():
    try:
        data = formula_db.driver_dataset_summary()
        return jsonify(data)
    except Exception as e:
        print(f"Error fetching driver dataset summary: {e}")
        return jsonify({"error": "Failed to fetch data"}), 500

@app.route('/api/drivers/nationality')
def get_drivers_by_nationality():
    try:
        data = formula_db.drivers_by_nationality()
        return jsonify(data)
    except Exception as e:
        print(f"Error fetching drivers by nationality data: {e}")
        return jsonify({"error": "Failed to fetch data"}), 500

@app.route('/api/drivers/most-experienced')
def get_most_experienced_drivers():
    try:
        data = formula_db.most_experienced_drivers()
        return jsonify(data)
    except Exception as e:
        print(f"Error fetching most experienced drivers data: {e}")
        return jsonify({"error": "Failed to fetch data"}), 500

@app.route('/api/drivers/career-length')
def get_drivers_by_career_length():
    try:
        data = formula_db.drivers_by_career_length()
        return jsonify(data)
    except Exception as e:
        print(f"Error fetching drivers by career length data: {e}")
        return jsonify({"error": "Failed to fetch data"}), 500


# ==========================================
# --- API ROUTES: CIRCUITS ---
# ==========================================

@app.route('/api/circuits/locations')
def circuit_locations():
    try:
        data = formula_db.get_circuit_locations()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/circuits/retirements')
def get_total_retirements_by_circuit():
    try:
        data = formula_db.total_retirements_by_circuit()
        return jsonify(data)
    except Exception as e:
        print(f"Error fetching retirements by circuit: {e}")
        return jsonify({"error": "Failed to fetch data"}), 500

@app.route('/api/circuits/races')
def get_number_of_races_by_circuit():
    try:
        data = formula_db.number_of_races_by_circuit()
        return jsonify(data)
    except Exception as e:
        print(f"Error fetching races by circuit: {e}")
        return jsonify({"error": "Failed to fetch data"}), 500

@app.route('/api/circuits/countries')
def get_countries_by_circuits_hosted():
    try:
        data = formula_db.countries_by_circuits_hosted()
        return jsonify(data)
    except Exception as e:
        print(f"Error fetching countries by circuits hosted: {e}")
        return jsonify({"error": "Failed to fetch data"}), 500

@app.route('/api/circuits/highest-avg-finish')
def get_highest_avg_finishing_position_by_circuit():
    try:
        data = formula_db.highest_average_finishing_position_by_circuit()
        return jsonify(data)
    except Exception as e:
        print(f"Error fetching highest avg finish by circuit: {e}")
        return jsonify({"error": "Failed to fetch data"}), 500

@app.route('/api/circuits/competitiveness')
def get_competitiveness_over_time():
    try:
        data = formula_db.competitiveness_over_time()
        return jsonify(data)
    except Exception as e:
        print(f"Error fetching competitiveness over time: {e}")
        return jsonify({"error": "Failed to fetch data"}), 500


# ==========================================
# --- API ROUTES: SEASONS & CONSTRUCTORS ---
# ==========================================

@app.route('/api/seasons/most-winners')
def get_year_with_most_winners():
    try:
        data = formula_db.year_with_most_winners()
        return jsonify(data)
    except Exception as e:
        print(f"Error fetching year with most winners: {e}")
        return jsonify({"error": "Failed to fetch data"}), 500

@app.route('/api/seasons/constructor-points')
def get_constructor_points_scored_by_country():
    try:
        data = formula_db.constructor_points_scored_by_country()
        return jsonify(data)
    except Exception as e:
        print(f"Error fetching constructor points by country: {e}")
        return jsonify({"error": "Failed to fetch data"}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)