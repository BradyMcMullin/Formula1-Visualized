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
