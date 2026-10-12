import os
import pymysql
from flask import Flask, jsonify, request
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

@app.route("/api/companies", methods=["GET"])
def get_companies():
    conn = get_db()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM companies")
        companies = cursor.fetchall()
    conn.close()
    return jsonify(companies), 200

@app.route("/api/companies/<int:company_id>", methods = ["GET"])
def get_company(company_id):
    conn = get_db()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM companies WHERE id=%s", (company_id,))
        company = cursor.fetchone()
    conn.close()

    if company is None:
        return jsonify({"error": "Company not found"}), 404
    return jsonify(company), 200

@app.route("/api/companies", methods=["POST"])
def create_company():
    data = request.get_json()

    if not data or not data.get("name"):
        return jsonify({"error": "name is required"}), 400

    conn = get_db()
    with conn.cursor() as cursor:
        cursor.execute(
                """INSERT INTO companies (name, sector, city, website, description)
                VALUES (%s, %s, %s, %s, %s)""",
                (data["name"], data.get("sector"), data.get("city"), data.get("website"), data.get("description"),
            ),
        )
        conn.commit()
        new_id = cursor.lastrowid
    conn.close()

    return jsonify({"id": new_id, "message": "Company created"}), 201   

@app.route("/api/companies/<int:company_id>", methods=["PUT"])
def update_company(company_id):
    data=request.get_json()

    if not data or not data.get("name"):
        return jsonify({"error": "name is required"}), 400

    conn = get_db()
    with conn.cursor() as cursor:
        cursor.execute(
            "UPDATE companies SET name=%s, sector=%s, city=%s, website=%s, description=%s WHERE id=%s", 
            (
                data["name"],
                data.get("sector"),
                data.get("city"),
                data.get("website"),
                data.get("description"),
                company_id,
            ),
        )
        conn.commit()
        changed = cursor.rowcount
    conn.close()

    if changed == 0:
        return jsonify({"error": "Company not found"}), 404
    return jsonify({"message": "Company updated"}), 200

@app.route("/api/companies/<int:company_id>", methods=["DELETE"])
def delete_company(company_id):
    conn = get_db()
    with conn.cursor() as cursor:
        cursor.execute("DELETE FROM companies WHERE id=%s", (company_id,))
        conn.commit()
        deleted = cursor.rowcount
    conn.close()

    if deleted == 0:
        return jsonify ({"error": "Company not found"}), 404
    return jsonify({"message": "Company deleted"}), 200

if __name__ == "__main__":
    app.run(debug=True)