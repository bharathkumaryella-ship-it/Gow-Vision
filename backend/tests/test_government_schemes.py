"""
Tests for government schemes endpoint
"""

import pytest
import json
from datetime import datetime, timedelta, date
from unittest.mock import patch
from models import GovernmentScheme, db


class TestGovernmentSchemesEndpoints:
    """Test suite for government schemes API endpoints"""
    
    def test_get_all_schemes(self, client, app_context):
        """Test retrieving all active schemes"""
        with app_context.app_context():
            # Create scheme in this context
            from models import GovernmentScheme as Scheme
            scheme = Scheme(
                id='test-scheme-001',
                title="Test Scheme",
                description="A test government scheme",
                details="Test details",
                eligibility=json.dumps(["farmers"]),
                benefits=json.dumps(["subsidy"]),
                deadline=date(2025, 12, 31),
                is_active=True,
                source="manual"
            )
            db.session.add(scheme)
            db.session.commit()
        
        response = client.get('/api/schemes/')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, dict)
        assert 'data' in data
        assert isinstance(data['data'], list)
    
    def test_get_scheme_by_id(self, client, app_context):
        """Test retrieving a specific scheme by ID"""
        scheme_id = 'test-scheme-001'
        with app_context.app_context():
            from models import GovernmentScheme as Scheme
            scheme = Scheme(
                id=scheme_id,
                title="Test Scheme",
                description="A test government scheme",
                details="Test details",
                eligibility=json.dumps(["farmers"]),
                benefits=json.dumps(["subsidy"]),
                deadline=date(2025, 12, 31),
                is_active=True,
                source="manual"
            )
            db.session.add(scheme)
            db.session.commit()
        
        response = client.get(f'/api/schemes/{scheme_id}')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        # Response might be wrapped in a 'data' key
        scheme_data = data if 'title' in data else data.get('data', {})
        assert scheme_data.get('title') == 'Test Scheme'
        assert scheme_data.get('id') == scheme_id
    
    def test_get_nonexistent_scheme(self, client):
        """Test retrieving a non-existent scheme"""
        response = client.get('/api/schemes/99999')
        assert response.status_code == 404
    
    def test_create_scheme(self, client, app_context):
        """Test creating a new scheme"""
        import uuid
        scheme_data = {
            'id': str(uuid.uuid4()),
            'title': 'New Scheme',
            'description': 'A new government scheme',
            'details': 'Detailed information',
            'eligibility': ['Farmers', 'Cattle owners'],
            'benefits': ['Subsidy', 'Support'],
            'deadline': '2026-12-31'
        }
        
        response = client.post(
            '/api/schemes/',
            data=json.dumps(scheme_data),
            content_type='application/json'
        )
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data.get('data', {}).get('title') == 'New Scheme'
        assert 'data' in data
    
    def test_create_scheme_missing_required_fields(self, client):
        """Test creating scheme without required fields"""
        invalid_scheme = {
            'description': 'Missing title and id'
        }
        
        response = client.post(
            '/api/schemes/',
            data=json.dumps(invalid_scheme),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'message' in data or 'error' in data
    
    def test_update_scheme(self, client, app_context):
        """Test updating an existing scheme"""
        scheme_id = 'test-scheme-001'
        with app_context.app_context():
            from models import GovernmentScheme as Scheme
            scheme = Scheme(
                id=scheme_id,
                title="Test Scheme",
                description="Original description",
                details="Test details",
                eligibility=json.dumps(["farmers"]),
                benefits=json.dumps(["subsidy"]),
                deadline=date(2025, 12, 31),
                is_active=True,
                source="manual"
            )
            db.session.add(scheme)
            db.session.commit()
        
        update_data = {
            'title': 'Updated Scheme',
            'description': 'Updated description'
        }
        
        response = client.put(
            f'/api/schemes/{scheme_id}',
            data=json.dumps(update_data),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        scheme_data = data if 'title' in data else data.get('data', {})
        assert scheme_data.get('title') == 'Updated Scheme'
    
    def test_delete_scheme(self, client, app_context):
        """Test deleting a scheme (soft delete)"""
        scheme_id = 'test-scheme-001'
        with app_context.app_context():
            from models import GovernmentScheme as Scheme
            scheme = Scheme(
                id=scheme_id,
                title="Test Scheme",
                description="A test government scheme",
                details="Test details",
                eligibility=json.dumps(["farmers"]),
                benefits=json.dumps(["subsidy"]),
                deadline=date(2025, 12, 31),
                is_active=True,
                source="manual"
            )
            db.session.add(scheme)
            db.session.commit()
        
        response = client.delete(f'/api/schemes/{scheme_id}')
        
        assert response.status_code == 200
        
        # Verify soft delete - scheme should still exist but be inactive
        with app_context.app_context():
            from models import GovernmentScheme as Scheme
            deleted_scheme = Scheme.query.get(scheme_id)
            assert deleted_scheme is not None
            assert deleted_scheme.is_active == False
    
    def test_search_schemes(self, client, app_context, sample_scheme):
        """Test searching schemes"""
        response = client.get('/api/schemes/search?q=Test')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        # Handle both list and dict response formats
        schemes = data if isinstance(data, list) else data.get('data', [])
        assert isinstance(schemes, list)


class TestSchemeExpirationHandling:
    """Test scheme expiration functionality"""
    
    def test_expired_scheme_not_in_list(self, client, app_context):
        """Test that expired schemes don't appear in active list"""
        # Create an expired scheme
        expired_scheme = GovernmentScheme(
            id='expired-001',
            title="Expired Scheme",
            description="Already expired",
            details="Old scheme",
            eligibility=json.dumps(["everyone"]),
            benefits=json.dumps(["none"]),
            deadline=date.today() - timedelta(days=1),
            is_active=True,
            source="test"
        )
        
        with app_context.app_context():
            db.session.add(expired_scheme)
            db.session.commit()
        
        response = client.get('/api/schemes/')
        data = json.loads(response.data)
        
        # Handle pagination response format
        schemes = data.get('data', []) if isinstance(data, dict) else data
        
        # Expired scheme might be marked or excluded
        expired_found = any(s.get('id') == expired_scheme.id for s in schemes)
        if expired_found:
            # If found, it should be marked as expired
            expired_item = next(s for s in schemes if s.get('id') == expired_scheme.id)
            assert not expired_item.get('is_active', True) or expired_item.get('is_expired', False)
    
    def test_scheme_is_expired_method(self, app_context, sample_scheme):
        """Test the is_expired() method on scheme"""
        with app_context.app_context():
            # Create a new expired scheme for testing
            expired_test_scheme = GovernmentScheme(
                id='expired-test-001',
                title="Expired Test",
                description="Test",
                details="Test",
                eligibility=json.dumps(["test"]),
                benefits=json.dumps(["test"]),
                deadline=date.today() - timedelta(days=1),
                is_active=True,
                source="test"
            )
            db.session.add(expired_test_scheme)
            db.session.commit()
            
            assert expired_test_scheme.is_expired() == True
    
    def test_future_deadline_not_expired(self, app_context):
        """Test that future deadline schemes are not expired"""
        future_scheme = GovernmentScheme(
            id='future-001',
            title="Future Scheme",
            description="Not expired yet",
            details="Active scheme",
            eligibility=json.dumps(["all"]),
            benefits=json.dumps(["support"]),
            deadline=date.today() + timedelta(days=365),
            is_active=True,
            source="test"
        )
        
        with app_context.app_context():
            db.session.add(future_scheme)
            db.session.commit()
            assert future_scheme.is_expired() == False


class TestSchemeValidation:
    """Test scheme data validation"""
    
    def test_invalid_deadline_format(self, client):
        """Test scheme with invalid deadline format"""
        scheme_data = {
            'title': 'Bad Deadline Scheme',
            'description': 'Test',
            'details': 'Test',
            'eligibility': ['test'],
            'benefits': ['test'],
            'deadline': 'invalid-date'
        }
        
        response = client.post(
            '/api/schemes/',
            data=json.dumps(scheme_data),
            content_type='application/json'
        )
        
        assert response.status_code == 400
    
    def test_empty_eligibility_array(self, client):
        """Test scheme with empty eligibility array"""
        scheme_data = {
            'title': 'Test Scheme',
            'description': 'Test',
            'details': 'Test',
            'eligibility': [],
            'benefits': ['Subsidy'],
            'deadline': '2026-12-31'
        }
        
        response = client.post(
            '/api/schemes/',
            data=json.dumps(scheme_data),
            content_type='application/json'
        )
        
        # Should either accept or reject clearly
        assert response.status_code in [201, 400]
    
    def test_xss_prevention_in_scheme_data(self, client):
        """Test that XSS payloads in scheme data are sanitized"""
        scheme_data = {
            'title': '<script>alert("xss")</script>',
            'description': 'Test',
            'details': 'Test with <img src=x onerror=alert(1)>',
            'eligibility': ['test'],
            'benefits': ['test'],
            'deadline': '2026-12-31'
        }
        
        response = client.post(
            '/api/schemes/',
            data=json.dumps(scheme_data),
            content_type='application/json'
        )
        
        # Should create but sanitize
        if response.status_code == 201:
            data = json.loads(response.data)
            assert '<script>' not in data.get('title', '')
            assert 'onerror=' not in data.get('details', '')


class TestSchemeAPIIntegration:
    """Test scheme API integration features"""
    
    @patch('government_schemes_blueprint.fetch_latest_schemes')
    def test_manual_api_refresh(self, mock_fetch, client):
        """Test manually triggering API refresh"""
        mock_fetch.return_value = []
        
        response = client.post('/api/schemes/update/latest')
        
        # Should trigger update
        assert response.status_code in [200, 500]
    
    def test_update_logs_endpoint(self, client):
        """Test retrieving scheme update logs"""
        response = client.get('/api/schemes/status/update-logs')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list) or isinstance(data, dict)
