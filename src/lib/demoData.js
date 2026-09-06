// Datos de demostración interactiva para SaveAhorro 🐜
// Compara 2 conductas financieras reales: Carlos (ordenado) vs Pepe (descontrolado)

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
    tagline: 'Tiene sus gastos hormiga vigilados y le sobra plata cada mes.',
    badgeClass: 'badge-success',
    monthlyBudget: 1800,
    creditCardBaseDebt: 0,
    userProfile: { firstName: 'Carlos', lastName: 'Mendoza' },
    accounts: [
      { id: 'acc_c_1', name: '💵 Efectivo Billetera', type: 'efectivo', bank: 'Efectivo', currency: 'PEN', initial_balance: 250, is_operating: true, color: '#10b981' },
      { id: 'acc_c_2', name: '🟣 Yape (BCP)', type: 'billetera_digital', bank: 'BCP', currency: 'PEN', initial_balance: 600, is_operating: true, color: '#8b5cf6' },
      { id: 'acc_c_3', name: '💳 BCP Sueldo Débito', type: 'banco', bank: 'BCP', currency: 'PEN', initial_balance: 1800, is_operating: true, color: '#3b82f6' },
      { id: 'acc_c_4', name: '🏦 Ahorro Reserva Soles', type: 'ahorros', bank: 'BBVA', currency: 'PEN', initial_balance: 4500, is_operating: false, color: '#f59e0b' },
      { id: 'acc_c_5', name: '💵 Ahorro Reserva Dólares', type: 'ahorros', bank: 'Interbank', currency: 'USD', initial_balance: 1500, is_operating: false, color: '#10b981' },
      { id: 'acc_c_6', name: '💳 Tarjeta Crédito BCP', type: 'tarjeta_credito', bank: 'BCP', currency: 'PEN', initial_balance: 0, is_operating: false, color: '#ef4444' }
    ],
    incomes: [
      { id: 'inc_c_1', title: 'Sueldo Principal (Soles)', amount: 3200, currency: 'PEN', frequency: 'mensual' },
      { id: 'inc_c_2', title: 'Trabajo Freelance Remoto', amount: 200, currency: 'USD', frequency: 'mensual' }
    ],
    fixedExpenses: [
      { id: 'fix_c_1', title: 'Alquiler Departamento', amount: 800, currency: 'PEN', category: 'servicios', due_day: 5, is_paid: true },
      { id: 'fix_c_2', title: 'Luz y Agua', amount: 140, currency: 'PEN', category: 'servicios', due_day: 18, is_paid: true },
      { id: 'fix_c_3', title: 'Internet Fibra Óptica', amount: 90, currency: 'PEN', category: 'servicios', due_day: 15, is_paid: true },
      { id: 'fix_c_4', title: 'Spotify Familiar', amount: 30, currency: 'PEN', category: 'entretenimiento', due_day: 25, is_paid: false }
    ],
    expenses: [
      { id: 'exp_c_1', amount: 3.50, currency: 'PEN', category: 'gastos-hormiga', description: 'Café pasado y galleta de avena ☕', is_ant_expense: true, payment_method: 'yape', bank: 'BCP', date: daysAgo(0, 3) },
      { id: 'exp_c_2', amount: 13.00, currency: 'PEN', category: 'comida', description: 'Menú criollo económico 🍲', is_ant_expense: false, payment_method: 'yape', bank: 'BCP', date: daysAgo(1, 2) },
      { id: 'exp_c_3', amount: 3.50, currency: 'PEN', category: 'transporte', description: 'Recarga Metropolitano 🚊', is_ant_expense: true, payment_method: 'efectivo', date: daysAgo(2, 5) },
      { id: 'exp_c_4', amount: 2.00, currency: 'PEN', category: 'gastos-hormiga', description: 'Emoliente caliente de quinua 🍵', is_ant_expense: true, payment_method: 'yape', date: daysAgo(3, 1) },
      { id: 'exp_c_5', amount: 120.00, currency: 'PEN', category: 'comida', description: 'Mercado compras de la quincena 🛒', is_ant_expense: false, payment_method: 'debito', bank: 'BCP', date: daysAgo(4, 4) },
      { id: 'exp_c_6', amount: 4.50, currency: 'PEN', category: 'gastos-hormiga', description: 'Agua San Mateo y fruta 🍎', is_ant_expense: true, payment_method: 'efectivo', date: daysAgo(5, 6) },
      { id: 'exp_c_7', amount: 12.00, currency: 'PEN', category: 'transporte', description: 'Taxi compartido por lluvia 🚕', is_ant_expense: false, payment_method: 'yape', date: daysAgo(7, 2) },
      { id: 'exp_c_8', amount: 85.00, currency: 'PEN', category: 'salud', description: 'Vitaminas y botiquín 💊', is_ant_expense: false, payment_method: 'debito', bank: 'BCP', date: daysAgo(9, 3) },
      { id: 'exp_c_9', amount: 2.50, currency: 'PEN', category: 'gastos-hormiga', description: 'Galletas de soda y té 🍪', is_ant_expense: true, payment_method: 'efectivo', date: daysAgo(11, 4) }
    ]
  },

  pepe: {
    id: 'pepe',
    name: 'Pepe',
    fullName: 'Pepe Gastatodo',
    nickname: 'El Gastador Fugitivo',
    emoji: '💸🏃💨',
    tagline: 'Gasta en cositas sin darse cuenta y la tarjeta de crédito lo ahorca.',
    badgeClass: 'badge-danger',
    monthlyBudget: 1500,
    creditCardBaseDebt: 450,
    userProfile: { firstName: 'Pepe', lastName: 'Gastatodo' },
    accounts: [
      { id: 'acc_p_1', name: '💵 Efectivo Billetera', type: 'efectivo', bank: 'Efectivo', currency: 'PEN', initial_balance: 35, is_operating: true, color: '#ef4444' },
      { id: 'acc_p_2', name: '🟣 Yape (BCP)', type: 'billetera_digital', bank: 'BCP', currency: 'PEN', initial_balance: 55, is_operating: true, color: '#8b5cf6' },
      { id: 'acc_p_3', name: '💳 BCP Sueldo Débito', type: 'banco', bank: 'BCP', currency: 'PEN', initial_balance: 120, is_operating: true, color: '#3b82f6' },
      { id: 'acc_p_4', name: '🏦 Ahorro Reserva Soles', type: 'ahorros', bank: 'BBVA', currency: 'PEN', initial_balance: 150, is_operating: false, color: '#f59e0b' },
      { id: 'acc_p_5', name: '💵 Ahorro Reserva Dólares', type: 'ahorros', bank: 'Interbank', currency: 'USD', initial_balance: 0, is_operating: false, color: '#10b981' },
      { id: 'acc_p_6', name: '💳 Tarjeta Crédito BCP', type: 'tarjeta_credito', bank: 'BCP', currency: 'PEN', initial_balance: 450, is_operating: false, color: '#ef4444' }
    ],
    incomes: [
      { id: 'inc_p_1', title: 'Sueldo Fijo Mensual', amount: 2400, currency: 'PEN', frequency: 'mensual' }
    ],
    fixedExpenses: [
      { id: 'fix_p_1', title: 'Alquiler Cuarto / Mini depa', amount: 750, currency: 'PEN', category: 'servicios', due_day: 5, is_paid: false },
      { id: 'fix_p_2', title: 'Luz vencida', amount: 160, currency: 'PEN', category: 'servicios', due_day: 10, is_paid: false },
      { id: 'fix_p_3', title: 'Internet + Cable', amount: 140, currency: 'PEN', category: 'servicios', due_day: 15, is_paid: false },
      { id: 'fix_p_4', title: 'Netflix + Disney + HBO + Gym', amount: 180, currency: 'PEN', category: 'entretenimiento', due_day: 20, is_paid: false }
    ],
    expenses: [
      { id: 'exp_p_1', amount: 18.50, currency: 'PEN', category: 'gastos-hormiga', description: 'Café latte frío con jarabe Starbucks ☕🍩', is_ant_expense: true, payment_method: 'credito', bank: 'BCP', date: daysAgo(0, 2) },
      { id: 'exp_p_2', amount: 26.00, currency: 'PEN', category: 'transporte', description: 'Taxi por no levantarme temprano 🚕😴', is_ant_expense: true, payment_method: 'yape', date: daysAgo(0, 6) },
      { id: 'exp_p_3', amount: 48.00, currency: 'PEN', category: 'comida', description: 'Delivery hamburguesa medianoche 🍔🍟', is_ant_expense: true, payment_method: 'credito', bank: 'BCP', date: daysAgo(1, 4) },
      { id: 'exp_p_4', amount: 22.50, currency: 'PEN', category: 'gastos-hormiga', description: 'Snacks y energizante en tienda grifo 🥤🍫', is_ant_expense: true, payment_method: 'yape', date: daysAgo(2, 3) },
      { id: 'exp_p_5', amount: 180.00, currency: 'PEN', category: 'compras', description: 'Zapatillas en liquidación que no necesitaba 👟', is_ant_expense: false, payment_method: 'credito', bank: 'BCP', date: daysAgo(3, 5) },
      { id: 'exp_p_6', amount: 32.00, currency: 'PEN', category: 'transporte', description: 'Uber de regreso de fiesta 🚗🍾', is_ant_expense: true, payment_method: 'credito', bank: 'BCP', date: daysAgo(4, 7) },
      { id: 'exp_p_7', amount: 165.00, currency: 'PEN', category: 'entretenimiento', description: 'Ronda de tragos con amigos 🍻', is_ant_expense: false, payment_method: 'credito', bank: 'BCP', date: daysAgo(5, 8) },
      { id: 'exp_p_8', amount: 19.00, currency: 'PEN', category: 'gastos-hormiga', description: 'Postre de chocolate y frapuccino 🍰', is_ant_expense: true, payment_method: 'yape', date: daysAgo(6, 2) },
      { id: 'exp_p_9', amount: 28.00, currency: 'PEN', category: 'transporte', description: 'Taxi ida y vuelta al centro 🚕', is_ant_expense: true, payment_method: 'yape', date: daysAgo(7, 3) },
      { id: 'exp_p_10', amount: 75.00, currency: 'PEN', category: 'comida', description: 'Almuerzo buffet fin de semana 🍽️', is_ant_expense: false, payment_method: 'credito', bank: 'BCP', date: daysAgo(8, 4) },
      { id: 'exp_p_11', amount: 16.50, currency: 'PEN', category: 'gastos-hormiga', description: 'Golosinas y gaseosa al paso 🍬🥤', is_ant_expense: true, payment_method: 'efectivo', date: daysAgo(10, 1) },
      { id: 'exp_p_12', amount: 350.00, currency: 'PEN', category: 'compras', description: 'Reloj inteligente a 6 cuotas ⌚', is_ant_expense: false, payment_method: 'credito', bank: 'BCP', date: daysAgo(12, 5) }
    ]
  }
};
