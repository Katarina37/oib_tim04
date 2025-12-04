<div align="center">

<!-- Animated Header -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,14,30&height=300&section=header&text=Парфимерија%20O'Signel%20De%20Or&fontSize=50&fontColor=fff&animation=fadeIn&fontAlignY=38&desc=🌸%20Luxury%20Perfumery%20Information%20System%20🌸&descAlignY=55&descAlign=50" width="100%"/>

<!-- Animated Logo -->
<img src="https://readme-typing-svg.herokuapp.com?font=Playfair+Display&weight=700&size=28&duration=4000&pause=1000&color=C9A227&center=true&vCenter=true&multiline=true&repeat=false&width=700&height=100&lines=✨+The+Art+of+French+Perfumery+✨;Since+Paris%2C+France" alt="Typing SVG" />

<br/>

<!-- Badges Row 1 -->
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)

<!-- Badges Row 2 -->
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![TypeORM](https://img.shields.io/badge/TypeORM-FE0803?style=for-the-badge&logo=typeorm&logoColor=white)](https://typeorm.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

<br/>

<!-- Stats Badges -->
![Stars](https://img.shields.io/github/stars/your-username/osignel-de-or?style=social)
![Forks](https://img.shields.io/github/forks/your-username/osignel-de-or?style=social)
![Issues](https://img.shields.io/github/issues/your-username/osignel-de-or?color=gold)
![License](https://img.shields.io/badge/license-MIT-gold)

<br/>

<!-- Decorative Divider -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

</div>

## 🌹 О Пројекту | About

<img align="right" width="300" src="https://media.giphy.com/media/SWoSkN6DxTszqIKEqv/giphy.gif" alt="coding gif"/>

**O'Signel De Or** је софистицирани информациони систем за управљање познатом париском парфимеријом. Систем је изграђен на модерној микросервисној архитектури која обезбеђује скалабилност, сигурност и висок ниво перформанси.

> *"Perfume is the art that makes memory speak."* — Kenzo Takada

### ✨ Кључне карактеристике

- 🔐 **Сигурна аутентификација** — JWT токени са хеширањем лозинки
- 🏭 **Микросервисна архитектура** — 9 независних сервиса
- 📊 **Напредна аналитика** — Извештаји о продаји и перформансама
- 🎨 **Модеран UI** — Electron + Vite.js клијентска апликација
- 📝 **Евиденција догађаја** — Комплетан audit log систем

<br clear="right"/>

---

## 🏛️ Архитектура система

<div align="center">

```mermaid
flowchart TB
    subgraph Client ["🖥️ Electron Client"]
        EC[Vite.js App]
    end
    
    subgraph Gateway ["🚪 API Gateway"]
        GW[Traffic Router]
        AUTH[Auth & Authorization]
    end
    
    subgraph Services ["⚙️ Microservices"]
        direction TB
        AS[🔐 Auth Service]
        US[👤 User Service]
        PS[🌱 Production Service]
        PRS[⚗️ Processing Service]
        PKS[📦 Packaging Service]
        SS[🏭 Storage Service]
        SLS[💰 Sales Service]
        DAS[📊 Data Analysis]
        PAS[📈 Performance Analysis]
        ELS[📝 Event Logging]
    end
    
    subgraph Databases ["🗄️ Databases"]
        DB1[(korisnici)]
        DB2[(proizvodnja)]
        DB3[(prerada)]
        DB4[(skladista)]
        DB5[(prodaja)]
        DB6[(izvestaji_analize)]
        DB7[(izvestaji_performanse)]
        DB8[(audit_logovi)]
    end
    
    EC --> GW
    GW --> AUTH
    AUTH --> AS
    GW --> US --> DB1
    GW --> PS --> DB2
    GW --> PRS --> DB3
    GW --> PKS --> DB3
    GW --> SS --> DB4
    GW --> SLS --> DB5
    GW --> DAS --> DB6
    GW --> PAS --> DB7
    GW --> ELS --> DB8
    
    style Client fill:#1a1a2e,stroke:#c9a227,color:#fff
    style Gateway fill:#16213e,stroke:#c9a227,color:#fff
    style Services fill:#0f3460,stroke:#c9a227,color:#fff
    style Databases fill:#1a1a2e,stroke:#c9a227,color:#fff
```

</div>

---

## 🎭 Улоге корисника

<div align="center">

| Улога | Приступ | Опис |
|:---:|:---|:---|
| 🔴 **Администратор** | Аналитика, Евиденција, Перформансе | Комплетан увид у системске извештаје |
| 🟡 **Менаџер продаје** | Дистрибутивни центар (3 амбалаже/0.5s) | Велепродајне операције |
| 🟢 **Продавац** | Магацински центар (1 амбалажа/2.5s) | Малопродајне операције |

</div>

---

## 📦 Ентитети

<details>
<summary>🌿 <b>Биљка (Plant)</b></summary>
<br/>

```typescript
interface Biljka {
  id: number;
  opstiNaziv: string;           // Општи назив
  jacinaAromaticnihUlja: number; // 1.0 - 5.0
  latinskiNaziv: string;        // Латински назив
  zemljaPorekla: string;        // Земља порекла
  stanje: 'POSADJANA' | 'UBRANA' | 'PRERADJENA';
}
```
</details>

<details>
<summary>🧴 <b>Парфем (Perfume)</b></summary>
<br/>

```typescript
interface Parfem {
  id: number;
  naziv: string;
  tip: 'PARFEM' | 'KOLONJSKA_VODA';
  netoKolicina: 150 | 250;       // ml
  serijskiBroj: string;          // PP-2025-{ID}
  biljkaId: number;
  rokTrajanja: Date;
}
```
</details>

<details>
<summary>📦 <b>Амбалажа (Packaging)</b></summary>
<br/>

```typescript
interface Ambalaza {
  id: number;
  naziv: string;
  adresaPosiljaoca: string;
  skladisteId: number;
  parfemiIds: number[];
  status: 'SPAKOVANA' | 'POSLATA';
}
```
</details>

<details>
<summary>🏭 <b>Складиште (Warehouse)</b></summary>
<br/>

```typescript
interface Skladiste {
  id: number;
  naziv: string;
  lokacija: string;
  maksimalanBrojAmbalaza: number;
}
```
</details>

<details>
<summary>🧾 <b>Фискални рачун (Invoice)</b></summary>
<br/>

```typescript
interface FiskalniRacun {
  id: number;
  tipProdaje: 'MALOPRODAJA' | 'VELEPRODAJA';
  nacinPlacanja: 'GOTOVINA' | 'UPLATA_NA_RACUN' | 'KARTICNO';
  stavke: { parfemId: number; kolicina: number }[];
  ukupanIznos: number;
}
```
</details>

---

## 🚀 Инсталација

<div align="center">
<img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=18&duration=3000&pause=1000&color=C9A227&center=true&vCenter=true&width=500&lines=Let's+get+you+started...;Follow+these+simple+steps!" alt="Installation"/>
</div>

### Предуслови

```bash
# Проверите верзије
node --version  # >= 18.0.0
npm --version   # >= 9.0.0
mysql --version # >= 8.0
```

### 1️⃣ Клонирање репозиторијума

```bash
git clone https://github.com/your-username/osignel-de-or.git
cd osignel-de-or
```

### 2️⃣ Подешавање окружења

```bash
# Копирајте .env.example у .env за сваки микросервис
cp services/auth-service/.env.example services/auth-service/.env
cp services/user-service/.env.example services/user-service/.env
# ... понављајте за остале сервисе
```

### 3️⃣ Инсталација зависности

```bash
# Инсталација за све сервисе
npm run install:all

# Или појединачно
cd services/auth-service && npm install
cd ../user-service && npm install
# ...
```

### 4️⃣ Покретање база података

```bash
# Са Docker-ом
docker-compose up -d mysql

# Или локално креирајте базе
mysql -u root -p < scripts/create-databases.sql
```

### 5️⃣ Покретање микросервиса

```bash
# Покрените све сервисе
npm run start:all

# Или појединачно (у различитим терминалима)
npm run start:gateway     # Port 3000
npm run start:auth        # Port 3001
npm run start:users       # Port 3002
npm run start:production  # Port 3003
npm run start:processing  # Port 3004
npm run start:packaging   # Port 3005
npm run start:storage     # Port 3006
npm run start:sales       # Port 3007
npm run start:analytics   # Port 3008
npm run start:performance # Port 3009
npm run start:audit       # Port 3010
```

### 6️⃣ Покретање клијентске апликације

```bash
cd client
npm install
npm run dev
```

---

## 🖼️ Снимци екрана

<div align="center">

### 🔐 Аутентификација
<img src="https://placehold.co/800x500/1a1a2e/c9a227?text=Authentication+Screen" alt="Auth Screen" style="border-radius: 10px; box-shadow: 0 4px 20px rgba(201, 162, 39, 0.3);"/>

<br/><br/>

### 🌱 Производња
<img src="https://placehold.co/800x500/16213e/c9a227?text=Production+Service" alt="Production" style="border-radius: 10px;"/>

<br/><br/>

### 📊 Аналитика продаје
<img src="https://placehold.co/800x500/0f3460/c9a227?text=Sales+Analytics" alt="Analytics" style="border-radius: 10px;"/>

</div>

---

## 📁 Структура пројекта

```
osignel-de-or/
├── 📂 client/                    # Electron + Vite.js клијент
│   ├── 📂 src/
│   │   ├── 📂 components/        # UI компоненте
│   │   ├── 📂 services/          # Инјектовани сервиси
│   │   ├── 📂 pages/             # Странице апликације
│   │   └── 📂 guards/            # Route guards
│   └── 📄 electron.js
│
├── 📂 services/                  # Микросервиси
│   ├── 📂 gateway/               # API Gateway (Port 3000)
│   ├── 📂 auth-service/          # Аутентификација (Port 3001)
│   ├── 📂 user-service/          # Корисници (Port 3002)
│   ├── 📂 production-service/    # Производња (Port 3003)
│   ├── 📂 processing-service/    # Прерада (Port 3004)
│   ├── 📂 packaging-service/     # Паковање (Port 3005)
│   ├── 📂 storage-service/       # Складиштење (Port 3006)
│   ├── 📂 sales-service/         # Продаја (Port 3007)
│   ├── 📂 analytics-service/     # Анализа података (Port 3008)
│   ├── 📂 performance-service/   # Анализа перформанси (Port 3009)
│   └── 📂 audit-service/         # Евиденција догађаја (Port 3010)
│
├── 📂 shared/                    # Дељени модули
│   ├── 📂 entities/              # TypeORM ентитети
│   ├── 📂 interfaces/            # TypeScript интерфејси
│   └── 📂 utils/                 # Помоћне функције

```

---

## 🔒 Безбедност

<div align="center">

| Мера | Имплементација |
|:---:|:---|
| 🔑 | Хеширање лозинки (bcrypt) |
| 🎫 | JWT токени за аутентификацију |
| 🛡️ | CORS подешавања по микросервису |
| 🚫 | Gateway-only приступ микросервисима |
| 📝 | Комплетна евиденција догађаја |
| ⏱️ | Сесија истиче након 30 минута |

</div>

---

## 🧪 SOLID Принципи

<div align="center">

| Принцип | Примена у пројекту |
|:---:|:---|
| **S**ingle Responsibility | Сваки микросервис има једну одговорност |
| **O**pen/Closed | Сервиси прошириви преко интерфејса |
| **L**iskov Substitution | Дистрибутивни/Магацински центар |
| **I**nterface Segregation | Специфични интерфејси по сервису |
| **D**ependency Inversion | Инјектоване зависности свуда |

</div>

---

## 📈 Перформансе

```
┌─────────────────────────────────────────────────────────────┐
│                  ДИСТРИБУТИВНИ ЦЕНТАР                       │
│  ═══════════════════════════════════════════════════════   │
│  📦 Амбалаже по слању: 3                                   │
│  ⏱️  Време обраде: 0.5s                                     │
│  🚀 Брзина: 6.0 амб/с                                       │
│  ✅ Ефикасност: 93%                                         │
│  💼 Оптимално за: Велепродаја, велики обим                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   МАГАЦИНСКИ ЦЕНТАР                         │
│  ═══════════════════════════════════════════════════════   │
│  📦 Амбалаже по слању: 1                                   │
│  ⏱️  Време обраде: 2.5s                                     │
│  🚀 Брзина: 0.4 амб/с                                       │
│  ✅ Ефикасност: 35%                                         │
│  💼 Оптимално за: Малопродаја, појединачне                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🤝 Допринос пројекту

<div align="center">
<img src="https://contrib.rocks/image?repo=your-username/osignel-de-or" />
</div>

```bash
# 1. Fork репозиторијум
# 2. Креирајте feature branch
git checkout -b feature/amazing-feature

# 3. Commit промене
git commit -m '✨ Add amazing feature'

# 4. Push на branch
git push origin feature/amazing-feature

# 5. Отворите Pull Request
```

---

## 📜 Лиценца

<div align="center">

Овај пројекат је лиценциран под **MIT** лиценцом.

[Погледајте LICENSE](./LICENSE)

</div>

---

## 📞 Контакт

<div align="center">

[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:your-email@example.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/your-profile)
[![Portfolio](https://img.shields.io/badge/Portfolio-000000?style=for-the-badge&logo=About.me&logoColor=white)](https://your-portfolio.com)

</div>

---

<div align="center">

<!-- Animated Footer -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,14,30&height=150&section=footer&animation=fadeIn" width="100%"/>

<br/>

**TEST**

<br/>

<img src="https://readme-typing-svg.herokuapp.com?font=Playfair+Display&weight=500&size=16&duration=4000&pause=2000&color=C9A227&center=true&vCenter=true&width=500&lines=Made+with+%E2%9D%A4%EF%B8%8F+in+Paris;Основе+информационе+безбедности+2025%2F2026" alt="Footer"/>

</div>