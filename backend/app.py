import os
import pymysql
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

def get_db():
    """Open a connection to MySQL."""
    return pymysql.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        cursorclass=pymysql.cursors.DictCursor,
    )

@app.route ("/api/health", methods=["GET"])
def health():
    conn = get_db()
    with conn.cursor() as cursor:
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
    conn.close()
    return jsonify({"status": "ok", "tables": tables}), 200

if __name__ == "__main__":
    app.run(debug=True)