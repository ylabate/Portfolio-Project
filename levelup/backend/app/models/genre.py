from app import db
from app.models.BaseModel import BaseModel

product_genres = db.Table('product_genres',
                          db.Column('product_id', db.String(36), db.ForeignKey(
                              'products.id'), primary_key=True),
                          db.Column('genre_id', db.String(36), db.ForeignKey(
                              'genres.id'), primary_key=True)
                          )


class Genre(BaseModel):
    __tablename__ = 'genres'
    name = db.Column(db.String(50), unique=True, nullable=False)

    def __repr__(self):
        return f'<Genre {self.name}>'

    def to_dict(self):
        return {
            **super().to_dict(),
            "name": self.name
        }
