"""
Tests for validators module - Fixed version
"""

import pytest
from validators import (
    ValidationRules, BreedValidator, FileValidator, 
    MobileNumberValidator, PasswordValidator, NameValidator
)
from errors import (
    ValidationError, InvalidMobileNumberError, InvalidPasswordError, 
    InvalidNameError
)


class TestValidationRules:
    """Test validation rules constants"""
    
    def test_password_length_constraints(self):
        """Test password length constraints"""
        assert ValidationRules.MIN_PASSWORD_LENGTH == 8
        assert ValidationRules.MAX_PASSWORD_LENGTH == 128
    
    def test_file_size_limits(self):
        """Test file size limit constants"""
        assert ValidationRules.MAX_FILE_SIZE_MB == 16
        assert ValidationRules.MAX_FILE_SIZE_BYTES == 16 * 1024 * 1024


class TestBreedValidator:
    """Test breed name validation"""
    
    def test_valid_breed_name(self):
        """Test valid breed names"""
        valid_breeds = ["Holstein", "Jersey", "Brahman", "Gir"]
        for breed in valid_breeds:
            result = BreedValidator.validate(breed)
            assert result is not None
            assert isinstance(result, str)
    
    def test_invalid_breed_name_empty(self):
        """Test invalid empty breed name"""
        with pytest.raises(ValidationError):
            BreedValidator.validate("")
    
    def test_invalid_breed_name_too_short(self):
        """Test breed name too short"""
        with pytest.raises(ValidationError):
            BreedValidator.validate("A")
    
    def test_invalid_breed_name_special_chars(self):
        """Test breed name with invalid special characters"""
        with pytest.raises(ValidationError):
            BreedValidator.validate("Breed@123!")


class TestFileValidator:
    """Test file validation"""
    
    def test_valid_file_extension(self):
        """Test valid file extensions"""
        valid_files = ['image.jpg', 'photo.png', 'picture.gif', 'image.webp']
        
        for filename in valid_files:
            ext = FileValidator.validate_file_extension(filename)
            assert ext.lower() in ['jpg', 'jpeg', 'png', 'gif', 'webp']
    
    def test_invalid_file_extension(self):
        """Test invalid file extensions"""
        invalid_files = [
            'document.pdf',
            'video.mp4',
            'archive.zip',
        ]
        
        for filename in invalid_files:
            with pytest.raises(Exception):
                FileValidator.validate_file_extension(filename)
    
    def test_file_size_validation(self):
        """Test file size validation"""
        # Valid size: 1MB
        assert FileValidator.validate_file_size(1024 * 1024) == True
        # Valid size: 16MB max
        assert FileValidator.validate_file_size(16 * 1024 * 1024) == True
    
    def test_file_size_too_large(self):
        """Test file too large"""
        # 20MB exceeds default 16MB limit
        with pytest.raises(Exception):
            FileValidator.validate_file_size(20 * 1024 * 1024)


class TestMobileNumberValidator:
    """Test mobile number validation"""
    
    def test_valid_indian_mobile_numbers(self):
        """Test valid Indian mobile numbers"""
        valid_numbers = [
            "9876543210",
            "8765432109",
            "7654321098"
        ]
        
        for number in valid_numbers:
            result = MobileNumberValidator.validate(number)
            assert result is not None
    
    def test_invalid_mobile_numbers(self):
        """Test invalid mobile numbers"""
        invalid_numbers = [
            "123",           # Too short
            "9876543210a",   # Contains letter
            "a876543210",    # Starts with letter
        ]
        
        for number in invalid_numbers:
            with pytest.raises((ValidationError, InvalidMobileNumberError)):
                MobileNumberValidator.validate(number)


class TestPasswordValidator:
    """Test password validation"""
    
    def test_strong_password(self):
        """Test strong password validation"""
        strong_pwd = "SecurePass123"
        result = PasswordValidator.validate(strong_pwd)
        # Should return True for valid password
        assert result is not None
    
    def test_weak_passwords(self):
        """Test weak password rejection"""
        weak_passwords = [
            "weak",           # Too short
            "nouppercasehere",  # No uppercase
            "NOLOWERCASE",    # No lowercase
        ]
        
        for pwd in weak_passwords:
            with pytest.raises((ValidationError, InvalidPasswordError)):
                PasswordValidator.validate(pwd)
    
    def test_password_length_validation(self):
        """Test password length constraints"""
        # 7 characters - too short (min 8)
        with pytest.raises((ValidationError, InvalidPasswordError)):
            PasswordValidator.validate("Short1A")


class TestNameValidator:
    """Test name validation"""
    
    def test_valid_names(self):
        """Test valid name formats"""
        valid_names = ["John Doe", "Marie-Anne", "O'Brien"]
        
        for name in valid_names:
            result = NameValidator.validate(name)
            assert result is not None
    
    def test_invalid_names(self):
        """Test invalid name formats"""
        invalid_names = [
            "",              # Empty
            "123",           # Only numbers
            "@#$%",          # Special chars only
        ]
        
        for name in invalid_names:
            with pytest.raises((ValidationError, InvalidNameError)):
                NameValidator.validate(name)


class TestSQLInjectionPrevention:
    """Test SQL injection prevention"""
    
    def test_sql_injection_in_breed_name(self):
        """Test SQL injection attempts are prevented"""
        sql_injection_attempts = [
            "'; DROP TABLE breeds; --",
            "' OR '1'='1",
            "'; DELETE FROM breeds WHERE '1'='1",
        ]
        
        for payload in sql_injection_attempts:
            with pytest.raises(ValidationError):
                BreedValidator.validate(payload)


class TestXSSPrevention:
    """Test XSS prevention"""
    
    def test_xss_payload_detection(self):
        """Test XSS payload detection"""
        xss_payloads = [
            "<script>alert('XSS')</script>",
            "<img src=x onerror='alert(1)'>",
            "javascript:alert('XSS')",
        ]
        
        for payload in xss_payloads:
            with pytest.raises((ValidationError, InvalidNameError)):
                NameValidator.validate(payload)
