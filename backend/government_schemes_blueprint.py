from flask import Blueprint, jsonify, request
import logging
import os
import requests
from datetime import datetime, date, timedelta
from models import db, GovernmentScheme, SchemeUpdateLog
from scheme_utils import clean_expired_schemes, fetch_latest_schemes, log_update
import json
from functools import lru_cache
import time

schemes_bp = Blueprint('schemes', __name__, url_prefix='/api/schemes')
logger = logging.getLogger(__name__)

# Simple cache for schemes  
_schemes_cache = {
    'data': None,
    'timestamp': 0,
    'ttl': 300  # 5 minute cache
}

# Default government schemes data
DEFAULT_SCHEMES = [
    {
        "id": "rgm",
        "title": "Rashtriya Gokul Mission (RGM)",
        "description": "Conservation and development of indigenous bovine breeds.",
        "details": "The Rashtriya Gokul Mission aims to conserve and develop indigenous bovine breeds in a focused and scientific manner. It focuses on breed improvement, semen station strengthening, and high genetic merit breed induction.",
        "eligibility": [
            "Individual Farmers",
            "SHGs",
            "FPOs",
            "Dairy Cooperatives",
            "Gaushalas"
        ],
        "benefits": [
            "50% subsidy for setting up breed multiplication farms",
            "Incentive for IVF pregnancies (₹5000/assured pregnancy)",
            "Sex-sorted semen at subsidized rates (₹250/dose)",
            "Nationwide Artificial Insemination (AI) coverage"
        ],
        "deadline": "2026-12-31",
        "link": "https://dahd.nic.in/schemes/programmes/rashtriya-gokul-mission",
        "icon": "Building2",
        "color": "bg-emerald-500"
    },
    {
        "id": "nlm",
        "title": "National Livestock Mission (NLM)",
        "description": "Entrepreneurship development and breed improvement in livestock.",
        "details": "NLM focuses on employment generation, entrepreneurship development, and enhancing per-animal productivity. It covers poultry, sheep, goat, piggery, and also camels, horses, and donkeys.",
        "eligibility": [
            "Individual entrepreneurs",
            "FPOs",
            "SHGs",
            "JLGs",
            "Section 8 companies"
        ],
        "benefits": [
            "50% capital subsidy up to ₹50 lakh for setting up livestock units",
            "Subsidy for fodder seed production (₹100-250/kg)",
            "Livestock insurance support",
            "Training and skill development"
        ],
        "deadline": "2026-12-31",
        "link": "https://nlm.udyamimitra.in/",
        "icon": "HandCoins",
        "color": "bg-blue-500"
    },
    {
        "id": "ahidf",
        "title": "Animal Husbandry Infrastructure Development Fund (AHIDF)",
        "description": "Incentivizing investments in dairy and meat processing.",
        "details": "AHIDF provides financial support for setting up dairy processing, meat processing, animal feed plants, and breed multiplication farms.",
        "eligibility": [
            "MSMEs",
            "Private companies",
            "FPOs",
            "Section 8 companies",
            "Individual entrepreneurs"
        ],
        "benefits": [
            "3% interest subvention for 8 years",
            "Credit guarantee coverage up to 25% of the term loan",
            "Loan up to 90% of the project cost from scheduled banks"
        ],
        "deadline": "2026-12-31",
        "link": "https://ahidf.udyamimitra.in/",
        "icon": "Wallet",
        "color": "bg-amber-500"
    },
    {
        "id": "deds",
        "title": "Dairy Entrepreneurship Development Scheme (DEDS)",
        "description": "Promoting entrepreneurship in dairy sector with financial support.",
        "details": "DEDS supports dairy entrepreneurs through financial assistance, training, and market linkage support. It focuses on establishing modern dairy farms with improved animal husbandry practices and milk production technologies.",
        "eligibility": [
            "Individual dairy farmers",
            "Milk producers groups",
            "Dairy SHGs",
            "Youth entrepreneurs (18-45 years)",
            "Women dairy producers"
        ],
        "benefits": [
            "40% subsidy on dairy equipment",
            "Interest-free loans up to ₹10 lakh for 5 years",
            "Free veterinary health camps",
            "Market linkage and supply chain support",
            "Skill development training (6 months)"
        ],
        "deadline": "2027-03-31",
        "link": "https://dahd.nic.in/schemes/deds",
        "icon": "Wallet",
        "color": "bg-blue-500"
    },
    {
        "id": "pmfby",
        "title": "Pradhan Mantri Fasal Bima Yojana (PMFBY) - Livestock Coverage",
        "description": "Comprehensive insurance coverage for livestock farming.",
        "details": "Extended livestock coverage under PMFBY provides insurance against death losses due to disease, accident, or natural calamity. Premium rates are heavily subsidized by government for small and marginal farmers.",
        "eligibility": [
            "All livestock owners",
            "Tenant farmers",
            "Sharecroppers",
            "Dairy cooperative members",
            "Individual cattle/buffalo owners"
        ],
        "benefits": [
            "Full death coverage at subsidized premium",
            "Premium subsidy of 90% for SC/ST farmers",
            "Premium subsidy of 80% for small farmers",
            "Quick claim settlement within 30 days",
            "Coverage across India"
        ],
        "deadline": "2026-06-30",
        "link": "https://pmfby.gov.in/",
        "icon": "Shield",
        "color": "bg-orange-600"
    },
    {
        "id": "pmmsy",
        "title": "Pradhan Mantri Matsya Sampada Yojana - Livestock Component",
        "description": "Integrated fisheries and livestock development program.",
        "details": "PMMSY promotes sustainable development of fisheries and livestock sectors. The livestock component supports cattle and buffalo farming with integrated enterprise models.",
        "eligibility": [
            "Individual farmers",
            "FPO members",
            "SHGs with livestock focus",
            "Livestock farmer collectives",
            "Cooperative societies"
        ],
        "benefits": [
            "Capital subsidy up to ₹5 lakh per unit",
            "Training in integrated livestock-fish farming",
            "Access to improved cattle breeds (50% subsidy)",
            "Cold chain and storage facility support",
            "Market linkage and brand development"
        ],
        "deadline": "2027-06-30",
        "link": "https://pmmsy.dpiit.gov.in/",
        "icon": "Building2",
        "color": "bg-blue-600"
    },
    {
        "id": "isam",
        "title": "Integrated Scheme for Agricultural Marketing (ISAM)",
        "description": "Market infrastructure development for agricultural products.",
        "details": "ISAM provides financial assistance for construction of rural markets and setting up of dairy collection centers, CHCP, and milk testing labs within village limits.",
        "eligibility": [
            "Gram Panchayats",
            "Village cooperatives",
            "FPOs",
            "Dairy unions",
            "Individual entrepreneurs"
        ],
        "benefits": [
            "50% capital subsidy for market infrastructure",
            "Grants for quality testing equipment",
            "Technical assistance for facility design",
            "Training for market management",
            "Eligibility for value addition support"
        ],
        "deadline": "2026-09-30",
        "link": "https://fsi.nic.in/isam",
        "icon": "HandCoins",
        "color": "bg-purple-600"
    },
    {
        "id": "nddb-prog",
        "title": "NDDB Cooperative Dairy Development Program",
        "description": "Official cooperative dairy development by National Dairy Development Board.",
        "details": "NDDB works with cooperatives to enhance milk production, quality, and farmer income. Focus on improved animal genetics, feed and fodder development, and veterinary services.",
        "eligibility": [
            "Registered dairy cooperatives",
            "Milk producer cooperative societies",
            "Village dairy societies",
            "Dairy farmers in cooperative system",
            "Gaushalas with commercial focus"
        ],
        "benefits": [
            "Subsidy up to ₹50,000 per member for quality cattle",
            "Free AI services (50% subsidy on semen)",
            "Fodder development support (60% subsidy)",
            "Milk testing and quality control labs (cost reimbursement)",
            "Personalized advisory services"
        ],
        "deadline": "2027-12-31",
        "link": "https://nddb.coop.net/dairy-development-programs/",
        "icon": "Building2",
        "color": "bg-green-600"
    },
    {
        "id": "cattle-insurance",
        "title": "Livestock Insurance Scheme (Private & Government)",
        "description": "Comprehensive insurance coverage for cattle and buffalo.",
        "details": "Insurance scheme covering accidental death, disease, and mortality. Both government and private insurance providers offer customized livestock insurance with flexible premium options.",
        "eligibility": [
            "All cattle and buffalo owners",
            "Dairy farmers",
            "Dairy cooperatives",
            "SHG members",
            "FPO members"
        ],
        "benefits": [
            "Coverage from ₹25,000 to ₹5,00,000 per animal",
            "Government premium subsidy up to 50%",
            "Cashless treatment at network veterinary hospitals",
            "Claim settlement in 7-15 days",
            "Optional health check-up services"
        ],
        "deadline": "2026-12-31",
        "link": "https://dahd.nic.in/livestock-insurance",
        "icon": "Shield",
        "color": "bg-orange-500"
    },
    {
        "id": "cattle-feed-subsidy",
        "title": "Concessional Cattle Feed & Fodder Subsidy Scheme",
        "description": "Affordable feed and fodder for dairy cattle.",
        "details": "Program provides subsidized cattle feed and quality fodder through government recognized suppliers. Ensures nutritional requirement for higher milk production with reduced farming costs.",
        "eligibility": [
            "Small and marginal dairy farmers",
            "Dairy cooperatives",
            "Livestock SHGs",
            "Gaushalas",
            "Commercial dairy farms (up to 50 animals)"
        ],
        "benefits": [
            "40% subsidy on quality cattle feed",
            "50% subsidy on hybrid fodder seeds",
            "Free nutritional advisory",
            "Direct supply from nearby dairy feed centers",
            "Nutritious mineral mixture at subsidized rates"
        ],
        "deadline": "2027-03-31",
        "link": "https://dahd.nic.in/feed-fodder-subsidies",
        "icon": "HandCoins",
        "color": "bg-amber-600"
    },
    {
        "id": "ai-network",
        "title": "Nationwide Artificial Insemination Network - AI Services",
        "description": "Government-supported AI service centers for cattle breeding.",
        "details": "Extensive network of government AI centers providing subsidized artificial insemination services promoting genetic improvement of cattle breeds. Free or subsidized semen and services for small farmers.",
        "eligibility": [
            "All cattle possessed farmers",
            "Dairy farmers with milking cattle",
            "Breeding farmers",
            "Cooperative members",
            "Individual dairy entrepreneurs"
        ],
        "benefits": [
            "Subsidized AI services (₹50-150 per service)",
            "Access to superior quality semen",
            "Trained inseminators at village level",
            "Free pregnancy diagnosis",
            "Technical guidance for breed selection"
        ],
        "deadline": "2027-03-31",
        "link": "https://dahd.nic.in/ai-services",
        "icon": "Building2",
        "color": "bg-cyan-600"
    }
]


def initialize_default_schemes():
    """Initialize database with default schemes"""
    try:
        for scheme_data in DEFAULT_SCHEMES:
            existing = GovernmentScheme.query.filter_by(id=scheme_data['id']).first()
            if not existing:
                scheme = GovernmentScheme.from_dict(scheme_data)
                scheme.source = 'manual'
                scheme.last_verified_at = datetime.utcnow()
                db.session.add(scheme)
        db.session.commit()
        logger.info(f"Initialized {len(DEFAULT_SCHEMES)} default schemes")
    except Exception as e:
        logger.error(f"Error initializing default schemes: {e}")
        db.session.rollback()


@schemes_bp.route('/', methods=['GET'])
def get_schemes():
    """Get all active schemes from database with pagination support"""
    clean_expired_schemes()
    
    try:
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)  # Max 100 per page
        search_query = request.args.get('search', '', type=str)
        
        # Validate pagination parameters
        if page < 1:
            page = 1
        if per_page < 1:
            per_page = 20
        
        # Check cache
        current_time = time.time()
        if _schemes_cache['data'] and (current_time - _schemes_cache['timestamp']) < _schemes_cache['ttl']:
            cached_schemes = _schemes_cache['data']
        else:
            # Fetch from database
            query = GovernmentScheme.query.filter_by(is_active=True)
            
            # Apply search filter if provided
            if search_query:
                search_filter = f"%{search_query}%"
                query = query.filter(
                    db.or_(
                        GovernmentScheme.title.ilike(search_filter),
                        GovernmentScheme.description.ilike(search_filter),
                        GovernmentScheme.id.ilike(search_filter)
                    )
                )
            
            cached_schemes = query.all()
            _schemes_cache['data'] = cached_schemes
            _schemes_cache['timestamp'] = current_time
        
        # Apply pagination
        total = len(cached_schemes)
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated_schemes = cached_schemes[start_idx:end_idx]
        
        return jsonify({
            "status": "success",
            "data": [scheme.to_dict() for scheme in paginated_schemes],
            "count": len(paginated_schemes),
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total + per_page - 1) // per_page
        }), 200
    except Exception as e:
        logger.error(f"Error fetching schemes: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@schemes_bp.route('/<scheme_id>', methods=['GET'])
def get_scheme(scheme_id):
    """Get a specific scheme by ID"""
    try:
        scheme = GovernmentScheme.query.filter_by(id=scheme_id, is_active=True).first()
        if not scheme:
            return jsonify({
                "status": "error",
                "message": "Scheme not found"
            }), 404
        
        return jsonify({
            "status": "success",
            "data": scheme.to_dict()
        }), 200
    except Exception as e:
        logger.error(f"Error fetching scheme: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@schemes_bp.route('/', methods=['POST'])
def create_scheme():
    """Create a new scheme (frontend management)"""
    try:
        data = request.get_json()
        
        if not data or not data.get('id'):
            return jsonify({
                "status": "error",
                "message": "Missing required field: id"
            }), 400
        
        # Check if scheme already exists
        if GovernmentScheme.query.filter_by(id=data['id']).first():
            return jsonify({
                "status": "error",
                "message": f"Scheme with ID '{data['id']}' already exists"
            }), 409
        
        scheme = GovernmentScheme.from_dict(data)
        scheme.source = 'manual'
        
        db.session.add(scheme)
        db.session.commit()
        
        log_update('manual', added=1, message=f"Created scheme: {scheme.title}")
        
        logger.info(f"Created new scheme: {scheme.id}")
        return jsonify({
            "status": "success",
            "message": "Scheme created successfully",
            "data": scheme.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating scheme: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@schemes_bp.route('/<scheme_id>', methods=['PUT'])
def update_scheme(scheme_id):
    """Update an existing scheme"""
    try:
        scheme = GovernmentScheme.query.filter_by(id=scheme_id).first()
        if not scheme:
            return jsonify({
                "status": "error",
                "message": "Scheme not found"
            }), 404
        
        data = request.get_json()
        
        # Update fields if provided
        if 'title' in data:
            scheme.title = data['title']
        if 'description' in data:
            scheme.description = data['description']
        if 'details' in data:
            scheme.details = data['details']
        if 'eligibility' in data:
            scheme.eligibility = json.dumps(data['eligibility'])
        if 'benefits' in data:
            scheme.benefits = json.dumps(data['benefits'])
        if 'deadline' in data and data['deadline']:
            from datetime import datetime as dt
            if isinstance(data['deadline'], str):
                scheme.deadline = dt.fromisoformat(data['deadline']).date()
            else:
                scheme.deadline = data['deadline']
        if 'link' in data:
            scheme.link = data['link']
        if 'icon' in data:
            scheme.icon = data['icon']
        if 'color' in data:
            scheme.color = data['color']
        if 'is_active' in data:
            scheme.is_active = data['is_active']
        
        scheme.updated_at = datetime.utcnow()
        db.session.commit()
        
        log_update('manual', updated=1, message=f"Updated scheme: {scheme.title}")
        logger.info(f"Updated scheme: {scheme.id}")
        
        return jsonify({
            "status": "success",
            "message": "Scheme updated successfully",
            "data": scheme.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating scheme: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@schemes_bp.route('/<scheme_id>', methods=['DELETE'])
def delete_scheme(scheme_id):
    """Delete a scheme (soft delete - mark as inactive)"""
    try:
        scheme = GovernmentScheme.query.filter_by(id=scheme_id).first()
        if not scheme:
            return jsonify({
                "status": "error",
                "message": "Scheme not found"
            }), 404
        
        scheme.is_active = False
        db.session.commit()
        
        log_update('manual', deleted=1, message=f"Deleted scheme: {scheme.title}")
        logger.info(f"Deleted scheme: {scheme.id}")
        
        return jsonify({
            "status": "success",
            "message": "Scheme deleted successfully"
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting scheme: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@schemes_bp.route('/search', methods=['GET'])
def search_schemes():
    """Search for latest government schemes using Google Search API"""
    api_key = os.getenv('GOOGLE_SEARCH_API_KEY')
    cx = os.getenv('GOOGLE_SEARCH_CX')
    
    if not api_key:
        logger.warning("GOOGLE_SEARCH_API_KEY not found in environment")
        return jsonify({
            "status": "error",
            "message": "API key not configured"
        }), 500
        
    if not cx:
        logger.warning("GOOGLE_SEARCH_CX (Search Engine ID) not found in environment")
        return jsonify({
            "status": "partial_success",
            "message": "Live search requires Google Search CX ID. Please configure it in .env",
            "data": []
        }), 200

    query = request.args.get('q', 'latest government schemes for cattle in India 2024 2025')
    url = f"https://www.googleapis.com/customsearch/v1?key={api_key}&cx={cx}&q={query}"
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        search_results = response.json()
        
        latest_schemes = []
        for idx, item in enumerate(search_results.get('items', [])[:5]):
            latest_schemes.append({
                "id": f"search_{idx}",
                "title": item.get('title'),
                "description": item.get('snippet'),
                "link": item.get('link'),
                "source": "Google Live Search"
            })
            
        return jsonify({
            "status": "success",
            "data": latest_schemes,
            "count": len(latest_schemes)
        }), 200
        
    except Exception as e:
        logger.error(f"Error searching for schemes: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@schemes_bp.route('/update/latest', methods=['POST'])
def update_latest_schemes():
    """Manually trigger update of latest schemes from API"""
    try:
        schemes, error = fetch_latest_schemes()
        
        if error:
            log_update('manual', status='failed', message=error)
            return jsonify({
                "status": "error",
                "message": error
            }), 500
        
        added = 0
        updated = 0
        
        for scheme_data in schemes:
            existing = GovernmentScheme.query.filter_by(id=scheme_data['id']).first()
            if existing:
                # Update existing
                for key, value in scheme_data.items():
                    setattr(existing, key, value)
                existing.last_verified_at = datetime.utcnow()
                updated += 1
            else:
                # Create new
                scheme = GovernmentScheme.from_dict(scheme_data)
                db.session.add(scheme)
                added += 1
        
        db.session.commit()
        log_update('manual', added=added, updated=updated, message="Updated from API")
        
        logger.info(f"Updated schemes: Added={added}, Updated={updated}")
        return jsonify({
            "status": "success",
            "message": f"Updated schemes. Added: {added}, Updated: {updated}"
        }), 200
    except Exception as e:
        db.session.rollback()
        log_update('manual', status='failed', message=str(e))
        logger.error(f"Error updating latest schemes: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@schemes_bp.route('/status/update-logs', methods=['GET'])
def get_update_logs():
    """Get recent scheme update logs"""
    try:
        limit = request.args.get('limit', 20, type=int)
        logs = SchemeUpdateLog.query.order_by(SchemeUpdateLog.timestamp.desc()).limit(limit).all()
        
        return jsonify({
            "status": "success",
            "data": [log.to_dict() for log in logs],
            "count": len(logs)
        }), 200
    except Exception as e:
        logger.error(f"Error fetching update logs: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
