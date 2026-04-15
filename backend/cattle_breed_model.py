"""
Unified Cattle Breed Classification Model
Single source of truth for model architecture and loading
"""

import os
import json
import logging
from pathlib import Path
from typing import Tuple, Dict

import torch
import torch.nn as nn
from torchvision import models

logger = logging.getLogger(__name__)


class BreedClassifierModel(nn.Module):
    """
    Unified EfficientNet-B2 based breed classification model.
    Matches the training architecture with custom head.
    """
    
    def __init__(self, num_classes: int = 5):
        super(BreedClassifierModel, self).__init__()
        # Use EfficientNetB2 WITHOUT pretrained ImageNet weights
        self.backbone = models.efficientnet_b2(weights=None)
        
        # Remove the original classifier
        self.backbone.classifier = nn.Identity()
        
        # Get the number of input features from the last block
        in_features = 1408  # EfficientNetB2 output features
        
        # Create custom classification head that matches the training architecture
        # This head contains multiple layers with batch normalization
        self.head = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten(),
            nn.Linear(in_features, 512),      # head.2
            nn.BatchNorm1d(512),               # head.3
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(512, 256),               # head.6
            nn.BatchNorm1d(256),               # head.7
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(256, num_classes)        # head.10
        )
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass through the model"""
        x = self.backbone.features(x)
        x = self.head(x)
        return x


class ModelLoader:
    """Handles model and label file loading with proper error handling"""
    
    def __init__(self, model_path: str = None, labels_path: str = None):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = None
        self.class_labels = {}
        
        # Set default paths based on project structure
        if model_path is None or labels_path is None:
            backend_dir = Path(__file__).parent
            project_root = backend_dir.parent
            models_dir = project_root / 'models' / 'trained_models'
            
            if model_path is None:
                model_path = str(models_dir / 'breed_classifier_pytorch.pth')
            if labels_path is None:
                labels_path = str(models_dir / 'class_labels.json')
        
        self.model_path = model_path
        self.labels_path = labels_path
        
        # Load labels first to determine num_classes
        self._load_labels()
        
        # Then load model
        self._load_model()
    
    def _load_labels(self) -> None:
        """Load and parse class labels from JSON file"""
        try:
            if not os.path.exists(self.labels_path):
                logger.error(f"❌ Labels file not found at: {self.labels_path}")
                self.class_labels = {}
                return
            
            with open(self.labels_path, 'r') as f:
                raw_labels = json.load(f)
                # Ensure keys are integers
                self.class_labels = {int(k): v for k, v in raw_labels.items()}
            
            logger.info(f"✓ Loaded {len(self.class_labels)} breed labels")
            for idx, breed in sorted(self.class_labels.items()):
                logger.info(f"  {idx}: {breed}")
        
        except Exception as e:
            logger.error(f"❌ Failed to load labels: {str(e)}")
            self.class_labels = {}
    
    def _load_model(self) -> None:
        """Load the trained PyTorch model state dict"""
        try:
            if not os.path.exists(self.model_path):
                logger.error(f"❌ Model file not found at: {self.model_path}")
                self.model = None
                return
            
            if not self.class_labels:
                logger.error("❌ Cannot load model: no class labels loaded")
                self.model = None
                return
            
            # Initialize model with correct number of classes
            num_classes = len(self.class_labels)
            self.model = BreedClassifierModel(num_classes=num_classes)
            
            # Load the checkpoint
            checkpoint = torch.load(self.model_path, map_location=self.device)
            
            # Extract state dict - handle various checkpoint formats
            if isinstance(checkpoint, dict):
                if 'model_state_dict' in checkpoint:
                    state_dict = checkpoint['model_state_dict']
                    logger.info("✓ Found 'model_state_dict' in checkpoint")
                elif 'state_dict' in checkpoint:
                    state_dict = checkpoint['state_dict']
                    logger.info("✓ Found 'state_dict' in checkpoint")
                else:
                    state_dict = checkpoint
                    logger.info("✓ Using checkpoint as state dict directly")
            else:
                state_dict = checkpoint
                logger.info("✓ Checkpoint is state dict (not wrapped dict)")
            
            # Load state dict with strict=False to allow for minor architecture differences
            try:
                self.model.load_state_dict(state_dict, strict=True)
                logger.info("✓ State dict loaded successfully (strict mode)")
            except RuntimeError as e:
                logger.warning(f"⚠ Strict loading failed, trying non-strict: {str(e)}")
                self.model.load_state_dict(state_dict, strict=False)
                logger.info("✓ State dict loaded successfully (non-strict mode)")
            
            # Move model to device and set to evaluation mode
            self.model = self.model.to(self.device)
            self.model.eval()
            
            logger.info("=" * 60)
            logger.info("✓ MODEL LOADED SUCCESSFULLY")
            logger.info(f"  Location: {self.model_path}")
            logger.info(f"  Device: {self.device}")
            logger.info(f"  Architecture: EfficientNetB2")
            logger.info(f"  Classes: {num_classes}")
            logger.info(f"  Mode: Evaluation (Inference Ready)")
            logger.info("=" * 60)
        
        except Exception as e:
            logger.error(f"❌ Failed to load model: {str(e)}", exc_info=True)
            self.model = None
    
    def get_breed_name(self, class_idx: int) -> str:
        """Get breed name from class index"""
        breed_name = self.class_labels.get(class_idx, f"Unknown_Class_{class_idx}")
        # Clean up the breed name
        clean_name = breed_name.replace('_', ' ')
        if clean_name.lower().endswith(' cattle'):
            clean_name = clean_name[:-7].strip()
        return clean_name
    
    def is_model_loaded(self) -> bool:
        """Check if model is loaded successfully"""
        return self.model is not None and len(self.class_labels) > 0
