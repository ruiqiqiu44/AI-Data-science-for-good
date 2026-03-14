from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

phrases = [
    {
        "id": 1,
        "scenario": "cashier",
        "english_phrase": "Would you like a bag?",
        "english_pronunciation": "WUD you lyk uh BAG?",
        "image_url": "https://yourstorage.com/images/cashier_bag.png"
    }
]

@app.get("/scenarios")
def get_scenarios():
    return list(set(p["scenario"] for p in phrases))

@app.get("/phrases")
def get_phrases(scenario: str = Query(...)):
    return [p for p in phrases if p["scenario"] == scenario]
