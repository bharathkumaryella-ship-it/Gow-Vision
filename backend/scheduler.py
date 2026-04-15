"""
Scheduler for automated government scheme updates
Fetches latest schemes every morning at 6 AM
"""

import os
import time
import logging
from datetime import datetime, time as dt_time
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from scheme_utils import fetch_latest_schemes, clean_expired_schemes, log_update
from models import db, GovernmentScheme

logger = logging.getLogger(__name__)

scheduler = None

def update_government_schemes():
    """Task to fetch and update government schemes from API"""
    try:
        logger.info("Starting scheduled government schemes update...")
        
        # First, clean up expired schemes
        expired_count = clean_expired_schemes()
        
        # Fetch latest schemes from API
        schemes, error = fetch_latest_schemes()
        
        if error:
            log_update('scheduled', status='failed', message=f"API Error: {error}")
            logger.error(f"Failed to fetch schemes: {error}")
            return
        
        if not schemes:
            log_update('scheduled', status='partial', message="No new schemes found")
            logger.warning("No new schemes found from API")
            return
        
        added = 0
        updated = 0
        
        for scheme_data in schemes:
            try:
                existing = GovernmentScheme.query.filter_by(id=scheme_data['id']).first()
                if existing:
                    # Update existing scheme
                    for key, value in scheme_data.items():
                        if hasattr(existing, key):
                            setattr(existing, key, value)
                    from datetime import datetime as dt
                    existing.last_verified_at = dt.utcnow()
                    updated += 1
                else:
                    # Create new scheme
                    scheme = GovernmentScheme.from_dict(scheme_data)
                    scheme.source = 'api'
                    db.session.add(scheme)
                    added += 1
            except Exception as e:
                logger.error(f"Error processing scheme {scheme_data.get('id')}: {e}")
                continue
        
        db.session.commit()
        
        # Log the update
        log_update(
            'scheduled',
            added=added,
            updated=updated,
            deleted=expired_count,
            status='success',
            message=f"Expired removed: {expired_count}, Added: {added}, Updated: {updated}"
        )
        
        logger.info(
            f"Scheme update completed. "
            f"Added: {added}, Updated: {updated}, Expired removed: {expired_count}"
        )
        
    except Exception as e:
        logger.error(f"Error in scheduled scheme update: {e}", exc_info=True)
        log_update('scheduled', status='failed', message=str(e))


def cleanup_old_uploads():
    """Task to clean up old temporary uploads (older than 24 hours)"""
    try:
        # Check both potential temp directories
        temp_dirs = [
            os.path.join(os.path.dirname(__file__), 'temp_uploads'),
            os.path.join(os.path.dirname(__file__), '..', 'temp_uploads')
        ]
        
        cleaned_count = 0
        now = time.time()
        
        for temp_dir in temp_dirs:
            if not os.path.exists(temp_dir):
                continue
                
            for filename in os.listdir(temp_dir):
                filepath = os.path.join(temp_dir, filename)
                # If file is older than 24 hours
                if now - os.path.getmtime(filepath) > 86400:
                    try:
                        os.remove(filepath)
                        cleaned_count += 1
                    except Exception as e:
                        logger.error(f"Failed to delete {filepath}: {e}")
        
        if cleaned_count > 0:
            logger.info(f"Cleanup completed. Removed {cleaned_count} old temporary files.")
            
    except Exception as e:
        logger.error(f"Error in scheduled cleanup task: {e}")


def init_scheduler(app):
    """Initialize the APScheduler scheduler with the Flask app"""
    global scheduler
    
    try:
        scheduler = BackgroundScheduler()
        
        # Schedule daily update at 6 AM (06:00)
        scheduler.add_job(
            func=update_government_schemes,
            trigger=CronTrigger(hour=6, minute=0),
            id='scheme_update_job',
            name='Daily Government Schemes Update',
            replace_existing=True
        )
        
        # Schedule cleanup every 6 hours
        scheduler.add_job(
            func=cleanup_old_uploads,
            trigger='interval',
            hours=6,
            id='cleanup_uploads_job',
            name='Temporary Uploads Cleanup',
            replace_existing=True
        )
        
        app.config['SCHEDULER'] = scheduler
        
        scheduler.start()
        logger.info("[OK] Scheduled task initialized - Government schemes will update daily at 6:00 AM")
        
    except Exception as e:
        logger.error(f"Failed to initialize scheduler: {e}", exc_info=True)


def shutdown_scheduler():
    """Shutdown the scheduler gracefully"""
    global scheduler
    try:
        if scheduler and scheduler.running:
            scheduler.shutdown()
            logger.info("[OK] Scheduler shutdown gracefully")
    except Exception as e:
        logger.error(f"Error shutting down scheduler: {e}")
