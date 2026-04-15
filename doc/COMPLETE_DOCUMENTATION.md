# GowVision - Complete Documentation

**Project Name**: GowVision (AI-Powered Cattle Management System)
**Version**: 1.0.0
**Last Updated**: March 27, 2026
**Maintained By**: Development Team

---

## Table of Contents

### Part 1: Project Overview
1. [Project Introduction](#1-project-introduction)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)

### Part 2: Project Structure & Organization
4. [Project Directory Structure](#4-project-directory-structure)
5. [Key Files Reference](#5-key-files-reference)
6. [Code Organization Standards](#6-code-organization-standards)

### Part 3: Features & Functionality
7. [Core Features](#7-core-features)
8. [Feature-by-Feature Guide](#8-feature-by-feature-guide)

### Part 4: Backend Documentation
9. [Backend Architecture](#9-backend-architecture)
10. [Core Components](#10-core-components)
11. [Database Schema](#11-database-schema)
12. [Supporting Modules](#12-supporting-modules)

### Part 5: Frontend Documentation
13. [Frontend Architecture](#13-frontend-architecture)
14. [Component Hierarchy](#14-component-hierarchy)
15. [Key Components Details](#15-key-components-details)
16. [UI Components Library](#16-ui-components-library)
17. [Frontend State Management](#17-frontend-state-management)

### Part 6: API Documentation
18. [API Overview](#18-api-overview)
19. [Breed Detection API](#19-breed-detection-api)
20. [Health Analysis API](#20-health-analysis-api)
21. [Ear Tag API](#21-ear-tag-api)
22. [Government Schemes API](#22-government-schemes-api)
23. [Statistics API](#23-statistics-api)
24. [Text-to-Speech API](#24-text-to-speech-api)

### Part 7: Setup & Configuration
25. [Setup & Installation](#25-setup--installation)
26. [Environment Variables](#26-environment-variables)
27. [Configuration](#27-configuration)

### Part 8: Deployment
28. [Deployment Options](#28-deployment-options)

### Part 9: Development Guide
29. [Development Environment Setup](#29-development-environment-setup)
30. [Backend Development](#30-backend-development)
31. [Frontend Development](#31-frontend-development)
32. [Git Workflow](#32-git-workflow)
33. [Code Review Process](#33-code-review-process)
34. [Testing Guidelines](#34-testing-guidelines)
35. [Performance Optimization](#35-performance-optimization)
36. [Security Best Practices](#36-security-best-practices)

### Part 10: Quick Reference & Troubleshooting
37. [Quick Start Commands](#37-quick-start-commands)
38. [Common Commands](#38-common-commands)
39. [Troubleshooting Guide](#39-troubleshooting-guide)

---

## 1. Project Introduction

### What is GowVision?

**GowVision** is an AI-powered cattle management and livestock support system designed to empower Indian farmers with intelligent tools for:

- **Cattle Breed Identification**: Real-time AI-based cattle breed classification from images using PyTorch
- **Health Monitoring**: Intelligent health analysis and disease diagnosis using Ollama language models
- **Digital Identification**: Ear tag-based cattle tracking and record management via CSV database
- **Government Support**: Centralized access to livestock welfare schemes with automatic daily updates
- **Accessibility**: Bilingual interface (English & Hindi) with text-to-speech support

### Key Benefits

- Increases productivity through automated breed classification
- Improves animal health with AI-powered disease detection
- Simplifies compliance with digital ear tag tracking
- Reduces information barriers by centralizing government schemes
- Enhances accessibility for non-digital-native farmers through bilingual support and TTS

### Target Users

- Small and marginal farmers (primary focus)
- Livestock development officers
- Dairy cooperative societies
- Veterinary professionals
- Government agriculture departments

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Application                      │
│              (React 18 + TypeScript + Vite)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Components:                                          │   │
│  │ • BreedDetection (Image Upload & Classification)    │   │
│  │ • HealthAnalysis (Symptom-based Diagnosis)          │   │
│  │ • TagSearch (Ear Tag Lookup)                        │   │
│  │ • Schemes (Government Program Directory)            │   │
│  │ • StatsSection (Analytics Dashboard)                │   │
│  │ • LanguageSelector (i18n support)                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓ (HTTP/API)
┌─────────────────────────────────────────────────────────────┐
│              Flask REST API (Backend)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Blueprints/Modules:                                  │   │
│  │ • breed_detection_blueprint    (ML Model Handler)    │   │
│  │ • health_analysis_blueprint   (Ollama Integration)   │   │
│  │ • ear_tag_blueprint           (Tag Database)         │   │
│  │ • government_schemes_blueprint (API Management)      │   │
│  │ • stats_blueprint             (Analytics)            │   │
│  │ • tts_blueprint               (Text-to-Speech)       │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Core Services:                                       │   │
│  │ • ML Model Detector (PyTorch)                       │   │
│  │ • Scheduler (APScheduler for daily updates)         │   │
│  │ • Database ORM (SQLAlchemy)                         │   │
│  │ • Error Handling & Logging                          │   │
│  │ • Rate Limiting (Flask-Limiter)                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓ (SQL)
┌─────────────────────────────────────────────────────────────┐
│              SQLite Database                                │
│  • GovernmentScheme (Schemes & Programs)                   │
│  • SchemeUpdateLog (Update History)                        │
│  • Cattle Data (From CSV)                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓ (API Calls)
┌─────────────────────────────────────────────────────────────┐
│            External Services                                │
│  • Google Custom Search API (Scheme Updates)               │
│  • Ollama Local LLM (Health Analysis)                      │
│  • PyTorch Models (Breed Detection)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

### Backend Technologies

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | Flask | ≥3.0.0 | REST API server |
| Database ORM | SQLAlchemy | ≥3.1.1 | Database abstraction |
| ML Framework | PyTorch | ≥2.0.0 | Breed detection model |
| Image Processing | Pillow | ≥10.4.0 | Image handling |
| LLM Integration | Ollama | ≥0.3.3 | Health analysis |
| Task Scheduling | APScheduler | ≥3.10.0 | Daily scheme updates |
| Text-to-Speech | pyttsx3 | ≥2.90 | Accessibility |
| CORS | flask-cors | ≥4.0.0 | Cross-origin support |
| Rate Limiting | Flask-Limiter | ≥3.5.0 | API protection |
| Validation | phonenumbers | ≥8.13.0 | Phone validation |

### Frontend Technologies

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | React 18 | UI library |
| Language | TypeScript | Type safety |
| Build Tool | Vite | Fast bundling |
| Styling | Tailwind CSS | Utility-first CSS |
| UI Components | Radix UI | Accessible components |
| Routing | React Router | Client-side navigation |
| Icons | Lucide Icons | Icon library |
| HTTP Client | Fetch API | API communication |
| Animations | Framer Motion | Smooth transitions |

### Infrastructure & DevOps

| Component | Technology |
|-----------|-----------|
| Containerization | Docker & Docker Compose |
| Database | SQLite (development) / PostgreSQL (production) |
| Logging | Custom JSON logging |

---

## 4. Project Directory Structure

```
gowvision/
├── README.md                              # Quick start guide
├── DOCUMENTATION.md                       # [NEW - This consolidated document]
├── QUICK_REFERENCE.md                     # Quick reference guide
├── API_REFERENCE.md                       # API documentation
├── DEVELOPER_GUIDE.md                     # Development guidelines
├── SCHEMES_SETUP.md                       # Schemes management guide
├── requirements.txt                       # Python dependencies
├── docker-compose.yml                     # Container orchestration
├── Dockerfile                             # Backend container image
├── .env.example                           # Example environment variables
├── .gitignore                             # Git ignore rules
│
├── backend/                               # Flask API Server
│   ├── app.py                            # Application entry point
│   ├── models.py                         # Database models (SQLAlchemy)
│   ├── scheduler.py                      # APScheduler configuration
│   ├── errors.py                         # Custom exceptions
│   ├── logging_utils.py                  # Structured logging
│   ├── validators.py                     # Input validation
│   ├── ml_detector.py                    # ML model wrapper
│   │
│   ├── breed_detection_blueprint.py      # Breed detection API endpoints
│   ├── health_analysis_blueprint.py      # Health analysis API endpoints
│   ├── ear_tag_blueprint.py             # Tag search API endpoints
│   ├── government_schemes_blueprint.py  # Schemes management API endpoints
│   ├── stats_blueprint.py               # Analytics API endpoints
│   ├── tts_blueprint.py                 # Text-to-speech API endpoints
│   │
│   └── tests/                           # Unit tests
│       ├── test_breed_detection.py
│       ├── test_health_analysis.py
│       └── test_schemes.py
│
├── frontend/                             # React + Vite Application
│   ├── index.html                       # Entry HTML
│   ├── package.json                     # NPM dependencies
│   ├── vite.config.ts                   # Vite configuration
│   ├── tsconfig.json                    # TypeScript configuration
│   ├── postcss.config.mjs                # PostCSS configuration
│   ├── tailwind.config.js                # Tailwind CSS configuration
│   │
│   └── src/
│       ├── main.tsx                     # React entry point
│       ├── env.d.ts                     # Type definitions
│       ├── assets/                      # Static assets (images, fonts)
│       │
│       ├── lib/
│       │   └── api.ts                   # API client utilities
│       │
│       ├── styles/
│       │   ├── index.css                # Global styles
│       │   ├── tailwind.css             # Tailwind CSS directives
│       │   ├── theme.css                # CSS variables and themes
│       │   └── fonts.css                # Custom font imports
│       │
│       └── app/
│           ├── App.tsx                  # Root component
│           ├── routes.tsx               # Route definitions
│           │
│           └── components/
│               ├── Layout.tsx           # Main layout wrapper
│               ├── Home.tsx             # Landing page
│               ├── BreedDetection.tsx   # Breed detection page
│               ├── HealthAnalysis.tsx   # Health analysis page
│               ├── TagSearch.tsx        # Ear tag search page
│               ├── Schemes.tsx          # Government schemes page
│               ├── StatsSection.tsx     # Analytics page
│               ├── VideoDemo.tsx        # Demo videos
│               ├── LanguageContext.tsx  # i18n context provider
│               ├── LanguageSelector.tsx # Language switcher component
│               ├── NotFound.tsx         # 404 page
│               │
│               ├── figma/
│               │   └── ImageWithFallback.tsx  # Image wrapper component
│               │
│               └── ui/                  # Radix UI components
│                   ├── button.tsx
│                   ├── input.tsx
│                   ├── dialog.tsx
│                   ├── accordion.tsx
│                   ├── card.tsx
│                   ├── tabs.tsx
│                   └── ... (30+ UI components)
│
├── models/
│   └── trained_models/
│       ├── breed_classifier_pytorch.pth  # Pre-trained PyTorch model
│       └── class_labels.json             # Model class labels mapping
│
├── Cattle Breeds/
│   └── CATTLE_DATASET.md                # Breed reference data (CSV format)
│
├── logs/                                # Application logs directory
│   └── gowvision.log                    # Main application log file
│
└── instance/                            # SQLite database (local storage)
    └── gowvision.db                    # SQLite database file
```

---

## 5. Key Files Reference

### Backend Key Files

| File | Purpose | Key Classes/Functions |
|------|---------|----------------------|
| `app.py` | Flask application initialization | Flask app setup, blueprint registration |
| `models.py` | Database models | `GovernmentScheme`, `SchemeUpdateLog` |
| `errors.py` | Custom exceptions | `GowVisionError`, `ValidationError`, etc. |
| `validators.py` | Input validation | `validate_image_file()`, `validate_phone_number()` |
| `logging_utils.py` | Structured logging | `RequestLogger`, `SecurityLogger`, `OperationLogger` |
| `ml_detector.py` | ML model interface | `MLBreedDetector` class |
| `scheduler.py` | Task scheduling | `init_scheduler()`, scheduled jobs |
| `breed_detection_blueprint.py` | Breed detection API | `POST /api/cattle/detect-breed` |
| `health_analysis_blueprint.py` | Health analysis API | `POST /api/health-analysis/analyze` |
| `ear_tag_blueprint.py` | Tag search API | `GET /api/ear-tags/{tag_id}` |
| `government_schemes_blueprint.py` | Schemes API | CRUD operations for schemes |
| `stats_blueprint.py` | Analytics API | `GET /api/stats/` |
| `tts_blueprint.py` | Text-to-speech API | `POST /api/tts/generate` |

### Frontend Key Files

| File | Purpose |
|------|---------|
| `src/main.tsx` | React application entry point |
| `src/app/App.tsx` | Root component |
| `src/app/routes.tsx` | Route definitions |
| `src/lib/api.ts` | API client for backend communication |
| `src/components/Layout.tsx` | Main layout wrapper |
| `src/components/BreedDetection.tsx` | Breed detection feature |
| `src/components/HealthAnalysis.tsx` | Health analysis feature |
| `src/components/TagSearch.tsx` | Ear tag search feature |
| `src/components/Schemes.tsx` | Government schemes feature |
| `src/components/LanguageContext.tsx` | i18n context provider |
| `vite.config.ts` | Vite build configuration |
| `tailwind.config.js` | Tailwind CSS configuration |

---

## 6. Code Organization Standards

### Backend Code Style

**Python Naming Conventions**:
- Files: `snake_case.py`
- Classes: `PascalCase`
- Functions/Methods: `snake_case()`
- Constants: `UPPER_SNAKE_CASE`

**Type Hints**:
```python
from typing import Dict, List, Optional, Tuple, Any

def process_data(
    data: Dict[str, Any],
    limit: int = 10
) -> List[str]:
    """Process data and return results.
    
    Args:
        data: Input data dictionary
        limit: Maximum results (default: 10)
    
    Returns:
        List of processed results
    """
    return []
```

**Docstring Format** (Google style):
```python
def my_function(param1: str, param2: int) -> bool:
    """Short description.
    
    Longer description explaining what it does,
    edge cases, and important notes.
    
    Args:
        param1: Description of param1
        param2: Description of param2
    
    Returns:
        True if successful, False otherwise
    
    Raises:
        ValueError: If param1 is empty
    """
```

### Frontend Code Style

**TypeScript Naming Conventions**:
- Component Files: `PascalCase.tsx`
- Utility Files: `camelCase.ts`
- Components: `PascalCase`
- Functions: `camelCase()`
- Constants: `UPPER_SNAKE_CASE`
- Types/Interfaces: `PascalCase`

**Type Definitions**:
```tsx
interface ComponentProps {
    /** Description of itemId */
    itemId: string
    
    /** Optional callback */
    onSelect?: (id: string) => void
    
    /** Loading state */
    isLoading?: boolean
}

interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
}
```

**Functional Components**:
```tsx
interface MyComponentProps {
    title: string
}

export function MyComponent({ title }: MyComponentProps): React.ReactElement {
    const [state, setState] = useState()
    
    useEffect(() => {
        // Setup and cleanup
    }, [dependencies])
    
    return <div>{state}</div>
}
```

---

## 7. Core Features

### 1. Cattle Breed Detection
- Real-time image processing for cattle classification
- PyTorch-based deep learning model
- Confidence scores and detailed breed information
- Feedback mechanism for continuous improvement

### 2. Cattle Health Analysis
- Symptom-based health diagnostics
- AI-powered disease detection using Ollama
- Optional image upload for multimodal analysis
- Recommendations and preventive measures

### 3. Digital Ear Tag Search
- Quick cattle record lookup via ear tag ID
- CSV-based database with caching
- Animal health history and vaccination status
- Links to applicable government schemes

### 4. Government Schemes Management
- **Automatic Daily Updates**: 6 AM refresh from Google Custom Search API
- **Manual Refresh**: On-demand API synchronization
- **Admin Panel**: Add, edit, delete, manage schemes
- **Expiration Tracking**: Automatic cleanup of expired programs
- **Search & Filter**: Find relevant schemes by keywords
- **Accessibility**: Text-to-speech support, bilingual interface

### 5. Statistical Analytics
- System usage metrics and trends
- Popular breeds and health issues tracking
- Request statistics and analytics dashboard
- Real-time data visualization

### 6. Text-to-Speech (Accessibility)
- Converts content to spoken audio
- Multi-language support (English, Hindi)
- Adjustable speech rate and volume
- Offline capability using pyttsx3

---

## 8. Feature-by-Feature Guide

### Feature 1: Breed Detection

**User Flow**:
1. User uploads cattle image (JPG, PNG, WebP)
2. Image is preprocessed and normalized
3. PyTorch model generates predictions
4. Confidence scores displayed with breed information
5. User can provide feedback to improve model

**Supported Breeds**: Gir, Sahiwal, Holstein Friesian, Jersey, Brahman, and others

**Technical Details**:
- Model: PyTorch CNN
- Input: 224x224 pixel images
- Output: Breed name + confidence score (0-1)
- Processing time: ~200-300ms

### Feature 2: Health Analysis

**User Flow**:
1. User enters symptoms (comma-separated)
2. User provides breed and age (optional)
3. User uploads image (optional)
4. Ollama LLM analyzes information
5. AI generates health assessment and recommendations

**AI Model**: Ollama (default: Mistral, configurable)

**Output Includes**:
- Condition diagnosis
- Symptom identification
- Severity assessment
- Recommendations
- Preventive measures
- Emergency signs to watch

### Feature 3: Ear Tag Search

**User Flow**:
1. User enters ear tag number
2. System searches cattle database (CSV)
3. Returns matching animal records
4. Displays breed, age, health history
5. Shows applicable government schemes

**Data Source**: CSV file cached in memory for O(1) lookups

**Supported Tag Formats**:
- Breed-Year-Number: `GIR-2024-0001`
- Simple tag: `12345`

### Feature 4: Government Schemes

**User Flow**:
1. User views active government schemes
2. Can expand for detailed information
3. Can search and filter schemes
4. Can access official portals
5. Admin can manage schemes (add, edit, delete)

**Automatic Update System**:
```
Daily at 6:00 AM UTC
    ↓
1. Fetch from Google Custom Search API
2. Parse new schemes
3. Update existing schemes
4. Mark expired schemes as inactive
5. Log update statistics
6. Trigger frontend refresh
```

**Admin Features**:
- Add new schemes with details
- Edit existing schemes
- Soft delete (marks inactive)
- View update logs
- Manual API refresh button

### Feature 5: Analytics Dashboard

**Metrics Tracked**:
- Total API requests
- Breed detection requests
- Health analysis queries
- Ear tag searches
- Government scheme views
- Popular breeds and health issues

**Data Updates**: Real-time with database queries

### Feature 6: Accessibility (i18n + TTS)

**Languages Supported**: English and Hindi

**Features**:
- Real-time language switching
- Persistent language preference (LocalStorage)
- Full UI translation
- Text-to-speech support for all text
- Bilingual API responses

---

## 9. Backend Architecture

### Core Application (app.py)

**Responsibilities**:
- Initialize Flask application
- Configure SQLAlchemy database
- Setup CORS and rate limiting
- Initialize APScheduler
- Register all blueprints
- Configure logging

**Key Configuration**:
```python
# Database
DATABASE_URL = sqlite:///gowvision.db

# API
MAX_CONTENT_LENGTH = 16MB
CORS_ORIGINS = * (configurable)

# Rate Limiting
DEFAULT_LIMITS = "200 per day, 50 per hour"

# Logging
LOG_FILE = logs/gowvision.log
LOG_LEVEL = INFO
```

### Blueprint Structure

**Each blueprint follows this pattern**:

```python
# 1. Initialize blueprint
my_bp = Blueprint('feature', __name__, url_prefix='/api/feature')

# 2. Define routes
@my_bp.route('/endpoint', methods=['POST'])
def endpoint():
    try:
        # Process request
        return jsonify({'success': True}), 200
    except ValidationError as e:
        return jsonify({'success': False, 'error': str(e)}), 400
    except Exception as e:
        logger.error(str(e))
        return jsonify({'success': False, 'error': 'Server error'}), 500

# 3. Register in app.py
app.register_blueprint(my_bp)
```

---

## 10. Core Components

### 1. Breed Detection Blueprint

**Endpoint**: `POST /api/cattle/detect-breed`

**Request Parameters**:
- `image` (file, required): Image file (JPG, PNG, WebP, GIF)
- `return_breed_details` (boolean, optional): Include breed info

**Response**:
```json
{
    "success": true,
    "breed": "Gir",
    "confidence": 0.9847,
    "details": {
        "origin": "Gujarat, India",
        "description": "...",
        "characteristics": [...]
    }
}
```

### 2. Health Analysis Blueprint

**Endpoint**: `POST /api/health-analysis/analyze`

**Request (JSON)**:
```json
{
    "symptoms": "diarrhea, fever, listlessness",
    "breed": "Gir",
    "age": "5 years"
}
```

**Request (Multipart)**: Same JSON fields + `image` file

**Response**:
```json
{
    "success": true,
    "analysis": {
        "condition": "Possible Bovine Mastitis",
        "severity": "moderate",
        "recommendations": [...],
        "preventive_measures": [...]
    }
}
```

### 3. Ear Tag Blueprint

**Endpoint**: `GET /api/ear-tags/{tag_id}`

**Response**:
```json
{
    "success": true,
    "found": true,
    "animal": {
        "breed": "Gir",
        "age": "4 years",
        "owner": "Farmer Name",
        "health_records": [...]
    }
}
```

### 4. Government Schemes Blueprint

**Endpoints**:
- `GET /api/schemes/` - List all schemes
- `POST /api/schemes/` - Create scheme
- `GET /api/schemes/{id}` - Get specific scheme
- `PUT /api/schemes/{id}` - Update scheme
- `DELETE /api/schemes/{id}` - Delete scheme
- `POST /api/schemes/update/latest` - Manual refresh
- `GET /api/schemes/search` - Search via API
- `GET /api/schemes/status/update-logs` - View logs

**Database Model**:
```python
class GovernmentScheme(db.Model):
    id                      # Primary key
    title, description, details
    eligibility, benefits   # JSON arrays
    deadline, is_active
    source (manual/api/imported)
    created_at, updated_at, last_verified_at
    
    Method: is_expired()    # Check if deadline passed
```

### 5. Statistics Blueprint

**Endpoint**: `GET /api/stats/`

**Response**:
```json
{
    "success": true,
    "total_requests": 1234,
    "breed_detections": 567,
    "health_analyses": 345,
    "popular_breeds": [
        {"name": "Gir", "count": 234}
    ]
}
```

### 6. Text-to-Speech Blueprint

**Endpoint**: `POST /api/tts/generate`

**Request**:
```json
{
    "text": "Your text to speak",
    "language": "en",
    "rate": 150,
    "volume": 1.0
}
```

**Response**:
```json
{
    "success": true,
    "audio_url": "data:audio/wav;base64,...",
    "duration_seconds": 2.5
}
```

---

## 11. Database Schema

### GovernmentScheme Table

```sql
CREATE TABLE government_scheme (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    details             TEXT,
    eligibility         TEXT,              -- JSON array
    benefits            TEXT,              -- JSON array
    deadline            DATE,
    is_active           BOOLEAN DEFAULT 1,
    source              VARCHAR(50),       -- 'manual', 'api', 'imported'
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_verified_at    DATETIME
);
```

**Sample JSON Data**:

```json
// eligibility
[
    "Small farmer with < 2 hectares",
    "Animal must be registered",
    "Income < 5 lakh/year"
]

// benefits
[
    "₹50,000 subsidy",
    "Free veterinary care",
    "Training programs"
]
```

### SchemeUpdateLog Table

```sql
CREATE TABLE scheme_update_log (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp           DATETIME DEFAULT CURRENT_TIMESTAMP,
    status              VARCHAR(50),    -- 'success', 'failed', 'partial'
    schemes_added       INTEGER DEFAULT 0,
    schemes_updated     INTEGER DEFAULT 0,
    schemes_deleted     INTEGER DEFAULT 0,
    error_message       TEXT
);
```

### Cattle Data (CSV-based)

**Source**: `Cattle Breeds/CATTLE_DATASET.md`

**Schema**:
```
tag_id,breed,age,gender,owner,location,vaccination_status,health_records
GIR-2024-0001,Gir,4,Female,Farmer Name,Village,up-to-date,"[...]"
```

**Caching**: In-memory dictionary for O(1) lookups

---

## 12. Supporting Modules

### ml_detector.py - ML Model Handler

```python
class MLBreedDetector:
    def __init__(self, model_path, class_labels_path)
    def load_model(self)
    def detect_breed(image_input) -> Prediction
    def get_breed_details(breed_name) -> Dict
```

**Features**:
- Model caching
- Image preprocessing
- Confidence thresholding
- Error handling

### scheduler.py - Task Scheduling

```python
def init_scheduler(app):
    # Initialize APScheduler
    
def shutdown_scheduler():
    # Graceful shutdown

# Scheduled Jobs:
# - Daily at 6:00 AM: Update government schemes
```

### validators.py - Input Validation

```python
def validate_image_file(file)          # Check format, size, type
def validate_phone_number(phone)       # International validation
def validate_scheme_data(data)         # Scheme structure validation
```

### errors.py - Custom Exceptions

```python
class GowVisionError(Exception)              # Base exception
class ValidationError                        # Invalid input
class ModelNotLoadedError                    # ML model issues
class ImageProcessingError                   # Image handling
class PredictionError                        # Model inference
class UnsupportedFileTypeError               # File format
class FileSizeError                          # File too large
class InvalidImageError                      # Image corruption
class InternalServerError                    # Server errors
```

### logging_utils.py - Structured Logging

```python
class RequestLogger         # HTTP request logging
class SecurityLogger        # Security events
class OperationLogger       # Business logic
class PerformanceLogger     # Timing metrics
class ErrorAnalytics        # Error tracking

# Output: JSON-formatted or plaintext logs
```

---

## 13. Frontend Architecture

**Framework**: React 18 + TypeScript + Vite
**State Management**: React Context API
**Styling**: Tailwind CSS + CSS variables
**Routing**: React Router v6
**Component Library**: Radix UI (30+ accessible components)

---

## 14. Component Hierarchy

```
App (Root Component)
├── Layout (Global Wrapper)
│   ├── Header (Logo + LanguageSelector)
│   ├── Navigation (Menu Links)
│   ├── Footer
│   └── [Page Content]
│
└── Routes
    ├── / → Home
    ├── /breed-detection → BreedDetection
    ├── /health-analysis → HealthAnalysis
    ├── /tag-search → TagSearch
    ├── /schemes → Schemes
    ├── /stats → StatsSection
    ├── /demo → VideoDemo
    └── * → NotFound (404)
```

---

## 15. Key Components Details

### BreedDetection.tsx

**Features**:
1. Image upload (drag-drop or file picker)
2. Image preview with validation
3. API call to `/api/cattle/detect-breed`
4. Display results with confidence score
5. Show breed details
6. Feedback submission

**Key State**:
```tsx
const [image, setImage]              // Selected image
const [preview, setPreview]          // Image preview URL
const [loading, setLoading]          // API loading state
const [result, setResult]            // Detection result
const [error, setError]              // Error messages
```

### HealthAnalysis.tsx

**Features**:
1. Symptom selection (multiselect)
2. Animal information (breed, age)
3. Optional image upload
4. API call to `/api/health-analysis/analyze`
5. Display analysis and recommendations

**Symptoms Database**: 20+ common livestock symptoms

### TagSearch.tsx

**Features**:
1. Tag ID input
2. Debounced search
3. Animal record display
4. Applicable schemes display
5. Link generator to official portals

**Supported Formats**:
- `GIR-2024-0001` (Breed-Year-Number)
- `12345` (Simple tag)

### Schemes.tsx

**Features**:
1. Scheme list with pagination
2. Expandable scheme cards
3. Search and filter
4. Admin panel (in admin mode)
5. Manual API refresh button
6. TTS for accessibility
7. External links to official portals

**Admin Features**:
- Toggle admin mode
- Add new scheme (modal form)
- Edit scheme (placeholder for implementation)
- Delete scheme (soft delete)
- View update logs
- Manual refresh button

### StatsSection.tsx

**Features**:
1. Fetch stats from `/api/stats/`
2. Display key metrics
3. Show popular breeds
4. Show popular health issues
5. Real-time updates

### LanguageContext.tsx

**Implementation**:
```tsx
const LanguageContext = createContext<LanguageContextType>()

interface LanguageContextType {
    language: 'en' | 'hi'
    setLanguage: (lang: 'en' | 'hi') => void
    t: (key: string) => string  // Translation function
}
```

**Storage**: LocalStorage (persistent)

### LanguageSelector.tsx

**Features**:
- Language dropdown/button group
- Real-time switching
- Persistent preference
- Flag icons or text labels

---

## 16. UI Components Library

Built with **Radix UI** for accessibility and **Tailwind CSS** for styling

**30+ Components** including:
- Button, Input, Textarea
- Dialog, Alert Dialog, Drawer
- Accordion, Tabs, Collapsible
- Select, Checkbox, Radio Group, Toggle
- Card, Badge, Avatar
- Tooltip, Popover, Hover Card
- Dropdown Menu, Context Menu
- Navigation Menu, Menubar
- Breadcrumb, Pagination
- Progress, Slider
- Scroll Area, Separator
- Carousel, Aspect Ratio
- Table, Calendar, Chart
- Sonner Toast
- And more...

**Styling System**:
- Global: `src/styles/index.css`
- Tailwind: `src/styles/tailwind.css`
- Theme: `src/styles/theme.css` (CSS variables)
- Fonts: `src/styles/fonts.css`

---

## 17. Frontend State Management

**Approach**: React Context API

**Benefits**:
- No external dependencies
- Built into React
- Perfect for small to medium apps
- Easy to understand and maintain

**Current Contexts**:
1. **LanguageContext** - i18n (language preferences)
2. Could add: UserContext, ThemeContext, etc.

**Pattern**:
```tsx
const MyContext = createContext<MyContextType>()

export function MyProvider({ children }) {
    const [state, setState] = useState()
    const value = { state, setState }
    return (
        <MyContext.Provider value={value}>
            {children}
        </MyContext.Provider>
    )
}

// Usage
const { state } = useContext(MyContext)
```

---

## 18. API Overview

### Base URL
```
http://localhost:5000/api
```

### Authentication
Currently **no authentication** required. All endpoints are publicly accessible.

### Rate Limiting
- **Default**: 200 requests/day, 50/hour per IP
- **Configurable** via environment variables
- **Headers**: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

### Error Handling

**Standard Error Response**:
```json
{
    "success": false,
    "error": "error_code",
    "message": "Human-readable message",
    "details": { ... }
}
```

**HTTP Status Codes**:
- 200: OK
- 201: Created
- 400: Bad Request
- 404: Not Found
- 413: Payload Too Large
- 415: Unsupported Media Type
- 422: Unprocessable Entity
- 429: Too Many Requests
- 500: Internal Server Error
- 503: Service Unavailable

---

## 19. Breed Detection API

### POST /cattle/detect-breed

**Request**:
```bash
curl -X POST http://localhost:5000/api/cattle/detect-breed \
  -F "image=@cattle.jpg" \
  -F "return_breed_details=true"
```

**Parameters**:
| Name | Type | Required |
|------|------|----------|
| image | file | Yes |
| return_breed_details | boolean | No |

**Response (200 OK)**:
```json
{
    "success": true,
    "request_id": "uuid",
    "breed": "Gir",
    "confidence": 0.9847,
    "details": {
        "origin": "Gujarat, India",
        "characteristics": [...],
        "status": "AI Model Supported ✓"
    },
    "processing_time_ms": 245
}
```

### POST /cattle/detect-breed/feedback

**Purpose**: Submit feedback to improve model

**Request**:
```json
{
    "request_id": "uuid",
    "actual_breed": "Sahiwal",
    "confidence_level": "high",
    "feedback_text": "Model predicted Gir but this is Sahiwal"
}
```

**Response**:
```json
{
    "success": true,
    "message": "Feedback recorded successfully",
    "feedback_id": "fb_123"
}
```

---

## 20. Health Analysis API

### POST /health-analysis/analyze

**Type 1: JSON with symptoms**:
```bash
curl -X POST http://localhost:5000/api/health-analysis/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": "diarrhea, fever, listlessness",
    "breed": "Gir",
    "age": "5 years"
  }'
```

**Type 2: Multipart with image**:
```bash
curl -X POST http://localhost:5000/api/health-analysis/analyze \
  -F "image=@cattle_sick.jpg" \
  -F "symptoms=diarrhea, fever" \
  -F "breed=Holstein" \
  -F "age=3 years"
```

**Request Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| symptoms | string | Yes | Comma-separated symptoms |
| breed | string | No | Cattle breed |
| age | string | No | Animal age (e.g., "3 years") |
| image | file | No | Animal photo (multipart only) |

**Response (200 OK)**:
```json
{
    "success": true,
    "analysis": {
        "condition": "Possible Bovine Mastitis",
        "symptoms_identified": ["Fever", "Reduced milk", "Listlessness"],
        "severity": "moderate",
        "confidence": 0.82,
        "recommendations": [
            "Consult veterinarian immediately",
            "Isolate animal from herd",
            "Increase mineral supplementation"
        ],
        "preventive_measures": [
            "Maintain strict milking hygiene",
            "Regular udder cleaning",
            "Proper post-milking teat disinfection"
        ],
        "estimated_treatment_duration": "7-14 days",
        "relevant_schemes": ["Animal Health Insurance"]
    }
}
```

---

## 21. Ear Tag API

### GET /ear-tags/{tag_id}

**Request**:
```bash
curl http://localhost:5000/api/ear-tags/GIR-2024-0001
```

**Response (200 OK)**:
```json
{
    "success": true,
    "found": true,
    "tag_id": "GIR-2024-0001",
    "animal": {
        "breed": "Gir",
        "age": "4 years",
        "gender": "Female",
        "owner": "Farmer Name",
        "location": "Village, District",
        "vaccination_status": "up-to-date",
        "health_records": [
            {
                "date": "2025-10-20",
                "condition": "Healthy",
                "notes": "Routine checkup"
            }
        ]
    },
    "applicable_schemes": [
        {
            "id": 1,
            "name": "Rashtriya Gokul Mission"
        }
    ]
}
```

**Error (404)**:
```json
{
    "success": true,
    "found": false,
    "message": "No cattle record found"
}
```

---

## 22. Government Schemes API

### GET /schemes/

**Query Parameters**:
| Name | Type | Default | Max |
|------|------|---------|-----|
| skip | integer | 0 | - |
| limit | integer | 20 | 100 |
| search | string | null | - |
| include_expired | boolean | false | - |
| sort_by | string | created_at | - |
| sort_order | string | desc | - |

**Example**:
```bash
curl "http://localhost:5000/api/schemes/?limit=10&search=dairy"
```

**Response**:
```json
{
    "success": true,
    "count": 15,
    "total": 25,
    "data": [
        {
            "id": 1,
            "title": "Rashtriya Gokul Mission",
            "description": "...",
            "eligibility": [...],
            "benefits": [...],
            "deadline": "2026-12-31",
            "is_active": true
        }
    ]
}
```

### POST /schemes/

**Create Scheme**:
```json
{
    "title": "New Scheme",
    "description": "Description",
    "details": "Full details",
    "eligibility": ["Criterion 1"],
    "benefits": ["Benefit 1"],
    "deadline": "2026-12-31",
    "source": "manual"
}
```

**Response (201 Created)**:
```json
{
    "success": true,
    "id": 42,
    "message": "Scheme created successfully"
}
```

### PUT /schemes/{id}

**Update Scheme**: Same body as POST

**Response (200 OK)**:
```json
{
    "success": true,
    "message": "Scheme updated successfully"
}
```

### DELETE /schemes/{id}

**Soft Delete**: Marks scheme as inactive

**Response (200 OK)**:
```json
{
    "success": true,
    "message": "Scheme deleted successfully"
}
```

### POST /schemes/update/latest

**Manual Refresh** from Google Custom Search API

**Response (200 OK)**:
```json
{
    "success": true,
    "update_log": {
        "timestamp": "2025-03-27T10:30:00Z",
        "status": "success",
        "schemes_added": 3,
        "schemes_updated": 5,
        "schemes_deleted": 0
    }
}
```

### GET /schemes/search

**Live Search** via Google Custom Search API

**Query Parameters**:
| Name | Type | Required |
|------|------|----------|
| q | string | Yes |
| limit | integer | No |

**Example**:
```bash
curl "http://localhost:5000/api/schemes/search?q=cattle+dairy"
```

**Response**:
```json
{
    "success": true,
    "query": "cattle dairy subsidy",
    "results": [
        {
            "title": "Rashtriya Gokul Mission",
            "link": "https://...",
            "snippet": "..."
        }
    ]
}
```

### GET /schemes/status/update-logs

**View Update History**

**Query Parameters**:
| Name | Type | Default |
|------|------|---------|
| limit | integer | 50 |
| status | string | null |

**Response**:
```json
{
    "success": true,
    "logs": [
        {
            "timestamp": "2025-03-27T06:00:00Z",
            "status": "success",
            "schemes_added": 2,
            "schemes_updated": 3,
            "error_message": null
        }
    ]
}
```

---

## 23. Statistics API

### GET /stats/

**Purpose**: Get application usage statistics

**Response (200 OK)**:
```json
{
    "success": true,
    "total_requests": 1234,
    "breed_detections": 567,
    "health_analyses": 345,
    "tag_searches": 234,
    "scheme_views": 567,
    "popular_breeds": [
        {"name": "Gir", "count": 234, "percentage": 41.3},
        {"name": "Holstein", "count": 156, "percentage": 27.5}
    ],
    "popular_health_issues": [
        {"issue": "Mastitis", "count": 45, "percentage": 13.0}
    ],
    "timestamp": "2025-03-27T10:30:00Z"
}
```

---

## 24. Text-to-Speech API

### POST /tts/generate

**Purpose**: Generate speech audio from text

**Request**:
```bash
curl -X POST http://localhost:5000/api/tts/generate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Welcome to GowVision",
    "language": "en",
    "rate": 150,
    "volume": 1.0
  }'
```

**Request Parameters**:
| Name | Type | Default | Range |
|------|------|---------|-------|
| text | string | required | - |
| language | string | en | en, hi |
| rate | integer | 150 | 50-300 |
| volume | float | 1.0 | 0.0-1.0 |

**Response (200 OK)**:
```json
{
    "success": true,
    "audio_url": "data:audio/wav;base64,...",
    "duration_seconds": 2.5,
    "format": "wav",
    "sample_rate": 22050,
    "language": "en"
}
```

**Usage in Frontend**:
```javascript
const response = await fetch('/api/tts/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Text to speak', language: 'en' })
})
const data = await response.json()
const audio = new Audio(data.audio_url)
audio.play()
```

---

## 25. Setup & Installation

### Prerequisites
- Python 3.8+ with pip
- Node.js 16+ with npm
- Git 2.30+
- Ollama (optional, for health analysis)

### Backend Setup

**Step 1: Clone Repository**
```bash
git clone https://github.com/yourusername/gowvision.git
cd gowvision
```

**Step 2: Create Virtual Environment**
```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# Linux/Mac
python3 -m venv .venv
source .venv/bin/activate
```

**Step 3: Install Dependencies**
```bash
pip install -r requirements.txt
```

**Step 4: Initialize Database**
```bash
cd backend
python -c "from app import app, db; app.app_context().push(); db.create_all()"
```

**Step 5: Start Backend**
```bash
python app.py
# Server runs on http://localhost:5000
```

### Frontend Setup

**Step 1: Install Dependencies**
```bash
cd frontend
npm install
```

**Step 2: Start Development Server**
```bash
npm run dev
# Application runs on http://localhost:5173
```

**Step 3: Build for Production**
```bash
npm run build
# Output in frontend/dist/
```

### Ollama Setup (Optional)

```bash
# Install from https://ollama.ai
ollama serve          # Start Ollama server
ollama pull mistral   # Download model (or: qwen, llama2)
```

---

## 26. Environment Variables

### Backend (.env)

```env
# Flask Configuration
FLASK_ENV=development               # development or production
FLASK_DEBUG=True                    # Enable debug mode

# Database
DATABASE_URL=sqlite:///gowvision.db

# API Configuration
CORS_ORIGINS=http://localhost:5173,*
MAX_CONTENT_LENGTH=16777216         # 16MB max file size

# Logging
LOG_FILE=logs/gowvision.log
LOG_LEVEL=INFO                      # DEBUG, INFO, WARNING, ERROR
USE_JSON_LOGGING=False

# ML Models
CATTLE_DATASET_PATH=./Cattle Breeds/CATTLE_DATASET.md

# Government Schemes API
GOOGLE_SEARCH_API_KEY=<your-api-key>
# Optional: GOOGLE_SEARCH_CX=<custom-search-id>

# Ollama (Health Analysis)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral               # or: qwen, llama2

# Rate Limiting
RATE_LIMIT_STORAGE_URL=memory://

# Security (Production)
SECRET_KEY=<generate-random-key>
```

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:5000
```

---

## 27. Configuration

### GOOGLE Custom Search Setup

1. Go to https://programmablesearchengine.google.com/
2. Create a new custom search engine
3. Get API key from Google Cloud Console
4. Add to `.env`:
   ```
   GOOGLE_SEARCH_API_KEY=<your-key>
   GOOGLE_SEARCH_CX=<your-search-engine-id>
   ```

### Database Configuration

**SQLite (Development)**:
```
DATABASE_URL=sqlite:///gowvision.db
```

**PostgreSQL (Production)**:
```
DATABASE_URL=postgresql://user:password@localhost:5432/gowvision
```

### Logging Configuration

**Output Options**:
- File: `logs/gowvision.log`
- Console: Stdout
- JSON Format: Set `USE_JSON_LOGGING=True`

**Log Levels**:
- DEBUG: Detailed debugging information
- INFO: General info messages
- WARNING: Warning messages
- ERROR: Error messages only

---

## 28. Deployment Options

### Docker Deployment

**Build Image**:
```bash
docker build -t gowvision:latest .
```

**Run with Docker Compose**:
```bash
docker-compose up -d
```

### AWS Elastic Beanstalk

```bash
pip install awsebcli
eb init -p python-3.11 gowvision
eb create gowvision-env
eb deploy
```

### Google Cloud Run

```bash
gcloud builds submit --tag gcr.io/PROJECT-ID/gowvision
gcloud run deploy gowvision \
  --image gcr.io/PROJECT-ID/gowvision \
  --platform managed \
  --region us-central1
```

### Azure App Service

```bash
az group create -n gowvision-rg -l eastus
az appservice plan create -n gowvision-plan -g gowvision-rg --sku B1 --is-linux
az webapp create -g gowvision-rg -p gowvision-plan -n gowvision-app
```

---

## 29. Development Environment Setup

### IDE Configuration (VS Code)

**Recommended Extensions**:
- Python (Microsoft)
- Pylance
- ES7+ React/Redux snippets
- TypeScript Vue Plugin
- Prettier
- ESLint

**Settings** (`.vscode/settings.json`):
```json
{
    "python.linting.enabled": true,
    "[python]": {
        "editor.defaultFormatter": "ms-python.python",
        "editor.formatOnSave": true
    },
    "[typescript]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "editor.formatOnSave": true
    }
}
```

### Code Formatting

**Backend (Python)**:
```bash
pip install black flake8
black backend/
flake8 backend/ --max-line-length=100
```

**Frontend (TypeScript)**:
```bash
npm install --save-dev prettier eslint
npx prettier --write frontend/src
npm run lint
```

---

## 30. Backend Development

### Adding a New Feature

**Step 1: Create/Update Database Model**
```python
# backend/models.py
class MyModel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    
    def to_dict(self):
        return {'id': self.id, 'name': self.name}
```

**Step 2: Create Blueprint**
```python
# backend/my_feature_blueprint.py
from flask import Blueprint, request, jsonify
from models import db, MyModel

my_bp = Blueprint('my_feature', __name__, url_prefix='/api/my-feature')

@my_bp.route('/', methods=['GET'])
def get_items():
    items = MyModel.query.all()
    return jsonify({
        'success': True,
        'data': [item.to_dict() for item in items]
    }), 200

@my_bp.route('/', methods=['POST'])
def create_item():
    data = request.get_json()
    item = MyModel(name=data['name'])
    db.session.add(item)
    db.session.commit()
    return jsonify({'success': True, 'id': item.id}), 201
```

**Step 3: Register Blueprint**
```python
# backend/app.py
from my_feature_blueprint import my_bp
app.register_blueprint(my_bp)
```

---

## 31. Frontend Development

### Adding a New Component

**Step 1: Create Component**
```tsx
// frontend/src/app/components/MyComponent.tsx
interface MyComponentProps {
    title: string
}

export function MyComponent({ title }: MyComponentProps) {
    const [data, setData] = useState(null)
    
    useEffect(() => {
        fetch('/api/my-feature')
            .then(r => r.json())
            .then(setData)
    }, [])
    
    return <div>{data && <h2>{title}</h2>}</div>
}
```

**Step 2: Add to Routes**
```tsx
// frontend/src/app/routes.tsx
import { MyComponent } from './components/MyComponent'

export const routes = [
    { path: '/my-feature', element: <MyComponent title="My Feature" /> }
]
```

---

## 32. Git Workflow

### Branch Naming
```
feature/short-description          # New feature
bugfix/short-description           # Bug fix
docs/short-description             # Documentation
refactor/short-description         # Refactoring
test/short-description             # Tests
chore/short-description            # Maintenance
```

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Example**:
```
feat(breed-detection): improve model accuracy

The model now uses 5 augmentation techniques.
This increases accuracy from 92% to 94.5%.

Fixes #123
```

### Pull Request Process
1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes with meaningful commits
3. Push to remote: `git push origin feature/my-feature`
4. Create PR on GitHub with description
5. Request code review (1-2 reviewers)
6. Address feedback
7. Merge when approved: `git merge --squash feature/my-feature`

---

## 33. Code Review Process

### Reviewer Checklist

**Correctness**:
- [ ] Code solves the stated problem
- [ ] Logic is correct
- [ ] No infinite loops
- [ ] Edge cases handled

**Code Quality**:
- [ ] Follows style guidelines
- [ ] DRY principle (no duplication)
- [ ] Single responsibility functions
- [ ] Reasonable complexity
- [ ] Proper naming

**Testing**:
- [ ] Unit tests included
- [ ] Good test coverage
- [ ] Tests pass locally
- [ ] No hardcoded test data

**Security**:
- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] SQL injection prevented (SQLAlchemy)
- [ ] XSS prevention (React auto-escapes)

**Performance**:
- [ ] No N+1 queries
- [ ] Reasonable algorithm complexity
- [ ] No unnecessary re-renders
- [ ] Proper caching

---

## 34. Testing Guidelines

### Backend Testing

```python
# backend/tests/test_my_feature.py
import pytest
from app import app, db
from models import MyModel

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.drop_all()

def test_get_items(client):
    response = client.get('/api/my-feature/')
    assert response.status_code == 200
    assert response.json['success']
```

**Run Tests**:
```bash
pip install pytest pytest-flask
pytest backend/tests/ -v
```

### Frontend Testing

```tsx
// frontend/src/components/__tests__/MyComponent.test.tsx
import { render, screen } from '@testing-library/react'
import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
    it('renders component', () => {
        render(<MyComponent title="Test" />)
        expect(screen.getByText('Test')).toBeInTheDocument()
    })
})
```

**Run Tests**:
```bash
cd frontend
npm test
```

---

## 35. Performance Optimization

### Backend Optimization

**Database Queries**:
```python
# Bad: N+1 queries
for item in MyModel.query.all():
    print(item.related.name)

# Good: Eager loading
from sqlalchemy.orm import joinedload
items = MyModel.query.options(joinedload(MyModel.related)).all()
```

**Pagination**:
```python
items = MyModel.query.offset(skip).limit(limit).all()
```

**Caching**:
```python
from functools import lru_cache

@lru_cache(maxsize=128)
def get_breed_details(breed_name):
    return expensive_operation(breed_name)
```

### Frontend Optimization

**Code Splitting**:
```tsx
const MyComponent = lazy(() => import('./MyComponent'))

<Suspense fallback={<div>Loading...</div>}>
    <MyComponent />
</Suspense>
```

**Memoization**:
```tsx
const MyComponent = React.memo(({ prop }) => {
    return <div>{prop}</div>
})

const value = useMemo(() => expensiveComputation(a), [a])
```

---

## 36. Security Best Practices

### Backend Security

**Environment Variables**:
```python
# Good
API_KEY = os.getenv('API_KEY')

# Bad (hardcoded!)
API_KEY = 'sk-1234567890'
```

**Input Validation**:
```python
from validators import validate_input

try:
    validate_input(data, required=['email'])
except ValidationError as e:
    return error_response(str(e))
```

**SQL Injection Prevention** (SQLAlchemy):
```python
# Good
user = User.query.filter_by(email=email).first()

# Bad (vulnerable)
user = db.session.execute(f"SELECT * FROM user WHERE email = '{email}'")
```

### Frontend Security

**XSS Prevention** (React auto-escapes):
```tsx
// Good
<div>{userInput}</div>

// Bad
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

**API Keys**: Never store in LocalStorage
```tsx
// Bad
localStorage.setItem('auth_token', token)

// Good (if needed)
// Use httpOnly cookies or session storage only
```

---

## 37. Quick Start Commands

### One-Time Setup

```bash
# Clone and setup
git clone https://github.com/yourusername/gowvision.git
cd gowvision

# Backend
python -m venv .venv
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # Linux/Mac
pip install -r requirements.txt
cd backend && python app.py

# Frontend (new terminal)
cd frontend && npm install && npm run dev

# Ollama (new terminal, optional)
ollama serve
```

### Daily Development

```bash
# Terminal 1: Backend
source .venv/bin/activate
python app.py

# Terminal 2: Frontend
npm run dev

# Terminal 3: Ollama (if needed)
ollama serve
```

---

## 38. Common Commands

### Python/Backend
```bash
python app.py                        # Start Flask server
python -c "from app import app, db; app.app_context().push(); db.create_all()"
pytest backend/tests/ -v              # Run tests
black backend/                        # Format code
flake8 backend/                       # Lint code
```

### Node.js/Frontend
```bash
npm run dev                           # Dev server
npm run build                         # Production build
npm run preview                       # Preview build
npm test                              # Run tests
npx prettier --write src/            # Format code
npm run lint                          # Lint code
```

### Database
```bash
rm backend/gowvision.db             # Reset database
```

### Docker
```bash
docker-compose up -d                 # Start all services
docker logs gowvision-backend       # View logs
docker-compose down                  # Stop all services
```

---

## 39. Troubleshooting Guide

### Common Issues & Solutions

#### 1. Database Error: "sqlite3.OperationalError: database is locked"
**Solution**:
```bash
rm backend/gowvision.db
python app.py
```

#### 2. Model Not Loaded
**Issue**: `ModelNotLoadedError: ML model cannot be loaded`

**Solution**:
```bash
# Check model file exists
ls models/trained_models/

# Download/train model if missing
# Download from cloud storage or retrain
```

#### 3. Ollama Connection Failed
**Issue**: `ConnectionError: Cannot connect to Ollama`

**Solution**:
```bash
# Start Ollama in separate terminal
ollama serve

# Check connection
curl http://localhost:11434
```

#### 4. Invalid API Key
**Issue**: `GOOGLE_SEARCH_API_KEY not found`

**Solution**:
```bash
# Add to backend/.env
GOOGLE_SEARCH_API_KEY=your_actual_api_key

# Get key: https://console.cloud.google.com/apis/credentials
```

#### 5. CORS Errors
**Issue**: `Access to XMLHttpRequest blocked by CORS`

**Solution**:
```env
# Update backend/.env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### 6. Port Already in Use
**Issue**: `Address already in use`

**Solution**:
```bash
# Find process
lsof -i :5000    # Backend
lsof -i :5173    # Frontend

# Kill it
kill -9 <PID>
```

#### 7. Frontend API Calls Failing
**Issue**: `404 errors` from API calls

**Solution**:
```bash
# 1. Check backend running
curl http://localhost:5000/api/schemes/

# 2. Update VITE_API_URL
# frontend/.env.local
VITE_API_URL=http://localhost:5000

# 3. Clear cache and reload browser
```

#### 8. Python Package Not Found
**Issue**: `ModuleNotFoundError: No module named 'flask'`

**Solution**:
```bash
# Activate venv
source .venv/bin/activate

# Reinstall
pip install -r requirements.txt
```

#### 9. Node Modules Issues
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

#### 10. TypeScript Errors
**Solution**:
```bash
npx tsc --noEmit
cd frontend && npm run build
```

### Debug Mode

**Backend**:
```bash
FLASK_ENV=development FLASK_DEBUG=True python app.py
LOG_LEVEL=DEBUG python app.py
```

**Frontend**:
- Open DevTools: F12
- Console tab for errors
- Network tab for API calls
- React DevTools extension for component debugging

---

## Support & Resources

### Documentation Files
- `README.md` - Quick start
- `DOCUMENTATION.md` - This comprehensive guide
- `API_REFERENCE.md` - API endpoints
- `DEVELOPER_GUIDE.md` - Development practices
- `QUICK_REFERENCE.md` - Cheat sheet
- `SCHEMES_SETUP.md` - Schemes management

### External Resources
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [PyTorch Documentation](https://pytorch.org/)

### Tools
- VS Code: https://code.visualstudio.com/
- Postman: https://www.postman.com/ (API testing)
- Git: https://git-scm.com/

---

## Changelog & Versioning

### Version 1.0.0 (March 27, 2026)
- Initial release
- Breed detection system
- Health analysis with Ollama
- Government schemes management (dynamic)
- Bilingual interface (English/Hindi)
- Text-to-speech support
- Digital ear tag tracking
- Analytics dashboard

### Planned Features
- User authentication & profiles
- AI model fine-tuning interface
- Mobile app (iOS/Android)
- Blockchain-based records
- Farmers cooperative network
- Veterinary appointment booking
- Push notifications
- Advanced analytics

---

## Contributing

### Before Making Changes
1. Create issue describing your feature/fix
2. Get approval or discuss approach
3. Create properly named branch
4. Make changes with meaningful commits

### Pull Request Guidelines
1. Reference the issue number
2. Describe changes clearly
3. Include test evidence
4. Request review from 1-2 people
5. Address feedback promptly

### Code Standards
- Follow style guidelines (PEP 8 for Python, Airbnb for JS)
- Include type annotations
- Add docstrings for functions
- Write tests for new features
- Update documentation

---

## License

This project is licensed under the MIT License. See LICENSE file for details.

---

## Team & Contact

### Maintainers
- Development Team

### Getting Help
1. Check documentation and troubleshooting guide
2. Search existing issues on GitHub
3. Ask in discussions section
4. Email maintainers if needed

---

## Important Notes

⚠️ **Never Commit**:
- `.env` files with real API keys
- Database files (`*.db`)
- `node_modules/` directory
- `__pycache__/` directory
- `.vscode/` settings with secrets

✅ **Always Include**:
- Meaningful commit messages
- Comments for complex logic
- Type annotations (TypeScript/Python)
- Error handling
- Updated documentation

---

**Last Updated**: March 27, 2026
**Documentation Version**: 1.0.0
**Maintained**: Active Development
**Status**: Complete & Ready for Production

---

## Quick Navigation

- [Back to Table of Contents](#table-of-contents)
- [Backend Setup](#25-setup--installation) | [Frontend Setup](#frontend-setup)
- [API Endpoints](#22-government-schemes-api) | [Database Schema](#11-database-schema)
- [Development](#30-backend-development) | [Troubleshooting](#39-troubleshooting-guide)
- [Deployment](#28-deployment-options) | [Security](#36-security-best-practices)

