from sqlalchemy.orm import Session
import models, schemas

def create_plant(db: Session, plant: schemas.PlantCreate):
    db_plant = models.Plant(**plant.dict())
    db.add(db_plant)
    db.commit()
    db.refresh(db_plant)
    return db_plant

def get_plants(db: Session):
    return db.query(models.Plant).all()
