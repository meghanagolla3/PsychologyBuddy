# Journaling Settings Flow Diagram

## 🎯 Admin Configuration Flow

```mermaid
graph TD
    A[Admin Login] --> B{Role Check}
    B -->|Super Admin| C[Can manage ALL schools]
    B -->|School Admin| D[Can manage OWN school only]
    
    C --> E[Select School or View All]
    D --> F[View Own School Settings]
    
    E --> G[Journaling Config UI]
    F --> G
    
    G --> H[Toggle Writing/Audio/Art]
    G --> I[Configure Audio Settings]
    G --> J[Configure Art Settings]
    G --> K[Manage Prompts]
    
    H --> L[PUT /api/admin/journaling/config]
    I --> L
    J --> L
    K --> M[POST/PUT/DELETE /api/admin/journaling/prompts]
    
    L --> N[Update Database]
    M --> N
    
    N --> O[Show Success Message]
    O --> P[Refresh UI]
```

## 👨‍🎓 Student Access Flow

```mermaid
graph TD
    A[Student Login] --> B[Get School ID]
    B --> C[Load Journaling Options]
    
    C --> D{Check Config}
    D -->|Writing Enabled| E[Show Writing Option]
    D -->|Audio Enabled| F[Show Audio Option]
    D -->|Art Enabled| G[Show Art Option]
    D -->|Disabled| H[Hide Option]
    
    E --> I[Student Clicks Writing]
    F --> J[Student Clicks Audio]
    G --> K[Student Clicks Art]
    
    I --> L[API Call: POST /api/student/journals/writing]
    J --> M[API Call: POST /api/student/journals/audio]
    K --> N[API Call: POST /api/student/journals/art]
    
    L --> O{Server Check}
    M --> O
    N --> O
    
    O -->|Config Enabled| P[Create Journal Entry]
    O -->|Config Disabled| Q[Return 403 Error]
    
    P --> R[Success Response]
    Q --> S[Show Error Message]
    
    R --> T[Update Student UI]
    S --> U[Disable Option in UI]
```

## 🔐 Permission Flow

```mermaid
graph LR
    A[User Request] --> B{Check Role}
    
    B -->|SUPER_ADMIN| C[Full Access]
    B -->|ADMIN| D[Limited Access]
    B -->|STUDENT| E[Student Access]
    
    C --> F[Can manage all schools]
    D --> G[Can manage own school only]
    E --> H[Can only create entries]
    
    F --> I[API: x-user-id + x-school-id optional]
    G --> I
    H --> J[API: x-user-id only]
    
    I --> K[Backend: Role Validation]
    J --> L[Backend: Config Check]
    
    K --> M[Database Operations]
    L --> N[Allow/Deny Access]
```

## 🗄️ Data Flow

```mermaid
sequenceDiagram
    participant Admin as Admin UI
    participant API as Admin API
    participant DB as Database
    participant StudentAPI as Student API
    participant Student as Student UI
    
    Note over Admin,Student: Configuration Phase
    Admin->>API: PUT /api/admin/journaling/config
    API->>DB: Update JournalingToolConfig
    DB-->>API: Success
    API-->>Admin: Success Response
    
    Note over Admin,Student: Student Access Phase
    Student->>StudentAPI: GET journaling options
    StudentAPI->>DB: Get config for schoolId
    DB-->>StudentAPI: Return config
    StudentAPI->>Student: Show enabled options
    
    Note over Admin,Student: Journal Creation Phase
    Student->>StudentAPI: POST /api/student/journals/writing
    StudentAPI->>DB: Check config.enableWriting
    DB-->>StudentAPI: Config status
    alt Writing enabled
        StudentAPI->>DB: Create journal entry
        DB-->>StudentAPI: Success
        StudentAPI-->>Student: Success response
    else Writing disabled
        StudentAPI-->>Student: 403 Error
    end
```

## ⚙️ Configuration State Management

```mermaid
stateDiagram-v2
    [*] --> AdminConfigures
    AdminConfigures --> SettingsSaved: Admin saves settings
    
    SettingsSaved --> DatabaseUpdated: Update DB
    DatabaseUpdated --> StudentAccess: Student tries to access
    
    StudentAccess --> CheckConfig: Verify settings
    CheckConfig --> Enabled: Setting is ON
    CheckConfig --> Disabled: Setting is OFF
    
    Enabled --> CreateEntry: Student can create
    Disabled --> ShowError: Show 403 error
    
    CreateEntry --> Success: Entry created
    ShowError --> [*]
    Success --> [*]
```

## 🎛️ Settings Impact Matrix

| Setting Changed | Admin UI Impact | Student UI Impact | API Impact |
|----------------|-----------------|-------------------|------------|
| `enableWriting` | Toggle switch updates | Writing option appears/disappears | Writing API allows/blocks |
| `enableAudio` | Toggle switch updates | Audio option appears/disappears | Audio API allows/blocks |
| `enableArt` | Toggle switch updates | Art option appears/disappears | Art API allows/blocks |
| `maxAudioDuration` | Dropdown updates | Recording timer limit changes | API validates duration |
| `enableUndo` | Toggle switch updates | Undo button appears/disappears | Canvas tool enabled/disabled |
| `enableRedo` | Toggle switch updates | Redo button appears/disappears | Canvas tool enabled/disabled |
| `enableClearCanvas` | Toggle switch updates | Clear button appears/disappears | Canvas tool enabled/disabled |

## 🔄 Real-time Update Flow (Future)

```mermaid
graph TD
    A[Admin Changes Setting] --> B[WebSocket Event]
    B --> C[Push to School Students]
    C --> D[Student Receives Update]
    D --> E[Update UI Immediately]
    E --> F[Show Notification]
    
    F --> G{Setting Type}
    G -->|Disabled| H[Remove Option]
    G -->|Enabled| I[Add Option]
    G -->|Config Change| J[Update Limits/Tools]
```

This flow ensures complete control for admins while providing a seamless experience for students based on their school's configuration.
