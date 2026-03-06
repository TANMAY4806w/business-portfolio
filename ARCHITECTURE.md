# 🏗 Architecture & Flow Diagrams

## System Architecture

```mermaid
graph TB
    subgraph Client["🖥 Frontend (React + Vite)"]
        UI[Pages & Components]
        CTX[AuthContext]
        API[Axios API Service]
        SOCK_C[Socket.io Client]
    end

    subgraph Server["⚙️ Backend (Node.js + Express)"]
        MW[Auth Middleware]
        RT[Routes]
        CTRL[Controllers]
        SOCK_S[Socket.io Server]
    end

    subgraph Database["🗄 MongoDB Atlas"]
        USERS[(Users)]
        BP[(BusinessProfiles)]
        SVC[(Services)]
        HR[(HireRequests)]
        MSG[(Messages)]
        REV[(Reviews)]
    end

    UI --> CTX
    UI --> API
    UI --> SOCK_C
    API -->|HTTP REST| MW
    SOCK_C -->|WebSocket| SOCK_S
    MW --> RT --> CTRL
    CTRL --> USERS
    CTRL --> BP
    CTRL --> SVC
    CTRL --> HR
    CTRL --> REV
    SOCK_S --> MSG
    SOCK_S --> HR
```

---

## Request Flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant V as Vite Proxy
    participant E as Express Server
    participant M as MongoDB

    B->>V: GET /api/services
    V->>E: Proxy to localhost:5000
    E->>M: Service.find()
    M-->>E: Service documents
    E-->>V: JSON response
    V-->>B: Render service cards
```

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant R as React App
    participant A as /api/auth
    participant DB as MongoDB

    U->>R: Fill register form
    R->>A: POST /register {name, email, password, role}
    A->>DB: Create user (password hashed)
    DB-->>A: User document
    A-->>R: {user, token}
    R->>R: Store in localStorage
    R->>R: Set AuthContext
    R-->>U: Redirect to dashboard

    Note over R,A: All subsequent requests include<br/>Authorization: Bearer <token>
```

---

## Hire Request Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Pending: Client clicks "Hire Now"
    Pending --> Accepted: Business accepts
    Pending --> Rejected: Business rejects
    Accepted --> Completed: Business marks done
    Rejected --> [*]

    Accepted --> Chat: Chat unlocked
    Completed --> Review: Client can review
    Completed --> [*]
    Review --> [*]
```

---

## Database Relationships

```mermaid
erDiagram
    USER ||--o| BUSINESS_PROFILE : "has (if role=business)"
    USER ||--o{ SERVICE : "creates (if business)"
    USER ||--o{ HIRE_REQUEST : "sends (if client)"
    USER ||--o{ HIRE_REQUEST : "receives (if business)"
    SERVICE ||--o{ HIRE_REQUEST : "referenced in"
    HIRE_REQUEST ||--o{ MESSAGE : "contains"
    HIRE_REQUEST ||--o| REVIEW : "may have"
    USER ||--o{ REVIEW : "writes (if client)"

    USER {
        string name
        string email
        string password
        string role
    }
    BUSINESS_PROFILE {
        string companyName
        string industry
        string description
        array portfolioProjects
        number averageRating
    }
    SERVICE {
        string title
        string description
        number price
        string deliveryTime
    }
    HIRE_REQUEST {
        string status
        date createdAt
    }
    MESSAGE {
        string text
        date createdAt
    }
    REVIEW {
        number rating
        string reviewText
    }
```

---

## Frontend Route Map

```mermaid
graph LR
    subgraph Public
        HOME["/  Home"]
        LOGIN["/login"]
        REG["/register"]
        BIZ["/business/:userId"]
    end

    subgraph Protected["Protected (Auth Required)"]
        HIRE["/hire-requests"]
        CHAT["/chat/:hireRequestId"]
    end

    subgraph Dashboard["Protected (Business Only)"]
        DASH["/dashboard"]
        PROF["/dashboard/profile"]
        SVCS["/dashboard/services"]
        ADD["/dashboard/add-service"]
    end

    subgraph Error
        NF["/* → 404"]
    end

    HOME --- LOGIN
    HOME --- REG
    HOME --- BIZ
    DASH --- PROF
    DASH --- SVCS
    DASH --- ADD
```

---

## Component Hierarchy

```
App
├── Navbar
├── Routes
│   ├── Home
│   │   ├── SearchFilters
│   │   └── ServiceCard[]
│   ├── Login
│   ├── Register
│   ├── BusinessProfilePublic
│   │   ├── ServiceCard[]
│   │   └── ReviewCard[]
│   ├── BusinessDashboard (ProtectedRoute)
│   │   ├── Sidebar
│   │   ├── ManageProfile
│   │   ├── ManageServices
│   │   └── AddService
│   ├── HireRequests (ProtectedRoute)
│   │   └── StarRating (inline review)
│   ├── Chat (ProtectedRoute)
│   └── NotFound (404)
├── Footer
└── ToastProvider (global notifications)
```
