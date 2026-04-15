"""
Custom error classes for GowVision application
"""


class GowVisionError(Exception):
    """Base exception class for all GowVision-specific errors"""
    
    def __init__(self, message, status_code=500, error_code=None):
        """
        Initialize GowVisionError
        
        Args:
            message: Error message
            status_code: HTTP status code (default 500)
            error_code: Custom error code for client identification
        """
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        super().__init__(self.message)
    
    def to_dict(self):
        """Convert error to dictionary for JSON serialization"""
        error_dict = {
            'error': self.error_code or 'ERROR',
            'message': self.message
        }
        return error_dict


class ValidationError(GowVisionError):
    """Raised when input validation fails"""
    
    def __init__(self, message, error_code="VALIDATION_ERROR", field=None):
        self.field = field
        super().__init__(message, status_code=400, error_code=error_code)
    
    def to_dict(self):
        error_dict = super().to_dict()
        if self.field:
            error_dict['field'] = self.field
        return error_dict


class InvalidCredentialsError(GowVisionError):
    """Raised when authentication credentials are invalid"""
    
    def __init__(self, message="Invalid credentials", error_code="INVALID_CREDENTIALS"):
        super().__init__(message, status_code=401, error_code=error_code)


class ModelNotLoadedError(GowVisionError):
    """Raised when ML model fails to load"""
    
    def __init__(self, message="Model not loaded", error_code="MODEL_NOT_LOADED"):
        super().__init__(message, status_code=503, error_code=error_code)


class PredictionError(GowVisionError):
    """Raised when breed prediction fails"""
    
    def __init__(self, message="Prediction failed", error_code="PREDICTION_ERROR"):
        super().__init__(message, status_code=500, error_code=error_code)


class InvalidImageError(GowVisionError):
    """Raised when image is invalid or unsupported"""
    
    def __init__(self, message="Invalid image", error_code="INVALID_IMAGE"):
        super().__init__(message, status_code=400, error_code=error_code)


class FileSizeError(GowVisionError):
    """Raised when file size exceeds limit"""
    
    def __init__(self, message="File size exceeds limit", error_code="FILE_SIZE_ERROR", max_size_mb=None):
        if max_size_mb and not message.startswith("File size exceeds limit"):
            message = f"File size exceeds limit of {max_size_mb}MB"
        elif max_size_mb:
            message = f"File size exceeds limit of {max_size_mb}MB"
        super().__init__(message, status_code=413, error_code=error_code)


class AnimalNotFoundError(GowVisionError):
    """Raised when animal record is not found"""
    
    def __init__(self, message="Animal not found", error_code="ANIMAL_NOT_FOUND"):
        super().__init__(message, status_code=404, error_code=error_code)


class InternalServerError(GowVisionError):
    """Raised for internal server errors"""
    
    def __init__(self, message="Internal server error", error_code="INTERNAL_SERVER_ERROR"):
        super().__init__(message, status_code=500, error_code=error_code)


class InvalidMobileNumberError(GowVisionError):
    """Raised when mobile number validation fails"""
    
    def __init__(self, message="Invalid mobile number", error_code="INVALID_MOBILE_NUMBER", details=None):
        self.details = details
        super().__init__(message, status_code=400, error_code=error_code)
    
    def to_dict(self):
        error_dict = super().to_dict()
        if self.details:
            error_dict['details'] = self.details
        return error_dict


class InvalidPasswordError(GowVisionError):
    """Raised when password validation fails"""
    
    def __init__(self, message="Invalid password", error_code="INVALID_PASSWORD"):
        super().__init__(message, status_code=400, error_code=error_code)


class InvalidNameError(GowVisionError):
    """Raised when name validation fails"""
    
    def __init__(self, message="Invalid name", error_code="INVALID_NAME"):
        super().__init__(message, status_code=400, error_code=error_code)


class UnsupportedFileTypeError(GowVisionError):
    """Raised when file type is not supported"""
    
    def __init__(self, message="Unsupported file type", error_code="UNSUPPORTED_FILE_TYPE"):
        super().__init__(message, status_code=400, error_code=error_code)


class AccountLockedError(GowVisionError):
    """Raised when account is locked"""
    
    def __init__(self, message="Account is locked", error_code="ACCOUNT_LOCKED"):
        super().__init__(message, status_code=403, error_code=error_code)


class MobileNumberAlreadyRegisteredError(GowVisionError):
    """Raised when mobile number is already registered"""
    
    def __init__(self, message="Mobile number already registered", error_code="MOBILE_ALREADY_REGISTERED"):
        super().__init__(message, status_code=409, error_code=error_code)


class ImageProcessingError(GowVisionError):
    """Raised when image processing fails"""
    
    def __init__(self, message="Image processing failed", error_code="IMAGE_PROCESSING_ERROR"):
        super().__init__(message, status_code=500, error_code=error_code)


class DatabaseError(GowVisionError):
    """Raised when database operation fails"""
    
    def __init__(self, message="Database error", error_code="DATABASE_ERROR"):
        super().__init__(message, status_code=500, error_code=error_code)


class UserNotFoundError(GowVisionError):
    """Raised when user is not found"""
    
    def __init__(self, message="User not found", error_code="USER_NOT_FOUND"):
        super().__init__(message, status_code=404, error_code=error_code)


class TransactionError(GowVisionError):
    """Raised when database transaction fails"""
    
    def __init__(self, message="Transaction failed", error_code="TRANSACTION_ERROR"):
        super().__init__(message, status_code=500, error_code=error_code)


class ErrorContext:
    """Context manager for error handling"""
    
    def __init__(self, operation_name, logger=None):
        self.operation_name = operation_name
        self.logger = logger
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            if self.logger:
                self.logger.error(f"Error in {self.operation_name}: {exc_val}")
        return False
