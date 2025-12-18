<div align="center">

<!-- Animated Header -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0d1117,25:161b22,50:1f6feb,75:238636,100:8957e5&height=200&section=header&text=&fontSize=36&fontColor=ffffff&animation=fadeIn&fontAlignY=35" width="100%"/>

<br/>

<!-- Static Title -->
<h1>Osnove Informacione Bezbednosti<br/>2025/2026</h1>

<br/>

<!-- Animated Subtitle Only -->
<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=500&size=18&duration=2000&pause=500&color=8B949E&center=true&vCenter=true&width=400&height=30&lines=Redovni+Projekat+TIM+04" alt="Team" />

<br/>
<br/>

<!-- Tech Stack Badges -->
<p>
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
<img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"/>
<img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
<img src="https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron"/>
<img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL"/>
<img src="https://img.shields.io/badge/TypeORM-FE0803?style=for-the-badge&logo=typeorm&logoColor=white" alt="TypeORM"/>
<img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT"/>
</p>

<br/>

<!-- Divider -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

</div>

<br/>

## 📋 Sadržaj

<details>
<summary>🔍 Klikni za prikaz navigacije</summary>

<br/>

- [👥 Članovi Tima](#-članovi-tima)
- [📊 Status Projekta](#-status-projekta)
- [🏗️ Arhitektura Sistema](#️-arhitektura-sistema)
- [🗄️ Baze Podataka](#️-baze-podataka)
- [⚙️ Tehnički Stek](#️-tehnički-stek)
- [📦 Struktura Projekta](#-struktura-projekta)
- [📝 Tehničke Napomene](#-tehničke-napomene)

</details>

<br/>

<!-- ═══════════════════════════════════════════════════════════════════════════════ -->
## 👥 Članovi Tima
<!-- ═══════════════════════════════════════════════════════════════════════════════ -->

<div align="center">

| # | Indeks | Ime i Prezime |
|:-:|:------:|:--------------|
| 1 | `PR 62/2022` | 👩‍💻 Lazić Katarina |
| 2 | `PR 55/2022` | 👨‍💻 Simić Slaviša |
| 3 | `PR 36/2022` | 👩‍💻 Misić Jovana |
| 4 | `PR 42/2022` | 👩‍💻 Stojković Andrijana |
| 5 | `PR 7/2022` | 👩‍💻 Vasić Nikolina |
| 6 | `PR 11/2022` | 👩‍💻 Ćurčić Milica |

</div>

<br/>

<!-- ═══════════════════════════════════════════════════════════════════════════════ -->
## 📊 Status Projekta
<!-- ═══════════════════════════════════════════════════════════════════════════════ -->

<div align="center">

### 🎯 Ukupan Napredak

```
██████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░ 55%
```



</div>

<br/>

### 🖥️ Klijentska Aplikacija

| Komponenta | Status | Opis |
|:-----------|:------:|:-----|
| Electron Shell | ✅ Završeno | Osnovni frame, window controls, IPC komunikacija |
| React + Vite | ✅ Završeno | Konfigurisano razvojno okruženje |
| Autentifikacija UI | ✅ Završeno | Login i registracija forme |
| Routing & Guards | ✅ Završeno | Zaštićene rute, role-based pristup |
| Proizvodnja Page | ✅ Završeno | CRUD za biljke, pretraga, filtriranje |
| Sidebar navigacija | ✅ Završeno | Dinamička navigacija po ulogama |
| Prerada Page | 🔄 U toku | Interfejs za preradu |
| Skladištenje Page | 🔄 U toku | Pregled skladišta i ambalaža |
| Prodaja Page | 🔄 U toku | Katalog i kupovina |
| Analiza Page | 🔄 U toku | Grafici i izveštaji |

<br/>

### ⚙️ Backend Mikroservisi

| Mikroservis | Status | Port | Baza Podataka |
|:------------|:------:|:----:|:--------------|
| 🌐 Gateway API | ✅ Završeno | `4000` | - |
| 🔐 Auth Microservice | ✅ Završeno | `4001` | `korisnici` |
| 👤 User Microservice | ✅ Završeno | `4002` | `korisnici` |
| 📝 Audit Microservice | ✅ Završeno | `4003` | `audit_logovi` |
| 🌱 Production Microservice | ✅ Završeno | `4004` | `proizvodnja` |
| ⚗️ Processing Microservice | 🔄 U toku | `4005` | `prerada` |
| 📦 Storage Microservice | 🔄 U toku | `4006` | `skladista` |
| 🛒 Sales Microservice | 🔄 U toku | `4007` | `prodaja` |
| 📊 Analytics Microservice | 🔄 U toku | `4008` | `izvestaji_analize` |
| ⚡ Performance Microservice | 🔄 U toku | `4009` | `izvestaji_performanse` |

<br/>

<br/>

<!-- ═══════════════════════════════════════════════════════════════════════════════ -->
## 🏗️ Arhitektura Sistema
<!-- ═══════════════════════════════════════════════════════════════════════════════ -->

<div align="center">

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                                                                                  ║
║                            🖥️  ELECTRON KLIJENT                                  ║
║                         (React + Vite + TypeScript)                              ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                      │                                           ║
║                                      ▼                                           ║
║                         ┌─────────────────────────┐                              ║
║                         │    🌐 GATEWAY API       │                              ║
║                         │   (Port: 4000)          │                              ║
║                         │  ┌─────────────────┐    │                              ║
║                         │  │ 🔒 JWT Auth     │    │                              ║
║                         │  │ 🛡️ CORS         │    │                              ║
║                         │  │ 📍 Routing      │    │                              ║
║                         │  └─────────────────┘    │                              ║
║                         └───────────┬─────────────┘                              ║
║                                     │                                            ║
║           ┌─────────────────────────┼─────────────────────────┐                  ║
║           │              │          │          │              │                  ║
║           ▼              ▼          ▼          ▼              ▼                  ║
║    ┌──────────┐   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            ║
║    │🔐 Auth   │   │👤 User  │ │📝 Audit  │ │🌱 Prod. │ │   ...    │            ║
║    │  :4001   │   │  :4002   │ │  :4003   │ │  :4004   │ │          │            ║
║    └────┬─────┘   └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────────┘            ║
║         │              │            │            │                               ║
║         └──────────────┴─────┬──────┴────────────┘                               ║
║                              │                                                   ║
║                              ▼                                                   ║
║                    ┌─────────────────────┐                                       ║
║                    │   🗄️ MySQL Server   │                                       ║
║                    │     (8 Databases)   │                                       ║
║                    └─────────────────────┘                                       ║
║                                                                                  ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

</div>

<br/>

<!-- ═══════════════════════════════════════════════════════════════════════════════ -->
## 🗄️ Baze Podataka
<!-- ═══════════════════════════════════════════════════════════════════════════════ -->

<div align="center">

| Mikroservis | Baza Podataka |
|:------------|:-------------:|
| 🔐 Auth Microservice | `korisnici` |
| 👤 User Microservice | `korisnici` |
| 📝 Audit Microservice | `audit_logovi` |
| 🌱 Production Microservice | `proizvodnja` |
| ⚗️ Processing Microservice | `prerada` |
| 📦 Storage Microservice | `skladista` |
| 🛒 Sales Microservice | `prodaja` |
| 📊 Analytics Microservice | `izvestaji_analize` |
| ⚡ Performance Microservice | `izvestaji_performanse` |

</div>

<br/>

<!-- ═══════════════════════════════════════════════════════════════════════════════ -->
## ⚙️ Tehnički Stek
<!-- ═══════════════════════════════════════════════════════════════════════════════ -->

<div align="center">

<table>
<tr>
<td align="center" width="200">

### 🖥️ Frontend

</td>
<td align="center" width="200">

### ⚙️ Backend

</td>
<td align="center" width="200">

### 🗄️ Database

</td>
<td align="center" width="200">

### 🔒 Security

</td>
</tr>
<tr>
<td align="center">

<img src="https://skillicons.dev/icons?i=electron,react,ts,vite&perline=2" />

**Electron** + **React**
**TypeScript** + **Vite**

</td>
<td align="center">

<img src="https://skillicons.dev/icons?i=nodejs,express,ts&perline=2" />

**Node.js** + **Express**
**TypeScript**

</td>
<td align="center">

<img src="https://skillicons.dev/icons?i=mysql&perline=1" />

**MySQL**
**TypeORM**

</td>
<td align="center">

<img src="https://img.shields.io/badge/JWT-000?style=flat&logo=jsonwebtokens" height="40"/>
<img src="https://img.shields.io/badge/bcrypt-003A70?style=flat&logo=letsencrypt" height="40"/>

**JWT** + **bcrypt**
**CORS** + **Gateway Auth**

</td>
</tr>
</table>

</div>

<br/>

<!-- ═══════════════════════════════════════════════════════════════════════════════ -->
## 📦 Struktura Projekta
<!-- ═══════════════════════════════════════════════════════════════════════════════ -->

```
📦 oib_tim04/
│
├── 🖥️ client/                                    # Electron Desktop Aplikacija
│   ├── 📂 electron/                              # Electron konfiguracija
│   │   ├── 📄 main.ts                            # Main process
│   │   ├── 📄 preload.ts                         # Preload script
│   │   └── 📂 window_frame/                      # Custom window frame
│   │
│   └── 📂 src/
│       ├── 📂 api/                               # API sloj
│       │   ├── 📂 auth/                          # Auth API calls
│       │   ├── 📂 users/                         # User API calls
│       │   ├── 📂 plants/                        # Plants API calls
│       │   └── 📂 audit/                         # Audit API calls
│       │
│       ├── 📂 components/                        # React komponente
│       │   ├── 📂 auth/                          # Login, Register forme
│       │   ├── 📂 layout/                        # AppLayout
│       │   ├── 📂 sidebar/                       # Navigacija
│       │   ├── 📂 production/                    # Komponente za proizvodnju
│       │   └── 📂 common/                        # Deljene komponente
│       │
│       ├── 📂 contexts/                          # React Context
│       │   ├── 📄 AuthContext.tsx                # Auth state management
│       │   └── 📄 ServiceContext.tsx             # DI container
│       │
│       ├── 📂 pages/                             # Stranice aplikacije
│       │   ├── 📄 AuthPage.tsx
│       │   ├── 📄 Dashboard.tsx
│       │   └── 📄 ProductionPage.tsx
│       │
│       ├── 📂 models/                            # TypeScript DTOs
│       ├── 📂 hooks/                             # Custom hooks
│       ├── 📂 helpers/                           # Utility funkcije
│       └── 📂 enums/                             # Enumeracije
│
├── ⚙️ infrastructure/
│   │
│   ├── 📂 gateway-api/                           # 🌐 API Gateway (Port: 4000)
│   │   └── 📂 src/
│   │       ├── 📂 Domain/                        # Interfejsi i DTOs
│   │       ├── 📂 Infrastructure/                # Axios klijenti
│   │       ├── 📂 Middlewares/                   # Auth, CORS, Gateway Key
│   │       ├── 📂 Services/                      # Business logic
│   │       └── 📂 WebAPI/                        # Controllers
│   │
│   └── 📂 microservices/
│       │
│       ├── 📂 auth-microservice/                 # 🔐 Auth (Port: 4001)
│       │   └── 📂 src/
│       │       ├── 📂 Domain/                    # Models, DTOs, Interfaces
│       │       ├── 📂 Infrastructure/            # TypeORM repositories
│       │       ├── 📂 Services/                  # Auth logic
│       │       └── 📂 WebAPI/                    # Controllers, Validators
│       │
│       ├── 📂 user-microservice/                 # 👤 Users (Port: 4002)
│       ├── 📂 audit-microservice/                # 📝 Audit (Port: 4003)
│       └── 📂 production-microservice/           # 🌱 Production (Port: 4004)
│
├── 📄 data.sql                                   # Inicijalni podaci
└── 📄 README.md                                  # Dokumentacija
```

<br/>

<!-- ═══════════════════════════════════════════════════════════════════════════════ -->
## 📝 Tehničke Napomene
<!-- ═══════════════════════════════════════════════════════════════════════════════ -->

<div align="center">

| # | 📋 Zahtev | ✅ Status |
|:-:|:----------|:---------:|
| 1 | Klijentska aplikacija koristi **Electron** sa **Vite.js** | ✅ |
| 2 | Samo **Gateway** je javno dostupan klijentskoj aplikaciji | ✅ |
| 3 | Svaki mikroservis ima **sopstvenu bazu** podataka | ✅ |
| 4 | Obavezna primena **SOLID** principa i čiste arhitekture | ✅ |
| 5 | Sve lozinke se **heširaju** (bcrypt) pre čuvanja u bazi | ✅ |
| 6 | Rad sa bazom koristi **TypeORM** | ✅ |
| 7 | Klijentska aplikacija koristi **injektovane servise** | ✅ |
| 8 | Klijentska aplikacija je **podeljena na komponente** | ✅ |
| 9 | Sve rute su **zaštićene** od neovlašćenog pristupa | ✅ |
| 10 | Baza podataka: **MySQL** | ✅ |
| 11 | Konfiguracija se čuva u **.env** fajlovima | ✅ |
| 12 | **CORS** precizno podešen za svaki servis | ✅ |
| 13 | Projekat ima **inicijalne testne podatke** | ✅ |

</div>

<br/>

### 🔐 Korisničke Uloge

<div align="center">

| Uloga | Opis | Pristup |
|:------|:-----|:--------|
| **ADMIN** | Administrator sistema | Analiza performansi, Evidencija događaja, Analiza podataka |
| **SALES_MANAGER** | Menadžer prodaje | Distributivni centar (3 amb/0.5s), Svi fiskalni računi |
| **SELLER** | Prodavac | Magacinski centar (1 amb/2.5s), Kreiranje fiskalnih računa |

</div>

<br/>

<!-- ═══════════════════════════════════════════════════════════════════════════════ -->
## 📊 Statistika
<!-- ═══════════════════════════════════════════════════════════════════════════════ -->

<div align="center">

<table>
<tr>
<td align="center">
<img src="https://img.shields.io/badge/📦_Mikroservisa-9-1f6feb?style=for-the-badge" alt="Microservices"/>
</td>
<td align="center">
<img src="https://img.shields.io/badge/🗄️_Baza_Podataka-8-238636?style=for-the-badge" alt="Databases"/>
</td>
<td align="center">
<img src="https://img.shields.io/badge/👥_Uloga-3-8957e5?style=for-the-badge" alt="Roles"/>
</td>
<td align="center">
<img src="https://img.shields.io/badge/📋_Entiteta-11-f78166?style=for-the-badge" alt="Entities"/>
</td>
</tr>
</table>

</div>

<br/>

---

<div align="center">

<!-- Divider -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

<br/>

<!-- Footer -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0d1117,25:161b22,50:1f6feb,75:238636,100:8957e5&height=120&section=footer&animation=twinkling" width="100%"/>

<br/>

<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=16&duration=3000&pause=1000&color=58A6FF&center=true&vCenter=true&width=500&lines=🎓+Osnove+Informacione+Bezbednosti;📅+Školska+Godina+2025%2F2026;🔐+TIM+04" alt="Footer Typing" />

<br/>

**© 2025 TIM 04 — Osnove Informacione Bezbednosti**

</div>