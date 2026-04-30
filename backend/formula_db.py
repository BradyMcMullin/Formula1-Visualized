import sqlite3

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row 
    return conn


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
    results = [dict(row) for row in rows]
    conn.close()
    return results

def year_with_most_winners():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
                    SELECT
                        COUNT(r.driverId)
                    FROM results AS r
                   """)
    rows = cursor.fetchall()
    results = [dict(row) for row in rows]
    conn.close()
    return results