import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy_utils import database_exists, create_database, drop_database

from app.database import Base, get_db
from app.main import app
from fastapi.testclient import TestClient

TEST_DATABASE_URL = "sqlite:///./test.db"

@pytest.fixture(scope="session")
def engine():
    engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    try:
        if not database_exists(engine.url):
            create_database(engine.url)
    except Exception as e:
        print(f"Warning: Could not create test database: {e}")
        # Will continue but tests will fail on connection if Postgres is down
    
    Base.metadata.create_all(bind=engine)
    yield engine
    # Teardown
    try:
        Base.metadata.drop_all(bind=engine)
        drop_database(engine.url)
    except Exception:
        pass

@pytest.fixture(scope="function")
def db_session(engine):
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
