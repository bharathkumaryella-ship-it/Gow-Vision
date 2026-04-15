"""
Pytest configuration and fixtures for GowVision backend tests
"""

import os
import sys
import json
from unittest.mock import MagicMock

# CRITICAL: Mock heavy ML dependencies BEFORE any app imports
# This must happen at module load time, before app.py is imported
print("[pytest] Mocking ML dependencies...")
sys.modules['torch'] = MagicMock()
sys.modules['torch.nn'] = MagicMock()
sys.modules['torchvision'] = MagicMock()
sys.modules['torchvision.transforms'] = MagicMock()
sys.modules['whisper'] = MagicMock()
sys.modules['piper'] = MagicMock()
sys.modules['piper.voice'] = MagicMock()
sys.modules['piper.synthesize'] = MagicMock()
sys.modules['piper.voice.PiperVoice'] = MagicMock()
sys.modules['ollama'] = MagicMock()

# NOW safe to import app
import pytest
import tempfile
from pathlib import Path
from datetime import datetime, date
from app import app, db
from models import GovernmentScheme


@pytest.fixture(scope="session")
def test_app():
    """Create and configure a test app instance"""
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['CORS_ORIGINS'] = 'http://localhost:5173,http://localhost:5174'
    app.config['FLASK_ENV'] = 'testing'
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(test_app):
    """Test client for making requests"""
    return test_app.test_client()


@pytest.fixture
def app_context(test_app):
    """Application context for database operations"""
    with test_app.app_context():
        yield test_app


@pytest.fixture(autouse=True)
def reset_db(test_app):
    """Reset database before each test"""
    with test_app.app_context():
        db.session.remove()
        db.drop_all()
        db.create_all()
        yield
        db.session.remove()


@pytest.fixture
def sample_scheme(test_app):
    """Create a sample government scheme"""
    with test_app.app_context():
        scheme = GovernmentScheme(
            id='test-scheme-001',
            title="Test Scheme",
            description="A test government scheme",
            details="Test details about the scheme",
            eligibility=json.dumps(["Indian farmers", "Cattle owners"]),
            benefits=json.dumps(["Subsidy", "Training"]),
            deadline=date(2025, 12, 31),
            is_active=True,
            source="manual"
        )
        db.session.add(scheme)
        db.session.commit()
        return scheme


@pytest.fixture
def temp_upload_dir(tmp_path):
    """Create a temporary upload directory"""
    upload_dir = tmp_path / "uploads"
    upload_dir.mkdir()
    return upload_dir


@pytest.fixture
def sample_image_path():
    """Create a sample image file for testing"""
    from PIL import Image
    import io
    
    # Create a simple test image
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    return img_bytes
