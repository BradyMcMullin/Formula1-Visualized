# Formula 1 Data Explorer 🏎️📊

Welcome to the **Formula 1 Data Explorer**, a comprehensive web application built to analyze and visualize historical F1 data. Created as a Database Systems final project, this platform leverages a robust SQLite backend, a Python/Flask API, and dynamic D3.js data visualizations to uncover deep insights into race strategies, driver performance, and team dominance.

## 🌟 Features & Analyses

The application is broken down into four major analytical modules:

* **Drivers Analytics**
    * **Experience & Longevity:** Visualizations for the most experienced drivers and longest career spans.
    * **Dominance:** Paginated leaderboards for absolute total wins and highest career win percentages.
    * **Racecraft:** Analysis of the "Best Overtakers" based on average positions gained per race.
    * **Demographics:** Historical breakdown of drivers by nationality.
* **Circuits Analytics**
    * **Global Footprint:** An interactive D3 GeoJSON World Map plotting the exact location of every circuit in F1 history.
    * **Track Danger:** Identification of the "Most Dangerous Tracks" based on historical retirement (DNF) rates.
    * **Track Specialists:** Calculation of which drivers perform exceptionally well at specific tracks.
    * **Competitiveness Over Time:** A dynamic scatter/bubble chart analyzing how race unpredictability and overtaking have evolved decade by decade.
* **Seasons & Constructors Analytics**
    * **Unpredictable Seasons:** Ranks historical seasons by the number of unique race winners.
    * **Constructor Dominance:** Analyzes which specific constructors (teams) score the most points in specific host countries.
* **Pit Stop Strategy**
    * Explores the correlation between the number of pit stops and a driver's final finishing position.

## 🛠️ Tech Stack

* **Backend:** Python, Flask
* **Database:** SQLite, Raw SQL Queries
* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6 Modules)
* **Data Visualization:** [D3.js (v7)](https://d3js.org/)
* **Architecture:** RESTful API returning JSON payloads

## 📂 Project Structure

```text
F1-Data-Explorer/
│
├── app.py                      # Main Flask application and API routes
├── formula_db.py               # Database connection and SQL query execution
├── formula.sqlite              # SQLite database containing historical F1 data
│
├── frontend/
│   ├── templates/
│   │   ├── index.html          # Home Page
│   │   ├── pit_stops.html      # Pit Stop Strategy
│   │   ├── drivers.html        # Driver Analytics
│   │   ├── circuits.html       # Circuit Analytics & Map
│   │   └── seasons.html        # Seasons & Constructors Analytics
│   │
│   └── static/
│       ├── css/
│       │   └── style.css       # F1-themed dark mode styling
│       └── js/
│           ├── main.js             # General app logic
│           ├── drivers_main.js     # Driver API fetching
│           ├── drivers_charts.js   # D3 components for Drivers
│           ├── circuits_main.js    # Circuit API fetching
│           ├── circuits_charts.js  # D3 map and bubble charts
│           ├── seasons_main.js     # Seasons API fetching
│           └── seasons_charts.js   # D3 components for Seasons
```

## 🚀 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/f1-data-explorer.git](https://github.com/your-username/f1-data-explorer.git)
   cd f1-data-explorer
   ```

2. **Set up a virtual environment (Optional but recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install Flask
   ```
   *(Note: D3.js is fetched via CDN on the frontend, so no node modules are required).*

4. **Ensure the database is present:**
   Make sure your historical F1 SQLite database file is located in the root directory (or wherever `formula_db.py` points to).

5. **Run the application:**
   ```bash
   python app.py
   ```

6. **View the app:**
   Open your web browser and navigate to `http://127.0.0.1:5000/`.

## 📈 Visualizations Used (D3.js)

To handle the large volume of historical data, this project utilizes custom, highly reusable D3.js components:
* **Paginated Horizontal Bar Charts:** Automatically handles pagination (10 items per page), dynamic domain scaling, and smooth D3 transitions for updating axes and bars.
* **Scatter / Bubble Charts:** Uses X/Y scaling with dynamic minimums (to handle negative position-gained data) and maps a Z-index to bubble radius. Includes hover tooltips.
* **Mercator Projection Map:** Loads standard World GeoJSON and plots lat/long circuit coordinates dynamically, adjusting projections to handle extreme global footprints.

## 🧠 SQL Highlights

This application relies on complex SQL queries utilizing:
* Multi-table `JOIN` operations (Results, Races, Drivers, Circuits, Constructors)
* `WITH` Common Table Expressions (CTEs) for chronological/decade grouping
* Aggregate functions (`SUM`, `AVG`, `COUNT`, `MIN`, `MAX`)
* Conditional aggregations (`CASE WHEN`)
* `HAVING` clauses to filter out statistically insignificant outliers (e.g., minimum of 10 races to qualify as a "Track Specialist").

## 📝 Acknowledgements
* Data inspired by historical Formula 1 records (e.g., the Ergast Developer API dataset).
* Built as a final capstone for Database Systems.