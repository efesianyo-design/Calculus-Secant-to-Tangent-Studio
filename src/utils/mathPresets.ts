import { FunctionPreset } from '../types';

export const FUNCTION_PRESETS: FunctionPreset[] = [
  {
    id: 'quadratic',
    name: 'Quadratic Parabola',
    category: 'Polynomial',
    formulaLatex: 'f(x) = x^2',
    derivativeLatex: "f'(x) = 2x",
    secondDerivativeLatex: "f''(x) = 2",
    f: (x: number) => x * x,
    df: (x: number) => 2 * x,
    d2f: (_x: number) => 2,
    defaultX: 1.0,
    defaultH: 0.8,
    xRange: [-3.5, 3.5],
    yRange: [-1.5, 9.5],
    stationaryPoints: [
      {
        x: 0,
        y: 0,
        fDoublePrime: 2,
        type: 'Local Minimum',
        reason: "f'(0) = 0 and f''(0) = 2 > 0 (Concave Up / Valley)",
      },
    ],
    algebraicSteps: (x: number, h: number) => [
      {
        label: '1. Setup Difference Quotient',
        math: `\\frac{f(x+h) - f(x)}{h} = \\frac{(x+h)^2 - x^2}{h}`,
        note: 'Substitute input (x+h) and x into f(t) = t²',
      },
      {
        label: '2. Expand the Binomial',
        math: `= \\frac{x^2 + 2xh + h^2 - x^2}{h} = \\frac{2xh + h^2}{h}`,
        note: 'The x² terms cancel out in the numerator',
      },
      {
        label: '3. Factor Out & Cancel h',
        math: `= \\frac{h(2x + h)}{h} = 2x + h \\quad (h \\neq 0)`,
        note: 'Cancelling h eliminates the division-by-zero singularity',
      },
      {
        label: '4. Take Analytical Limit as h → 0',
        math: `f'(${x}) = \\lim_{h \\to 0} (2(${x}) + h) = 2(${x}) = ${(2 * x).toFixed(4)}`,
        note: `Exact instantaneous tangent slope at x = ${x}`,
      },
    ],
  },
  {
    id: 'cubic',
    name: 'Cubic with Extremum',
    category: 'Polynomial',
    formulaLatex: 'f(x) = x^3 - 3x',
    derivativeLatex: "f'(x) = 3x^2 - 3",
    secondDerivativeLatex: "f''(x) = 6x",
    f: (x: number) => x * x * x - 3 * x,
    df: (x: number) => 3 * x * x - 3,
    d2f: (x: number) => 6 * x,
    defaultX: 1.5,
    defaultH: 0.6,
    xRange: [-3.0, 3.0],
    yRange: [-4.5, 4.5],
    stationaryPoints: [
      {
        x: -1,
        y: 2,
        fDoublePrime: -6,
        type: 'Local Maximum',
        reason: "f'(-1) = 0 and f''(-1) = -6 < 0 (Concave Down / Peak)",
      },
      {
        x: 1,
        y: -2,
        fDoublePrime: 6,
        type: 'Local Minimum',
        reason: "f'(1) = 0 and f''(1) = +6 > 0 (Concave Up / Valley)",
      },
      {
        x: 0,
        y: 0,
        fDoublePrime: 0,
        type: 'Point of Inflection',
        reason: "f''(0) = 0 (Curvature inflection between concave down and up)",
      },
    ],
    algebraicSteps: (x: number, h: number) => [
      {
        label: '1. Setup Difference Quotient',
        math: `\\frac{f(x+h) - f(x)}{h} = \\frac{[(x+h)^3 - 3(x+h)] - [x^3 - 3x]}{h}`,
      },
      {
        label: '2. Expand Cubic & Linear Terms',
        math: `= \\frac{x^3 + 3x^2h + 3xh^2 + h^3 - 3x - 3h - x^3 + 3x}{h}`,
      },
      {
        label: '3. Collect and Factor h',
        math: `= \\frac{h(3x^2 + 3xh + h^2 - 3)}{h} = 3x^2 + 3xh + h^2 - 3`,
      },
      {
        label: '4. Take Analytical Limit as h → 0',
        math: `f'(${x}) = \\lim_{h \\to 0} (3(${x})^2 + 3(${x})h + h^2 - 3) = 3(${x})^2 - 3 = ${(3 * x * x - 3).toFixed(4)}`,
      },
    ],
  },
  {
    id: 'reciprocal',
    name: 'Reciprocal Hyperbola',
    category: 'Rational',
    formulaLatex: 'f(x) = \\frac{1}{x}',
    derivativeLatex: "f'(x) = -\\frac{1}{x^2}",
    secondDerivativeLatex: "f''(x) = \\frac{2}{x^3}",
    f: (x: number) => (Math.abs(x) < 0.0001 ? (x >= 0 ? 1000 : -1000) : 1 / x),
    df: (x: number) => (Math.abs(x) < 0.0001 ? -10000 : -1 / (x * x)),
    d2f: (x: number) => (Math.abs(x) < 0.0001 ? 10000 : 2 / (x * x * x)),
    defaultX: 1.0,
    defaultH: 0.5,
    xRange: [-4.0, 4.0],
    yRange: [-4.0, 4.0],
    stationaryPoints: [],
    algebraicSteps: (x: number, _h: number) => [
      {
        label: '1. Setup Difference Quotient',
        math: `\\frac{f(x+h) - f(x)}{h} = \\frac{\\frac{1}{x+h} - \\frac{1}{x}}{h}`,
      },
      {
        label: '2. Find Common Denominator in Numerator',
        math: `= \\frac{\\frac{x - (x+h)}{x(x+h)}}{h} = \\frac{\\frac{-h}{x(x+h)}}{h}`,
      },
      {
        label: '3. Simplify Fraction by Cancelling h',
        math: `= -\\frac{1}{x(x+h)} \\quad (h \\neq 0)`,
      },
      {
        label: '4. Take Analytical Limit as h → 0',
        math: `f'(${x}) = \\lim_{h \\to 0} \\left(-\\frac{1}{${x}(${x}+h)}\\right) = -\\frac{1}{(${x})^2} = ${(-1 / (x * x)).toFixed(4)}`,
      },
    ],
  },
  {
    id: 'sine',
    name: 'Trigonometric Sine Wave',
    category: 'Trigonometric',
    formulaLatex: 'f(x) = \\sin(x)',
    derivativeLatex: "f'(x) = \\cos(x)",
    secondDerivativeLatex: "f''(x) = -\\sin(x)",
    f: (x: number) => Math.sin(x),
    df: (x: number) => Math.cos(x),
    d2f: (x: number) => -Math.sin(x),
    defaultX: 1.047, // pi/3
    defaultH: 0.5,
    xRange: [-4.0, 4.0],
    yRange: [-2.0, 2.0],
    stationaryPoints: [
      {
        x: -1.5708, // -pi/2
        y: -1,
        fDoublePrime: 1,
        type: 'Local Minimum',
        reason: "f'(-π/2) = cos(-π/2) = 0 and f''(-π/2) = 1 > 0",
      },
      {
        x: 1.5708, // pi/2
        y: 1,
        fDoublePrime: -1,
        type: 'Local Maximum',
        reason: "f'(π/2) = cos(π/2) = 0 and f''(π/2) = -1 < 0",
      },
      {
        x: 0,
        y: 0,
        fDoublePrime: 0,
        type: 'Point of Inflection',
        reason: "f''(0) = -sin(0) = 0 (Curvature changes sign)",
      },
    ],
    algebraicSteps: (x: number, _h: number) => [
      {
        label: '1. Setup Difference Quotient',
        math: `\\frac{\\sin(x+h) - \\sin(x)}{h}`,
      },
      {
        label: '2. Apply Angle Addition Identity',
        math: `= \\frac{\\sin x \\cos h + \\cos x \\sin h - \\sin x}{h} = \\sin x \\left(\\frac{\\cos h - 1}{h}\\right) + \\cos x \\left(\\frac{\\sin h}{h}\\right)`,
      },
      {
        label: '3. Standard Trigonometric Limits',
        math: `\\lim_{h \\to 0} \\frac{\\sin h}{h} = 1 \\quad \\text{and} \\quad \\lim_{h \\to 0} \\frac{\\cos h - 1}{h} = 0`,
      },
      {
        label: '4. Compute Derivative Limit',
        math: `f'(${x}) = \\sin(${x}) \\cdot 0 + \\cos(${x}) \\cdot 1 = \\cos(${x}) = ${(Math.cos(x)).toFixed(4)}`,
      },
    ],
  },
  {
    id: 'exponential',
    name: 'Natural Exponential',
    category: 'Transcendental',
    formulaLatex: 'f(x) = e^x',
    derivativeLatex: "f'(x) = e^x",
    secondDerivativeLatex: "f''(x) = e^x",
    f: (x: number) => Math.exp(x),
    df: (x: number) => Math.exp(x),
    d2f: (x: number) => Math.exp(x),
    defaultX: 0.5,
    defaultH: 0.5,
    xRange: [-3.0, 3.0],
    yRange: [-1.0, 10.0],
    stationaryPoints: [],
    algebraicSteps: (x: number, _h: number) => [
      {
        label: '1. Setup Difference Quotient',
        math: `\\frac{e^{x+h} - e^x}{h} = \\frac{e^x \\cdot e^h - e^x}{h}`,
      },
      {
        label: '2. Factor Out e^x',
        math: `= e^x \\cdot \\left(\\frac{e^h - 1}{h}\\right)`,
      },
      {
        label: '3. Fundamental Limit Definition of e',
        math: `\\lim_{h \\to 0} \\frac{e^h - 1}{h} = 1`,
      },
      {
        label: '4. Instantaneous Tangent Result',
        math: `f'(${x}) = e^{${x}} \\cdot 1 = e^{${x}} = ${(Math.exp(x)).toFixed(4)}`,
      },
    ],
  },
];
