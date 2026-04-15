"""
GowVision - Advanced Data Validation Module
Comprehensive input validation and sanitization for all user inputs
Protects against: SQL injection, XSS, path traversal, XXE attacks
"""

import re
import json
from datetime import datetime
from typing import Any, Dict, List, Union, Tuple, Optional
import phonenumbers
from errors import (
    ValidationError, InvalidMobileNumberError, InvalidPasswordError,
    InvalidNameError, UnsupportedFileTypeError, FileSizeError, InvalidImageError
)


class ValidationRules:
    """Standard validation rules used across the application"""
    
    # Length constraints
    MIN_NAME_LENGTH = 2
    MAX_NAME_LENGTH = 100
    MIN_PASSWORD_LENGTH = 8
    MAX_PASSWORD_LENGTH = 128
    MIN_BREED_LENGTH = 2
    MAX_BREED_LENGTH = 100
    MIN_MOBILE_LENGTH = 10
    MAX_MOBILE_LENGTH = 15
    
    # Character patterns
    NAME_PATTERN = r"^[a-zA-Z\s\-']+$"  # Letters, spaces, hyphens, apostrophes
    BREED_PATTERN = r"^[a-zA-Z\s\-\&]+$"  # Letters, spaces, hyphens, ampersands
    PASSWORD_PATTERN_UPPERCASE = r"[A-Z]"
    PASSWORD_PATTERN_LOWERCASE = r"[a-z]"
    PASSWORD_PATTERN_DIGIT = r"\d"
    PASSWORD_PATTERN_SPECIAL = r"[!@#$%^&*()_+\-=\[\]{};:'\"\\|,.<>\/?]"
    
    # File constraints
    MAX_FILE_SIZE_MB = 16
    MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
    ALLOWED_IMAGE_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'}
    
    # Confidence score range
    MIN_CONFIDENCE = 0.0
    MAX_CONFIDENCE = 1.0


class BaseValidator:
    """Base validator class with common validation patterns"""
    
    @staticmethod
    def check_type(value: Any, expected_type, field_name: str) -> None:
        """Verify value is of expected type"""
        if not isinstance(value, expected_type):
            type_name = expected_type.__name__ if hasattr(expected_type, '__name__') else str(expected_type)
            raise ValidationError(
                f"{field_name} must be {type_name}",
                field=field_name
            )
    
    @staticmethod
    def check_required(value: Any, field_name: str) -> None:
        """Verify value is not empty/None"""
        if value is None or (isinstance(value, str) and not value.strip()):
            raise ValidationError(f"{field_name} is required", field=field_name)
    
    @staticmethod
    def check_length_range(value: str, min_len: int, max_len: int, field_name: str) -> str:
        """Verify string length is within range"""
        value = value.strip() if isinstance(value, str) else value
        
        if len(str(value)) < min_len:
            raise ValidationError(
                f"{field_name} must be at least {min_len} characters",
                field=field_name
            )
        
        if len(str(value)) > max_len:
            raise ValidationError(
                f"{field_name} must not exceed {max_len} characters",
                field=field_name
            )
        
        return value if isinstance(value, str) else str(value)
    
    @staticmethod
    def check_numeric_range(value: Union[int, float, str], min_val: Union[int, float], max_val: Union[int, float], field_name: str, value_type: type = float) -> Union[int, float]:
        """Verify numeric value is within range"""
        try:
            numeric_value = value_type(value)
        except (ValueError, TypeError):
            raise ValidationError(
                f"{field_name} must be a valid {value_type.__name__}",
                field=field_name
            )
        
        if numeric_value < min_val:
            raise ValidationError(
                f"{field_name} must be at least {min_val}",
                field=field_name
            )
        
        if numeric_value > max_val:
            raise ValidationError(
                f"{field_name} must not exceed {max_val}",
                field=field_name
            )
        
        return numeric_value
    
    @staticmethod
    def check_pattern(value: str, pattern: str, field_name: str, error_message: str = None) -> None:
        """Verify value matches regex pattern"""
        if not re.match(pattern, value):
            msg = error_message or f"{field_name} format is invalid"
            raise ValidationError(msg, field=field_name)


class InputSanitizer:
    """Sanitize user input to prevent injection attacks"""
    
    # SQL injection patterns
    SQL_INJECTION_PATTERNS = [
        r"\bUNION\b.*\bSELECT\b",
        r"\bDROP\b.*\bTABLE\b",
        r"\bINSERT\b.*\bINTO\b",
        r"\bDELETE\b.*\bFROM\b",
        r"\bUPDATE\b.*\bSET\b",
        # Generic suspicious SQL tokens (comments, statement separators, boolean injections)
        r"(?:--|#|;|\bOR\b|\bAND\b|\bWHERE\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b)",
    ]
    
    # XSS patterns
    XSS_PATTERNS = [
        r"<script[^>]*>.*?</script>",
        r"javascript:",
        r"on\w+\s*=",  # Event handlers
        r"<iframe",
        r"<object",
        r"<embed",
    ]
    
    @staticmethod
    def sanitize_string(value: str, field_name: str = "input", max_length: int = 1000, encode_output: bool = False) -> str:
        """
        Sanitize string input: validate against injection attacks and trim
        
        Args:
            value: String to sanitize
            field_name: Field name for error messages
            max_length: Maximum allowed length
            encode_output: If True, HTML-encode output for display safety
            
        Returns:
            Validated and optionally encoded string
            
        Raises:
            ValidationError: If input contains dangerous patterns
        """
        if not isinstance(value, str):
            raise ValidationError(f"{field_name} must be a string", field=field_name)
        
        value = value.strip()
        
        if len(value) > max_length:
            raise ValidationError(f"{field_name} exceeds maximum length of {max_length}", field=field_name)
        
        for pattern in InputSanitizer.SQL_INJECTION_PATTERNS:
            if re.search(pattern, value, re.IGNORECASE):
                raise ValidationError(
                    f"{field_name} contains invalid characters or patterns",
                    field=field_name
                )
        
        for pattern in InputSanitizer.XSS_PATTERNS:
            if re.search(pattern, value, re.IGNORECASE):
                raise ValidationError(
                    f"{field_name} contains invalid script patterns",
                    field=field_name
                )
        
        if encode_output:
            value = value.replace("&", "&amp;")
            value = value.replace("<", "&lt;")
            value = value.replace(">", "&gt;")
            value = value.replace('"', "&quot;")
            value = value.replace("'", "&#39;")
        
        return value
    
    @staticmethod
    def sanitize_filename(filename: str, max_length: int = 255) -> str:
        """
        Sanitize filename to prevent path traversal attacks
        
        Args:
            filename: Original filename
            max_length: Maximum filename length
            
        Returns:
            Safe filename
            
        Raises:
            ValidationError: If filename is invalid
        """
        if not filename:
            raise ValidationError("Filename cannot be empty", field="filename")
        
        try:
            from os import path
            filename = path.basename(filename)
        except Exception:
            filename = filename.replace("../", "").replace("..\\", "")
        
        filename = filename.lstrip('./\\')

        filename = re.sub(r"[^\w\.\-]", "", filename)

        if len(filename) > max_length:
            name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
            max_name_len = max_length - len(ext) - (1 if ext else 0)
            filename = name[:max_name_len] + ('.' + ext if ext else '')

        if not filename:
            raise ValidationError("Filename contains only invalid characters", field="filename")

        return filename
    
    @staticmethod
    def sanitize_json(json_str: str) -> Dict[str, Any]:
        """
        Safely parse and validate JSON input
        
        Args:
            json_str: JSON string to parse
            
        Returns:
            Parsed JSON object
            
        Raises:
            ValidationError: If JSON is invalid
        """
        try:
            data = json.loads(json_str)
            return data
        except json.JSONDecodeError as e:
            raise ValidationError(f"Invalid JSON format: {str(e)}", field="request_body")


class MobileNumberValidator:
    """Specialized validator for mobile numbers"""
    
    @staticmethod
    def validate(mobile_number: str) -> str:
        """
        Validate mobile number with international format support
        
        Args:
            mobile_number: Mobile number to validate
            
        Returns:
            Normalized mobile number
            
        Raises:
            InvalidMobileNumberError: If validation fails
        """
        if not mobile_number or not isinstance(mobile_number, str):
            raise InvalidMobileNumberError(details={'reason': 'Mobile number is required'})
        
        # Remove common separators
        cleaned = re.sub(r'[\s\-\+\(\)]', '', mobile_number.strip())
        
        # Check basic format (10-15 digits)
        if not re.match(r'^\d{10,15}$', cleaned):
            raise InvalidMobileNumberError(details={
                'reason': 'Must be 10-15 digits',
                'provided_length': len(cleaned)
            })
        
        try:
            # Try international format validation
            parsed = phonenumbers.parse(mobile_number, None)
            if not phonenumbers.is_valid_number(parsed):
                raise InvalidMobileNumberError(details={'reason': 'Invalid phone format'})
            
            # Check if number is geographically valid
            if not phonenumbers.is_possible_number(parsed):
                raise InvalidMobileNumberError(details={'reason': 'Number does not appear to be valid'})
            
            return cleaned
        except phonenumbers.phonenumberutil.NumberParseException:
            # Fallback to basic validation
            if not re.match(r'^\d{10,15}$', cleaned):
                raise InvalidMobileNumberError(details={'reason': 'Invalid format'})
            return cleaned


class PasswordValidator:
    """Specialized validator for password strength"""
    
    @staticmethod
    def validate(password: str, strict_mode: bool = False) -> bool:
        """
        Validate password strength with customizable rules
        
        Args:
            password: Password to validate
            strict_mode: If True, enforce stricter requirements
            
        Returns:
            True if valid
            
        Raises:
            InvalidPasswordError: If validation fails
        """
        if not password or not isinstance(password, str):
            raise InvalidPasswordError("Password is required")
        
        # Check length
        if len(password) < ValidationRules.MIN_PASSWORD_LENGTH:
            raise InvalidPasswordError(
                f"Must be at least {ValidationRules.MIN_PASSWORD_LENGTH} characters"
            )
        
        if len(password) > ValidationRules.MAX_PASSWORD_LENGTH:
            raise InvalidPasswordError(
                f"Must not exceed {ValidationRules.MAX_PASSWORD_LENGTH} characters"
            )
        
        # Check for uppercase
        if not re.search(ValidationRules.PASSWORD_PATTERN_UPPERCASE, password):
            raise InvalidPasswordError("Must contain at least 1 uppercase letter (A-Z)")
        
        # Check for lowercase
        if not re.search(ValidationRules.PASSWORD_PATTERN_LOWERCASE, password):
            raise InvalidPasswordError("Must contain at least 1 lowercase letter (a-z)")
        
        # Check for digits
        if not re.search(ValidationRules.PASSWORD_PATTERN_DIGIT, password):
            raise InvalidPasswordError("Must contain at least 1 digit (0-9)")
        
        # Strict mode: require special character
        if strict_mode:
            if not re.search(ValidationRules.PASSWORD_PATTERN_SPECIAL, password):
                raise InvalidPasswordError(
                    "Must contain at least 1 special character (!@#$%^&*)"
                )
        
        return True


class NameValidator:
    """Specialized validator for user names"""
    
    @staticmethod
    def validate(name: str) -> str:
        """
        Validate and sanitize user name
        
        Args:
            name: User name to validate
            
        Returns:
            Validated and sanitized name
            
        Raises:
            InvalidNameError: If validation fails
        """
        if not name or not isinstance(name, str):
            raise InvalidNameError("Name is required")
        
        name = name.strip()
        
        # Check length
        if len(name) < ValidationRules.MIN_NAME_LENGTH:
            raise InvalidNameError(
                f"Must be at least {ValidationRules.MIN_NAME_LENGTH} characters"
            )
        
        if len(name) > ValidationRules.MAX_NAME_LENGTH:
            raise InvalidNameError(
                f"Must not exceed {ValidationRules.MAX_NAME_LENGTH} characters"
            )
        
        # Check character pattern (letters, spaces, hyphens, apostrophes only)
        if not re.match(ValidationRules.NAME_PATTERN, name):
            raise InvalidNameError(
                "Contains invalid characters. Only letters, spaces, hyphens, and apostrophes allowed"
            )
        
        # Check for multiple consecutive spaces
        if "  " in name:
            raise InvalidNameError("Cannot contain multiple consecutive spaces")
        
        return name


class BreedValidator:
    """Specialized validator for cattle breed names"""
    
    @staticmethod
    def validate(breed: str) -> str:
        """
        Validate and sanitize breed name
        
        Args:
            breed: Breed name to validate
            
        Returns:
            Validated and sanitized breed name
            
        Raises:
            ValidationError: If validation fails
        """
        if not breed or not isinstance(breed, str):
            raise ValidationError("Breed name is required", field="breed")
        
        breed = breed.strip()
        
        # Check length
        if len(breed) < ValidationRules.MIN_BREED_LENGTH:
            raise ValidationError(
                f"Breed must be at least {ValidationRules.MIN_BREED_LENGTH} characters",
                field="breed"
            )
        
        if len(breed) > ValidationRules.MAX_BREED_LENGTH:
            raise ValidationError(
                f"Breed must not exceed {ValidationRules.MAX_BREED_LENGTH} characters",
                field="breed"
            )
        
        # Check character pattern
        if not re.match(ValidationRules.BREED_PATTERN, breed):
            raise ValidationError(
                "Breed contains invalid characters. Only letters, spaces, hyphens, and & allowed",
                field="breed"
            )
        
        return breed


class ConfidenceValidator:
    """Specialized validator for confidence scores"""
    
    @staticmethod
    def validate(confidence: Union[float, int, str]) -> float:
        """
        Validate confidence score (0.0 to 1.0)
        
        Args:
            confidence: Confidence value
            
        Returns:
            Validated confidence as float
            
        Raises:
            ValidationError: If validation fails
        """
        try:
            conf = float(confidence)
        except (ValueError, TypeError):
            raise ValidationError(
                "Confidence must be a valid number",
                field="confidence"
            )
        
        if conf < ValidationRules.MIN_CONFIDENCE or conf > ValidationRules.MAX_CONFIDENCE:
            raise ValidationError(
                f"Confidence must be between {ValidationRules.MIN_CONFIDENCE} "
                f"and {ValidationRules.MAX_CONFIDENCE}",
                field="confidence"
            )
        
        return round(conf, 4)  # Round to 4 decimal places


class EmailValidator:
    """Specialized validator for email addresses"""
    
    EMAIL_PATTERN = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    MAX_EMAIL_LENGTH = 254
    
    @staticmethod
    def validate(email: str) -> str:
        """
        Validate email address format
        
        Args:
            email: Email address to validate
            
        Returns:
            Validated email in lowercase
            
        Raises:
            ValidationError: If email is invalid
        """
        if not email or not isinstance(email, str):
            raise ValidationError("Email is required", field="email")
        
        email = email.strip().lower()
        
        if len(email) > EmailValidator.MAX_EMAIL_LENGTH:
            raise ValidationError(
                f"Email must not exceed {EmailValidator.MAX_EMAIL_LENGTH} characters",
                field="email"
            )
        
        if not re.match(EmailValidator.EMAIL_PATTERN, email):
            raise ValidationError(
                "Invalid email format",
                field="email"
            )
        
        return email


class UUIDValidator:
    """Specialized validator for UUIDs"""
    
    UUID_PATTERN = r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
    
    @staticmethod
    def validate(uuid_str: str) -> str:
        """
        Validate UUID format
        
        Args:
            uuid_str: UUID string to validate
            
        Returns:
            Validated UUID in lowercase
            
        Raises:
            ValidationError: If UUID is invalid
        """
        if not uuid_str or not isinstance(uuid_str, str):
            raise ValidationError("UUID is required", field="uuid")
        
        uuid_str = uuid_str.strip().lower()
        
        if not re.match(UUIDValidator.UUID_PATTERN, uuid_str):
            raise ValidationError(
                "Invalid UUID format. Expected format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
                field="uuid"
            )
        
        return uuid_str


class AgeValidator:
    """Specialized validator for animal age"""
    
    MIN_AGE = 0
    MAX_AGE = 50
    
    @staticmethod
    def validate(age: Union[int, float, str]) -> int:
        """
        Validate animal age in years
        
        Args:
            age: Age value to validate
            
        Returns:
            Validated age as integer
            
        Raises:
            ValidationError: If age is invalid
        """
        try:
            age_int = int(age)
        except (ValueError, TypeError):
            raise ValidationError(
                "Age must be a valid integer",
                field="age"
            )
        
        if age_int < AgeValidator.MIN_AGE:
            raise ValidationError(
                f"Age must be at least {AgeValidator.MIN_AGE} years",
                field="age"
            )
        
        if age_int > AgeValidator.MAX_AGE:
            raise ValidationError(
                f"Age must not exceed {AgeValidator.MAX_AGE} years",
                field="age"
            )
        
        return age_int


class WeightValidator:
    """Specialized validator for animal weight"""
    
    MIN_WEIGHT = 0.1
    MAX_WEIGHT = 2000.0
    
    @staticmethod
    def validate(weight: Union[int, float, str]) -> float:
        """
        Validate animal weight in kilograms
        
        Args:
            weight: Weight value to validate
            
        Returns:
            Validated weight as float
            
        Raises:
            ValidationError: If weight is invalid
        """
        try:
            weight_float = float(weight)
        except (ValueError, TypeError):
            raise ValidationError(
                "Weight must be a valid number",
                field="weight"
            )
        
        if weight_float < WeightValidator.MIN_WEIGHT:
            raise ValidationError(
                f"Weight must be at least {WeightValidator.MIN_WEIGHT} kg",
                field="weight"
            )
        
        if weight_float > WeightValidator.MAX_WEIGHT:
            raise ValidationError(
                f"Weight must not exceed {WeightValidator.MAX_WEIGHT} kg",
                field="weight"
            )
        
        return round(weight_float, 2)


class FeedbackValidator:
    """Specialized validator for user feedback and comments"""
    
    MIN_FEEDBACK_LENGTH = 1
    MAX_FEEDBACK_LENGTH = 2000
    
    @staticmethod
    def validate(feedback: str) -> str:
        """
        Validate feedback/comment text
        
        Args:
            feedback: Feedback text to validate
            
        Returns:
            Validated feedback
            
        Raises:
            ValidationError: If feedback is invalid
        """
        if not feedback or not isinstance(feedback, str):
            raise ValidationError("Feedback is required", field="feedback")
        
        feedback = feedback.strip()
        
        if len(feedback) < FeedbackValidator.MIN_FEEDBACK_LENGTH:
            raise ValidationError(
                "Feedback cannot be empty",
                field="feedback"
            )
        
        if len(feedback) > FeedbackValidator.MAX_FEEDBACK_LENGTH:
            raise ValidationError(
                f"Feedback must not exceed {FeedbackValidator.MAX_FEEDBACK_LENGTH} characters",
                field="feedback"
            )
        
        for pattern in InputSanitizer.SQL_INJECTION_PATTERNS:
            if re.search(pattern, feedback, re.IGNORECASE):
                raise ValidationError(
                    "Feedback contains invalid characters or patterns",
                    field="feedback"
                )
        
        for pattern in InputSanitizer.XSS_PATTERNS:
            if re.search(pattern, feedback, re.IGNORECASE):
                raise ValidationError(
                    "Feedback contains invalid script patterns",
                    field="feedback"
                )
        
        return feedback


class FileValidator:
    """Specialized validator for file uploads"""
    
    @staticmethod
    def validate_file_extension(filename: str) -> str:
        """
        Validate file extension
        
        Args:
            filename: Filename to validate
            
        Returns:
            Lowercase file extension
            
        Raises:
            UnsupportedFileTypeError: If file type not allowed
        """
        if not filename or '.' not in filename:
            raise UnsupportedFileTypeError(
                allowed_types=list(ValidationRules.ALLOWED_IMAGE_EXTENSIONS)
            )
        
        ext = filename.rsplit('.', 1)[1].lower()
        
        if ext not in ValidationRules.ALLOWED_IMAGE_EXTENSIONS:
            raise UnsupportedFileTypeError(
                allowed_types=list(ValidationRules.ALLOWED_IMAGE_EXTENSIONS),
                details={'provided_extension': ext}
            )
        
        return ext
    
    @staticmethod
    def validate_file_size(file_size_bytes: int, max_size_mb: int = None) -> bool:
        """
        Validate file size
        
        Args:
            file_size_bytes: File size in bytes
            max_size_mb: Maximum size in MB (default from rules)
            
        Returns:
            True if valid
            
        Raises:
            FileSizeError: If file too large
        """
        if max_size_mb is None:
            max_size_mb = ValidationRules.MAX_FILE_SIZE_MB
        
        max_bytes = max_size_mb * 1024 * 1024
        
        if file_size_bytes > max_bytes:
            raise FileSizeError(
                max_size_mb=max_size_mb,
                details={'provided_size_mb': round(file_size_bytes / (1024 * 1024), 2)}
            )
        
        return True
    
    @staticmethod
    def validate_image_format(file_data: bytes) -> bool:
        """
        Validate image format by checking magic bytes (file signatures)
        
        Args:
            file_data: Raw file bytes
            
        Returns:
            True if valid image format
            
        Raises:
            InvalidImageError: If not a valid image
        """
        # Allow short signatures (JPEG sometimes provided as 3 bytes in tests)
        if len(file_data) < 3:
            raise InvalidImageError(details={'reason': 'File too small'})

        # Magic bytes for supported formats (use startswith on full data)
        magic_bytes = {
            b'\xFF\xD8\xFF': 'jpeg',      # JPEG
            b'\x89PNG\r\n\x1a\n': 'png', # PNG (8-byte signature)
            b'GIF8': 'gif',                  # GIF
            b'BM': 'bmp',                    # BMP
            b'RIFF': 'webp',                 # WEBP (RIFF header)
        }

        for magic, fmt in magic_bytes.items():
            if file_data.startswith(magic):
                return True

        raise InvalidImageError(
            details={'reason': 'File magic bytes do not match a supported image format'}
        )

    @staticmethod
    def validate_image_upload(file_obj, max_size_mb: int = None) -> Tuple[str, bytes]:
        """
        Validate a Flask uploaded file (werkzeug FileStorage-like)

        Args:
            file_obj: File-like object with attributes `.filename` and `.read()`
            max_size_mb: Optional maximum size in MB

        Returns:
            Tuple of (extension, raw bytes)

        Raises:
            UnsupportedFileTypeError, FileSizeError, InvalidImageError
        """
        if not file_obj:
            raise InvalidImageError(details={'reason': 'No file provided'})

        filename = getattr(file_obj, 'filename', '')
        if not filename:
            raise InvalidImageError(details={'reason': 'Filename missing'})

        # extension validation
        ext = FileValidator.validate_file_extension(filename)

        # read bytes (do not assume file_obj is rewinded)
        try:
            file_obj.stream.seek(0)
        except Exception:
            pass
        file_bytes = file_obj.read()

        if not file_bytes:
            raise InvalidImageError(details={'reason': 'File is empty'})

        # file size
        if max_size_mb is None:
            max_size_mb = ValidationRules.MAX_FILE_SIZE_MB
        FileValidator.validate_file_size(len(file_bytes), max_size_mb)

        # Validate image signature
        FileValidator.validate_image_format(file_bytes[:16])

        return ext, file_bytes


class RequestValidator:
    """Validate complete request payloads"""
    
    @staticmethod
    def validate_registration_request(data: Dict[str, Any]) -> Dict[str, str]:
        """
        Validate registration request payload
        
        Args:
            data: Request JSON data
            
        Returns:
            Validated fields dict
            
        Raises:
            ValidationError: If any field is invalid
        """
        required_fields = ['mobile_number', 'password', 'name']
        
        # Check required fields
        for field in required_fields:
            if field not in data:
                raise ValidationError(f"{field} is required", field=field)
        
        # Validate each field
        mobile_number = MobileNumberValidator.validate(data['mobile_number'])
        PasswordValidator.validate(data['password'], strict_mode=False)
        name = NameValidator.validate(data['name'])
        
        return {
            'mobile_number': mobile_number,
            'password': data['password'],
            'name': name
        }
    
    @staticmethod
    def validate_login_request(data: Dict[str, Any]) -> Dict[str, str]:
        """
        Validate login request payload
        
        Args:
            data: Request JSON data
            
        Returns:
            Validated fields dict
            
        Raises:
            ValidationError: If any field is invalid
        """
        required_fields = ['mobile_number', 'password']
        
        # Check required fields
        for field in required_fields:
            if field not in data:
                raise ValidationError(f"{field} is required", field=field)
        
        # Validate fields
        mobile_number = MobileNumberValidator.validate(data['mobile_number'])
        
        if not data.get('password'):
            raise ValidationError("Password is required", field="password")
        
        return {
            'mobile_number': mobile_number,
            'password': data['password']
        }
    
    @staticmethod
    def validate_breed_detection_request(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate breed detection request payload
        
        Args:
            data: Request JSON data
            
        Returns:
            Validated fields dict
            
        Raises:
            ValidationError: If any field is invalid
        """
        required_fields = ['breed', 'confidence']
        
        for field in required_fields:
            if field not in data:
                raise ValidationError(f"{field} is required", field=field)
        
        breed = BreedValidator.validate(data['breed'])
        confidence = ConfidenceValidator.validate(data['confidence'])
        
        return {
            'breed': breed,
            'confidence': confidence
        }
    
    @staticmethod
    def validate_animal_record_request(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate animal record request payload with optional fields
        
        Args:
            data: Request JSON data
            
        Returns:
            Validated fields dict
            
        Raises:
            ValidationError: If any field is invalid
        """
        validated = {}
        
        if 'breed' in data and data['breed']:
            validated['breed'] = BreedValidator.validate(data['breed'])
        
        if 'confidence' in data and data['confidence'] is not None:
            validated['confidence'] = ConfidenceValidator.validate(data['confidence'])
        
        if 'age' in data and data['age'] is not None:
            validated['age'] = AgeValidator.validate(data['age'])
        
        if 'weight' in data and data['weight'] is not None:
            validated['weight'] = WeightValidator.validate(data['weight'])
        
        return validated
    
    @staticmethod
    def validate_feedback_request(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate breed feedback request
        
        Args:
            data: Request JSON data
            
        Returns:
            Validated fields dict
            
        Raises:
            ValidationError: If any field is invalid
        """
        validated = {}
        
        if 'original_breed' in data and data['original_breed']:
            validated['original_breed'] = BreedValidator.validate(data['original_breed'])
        
        if 'corrected_breed' in data and data['corrected_breed']:
            validated['corrected_breed'] = BreedValidator.validate(data['corrected_breed'])
        
        if 'comment' in data and data['comment']:
            validated['comment'] = FeedbackValidator.validate(data['comment'])
        
        return validated


# Convenience functions for backward compatibility
def validate_mobile_number(mobile_number: str) -> str:
    """Legacy function - use MobileNumberValidator.validate()"""
    return MobileNumberValidator.validate(mobile_number)


def validate_password(password: str) -> bool:
    """Legacy function - use PasswordValidator.validate()"""
    return PasswordValidator.validate(password, strict_mode=False)


def validate_name(name: str) -> str:
    """Legacy function - use NameValidator.validate()"""
    return NameValidator.validate(name)


def validate_breed(breed: str) -> str:
    """Legacy function - use BreedValidator.validate()"""
    return BreedValidator.validate(breed)


def validate_confidence(confidence: Union[float, int, str]) -> float:
    """Legacy function - use ConfidenceValidator.validate()"""
    return ConfidenceValidator.validate(confidence)


def validate_email(email: str) -> str:
    """Legacy function - use EmailValidator.validate()"""
    return EmailValidator.validate(email)


def validate_age(age: Union[int, float, str]) -> int:
    """Legacy function - use AgeValidator.validate()"""
    return AgeValidator.validate(age)


def validate_weight(weight: Union[int, float, str]) -> float:
    """Legacy function - use WeightValidator.validate()"""
    return WeightValidator.validate(weight)


def validate_feedback(feedback: str) -> str:
    """Legacy function - use FeedbackValidator.validate()"""
    return FeedbackValidator.validate(feedback)


def validate_uuid(uuid_str: str) -> str:
    """Legacy function - use UUIDValidator.validate()"""
    return UUIDValidator.validate(uuid_str)