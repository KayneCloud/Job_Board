from werkzeug.security import generate_password_hash
from app import get_db

conn = get_db()
with conn.cursor() as cursor:
    cursor.execute("DELETE FROM applications")
    cursor.execute("DELETE FROM advertisements")
    cursor.execute("DELETE FROM people")
    cursor.execute("DELETE FROM companies")

    cursor.execute(
        "INSERT INTO companies (name, sector, city) VALUES (%s, %s, %s)",
        ("Le Grand Bistrot", "Restaurant", "Marseille"),
    )
    bistrot_id = cursor.lastrowid

    cursor.execute(
        "INSERT INTO companies (name, sector, city) VALUES (%s, %s, %s)",
        ("Food & Co", "Food tech", "Lyon"),
    )
    foodco_id = cursor.lastrowid

    ads = [
        ("POS Systems Technician",
         "Install and maintain point-of-sale systems across our restaurants.",
         "You will install, configure and troubleshoot POS terminals, printers and payment devices in our 6 restaurants. You will also train staff on new features.",
         bistrot_id, "Marseille", "Full-time", "35h / week", "28 000 € / year", "no"),
        ("Junior Web Developer",
         "Help build our online ordering platform.",
         "Join a small team building a click-and-collect platform used by 40 restaurants. You will work on the React front end and help test new features.",
         foodco_id, "Lyon", "Internship", "35h / week", "1 000 € / month", "partial"),
        ("IT Support Assistant",
         "Be the first point of contact for IT issues in our kitchens and dining rooms.",
         "You will handle Wi-Fi problems, tablets, kitchen display screens and reservation software. Evening availability is a plus.",
         bistrot_id, "Aix-en-Provence", "Part-time", "20h / week", "13 € / hour", "no"),
    ]
    for ad in ads:
        cursor.execute(
            """INSERT INTO advertisements
               (title, short_description, full_description, company_id, location,
                contract_type, working_time, salary, remote)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            ad,
        )

    people = [
        ("Admin", "Chefs", "admin@chefs.dev", "", "admin123", "admin"),
        ("Jane", "Doe", "jane@chefs.dev", "0600000000", "jane123", "user"),
    ]
    for first_name, last_name, email, phone, password, role in people:
        cursor.execute(
            """INSERT INTO people (first_name, last_name, email, phone, password_hash, role)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (first_name, last_name, email, phone, generate_password_hash(password), role),
        )

    conn.commit()
conn.close()

print("Database filled")