import factory
from app.models.user import User


class UserFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = User
        sqlalchemy_session = None

    username = factory.Faker("user_name")
    email = factory.Faker("email")
    password = "password123"  # Solid password for testing
