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

# --- PAGE ROUTES ---
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/pit-stops')
def pit_stops_page():
    return render_template('pit_stops.html')

# --- API ROUTES ---
@app.route('/api/pit-stop-correlation')
def get_pit_stop_correlation():
    try:
        data = formula_db.avg_position_per_pit_stop_count()

        return jsonify(data)
    except Exception as e:
        print(f"Error fetching pit stop correlation data: {e}")
        return jsonify({"error": "Failed to fetch data"}), 500

app.route('/api/pit-stops-per-year')
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

if __name__ == '__main__':
    app.run(debug=True, port = 5000)