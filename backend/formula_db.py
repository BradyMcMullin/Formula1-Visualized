
import sqlite3

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row 
    return conn


"""
-----------------
PIT STOP ANALYSIS
-----------------
"""
def avg_position_per_pit_stop_count():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
                   WITH DriverStops AS (
                        SELECT 
                            r.raceId, 
                            r.driverId, 
                            r.positionOrder, 
                            COUNT(p.stop) AS PitStopsPerRace
                        FROM results AS r
                        JOIN races AS rs on r.raceId = rs.raceId
                        LEFT JOIN pit_stops AS p ON r.raceId = p.raceId AND r.driverId = p.driverId
                        WHERE r.position IS NOT NULL AND rs.year >=2011
                        GROUP BY r.raceId, r.driverId, r.positionOrder
                    )

                    SELECT 
                        PitStopsPerRace,
                        COUNT(driverId) AS TotalOccurrences,
                        AVG(positionOrder) AS AvgFinishingPosition
                    FROM DriverStops
                    GROUP BY PitStopsPerRace
                    ORDER BY PitStopsPerRace;
                   """)
    rows = cursor.fetchall()
    results = [dict(row) for row in rows]
    conn.close()
    return results

def pit_stop_count_per_year():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
                   SELECT 
                        r.year,
                        count(p.stop) AS PitStopCount
                   FROM races AS r
                   JOIN pit_stops AS p ON r.raceId = p.raceId
                   GROUP BY r.year
                   ORDER BY r.year;
                   """)
    rows = cursor.fetchall()
    results = [dict(row) for row in rows]
    conn.close()
    return results

def avg_pit_stop_duration_per_year():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
                    SELECT 
                        r.year,
                        AVG(p.milliseconds/1000) AS AvgPitStopDuration
                    FROM pit_stops AS p
                    JOIN races AS r ON r.raceId = p.raceId
                    WHERE p.milliseconds IS NOT NULL AND p.milliseconds/1000 < 180
                    GROUP BY r.year;
                   """
    )
    rows = cursor.fetchall()
    results = [dict(row) for row in rows]
    conn.close()
    return results

def fastest_pit_crews_by_constructor():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            c.name AS ConstructorName,
            COUNT(p.stop) AS TotalPitStops,
            AVG(p.milliseconds / 1000.0) AS AvgPitStopDuration
        FROM pit_stops AS p
        JOIN results AS r ON p.raceId = r.raceId AND p.driverId = r.driverId
        JOIN constructors AS c ON r.constructorId = c.constructorId
        JOIN races AS rs ON p.raceId = rs.raceId
        WHERE p.milliseconds IS NOT NULL 
          AND p.milliseconds < 40000 -- Cap at 40s to exclude penalties, front-wing changes, or red flags
          AND rs.year >= 2014 -- Focus on the modern Turbo-Hybrid era for relevance
        GROUP BY c.name
        HAVING TotalPitStops > 100 -- Ensure a statistically significant sample size
        ORDER BY AvgPitStopDuration ASC
        LIMIT 10;
    """)
    rows = cursor.fetchall()
    results = [dict(row) for row in rows]
    conn.close()
    return results


"""
----------------
CIRCUIT ANALYSIS
----------------
"""

def total_retirements_by_circuit():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
                    SELECT
                        COUNT(c.circuitId) AS total_retirements,
                        c.circuitRef AS circuit_name
                    FROM results AS r
                    JOIN races AS rs ON rs.raceId = r.raceId
                    JOIN circuits AS c ON rs.circuitId = c.circuitId
                    WHERE r.positionText = "R"
                    GROUP BY c.circuitId
                    ORDER BY Total_Retirements DESC;

                    SELECT
                        c.circuitRef
                    FROM circuits AS c;
                   """)
    rows = cursor.fetchall()
    results = [dict(row) for row in rows]
    conn.close()
    return results

def number_of_races_by_circuit():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
                   SELECT
                        COUNT(c.circuitId) AS total_races,
                        c.circuitRef AS circuit_name
                    FROM races AS rs
                    JOIN circuits AS c ON rs.circuitId = c.circuitId
                    GROUP BY c.circuitId
                    ORDER BY total_races DESC;
                   """)
    rows = cursor.fetchall()
    results = [  dict(row) for row in rows]
    conn.close()
    return results

"""
---------------------------
DRIVER PERFORMANCE ANALYSIS
---------------------------
"""

def driver_with_most_wins():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
                   SELECT 
                        count(*) AS total_wins,
                        d.forename || ' ' || d.surname AS driver_name
                   FROM drivers AS d
                   JOIN results AS r ON d.driverId = r.driverId
                   WHERE r.positionOrder = 1
                   GROUP BY d.driverId
                   ORDER BY total_wins DESC
                   LIMIT 10;
                   """
    )
    rows = cursor.fetchall()
    results = [dict(row) for row in rows]
    conn.close()
    return results

def driver_win_percentage():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            d.forename || ' ' || d.surname AS driver_name,
            COUNT(r.raceId) AS total_races,
            SUM(CASE WHEN r.positionOrder = 1 THEN 1 ELSE 0 END) AS total_wins,
            ROUND((CAST(SUM(CASE WHEN r.positionOrder = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(r.raceId)) * 100, 2) AS win_percentage
        FROM drivers AS d
        JOIN results AS r ON d.driverId = r.driverId
        GROUP BY d.driverId, d.forename, d.surname
        HAVING total_races >= 50 
        ORDER BY win_percentage DESC
        LIMIT 10;
    """)
    rows = cursor.fetchall()
    results = [dict(row) for row in rows]
    conn.close()
    return results

def best_overtakers():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            d.forename || ' ' || d.surname AS driver_name,
            COUNT(r.raceId) AS races_finished,
            SUM(r.grid - r.positionOrder) AS total_positions_gained,
            ROUND(AVG(r.grid - r.positionOrder), 2) AS avg_positions_gained_per_race
        FROM drivers AS d
        JOIN results AS r ON d.driverId = r.driverId
        WHERE r.grid > 0 AND r.positionOrder > 0 -- Exclude pitlane starts and DNFs
        GROUP BY d.driverId, d.forename, d.surname
        HAVING races_finished >= 50
        ORDER BY avg_positions_gained_per_race DESC
        LIMIT 10;
    """)
    rows = cursor.fetchall()
    results = [dict(row) for row in rows]
    conn.close()
    return results

def driver_dataset_summary():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            COUNT(driverId) AS total_drivers,
            COUNT(DISTINCT nationality) AS total_nationalities
        FROM drivers;
    """)
    row = cursor.fetchone() 
    result = dict(row) if row else {}
    conn.close()
    return result

def drivers_by_nationality():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            nationality,
            COUNT(driverId) AS total_drivers
        FROM drivers
        GROUP BY nationality
        ORDER BY total_drivers DESC
        LIMIT 10;
    """)
    rows = cursor.fetchall()
    results = [dict(row) for row in rows]
    conn.close()
    return results

def most_experienced_drivers():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            d.forename || ' ' || d.surname AS driver_name,
            COUNT(r.raceId) AS total_races_entered
        FROM drivers AS d
        JOIN results AS r ON d.driverId = r.driverId
        GROUP BY d.driverId, d.forename, d.surname
        ORDER BY total_races_entered DESC
        LIMIT 10;
    """)
    rows = cursor.fetchall()
    results = [dict(row) for row in rows]
    conn.close()
    return results