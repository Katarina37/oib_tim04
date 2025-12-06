<div align="center">

<!-- Animirani Header sa Gradijentom -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0d1117,25:161b22,50:1f6feb,75:238636,100:8957e5&height=280&section=header&text=Osnove%20Informacione%20Bezbednosti&fontSize=40&fontColor=ffffff&animation=twinkling&fontAlignY=32&desc=🔐%20Projektni%20Zadatak%20•%202025/2026%20🔐&descAlignY=52&descSize=20" width="100%"/>

<!-- Typing Animacija -->
<a href="#">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&duration=3000&pause=1000&color=58A6FF&center=true&vCenter=true&multiline=true&repeat=true&width=700&height=80&lines=🏗️+Mikroservisna+Arhitektura;🔒+JWT+Autentifikacija+•+Heširanje+Lozinki;⚡+SOLID+Principi+•+Čista+Arhitektura" alt="Typing SVG" />
</a>

<br/>

<!-- Animirana Linija -->
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

<br/>

<!-- Tech Stack Badges sa Bojama -->
<p>
  <img src="https://img.shields.io/badge/🖥️_Electron-47848F?style=for-the-badge&logoColor=white" alt="Electron"/>
  <img src="https://img.shields.io/badge/⚙️_Node.js-339933?style=for-the-badge&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/🗄️_MySQL-4479A1?style=for-the-badge&logoColor=white" alt="MySQL"/>
  <img src="https://img.shields.io/badge/🔗_TypeORM-FE0803?style=for-the-badge&logoColor=white" alt="TypeORM"/>
</p>

<!-- Dodatni Badges -->
<p>
  <img src="https://img.shields.io/badge/Verzija-1.0.0-blue?style=flat-square&logo=semver" alt="Version"/>
  <img src="https://img.shields.io/badge/Status-U_Izradi-yellow?style=flat-square" alt="Status"/>
  <img src="https://img.shields.io/badge/Licenca-MIT-green?style=flat-square" alt="License"/>
  <img src="https://img.shields.io/badge/Mikroservisa-9-purple?style=flat-square" alt="Microservices"/>
  <img src="https://img.shields.io/badge/Baza-MySQL-orange?style=flat-square&logo=mysql" alt="Database"/>
</p>

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

</div>

<br/>

<!-- ═══════════════════════════════════════════════════════════════════════════════ -->
## <img src="https://media.giphy.com/media/iY8CRBdQXODJSCERIr/giphy.gif" width="30"> &nbsp;O Projektu
<!-- ═══════════════════════════════════════════════════════════════════════════════ -->

<img align="right" src="https://media.giphy.com/media/qgQUggAC3Pfv687qPC/giphy.gif" width="320"/>

Kompletan **informacioni sistem** implementiran kroz mikroservisnu arhitekturu sa posebnim fokusom na **bezbednosne aspekte**.

<br/>

### ✨ Ključne Karakteristike

- 🏗️ **9 nezavisnih mikroservisa**
- 🌐 **Centralizovani API Gateway**
- 🖥️ **Desktop klijentska aplikacija**
- 🔐 **JWT autentifikacija**
- 🛡️ **RBAC kontrola pristupa**
- 📝 **Kompletan audit trail**

<br clear="right"/>

<br/>

<!-- ═══════════════════════════════════════════════════════════════════════════════ -->
## <img src="https://media.giphy.com/media/W5eoZHPpUx9sapR0eu/giphy.gif" width="30"> &nbsp;Članovi Tima
<!-- ═══════════════════════════════════════════════════════════════════════════════ -->

<table>
<tr>
<td>

| &nbsp;&nbsp;&nbsp;🎓&nbsp;&nbsp;&nbsp; | Indeks | Ime i Prezime |
|:---:|:---|:---|
| 👩‍💻 | `PR 62/2022` | **Lazić Katarina** |
| 👨‍💻 | `PR 55/2022` | **Simić Slaviša** |
| 👩‍💻 | `PR 36/2022` | **Misić Jovana** |
| 👩‍💻 | `PR 42/2022` | **Stojković Andrijana** |
| 👩‍💻 | `PR 7/2022` | **Vasić Nikolina** |
| 👩‍💻 | `PR 11/2022` | **Ćurčić Milica** |

</td>
<td>

<img src="https://media.giphy.com/media/L1R1tvI9svkIWwpVYr/giphy.gif" width="300"/>

</td>
</tr>
</table>

<br/>

<!-- ═══════════════════════════════════════════════════════════════════════════════ -->
## <img src="https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif" width="30"> &nbsp;Arhitektura Sistema
<!-- ═══════════════════════════════════════════════════════════════════════════════ -->

<div align="center">
<br/>

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#1f6feb', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#58a6ff', 'lineColor': '#8957e5', 'secondaryColor': '#238636', 'tertiaryColor': '#161b22', 'background': '#0d1117', 'mainBkg': '#161b22', 'nodeBorder': '#30363d'}}}%%

flowchart TB
    subgraph CLIENT["<b>🖥️ KLIJENT</b>"]
        direction TB
        E["<b>Electron</b><br/>Desktop Aplikacija"]
    end

    subgraph GATEWAY["<b>🌐 API GATEWAY</b>"]
        direction TB
        G["<b>Rutiranje</b><br/>Autentifikacija & Autorizacija"]
    end

    subgraph SERVICES["<b>⚙️ MIKROSERVISI</b>"]
        direction TB
        
        subgraph AUTH["🔐 Autentifikacija"]
            A1["Prijava / Registracija"]
        end
        
        subgraph USER["👤 Korisnici"]
            U1["CRUD Operacije"]
        end
        
        subgraph PROD["🌱 Proizvodnja"]
            P1["Sađenje / Branje"]
        end
        
        subgraph PROC["⚗️ Prerada"]
            PR1["Kreiranje Parfema"]
        end
        
        subgraph STOR["📦 Skladištenje"]
            S1["Pakovanje / Slanje"]
        end
        
        subgraph SALE["🛒 Prodaja"]
            SA1["Katalog / Porudžbine"]
        end
        
        subgraph ANAL["📊 Analiza"]
            AN1["Izveštaji / Statistika"]
        end
        
        subgraph PERF["⚡ Performanse"]
            PE1["Simulacija / Optimizacija"]
        end
        
        subgraph AUDIT["📝 Evidencija"]
            AU1["Logovanje Događaja"]
        end
    end

    subgraph DATABASE["<b>🗄️ MySQL BAZE PODATAKA</b>"]
        direction LR
        DB1[("korisnici")]
        DB2[("proizvodnja")]
        DB3[("prerada")]
        DB4[("skladista")]
        DB5[("prodaja")]
        DB6[("izvestaji_analize")]
        DB7[("izvestaji_performanse")]
        DB8[("audit_logovi")]
    end

    E <===> G
    G <---> AUTH & USER & PROD & PROC & STOR & SALE & ANAL & PERF & AUDIT

    AUTH & USER --> DB1
    PROD --> DB2
    PROC --> DB3
    STOR --> DB4
    SALE --> DB5
    ANAL --> DB6
    PERF --> DB7
    AUDIT --> DB8

    style CLIENT fill:#238636,stroke:#3fb950,stroke-width:3px,color:#ffffff
    style GATEWAY fill:#1f6feb,stroke:#58a6ff,stroke-width:3px,color:#ffffff
    style SERVICES fill:#161b22,stroke:#8957e5,stroke-width:2px
    style DATABASE fill:#0d1117,stroke:#f78166,stroke-width:2px
```

<br/>
</div>

<br/>

<!-- ═══════════════════════════════════════════════════════════════════════════════ -->
## <img src="https://media.giphy.com/media/VgCDAzcKvsR6OM0uWg/giphy.gif" width="30"> &nbsp;Bezbednosne Karakteristike
<!-- ═══════════════════════════════════════════════════════════════════════════════ -->

<table>
<tr>
<td width="50%">

### 🔑 Autentifikacija
```
┌────────────────────────────────────┐
│  ✅ JWT Tokeni                     │
│  ✅ Refresh Token mehanizam        │
│  ✅ Sesije sa vremenskim limitom   │
│  ✅ Validacija na svakom zahtevu   │
└────────────────────────────────────┘
```

### 🔒 Zaštita Podataka
```
┌────────────────────────────────────┐
│  ✅ Bcrypt heširanje lozinki       │
│  ✅ Saltovanje                     │
│  ✅ Enkripcija osetljivih polja    │
│  ✅ SQL injection prevencija       │
└────────────────────────────────────┘
```

</td>
<td width="50%">

### 🛡️ Mrežna Bezbednost
```
┌────────────────────────────────────┐
│  ✅ CORS konfiguracija             │
│  ✅ Rate limiting                  │
│  ✅ Request validacija             │
│  ✅ Sanitizacija inputa            │
└────────────────────────────────────┘
```

### 📋 Revizija i Praćenje
```
┌────────────────────────────────────┐
│  ✅ Kompletan audit trail          │
│  ✅ INFO / WARNING / ERROR logovi  │
│  ✅ Praćenje svih akcija           │
│  ✅ Vremenske oznake               │
└────────────────────────────────────┘
```

</td>
</tr>
</table>

<br/>

<!-- ═══════════════════════════════════════════════════════════════════════════════ -->
## <img src="https://media.giphy.com/media/ZCN6F3FAkwsyOGU2RS/giphy.gif" width="30"> &nbsp;Korisničke Uloge
<!-- ═══════════════════════════════════════════════════════════════════════════════ -->

<table>
<tr>
<td align="center" width="33%">

### 🛡️ Administrator

<img src="https://img.shields.io/badge/-ADMIN-dc3545?style=for-the-badge" alt="Admin"/>

```
╔═══════════════════════════╗
║  📊 Analiza performansi   ║
║  📝 Evidencija događaja   ║
║  📈 Analiza podataka      ║
║  ⚙️  Upravljanje sistemom  ║
╚═══════════════════════════╝
```

**Pristup servisima:**
- ⚡ Analiza Performansi
- 📝 Evidencija Događaja  
- 📊 Analiza Podataka

</td>
<td align="center" width="33%">

### 📊 Menadžer Prodaje

<img src="https://img.shields.io/badge/-MENADŽER-ffc107?style=for-the-badge&logoColor=black" alt="Manager"/>

```
╔═══════════════════════════╗
║  🏭 Distributivni centar  ║
║  📦 3 ambalaže / slanje   ║
║  ⏱️  0.5s vreme obrade     ║
║  🧾 Svi fiskalni računi   ║
╚═══════════════════════════╝
```

**Pristup servisima:**
- 🌱 Proizvodnja
- ⚗️ Prerada
- 📦 Skladištenje
- 🛒 Prodaja

</td>
<td align="center" width="33%">

### 🛒 Prodavac

<img src="https://img.shields.io/badge/-PRODAVAC-28a745?style=for-the-badge" alt="Seller"/>

```
╔═══════════════════════════╗
║  🏪 Magacinski centar     ║
║  📦 1 ambalaža / slanje   ║
║  ⏱️  2.5s vreme obrade     ║
║  🧾 Kreiranje računa      ║
╚═══════════════════════════╝
```

**Pristup servisima:**
- 🌱 Proizvodnja
- ⚗️ Prerada
- 📦 Skladištenje
- 🛒 Prodaja

</td>
</tr>
</table>

<br/>

<!-- ═══════════════════════════════════════════════════════════════════════════════ -->
## <img src="https://media.giphy.com/media/WFZvB7VIXBgiz3oDXE/giphy.gif" width="30"> &nbsp;Pregled Mikroservisa
<!-- ═══════════════════════════════════════════════════════════════════════════════ -->

<details>
<summary>
<img src="https://img.shields.io/badge/🔐-Servis_za_Autentifikaciju-1f6feb?style=flat-square" alt="Auth"/>
&nbsp;<b>Klikni za detalje</b>
</summary>

<br/>

| Komponenta | Opis |
|:---|:---|
| 📁 **Baza podataka** | `korisnici` |
| 🔧 **Funkcionalnosti** | Registracija, Prijava, JWT generisanje |
| ✅ **Validacije** | Email format, jačina lozinke, jedinstvenost korisničkog imena |

```javascript
// Primer JWT payload-a
{
  "userId": 1,
  "username": "korisnik",
  "role": "PRODAVAC",
  "iat": 1699999999,
  "exp": 1700001799
}
```

</details>

<details>
<summary>
<img src="https://img.shields.io/badge/👤-Servis_za_Upravljanje_Korisnicima-238636?style=flat-square" alt="Users"/>
&nbsp;<b>Klikni za detalje</b>
</summary>

<br/>

| Komponenta | Opis |
|:---|:---|
| 📁 **Baza podataka** | `korisnici` |
| 🔧 **Funkcionalnosti** | Dodavanje, Ažuriranje, Brisanje, Pretraga |
| 📋 **Atributi korisnika** | ID, Korisničko ime, Email, Ime, Prezime, Profilna slika (base64), Uloga |

</details>

<details>
<summary>
<img src="https://img.shields.io/badge/🌱-Servis_za_Proizvodnju-3fb950?style=flat-square" alt="Production"/>
&nbsp;<b>Klikni za detalje</b>
</summary>

<br/>

| Komponenta | Opis |
|:---|:---|
| 📁 **Baza podataka** | `proizvodnja` |
| 🔧 **Funkcionalnosti** | Sađenje biljaka, Promena jačine ulja, Branje |

**Atributi biljke:**
| Atribut | Tip | Opis |
|:---|:---|:---|
| `opsti_naziv` | string | Naziv biljke |
| `jacina_ulja` | float | Vrednost 1.0 - 5.0 |
| `latinski_naziv` | string | Latinski naziv |
| `zemlja_porekla` | string | Država porekla |
| `stanje` | enum | POSAĐENA / UBRANA / PRERAĐENA |

</details>

<details>
<summary>
<img src="https://img.shields.io/badge/⚗️-Servis_za_Preradu-8957e5?style=flat-square" alt="Processing"/>
&nbsp;<b>Klikni za detalje</b>
</summary>

<br/>

| Komponenta | Opis |
|:---|:---|
| 📁 **Baza podataka** | `prerada` |
| 🔧 **Funkcionalnosti** | Prerada biljaka u parfeme, Balansiranje jačine ulja |
| 📐 **Formula** | 1 biljka = 50ml parfema |
| 🏷️ **Serijski broj** | `PP-2025-{ID_PARFEMA}` |

**Atributi parfema:**
| Atribut | Tip | Opis |
|:---|:---|:---|
| `naziv` | string | Naziv parfema |
| `tip` | enum | PARFEM / KOLONJSKA_VODA |
| `neto_kolicina` | int | 150ml ili 250ml |
| `rok_trajanja` | date | Datum isteka |

> ⚠️ **Napomena:** Ako jačina ulja prelazi 4.0, sistem automatski sadi novu biljku i balansira vrednosti.

</details>

<details>
<summary>
<img src="https://img.shields.io/badge/📦-Servis_za_Skladištenje-f78166?style=flat-square" alt="Storage"/>
&nbsp;<b>Klikni za detalje</b>
</summary>

<br/>

| Komponenta | Opis |
|:---|:---|
| 📁 **Baza podataka** | `skladista` |
| 🔧 **Funkcionalnosti** | Pakovanje parfema, Slanje ambalaža, Upravljanje kapacitetom |

**Tipovi skladišta:**

| Tip | Korisnik | Kapacitet | Vreme |
|:---|:---|:---:|:---:|
| 🏭 **Distributivni centar** | Menadžer | 3 ambalaže | 0.5s |
| 🏪 **Magacinski centar** | Prodavac | 1 ambalaža | 2.5s |

</details>

<details>
<summary>
<img src="https://img.shields.io/badge/🛒-Servis_za_Prodaju-ea4aaa?style=flat-square" alt="Sales"/>
&nbsp;<b>Klikni za detalje</b>
</summary>

<br/>

| Komponenta | Opis |
|:---|:---|
| 📁 **Baza podataka** | `prodaja` |
| 🔧 **Funkcionalnosti** | Katalog proizvoda, Poručivanje, Raspakivanje ambalaža |

**Fiskalni račun sadrži:**
- 📋 Tip prodaje (MALOPRODAJA / VELEPRODAJA)
- 💳 Način plaćanja (GOTOVINA / KARTICA / UPLATA)
- 🧴 Lista parfema sa količinama
- 💰 Ukupan iznos

</details>

<details>
<summary>
<img src="https://img.shields.io/badge/📊-Servis_za_Analizu_Podataka-0969da?style=flat-square" alt="Analytics"/>
&nbsp;<b>Klikni za detalje</b>
</summary>

<br/>

| Komponenta | Opis |
|:---|:---|
| 📁 **Baza podataka** | `izvestaji_analize` |
| 🔧 **Funkcionalnosti** | Kreiranje izveštaja, Analiza prodaje, PDF izvoz |

**Dostupne analize:**
- 📅 Prodaja po mesecu / nedelji / godini
- 📈 Trend analiza
- 🏆 Top 10 najprodavanijih parfema
- 💰 Ukupan prihod po kategorijama

</details>

<details>
<summary>
<img src="https://img.shields.io/badge/⚡-Servis_za_Analizu_Performansi-ffd33d?style=flat-square&logoColor=black" alt="Performance"/>
&nbsp;<b>Klikni za detalje</b>
</summary>

<br/>

| Komponenta | Opis |
|:---|:---|
| 📁 **Baza podataka** | `izvestaji_performanse` |
| 🔧 **Funkcionalnosti** | Simulacija algoritama, Poređenje efikasnosti, Optimizacija |

**Metrike:**
- ⏱️ Vreme obrade
- 📊 Propusnost sistema
- 🎯 Efikasnost algoritama
- 💡 Preporuke za poboljšanje

</details>

<details>
<summary>
<img src="https://img.shields.io/badge/📝-Servis_za_Evidenciju_Događaja-6e7681?style=flat-square" alt="Audit"/>
&nbsp;<b>Klikni za detalje</b>
</summary>

<br/>

| Komponenta | Opis |
|:---|:---|
| 📁 **Baza podataka** | `audit_logovi` |
| 🔧 **Funkcionalnosti** | Logovanje svih akcija, Pretraga, Filtriranje |

**Tipovi zapisa:**

| Tip | Boja | Opis |
|:---|:---:|:---|
| `INFO` | 🟢 | Standardne operacije |
| `WARNING` | 🟡 | Upozorenja i anomalije |
| `ERROR` | 🔴 | Greške u sistemu |

</details>

<br/>

<!-- ═══════════════════════════════════════════════════════════════════════════════ -->
## <img src="https://media.giphy.com/media/fwbZnTftCXVocKzfxR/giphy.gif" width="30"> &nbsp;Dijagram Entiteta
<!-- ═══════════════════════════════════════════════════════════════════════════════ -->

<div align="center">

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#238636', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#3fb950', 'lineColor': '#8957e5', 'secondaryColor': '#1f6feb', 'tertiaryColor': '#161b22'}}}%%

erDiagram
    KORISNIK {
        int id PK "🔑 Primarni ključ"
        varchar korisnicko_ime UK "👤 Jedinstveno"
        varchar lozinka "🔒 Heširano"
        varchar email "📧 Email adresa"
        varchar ime "📝 Ime"
        varchar prezime "📝 Prezime"
        text profilna_slika "🖼️ Base64"
        enum uloga "🎭 ADMIN/MENADZER/PRODAVAC"
    }
    
    BILJKA {
        int id PK "🔑 Primarni ključ"
        varchar opsti_naziv "🌿 Naziv"
        decimal jacina_ulja "💧 1.0 - 5.0"
        varchar latinski_naziv "🔬 Latinski"
        varchar zemlja_porekla "🌍 Država"
        enum stanje "📊 Status"
    }
    
    PARFEM {
        int id PK "🔑 Primarni ključ"
        varchar naziv "🧴 Naziv parfema"
        enum tip "📦 PARFEM/KOLONJSKA"
        int neto_kolicina "📏 ml"
        varchar serijski_broj "🏷️ PP-2025-ID"
        int biljka_id FK "🔗 Referenca"
        date rok_trajanja "📅 Datum"
    }
    
    AMBALAZA {
        int id PK "🔑 Primarni ključ"
        varchar naziv "📦 Naziv"
        varchar adresa_posiljaoca "📍 Adresa"
        int skladiste_id FK "🔗 Referenca"
        enum status "📊 SPAKOVANA/POSLATA"
    }
    
    SKLADISTE {
        int id PK "🔑 Primarni ključ"
        varchar naziv "🏭 Naziv"
        varchar lokacija "📍 Lokacija"
        int max_kapacitet "📊 Maksimum"
    }
    
    FISKALNI_RACUN {
        int id PK "🔑 Primarni ključ"
        enum tip_prodaje "🏪 MALO/VELO"
        enum nacin_placanja "💳 Način"
        decimal iznos "💰 RSD"
        datetime datum "📅 Vreme"
    }
    
    AUDIT_LOG {
        int id PK "🔑 Primarni ključ"
        enum tip "📊 INFO/WARN/ERROR"
        datetime datum_vreme "⏰ Timestamp"
        text opis "📝 Detalji"
    }

    BILJKA ||--o{ PARFEM : "prerađuje se"
    PARFEM }o--|| AMBALAZA : "pakuje se"
    AMBALAZA }o--|| SKLADISTE : "skladišti se"
    FISKALNI_RACUN }o--o{ PARFEM : "sadrži"
```

</div>

<br/>

<!-- ═══════════════════════════════════════════════════════════════════════════════ -->
## <img src="https://media.giphy.com/media/LnQjpWaON8nhr21vNW/giphy.gif" width="30"> &nbsp;Tok Podataka - Proces Prodaje
<!-- ═══════════════════════════════════════════════════════════════════════════════ -->

<div align="center">

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#1f6feb', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#58a6ff', 'actorLineColor': '#8957e5', 'signalColor': '#3fb950', 'signalTextColor': '#ffffff'}}}%%

sequenceDiagram
    autonumber
    
    actor K as 🖥️ Klijent
    participant G as 🌐 Gateway
    participant P as 🛒 Prodaja
    participant S as 📦 Skladište
    participant A as 📊 Analiza
    participant L as 📝 Audit Log

    rect rgb(31, 111, 235, 0.1)
        Note over K,L: 📋 PREGLED KATALOGA
        K->>+G: GET /katalog
        G->>+P: Prosleđivanje zahteva
        P->>L: 📝 INFO: Zahtev za katalog
        P-->>-G: Lista parfema ✅
        G-->>-K: Prikaz kataloga
    end

    rect rgb(35, 134, 54, 0.1)
        Note over K,L: 🛒 KREIRANJE PORUDŽBINE
        K->>+G: POST /porudzbina
        G->>+P: Podaci o porudžbini
        P->>+S: Zahtev za ambalaže
        S->>L: 📝 INFO: Slanje ambalaža
        S-->>-P: Ambalaže ✅
        P->>P: 📦 Raspakivanje
        P->>+A: Podaci za fiskalni račun
        A->>A: 🧾 Kreiranje računa
        A->>L: 📝 INFO: Račun kreiran
        A-->>-P: Fiskalni račun ✅
        P->>L: 📝 INFO: Prodaja završena
        P-->>-G: Potvrda + račun
        G-->>-K: 🎉 Uspešna kupovina
    end
```

</div>

<br/>

<!-- ═══════════════════════════════════════════════════════════════════════════════ -->
## <img src="https://media.giphy.com/media/UVG0BN8TOMKkPOJS6e/giphy.gif" width="30"> &nbsp;Struktura Projekta
<!-- ═══════════════════════════════════════════════════════════════════════════════ -->

```
📦 oib-projekat/
│
├── 🖥️ klijent/                              # Electron Desktop Aplikacija
│   ├── 📂 src/
│   │   ├── 📂 komponente/                   # Vue/React komponente
│   │   │   ├── 📄 Navbar.vue
│   │   │   ├── 📄 Sidebar.vue
│   │   │   └── 📄 ...
│   │   ├── 📂 stranice/                     # Prikazi stranica
│   │   │   ├── 📄 Prijava.vue
│   │   │   ├── 📄 Proizvodnja.vue
│   │   │   ├── 📄 Prerada.vue
│   │   │   └── 📄 ...
│   │   ├── 📂 servisi/                      # API servisi
│   │   │   ├── 📄 AuthServis.js
│   │   │   ├── 📄 KorisnikServis.js
│   │   │   └── 📄 ...
│   │   └── 📂 pomocnici/                    # Utility funkcije
│   ├── 📄 main.js                           # Electron main process
│   ├── 📄 preload.js                        # Preload script
│   └── 📄 package.json
│
├── ⚙️ servisi/
│   ├── 📂 gateway/                          # 🌐 API Gateway
│   │   ├── 📂 src/
│   │   │   ├── 📂 middleware/
│   │   │   │   ├── 📄 auth.middleware.js
│   │   │   │   └── 📄 cors.middleware.js
│   │   │   ├── 📂 routes/
│   │   │   └── 📄 index.js
│   │   └── 📄 package.json
│   │
│   ├── 📂 autentifikacija/                  # 🔐 Auth Servis
│   │   ├── 📂 src/
│   │   │   ├── 📂 controllers/
│   │   │   ├── 📂 services/
│   │   │   └── 📂 entities/
│   │   └── 📄 package.json
│   │
│   ├── 📂 korisnici/                        # 👤 User Servis
│   ├── 📂 proizvodnja/                      # 🌱 Production Servis
│   ├── 📂 prerada/                          # ⚗️ Processing Servis
│   ├── 📂 skladistenje/                     # 📦 Storage Servis
│   ├── 📂 prodaja/                          # 🛒 Sales Servis
│   ├── 📂 analiza-podataka/                 # 📊 Analytics Servis
│   ├── 📂 analiza-performansi/              # ⚡ Performance Servis
│   └── 📂 evidencija/                       # 📝 Audit Servis
│
├── 📂 deljeno/                              # Zajednički kod
│   ├── 📂 entiteti/                         # TypeORM entiteti
│   ├── 📂 interfejsi/                       # TypeScript interfejsi
│   ├── 📂 dto/                              # Data Transfer Objects
│   └── 📂 konstante/                        # Konstante i enumi
│
├── 📂 baza/
│   └── 📄 init.sql                          # Inicijalni podaci
│
├── 🐳 docker-compose.yml                    # Docker konfiguracija
├── ⚙️ .env.example                          # Primer env fajla
├── 📖 README.md                             # Dokumentacija
└── 📄 package.json                          # Root package.json
```

<br/>

<!-- ═══════════════════════════════════════════════════════════════════════════════ -->
## <img src="https://media.giphy.com/media/jSKBmKkvo2dPQQtsR1/giphy.gif" width="30"> &nbsp;Konfiguracija
<!-- ═══════════════════════════════════════════════════════════════════════════════ -->

<table>
<tr>
<td>

### 🗄️ Baza Podataka
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=oib_projekat
```

</td>
<td>

### 🔐 JWT Konfiguracija
```env
JWT_SECRET=super_tajna_vrednost
JWT_EXPIRATION=30m
JWT_REFRESH_EXPIRATION=7d
```

</td>
</tr>
<tr>
<td>

### 🌐 Gateway
```env
GATEWAY_PORT=3000
GATEWAY_HOST=localhost
```

</td>
<td>

### 🛡️ CORS
```env
ALLOWED_ORIGINS=http://localhost:3000
ALLOWED_METHODS=GET,POST,PUT,DELETE
ALLOWED_HEADERS=Content-Type,Authorization
```

</td>
</tr>
</table>

**URL adrese mikroservisa:**
```env
AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
PRODUCTION_SERVICE_URL=http://localhost:3003
PROCESSING_SERVICE_URL=http://localhost:3004
STORAGE_SERVICE_URL=http://localhost:3005
SALES_SERVICE_URL=http://localhost:3006
ANALYTICS_SERVICE_URL=http://localhost:3007
PERFORMANCE_SERVICE_URL=http://localhost:3008
AUDIT_SERVICE_URL=http://localhost:3009
```

<br/>

<!-- ═══════════════════════════════════════════════════════════════════════════════ -->
## <img src="https://media.giphy.com/media/QssGEmpkyEOhBCb7e1/giphy.gif" width="30"> &nbsp;Pokretanje Projekta
<!-- ═══════════════════════════════════════════════════════════════════════════════ -->

```bash
# 📥 1. Kloniranje repozitorijuma
git clone https://github.com/username/oib-projekat.git
cd oib-projekat

# 📦 2. Instalacija zavisnosti
npm install

# ⚙️ 3. Konfiguracija environment varijabli
cp .env.example .env
# Urediti .env fajl sa odgovarajućim vrednostima

# 🐳 4. Pokretanje MySQL baze (Docker)
docker-compose up -d mysql

# ⏳ 5. Sačekati da se baza pokrene, zatim pokrenuti migracije
npm run migration:run

# 🚀 6. Pokretanje svih mikroservisa
npm run start:services

# 🖥️ 7. Pokretanje Electron klijenta
npm run start:client
```

<br/>

<!-- ═══════════════════════════════════════════════════════════════════════════════ -->
## <img src="https://media.giphy.com/media/cj87CxfRtrUifF3Ris/giphy.gif" width="30"> &nbsp;Tehničke Napomene
<!-- ═══════════════════════════════════════════════════════════════════════════════ -->

| # | 📋 Napomena | ✅ Status |
|:---:|:---|:---:|
| 1 | Klijentska aplikacija koristi **Electron** sa **Vite.js** | ✅ |
| 2 | Samo **Gateway** je javno dostupan klijentskoj aplikaciji | ✅ |
| 3 | Svaki mikroservis ima **sopstvenu bazu** podataka | ✅ |
| 4 | Obavezna primena **SOLID** principa i čiste arhitekture | ✅ |
| 5 | Sve lozinke se **heširaju** pre čuvanja u bazi | ✅ |
| 6 | Rad sa bazom koristi **TypeORM** | ✅ |
| 7 | Klijentska aplikacija koristi **injektovane servise** | ✅ |
| 8 | Sve rute su **zaštićene** od neovlašćenog pristupa | ✅ |
| 9 | Baza podataka: **MySQL** | ✅ |
| 10 | Konfiguracija se čuva u **.env** fajlovima | ✅ |
| 11 | **CORS** mora biti precizno podešen za svaki servis | ✅ |
| 12 | Projekat mora imati **inicijalne testne podatke** | ✅ |

<br/>

<!-- ═══════════════════════════════════════════════════════════════════════════════ -->
## <img src="https://media.giphy.com/media/W5eoZHPpUx9sapR0eu/giphy.gif" width="30"> &nbsp;Statistika Projekta
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
<img src="https://img.shields.io/badge/📋_Entiteta-7-f78166?style=for-the-badge" alt="Entities"/>
</td>
</tr>
</table>

<br/>

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                                                                                  ║
║   🔐 AUTENTIFIKACIJA    →    🌐 GATEWAY    →    ⚙️ MIKROSERVISI    →    🗄️ BAZE   ║
║                                                                                  ║
║        JWT Tokeni              Rutiranje           SOLID Principi        MySQL   ║
║        Heširanje               CORS                TypeORM               8 baza  ║
║        Sesije                  Auth Check          Clean Architecture            ║
║                                                                                  ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

</div>

<br/>

---

<div align="center">

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

<br/>

<!-- Footer -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0d1117,25:161b22,50:1f6feb,75:238636,100:8957e5&height=150&section=footer&animation=twinkling" width="100%"/>

<br/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=18&duration=3000&pause=1000&color=58A6FF&center=true&vCenter=true&width=600&lines=🎓+Osnove+Informacione+Bezbednosti;📅+Školska+Godina+2025/2026;🔐+Hvala+na+pažnji!" alt="Footer Typing" />

</div>