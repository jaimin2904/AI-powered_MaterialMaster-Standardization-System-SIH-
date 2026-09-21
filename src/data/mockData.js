// Realistic sample material master dataset for Central Public Sector Enterprises (CPSEs)

export const CPSE_LIST = [
  { id: 'all', name: 'All CPSEs & Ministries', code: 'ALL' },
  { id: 'ntpc', name: 'NTPC Limited', code: 'NTPC', category: 'Power & Energy' },
  { id: 'cil', name: 'Coal India Limited', code: 'CIL', category: 'Mining & Minerals' },
  { id: 'ongc', name: 'Oil and Natural Gas Corp (ONGC)', code: 'ONGC', category: 'Oil & Gas' },
  { id: 'bhel', name: 'Bharat Heavy Electricals Ltd (BHEL)', code: 'BHEL', category: 'Heavy Engineering' },
  { id: 'sail', name: 'Steel Authority of India Ltd (SAIL)', code: 'SAIL', category: 'Steel & Metals' },
  { id: 'iocl', name: 'Indian Oil Corporation Ltd (IOCL)', code: 'IOCL', category: 'Refining & Petrochemicals' },
  { id: 'gail', name: 'GAIL (India) Limited', code: 'GAIL', category: 'Gas Transmission' },
];

export const CATEGORIES = [
  'Mechanical Spares & Components',
  'Electrical Equipment & Accessories',
  'Piping, Valves & Fittings',
  'Instrumentation & Process Controls',
  'Chemicals, Lubricants & Gases',
  'Civil & Structural Steel',
  'Heavy Earthmoving Machinery (HEMM)',
];

export const MATERIALS_DATA = [
  {
    numcCode: 'NUMC-401015-0089',
    localCode: 'NTPC-MECH-BLR-0941',
    cpseId: 'ntpc',
    cpseName: 'NTPC Limited',
    rawDescription: 'VALVE GATE 2IN 150# FLANGED WCB BODY CS SEAT SS316',
    standardDescription: 'Gate Valve, Flanged Ends, 2 inch (50mm NB), ASME Class 150, Cast Carbon Steel Body (ASTM A216 Gr WCB), SS316 Trim',
    unspscCode: '40141600',
    unspscCategory: 'Valves',
    mescCode: '60.12.34.110.1',
    stockQty: 142,
    unit: 'NOS',
    unitCost: 14850,
    manufacturer: 'L&T Valves / Audco',
    plantLocation: 'Vindhyachal Super Thermal Power Station',
    status: 'Harmonized',
    confidenceScore: 98.4,
    lastUpdated: '2026-09-18',
    specifications: {
      'Nominal Size': '2 inch (50mm)',
      'Pressure Rating': 'Class 150 (PN20)',
      'Body Material': 'ASTM A216 WCB',
      'Trim Material': 'SS316 (13 Cr Face)',
      'End Connection': 'Flanged RF (Raised Face)',
      'Standard': 'API 600 / BS 1414'
    }
  },
  {
    numcCode: 'NUMC-401015-0089',
    localCode: 'CIL-M-VLV-5012',
    cpseId: 'cil',
    cpseName: 'Coal India Limited',
    rawDescription: 'GATE VALVE 50MM CL-150 FLG WCB SS FLANGE TYPE',
    standardDescription: 'Gate Valve, Flanged Ends, 2 inch (50mm NB), ASME Class 150, Cast Carbon Steel Body (ASTM A216 Gr WCB), SS316 Trim',
    unspscCode: '40141600',
    unspscCategory: 'Valves',
    mescCode: '60.12.34.110.1',
    stockQty: 88,
    unit: 'NOS',
    unitCost: 18200,
    manufacturer: 'Kirloskar Brothers Ltd',
    plantLocation: 'Northern Coalfields Ltd (NCL Singrauli)',
    status: 'Duplicate Cluster',
    confidenceScore: 95.2,
    lastUpdated: '2026-09-15',
    specifications: {
      'Nominal Size': '50mm (2 inch)',
      'Pressure Rating': 'Class 150',
      'Body Material': 'Cast Carbon Steel WCB',
      'Trim Material': 'SS316',
      'End Connection': 'Flanged',
      'Standard': 'API 600'
    }
  },
  {
    numcCode: 'NUMC-311715-0142',
    localCode: 'BHEL-ELE-MTR-8812',
    cpseId: 'bhel',
    cpseName: 'Bharat Heavy Electricals Ltd (BHEL)',
    rawDescription: 'IND MOTOR 75KW 4P 415V 50HZ TEFC FOOT B3 IE3',
    standardDescription: '3-Phase Induction Motor, 75 kW (100 HP), 4 Pole (1500 RPM), 415V, 50Hz, TEFC, Frame 280M, Foot Mounted B3, Efficiency IE3 Premium',
    unspscCode: '26101100',
    unspscCategory: 'Motors',
    mescCode: '52.10.45.220.3',
    stockQty: 24,
    unit: 'NOS',
    unitCost: 245000,
    manufacturer: 'ABB India / Siemens',
    plantLocation: 'Haridwar Heavy Electrical Equipment Plant',
    status: 'Harmonized',
    confidenceScore: 99.1,
    lastUpdated: '2026-09-19',
    specifications: {
      'Power Rating': '75 kW (100 HP)',
      'Voltage / Freq': '415V +/- 10%, 50Hz',
      'Speed / Poles': '1480 RPM (4 Pole)',
      'Frame Size': '280M',
      'Enclosure': 'TEFC (IP55)',
      'Efficiency Level': 'IE3 Premium'
    }
  },
  {
    numcCode: 'NUMC-311715-0142',
    localCode: 'ONGC-OFF-MTR-0044',
    cpseId: 'ongc',
    cpseName: 'Oil and Natural Gas Corp (ONGC)',
    rawDescription: 'MOTOR INDUCTION 75 KW 415V 1480RPM IE-3 FOOT MOUNT',
    standardDescription: '3-Phase Induction Motor, 75 kW (100 HP), 4 Pole (1500 RPM), 415V, 50Hz, TEFC, Frame 280M, Foot Mounted B3, Efficiency IE3 Premium',
    unspscCode: '26101100',
    unspscCategory: 'Motors',
    mescCode: '52.10.45.220.3',
    stockQty: 18,
    unit: 'NOS',
    unitCost: 289000,
    manufacturer: 'Bharat Bijlee Ltd',
    plantLocation: 'Mumbai High Offshore Processing Complex',
    status: 'Duplicate Cluster',
    confidenceScore: 96.8,
    lastUpdated: '2026-09-14',
    specifications: {
      'Power Rating': '75 kW',
      'Voltage / Freq': '415V 50Hz',
      'Speed / Poles': '1480 RPM',
      'Frame Size': '280M',
      'Enclosure': 'Ex-d / IP56 Hazardous Area',
      'Efficiency Level': 'IE3'
    }
  },
  {
    numcCode: 'NUMC-311715-0899',
    localCode: 'SAIL-DSP-BRG-6205',
    cpseId: 'sail',
    cpseName: 'Steel Authority of India Ltd (SAIL)',
    rawDescription: 'DEEP GROOVE BALL BEARING 6205-2RS1 C3 SKF',
    standardDescription: 'Deep Groove Ball Bearing, Single Row, 6205-2RS1, Rubber Seals Both Sides, Internal Clearance C3, Bore 25mm, OD 52mm, Width 15mm',
    unspscCode: '31171504',
    unspscCategory: 'Bearings',
    mescCode: '68.04.12.005.0',
    stockQty: 1450,
    unit: 'NOS',
    unitCost: 480,
    manufacturer: 'SKF Bearings',
    plantLocation: 'Durgapur Steel Plant',
    status: 'Harmonized',
    confidenceScore: 99.8,
    lastUpdated: '2026-09-20',
    specifications: {
      'Bore Diameter': '25 mm',
      'Outer Diameter': '52 mm',
      'Width': '15 mm',
      'Sealing': '2RS1 (Rubber Contact Seals)',
      'Clearance': 'C3 Radial Internal Clearance',
      'Dynamic Load': '14.8 kN'
    }
  },
  {
    numcCode: 'NUMC-311715-0899',
    localCode: 'NTPC-RAM-BRG-221',
    cpseId: 'ntpc',
    cpseName: 'NTPC Limited',
    rawDescription: 'BEARING BALL 6205 2RS C3 SKF / FAG 25X52X15MM',
    standardDescription: 'Deep Groove Ball Bearing, Single Row, 6205-2RS1, Rubber Seals Both Sides, Internal Clearance C3, Bore 25mm, OD 52mm, Width 15mm',
    unspscCode: '31171504',
    unspscCategory: 'Bearings',
    mescCode: '68.04.12.005.0',
    stockQty: 820,
    unit: 'NOS',
    unitCost: 420,
    manufacturer: 'FAG / Schaeffler',
    plantLocation: 'Ramagundam Super Thermal Power Station',
    status: 'Harmonized',
    confidenceScore: 99.5,
    lastUpdated: '2026-09-17',
    specifications: {
      'Bore Diameter': '25 mm',
      'Outer Diameter': '52 mm',
      'Width': '15 mm',
      'Sealing': '2RS (Contact Rubber Seal)',
      'Clearance': 'C3',
      'Dynamic Load': '14.8 kN'
    }
  },
  {
    numcCode: 'NUMC-401515-0320',
    localCode: 'IOCL-PR-PMP-104',
    cpseId: 'iocl',
    cpseName: 'Indian Oil Corporation Ltd (IOCL)',
    rawDescription: 'CENTRIFUGAL PUMP IMPELLER SS316 API 610 FLUID END',
    standardDescription: 'Centrifugal Process Pump Impeller, Closed Type, Investment Cast SS316 (ASTM A743 Gr CF8M), Designed for API 610 Pumps, Outer Diameter 280mm',
    unspscCode: '40151500',
    unspscCategory: 'Pumps & Impellers',
    mescCode: '62.08.11.450.2',
    stockQty: 14,
    unit: 'NOS',
    unitCost: 84000,
    manufacturer: 'Sulzer Pumps / KSB',
    plantLocation: 'Mathura Refinery Complex',
    status: 'Under AI Review',
    confidenceScore: 89.4,
    lastUpdated: '2026-09-16',
    specifications: {
      'Type': 'Closed Impeller',
      'Material': 'Cast SS316 (CF8M)',
      'Outer Diameter': '280 mm',
      'Bore Diameter': '45 mm Keyed',
      'Standard': 'API 610 11th Ed',
      'Fluid Handled': 'Hydrocarbon Light Ends'
    }
  },
  {
    numcCode: 'NUMC-261216-0410',
    localCode: 'GAIL-HV-CBL-7701',
    cpseId: 'gail',
    cpseName: 'GAIL (India) Limited',
    rawDescription: 'XLPE CABLE 3.3KV 3C X 240 SQMM ARMOURED HT AL',
    standardDescription: 'HT Power Cable, 3.3 kV Grade, 3 Core x 240 sq mm, Stranded Aluminium Conductor, XLPE Insulated, Inner PVC Sheathed, Galvanised Steel Strip Armoured, Outer PVC Sheathed to IS 7098 Part 2',
    unspscCode: '26121600',
    unspscCategory: 'Electrical Cables',
    mescCode: '54.01.20.240.3',
    stockQty: 3200,
    unit: 'MTRS',
    unitCost: 1850,
    manufacturer: 'Polycab India / Havells',
    plantLocation: 'Hazira Compressor Station',
    status: 'Harmonized',
    confidenceScore: 97.9,
    lastUpdated: '2026-09-12',
    specifications: {
      'Voltage Rating': '3.3 kV (UE)',
      'Cores & Size': '3 Core x 240 sq.mm',
      'Conductor': 'Aluminium Stranded Class 2',
      'Insulation': 'XLPE Cross-linked Polyethylene',
      'Armour Type': 'Flat Galvanised Steel Strip',
      'Standard': 'IS 7098 (Part II) / IEC 60502'
    }
  }
];

export const DUPLICATE_CLUSTERS = [
  {
    clusterId: 'DUP-CLUSTER-1082',
    numcSuggested: 'NUMC-401015-0089',
    title: 'Gate Valve 2 Inch Class 150 WCB SS Trim',
    itemCount: 4,
    totalStockValue: 4890000,
    similarityAvg: 96.8,
    potentialSaving: 1240000,
    cpseInvolved: ['NTPC Limited', 'Coal India Limited', 'ONGC', 'SAIL'],
    primaryItem: {
      localCode: 'NTPC-MECH-BLR-0941',
      cpseName: 'NTPC Limited',
      description: 'VALVE GATE 2IN 150# FLANGED WCB BODY CS SEAT SS316',
      unitCost: 14850,
      stockQty: 142
    },
    clusterCandidates: [
      {
        localCode: 'NTPC-MECH-BLR-0941',
        cpseName: 'NTPC Limited',
        rawDescription: 'VALVE GATE 2IN 150# FLANGED WCB BODY CS SEAT SS316',
        unitCost: 14850,
        stockQty: 142,
        similarity: 100
      },
      {
        localCode: 'CIL-M-VLV-5012',
        cpseName: 'Coal India Limited',
        rawDescription: 'GATE VALVE 50MM CL-150 FLG WCB SS FLANGE TYPE',
        unitCost: 18200,
        stockQty: 88,
        similarity: 96.5
      },
      {
        localCode: 'ONGC-VALVE-0992',
        cpseName: 'ONGC',
        rawDescription: '2 INCH GATE VALVE CLASS 150 RF CS BODY SS TRIM API 600',
        unitCost: 21000,
        stockQty: 45,
        similarity: 95.8
      },
      {
        localCode: 'SAIL-BSL-VLV-440',
        cpseName: 'SAIL (Bokaro)',
        rawDescription: 'VALVE GATE 50 NB 150 LBS ANSI FLANGED CAST STEEL',
        unitCost: 16500,
        stockQty: 30,
        similarity: 94.9
      }
    ]
  },
  {
    clusterId: 'DUP-CLUSTER-1094',
    numcSuggested: 'NUMC-311715-0142',
    title: '3-Phase Induction Motor 75kW 4P 415V IE3',
    itemCount: 3,
    totalStockValue: 14800000,
    similarityAvg: 97.4,
    potentialSaving: 3200000,
    cpseInvolved: ['BHEL', 'ONGC', 'NTPC Limited'],
    primaryItem: {
      localCode: 'BHEL-ELE-MTR-8812',
      cpseName: 'Bharat Heavy Electricals Ltd (BHEL)',
      description: 'IND MOTOR 75KW 4P 415V 50HZ TEFC FOOT B3 IE3',
      unitCost: 245000,
      stockQty: 24
    },
    clusterCandidates: [
      {
        localCode: 'BHEL-ELE-MTR-8812',
        cpseName: 'Bharat Heavy Electricals Ltd',
        rawDescription: 'IND MOTOR 75KW 4P 415V 50HZ TEFC FOOT B3 IE3',
        unitCost: 245000,
        stockQty: 24,
        similarity: 100
      },
      {
        localCode: 'ONGC-OFF-MTR-0044',
        cpseName: 'ONGC',
        rawDescription: 'MOTOR INDUCTION 75 KW 415V 1480RPM IE-3 FOOT MOUNT',
        unitCost: 289000,
        stockQty: 18,
        similarity: 97.2
      },
      {
        localCode: 'NTPC-TST-MTR-1088',
        cpseName: 'NTPC Limited',
        rawDescription: 'AC MOTOR 75KW 4POLE 415V TEFC B3 S1 IE3 FRAME 280M',
        unitCost: 252000,
        stockQty: 12,
        similarity: 96.9
      }
    ]
  },
  {
    clusterId: 'DUP-CLUSTER-1105',
    numcSuggested: 'NUMC-311715-0899',
    title: 'Deep Groove Ball Bearing 6205-2RS1 C3',
    itemCount: 5,
    totalStockValue: 1250000,
    similarityAvg: 99.2,
    potentialSaving: 210000,
    cpseInvolved: ['SAIL', 'NTPC Limited', 'Coal India Limited', 'IOCL', 'BHEL'],
    primaryItem: {
      localCode: 'SAIL-DSP-BRG-6205',
      cpseName: 'Steel Authority of India Ltd',
      description: 'DEEP GROOVE BALL BEARING 6205-2RS1 C3 SKF',
      unitCost: 480,
      stockQty: 1450
    },
    clusterCandidates: [
      {
        localCode: 'SAIL-DSP-BRG-6205',
        cpseName: 'Steel Authority of India Ltd',
        rawDescription: 'DEEP GROOVE BALL BEARING 6205-2RS1 C3 SKF',
        unitCost: 480,
        stockQty: 1450,
        similarity: 100
      },
      {
        localCode: 'NTPC-RAM-BRG-221',
        cpseName: 'NTPC Limited',
        rawDescription: 'BEARING BALL 6205 2RS C3 SKF / FAG 25X52X15MM',
        unitCost: 420,
        stockQty: 820,
        similarity: 99.4
      },
      {
        localCode: 'CIL-WCL-BRG-004',
        cpseName: 'Coal India Limited (WCL)',
        rawDescription: 'BEARING DG BALL 6205 2RS1 C3 RUBBER SEAL',
        unitCost: 495,
        stockQty: 340,
        similarity: 98.9
      }
    ]
  }
];

export const MAPPING_DATA = [
  {
    id: 'MAP-9001',
    cpseId: 'cil',
    cpseName: 'Coal India Limited',
    localCode: 'CIL-RAW-7741',
    rawDescription: 'BOLT HEX HD M16 X 65MM FULL THREAD HT 8.8 GALV',
    aiSuggestedCode: 'NUMC-311616-0045',
    aiSuggestedName: 'Hex Head Bolt, High Tensile Grade 8.8, M16 x 65mm, Full Thread, Hot Dip Galvanized',
    unspsc: '31161600 (Bolts)',
    confidence: 97.6,
    status: 'Unmapped',
    category: 'Fasteners & Hardware'
  },
  {
    id: 'MAP-9002',
    cpseId: 'ntpc',
    cpseName: 'NTPC Limited',
    localCode: 'NTPC-TURB-OIL-46',
    rawDescription: 'TURBINE LUBE OIL ISO VG 46 SERVO / SHELL',
    aiSuggestedCode: 'NUMC-151215-0102',
    aiSuggestedName: 'Turbine Lubricating Oil, ISO VG 46, Mineral Oil Based, Anti-Wear Anti-Foam to IS 1012',
    unspsc: '15121500 (Lubricants)',
    confidence: 99.2,
    status: 'Confirmed',
    category: 'Chemicals & Lubricants'
  },
  {
    id: 'MAP-9003',
    cpseId: 'ongc',
    cpseName: 'ONGC',
    rawDescription: 'PRESSURE TRANSMITTER 4-20MA HART 0-100 BAR EX PROOF',
    aiSuggestedCode: 'NUMC-411124-0088',
    aiSuggestedName: 'Pressure Transmitter, Smart 2-Wire, 4-20mA + HART, Range 0-100 Bar, Flameproof Ex-d, 1/2" NPT(F)',
    unspsc: '41112400 (Pressure Transmitters)',
    confidence: 94.8,
    status: 'Under Review',
    category: 'Instrumentation'
  },
  {
    id: 'MAP-9004',
    cpseId: 'bhel',
    cpseName: 'BHEL',
    rawDescription: 'PIPE SEAMLESS CARBON STEEL 4 INCH SCH 40 ASTM A106 GR B',
    aiSuggestedCode: 'NUMC-401715-0551',
    aiSuggestedName: 'Seamless Carbon Steel Pipe, 4 inch NB (100mm), Schedule 40, ASTM A106 Grade B, Bevelled Ends',
    unspsc: '40171500 (Steel Pipes)',
    confidence: 98.9,
    status: 'Unmapped',
    category: 'Piping & Tubes'
  },
  {
    id: 'MAP-9005',
    cpseId: 'sail',
    cpseName: 'SAIL',
    rawDescription: 'SAFETY HELMET INDUSTRIAL HDPE RATCHET TYPE IS 2925',
    aiSuggestedCode: 'NUMC-461817-0012',
    aiSuggestedName: 'Industrial Safety Helmet, High Density Polyethylene (HDPE), 6-Point Suspension, Ratchet Adjustment, IS 2925 Marked',
    unspsc: '46181700 (Head Protection)',
    confidence: 96.1,
    status: 'Unmapped',
    category: 'Safety & PPE'
  }
];

export const AI_APPROVAL_QUEUE = [
  {
    id: 'REC-2026-0811',
    type: 'Description Normalization',
    cpseName: 'Coal India Limited',
    localCode: 'CIL-M-VLV-5012',
    rawText: 'GATE VALVE 50MM CL-150 FLG WCB SS FLANGE TYPE',
    proposedText: 'Gate Valve, Flanged Ends, 2 inch (50mm NB), ASME Class 150, Cast Carbon Steel Body (ASTM A216 Gr WCB), SS316 Trim',
    numcTarget: 'NUMC-401015-0089',
    aiConfidence: 96.5,
    rationale: 'Standardized abbreviations (50MM -> 2 inch, CL-150 -> Class 150, FLG -> Flanged Ends). Expanded material grades based on Coal India API 600 standards.',
    submittedDate: '2026-09-20 14:32'
  },
  {
    id: 'REC-2026-0812',
    type: 'Duplicate Merger',
    cpseName: 'ONGC & BHEL',
    localCode: 'ONGC-OFF-MTR-0044',
    rawText: 'MOTOR INDUCTION 75 KW 415V 1480RPM IE-3 FOOT MOUNT',
    proposedText: 'Merge item into Unified Master NUMC-311715-0142 with BHEL-ELE-MTR-8812',
    numcTarget: 'NUMC-311715-0142',
    aiConfidence: 97.4,
    rationale: 'Identified 100% technical equivalency with BHEL item. Combining inventory creates cross-CPSE sharing opportunity of 42 units total.',
    submittedDate: '2026-09-20 12:15'
  },
  {
    id: 'REC-2026-0813',
    type: 'Taxonomy Reclassification',
    cpseName: 'Steel Authority of India Ltd',
    localCode: 'SAIL-MISC-9921',
    rawText: 'GREASE LITHIUM COMPLEX EP2 18KG BUCKET',
    proposedText: 'Reclassify from "Miscellaneous Spares" to "Chemicals, Lubricants & Gases > Greases"',
    numcTarget: 'NUMC-151219-0040',
    aiConfidence: 99.0,
    rationale: 'Item was miscategorized under generic plant stores. Correct UNSPSC code assigned: 15121902.',
    submittedDate: '2026-09-19 18:40'
  }
];

export const SYSTEM_STATS = {
  totalMaterialsCataloged: '2,485,210',
  totalHarmonizedMasters: '1,842,100',
  duplicateClustersFound: '42,890',
  estimatedCostSavingsCr: '1,420.50',
  aiAccuracyPercent: '96.8%',
  activeCpsesCount: 48,
  pendingApprovals: 342,
  harmonizationRateByCPSE: [
    { name: 'NTPC Limited', rate: 94.2, totalItems: 420000, harmonized: 395640 },
    { name: 'Coal India Ltd', rate: 88.5, totalItems: 680000, harmonized: 601800 },
    { name: 'BHEL', rate: 92.1, totalItems: 310000, harmonized: 285510 },
    { name: 'ONGC', rate: 86.4, totalItems: 450000, harmonized: 388800 },
    { name: 'SAIL', rate: 90.7, totalItems: 390000, harmonized: 353730 },
  ]
};

export const AUDIT_LOGS = [
  {
    id: 'AUD-88390',
    timestamp: '2026-09-20 19:42:10',
    eventType: 'DUPLICATE_MERGE',
    cpse: 'NTPC & Coal India',
    numcCode: 'NUMC-401015-0089',
    actor: 'AI Auto-Harmonizer Agent (v4.2)',
    description: 'Merged item CIL-M-VLV-5012 into Master Cluster NUMC-401015-0089 with 96.5% similarity score.',
    status: 'Verified'
  },
  {
    id: 'AUD-88389',
    timestamp: '2026-09-20 18:11:05',
    eventType: 'MAPPING_APPROVE',
    cpse: 'NTPC Limited',
    numcCode: 'NUMC-151215-0102',
    actor: 'Rajesh Sharma (Nodal Officer, NTPC)',
    description: 'Approved UNSPSC mapping for Turbine Lube Oil ISO VG 46.',
    status: 'Manual Approved'
  },
  {
    id: 'AUD-88388',
    timestamp: '2026-09-20 16:25:00',
    eventType: 'SPEC_AUGMENTATION',
    cpse: 'Bharat Heavy Electricals Ltd',
    numcCode: 'NUMC-311715-0142',
    actor: 'AI Spec Extraction Service',
    description: 'Extracted IE3 Efficiency & Frame 280M attributes from attached PDF datasheet.',
    status: 'Auto Updated'
  },
  {
    id: 'AUD-88387',
    timestamp: '2026-09-20 11:02:44',
    eventType: 'PRICE_VARIANCE_ALERT',
    cpse: 'ONGC vs BHEL',
    numcCode: 'NUMC-311715-0142',
    actor: 'National Savings Monitoring Engine',
    description: 'Flagged 17.9% unit cost divergence (₹2.45L vs ₹2.89L) for 75kW Motor across CPSE procurements.',
    status: 'Alert Triggered'
  }
];
