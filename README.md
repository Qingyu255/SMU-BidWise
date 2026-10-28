# SMU BidWise - IS216 G2T4 Group Project

### SMU BidWise

> Course planning platform for Singapore Management University Students<br>
> Production Site: [smubidwise.com](https://www.smubidwise.com)

### To Start Local Development Server (Next.js Frontend)
```
cd frontend-website
npm i # install packages
npm run dev # run local dev server
```

### Test user credentials
```
login using **google account** with clerk authentication
Gmail: bidwiseuser@gmail.com
Password: bidwiseUser24

# OR: use your personal google account

```

### Run the BOSS class scraper
```
cd scrapers
python -m venv env
source env/bin/activate
pip install -r requirements.txt

cd BOSS_scraper
python main.py --term 2610 --start 1000 --end 3001 --workers 4

```

Log in manually in the Chrome window, leave it open until the class details page appears, then press Enter in the scraper terminal. Worker browsers run concurrently; `--end` is exclusive. JSON files go to `scrapedData/<term>/` by default. Use `--output-dir` to keep a run separate.

To load files into Supabase while scraping, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `scrapers/.env.local`, then run this in another terminal from `scrapers/BOSS_scraper`:

```
../env/bin/python load_to_supabase_db.py --directory scrapedData/2610 --workers 4
```

The loader watches for new JSON files until Ctrl-C. Point `--directory` at the scraper's actual output folder if you use `--output-dir`.
### Architecture Diagram:
![architecture_diagram](readMeImages/architectureDiagram07112024.png)
| **Component**               | **Description**                                                                                   |
|-----------------------------|---------------------------------------------------------------------------------------------------|
| **Frontend**                | Next.js Application: Hosted on Vercel.                                                            |
| **Database**                | Supabase PostgreSQL                                                                               |
| **Bid Price Analytics API** | FastAPI: API with in-memory storage for low-latency reads                                         |
|                             | Dockerised: Containerised for scalable deployment on Google Cloud Run                             |
| **Authentication**          | Clerk OAuth: Secure user authentication and user management                                        |
| **Automated Data Scraper**  | Selenium Scripts: Keeps BidDataStore and Supabase PostgreSQL updated with real-time data from SMU BOSS |


### SMU BidWise Features:
| **Feature**                  | **Description**                                                                                   |
|------------------------------|---------------------------------------------------------------------------------------------------|
| **Simplified Course Lookup** | All course information in one place                                                               |
|                              | Easy search using the course search bar                                                           |
|                              | View comprehensive details on one page, including vacancies, areas, prerequisites/corequisites, and available sections |
|                              | Access student course ratings                                                                     |
| **Bid Analytics**            | View clear past bid prices and trends                                                             |
|                              | Make informed, data-driven bidding decisions                                                      |
| **Senior Roadmaps**          | Insights into modules taken by seniors based on their career goals or degree specialisation       |
|                              | Personalised academic roadmaps with "what if" scenarios                                           |
| **Graduation Progress Tracker / Planner** | Visual guide to track academic requirements                                        |
|                              | Plan for graduation effectively                                                                   |
| **Community Threads**        | Space for students to discuss bidding-related topics                                              |
|                              | Ask questions and start threads                                                                   |
|                              | Share insights and strategies with peers                                                          |
