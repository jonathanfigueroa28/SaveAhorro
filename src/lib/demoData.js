// Datos de demostración interactiva para SaveAhorro 🐜
// Compara 2 conductas financieras reales con el MISMO INGRESO (S/ 3,500/mes):
// Carlos (control de gastos hormiga y superávit) vs Pepe (fugas diarias, tarjeta sobregirada y déficit)

const now = new Date();
const daysAgo = (days, hours = 0) => {
  const d = new Date(now.getTime() - (days * 24 * 3600 * 1000) - (hours * 3600 * 1000));
  return d.toISOString();
};

export const DEMO_PROFILES = {
  carlos: {
    id: 'carlos',
    name: 'Carlos',
    fullName: 'Carlos Mendoza',
    nickname: 'El Hormigón Ahorrador',
    emoji: '🐜👑',
    tagline: 'Mismo sueldo (S/ 3,500). Registra micro-gastos en 3 segundos, tiene S/ 0 deuda de tarjeta y le sobran más de S/ 1,600 cada mes.',
    badgeClass: 'badge-success',
    monthlyBudget: 1500,
    creditCardBaseDebt: 0,
    userProfile: { firstName: 'Carlos', lastName: 'Mendoza' },
    accounts: [
      { id: 'acc_c_1', name: '💵 Efectivo Billetera', type: 'efectivo', bank: 'Efectivo', currency: 'PEN', initial_balance: 150, is_operating: true, color: '#10b981' },
      { id: 'acc_c_2', name: '🟣 Yape (BCP)', type: 'billetera_digital', bank: 'BCP', currency: 'PEN', initial_balance: 350, is_operating: true, color: '#8b5cf6' },
      { id: 'acc_c_3', name: '💳 BCP Sueldo Débito', type: 'banco', bank: 'BCP', currency: 'PEN', initial_balance: 1200, is_operating: true, color: '#3b82f6' },
      { id: 'acc_c_4', name: '🏦 Ahorro Reserva Soles', type: 'ahorros', bank: 'BBVA', currency: 'PEN', initial_balance: 4000, is_operating: false, color: '#f59e0b' },
      { id: 'acc_c_5', name: '💵 Ahorro Reserva Dólares', type: 'ahorros', bank: 'Interbank', currency: 'USD', initial_balance: 1000, is_operating: false, color: '#10b981' },
      { id: 'acc_c_6', name: '💳 Tarjeta Crédito BCP', type: 'tarjeta_credito', bank: 'BCP', currency: 'PEN', initial_balance: 0, is_operating: false, color: '#ef4444' }
    ],
    incomes: [
      { id: 'inc_c_1', title: 'Sueldo Fijo Mensual', amount: 3500, currency: 'PEN', frequency: 'mensual' }
    ],
    fixedExpenses: [
      { id: 'fix_c_1', title: 'Alquiler Departamento', amount: 900, currency: 'PEN', category: 'servicios', due_day: 5, is_paid: true },
      { id: 'fix_c_2', title: 'Luz y Agua', amount: 130, currency: 'PEN', category: 'servicios', due_day: 18, is_paid: true },
      { id: 'fix_c_3', title: 'Internet Fibra Óptica', amount: 90, currency: 'PEN', category: 'servicios', due_day: 15, is_paid: true }
    ],
    expenses: [
      { id: 'exp_c_1', amount: 3.50, currency: 'PEN', category: 'gastos-hormiga', description: 'Café pasado y galleta de avena', is_ant_expense: true, payment_method: 'yape', bank: 'BCP', date: daysAgo(0, 3) },
      { id: 'exp_c_2', amount: 13.00, currency: 'PEN', category: 'comida', description: 'Menú criollo económico en comedor', is_ant_expense: false, payment_method: 'yape', bank: 'BCP', date: daysAgo(1, 2) },
      { id: 'exp_c_3', amount: 3.50, currency: 'PEN', category: 'transporte', description: 'Recarga Metropolitano', is_ant_expense: true, payment_method: 'efectivo', date: daysAgo(2, 5) },
      { id: 'exp_c_4', amount: 2.00, currency: 'PEN', category: 'gastos-hormiga', description: 'Emoliente caliente de quinua', is_ant_expense: true, payment_method: 'yape', date: daysAgo(3, 1) },
      { id: 'exp_c_5', amount: 140.00, currency: 'PEN', category: 'comida', description: 'Compras de mercado para cocinar en casa', is_ant_expense: false, payment_method: 'debito', bank: 'BCP', date: daysAgo(4, 4) },
      { id: 'exp_c_6', amount: 2.50, currency: 'PEN', category: 'gastos-hormiga', description: 'Agua mineral en tienda', is_ant_expense: true, payment_method: 'efectivo', date: daysAgo(5, 6) },
      { id: 'exp_c_7', amount: 12.00, currency: 'PEN', category: 'transporte', description: 'Taxi colectivo en día de apuro', is_ant_expense: false, payment_method: 'yape', date: daysAgo(7, 2) },
      { id: 'exp_c_8', amount: 35.00, currency: 'PEN', category: 'salud', description: 'Farmacia y botiquín', is_ant_expense: false, payment_method: 'debito', bank: 'BCP', date: daysAgo(9, 3) },
      { id: 'exp_c_9', amount: 3.00, currency: 'PEN', category: 'gastos-hormiga', description: 'Fruta fresca al paso', is_ant_expense: true, payment_method: 'efectivo', date: daysAgo(11, 4) }
    ]
  },

  pepe: {
    id: 'pepe',
    name: 'Pepe',
    fullName: 'Pepe Gastatodo',
    nickname: 'El Gastador Fugitivo',
    emoji: '💸🏃💨',
    tagline: 'Mismo sueldo (S/ 3,500). Fugas diarias en delivery, taxis y cafés; tarjeta de crédito sobregirada con S/ 1,850 y déficit de -S/ 675.',
    badgeClass: 'badge-danger',
    monthlyBudget: 1500,
    creditCardBaseDebt: 1850,
    userProfile: { firstName: 'Pepe', lastName: 'Gastatodo' },
    accounts: [
      { id: 'acc_p_1', name: '💵 Efectivo Billetera', type: 'efectivo', bank: 'Efectivo', currency: 'PEN', initial_balance: 25, is_operating: true, color: '#ef4444' },
      { id: 'acc_p_2', name: '🟣 Yape (BCP)', type: 'billetera_digital', bank: 'BCP', currency: 'PEN', initial_balance: 40, is_operating: true, color: '#8b5cf6' },
      { id: 'acc_p_3', name: '💳 BCP Sueldo Débito', type: 'banco', bank: 'BCP', currency: 'PEN', initial_balance: 80, is_operating: true, color: '#3b82f6' },
      { id: 'acc_p_4', name: '🏦 Ahorro Reserva Soles', type: 'ahorros', bank: 'BBVA', currency: 'PEN', initial_balance: 0, is_operating: false, color: '#f59e0b' },
      { id: 'acc_p_5', name: '💵 Ahorro Reserva Dólares', type: 'ahorros', bank: 'Interbank', currency: 'USD', initial_balance: 0, is_operating: false, color: '#10b981' },
      { id: 'acc_p_6', name: '💳 Tarjeta Crédito BCP', type: 'tarjeta_credito', bank: 'BCP', currency: 'PEN', initial_balance: 1850, is_operating: false, color: '#ef4444' }
    ],
    incomes: [
      { id: 'inc_p_1', title: 'Sueldo Fijo Mensual', amount: 3500, currency: 'PEN', frequency: 'mensual' }
    ],
    fixedExpenses: [
      { id: 'fix_p_1', title: 'Alquiler Departamento', amount: 900, currency: 'PEN', category: 'servicios', due_day: 5, is_paid: false },
      { id: 'fix_p_2', title: 'Luz y Agua con mora', amount: 150, currency: 'PEN', category: 'servicios', due_day: 10, is_paid: false },
      { id: 'fix_p_3', title: 'Internet + Cable Max', amount: 140, currency: 'PEN', category: 'servicios', due_day: 15, is_paid: false },
      { id: 'fix_p_4', title: 'Suscripciones streaming y Gym sin ir', amount: 220, currency: 'PEN', category: 'entretenimiento', due_day: 20, is_paid: false }
    ],
    expenses: [
      { id: 'exp_p_1', amount: 22.00, currency: 'PEN', category: 'gastos-hormiga', description: 'Café frapuccino frío con jarabe', is_ant_expense: true, payment_method: 'credito', bank: 'BCP', date: daysAgo(0, 2) },
      { id: 'exp_p_2', amount: 28.00, currency: 'PEN', category: 'transporte', description: 'Taxi por flojera de tomar transporte', is_ant_expense: true, payment_method: 'yape', date: daysAgo(0, 6) },
      { id: 'exp_p_3', amount: 55.00, currency: 'PEN', category: 'comida', description: 'Delivery nocturno por app hamburguesa', is_ant_expense: true, payment_method: 'credito', bank: 'BCP', date: daysAgo(1, 4) },
      { id: 'exp_p_4', amount: 24.50, currency: 'PEN', category: 'gastos-hormiga', description: 'Bebidas energizantes y snacks en grifo', is_ant_expense: true, payment_method: 'yape', date: daysAgo(2, 3) },
      { id: 'exp_p_5', amount: 280.00, currency: 'PEN', category: 'compras', description: 'Zapatillas por impulso con tarjeta', is_ant_expense: false, payment_method: 'credito', bank: 'BCP', date: daysAgo(3, 5) },
      { id: 'exp_p_6', amount: 35.00, currency: 'PEN', category: 'transporte', description: 'Uber de regreso de fiesta', is_ant_expense: true, payment_method: 'credito', bank: 'BCP', date: daysAgo(4, 7) },
      { id: 'exp_p_7', amount: 185.00, currency: 'PEN', category: 'entretenimiento', description: 'Salida con amigos pagada con tarjeta', is_ant_expense: false, payment_method: 'credito', bank: 'BCP', date: daysAgo(5, 8) },
      { id: 'exp_p_8', amount: 22.00, currency: 'PEN', category: 'gastos-hormiga', description: 'Postre gourmet y dulce al paso', is_ant_expense: true, payment_method: 'yape', date: daysAgo(6, 2) },
      { id: 'exp_p_9', amount: 30.00, currency: 'PEN', category: 'transporte', description: 'Taxi ida y vuelta', is_ant_expense: true, payment_method: 'yape', date: daysAgo(7, 3) },
      { id: 'exp_p_10', amount: 85.00, currency: 'PEN', category: 'comida', description: 'Almuerzo buffet en restaurante', is_ant_expense: false, payment_method: 'credito', bank: 'BCP', date: daysAgo(8, 4) },
      { id: 'exp_p_11', amount: 18.50, currency: 'PEN', category: 'gastos-hormiga', description: 'Golosinas y gaseosa', is_ant_expense: true, payment_method: 'efectivo', date: daysAgo(10, 1) },
      { id: 'exp_p_12', amount: 350.00, currency: 'PEN', category: 'compras', description: 'Gadget electrónico en cuotas', is_ant_expense: false, payment_method: 'credito', bank: 'BCP', date: daysAgo(12, 5) }
    ]
  }
};
