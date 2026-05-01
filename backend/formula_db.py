import sqlite3

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row 
    return conn

def get_query(query):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(query)
    rows = cursor.fetchall()
    results = [dict(row) for row in rows]
    conn.close()
    return results

"""
-----------------
PIT STOP ANALYSIS
-----------------
Focuses on the pit_stops table, pit durations, and their effect on the race.
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
          AND p.milliseconds < 40000 
          AND rs.year >= 2014
        GROUP BY c.name
        HAVING TotalPitStops > 100 
        ORDER BY AvgPitStopDuration ASC;
    """)
    rows = cursor.fetchall()
    results = [dict(row) for row in rows]
    conn.close()
    return results


"""
----------------
CIRCUIT ANALYSIS
----------------
Focuses on the geographic data, circuit history, and circuit-specific metrics.
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
    results = [ dict(row) for row in rows]
    conn.close()
    return results

def countries_by_circuits_hosted():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
                    SELECT 
                        c.country,
                        COUNT(DISTINCT c.circuitId) AS circuits_hosted
                    FROM circuits c
                    JOIN races ra ON c.circuitId = ra.circuitId
                    GROUP BY c.country
                    ORDER BY circuits_hosted DESC
                    LIMIT 100;
                   """)
    rows = cursor.fetchall()
    results = [dict(row) for row in rows]
    conn.close()
    return results

def highest_average_finishing_position_by_circuit():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            d.forename || ' ' || d.surname AS driver,
            c.name AS circuit,
            COUNT(*) AS starts,
            ROUND(AVG(r.positionOrder), 2) AS avg_finish
        FROM results AS r
        JOIN races AS ra ON r.raceId = ra.raceId
        JOIN circuits AS c ON ra.circuitId = c.circuitId
        JOIN drivers AS d ON r.driverId = d.driverId
        WHERE r.positionOrder IS NOT NULL
        GROUP BY r.driverId, c.circuitId
        HAVING starts >= 10
        ORDER BY avg_finish ASC
        LIMIT 150;
                   """)
    rows = cursor.fetchall()
    results = [dict(row) for row in rows]
    conn.close()
    return results

def competitiveness_over_time():
    query = """
                WITH decade_circuit AS (
                SELECT
                    ra.circuitId,
                    (ra.year / 10) * 10 AS decade,
                    COUNT(DISTINCT CASE WHEN r.position = 1 THEN r.driverId END) AS unique_winners,
                    COUNT(DISTINCT ra.raceId) AS races_held,
                    ROUND(AVG(r.grid - r.positionOrder), 2) AS avg_positions_gained
                FROM results r
                JOIN races ra ON r.raceId = ra.raceId
                WHERE r.grid > 0 AND r.positionOrder > 0
                GROUP BY ra.circuitId, decade
                HAVING races_held >= 2
            )
            SELECT
                circuitId,
                decade,
                unique_winners,
                races_held,
                avg_positions_gained,
                ROUND(CAST(unique_winners AS FLOAT) / races_held, 2) AS winner_diversity_ratio
            FROM decade_circuit
            ORDER BY circuitId, decade;
            """
    return get_query(query)

def get_circuit_locations():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            name AS circuit_name,
            location,
            country,
            lat,
            lng
        FROM circuits
        WHERE lat IS NOT NULL AND lng IS NOT NULL;
    """)
    rows = cursor.fetchall()
    results = [dict(row) for row in rows]
    conn.close()
    return results


"""
---------------------------
DRIVER PERFORMANCE ANALYSIS
---------------------------
Focuses on individual driver metrics, demographics, and career stats.
"""

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
        ORDER BY total_drivers DESC;
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
        ORDER BY total_races_entered DESC;
    """)
    rows = cursor.fetchall()
    results = [dict(row) for row in rows]
    conn.close()
    return results

def drivers_by_career_length():
    query = """
            SELECT
                d.forename || ' ' || d.surname AS driver_name,
                MIN(ra.year) AS first_year,
                MAX(ra.year) AS last_year,
                (MAX(ra.year) - MIN(ra.year)) AS career_length_years,
                COUNT(r.raceId) AS total_races
            FROM drivers d
            JOIN results r ON d.driverId = r.driverId
            JOIN races ra ON r.raceId = ra.raceId
            GROUP BY d.driverId
            ORDER BY career_length_years DESC;
            """
    return get_query(query)

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
                   ORDER BY total_wins DESC;
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
        ORDER BY win_percentage DESC;
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
        WHERE r.grid > 0 AND r.positionOrder > 0 
        GROUP BY d.driverId, d.forename, d.surname
        HAVING races_finished >= 50
        ORDER BY avg_positions_gained_per_race DESC;
    """)
    rows = cursor.fetchall()
    results = [dict(row) for row in rows]
    conn.close()
    return results


"""
---------------------------
SEASON & CONSTRUCTOR ANALYSIS
---------------------------
Focuses on overall seasons, team dominance, and general trends.
"""

def year_with_most_winners():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
            SELECT 
                ra.year,
                COUNT(DISTINCT r.driverId) AS unique_winners
            FROM results r
            JOIN races ra ON r.raceId = ra.raceId
            WHERE r.position = 1
            GROUP BY ra.year
            ORDER BY unique_winners DESC
                   """)
    rows = cursor.fetchall()
    results = [dict(row) for row in rows]
    conn.close()
    return results

def constructor_points_scored_by_country():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
 SELECT 
                c.country AS host_country,
                co.name AS constructor_name,
                SUM(r.points) AS total_points
            FROM results r
            JOIN races ra ON r.raceId = ra.raceId
            JOIN circuits c ON ra.circuitId = c.circuitId
            JOIN constructors co ON r.constructorId = co.constructorId
            GROUP BY c.country, co.constructorId, co.name
            ORDER BY total_points DESC
            Limit 150;
                   """)
    rows = cursor.fetchall()
    results = [dict(row) for row in rows]
    conn.close()
    return results