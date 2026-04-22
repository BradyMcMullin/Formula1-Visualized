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