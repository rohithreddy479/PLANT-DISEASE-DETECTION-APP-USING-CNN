from pydantic import BaseModel
from datetime import date

class PlantBase(BaseModel):
    name: str
    species: str
    water_interval: int
    last_watered: date
    sunlight_need: str
    temperature_range: str

class PlantCreate(PlantBase):
    pass

class PlantResponse(PlantBase):
    id: int
    class Config:
        orm_mode = True
