# main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.plants import router as plants_router 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(plants_router)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Plant Disease API is running"}