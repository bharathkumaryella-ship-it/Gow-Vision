"""
Environment validation module for GowVision
Validates all required environment variables on startup
"""

import os
from typing import Dict, List, Optional, Any
from dotenv import load_dotenv
import logging

logger = logging.getLogger(__name__)


class EnvironmentValidator:
    """Validates environment configuration"""
    
    # Required environment variables by environment
    REQUIRED_VARS = {
        'development': [
            'FLASK_ENV',
            'FLASK_DEBUG',
            'SECRET_KEY',
            'CORS_ORIGINS'
        ],
        'production': [
            'FLASK_ENV',
            'SECRET_KEY',
            'JWT_SECRET_KEY',
            'DATABASE_URL',
            'CORS_ORIGINS',
            'SECURE_COOKIES'
        ]
    }
    
    # Optional variables with defaults
    OPTIONAL_VARS = {
        'FLASK_DEBUG': 'False',
        'LOG_LEVEL': 'INFO',
        'LOG_FILE': 'logs/gowvision.log',
        'MAX_CONTENT_LENGTH': '16777216',
        'RATE_LIMIT_ENABLED': 'true',
        'RATE_LIMIT_STORAGE_URL': 'memory://',
        'DATABASE_URL': 'sqlite:///gowvision.db',
        'UPLOAD_FOLDER': 'temp_uploads',
    }
    
    # Validation rules
    VALIDATION_RULES = {
        'FLASK_ENV': lambda x: x in ['development', 'staging', 'production', 'testing'],
        'FLASK_DEBUG': lambda x: x.lower() in ['true', 'false'],
        'SECRET_KEY': lambda x: len(x) >= 32,
        'JWT_SECRET_KEY': lambda x: len(x) >= 32,
        'LOG_LEVEL': lambda x: x.upper() in ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'],
        'MAX_CONTENT_LENGTH': lambda x: x.isdigit() and int(x) > 0,
        'RATE_LIMIT_ENABLED': lambda x: x.lower() in ['true', 'false'],
        'SECURE_COOKIES': lambda x: x.lower() in ['true', 'false'],
    }
    
    @staticmethod
    def load_environment() -> None:
        """Load environment variables from .env file"""
        load_dotenv(override=False)
    
    @staticmethod
    def validate() -> Dict[str, Any]:
        """
        Validate all environment variables
        
        Returns:
            Dictionary with validation results
            
        Raises:
            ValueError: If critical validation fails
        """
        EnvironmentValidator.load_environment()
        
        flask_env = os.getenv('FLASK_ENV', 'development')
        issues = {
            'errors': [],
            'warnings': [],
            'suggestions': []
        }
        
        # Check required variables
        required = EnvironmentValidator.REQUIRED_VARS.get(flask_env, [])
        for var in required:
            if not os.getenv(var):
                issues['errors'].append(f"Missing required: {var}")
        
        # Check variable validation rules
        for var, validator in EnvironmentValidator.VALIDATION_RULES.items():
            value = os.getenv(var)
            if value and not validator(value):
                issues['errors'].append(f"Invalid {var}: {value}")
        
        # Production-specific checks
        if flask_env == 'production':
            EnvironmentValidator._validate_production(issues)
        
        # Development warnings
        if flask_env == 'development':
            EnvironmentValidator._validate_development(issues)
        
        # Log issues
        if issues['errors']:
            for error in issues['errors']:
                logger.error(f"[CONFIG ERROR] {error}")
            raise ValueError(f"Environment validation failed: {len(issues['errors'])} error(s)")
        
        if issues['warnings']:
            for warning in issues['warnings']:
                logger.warning(f"[CONFIG WARNING] {warning}")
        
        if issues['suggestions']:
            for suggestion in issues['suggestions']:
                logger.info(f"[CONFIG SUGGESTION] {suggestion}")
        
        return issues
    
    @staticmethod
    def _validate_production(issues: Dict[str, List[str]]) -> None:
        """Validate production-specific settings"""
        if os.getenv('FLASK_DEBUG', '').lower() == 'true':
            issues['errors'].append("FLASK_DEBUG must be False in production")
        
        if os.getenv('SECRET_KEY', '') == 'your-secret-key-change-in-production':
            issues['errors'].append("SECRET_KEY must be changed in production")
        
        if not os.getenv('DATABASE_URL', '').startswith('postgresql'):
            issues['warnings'].append(
                "Using SQLite in production is not recommended. Use PostgreSQL."
            )
        
        cors_origins = os.getenv('CORS_ORIGINS', '')
        if cors_origins in ['*', 'localhost:5173', 'localhost:3000']:
            issues['warnings'].append(
                "CORS_ORIGINS is too permissive in production"
            )
        
        if os.getenv('SECURE_COOKIES', '').lower() != 'true':
            issues['warnings'].append("SECURE_COOKIES should be True in production")
    
    @staticmethod
    def _validate_development(issues: Dict[str, List[str]]) -> None:
        """Validate development-specific settings"""
        if not os.getenv('GOOGLE_SEARCH_API_KEY'):
            issues['suggestions'].append(
                "GOOGLE_SEARCH_API_KEY not set. Scheme search will not work."
            )
        
        if not os.getenv('TTS_API_KEY'):
            issues['suggestions'].append(
                "TTS_API_KEY not set. Text-to-speech will not work."
            )
    
    @staticmethod
    def get_default(var: str) -> Optional[str]:
        """Get default value for optional variable"""
        return EnvironmentValidator.OPTIONAL_VARS.get(var)
    
    @staticmethod
    def get_secure_config() -> Dict[str, Any]:
        """Get security configuration"""
        return {
            'SECRET_KEY': os.getenv('SECRET_KEY'),
            'JWT_SECRET_KEY': os.getenv('JWT_SECRET_KEY'),
            'SECURE_COOKIES': os.getenv('SECURE_COOKIES', 'False').lower() == 'true',
            'HTTPS_ONLY': os.getenv('HTTPS_ONLY', 'False').lower() == 'true',
            'SESSION_TIMEOUT': int(os.getenv('SESSION_TIMEOUT', '3600')),
        }
    
    @staticmethod
    def print_summary() -> None:
        """Print environment configuration summary"""
        print("\n" + "="*60)
        print("GowVision Environment Configuration")
        print("="*60)
        print(f"Environment: {os.getenv('FLASK_ENV', 'development')}")
        print(f"Debug Mode: {os.getenv('FLASK_DEBUG', 'False')}")
        print(f"Database: {os.getenv('DATABASE_URL', 'sqlite:///gowvision.db')[:50]}...")
        print(f"Log Level: {os.getenv('LOG_LEVEL', 'INFO')}")
        print(f"CORS Origins: {os.getenv('CORS_ORIGINS', 'localhost:5173')}")
        print("="*60 + "\n")


def validate_env_on_startup() -> None:
    """
    Validate environment on application startup
    Call this in your Flask app.py before starting the server
    """
    try:
        EnvironmentValidator.validate()
        EnvironmentValidator.print_summary()
        logger.info("✓ Environment validation passed")
    except ValueError as e:
        logger.critical(f"✗ Environment validation failed: {e}")
        raise


# Example usage in app.py:
# from env_validator import validate_env_on_startup
#
# if __name__ == '__main__':
#     validate_env_on_startup()
#     app.run()
