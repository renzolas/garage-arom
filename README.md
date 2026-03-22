# Garage — Sistema de fichas de vehículos

MVP para taller mecánico. Registro de vehículos con historial de servicios.

---

## Setup en 3 pasos

### Paso 1 — Crear la base de datos en Supabase

1. Ve a https://supabase.com y crea una cuenta gratuita
2. Crea un **nuevo proyecto** (elige cualquier región, pon una contraseña)
3. Cuando cargue, ve a **SQL Editor** (menú izquierdo)
4. Pega todo el contenido de `supabase-schema.sql` y ejecuta (botón Run)
5. Ve a **Project Settings → API** y copia:
   - `Project URL` → es tu `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → es tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Paso 2 — Subir a GitHub

1. Crea un repositorio nuevo en https://github.com (puede ser privado)
2. En la terminal, dentro de esta carpeta:

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

### Paso 3 — Deploy en Vercel

1. Ve a https://vercel.com y entra con tu cuenta de GitHub
2. Clic en **Add New Project** → importa el repositorio que acabas de crear
3. Antes de hacer deploy, agrega las **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` → el valor que copiaste
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → el valor que copiaste
4. Clic en **Deploy**
5. En 2 minutos tienes un link tipo `tu-proyecto.vercel.app`

---

## Uso local (opcional)

```bash
npm install
cp .env.local.example .env.local
# Edita .env.local con tus credenciales de Supabase
npm run dev
# Abre http://localhost:3000
```

---

## Qué incluye el MVP

- Lista de vehículos con buscador
- Ficha por vehículo (placa, marca, modelo, año, dueño, teléfono)
- Historial de servicios por vehículo (fecha, descripción, costo, mecánico)
- Total invertido por vehículo
- Eliminar vehículos y servicios
- Funciona desde celular (diseño responsive)
