import os
import csv
import io
import re
import logging
from pathlib import Path
from flask import Blueprint, jsonify, current_app

ear_tag_bp = Blueprint('ear_tag_search', __name__)
logger = logging.getLogger(__name__)

# Simple cache
_cattle_data_cache = None

def clear_cattle_data_cache():
    """Clear the cached cattle data to force reload from file."""
    global _cattle_data_cache
    _cattle_data_cache = None
    logger.info("Cattle data cache cleared")

def _get_dataset_path():
    """Resolve dataset path at runtime, handling both absolute and relative paths."""
    dataset_path_env = os.getenv('CATTLE_DATASET_PATH', None)
    
    if not dataset_path_env:
        logger.warning("CATTLE_DATASET_PATH environment variable not set")
        return None
    
    path = Path(dataset_path_env)
    
    # If it's already an absolute path and exists, use it
    if path.is_absolute():
        if path.exists():
            logger.info(f"Found absolute path: {path}")
            return str(path)
        else:
            logger.warning(f"Absolute path does not exist: {path}")
    
    # Try relative path from current working directory
    if path.exists():
        logger.info(f"Found relative path from cwd: {path}")
        return str(path.resolve())
    
    # Try relative path from project root (parent of backend directory)
    project_root = Path(__file__).parent.parent  # Go up from backend/ to project root
    candidate = project_root / path
    if candidate.exists():
        logger.info(f"Found relative path from project root: {candidate}")
        return str(candidate)
    
    logger.error(f"Could not resolve dataset path. Tried: {path}, {project_root / path}")
    return None

def load_cattle_data():
    """Parses the cattle database from the Markdown file.
    
    Requires CATTLE_DATASET_PATH environment variable to be set.
    Expected format: Markdown file with embedded CSV data in ```csv blocks.
    """
    global _cattle_data_cache
    if _cattle_data_cache is not None:
        return _cattle_data_cache
    
    # Resolve path at runtime (not at module load time)
    dataset_path = _get_dataset_path()
    
    if not dataset_path:
        logger.error("CATTLE_DATASET_PATH environment variable not set or path could not be resolved.")
        return None
        
    if not os.path.exists(dataset_path):
        logger.error(f"Dataset path does not exist: {dataset_path}")
        return None
    
    try:
        logger.info(f"Loading cattle data from: {dataset_path}")
        with open(dataset_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Extract CSV block from markdown
        csv_match = re.search(r'```csv\s+(.*?)\s+```', content, re.DOTALL)
        if not csv_match:
            logger.error("No ```csv block found in the dataset file.")
            return None
            
        csv_content = csv_match.group(1)
        
        # Use csv reader to parse
        f_csv = io.StringIO(csv_content)
        reader = csv.DictReader(f_csv)
        
        _cattle_data_cache = [dict(row) for row in reader]
        logger.info(f"Successfully loaded {len(_cattle_data_cache)} cattle records.")
        return _cattle_data_cache
    except Exception as e:
        logger.error(f"Error loading cattle data: {e}", exc_info=True)
        return None

@ear_tag_bp.route('/tag/<tag_id>', methods=['GET'])
def get_cattle_by_tag(tag_id):
    """
    Search for cattle by ear tag ID or pashu ID.
    Returns cattle info or 404 if not found.
    """
    try:
        logger.info(f"Searching for cattle with tag/ID: {tag_id}")
        data = load_cattle_data()
        
        if data is None:
            logger.error("Failed to load cattle data - dataset file not found or invalid")
            return jsonify({
                'error': 'DATABASE_ERROR',
                'message': 'Unable to access cattle database. Dataset file may be missing or invalid.',
                'status_code': 500,
                'debug_info': 'CATTLE_DATASET_PATH environment variable may not be set correctly'
            }), 500
        
        if not data:
            logger.warning("Cattle dataset is empty")
            return jsonify({
                'error': 'DATABASE_ERROR',
                'message': 'Cattle database is empty. No records available.',
                'status_code': 500
            }), 500
            
        # Search for matching tag_id or pashu_id
        tag_id_str = str(tag_id).strip()
        
        # Debug: Log keys of the first item to check field names
        logger.debug(f"Available fields: {list(data[0].keys())}")
        logger.debug(f"Total records in database: {len(data)}")
        
        cattle_info = next((item for item in data if item.get('ear_tag_id') == tag_id_str or item.get('pashu_id') == tag_id_str), None)
        
        if cattle_info:
            logger.info(f"Match found for ID {tag_id_str}: {cattle_info.get('animal_name', 'Unknown')}")
            return jsonify({
                'status': 'success',
                'data': cattle_info
            }), 200
        else:
            logger.warning(f"No match found for ID: {tag_id_str}")
            return jsonify({
                'error': 'CATTLE_NOT_FOUND',
                'message': f'Cattle not found with the given ID: {tag_id_str}',
                'status_code': 404
            }), 404
            
    except Exception as e:
        logger.error(f"Exception in get_cattle_by_tag: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'INTERNAL_ERROR',
            'message': 'An unexpected error occurred while searching for cattle.',
            'status_code': 500,
            'debug_info': str(e) if current_app.config.get('DEBUG') else 'Check server logs for details'
        }), 500
