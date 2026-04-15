"""
Database models for Government Schemes
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()


class GovernmentScheme(db.Model):
    """Model for storing government schemes with expiration tracking"""
    
    __tablename__ = 'government_schemes'
    
    id = db.Column(db.String(50), primary_key=True)
    title = db.Column(db.String(255), nullable=False, index=True)
    description = db.Column(db.Text, nullable=False)
    details = db.Column(db.Text)
    
    # Store JSON arrays as text fields
    eligibility = db.Column(db.Text, default='[]')  # JSON array as string
    benefits = db.Column(db.Text, default='[]')     # JSON array as string
    
    deadline = db.Column(db.Date)
    link = db.Column(db.String(500))
    icon = db.Column(db.String(50), default='Building2')
    color = db.Column(db.String(50), default='bg-emerald-500')
    
    # Tracking fields
    is_active = db.Column(db.Boolean, default=True, index=True)
    source = db.Column(db.String(100), default='manual')  # 'manual', 'api', 'imported'
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_verified_at = db.Column(db.DateTime)
    
    def __repr__(self):
        return f'<GovernmentScheme {self.id}: {self.title}>'
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'details': self.details,
            'eligibility': json.loads(self.eligibility) if isinstance(self.eligibility, str) else self.eligibility,
            'benefits': json.loads(self.benefits) if isinstance(self.benefits, str) else self.benefits,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'link': self.link,
            'icon': self.icon,
            'color': self.color,
            'is_active': self.is_active,
            'source': self.source,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'last_verified_at': self.last_verified_at.isoformat() if self.last_verified_at else None,
            'is_expired': self.is_expired()
        }
    
    def is_expired(self):
        """Check if the scheme deadline has passed"""
        if not self.deadline:
            return False
        from datetime import date
        return date.today() > self.deadline
    
    @classmethod
    def from_dict(cls, data):
        """Create model instance from dictionary"""
        scheme = cls()
        
        if 'id' in data:
            scheme.id = str(data['id'])
        if 'title' in data:
            scheme.title = data['title']
        if 'description' in data:
            scheme.description = data['description']
        if 'details' in data:
            scheme.details = data.get('details', '')
        if 'eligibility' in data:
            scheme.eligibility = json.dumps(data['eligibility']) if isinstance(data['eligibility'], list) else data['eligibility']
        if 'benefits' in data:
            scheme.benefits = json.dumps(data['benefits']) if isinstance(data['benefits'], list) else data['benefits']
        if 'deadline' in data:
            if data['deadline']:
                from datetime import datetime as dt
                if isinstance(data['deadline'], str):
                    scheme.deadline = dt.fromisoformat(data['deadline']).date()
                else:
                    scheme.deadline = data['deadline']
        if 'link' in data:
            scheme.link = data.get('link', '')
        if 'icon' in data:
            scheme.icon = data.get('icon', 'Building2')
        if 'color' in data:
            scheme.color = data.get('color', 'bg-emerald-500')
        if 'source' in data:
            scheme.source = data.get('source', 'manual')
        
        return scheme


class SchemeUpdateLog(db.Model):
    """Log for tracking scheme updates from API"""
    
    __tablename__ = 'scheme_update_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    update_type = db.Column(db.String(50))  # 'scheduled', 'manual', 'import'
    schemes_added = db.Column(db.Integer, default=0)
    schemes_updated = db.Column(db.Integer, default=0)
    schemes_deleted = db.Column(db.Integer, default=0)
    status = db.Column(db.String(20))  # 'success', 'failed', 'partial'
    message = db.Column(db.Text)
    api_response_status = db.Column(db.Integer)
    
    def to_dict(self):
        return {
            'id': self.id,
            'timestamp': self.timestamp.isoformat(),
            'update_type': self.update_type,
            'schemes_added': self.schemes_added,
            'schemes_updated': self.schemes_updated,
            'schemes_deleted': self.schemes_deleted,
            'status': self.status,
            'message': self.message,
            'api_response_status': self.api_response_status
        }
