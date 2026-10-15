from werkzeug.security import generate_password_hash
from app import get_db

conn = get_db()
with conn.cursor() as cursor:
    cursor.execute("DELETE FROM favourites")
    cursor.execute("DELETE FROM applications")
    cursor.execute("DELETE FROM advertisements")
    cursor.execute("DELETE FROM people")
    cursor.execute("DELETE FROM companies")

    companies = [
        ("La Pagaille", "Restaurant & lounge", "Marseille", "https://la-pagaille.fr",
         "Restaurant-lounge in the Panier district, 37 rue Caisserie. Small plates to share, cocktails and wines."),
        ("Master Poulet", "Rotisserie, fast food", "Paris", None,
         "Halal wood-fired rotisserie chain founded in 2019, with around 36 restaurants, mostly in the Paris region. Takeaway and delivery."),
        ("L'Hippocampe", "Fish restaurant", "Marseille", "https://www.lhippocampevieuxport.fr",
         "Family restaurant on the Vieux-Port since 1993, 14 quai du Port. Bouillabaisse and fish dishes facing Notre-Dame de la Garde."),
        ("Le Péron", "Gastronomic restaurant", "Marseille", "https://www.restaurant-peron.com",
         "Marseille institution since 1885, 56 Corniche Kennedy. Mediterranean gastronomy with a view of the Frioul islands."),
        ("BSB - Brothers & Sisters Burger", "Fast food", "Marseille", None,
         "Family halal fast food near Saint-Charles station, 59 rue d'Aix. Burgers, tacos, wraps and pizzas."),
    ]
    company_ids = []
    for name, sector, city, website, description in companies:
        cursor.execute(
            """INSERT INTO companies (name, sector, city, website, description)
               VALUES (%s, %s, %s, %s, %s)""",
            (name, sector, city, website, description),
        )
        company_ids.append(cursor.lastrowid)
    pagaille_id, master_id, hippocampe_id, peron_id, bsb_id = company_ids

    people = [
        ("Admin", "Chefs", "admin@chefs.dev", "", "admin123", "admin", None),
        ("Lilou", "Tibbaut", "lilou@chefs.dev", "0600000000", "lilou123", "user", None),
        ("Kayne", "Shaw", "kayne@chefs.dev", "0611111111", "kayne123", "employer", pagaille_id),
    ]
    person_ids = {}
    for first_name, last_name, email, phone, password, role, company_id in people:
        cursor.execute(
            """INSERT INTO people (first_name, last_name, email, phone, password_hash, role, company_id)
               VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            (first_name, last_name, email, phone, generate_password_hash(password), role, company_id),
        )
        person_ids[email] = cursor.lastrowid
    lilou_id = person_ids["lilou@chefs.dev"]
    kayne_id = person_ids["kayne@chefs.dev"]

    ads = [
        ("POS Systems Technician", "Keep our tills and payment terminals running every evening.",
         "You will install, configure and troubleshoot our POS terminals, printers and payment devices.",
         pagaille_id, kayne_id, "Marseille", "Part-time", "20h / week", "14 € / hour", "no"),
        ("Web Developer", "Improve our website and online booking.",
         "You will maintain our website and connect it to our booking tool for groups and private events.",
         pagaille_id, kayne_id, "Marseille", "Internship", "35h / week", "1 000 € / month", "partial"),
        ("Digital Communication Assistant", "Share our small plates and events on social media.",
         "You will create content for our social networks and keep our online pages up to date.",
         pagaille_id, kayne_id, "Marseille", "Part-time", "15h / week", "13 € / hour", "partial"),
        ("Data Analyst", "Turn sales data from our restaurants into useful insights.",
         "You will analyse sales and stock data across our network to help plan supplies and reduce waste.",
         master_id, None, "Paris", "Full-time", "35h / week", "40 000 € / year", "partial"),
        ("Mobile Developer", "Build our ordering and loyalty app.",
         "You will develop and maintain our iOS and Android app used for orders and loyalty points.",
         master_id, None, "Paris", "Full-time", "35h / week", "42 000 € / year", "full"),
        ("IT Support Technician", "Help our restaurants with their daily IT tools.",
         "You will support restaurant teams with tills, tablets, printers and network issues.",
         master_id, None, "Paris", "Full-time", "35h / week", "28 000 € / year", "no"),
        ("Website Developer", "Give our historic restaurant a modern website.",
         "You will redesign our website, add our menu and a simple online booking form.",
         hippocampe_id, None, "Marseille", "Freelance", "Flexible", "300 € / day", "full"),
        ("IT Helpdesk", "Be our go-to person for tills and Wi-Fi.",
         "You will handle IT problems on site: payment terminals, Wi-Fi and the reservation software.",
         hippocampe_id, None, "Marseille", "Part-time", "10h / week", "15 € / hour", "no"),
        ("Booking Systems Manager", "Manage our reservation and guest data tools.",
         "You will manage our booking platform, guest database and table plan for lunch and dinner services.",
         peron_id, None, "Marseille", "Full-time", "39h / week", "32 000 € / year", "no"),
        ("Network Technician", "Keep our restaurant and terrace connected.",
         "You will install and monitor our network equipment, including Wi-Fi on the terrace.",
         peron_id, None, "Marseille", "Part-time", "20h / week", "16 € / hour", "no"),
        ("Social Media & Web Assistant", "Show our burgers to all of Marseille.",
         "You will manage our social networks and our delivery platform pages.",
         bsb_id, None, "Marseille", "Internship", "35h / week", "1 000 € / month", "partial"),
        ("Self-order Kiosk Technician", "Install and maintain our self-order kiosks.",
         "You will set up and maintain our self-order kiosks and kitchen screens.",
         bsb_id, None, "Marseille", "Full-time", "35h / week", "27 000 € / year", "no"),
    ]
    ad_ids = []
    for ad in ads:
        cursor.execute(
            """INSERT INTO advertisements
               (title, short_description, full_description, company_id, contact_id,
                location, contract_type, working_time, salary, remote)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            ad,
        )
        ad_ids.append(cursor.lastrowid)

    applications = [
        (ad_ids[0], lilou_id, "Lilou Tibbaut", "lilou@chefs.dev", "0600000000",
         "Hello, I work in a restaurant and I know POS systems well."),
        (ad_ids[8], lilou_id, "Lilou Tibbaut", "lilou@chefs.dev", "0600000000",
         "I would love to manage your booking tools."),
        (ad_ids[1], None, "Tom Visitor", "tom@example.com", "",
         "I am a web development student looking for an internship."),
    ]
    for application in applications:
        cursor.execute(
            """INSERT INTO applications (ad_id, person_id, name, email, phone, message)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            application,
        )

    for ad_id in (ad_ids[4], ad_ids[6]):
        cursor.execute(
            "INSERT INTO favourites (person_id, ad_id) VALUES (%s, %s)",
            (lilou_id, ad_id),
        )

    conn.commit()
conn.close()

print("Database filled")