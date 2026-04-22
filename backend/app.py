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

if __name__ == '__main__':
    app.run(debug=True, port = 5000)