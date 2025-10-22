from sqlalchemy import Column, Integer, String, Float, Date
from database import Base

class Plant(Base):
    __tablename__ = "plants"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    species = Column(String)
    water_interval = Column(Integer)  # days between watering
    last_watered = Column(Date)
    sunlight_need = Column(String)
    temperature_range = Column(String)
