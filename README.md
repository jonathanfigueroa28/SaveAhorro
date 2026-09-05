# 🪙 ControlAhorro - Registro de Gastos y Gastos Hormiga 🐜

Una aplicación web moderna, ultra rápida y responsiva diseñada para registrar tus gastos diarios, categorizar compras y rastrear tus **gastos hormiga** (cafés, galletas, pasajes, propinas, comisiones) para ayudarte a ahorrar dinero y visualizar tus finanzas mediante gráficas en tiempo real.

---

## ⚡ Características Principales

- 📱 **Mobile-First & PWA Ready**: Funciona perfecto en cualquier navegador web o smartphone (se puede guardar como app en la pantalla de inicio).
- 🐜 **Modo "Gasto Hormiga"**: Botón y accesos rápidos de 1 clic para registrar compras micro en menos de 5 segundos.
- 📊 **Dashboard Interactivo**: Gráficas de dona por categorías y gráficas de barras para tendencias diarias/mensuales mediante **Chart.js**.
- 🔍 **Historial y Filtros**: Búsqueda en tiempo real, filtro por categoría y exportación completa a **Excel / CSV**.
- ☁️ **Sincronización en la Nube Gratuita (Supabase)**: Tus datos quedan guardados en la nube y se sincronizan entre tu móvil y tu PC.
- 💾 **Modo Offline**: Si no hay internet o no has configurado la nube aún, guarda todo automáticamente en tu navegador (`localStorage`).

---

## 🚀 Guía de Inicio Local

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

3. Abre en tu navegador la dirección indicada (por defecto `http://localhost:3000`).

---

## 🌐 Guía Paso a Paso para Publicarlo GRATIS en Internet

Para tener la aplicación online 24/7 sin pagar nada de hosting ni base de datos, sigue estos sencillos pasos:

### Paso 1: Crear la Base de Datos Gratuita en Supabase

1. Ve a [Supabase.com](https://supabase.com) y crea una cuenta gratuita.
2. Haz clic en **"New Project"**, dale un nombre (ej: `control-ahorro`) y asigna una contraseña.
3. En el menú lateral de Supabase, ve a **SQL Editor**, pega el siguiente código y presiona **Run**:

```sql
create table public.expenses (
  id text primary key,
  amount numeric not null,
  category text not null,
  description text,
  is_ant_expense boolean default false,
  date timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Permitir lectura y escritura pública para tu app personal
alter table public.expenses enable row level security;
create policy "Acceso Publico Expenses" on public.expenses for all using (true);
```

4. Ve a **Project Settings → API** y copia:
   - **URL del proyecto** (ej. `https://xxxx.supabase.co`)
   - **anon public key**

---

### Paso 2: Publicar la Web Gratis en Vercel

1. Sube tu código a un repositorio en **[GitHub](https://github.com)**.
2. Entra a **[Vercel.com](https://vercel.com)** (crea tu cuenta gratis conectando tu GitHub).
3. Haz clic en **"Add New Project"** e importa tu repositorio `Project Ahorro`.
4. Deja la configuración por defecto y haz clic en **"Deploy"**.
5. ¡Listo! Vercel te entregará una URL publica y segura (ejemplo: `https://control-ahorro.vercel.app`).

---

### Paso 3: Conectar la App con la Nube

1. Entra a tu nueva web publicada desde tu celular o PC.
2. Presiona el botón **"Conectar Nube"** (o ícono de Nube ☁️).
3. Pega tu **Supabase URL** y tu **API Key Anon**.
4. Marca la casilla **"Activar sincronización"** y guarda.

¡A partir de ese momento, cada gasto que registres en tu celular aparecerá instantáneamente en tu computadora! 🚀
