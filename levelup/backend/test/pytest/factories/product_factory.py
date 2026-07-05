import factory
from app.models.product import Product


class ProductFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = Product
        sqlalchemy_session = None

    name = factory.Faker("sentence", nb_words=3)
    type = "key"
    price = 19.99
    description = factory.Faker("paragraph")
