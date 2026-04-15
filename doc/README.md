# GowVision - AI-Powered Cattle Management System

A comprehensive platform combining AI-powered cattle breed classification, health analysis, ear tag identification, and access to government livestock schemes.

## Project Structure

```
gowvision/
├── backend/                    # Flask API server
│   ├── app.py                 # Main application
│   ├── breed_detection_blueprint.py
│   ├── health_analysis_blueprint.py
│   ├── ear_tag_blueprint.py
│   ├── government_schemes_blueprint.py
│   ├── validators.py          # Input validation
│   ├── errors.py              # Error handling
│   └── logging_utils.py        # Logging utilities
│
├── frontend/                  # Vite + React web application
│   ├── src/
│   │   ├── app/              # Main app structure
│   │   ├── components/       # BreedDetection, TagSearch, HealthAnalysis, Schemes
│   │   └── main.tsx          # Entry point
│   └── package.json          # Dependencies
│
├── models/                     # ML models
│   └── trained_models/       # Pre-trained models
│
├── datasets/                   # Training data
├── Cattle Breeds/             # Breed reference data
├── docker-compose.yml         # Docker setup
├── Dockerfile                 # Backend container
├── requirements.txt           # Python dependencies
└── .env                       # Configuration
```

## Features

### Backend (Flask API)
- Cattle breed detection from images using deep learning
- Automated health analysis based on livestock symptoms
- Digital ear tag identification and lookup system
- Integration with government livestock schemes and resources
- Error handling, validation, and structured logging

### Frontend (React)
- **Breed Detection**: Real-time image processing for cattle classification
- **Health Analysis**: Interactive tool for diagnosing livestock health issues
- **Ear Tag Search**: Quick lookup for animal identification and records
- **Government Schemes**: Repository of available welfare and support programs
- **Bilingual Support**: Interface available in English and Hindi
- **Responsive Design**: Optimized for mobile and desktop usage

## Quick Start

### Backend Setup
```bash
pip install -r requirements.txt
cd backend
python app.py
# Runs on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## API Endpoints

### Breed Detection
- `POST /api/detect-breed` - Detect breed from image
- `POST /api/detect-breed/feedback` - Send classification feedback

### Health & Tags
- `POST /api/health-analysis` - Get health insights based on symptoms
- `GET /api/ear-tags/{tag_id}` - Retrieve animal data via ear tag

### Schemes
- `GET /api/government-schemes` - List available schemes

## Technology Stack

**Backend**: Flask, TensorFlow/Keras, SQLAlchemy, Python-TTS
**Frontend**: React 18, React Router, Tailwind CSS, Lucide Icons

## Deployment

```bash
docker-compose up --build
```

## Environment Variables

```
DATABASE_URL=postgresql://...
FLASK_SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
API_PORT=5000
```

## Development

- Backend: Python 3.8+
- Frontend: Node.js 16+
- Database: PostgreSQL (recommended)
- ML Framework: TensorFlow 2.15+

## Project Status

✅ Backend API - Production Ready
✅ Frontend - Production Ready  
✅ Authentication - Implemented
✅ Marketplace - Implemented
✅ ML Models - Trained

## Next Steps

1. Configure PostgreSQL database
2. Train breed classification models
3. Deploy to production server
4. Add SSL certificate for HTTPS

---

**Version**: 1.0.0  
**Last Updated**: November 2025
