// peruPayroll.js
// Módulo de cálculo y proyección de sueldos y deducciones en el régimen laboral peruano (SUNAT, AFP, ONP)

export const PERU_UIT = 5150; // UIT de referencia (S/ 5,150)

export const PENSION_SYSTEMS = [
  { id: 'afp_integra', name: 'AFP Integra', rate: 0.1269, description: 'Aporte 10% + Seguro 1.70% + Comisión' },
  { id: 'afp_prima', name: 'AFP Prima', rate: 0.1280, description: 'Aporte 10% + Seguro 1.70% + Comisión' },
  { id: 'afp_profuturo', name: 'AFP Profuturo', rate: 0.1289, description: 'Aporte 10% + Seguro 1.70% + Comisión' },
  { id: 'afp_habitat', name: 'AFP Habitat', rate: 0.1277, description: 'Aporte 10% + Seguro 1.70% + Comisión' },
  { id: 'onp', name: 'ONP (Sistema Nacional)', rate: 0.1300, description: 'Aporte fijo estatal del 13.0%' },
  { id: 'none', name: 'Sin Fondo de Pensión', rate: 0.0000, description: 'Exonerado o no aplica' }
];

export const WORK_REGIMES = [
  {
    id: 'planilla_general',
    name: 'Planilla Régimen General (728)',
    tag: 'Planilla Completa',
    description: 'Beneficios al 100%: 2 Gratificaciones anuales + 9% bono EsSalud, CTS, vacaciones y AFP/ONP.'
  },
  {
    id: 'planilla_mype_pequena',
    name: 'Planilla MYPE (Pequeña Empresa)',
    tag: 'MYPE Pequeña',
    description: 'Media gratificación en Julio y Diciembre (50%), media CTS (50%), 15 días vacaciones y AFP/ONP.'
  },
  {
    id: 'planilla_mype_micro',
    name: 'Planilla MYPE (Microempresa)',
    tag: 'Microempresa',
    description: 'Sin gratificación ni CTS por ley, 15 días de vacaciones y descuento previsional AFP/ONP.'
  },
  {
    id: 'honorarios',
    name: 'Recibos por Honorarios (4ta Categoría)',
    tag: 'Independiente',
    description: 'Retención del 8% de SUNAT para recibos mayores a S/ 1,500 (o 0% si tienes suspensión).'
  },
  {
    id: 'neto_directo',
    name: 'Monto Neto Directo',
    tag: 'Ingreso Neto',
    description: 'Sin deducciones locales calculadas (remoto en dólares, informal o monto final acordado).'
  }
];

/**
 * Calcula el impuesto a la renta de 5ta categoría anual según los tramos de la SUNAT
 * @param {number} annualIncome - Ingreso bruto anual proyectado (sueldos + gratificaciones)
 * @param {number} uit - Valor de la UIT
 * @returns {number} Impuesto anual de 5ta categoría
 */
export function calculateFifthCategoryTaxAnnual(annualIncome, uit = PERU_UIT) {
  const deduction7UIT = 7 * uit; // S/ 36,050
  const netTaxableIncome = Math.max(0, annualIncome - deduction7UIT);

  if (netTaxableIncome <= 0) return 0;

  let remaining = netTaxableIncome;
  let tax = 0;

  // Tramo 1: Hasta 5 UIT (8%)
  const bracket1Limit = 5 * uit;
  const inBracket1 = Math.min(remaining, bracket1Limit);
  tax += inBracket1 * 0.08;
  remaining -= inBracket1;

  // Tramo 2: De 5 a 20 UIT (14%) -> Rango de 15 UIT
  if (remaining > 0) {
    const bracket2Limit = 15 * uit;
    const inBracket2 = Math.min(remaining, bracket2Limit);
    tax += inBracket2 * 0.14;
    remaining -= inBracket2;
  }

  // Tramo 3: De 20 a 35 UIT (17%) -> Rango de 15 UIT
  if (remaining > 0) {
    const bracket3Limit = 15 * uit;
    const inBracket3 = Math.min(remaining, bracket3Limit);
    tax += inBracket3 * 0.17;
    remaining -= inBracket3;
  }

  // Tramo 4: De 35 a 45 UIT (20%) -> Rango de 10 UIT
  if (remaining > 0) {
    const bracket4Limit = 10 * uit;
    const inBracket4 = Math.min(remaining, bracket4Limit);
    tax += inBracket4 * 0.20;
    remaining -= inBracket4;
  }

  // Tramo 5: Más de 45 UIT (30%)
  if (remaining > 0) {
    tax += remaining * 0.30;
  }

  return tax;
}

/**
 * Calcula el desglose completo y amigable del sueldo peruano
 */
export function calculatePeruPayroll({
  grossSalary = 0,
  regime = 'planilla_general',
  pensionSystemId = 'afp_integra',
  customPensionRate = null,
  hasSuspension4ta = false,
  currency = 'PEN',
  uit = PERU_UIT
}) {
  const gross = Math.max(0, parseFloat(grossSalary) || 0);

  // Si es neto directo o moneda USD (usualmente no se descuenta AFP local a contratos internacionales)
  if (regime === 'neto_directo') {
    return {
      grossSalary: gross,
      netSalary: gross,
      pensionDeduction: 0,
      pensionRate: 0,
      pensionName: 'No aplica',
      taxDeduction: 0,
      taxName: 'No aplica',
      gratiEstimatedMonthly: 0,
      ctsEstimatedMonthly: 0,
      summaryText: 'Ingreso neto directo sin deducciones locales.'
    };
  }

  // 1. RECIBOS POR HONORARIOS (4ta Categoría)
  if (regime === 'honorarios') {
    let taxDeduction = 0;
    let taxRate = 0;

    if (!hasSuspension4ta && gross > 1500 && currency === 'PEN') {
      taxRate = 0.08;
      taxDeduction = gross * 0.08;
    }

    const netSalary = Math.max(0, gross - taxDeduction);

    return {
      grossSalary: gross,
      netSalary,
      pensionDeduction: 0,
      pensionRate: 0,
      pensionName: 'Sin retención de pensión (independiente)',
      taxDeduction,
      taxRate,
      taxName: taxRate > 0 ? 'Retención 8% SUNAT (4ta categoría)' : '0% SUNAT (Con Suspensión activa)',
      gratiEstimatedMonthly: 0,
      ctsEstimatedMonthly: 0,
      summaryText: taxDeduction > 0
        ? `Retención del 8% de SUNAT por recibo mayor a S/ 1,500 (-S/ ${taxDeduction.toFixed(2)}).`
        : 'Recibo sin retención: recibes el 100% íntegro.'
    };
  }

  // 2. PLANILLA (General o MYPE)
  // Deducción previsional (AFP u ONP)
  const pensionObj = PENSION_SYSTEMS.find(p => p.id === pensionSystemId) || PENSION_SYSTEMS[0];
  const pensionRate = customPensionRate !== null ? parseFloat(customPensionRate) : pensionObj.rate;
  const pensionDeduction = gross * pensionRate;

  // Cálculo anual para 5ta categoría según régimen
  let annualProjected = 0;
  let gratiEstimatedMonthly = 0;
  let ctsEstimatedMonthly = 0;

  if (regime === 'planilla_general') {
    // 12 sueldos + 2 gratificaciones completas (Julio y Diciembre)
    annualProjected = gross * 14;
    // Gratificación ordinaria completa + 9% bono de EsSalud
    gratiEstimatedMonthly = (gross * 1.09 * 2) / 12;
    // CTS es aprox 1.16 sueldos al año
    ctsEstimatedMonthly = (gross * 1.166) / 12;
  } else if (regime === 'planilla_mype_pequena') {
    // 12 sueldos + 2 medias gratificaciones (50% de un sueldo en Jul y Dic)
    annualProjected = gross * 13;
    gratiEstimatedMonthly = (gross * 0.5 * 1.09 * 2) / 12;
    ctsEstimatedMonthly = (gross * 0.5) / 12;
  } else if (regime === 'planilla_mype_micro') {
    // Microempresa: 12 sueldos (sin grati ni CTS por ley)
    annualProjected = gross * 12;
    gratiEstimatedMonthly = 0;
    ctsEstimatedMonthly = 0;
  }

  // Impuesto a la Renta de 5ta Categoría SUNAT
  let annualTax = 0;
  let monthlyTaxDeduction = 0;

  if (currency === 'PEN') {
    annualTax = calculateFifthCategoryTaxAnnual(annualProjected, uit);
    monthlyTaxDeduction = annualTax / 12;
  }

  const netSalary = Math.max(0, gross - pensionDeduction - monthlyTaxDeduction);

  let summary = '';
  if (monthlyTaxDeduction > 0) {
    summary = `Se descuenta ${pensionObj.name} (${(pensionRate * 100).toFixed(1)}%) y S/ ${monthlyTaxDeduction.toFixed(2)} de 5ta categoría SUNAT.`;
  } else {
    summary = `Tu sueldo anual no supera las 7 UIT (S/ ${(7 * uit).toLocaleString()}), por lo que NO pagas impuesto de 5ta categoría. Solo se descuenta ${pensionObj.name}.`;
  }

  return {
    grossSalary: gross,
    netSalary,
    pensionDeduction,
    pensionRate,
    pensionName: pensionObj.name,
    taxDeduction: monthlyTaxDeduction,
    annualTax,
    taxName: monthlyTaxDeduction > 0 ? 'Retención 5ta Categoría SUNAT' : 'Exonerado 5ta Categoría (≤ 7 UIT)',
    gratiEstimatedMonthly,
    ctsEstimatedMonthly,
    summaryText: summary
  };
}
