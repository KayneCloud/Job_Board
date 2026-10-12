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

@app.route("/api/advertisements", methods=["POST"])
def create_advertisement():
    data = request.get_json()

    if not data or not data.get("title") or not data.get("short_description") or not data.get("company_id"):
        return jsonify({"error": "title, short_description and company_id are required"}), 400

    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """INSERT INTO advertisements
                (title, short_description, full_description, company_id, contact_id, location, contract_type, working_time, salary, remote)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    data["title"],
                    data["short_description"],
                    data.get("full_description"),
                    data["company_id"],
                    data.get("cotact_id"),
                    data.get("location"),
                    data.get("contract_type"),
                    data.get("working_time"),
                    data.get("salary"),
                    data.get("remote", "no"),
                ),
            )
            conn.commit()
            new_id = cursor.lastrowid
    except pymysql.err.IntegrityError:
        return jsonify({"error": "company_id or contact_id does not exist"}), 400
    finally: 
        conn.close()

    return jsonify({"id": new_id, "message": "Advertisement created"}), 201

@app.route("/api/advertisements", methods=["GET"])
def get_advertisements():
    conn=get_db()
    with conn.cursor() as cursor:
        cursor.execute(
            """SELECT a.*, c.name AS company_name, c.city AS company_city
            FROM advertisements a
            JOIN companies c ON a.company_id = c.id
            ORDER BY a.created_at DESC
            """,
        )
        ads = cursor.fetchall()
    conn.close()
    return jsonify(ads), 200

@app.route("/api/advertisements/<int:ad_id>", methods=["GET"])
def get_advertisement(ad_id):
    conn = get_db()
    with conn.cursor() as cursor:
        cursor.execute(
            """SELECT a.*, c.name AS company_name, c.city AS company_city,
                      c.website AS company_website, c.description AS company_description
               FROM advertisements a
               JOIN companies c ON a.company_id = c.id
               WHERE a.id = %s""",
            (ad_id,),
        )
        ad = cursor.fetchone()
    conn.close()

    if ad is None:
        return jsonify({"error": "Advertisement not found"}), 404
    return jsonify(ad), 200

@app.route("/api/advertisements/<int:ad_id>", methods=["PUT"])
def update_advertisement(ad_id):
    data = request.get_json()

    if not data or not data.get("title") or not data.get("short_description") or not data.get("company_id"):
        return jsonify({"error": "title, short_description and company_id are required"}), 400

    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """UPDATE advertisements
                   SET title=%s, short_description=%s, full_description=%s,
                       company_id=%s, contact_id=%s, location=%s, contract_type=%s,
                       working_time=%s, salary=%s, remote=%s
                   WHERE id=%s""",
                (
                    data["title"],
                    data["short_description"],
                    data.get("full_description"),
                    data["company_id"],
                    data.get("contact_id"),
                    data.get("location"),
                    data.get("contract_type"),
                    data.get("working_time"),
                    data.get("salary"),
                    data.get("remote", "no"),
                    ad_id,
                ),
            )
            conn.commit()
            changed = cursor.rowcount
    except pymysql.err.IntegrityError:
        return jsonify({"error": "company_id or contact_id does not exist"}), 400
    finally:
        conn.close()

    if changed == 0:
        return jsonify({"error": "Advertisement not found"}), 404
    return jsonify({"message": "Advertisement updated"}), 200

@app.route("/api/advertisements/<int:ad_id>", methods=["DELETE"])
def delete_advertisement(ad_id):
    conn = get_db()
    with conn.cursor() as cursor:
        cursor.execute("DELETE FROM advertisements WHERE id=%s", (ad_id,))
        conn.commit()
        deleted = cursor.rowcount
    conn.close()

    if deleted == 0:
        return jsonify({"error": "Advertisement not found"}), 404
    return jsonify({"message": "Advertisement deleted"}), 200

if __name__ == "__main__":
    app.run(debug=True)