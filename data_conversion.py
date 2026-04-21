import os
import pandas as pd
import sqlite3

# --- Configuration ---
# Path to the folder containing your 14 CSV files
CSV_DIRECTORY = './archive'  # Change this to your actual directory path
# The name of the database file you want to generate
DB_NAME = 'database.db'

def create_database():
    print(f"Connecting to {DB_NAME}...")
    # Connect to SQLite (creates the .db file if it doesn't exist)
    conn = sqlite3.connect(DB_NAME)
    
    # Optional: Enable foreign key constraints for SQLite
    conn.execute("PRAGMA foreign_keys = ON;")

    # Iterate through every file in your target directory
    for filename in os.listdir(CSV_DIRECTORY):
        if filename.endswith('.csv'):
            # Use the filename (without .csv) as the table name
            table_name = os.path.splitext(filename)[0]
            file_path = os.path.join(CSV_DIRECTORY, filename)
            
            print(f"Processing {filename} into table '{table_name}'...")
            
            try:
                # Read the CSV. 
                # CRITICAL: The F1 dataset uses '\N' for NULL values. 
                # If we don't declare this, pandas makes everything a string.
                df = pd.read_csv(file_path, na_values=r'\N')
                
                # Automatically infer and convert to the best possible data types
                df = df.convert_dtypes()
                
                # Write the DataFrame to the SQLite database
                # if_exists='replace' overwrites the table if you need to run the script again
                # index=False prevents pandas from adding an extra column for row numbers
                df.to_sql(table_name, conn, if_exists='replace', index=False)
                
                print(f"  -> Successfully loaded {len(df)} rows.")
                
            except Exception as e:
                print(f"  -> Error processing {filename}: {e}")

    # Close the connection when done
    conn.commit()
    conn.close()
    print("\nDatabase creation complete! Your .db file is ready.")

if __name__ == '__main__':
    # Ensure the directory exists before running
    if not os.path.exists(CSV_DIRECTORY):
        print(f"Error: Could not find the directory '{CSV_DIRECTORY}'. Please create it and add your CSVs.")
    else:
        create_database()