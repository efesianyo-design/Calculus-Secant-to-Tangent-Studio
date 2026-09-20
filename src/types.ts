export type SHSLevel = 'Form 1 (Year 1 SHS)' | 'Form 2 (Year 2 SHS)' | 'Form 3 (Year 3 SHS)';

export interface StudentProfile {
  name: string;
  level: SHSLevel;
  classId: string;
  avatar: string;
  registeredAt: string;
}

export type ActionType =
  | 'STUDENT_LOGIN'
  | 'FUNCTION_SELECT'
  | 'H_CONVERGENCE'
  | 'LIMIT_SNAP'
  | 'STATIONARY_POINT_TEST'
  | 'DERIVATIVE_VERIFY'
  | 'SOCRATIC_QUERY';

export interface ActivityLog {
  id: string;
  timestamp: string;
  studentId: string;
  studentName: string;
  level: string;
  functionId: string;
  functionName: string;
  x: number;
  h: number;
  secantSlope: number;
  exactSlope: number;
  actionType: ActionType;
  details: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'VERIFIED';
}

export interface StationaryPoint {
  x: number;
  y: number;
  fDoublePrime: number;
  type: 'Local Minimum' | 'Local Maximum' | 'Point of Inflection';
  reason: string;
}

export interface FunctionPreset {
  id: string;
  name: string;
  category: string;
  formulaLatex: string;
  derivativeLatex: string;
  secondDerivativeLatex: string;
  f: (x: number) => number;
  df: (x: number) => number;
  d2f: (x: number) => number;
  defaultX: number;
  defaultH: number;
  xRange: [number, number];
  yRange: [number, number];
  stationaryPoints: StationaryPoint[];
  algebraicSteps: (x: number, h: number) => Array<{ label: string; math: string; note?: string }>;
}
