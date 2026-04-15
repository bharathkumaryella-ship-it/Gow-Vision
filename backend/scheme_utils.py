"""
Utility functions for government schemes management
"""

import logging
from datetime import datetime, date
from models import db, GovernmentScheme, SchemeUpdateLog
import json

logger = logging.getLogger(__name__)


def clean_expired_schemes():
    """Remove or mark expired schemes as inactive"""
    try:
        today = date.today()
        expired_schemes = GovernmentScheme.query.filter(
            GovernmentScheme.deadline < today,
            GovernmentScheme.is_active == True
        ).all()
        
        count = 0
        for scheme in expired_schemes:
            scheme.is_active = False
            count += 1
        
        if count > 0:
            db.session.commit()
            logger.info(f"Marked {count} expired schemes as inactive")
            return count
        return 0
    except Exception as e:
        logger.error(f"Error cleaning expired schemes: {e}")
        db.session.rollback()
        return 0


def fetch_latest_schemes():
    """Fetch latest government schemes from Google Search API"""
    import os
    import requests
    
    api_key = os.getenv('GOOGLE_SEARCH_API_KEY')
    cx = os.getenv('GOOGLE_SEARCH_CX')
    
    if not api_key:
        logger.error("GOOGLE_SEARCH_API_KEY not configured")
        return None, "API key not configured"
    
    if not cx:
        logger.warning("GOOGLE_SEARCH_CX not configured - skipping live search")
        return None, "Search Engine ID not configured"
    
    query = 'latest government schemes for cattle in India 2025 2026'
    url = f"https://www.googleapis.com/customsearch/v1?key={api_key}&cx={cx}&q={query}"
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        search_results = response.json()
        
        schemes = []
        for idx, item in enumerate(search_results.get('items', [])[:5]):  # Get top 5 results
            schemes.append({
                'id': f"search_{datetime.now().timestamp()}_{idx}",
                'title': item.get('title', 'Unknown'),
                'description': item.get('snippet', ''),
                'details': item.get('snippet', ''),
                'link': item.get('link', ''),
                'source': 'api'
            })
        
        logger.info(f"Successfully fetched {len(schemes)} schemes from API")
        return schemes, None
    except Exception as e:
        logger.error(f"Error fetching latest schemes: {e}")
        return None, str(e)


def log_update(update_type, added=0, updated=0, deleted=0, status='success', message=''):
    """Log scheme update operation"""
    try:
        log_entry = SchemeUpdateLog(
            update_type=update_type,
            schemes_added=added,
            schemes_updated=updated,
            schemes_deleted=deleted,
            status=status,
            message=message
        )
        db.session.add(log_entry)
        db.session.commit()
    except Exception as e:
        logger.error(f"Error logging update: {e}")
