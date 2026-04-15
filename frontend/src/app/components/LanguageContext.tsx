import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'te';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

export const translations: Translations = {
  home: { en: 'Home', hi: 'होम', te: 'హోమ్' },
  breedDetection: { en: 'Breed Detection', hi: 'नस्ल पहचान', te: 'జాతి గుర్తింపు' },
  tagSearch: { en: 'Tag Search', hi: 'टैग खोज', te: 'ట్యాగ్ సెర్చ్' },
  healthAnalysis: { en: 'Health Analysis', hi: 'स्वास्थ्य विश्लेषण', te: 'ఆరోగ్య విశ్లేషణ' },
  govSchemes: { en: 'Gov Schemes', hi: 'सरकारी योजनाएं', te: 'ప్రభుత్వ పథకాలు' },
  smartDairyTech: { en: 'Smart Dairy Tech', hi: 'स्मार्ट डेयरी टेक', te: 'స్మార్ట్ డైరీ టెక్' },
  settings: { en: 'Settings', hi: 'सेटिंग्स', te: 'సెట్టింగ్స్' },
  selectLanguage: { en: 'Select Language', hi: 'भाषा चुनें', te: 'భాషను ఎంచుకోండి' },
  english: { en: 'English', hi: 'अंग्रेज़ी', te: 'ఇంగ్లీష్' },
  hindi: { en: 'Hindi', hi: 'हिन्दी', te: 'హిందీ' },
  telugu: { en: 'Telugu', hi: 'తెలుగు', te: 'తెలుగు' },
  innovatingAgriculture: { en: 'Innovating Indian Agriculture', hi: 'भारतीय कृषि में नवाचार', te: 'భారతీయ వ్యవసాయంలో ఆవిష్కరణ' },
  smartSolutions: { en: 'Smart Solutions for', hi: 'के लिए स्मार्ट समाधान', te: 'కోసం స్మార్ట్ పరిష్కారాలు' },
  modernCattleCare: { en: 'Modern Cattle Care', hi: 'आधुनिक पशु देखभाल', te: 'ఆధునిక పశువుల సంరక్షణ' },
  heroSubtitle: { 
    en: 'Detect breeds, monitor health, track records via ear tags, and access government support—all in one intelligent platform.', 
    hi: 'नस्लों का पता लगाएं, स्वास्थ्य की निगरानी करें, कान के टैग के माध्यम से रिकॉर्ड ट्रैक करें, और सरकारी सहायता प्राप्त करें - सब एक ही बुद्धिमान मंच में।', 
    te: 'జాతులను గుర్తించండి, ఆరోగ్యాన్ని పర్యవేక్షించండి, చెవి ట్యాగ్‌ల ద్వారా రికార్డులను ట్రాక్ చేయండి మరియు ప్రభుత్వ మద్దతును పొందండి - అన్నీ ఒకే తెలివైన ప్లాట్‌ఫారమ్‌లో.' 
  },
  ourFeatures: { en: 'Our Features', hi: 'हमारी सुविधाएँ', te: 'మా ఫీచర్లు' },
  manageYourHerd: { en: 'Manage Your Herd', hi: 'अपने झुंड का प्रबंधन करें', te: 'మీ మందను నిర్వహించండి' },
  everythingYouNeed: { en: 'Everything You Need to', hi: 'वह सब कुछ जो आपको चाहिए', te: 'మీకు కావలసినవన్నీ' },
  
  // Feature Cards
  aiBreedTitle: { en: 'AI Breed Detection', hi: 'एआई नस्ल पहचान', te: 'AI జాతి గుర్తింపు' },

  analyzeNow: { en: 'Analyze Now', hi: 'अभी विश्लेषण करें', te: 'ఇప్పుడే విశ్లేషించండి' },
  accuracyBadge: { en: '98% Accuracy', hi: '98% सटीकता', te: '98% ఖచ్చితత్వం' },

  smartTagTitle: { en: 'Smart Tag Search', hi: 'स्मार्ट टैग खोज', te: 'స్మార్ట్ ట్యాగ్ సెర్చ్' },

  searchTag: { en: 'Search Tag', hi: 'टैग खोजें', te: 'ట్యాగ్ సెర్చ్ చేయండి' },
  instantLookup: { en: 'Instant Lookup', hi: 'त्वरित खोज', te: 'తక్షణ శోధన' },

  healthAnalysisTitle: { en: 'Health Analysis', hi: 'स्वास्थ्य विश्लेषण', te: 'ఆరోగ్య విశ్లేషణ' },

  checkHealth: { en: 'Check Health', hi: 'स्वास्थ्य जांचें', te: 'ఆరోగ్యాన్ని తనిఖీ చేయండి' },
  earlyDetection: { en: 'Early Detection', hi: 'शीघ्र पता लगाना', te: 'ముందస్తు గుర్తింపు' },

  govSchemesTitle: { en: 'Government Schemes', hi: 'सरकारी योजनाएं', te: 'ప్రభుత్వ పథకాలు' },

  exploreBenefits: { en: 'Explore Benefits', hi: 'लाभों का पता लगाएं', te: 'ప్రయోజనాలను అన్వేషించండి' },
  subsidiesBadge: { en: '₹ Subsidies', hi: '₹ सब्सिडी', te: '₹ రాయితీలు' },

  // CTA Banner
  readyToTransform: { en: 'Ready to Transform Your Farm?', hi: 'क्या आप अपने खेत को बदलने के लिए तैयार हैं?', te: 'మీ ఫామ్‌ను మార్చడానికి సిద్ధంగా ఉన్నారా?' },
  joinFarmers: { 
    en: 'Join over 1,200 farmers already using Gow Vision to save time, reduce losses, and grow smarter.', 
    hi: 'समय बचाने, नुकसान कम करने और स्मार्ट तरीके से बढ़ने के लिए गो विजन का उपयोग करने वाले 1,200 से अधिक किसानों में शामिल हों।', 
    te: 'సమయాన్ని ఆదా చేయడానికి, నష్టాలను తగ్గించడానికి మరియు తెలివిగా ఎదగడానికి ఇప్పటికే గౌ విజన్‌ని ఉపయోగిస్తున్న 1,200 మంది రైతులతో చేరండి.' 
  },
  tryBreedDetection: { en: 'Try Breed Detection', hi: 'नस्ल पहचान आज़माएं', te: 'జాతి గుర్తింపును ప్రయత్నించండి' },
  viewGovtSchemes: { en: 'View Govt Schemes', hi: 'सरकारी योजनाएं देखें', te: 'ప్రభుత్వ పథకాలను చూడండి' },

  // Footer
  quickLinks: { en: 'Quick Links', hi: 'त्वरित लिंक', te: 'త్వరిత లింకులు' },
  resources: { en: 'Resources', hi: 'संसाधन', te: 'వనరులు' },
  supportCenter: { en: 'Support Center', hi: 'सहायता केंद्र', te: 'సపోర్ట్ సెంటర్' },
  privacyPolicy: { en: 'Privacy Policy', hi: 'गोपनीयता नीति', te: 'ప్రైవసీ పాలసీ' },
  madeWithLove: { en: 'Made with ❤️ for Farmers', hi: 'किसानों के लिए ❤️ के साथ बनाया गया', te: 'రైతుల కోసం ❤️ తో తయారు చేయబడింది' },
  allRightsReserved: { en: 'All rights reserved.', hi: 'सर्वाधिकार सुरक्षित।', te: 'అన్ని హక్కులు ప్రత్యేకించబడ్డాయి.' },
  smartDairyTechFooter: { en: 'Empowering the next generation of dairy farmers with AI-driven insights and simplified cattle management.', hi: 'एआई-संचालित अंतर्दृष्टि और सरलीकृत मवेशी प्रबंधन के साथ डेयरी किसानों की अगली पीढ़ी को सशक्त बनाना।', te: 'AI-ఆధారిత అంతర్దృష్టులు మరియు సరళీకృత పశువుల నిర్వహణతో తదుపరి తరం పాడి రైతులకు అధికారాన్ని అందించడం.' },

  // Stats Section
  ourCapabilities: { en: 'Our Capabilities', hi: 'हमारी क्षमताएं', te: 'మా సామర్థ్యాలు' },
  powerfulTech: { en: 'Powerful Technology for', hi: 'के लिए शक्तिशाली तकनीक', te: 'కోసం శక్తివంతమైన సాంకేతికత' },
  modernCattleMgmt: { en: 'Modern Cattle Management', hi: 'आधुनिक पशु प्रबंधन', te: 'ఆధునిక పశువుల నిర్వహణ' },
  trustedByFarmers: { en: 'Trusted by Indian farmers with cutting-edge AI and comprehensive government scheme access', hi: 'अत्याधुनिक एआई और व्यापक सरकारी योजना पहुंच के साथ भारतीय किसानों द्वारा भरोसा किया गया', te: 'అత్యాధునిక AI మరియు సమగ్ర ప్రభుత్వ పథకాల యాక్సెస్‌తో భారతీయ రైతులచే విశ్వసించబడింది' },
  
  breedAccuracy: { en: 'Breed Accuracy', hi: 'नस्ल सटीकता', te: 'జాతి ఖచ్చితత్వం' },
  aiDetectionRate: { en: 'AI Detection Rate', hi: 'एआई पहचान दर', te: 'AI గుర్తింపు రేటు' },
  quarterTrend: { en: '+2.5% this quarter', hi: '+2.5% इस तिमाही', te: '+2.5% ఈ త్రైమాసికంలో' },
  
  breedsSupported: { en: 'Breeds Supported', hi: 'नस्लें समर्थित', te: 'మద్దతు ఇచ్చే జాతులు' },
  indianVarieties: { en: 'Indian cattle varieties', hi: 'भारतीय मवेशी किस्में', te: 'భారతీయ పశువుల రకాలు' },
  expandingMonthly: { en: 'Expanding monthly', hi: 'मासिक विस्तार', te: 'ప్రతి నెలా విస్తరిస్తోంది' },
  
  healthMonitoring: { en: 'Health Monitoring', hi: 'स्वास्थ्य निगरानी', te: 'ఆరోగ్య పర్యవేక్షణ' },
  realTime: { en: 'Real-time', hi: 'रीयल-टाइम', te: 'రియల్-టైమ్' },
  continuousAnalysis: { en: 'Continuous analysis', hi: 'निरंतर विश्लेषण', te: 'నిరంతర విశ్లేషణ' },
  available247: { en: '24/7 Available', hi: '24/7 उपलब्ध', te: '24/7 అందుబాటులో ఉంది' },
  
  schemesListed: { en: 'Schemes Listed', hi: 'योजनाएं सूचीबद्ध', te: 'పథకాల జాబితా' },
  govBenefits: { en: 'Govt benefits & subsidies', hi: 'सरकारी लाभ और सब्सिडी', te: 'ప్రభుత్వ ప్రయోజనాలు & రాయితీలు' },
  updatedWeekly: { en: 'Updated weekly', hi: 'साप्ताहिक अपडेट', te: 'ప్రతి వారం అప్‌డేట్ చేయబడుతుంది' },

  // Breed Detection Page
  aiBreedDetectionTitle: { en: 'AI Breed Detection', hi: 'एआई नस्ल पहचान', te: 'AI జాతి గుర్తింపు' },
  aiBreedDetectionDesc: { 
    en: 'Upload a clear photo of your cattle. Our AI model analyzes facial features and body structure to identify the breed with high precision.', 
    hi: 'अपने मवेशियों की एक स्पष्ट फोटो अपलोड करें। हमारा एआई मॉडल उच्च सटीकता के साथ नस्ल की पहचान करने के लिए चेहरे की विशेषताओं और शरीर की संरचना का विश्लेषण करता है।', 
    te: 'మీ పశువుల స్పష్టమైన ఫోటోను అప్‌లోడ్ చేయండి. మా AI మోడల్ ముఖ లక్షణాలు మరియు శరీర నిర్మాణాన్ని విశ్లేషించి, జాతిని అత్యంత ఖచ్చితత్వంతో గుర్తిస్తుంది.' 
  },
  clickOrDrop: { en: 'Click or Drop Image Here', hi: 'यहां क्लिक करें या इमेज छोड़ें', te: 'ఇక్కడ క్లిక్ చేయండి లేదా ఇమేజ్‌ని వదలండి' },
  supportsFormats: { en: 'Supports JPG, PNG (Max 5MB)', hi: 'JPG, PNG का समर्थन करता है (अधिकतम 5MB)', te: 'JPG, PNG కి మద్దతు ఇస్తుంది (గరిష్టంగా 5MB)' },
  analyzingFeatures: { en: 'Analyzing Features...', hi: 'विशेषताओं का विश्लेषण...', te: 'లక్షణాలను విశ్లేషిస్తోంది...' },
  processing: { en: 'Processing...', hi: 'प्रसंस्करण...', te: 'ప్రాసెసింగ్...' },
  identifyBreed: { en: 'Identify Breed', hi: 'नस्ल की पहचान करें', te: 'జాతిని గుర్తించండి' },
  detectionComplete: { en: 'Detection Complete', hi: 'पहचान पूरी हुई', te: 'గుర్తింపు పూర్తయింది' },
  readyToAnalyze: { en: 'Ready to Analyze', hi: 'विश्लेषण के लिए तैयार', te: 'విశ్లేషణకు సిద్ధంగా ఉంది' },
  resultsAppearHere: { en: 'Results will appear here automatically after the AI analysis is complete.', hi: 'एआई विश्लेषण पूरा होने के बाद परिणाम यहां अपने आप दिखाई देंगे।', te: 'AI విశ్లేషణ పూర్తయిన తర్వాత ఫలితాలు స్వయంచాలకంగా ఇక్కడ కనిపిస్తాయి.' },
  origin: { en: 'Origin', hi: 'उत्पत्ति', te: 'పుట్టుక' },
  description: { en: 'Description', hi: 'विवरण', te: 'వివరణ' },
  keyCharacteristics: { en: 'Key Characteristics', hi: 'प्रमुख विशेषताएं', te: 'ముఖ్య లక్షణాలు' },
  saveToRecords: { en: 'Save to My Cattle Records', hi: 'मेरे मवेशी रिकॉर्ड में सहेजें', te: 'నా పశువుల రికార్డుల్లో సేవ్ చేయండి' },
  scanAnother: { en: 'Scan Another Image', hi: 'एक और इमेज स्कैन करें', te: 'మరో ఇమేజ్‌ని స్కాన్ చేయండి' },
  errorTitle: { en: 'Error', hi: 'त्रुटि', te: 'లోపం' },
  unableToIdentify: { en: 'Unable to identify cattle in this image.', hi: 'इस इमेज में मवेशियों की पहचान करने में असमర్థ।', te: 'ఈ చిత్రంలో పశువులను గుర్తించలేకపోయాము.' },
  failedToAnalyze: { en: 'Failed to analyze image. Please try again.', hi: 'इमेज का विश्लेषण करने में विफल। कृपया पुन: प्रयास करें।', te: 'చిత్రాన్ని విశ్లేషించడం విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.' },

  // Tag Search Page
  cattleTagSearchTitle: { en: 'Cattle Tag Search', hi: 'मवेशी टैగ खोज', te: 'పశువుల ట్యాగ్ సెర్చ్' },
  cattleTagSearchDesc: { 
    en: 'Enter the unique 12-digit Ear Tag Number to instantly retrieve complete health, ownership, and insurance details.', 
    hi: 'पूर्ण स्वास्थ्य, स्वामित्व और बीमा विवरण तुरंत प्राप्त करने के लिए अद्वितीय 12-अंकीय कान टैग संख्या दर्ज करें।', 
    te: 'పూర్తి ఆరోగ్యం, యాజమాన్యం మరియు ఇన్సూరెన్స్ వివరాలను తక్షణమే పొందడానికి ప్రత్యేకమైన 12-అంకెల చెవి ట్యాగ్ సంఖ్యను నమోదు చేయండి.' 
  },
  enterTagId: { en: 'Enter Ear Tag ID or Pashu ID (e.g., 12001)', hi: 'कान टैग आईडी या पशु आईडी दर्ज करें (जैसे, 12001)', te: 'చెవి ట్యాగ్ ID లేదా పశు IDని నమోదు చేయండి (ఉదా. 12001)' },
  searchRecords: { en: 'Search Records', hi: 'रिकॉर्ड खोजें', te: 'రికార్డులను వెతకండి' },
  searching: { en: 'Searching...', hi: 'खोज रहे हैं...', te: 'వెతుకుతోంది...' },
  noCattleFound: { en: "No cattle found with this ID. Please check the number and try again.", hi: "इस आईडी के साथ कोई मवेशी नहीं मिला। कृपया नंबर जांचें और पुन: प्रयास करें।", te: "ఈ IDతో పశువులు కనుగొనబడలేదు. దయచేసి నంబర్‌ను తనిఖీ చేసి మళ్ళీ ప్రయత్నించండి." },
  tagIdLabel: { en: 'Tag ID', hi: 'टैग आईडी', te: 'ట్యాగ్ ID' },
  insured: { en: 'Insured', hi: 'बीमाकृत', te: 'భీమా చేయబడింది' },
  uninsured: { en: 'Uninsured', hi: 'बीमा रहित', te: 'భీమా చేయబడలేదు' },
  breedLabel: { en: 'Breed', hi: 'नस्ल', te: 'జాతి' },
  lastCheckup: { en: 'Last Checkup', hi: 'पिछली जांच', te: 'చివరి తనిఖీ' },
  ownerDetails: { en: 'Owner Details', hi: 'मालिक का विवरण', te: 'యజమాని వివరాలు' },
  name: { en: 'Name', hi: 'नाम', te: 'పేరు' },
  contact: { en: 'Contact', hi: 'संपर्क', te: 'సంప్రదించండి' },
  vitalStatistics: { en: 'Vital Statistics', hi: 'महत्वपूर्ण आँकड़े', te: 'ముఖ్యమైన గణాంకాలు' },
  age: { en: 'Age', hi: 'आयु', te: 'వయస్సు' },
  gender: { en: 'Gender', hi: 'लिंग', te: 'లింగం' },
  births: { en: 'Births', hi: 'जन्म', te: 'జననాలు' },
  lactation: { en: 'Lactation', hi: 'దుग्धपान', te: 'పాల ఉత్పత్తి' },
  active: { en: 'Active', hi: 'सक्रिय', te: 'క్రియాశీల' },
  vaccinationStatus: { en: 'Vaccination Status', hi: 'टीकाकरण की स्थिति', te: 'టీకా స్థితి' },
  insuranceStatusLabel: { en: 'Insurance Status', hi: 'बीमा की स्थिति', te: 'భీమా స్థితి' },

  // Health Analysis Page Additional Strings
  aiPoweredDiagnostics: { en: 'AI-Powered Diagnostics', hi: 'AI-संचालित निदान', te: 'AI-ఆధారిత డయాగ్నస్టిక్స్' },
  analysis: { en: 'Analysis', hi: 'विश्लेषण', te: 'విశ్లేషణ' },
  cattleHealthAnalysisSub: { 
    en: "Enter your cattle's symptoms and vitals for an instant AI-powered health assessment and recommended action plan.", 
    hi: "तत्काल एआई-संचालित स्वास्थ्य मूल्यांकन और अनुशंसित कार्य योजना के लिए अपने मवेशियों के लक्षण और महत्वपूर्ण विवरण दर्ज करें।", 
    te: "తక్షణ AI-ఆధారిత ఆరోగ్య అంచనా మరియు సిఫార్సు చేయబడిన కార్యాచరణ ప్రణాళిక కోసం మీ పశువుల లక్షణాలు మరియు ముఖ్యమైన వివరాలను నమోదు చేయండి." 
  },
  cattleInformation: { en: 'Cattle Information', hi: 'मवेशी जानकारी', te: 'పశువుల సమాచారం' },
  breed: { en: 'Breed', hi: 'नस्ल', te: 'జాతి' },
  ageMonths: { en: 'Age (months)', hi: 'आयु (महीने)', te: 'వయస్సు (నెలలు)' },
  observedSymptoms: { en: 'Observed Symptoms', hi: 'देखे गए लक्षण', te: 'గమనించిన లక్షణాలు' },
  uploadPhotoOptional: { en: 'Upload Photo (Optional)', hi: 'फोटो अपलोड करें (वैकल्पिक)', te: 'ఫోటోను అప్‌లోడ్ చేయండి (ఐచ్ఛికం)' },
  clickToUpload: { en: 'Click to upload cattle photo for visual analysis', hi: 'विज़ुअल विश्लेषण के लिए मवेशी की फोटो अपलोड करने के लिए क्लिक करें', te: 'విజువల్ విశ్లేషణ కోసం పశువుల ఫోటోను అప్‌లోడ్ చేయడానికి క్లిక్ చేయండి' },
  runAiHealthAnalysis: { en: 'Run AI Health Analysis', hi: 'एआई स्वास्थ्य विश्लेषण चलाएं', te: 'AI ఆరోగ్య విశ్లేషణను ప్రారంభించండి' },
  analyzingHealthData: { en: 'Analyzing Health Data…', hi: 'स्वास्थ्य डेटा का विश्लेषण कर रहे हैं…', te: 'ఆరోగ్య డేటాను విశ్లేషిస్తోంది...' },
  crossReferencingSymptoms: { 
    en: 'Our AI model is cross-referencing symptoms with 10,000+ cattle health records', 
    hi: 'हमारा एआई मॉडल 10,000+ मवेशी स्वास्थ्य रिकॉर्ड के साथ लक्षणों का क्रॉस-रेफरेंस दे रहा है', 
    te: 'మా AI మోడల్ 10,000+ పశువుల ఆరోగ్య రికార్డులతో లక్షణాలను క్రాస్-రిఫరెన్స్ చేస్తోంది' 
  },
  complete: { en: 'complete', hi: 'पूరా', te: 'పూర్తి' },
  checkingVitals: { en: 'Checking vitals', hi: 'महत्वपूर्ण लक्षणों की जाँच', te: 'ముఖ్యమైన లక్షణాలను తనిఖీ చేస్తోంది' },
  crossReferencingBreedData: { en: 'Cross-referencing breed data', hi: 'नस्ल डेटा का क्रॉस-रेफरेंसिंग', te: 'జాతి డేటాను క్రాస్-రిఫరెన్స్ చేస్తోంది' },
  analysingSymptomPatterns: { en: 'Analysing symptom patterns', hi: 'लक्षण पैटर्न का विश्लेषण', te: 'లక్షణ నమూనాలను విశ్లేషిస్తోంది' },
  generatingReport: { en: 'Generating report', hi: 'रिपोर्ट तैयार करना', te: 'నివేదికను రూపొందిస్తోంది' },
  overallHealthScore: { en: 'Overall Health Score', hi: 'कुल स्वास्थ्य स्कोर', te: 'మొత్తం ఆరోగ్య స్కోరు' },
  moderateConcernVetAdvised: { en: 'Moderate Concern — Vet Consultation Advised', hi: 'मध्यम चिंता — पशु चिकित्सक से परामर्श की सलाह दी जाती है', te: 'మితమైన ఆందోళన — వెట్ సంప్రదింపు సిఫార్సు చేయబడింది' },
  urgency: { en: 'Urgency', hi: 'तात्कालिकता', te: 'అత్యవసరం' },
  within48Hours: { en: 'Within 48 hours', hi: '48 घंटे के भीतर', te: '48 గంటల్లోపు' },
  potentialConditions: { en: 'Potential Conditions', hi: 'संभावित स्थितियां', te: 'సంభావ్య పరిస్థితులు' },
  risk: { en: 'Risk', hi: 'जोखिम', te: 'ప్రమాదం' },
  probabilityMatch: { en: 'probability match', hi: 'संभावना मेल', te: 'సంభావ్యత సరిపోలిక' },
  recommendedActions: { en: 'Recommended Actions', hi: 'अनुशंसित कार्रवाइयां', te: 'సిఫార్సు చేసిన చర్యలు' },
  lowRiskLabel: { en: 'Low', hi: 'कम', te: 'తక్కువ' },
  mediumRiskLabel: { en: 'Medium', hi: 'मध्यम', te: 'మధ్యస్థ' },
  highRiskLabel: { en: 'High', hi: 'उच्च', te: 'ఎక్కువ' },
  selected: { en: 'selected', hi: 'चुने गए', te: 'ఎంచుకోబడిన' },
  optional: { en: 'optional', hi: 'वैकल्पिक', te: 'ఐచ్ఛికమైన' },
  isolateAnimal: { en: 'Isolate the animal immediately to prevent possible spread', hi: 'संभावित प्रसार को रोकने के लिए जानवर को तुरंत अलग करें', te: 'సంభావ్య వ్యాప్తిని నిరోధించడానికి జంతువును అంతక్షణానికి ఎక్కకగా ఉంచండి' },
  monitorTemp: { en: 'Monitor temperature every 4 hours for the next 24 hours', hi: 'अगले 24 घंटों के लिए हर 4 घंटे में तापमान की निगरानी करें', te: 'వచ్చే 24 గంటలలో ప్రతి 4 గంటలకు ఉష్ణోగ్రతను పర్యవేక్షించండి' },
  ensureWater: { en: 'Ensure fresh water and electrolyte solution is available', hi: 'ताजा पानी और इलेक्ट्रोलाइट समाधान उपलब्ध रखें', te: 'తాటిగా ఉన్న నీరు మరియు విద్యుద్విశ్లేష్య ద్రావణం లభ్యమైనదిగా ఉండేలా చేయండి' },
  contactVet: { en: 'Contact a licensed veterinarian within 48 hours', hi: '48 घंटों के भीतर एक लाइसेंसप्राप्त पशु चिकित्सक से संपर्क करें', te: '48 గంటల్లోపు లైసెన్సप్రాప్త పశువైద్యుడిని సంప్రదించండి' },
  avoidMilking: { en: 'Avoid milking until veterinary clearance is obtained', hi: 'पशु चिकित्सा मंजूरी प्राप्त होने तक दुग्ध दोहन से बचें', te: 'పశువైద్యుని అనుమతి వచ్చేవరకు పాల చేయకుండా ఉండండి' },

  // Symptoms
  "Loss of Appetite": { en: 'Loss of Appetite', hi: 'भूख कम लगना', te: 'ఆకలి లేకపోవడం' },
  "Lethargy / Low Activity": { en: 'Lethargy / Low Activity', hi: 'सुस्ती / कम गतिविधि', te: 'నీరసం / తక్కువ కార్యాచరణ' },
  "Nasal Discharge": { en: 'Nasal Discharge', hi: 'नाक से स్రాव', te: 'ముక్కు నుండి నీరు కారడం' },
  "Coughing / Labored Breathing": { en: 'Coughing / Labored Breathing', hi: 'खांसी / सांस लेने में कठिनाई', te: 'దగ్గు / శ్వాస తీసుకోవడంలో ఇబ్బంది' },
  "Diarrhea / Loose Stools": { en: 'Diarrhea / Loose Stools', hi: 'दस्त / पतला मल', te: 'అతిసారం / విరేచనాలు' },
  "Swollen Limbs or Joints": { en: 'Swollen Limbs or Joints', hi: 'अंगों या जोड़ों में सूजन', te: 'కాళ్లు లేదా కీళ్ల వాపు' },
  "Eye Discharge / Redness": { en: 'Eye Discharge / Redness', hi: 'आंखों से स्राव / लालिमा', te: 'కంటి నుండి నీరు కారడం / ఎరుపు' },
  "Unusual Skin / Coat Condition": { en: 'Unusual Skin / Coat Condition', hi: 'असामान्य त्वचा / कोट की स्थिति', te: 'అసాధారణ చర్మం / వెంట్రుకల స్థితి' },
  "Reduced Milk Production": { en: 'Reduced Milk Production', hi: 'दूध उत्पादन में कमी', te: 'పాల ఉత్పత్తి తగ్గడం' },
  "Fever (Warm to Touch)": { en: 'Fever (Warm to Touch)', hi: 'बुखार (छूने पर गर्म)', te: 'జ్వరం (తాకితే వేడిగా ఉండటం)' },

  // Vitals
  "Temperature": { en: 'Temperature', hi: 'तापमान', te: 'ఉష్ణోగ్రత' },
  "Heart Rate": { en: 'Heart Rate', hi: 'हृदय गति', te: 'గుండె వేగం' },
  "Respiration": { en: 'Respiration', hi: 'श्वसन', te: 'శ్వాసక్రియ' },
  "Rumen Sounds": { en: 'Rumen Sounds', hi: 'रूमेन ध्वनियाँ', te: 'రూమెన్ శబ్దాలు' },
  "statusNormal": { en: 'Normal', hi: 'सामान्य', te: 'సాధారణం' },
  "statusWarning": { en: 'Warning', hi: 'चेतावनी', te: 'హెచ్చరిక' },
  "Reduced": { en: 'Reduced', hi: 'कम हुआ', te: 'తగ్గింది' },

  // Conditions
  "Foot and Mouth Disease": { en: 'Foot and Mouth Disease', hi: 'खुरपका-मुंहपका रोग', te: 'గాలికుంటు వ్యాధి' },
  "Bovine Respiratory Disease": { en: 'Bovine Respiratory Disease', hi: 'बोवाइन श्वसन रोग', te: 'బోవిన్ శ్వాసకోశ వ్యాధి' },
  "Mastitis": { en: 'Mastitis', hi: 'थनैला रोग', te: 'పొదుగు వాపు వ్యాధి' },
  "Bovine Viral Diarrhea": { en: 'Bovine Viral Diarrhea', hi: 'बोवाइन वायरल डायरिया', te: 'బోవిన్ వైరల్ డయేరియా' },

  // Gender and Age (Added for test data)
  "Female": { en: 'Female', hi: 'मादा', te: 'ఆడ' },
  "Male": { en: 'Male', hi: 'नर', te: 'మగ' },
  "4 Years": { en: '4 Years', hi: '4 साल', te: '4 సంవత్సరాలు' },
  "3 Years": { en: '3 Years', hi: '3 साल', te: '3 సంవత్సరాలు' },
  "Up to Date (FMD, HS)": { en: 'Up to Date (FMD, HS)', hi: 'अद्यतित (FMD, HS)', te: 'అప్‌డేట్ చేయబడింది (FMD, HS)' },
  "Active (Valid till Dec 2026)": { en: 'Active (Valid till Dec 2026)', hi: 'सक्रिय (दिसंबर 2026 तक मान्य)', te: 'క్రియాశీల (డిసెంబర్ 2026 వరకు చెల్లుబాటు అవుతుంది)' },
  "Expired": { en: 'Expired', hi: 'समय सीमा समाप्त', te: 'గడువు ముగిసింది' },
  "Pending (Due Next Month)": { en: 'Pending (Due Next Month)', hi: 'लंबित (अगले महीने देय)', te: 'పెండింగ్‌లో ఉంది (వచ్చే నెలలో చెల్లించాలి)' },

  // Breed Origins (for Gir in mock)
  "Anand, Gujarat": { en: 'Anand, Gujarat', hi: 'आनंद, गुजरात', te: 'ఆనంద్, గుజరాత్' },
  "Mehsana, Gujarat": { en: 'Mehsana, Gujarat', hi: 'मेहसाणा, गुजरात', te: 'మెహసానా, గుజరాత్' },

  // Breeds
  "Gir": { en: 'Gir', hi: 'गीर', te: 'గిర్' },
  "Sahiwal": { en: 'Sahiwal', hi: 'సాహివాల్', te: 'సాహివాల్' },
  "Holstein Friesian": { en: 'Holstein Friesian', hi: 'होल्स्टीन फ्रीजियन', te: 'హోల్‌స్టెయిన్ ఫ్రైసియన్' },
  "Jersey": { en: 'Jersey', hi: 'జర్సీ', te: 'జర్సీ' },
  "Red Sindhi": { en: 'Red Sindhi', hi: 'लाल सिंधी', te: 'రెడ్ సింధి' },
  "Murrah Buffalo": { en: 'Murrah Buffalo', hi: 'मुर्राह भैंस', te: 'ముర్రా గేదె' },
  "Ayrshire": { en: 'Ayrshire', hi: 'आयरशायर', te: 'అయిర్షైర్' },
  "Brown Swiss": { en: 'Brown Swiss', hi: 'ब्राउन स्विस', te: 'బ్రౌన్ స్విస్' },
  "Red Dane": { en: 'Red Dane', hi: 'रेడ్ డేన్', te: 'రెడ్ డేన్' },

  // Breed Origins
  "Gujarat, India": { en: 'Gujarat, India', hi: 'गुजरात, भारत', te: 'గుజరాత్, భారతదేశం' },
  "Punjab, Pakistan/India": { en: 'Punjab, Pakistan/India', hi: 'पंजाब, पाकिस्तान/भारत', te: 'పంజాబ్, పాకిస్థాన్/భారతదేశం' },
  "Netherlands": { en: 'Netherlands', hi: 'नीदरलैंड', te: 'నెదర్లాండ్స్' },
  "Jersey, Channel Islands": { en: 'Jersey, Channel Islands', hi: 'జర్సీ, चैनल द्वीपसमूह', te: 'జర్సీ, ఛానల్ ఐలాండ్స్' },
  "Sindh, Pakistan": { en: 'Sindh, Pakistan', hi: 'सिंध, पाकिस्तान', te: 'సింధ్, పాకిస్థాన్' },
  "Ayrshire, Scotland": { en: 'Ayrshire, Scotland', hi: 'आयरशायर, स्कॉटलैंड', te: 'అయిర్షైర్, స్కాట్లాండ్' },
  "Switzerland": { en: 'Switzerland', hi: 'स्विट्जरलैंड', te: 'స్విట్జర్లాండ్' },
  "Denmark": { en: 'Denmark', hi: 'डेनमार्क', te: 'డెన్మార్క్' },

  // Breed Descriptions
  "The Gir is one of the principal Zebu breeds originating in India. It has been used locally in the improvement of other breeds including the Red Sindhi and the Sahiwal.": {
    en: "The Gir is one of the principal Zebu breeds originating in India. It has been used locally in the improvement of other breeds including the Red Sindhi and the Sahiwal.",
    hi: "गीर भारत में उत्पन्न प्रमुख ज़ेबू नस्लों में से एक है। इसका उपयोग स्थानीय स्तर पर रेड सिंधी और साहीवाल सहित अन्य नस्लों के सुधार में किया गया है।",
    te: "గిర్ భారతదేశంలో ఉద్భవించిన ప్రధాన జెబు జాతులలో ఒకటి. రెడ్ సింధి మరియు సాహివాల్‌తో సహా ఇతర జాతుల మెరుగుదలలో ఇది స్థానికంగా ఉపయోగించబడింది."
  },
  "Sahiwal is a breed of Zebu cattle, primarily used in dairy production. They are widely kept in India and Pakistan and have been exported to many countries.": {
    en: "Sahiwal is a breed of Zebu cattle, primarily used in dairy production. They are widely kept in India and Pakistan and have been exported to many countries.",
    hi: "साहीवाल ज़ेबू मवेशियों की एक नस्ल है, जिसका मुख्य रूप से डेयरी उत्पादन में उपयोग किया जाता है। उन्हें भारत और पाकिस्तान में व्यापक रूप से रखा जाता है।",
    te: "సాహివాల్ అనేది జెబు పశువుల జాతి, దీనిని ప్రధానంగా పాల ఉత్పత్తిలో ఉపయోగిస్తారు. వీటిని భారతదేశం మరియు పాకిస్తాన్లలో విస్తృతంగా పెంచుతారు."
  },
  "Holstein Friesians are a breed of dairy cattle originating from the Dutch provinces of North Holland and Friesland. They are known as the world's highest-production dairy animals.": {
    en: "Holstein Friesians are a breed of dairy cattle originating from the Dutch provinces of North Holland and Friesland. They are known as the world's highest-production dairy animals.",
    hi: "होल्स्टीन फ्रीजियन उत्तरी हॉलैंड और फ्रीज़लैंड के डच प्रांतों से उत्पन्न डेयरी मवेशियों की एक नस्ल है। उन्हें दुनिया के सबसे अधिक उत्पादन देने वाले डेयरी जानवरों के रूप में जाना जाता है।",
    te: "హోల్‌స్టెయిన్ ఫ్రైసియన్లు ఉత్తర హాలండ్ మరియు ఫ్రైస్‌ల్యాండ్ యొక్క డచ్ ప్రావిన్సుల నుండి ఉద్భవించిన పాడి పశువుల జాతి. ఇవి ప్రపంచంలోనే అత్యధిక పాల ఉత్పత్తిని ఇచ్చే జంతువులుగా ప్రసిద్ధి చెందాయి."
  },
  "The Jersey is a British breed of small dairy cattle from Jersey, in the Channel Islands. It is highly productive and its milk is high in butterfat.": {
    en: "The Jersey is a British breed of small dairy cattle from Jersey, in the Channel Islands. It is highly productive and its milk is high in butterfat.",
    hi: "जर्सी चैनल द्वीप समूह में जర్సీ से छोटे डेयरी मवेशियों की एक ब्रिटिश नस्ल है। यह अत्यधिक उत्पादक है और इसके दूध में बटरफैट अधिक होता है।",
    te: "జర్సీ అనేది ఛానల్ ఐలాండ్స్‌లోని జర్సీ నుండి వచ్చిన చిన్న పాడి పశువుల బ్రిటిష్ జాతి. ఇది అధిక ఉత్పాదకతను కలిగి ఉంటుంది మరియు దీని పాలలో వెన్న శాతం ఎక్కువగా ఉంటుంది."
  },
  "Red Sindhi cattle are the most popular of all Zebu dairy breeds. The breed originated in the Sindh province of Pakistan, and they are widely kept for milk production across India.": {
    en: "Red Sindhi cattle are the most popular of all Zebu dairy breeds. The breed originated in the Sindh province of Pakistan, and they are widely kept for milk production across India.",
    hi: "लाल सिंधी मवेशी सभी ज़ेबू डेयरी नस्लों में सबसे लोकप्रिय हैं। यह नस्ल पाकिस्तान के सिंध प्रांत में उत्पन्न हुई थी।",
    te: "రెడ్ సింధి పశువులు అన్ని జెబు పాడి జాతులలో అత్యంత ప్రాచుర్యం పొందినవి. ఈ జాతి పాకిస్థాన్‌లోని సింధ్ ప్రావిన్స్‌లో ఉద్భవించింది."
  },
  "Ayrshire cattle are a breed of dairy cattle from Ayrshire in southwest Scotland. They are known for their ability to produce quality milk and their hardiness.": {
    en: "Ayrshire cattle are a breed of dairy cattle from Ayrshire in southwest Scotland. They are known for their ability to produce quality milk and their hardiness.",
    hi: "आयरशायर मवेशी दक्षिण-पश्चिम स्कॉटलैंड में आयरशायर के डेयरी मवेशियों की एक नस्ल है। वे गुणवत्तापूर्ण दूध उत्पादन की क्षमता के लिए जाने जाते हैं।",
    te: "అయిర్షైర్ పశువులు నైరుతి స్కాట్లాండ్‌లోని అయిర్షైర్‌కు చెందిన పాడి పశువుల జాతి. ఇవి నాణ్యమైన పాలను ఉత్పత్తి చేసే సామర్థ్యానికి ప్రసిద్ధి చెందాయి."
  },
  "The Brown Swiss is a North American breed of dairy cattle, derived from the Braunvieh of Switzerland. It is large and robust, and its milk is ideal for cheese making.": {
    en: "The Brown Swiss is a North American breed of dairy cattle, derived from the Braunvieh of Switzerland. It is large and robust, and its milk is ideal for cheese making.",
    hi: "ब्राउन स्विस स्विट्जरलैंड के ब्रौनविह से प्राप्त डेयरी मवेशियों की एक उत्तरी अमेरिकी नस्ल है।",
    te: "బ్రౌన్ స్విస్ అనేది స్విట్జర్లాండ్‌లోని బ్రాన్‌విహ్ నుండి ఉద్భవించిన పాడి పశువుల ఉత్తర అమెరికా జాతి."
  },
  "Red Dane cattle, also known as Red Danish, are a major dairy breed in northern Europe. They were developed in Denmark from local cattle crossed with Angeln and Schleswig cattle.": {
    en: "Red Dane cattle, also known as Red Danish, are a major dairy breed in northern Europe. They were developed in Denmark from local cattle crossed with Angeln and Schleswig cattle.",
    hi: "रेड डेन मवेशी, जिन्हें रेड डेनिश के रूप में भी जाना जाता है, उत्तरी यूरोप में एक प्रमुख डेयरी नस्ल है।",
    te: "రెడ్ డేన్ పశువులు, డేనిష్‌గా కూడా పిలువబడతాయి, ఉత్తర యూరప్‌లో ప్రధాన పాడి జాతి। వీటిని డెన్‌మార్క్‌లో స్థానిక పశువులను Angeln మరియు Schleswig పశువులతో క్రాస్ చేయడం ద్వారా అభివృద్ధి చేశారు.",
  },

  // Health Analysis Mode Selection Strings
  speakAboutCattleHealth: { en: 'Speak about your cattle health concerns in your local language', hi: 'अपनी स्थानीय भाषा में अपने पशु स्वास्थ्य संबंधी चिंताओं के बारे में बात करें', te: 'మీ పశువుల ఆరోగ్య సమస్యల గురించి మీ స్థానిక భాషలో మాట్లాడండి' },
  chooseAnalysisMethod: { en: 'Choose your analysis method', hi: 'अपनी विश्लेषण विधि चुनें', te: 'మీ విశ్లేషణ పద్ధతిని ఎంచుకోండి' },
  voiceAnalysisTitle: { en: '🎤 Voice Analysis', hi: '🎤 वॉइस विश्लेषण', te: '🎤 వాయిస్ విశ్లేషణ' },
  speakAboutSymptoms: { en: 'Speak about symptoms in your local language', hi: 'अपनी स्थानीय भाषा में लक्षणों के बारे में बात करें', te: 'మీ స్థానిక భాషలో లక్షణాల గురించి మాట్లాడండి' },
  manualEntryTitle: { en: '📝 Manual Entry', hi: '📝 मैनुअल प्रविष्टि', te: '📝 ম్యానువల్ ఎంట్రీ' },
  selectSymptoms: { en: 'Select symptoms from a list', hi: 'एक सूची से लक्षणों का चयन करें', te: 'జాబితా నుండి లక్షణాలను ఎంచుకోండి' },
  imageOnlyTitle: { en: '📸 Image Only', hi: '📸 केवल छवि', te: '📸 చిత్రం మాత్రమే' },
  uploadCattleImageAnalysis: { en: 'Upload cattle image for external disease analysis', hi: 'बाहरी रोग विश्लेषण के लिए पशु छवि अपलोड करें', te: 'బాహ్య వ్యాధి విశ్లేషణ కోసం పశువుల చిత్రాన్ని అప్‌లోడ్ చేయండి' },

  // Health Analysis - Voice Input Setup & Manual Entry
  back: { en: 'Back', hi: 'वापस', te: 'తిరిగి' },
  startRecording: { en: 'Start Recording', hi: 'रिकॉर्डिंग शुरू करें', te: 'రికార్డింగ్ ప్రారంభించండి' },
  selectObservedSymptoms: { en: 'Select Observed Symptoms', hi: 'देखे गए लक्षणों का चयन करें', te: 'గమనించిన లక్షణాలను ఎంచుకోండి' },
  analyzeSymptoms: { en: 'Analyze Symptoms', hi: 'लक्षणों का विश्लेषण करें', te: 'లక్షణాలను విశ్లేషించండి' },
  externalDiseaseAnalysis: { en: 'External Disease Analysis', hi: 'बाहरी रोग विश्लेषण', te: 'బాహ్య రోగ విశ్లేషణ' },
  uploadCattleImage: { en: 'Upload Cattle Image', hi: 'पशु छवि अपलोड करें', te: 'పశువుల చిత్రాన్ని అప్‌లోడ్ చేయండి' },
  clickToUploadCattleImage: { en: 'Click to upload cattle image', hi: 'पशु छवि अपलोड करने के लिए क्लिक करें', te: 'పశువుల చిత్రాన్ని అప్‌లోడ్ చేయడానికి క్లిక్ చేయండి' },
  supportedFormats: { en: '(PNG, JPG, or WEBP)', hi: '(PNG, JPG, या WEBP)', te: '(PNG, JPG, లేదా WEBP)' },

  // Characteristics
  "High milk production capacity": { en: "High milk production capacity", hi: "उच्च दुग्ध उत्पादन क्षमता", te: "అధిక పాల ఉత్పత్తి సామర్థ్యం" },
  "Long, pendulous ears": { en: "Long, pendulous ears", hi: "लंबे, लटकते कान", te: "పొడవైన, వ్రేలాడే చెవులు" },
  "Convex forehead": { en: "Convex forehead", hi: "उत्तल माथा", te: "ఉబ్బెత్తు నుదురు" },
  "Resistant to tropical diseases and hot temperatures": { en: "Resistant to tropical diseases and hot temperatures", hi: "उष्णकटिबंधीय रोगों और गर्म तापमान के प्रति प्रतिरोधी", te: "ఉష్ణమండల వ్యాధులు మరియు వేడి ఉష్ణోగ్రతలకు నిరోధకత" },
  "Reddish brown color": { en: "Reddish brown color", hi: "लाल भूरा रंग", te: "ఎరుపు గోధుమ రంగు" },
  "Large hump in males": { en: "Large hump in males", hi: "नर में बड़ा कूबड़", te: "మగవాటిలో పెద్ద మూపురం" },
  "Heavy dewlap": { en: "Heavy dewlap", hi: "भारी गलकंबल", te: "భారీ గొంతు కింద తోలు" },
  "Best indigenous dairy breed in India": { en: "Best indigenous dairy breed in India", hi: "भारत में सर्वश्रेष्ठ स्वदेशी डेयरी नस्ल", te: "భారతదేశంలో అత్యుత్తమ స్వదేశీ పాడి జాతి" },
  "Distinctive black and white markings": { en: "Distinctive black and white markings", hi: "विशिष्ट काले और सफेद निशान", te: "విలక్షణమైన నలుపు మరియు తెలుపు గుర్తులు" },
  "Very high milk yield": { en: "Very high milk yield", hi: "बहुत अधिक दूध की पैदावार", te: "చాలా అధిక పాల దిగుబడి" },
  "Large body size": { en: "Large body size", hi: "बड़ा शरीर", te: "పెద్ద శరీర పరిమాణం" },
  "Efficient converter of forage to milk": { en: "Efficient converter of forage to milk", hi: "चारे को दूध में बदलने में कुशल", te: "మేతను పాలుగా మార్చడంలో సమర్థవంతమైనది" },
  "Fawn or light brown color": { en: "Fawn or light brown color", hi: "हल्का भूरा रंग", te: "లేత గోధుమ రంగు" },
  "Small stature": { en: "Small stature", hi: "छोटा कद", te: "చిన్న పొడవు" },
  "High butterfat content in milk": { en: "High butterfat content in milk", hi: "दूध में उच्च बटरफैट सामग्री", te: "పాలలో అధిక వెన్న శాతం" },
  "Heat tolerant and adaptable": { en: "Heat tolerant and adaptable", hi: "गर्मी के प्रति सहनशील और अनुकूलनीय", te: "వేడిని తట్టుకోగలదు మరియు అనుకూలమైనది" },
  "Deep red color": { en: "Deep red color", hi: "गहरा लाल रंग", te: "ముదురు ఎరుపు రంగు" },
  "High heat tolerance": { en: "High heat tolerance", hi: "उच्च गर्मी सहनशीलता", te: "అధిక వేడి తట్టుకోగల సామర్థ్యం" },
  "Resistant to ticks": { en: "Resistant to ticks", hi: "किलनी (ticks) के प्रति प्रतिरोधी", te: "టిక్స్‌కు నిరోధకత" },
  "Good milk yield for indigenous breeds": { en: "Good milk yield for indigenous breeds", hi: "स्वदेशी नस्लों के लिए अच्छी दूध की पैदावार", te: "స్వదేశీ జాతులకు మంచి పాల దిగుబడి" },
  "Red and white markings": { en: "Red and white markings", hi: "लाल और सफेद निशान", te: "ఎరుపు మరియు తెలుపు గుర్తులు" },
  "Strong, well-attached udders": { en: "Strong, well-attached udders", hi: "मजबूत, अच्छी तरह से जुड़े थन", te: "బలమైన, చక్కగా అమర్చబడిన పొదుగులు" },
  "Hardy and adaptable to different climates": { en: "Hardy and adaptable to different climates", hi: "विभिन्न जलवायु के लिए कठोर और अनुकूलनीय", te: "విభిన్న వాతావరణాలకు తట్టుకోగలదు మరియు అనుకూలమైనది" },
  "Excellent foraging ability": { en: "Excellent foraging ability", hi: "उत्कृष्ट चारा खोजने की क्षमता", te: "అద్భుతమైన మేత సామర్థ్యం" },
  "Solid brown color": { en: "Solid brown color", hi: "गहरा भूरा रंग", te: "ఘన గోధుమ రంగు" },
  "Large, sturdy frame": { en: "Large, sturdy frame", hi: "बड़ा, मजबूत ढांचा", te: "పెద్ద, దృఢమైన ఫ్రేమ్" },
  "Docile temperament": { en: "Docile temperament", hi: "विनम्र स्वभाव", te: "సాధు స్వభావం" },
  "High protein-to-fat ratio in milk": { en: "High protein-to-fat ratio in milk", hi: "दूध में उच्च प्रोटीन-से-वसा अनुपात", te: "పాలలో అధిక ప్రోటీన్-టు-ఫ్యాట్ నిష్పత్తి" },
  "Solid red color": { en: "Solid red color", hi: "गहरा लाल रंग", te: "ఘన ఎరుపు రంగు" },
  "High milk production": { en: "High milk production", hi: "उच्च दुग्ध उत्पादन", te: "అధిక పాల ఉత్పత్తి" },
  "Good fat and protein content": { en: "Good fat and protein content", hi: "अच्छी वसा और प्रोटीन सामग्री", te: "మంచి కొవ్వు మరియు ప్రోటీన్ కంటెంట్" },
  "Strong and hardy": { en: "Strong and hardy", hi: "मजबूत और कठोर", te: "బలమైన మరియు కఠినమైనది" },

  // Government Welfare Schemes Page
  govWelfareSchemes: { en: 'Government Welfare Schemes', hi: 'सरकारी कल्याण योजनाएं', te: 'ప్రభుత్వ సంక్షేమ పథకాలు' },
  unlockBenefits: { 
    en: 'Unlock the benefits you deserve. Browse the latest subsidies, insurance plans, and loans designed to support cattle farmers across India.', 
    hi: 'अपने सही लाभों को अनलॉक करें। भारत भर में पशुधन किसानों का समर्थन करने के लिए डिज़ाइन किए गए नवीनतम सब्सिडी, बीमा योजनाएं और ऋण ब्राउज़ करें।', 
    te: 'మీకు చెందిన ప్రయోజనాలను అన్‌లాక్ చేయండి. భారతదేశ గ్రామాలలో పశుపోషకులకు మద్దతు ఇవ్వడానికి రూపొందించిన సর్వশేష రాయితీలు, ఇన్సూరెన్స్ పథకాలు మరియు రుణాలను బ్రౌజ్ చేయండి.' 
  },

  // Scheme: Rashtriya Gokul Mission
  rashtriyaGokulMission: { en: 'Rashtriya Gokul Mission', hi: 'राष्ट्रीय गोकुल मिशन', te: 'రాష్ట్రీయ గోకుల్ మిషన్' },
  conservationIndigenous: { en: 'Conservation and development of indigenous breeds.', hi: 'स्वदेशी नस्लों का संरक्षण और विकास।', te: 'స్వదేశీ జాతుల సংరక్షణ మరియు అభివృద్ధి.' },
  gokulMissionDetails: { 
    en: 'The Rashtriya Gokul Mission aims to conserve and develop indigenous bovine breeds in a focused and scientific manner. It includes setting up of Gokul Grams for integrated indigenous cattle centers.', 
    hi: 'राष्ट्रीय गोकुल मिशन स्वदेशी गोवंश नस्लों को केंद्रित और वैज्ञानिक तरीके से संरक्षित और विकसित करने का लक्ष्य रखता है। इसमें एकीकृत स्वदेशी पशु केंद्रों के लिए गोकुल ग्रामों की स्थापना शामिल है।', 
    te: 'రాష్ట్రీయ గోకుల్ మిషన్ స్వదేశీ గోవంశ జాతులను కేంద్రీకృతమైన మరియు శాస్త్రీయ పద్ధతిలో సంరక్షించడం మరియు అభివృద్ధి చేయడం లక్ష్యంగా చేసుకుంది. ఇది సమన్విత స్వదేశీ పశువుల కేంద్రాల కోసం గోకుల్ గ్రామాలను ఏర్పాటు చేయడం కలిగి ఉంది.' 
  },
  farmersIndigenousCows: { en: 'Farmers with indigenous cows', hi: 'स्वदेशी गायों वाले किसान', te: 'స్వదేశీ ఆవులు కలిగిన రైతులు' },
  gaushalas: { en: 'Gaushalas', hi: 'गौशालाएं', te: 'గౌశాలలు' },
  dairyCooperatives: { en: 'Dairy Cooperatives', hi: 'डेयरी सहकारी', te: 'పాడి సహకారాలు' },
  subsidyShedConstruction: { en: 'Subsidy for shed construction', hi: 'शेड निर्माण के लिए सब्सिडी', te: 'షెడ్ నిర్మాణానికి సబ్సిడీ' },
  freeVeterinaryServices: { en: 'Free veterinary services', hi: 'मुफ्त पशु चिकित्सा सेवाएं', te: 'ఉచిత పశువైద్య సేవలు' },
  highQualitySemen: { en: 'High-quality semen for breeding', hi: 'प्रजनन के लिए उच्च गुणवत्ता वीर्य', te: 'సంతానోత్పత్తి కోసం అధిక నాణ్యతా వీర్యం' },
  deadline31March: { en: '31st March 2026', hi: '31 मार्च 2026', te: '31 మార్చి 2026' },

  // Scheme: National Livestock Mission
  nationalLivestockMission: { en: 'National Livestock Mission', hi: 'राष्ट्रीय पशुधन मिशन', te: 'జాతీయ పశుధన మిషన్' },
  sustainableDevelopment: { en: 'Sustainable development of livestock sector.', hi: 'पशुधन क्षेत्र का सतत विकास।', te: 'పశుధన రంగం యొక్క సsustainability అభివృద్ధి.' },
  nlmDetails: { 
    en: 'This mission covers all activities required to ensure quantitative and qualitative improvement in livestock production systems and capacity building of all stakeholders.', 
    hi: 'यह मिशन पशुधन उत्पादन प्रणालियों में मात्रात्मक और गुणात्मक सुधार सुनिश्चित करने और सभी हितधारकों की क्षमता निर्माण के लिए आवश्यक सभी गतिविधियों को कवर करता है।', 
    te: 'ఈ మిషన్ పశుధన ఉత్పత్తి వ్యవస్థలలో పరిమాణాత్మక మరియు గుణాత్మక సుధారణను నిশ్చితం చేయడానికి మరియు అన్ని వాటాదారుల సామర్థ్య నిర్మాణానికి అవసరమైన సమస్త కార్యకలాపాలను కవర్ చేస్తుంది.' 
  },
  individualFarmers: { en: 'Individual Farmers', hi: 'व्यक्तिगत किसान', te: 'వ్యక్తిగత రైతులు' },
  shgsJlgs: { en: 'SHGs, JLGs', hi: 'स्व-सहायता समूह, संयुक्त देयता समूह', te: 'స్వయం సహాయ సమూహాలు, సంయుక్త బాధ్యత సమూహాలు' },
  cooperatives: { en: 'Cooperatives', hi: 'सहकारी', te: 'సహకారాలు' },
  fiftyPercentSubsidy: { en: '50% capital subsidy', hi: '50% पूंजी सब्सिडी', te: '50% మూలధన సబ్సిడీ' },
  trainingSkillDev: { en: 'Training and skill development', hi: 'प्रशिक्षण और कौशल विकास', te: 'శిక్షణ మరియు నైపుణ్య అభివృద్ధి' },
  riskManagement: { en: 'Risk management', hi: 'जोखिम प्रबंधन', te: 'ప్రమాద నిర్వహణ' },
  openThroughoutYear: { en: 'Open throughout the year', hi: 'पूरे साल खुला', te: 'సంవత్సరం పొడవుకు తెరిచి ఉంది' },

  // Scheme: Livestock Insurance Scheme
  livestockInsuranceScheme: { en: 'Livestock Insurance Scheme', hi: 'पशुधन बीमा योजना', te: 'పశుధన ఇన్సూరెన్స్ పథకం' },
  protectionLossCattle: { en: 'Protection against loss of cattle due to death.', hi: 'मृत्यु के कारण मवेशी के नुकसान से सुरक्षा।', te: 'మరణం కారణంగా పశువుల నష్టానికి వ్యతిరేక సুरక్షा.' },
  lisDetails: { 
    en: 'Provides insurance cover to cattle and buffaloes against death due to any reason. The scheme is implemented in all districts.', 
    hi: 'किसी भी कारण से मृत्यु के खिलाफ गायों और भैंसों को बीमा कवर प्रदान करता है। यह योजना सभी जिलों में लागू है।', 
    te: 'ఏ కారణానికైనా మరణానికి వ్యతిరేకంగా పశువులు మరియు గేదెలకు ఇన్సూరెన్స్ కవర్‌ను అందించుకుంటుంది. ఈ పథకం అన్ని జిల్లాలలో అమలు చేయబడుతుంది.' 
  },
  farmersOwningCattle: { en: 'Farmers owning cattle/buffaloes', hi: 'मवेशी/भैंस मालिक किसान', te: 'పశువులు/గేదెలను కలిగిన రైతులు' },
  fiftySeventySubsidy: { en: '50-70% subsidy on premium', hi: 'प्रीमियम पर 50-70% सब्सिडी', te: 'ప్రీమియం పై 50-70% సబ్సిడీ' },
  immediateClaimSettlement: { en: 'Immediate claim settlement', hi: 'तत्काल दावा निपटान', te: 'తక్షణ చెల్లింపు ఏర్పాటు' },
  rollingBasis: { en: 'Rolling basis', hi: 'सतत आधार पर', te: 'రోలింగ్ ఆధారం' },

  // Scheme: Kisan Credit Card for AH
  kisanCreditCard: { en: 'Kisan Credit Card (KCC) for AH', hi: 'किसान क्रेडिट कार्ड (KCC) पशुधन के लिए', te: 'కిసాన్ క్రెడిట్ కార్డ్ (KCC) పశుధనానికి' },
  workingCapitalLoan: { en: 'Working capital loan for animal husbandry farmers.', hi: 'पशुपालन किसानों के लिए कार्यशील पूंजी ऋण।', te: 'పశుపోషణ రైతుల కోసం कার్యशీల మూలధన రుణం.' },
  kccDetails: { 
    en: 'Extension of KCC facility to Animal Husbandry farmers and Fisheries to help them meet their working capital requirements.', 
    hi: 'पशुपालन किसानों और मत्स्य पालन को KCC सुविधा का विस्तार उन्हें अपनी कार्यशील पूंजी आवश्यकताओं को पूरा करने में मदद करने के लिए।', 
    te: 'పశుపోషణ రైతులు మరియు చేపల పालన కోసం KCC సుविధ యొక్క సంబంధం వారి కార్యశీల మూలధన అవసరాలను తీర్చడానికి సహాయం చేయడానికి.' 
  },
  dairyFarmers: { en: 'Dairy farmers', hi: 'डेयरी किसान', te: 'పాడి రైతులు' },
  poultryFarmers: { en: 'Poultry farmers', hi: 'कुक्कुट पालक', te: 'పోల్ట్రీ రైతులు' },
  fishFarmers: { en: 'Fish farmers', hi: 'मछली पालक', te: 'చేపల రైతులు' },
  collateralFreeLoan: { en: 'Collateral-free loan up to ₹1.6 Lakh', hi: 'प्रतिभूति-मुक्त ऋण ₹1.6 लाख तक', te: '₹1.6 లక్ష వరకు సంపద-రహిత రుణం' },
  interestSubvention: { en: 'Interest subvention of 3% for prompt repayment', hi: 'तत्काल चुकौती के लिए 3% की ब्याज सहायता', te: 'త్వరిత తిరిగి చెల్లింపు కోసం 3% ఆసక్తి సబ్సిడీ' },
  applyAnyTimeBank: { en: 'Apply anytime at bank', hi: 'बैंक में किसी भी समय आवेदन करें', te: 'బ్యాంకులో ఎప్పుడైనా దరఖాస్తు చేయండి' },

  // Common sections
  schemeDetails: { en: 'Scheme Details', hi: 'योजना विवरण', te: 'పథకం వివరాలు' },
  eligibilityCriteria: { en: 'Eligibility Criteria', hi: 'पात्रता मानदंड', te: 'అర్హత ప్రమాణాలు' },
  keyBenefits: { en: 'Key Benefits', hi: 'मुख्य लाभ', te: 'ముఖ్య ప్రయోజనాలు' },
  deadline: { en: 'Deadline:', hi: 'समय सीमा:', te: 'చేరిక సమయం:' },
  applyNowPortal: { en: 'Apply Now on Official Portal', hi: 'आधिकारिक पोर्टल पर अभी आवेदन करें', te: 'అధికారిక పోర్టల్‌లో ఇప్పుడు దరఖాస్తు చేయండి' },
  needHelpApplying: { en: 'Need help applying?', hi: 'आवेदन में मदद चाहिए?', te: 'దరఖాస్తుకు సహాయం కావాలా?' },
  supportTeamGuide: { 
    en: 'Our support team can guide you through the documentation process for any of these schemes.', 
    hi: 'हमारी सहायता टीम आपको इनमें से किसी भी योजना के लिए दस्तावेज़ प्रक्रिया के माध्यम से निर्देशित कर सकती है।', 
    te: 'మా సపోర్ట్ టీమ్ ఈ పథకాలలో ఏదైనా కోసం డాక్యుమెంటేషన్ ప్రక్రియ ద్వారా మిమ్మల్ని గైడ్ చేయవచ్చు.' 
  },
  contactHelpline: { en: 'Contact Helpline', hi: 'सहायता हेतु संपर्क करें', te: 'సహాయ కేంద్రానికి సంపర్కం చేయండి' },

  // Government Schemes Page - Additional Translations
  noVerifiedSchemes: { en: 'No verified schemes available', hi: 'कोई सत्यापित योजना उपलब्ध नहीं है', te: 'ధృవీకృత పథకాలు లేవు' },
  schemsUpdatedDaily: { en: 'Schemes are automatically updated daily at early morning with the latest government offerings', hi: 'योजनाएं स्वचालित रूप से प्रतिदिन सुबह जल्दी नवीनतम सरकारी प्रस्तावों के साथ अपडेट की जाती हैं', te: 'పథకాలు ప్రతిరోజూ తెల్లవారుజామున సరकారు సరఫరాలతో స్వయంచాలకంగా అప్‌డేట్ చేయబడతాయి' },
  governmentVerified: { en: 'Government Verified', hi: 'सरकार द्वारा सत्यापित', te: 'సరకారు ధృవీకృత' },
  officialScheme: { en: 'Official Scheme', hi: 'आधिकारिक योजना', te: 'అధికారిక పథకం' },
  verifiedAndSecure: { en: 'Verified & Secure', hi: 'सत्यापित और सुरक्षित', te: 'ధృవీకృత మరియు సురక్షితం' },
  notSpecified: { en: 'Not specified', hi: 'निर्दिष्ट नहीं', te: 'నిర్దేశించలేదు' },
  failedToFetchSchemes: { en: 'Failed to fetch schemes', hi: 'योजनाएं प्राप्त करने में विफल', te: 'పథకాలను పొందడం విఫలమైంది' },
  errorFetchingSchemes: { en: 'Error fetching schemes', hi: 'योजनाओं को प्राप्त करने में त्रुटि', te: 'పథకాలను పొందడంలో లోపం' },

  // Health Analysis Results Page
  healthAnalysisResult: { en: 'Health Analysis Result', hi: 'स्वास्थ्य विश्लेषण परिणाम', te: 'ఆరోగ్య విశ్లేషణ ఫలితం' },
  whatIsTheProblem: { en: 'What is the Problem?', hi: 'समस्या क्या है?', te: 'సమస్య ఏమిటి?' },
  whatPrecautions: { en: 'What Precautions Should We Take?', hi: 'हमें कौन सी सावधानियां बरतनी चाहिए?', te: 'మేము ఏ జాగ్రత్తలు తీసుకోవాలి?' },
  ifSeriousMeetDoctor: { en: 'If Serious, Meet the Doctor Immediately', hi: 'यदि गंभीर है, तो तुरंत डॉक्टर से मिलें', te: 'తీవ్రమైనట్లయితే, వెంటనే డాక్టర్‌ని సందర్శించండి' },
  urgentContactVetImmediate: { en: 'URGENT: Contact veterinarian immediately', hi: 'तत्काल: तुरंत पशुचिकित्सक से संपर्क करें', te: 'అత్యవసరం: వెంటనే పశువైద్యుడిని సంప్రదించండి' },
  urgentContactVet24Hours: { en: 'URGENT: Contact veterinarian within 24 hours', hi: '24 घंटे के भीतर पशुचिकित्सक से संपर्क करें', te: '24 గంటల్లోపు పశువైద్యుడిని సంప్రదించండి' },
  monitorClosely: { en: 'Monitor closely, contact if condition worsens', hi: 'बारीकी से निरीक्षण करें, स्थिति बिगड़ने पर संपर्क करें', te: 'దగ్గరగా పర్యవేక్షించండి, పరిస్థితి విపరీతమైతే సంపర్కం చేయండి' },
  cattleAppearsHealthy: { en: 'Cattle appears healthy', hi: 'पशु स्वस्थ दिख रहा है', te: 'పశువు ఆరోగ్యవంతంగా కనిపిస్తోంది' },
  voiceInputTranscribed: { en: 'Voice Input (Transcribed):', hi: 'वॉइस इनपुट (लिप्यंतरित):', te: 'వాయిస్ ఇన్‌పుట్ (లిప్యంతరం)' },
  runNewAnalysis: { en: 'Run New Analysis', hi: 'नया विश्लेषण चलाएं', te: 'నవ విశ్లేషణను ప్రారంభించండి' },
  error: { en: 'Error', hi: 'त्रुटि', te: 'లోపం' },

  // Health Analysis Content Labels
  recommendedTests: { en: 'Recommended Tests:', hi: 'अनुशंसित परीक्षाएं:', te: 'సిఫారిశ చేసిన పరీక్షలు:' },
  urgencyLevel: { en: 'Urgency Level:', hi: 'तात्कालिकता स्तर:', te: 'అత్యవసరం స్థాయి:' },
  watchForWarningSigns: { en: 'Watch for these warning signs:', hi: 'इन चेतावनी संकेतों पर ध्यान दें:', te: 'ఈ హెచ్చరిక సంకేతాల కోసం చూడండి:' },
  potentialDiseases: { en: 'Potential Issues:', hi: 'संभावित समस्याएं:', te: 'సంభావ్య సమస్యలు:' },
  treatmentRecommendations: { en: 'Treatment Recommendations:', hi: 'उपचार सिफारिशें:', te: 'చికిత్స సిఫారిశలు:' },
  preventiveMeasures: { en: 'Preventive Measures:', hi: 'निवारक उपाय:', te: 'నిరోధక చర్యలు:' },
  dietaryAdvisory: { en: 'Dietary Advisory:', hi: 'आहार सलाह:', te: 'ఆహార సలహా:' },
  yesContactVetImmediately: { en: 'YES - Contact veterinarian immediately', hi: 'हाँ - तुरंत पशुचिकित्सक से संपर्क करें', te: 'అవును - వెంటనే పశువైద్యుడిని సంప్రదించండి' },
  noMonitorAtHome: { en: 'NO - Monitor at home with care', hi: 'नहीं - घर पर सावधानी से निरीक्षण करें', te: 'లేదు - ఇంటిలో సాధ్యమైనంత సంరక్షించండి' },

  // Voice Input Ready Section
  voiceInputReady: { en: 'Voice Input Ready', hi: 'वॉइस इनपुट तैयार', te: 'వాయిస్ ఇన్‌పుట్ సిద్ధమైంది' },
  recordingDuration: { en: 'Recording Duration:', hi: 'रिकॉर्डिंग अवधि:', te: 'రికార్డింగ్ వ్యవధి:' },
  recordAgain: { en: '🔄 Record Again', hi: '🔄 फिर से रिकॉर्ड करें', te: '🔄 మళ్లీ రికార్డ చేయండి' },
  analyze: { en: 'Analyze', hi: 'विश्लेषण करें', te: 'విశ్లేషించండి' },

};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
