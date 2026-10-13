import os
import pymysql
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from functools import wraps
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()

app = Flask(__name__)
CORS(app)


# ===================== TABLE OF CONTENTS =====================
# 1. Imports              -> libraries (Flask, PyMySQL, CORS, dotenv, itsdangerous, werkzeug)
# 2. Setup                -> load .env, create the Flask app, enable CORS
# 3. Database connection  -> get_db(): opens a connection to MySQL
# 4. Auth helpers         -> create_token(), get_current_user(), @admin_required
# 5. Health check         -> GET /api/health
# 6. Companies            -> CRUD /api/companies
# 7. Advertisements       -> CRUD /api/advertisements
# 8. Applications         -> apply to an ad + CRUD /api/applications
# 9. People & auth        -> CRUD /api/people + signup, login, me (/api/auth/...)
# 10. Start server        -> app.run()
#
# Admin-only routes are marked with @admin_required
# ==============================================================

# 3. DATABASE CONNECTION ==================================
def get_db():
    """Open a connection to MySQL."""
    return pymysql.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        cursorclass=pymysql.cursors.DictCursor,
    )

# 4. AUTH HELPERS ==========================================
serializer = URLSafeTimedSerializer(os.getenv("SECRET_KEY"))
TOKEN_MAX_AGE = 60*60*24

def create_token(person_id):
    """Make a signed token that contains the person's id."""
    return serializer.dumps({"id": person_id})

def get_current_user():
    """Read the token from the request. Return the person, or None if not logged in."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth[len("Bearer "):]

    try:
        data = serializer.loads(token, max_age=TOKEN_MAX_AGE)
    except (BadSignature, SignatureExpired):
        return None

    conn = get_db()
    with conn.cursor() as cursor:
        cursor.execute(
            """SELECT id, first_name, last_name, email, phone, role, company_id
            FROM people WHERE id=%s""",
            (data["id"],),
        )
        person = cursor.fetchone()
    conn.close()
    return person

def admin_required(route_function):
    """PUT @admin_required under @app.route to allow only admins"""
    @wraps(route_function)
    def wrapper(*args, **kwargs):
        user = get_current_user()
        if user is None:
            return jsonify({"error": "You must be logged in"}), 401
        if user["role"] != "admin":
            return jsonify({"error": "Admins only"}), 403
        return route_function(*args, **kwargs)
    return wrapper

# 5. HEALTH CHECK ==========================================
# checks that Flask can reach MySQL (lists the tables)
@app.route ("/api/health", methods=["GET"])
def health():
    conn = get_db()
    with conn.cursor() as cursor:
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
    conn.close()
    return jsonify({"status": "ok", "tables": tables}), 200

# 6. COMPANY SECTION ========================================
# list all companies
@app.route("/api/companies", methods=["GET"])
def get_companies():
    conn = get_db()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM companies")
        companies = cursor.fetchall()
    conn.close()
    return jsonify(companies), 200

# get one company (404 if it does not exist)
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

# create a company (name required, returns 201 + new id)
@app.route("/api/companies", methods=["POST"])
@admin_required
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

# replace all the info of a company (404 if not found)
@app.route("/api/companies/<int:company_id>", methods=["PUT"])
@admin_required
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

# delete a company (its ads are deleted too)
@app.route("/api/companies/<int:company_id>", methods=["DELETE"])
@admin_required
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

# 7. ADVERTISEMENT SECTION ==========================================
# create a job ad (title, short_description, company_id required)
@app.route("/api/advertisements", methods=["POST"])
@admin_required
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
                    data.get("contact_id"),
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

# list all ads + company name, newest first (job board page)
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

# all details of one ad + company info
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

# replace all the info of an ad
@app.route("/api/advertisements/<int:ad_id>", methods=["PUT"])
@admin_required
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

# delete an ad (its applications are deleted too)
@app.route("/api/advertisements/<int:ad_id>", methods=["DELETE"])
@admin_required
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

# 8. APPLICATION SECTION ===========================================
# apply to an ad
@app.route("/api/advertisements/<int:ad_id>/applications", methods=["POST"])
def create_application(ad_id):
    data = request.get_json()

    if not data or not data.get("name") or not data.get("email") or not data.get("message"):
        return jsonify({"error": "name, email and message are required"}), 400

    conn = get_db()
    try:
        with conn.cursor() as cursor:

            cursor.execute("SELECT id FROM advertisements WHERE id=%s", (ad_id,))
            if cursor.fetchone() is None:
                return jsonify({"error": "Advertisement not found"}), 404

            cursor.execute(
                """INSERT INTO applications (ad_id, person_id, name, email, phone, message)
                   VALUES (%s, %s, %s, %s, %s, %s)""",
                (
                    ad_id,
                    data.get("person_id"),
                    data["name"],
                    data["email"],
                    data.get("phone"),
                    data["message"],
                ),
            )
            conn.commit()
            new_id = cursor.lastrowid
    except pymysql.err.IntegrityError:
        return jsonify({"error": "person_id does not exist"}), 400
    finally:
        conn.close()

    return jsonify({"id": new_id, "message": "Application sent"}), 201

# list all applications + job title (admin page)
@app.route("/api/applications", methods=["GET"])
@admin_required
def get_applications():
    conn = get_db()
    with conn.cursor() as cursor:
        cursor.execute(
            """SELECT ap.*, a.title AS ad_title
               FROM applications ap
               JOIN advertisements a ON ap.ad_id = a.id
               ORDER BY ap.created_at DESC""",
        )
        applications = cursor.fetchall()
    conn.close()
    return jsonify(applications), 200

# list the applications for one ad
@app.route("/api/advertisements/<int:ad_id>/applications", methods=["GET"])
@admin_required
def get_applications_for_ad(ad_id):
    conn = get_db()
    with conn.cursor() as cursor:
        cursor.execute("SELECT id FROM advertisements WHERE id=%s", (ad_id,))
        if cursor.fetchone() is None:
            conn.close()
            return jsonify({"error": "Advertisement not found"}), 404

        cursor.execute(
            """SELECT * FROM applications
               WHERE ad_id = %s
               ORDER BY created_at DESC""",
            (ad_id,),
        )
        applications = cursor.fetchall()
    conn.close()
    return jsonify(applications), 200

# get one application + job title
@app.route("/api/applications/<int:application_id>", methods=["GET"])
@admin_required
def get_application(application_id):
    conn = get_db()
    with conn.cursor() as cursor:
        cursor.execute(
            """SELECT ap.*, a.title AS ad_title
               FROM applications ap
               JOIN advertisements a ON ap.ad_id = a.id
               WHERE ap.id = %s""",
            (application_id,),
        )
        application = cursor.fetchone()
    conn.close()

    if application is None:
        return jsonify({"error": "Application not found"}), 404
    return jsonify(application), 200

# change only the status ("sent" or "read")
@app.route("/api/applications/<int:application_id>", methods=["PATCH"])
@admin_required
def update_application_status(application_id):
    data = request.get_json()

    if not data or data.get("status") not in ("sent", "read"):
        return jsonify({"error": "status must be 'sent' or 'read'"}), 400

    conn = get_db()
    with conn.cursor() as cursor:
        cursor.execute(
            "UPDATE applications SET status=%s WHERE id=%s",
            (data["status"], application_id),
        )
        conn.commit()
        changed = cursor.rowcount
    conn.close()

    if changed == 0:
        return jsonify({"error": "Application not found"}), 404
    return jsonify({"message": "Status updated"}), 200

# delete an application
@app.route("/api/applications/<int:application_id>", methods=["DELETE"])
@admin_required
def delete_application(application_id):
    conn = get_db()
    with conn.cursor() as cursor:
        cursor.execute("DELETE FROM applications WHERE id=%s", (application_id,))
        conn.commit()
        deleted = cursor.rowcount
    conn.close()

    if deleted == 0:
        return jsonify({"error": "Application not found"}), 404
    return jsonify({"message": "Application deleted"}), 200

# 9. PEOPLE SECTION & AUTH ==================================================

PEOPLE_COLUMNS = """p.id, p.first_name, p.last_name, p.email, p.phone,
                    p.role, p.company_id, p.created_at, c.name AS company_name"""


# list all people + company name, except the password_hash
@app.route("/api/people", methods=["GET"])
@admin_required
def get_people():
    conn = get_db()
    with conn.cursor() as cursor:
        cursor.execute(
            f"""SELECT {PEOPLE_COLUMNS}
                FROM people p
                LEFT JOIN companies c ON p.company_id = c.id
                ORDER BY p.id"""
        )
        people = cursor.fetchall()
    conn.close()
    return jsonify(people), 200


# get one person, except the password_hash
@app.route("/api/people/<int:person_id>", methods=["GET"])
@admin_required
def get_person(person_id):
    conn = get_db()
    with conn.cursor() as cursor:
        cursor.execute(
            f"""SELECT {PEOPLE_COLUMNS}
                FROM people p
                LEFT JOIN companies c ON p.company_id = c.id
                WHERE p.id = %s""",
            (person_id,),
        )
        person = cursor.fetchone()
    conn.close()

    if person is None:
        return jsonify({"error": "Person not found"}), 404
    return jsonify(person), 200

# create an account, password is hashed, role only "user" or "employer"
@app.route("/api/auth/signup", methods=["POST"])
def signup():
    data=request.get_json()

    required = ["first_name", "last_name", "email", "password"]
    if not data or not all(data.get(field) for field in required):
        return jsonify({"error": "first_name, last_name, email and password are required"}), 400

    role = data.get("role", "user")
    if role not in ("user", "employer"):
        return jsonify({"error": "role must be 'user' or 'employer'"}), 400

    password_hash = generate_password_hash(data["password"])

    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM people WHERE email=%s", (data["email"],))
            if cursor.fetchone() is not None:
                return jsonify({"error": "This email is already used"}), 409

            cursor.execute(
                """INSERT INTO people (first_name, last_name, email, phone, password_hash, role, company_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                (data["first_name"],
                data["last_name"],
                data["email"],
                data.get("phone"),
                password_hash,
                role,
                data.get("company_id") 
                ),
            )
            conn.commit()
            new_id = cursor.lastrowid
    except pymysql.err.IntegrityError:
        return jsonify({"error": "company_id does not exist"}), 400
    finally:
        conn.close()

    return jsonify({"id": new_id, "message": "Account created"}), 201

# check email + password, return a token and the role
@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "email and password are required"}), 400

    conn = get_db()
    with conn.cursor() as cursor:
        cursor.execute(
            "SELECT id, first_name, role, password_hash FROM people WHERE email=%s",
            (data["email"],),
        )
        person = cursor.fetchone()
    conn.close()

    if person is None or not check_password_hash(person["password_hash"], data["password"]):
        return jsonify({"error": "Wrong email or password"}), 401

    return jsonify({
        "token": create_token(person["id"]),
        "id": person["id"],
        "first_name": person["first_name"],
        "role": person["role"],
    }), 200

#return the logged-in person (needs a token)
@app.route("/api/auth/me", methods=["GET"])
def me():
    user = get_current_user()
    if user is None:
        return jsonify({"error": "You must be logged in"}), 401
    return jsonify(user), 200

# update a person (not the password), email must stay unique
@app.route("/api/people/<int:person_id>", methods=["PUT"])
@admin_required
def update_person(person_id):
    data = request.get_json()

    required = ["first_name", "last_name", "email"]
    if not data or not all(data.get(field) for field in required):
        return jsonify({"error": "first_name, last_name and email are required"}), 400

    role = data.get("role", "user")
    if role not in ("user", "employer", "admin"):
        return jsonify({"error": "role must be 'user', 'employer' or 'admin'"}), 400

    conn = get_db()
    try:
        with conn.cursor() as cursor:
            # Is this email used by SOMEONE ELSE?
            cursor.execute(
                "SELECT id FROM people WHERE email=%s AND id != %s",
                (data["email"], person_id),
            )
            if cursor.fetchone() is not None:
                return jsonify({"error": "This email is already used"}), 409

            cursor.execute(
                """UPDATE people
                   SET first_name=%s, last_name=%s, email=%s, phone=%s, role=%s, company_id=%s
                   WHERE id=%s""",
                (
                    data["first_name"],
                    data["last_name"],
                    data["email"],
                    data.get("phone"),
                    role,
                    data.get("company_id"),
                    person_id,
                ),
            )
            conn.commit()
            changed = cursor.rowcount
    except pymysql.err.IntegrityError:
        return jsonify({"error": "company_id does not exist"}), 400
    finally:
        conn.close()

    if changed == 0:
        return jsonify({"error": "Person not found"}), 404
    return jsonify({"message": "Person updated"}), 200

# delete a person + all their applications + all the ads they are contact for
@app.route("/api/people/<int:person_id>", methods=["DELETE"])
@admin_required
def delete_person(person_id):
    conn = get_db()
    with conn.cursor() as cursor:

        cursor.execute("SELECT id FROM people WHERE id=%s", (person_id,))
        if cursor.fetchone() is None:
            conn.close()
            return jsonify({"error": "Person not found"}), 404

        cursor.execute("DELETE FROM applications WHERE person_id=%s", (person_id,))
        deleted_applications = cursor.rowcount

        cursor.execute("DELETE FROM advertisements WHERE contact_id=%s", (person_id,))
        deleted_ads = cursor.rowcount

        cursor.execute("DELETE FROM people WHERE id=%s", (person_id,))

        conn.commit()
    conn.close()

    return jsonify({
        "message": "Person deleted",
        "deleted_applications": deleted_applications,
        "deleted_ads": deleted_ads,
    }), 200



# 10. START SERVER ================================================
if __name__ == "__main__":
    app.run(debug=True)