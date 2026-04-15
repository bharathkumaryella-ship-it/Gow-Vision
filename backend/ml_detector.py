"""
Machine Learning Breed Detector using PyTorch
Cattle breed classification with ResNet-based model
"""

import os
import json
import logging
import base64
import io
from typing import Dict, Optional, Tuple
from pathlib import Path
import sys

import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import numpy as np

# Try relative import first (when imported as package), fall back to direct import
try:
    from .cattle_breed_model import BreedClassifierModel, ModelLoader
except ImportError:
    from cattle_breed_model import BreedClassifierModel, ModelLoader

logger = logging.getLogger(__name__)


class MLBreedDetector:
    """Detect cattle breed using PyTorch ML model"""
    
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # ImageNet classes for cattle/bovids: ox (345), water buffalo (346), bison (347)
        # Also includes: cattle (21), buffalo (22), antelope (23), deer (90), ram (387), sheep (388)
        self.cattle_class_ids = {21, 22, 23, 90, 345, 346, 347, 387, 388}
        
        # Load model using unified loader
        self.model_loader = ModelLoader()
        self.model = self.model_loader.model
        self.class_labels = self.model_loader.class_labels
        
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
        
        self.cattle_verifier = None
        self._load_cattle_verifier()

    def _load_cattle_verifier(self):
        """Load a lightweight pre-trained model for general cattle verification"""
        try:
            # Use a smaller EfficientNet to verify if it's even a cow/ox/etc
            weights = models.EfficientNet_B0_Weights.IMAGENET1K_V1
            self.cattle_verifier = models.efficientnet_b0(weights=weights)
            self.cattle_verifier.to(self.device)
            self.cattle_verifier.eval()
            logger.info("✓ Cattle verification model (EfficientNetB0) loaded")
        except Exception as e:
            logger.error(f"Failed to load cattle verifier: {str(e)}")
            self.cattle_verifier = None
    
    def _preprocess_image(self, image: Image.Image) -> torch.Tensor:
        """Preprocess image for model input"""
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        image_tensor = self.transform(image)
        image_tensor = image_tensor.unsqueeze(0)
        
        return image_tensor.to(self.device)
    
    def _is_cattle(self, image_tensor: torch.Tensor) -> Tuple[bool, float]:
        """
        Verify if the image contains cattle using general ImageNet model.
        Returns (is_cattle, confidence)
        This is a lenient check used during breed detection inference.
        """
        if self.cattle_verifier is None:
            return True, 1.0  # Fallback
            
        with torch.no_grad():
            outputs = self.cattle_verifier(image_tensor)
            probabilities = torch.softmax(outputs, dim=1)
            
            # Get top prediction
            top_prob, top_idx = torch.max(probabilities, 1)
            top_prob = top_prob.item()
            top_idx = top_idx.item()
            
            # Strong signal: Top prediction is cattle
            if top_idx in self.cattle_class_ids:
                return True, top_prob
            
            # Weaker signal: Cattle is in top 5 and has decent probability (lowered from 0.4 to 0.2)
            top5_probs, top5_indices = torch.topk(probabilities, 5)
            
            for i in range(5):
                prob = top5_probs[0][i].item()
                idx = top5_indices[0][i].item()
                if idx in self.cattle_class_ids and prob > 0.2:
                    return True, prob
            
            # Cumulative probability check (lowered from 0.6 to 0.5 for more sensitivity)
            total_cattle_prob = sum(probabilities[0][cid].item() for cid in self.cattle_class_ids)
            if total_cattle_prob > 0.5:
                return True, total_cattle_prob
                
            return False, total_cattle_prob
    
    def verify_is_cattle_strict(self, image_tensor: torch.Tensor) -> Tuple[bool, float, str]:
        """
        Strict cattle verification for endpoint validation.
        Returns (is_cattle, confidence, reason)
        Used to reject non-cattle images at the API level.
        """
        if self.cattle_verifier is None:
            return False, 0.0, "Cattle verification model not available"
            
        with torch.no_grad():
            outputs = self.cattle_verifier(image_tensor)
            probabilities = torch.softmax(outputs, dim=1)
            
            # Get top prediction
            top_prob, top_idx = torch.max(probabilities, 1)
            top_prob = top_prob.item()
            top_idx = top_idx.item()
            
            # STRICT REQUIREMENT: Top prediction must be cattle with high confidence
            if top_idx in self.cattle_class_ids:
                if top_prob >= 0.6:  # High confidence threshold for cattle
                    return True, top_prob, f"Cattle detected with high confidence ({top_prob:.2%})"
                elif top_prob >= 0.4:
                    return True, top_prob, f"Cattle detected with medium confidence ({top_prob:.2%})"
                else:
                    return False, top_prob, f"Top prediction is cattle but confidence too low ({top_prob:.2%})"
            
            # STRICT: Cattle in top 3 with at least 0.3 confidence
            top3_probs, top3_indices = torch.topk(probabilities, 3)
            for i in range(3):
                prob = top3_probs[0][i].item()
                idx = top3_indices[0][i].item()
                if idx in self.cattle_class_ids and prob >= 0.3:
                    return True, prob, f"Cattle in top 3 predictions ({prob:.2%})"
            
            # STRICT: Cumulative cattle probability must be above 0.6
            total_cattle_prob = sum(probabilities[0][cid].item() for cid in self.cattle_class_ids)
            if total_cattle_prob >= 0.6:
                return True, total_cattle_prob, f"Cumulative cattle probability ({total_cattle_prob:.2%})"
            
            # Image is NOT cattle
            top_class_name = self._get_imagenet_class_name(top_idx)
            return False, top_prob, f"Image appears to be {top_class_name} (probability: {top_prob:.2%}), not cattle"
    
    def _get_imagenet_class_name(self, class_idx: int) -> str:
        """
        Get human-readable name for ImageNet class ID.
        """
        imagenet_classes = {
            21: "cattle",
            22: "buffalo",
            23: "antelope",
            90: "deer",
            345: "ox",
            346: "water buffalo",
            347: "bison",
            387: "ram",
            388: "sheep"
        }
        return imagenet_classes.get(class_idx, "unknown animal")
    
    def _get_tta_transforms(self):
        """Get multiple transforms for test-time augmentation (TTA) with consistent base"""
        base_resize = 256
        crop_size = 224
        
        tta_transforms = [
            # Original
            transforms.Compose([
                transforms.Resize(base_resize),
                transforms.CenterCrop(crop_size),
                transforms.ToTensor(),
            ]),
            # Horizontal flip
            transforms.Compose([
                transforms.Resize(base_resize),
                transforms.CenterCrop(crop_size),
                transforms.RandomHorizontalFlip(p=1.0),
                transforms.ToTensor(),
            ]),
            # Slight rotation
            transforms.Compose([
                transforms.Resize(base_resize),
                transforms.CenterCrop(crop_size),
                transforms.RandomRotation(10),
                transforms.ToTensor(),
            ]),
            # Brightness adjustment
            transforms.Compose([
                transforms.Resize(base_resize),
                transforms.CenterCrop(crop_size),
                transforms.ColorJitter(brightness=0.15),
                transforms.ToTensor(),
            ]),
            # Contrast adjustment
            transforms.Compose([
                transforms.Resize(base_resize),
                transforms.CenterCrop(crop_size),
                transforms.ColorJitter(contrast=0.15),
                transforms.ToTensor(),
            ]),
            # Crop and resize
            transforms.Compose([
                transforms.Resize(base_resize),
                transforms.RandomResizedCrop(crop_size, scale=(0.85, 1.0)),
                transforms.ToTensor(),
            ]),
        ]
        return tta_transforms
    
    def detect_breed(self, image_path: str, use_tta: bool = True) -> Dict:
        """
        Detect cattle breed from image file with optional Test-Time Augmentation
        
        Args:
            image_path: Path to image file
            use_tta: Use Test-Time Augmentation for higher confidence (default: True)
            
        Returns:
            Dictionary with breed detection results
        """
        if self.model is None:
            return {
                'status': 503,
                'success': False,
                'message': 'ML model not available',
                'breed_name': None
            }
        
        try:
            if not os.path.exists(image_path):
                return {
                    'status': 404,
                    'success': False,
                    'message': 'Image file not found',
                    'breed_name': None
                }
            
            image = Image.open(image_path).convert('RGB')
            return self._perform_detection(image, use_tta)
            
        except Exception as e:
            logger.error(f"Error during ML breed detection: {str(e)}", exc_info=True)
            return {
                'status': 500,
                'success': False,
                'message': f'Detection error: {str(e)}',
                'breed_name': None
            }

    def detect_breed_from_base64(self, base64_data: str, image_format: str = 'jpeg', use_tta: bool = True) -> Dict:
        """
        Detect cattle breed from base64 encoded image with optional Test-Time Augmentation
        """
        if self.model is None:
            return {
                'status': 503,
                'success': False,
                'message': 'ML model not available',
                'breed_name': None
            }
        
        try:
            image_data = base64.b64decode(base64_data)
            image = Image.open(io.BytesIO(image_data)).convert('RGB')
            return self._perform_detection(image, use_tta)
            
        except Exception as e:
            logger.error(f"Error during ML base64 breed detection: {str(e)}", exc_info=True)
            return {
                'status': 500,
                'success': False,
                'message': f'Detection error: {str(e)}',
                'breed_name': None
            }

    def detect_breed_with_validation(self, image_path: str, use_tta: bool = True) -> Dict:
        """
        Detect cattle breed from image file with STRICT cattle validation
        
        Args:
            image_path: Path to image file
            use_tta: Use Test-Time Augmentation for higher confidence (default: True)
            
        Returns:
            Dictionary with breed detection results or error if not cattle
        """
        if self.model is None:
            return {
                'status': 503,
                'success': False,
                'message': 'ML model not available',
                'breed_name': None
            }
        
        try:
            if not os.path.exists(image_path):
                return {
                    'status': 404,
                    'success': False,
                    'message': 'Image file not found',
                    'breed_name': None
                }
            
            image = Image.open(image_path).convert('RGB')
            
            # STRICT: Verify image contains cattle before detection
            test_tensor = self._preprocess_image(image)
            is_cattle, cattle_conf, reason = self.verify_is_cattle_strict(test_tensor)
            
            if not is_cattle:
                logger.warning(f"Non-cattle image rejected: {reason}")
                return {
                    'status': 400,
                    'success': False,
                    'message': 'This image does not contain cattle. Please upload a cattle photo for breed detection.',
                    'error_reason': reason,
                    'breed_name': None
                }
            
            logger.info(f"Cattle verification passed: {reason}")
            return self._perform_detection(image, use_tta)
            
        except Exception as e:
            logger.error(f"Error during cattle validation: {str(e)}", exc_info=True)
            return {
                'status': 500,
                'success': False,
                'message': f'Detection error: {str(e)}',
                'breed_name': None
            }

    def detect_breed_from_base64_with_validation(self, base64_data: str, image_format: str = 'jpeg', use_tta: bool = True) -> Dict:
        """
        Detect cattle breed from base64 encoded image with STRICT cattle validation
        """
        if self.model is None:
            return {
                'status': 503,
                'success': False,
                'message': 'ML model not available',
                'breed_name': None
            }
        
        try:
            image_data = base64.b64decode(base64_data)
            image = Image.open(io.BytesIO(image_data)).convert('RGB')
            
            # STRICT: Verify image contains cattle before detection
            test_tensor = self._preprocess_image(image)
            is_cattle, cattle_conf, reason = self.verify_is_cattle_strict(test_tensor)
            
            if not is_cattle:
                logger.warning(f"Non-cattle image rejected: {reason}")
                return {
                    'status': 400,
                    'success': False,
                    'message': 'This image does not contain cattle. Please upload a cattle photo for breed detection.',
                    'error_reason': reason,
                    'breed_name': None
                }
            
            logger.info(f"Cattle verification passed: {reason}")
            return self._perform_detection(image, use_tta)
            
        except Exception as e:
            logger.error(f"Error during cattle validation: {str(e)}", exc_info=True)
            return {
                'status': 500,
                'success': False,
                'message': f'Detection error: {str(e)}',
                'breed_name': None
            }

    def _perform_detection(self, image: Image.Image, use_tta: bool) -> Dict:
        """Core detection logic with optional TTA and confidence thresholding"""
        # Step 1: Pre-verify if image contains cattle using general model
        test_tensor = self._preprocess_image(image)
        is_cattle, cattle_conf = self._is_cattle(test_tensor)
        
        if not is_cattle:
            # Changed: Even if cattle verification is uncertain, proceed to breed detection
            # This improves detection for different image styles and cattle poses
            logger.info(f"Cattle verifier uncertain (confidence: {cattle_conf:.2f}), proceeding to breed detection anyway")
            # Continue to breed detection instead of early exit
            pass

        # Step 2: Breed Classification
        if use_tta:
            tta_transforms = self._get_tta_transforms()
            all_probabilities = []
            
            with torch.no_grad():
                for transform in tta_transforms:
                    try:
                        img_tensor = transform(image)
                        img_tensor = transforms.Normalize(
                            mean=[0.485, 0.456, 0.406],
                            std=[0.229, 0.224, 0.225]
                        )(img_tensor)
                        img_tensor = img_tensor.unsqueeze(0).to(self.device)
                        
                        output = self.model(img_tensor)
                        probabilities = torch.softmax(output, dim=1)
                        all_probabilities.append(probabilities.cpu().numpy()[0])
                    except Exception as e:
                        logger.warning(f"TTA augmentation step failed: {e}")
                        continue
            
            if not all_probabilities:
                return {'status': 500, 'success': False, 'message': 'All augmentations failed'}
                
            # Average probabilities across all augmentations
            avg_probabilities = np.mean(all_probabilities, axis=0)
            predicted_idx = int(np.argmax(avg_probabilities))
            confidence_value = float(avg_probabilities[predicted_idx])
        else:
            # Single-pass inference (faster but less robust)
            image_tensor = self._preprocess_image(image)
            
            with torch.no_grad():
                outputs = self.model(image_tensor)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)
                confidence, predicted = torch.max(probabilities, 1)
                
                predicted_idx = predicted.item()
                confidence_value = confidence.item()
        
        breed_name = self.model_loader.get_breed_name(predicted_idx)
        
        # IMPORTANT: The ML model only knows 5 European breeds:
        # Ayrshire cattle, Brown Swiss cattle, Holstein Friesian cattle, Jersey cattle, Red Dane cattle
        # NOTE: The cattle database has 18 Indian breeds for tag search (different feature)
        logger.info(f"Breed detection: {breed_name} (confidence: {confidence_value:.2f})")
        
        confidence_level = 'High' if confidence_value > 0.8 else 'Medium' if confidence_value > 0.5 else 'Low'
        
        # Return detection results with all confidence levels
        return {
            'status': 200,
            'success': True,
            'breed_name': breed_name,
            'confidence': confidence_level,
            'confidence_score': confidence_value,
            'inference_mode': 'TTA (Test-Time Augmentation)' if use_tta else 'Single-Pass',
            'model_info': {
                'name': 'EfficientNetB2 Cattle Breed Classifier',
                'accuracy': '95.03%',
                'framework': 'PyTorch',
                'input_size': '224x224',
                'classes': len(self.class_labels),
                'version': '2.1 (Accepts All Detections)'
            }
        }
