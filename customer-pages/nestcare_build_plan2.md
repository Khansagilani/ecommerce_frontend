# NestCare — Daycare Management Platform
## Complete Build Plan for Coding Agent
**Version:** 2.0  
**Backend:** Python (FastAPI) + PostgreSQL (pgAdmin)  
**Frontend:** React + Vite + Tailwind CSS  
**Database:** postgresql://postgres:khansa1086@localhost:5432/nestcare  
**Audience:** Coding agent / developer — follow this plan top to bottom, in order, no skipping

---

## TABLE OF CONTENTS

1. Project Overview & User Roles
2. Tech Stack (Exact Libraries)
3. Project Folder Structure
4. Database — PostgreSQL Setup
5. Database Schema (Complete SQL)
6. Backend — FastAPI Setup
7. Backend — All API Endpoints
8. Authentication & Authorization
9. Frontend — React + Vite + Tailwind Setup
10. Frontend — Routing & Layouts
11. Frontend — Every Page (Detailed)
12. Real-time (WebSockets)
13. File Uploads (Cloudinary)
14. Environment Variables
15. Build Order (Step-by-Step)
16. Critical Rules (Do Not Skip)
17. Deployment (Production)

---

## 1. PROJECT OVERVIEW & USER ROLES

**App name:** NestCare  
**Purpose:** A full-stack daycare management platform where the child is the center of everything. Staff log a child's entire day. Parents receive live updates. Admins run the center.

### Three user roles — each gets a different dashboard

| Role | What they do |
|---|---|
| **ADMIN** | Manages everything: enroll children, manage staff, run billing, view reports, send announcements |
| **STAFF** | Check children in/out, fill daily logs (meals, naps, activities, diapers), upload photos/videos, message parents |
| **PARENT** | View their child's live daily feed, photos, messages from staff, invoices. One parent can have multiple children enrolled |

### Core business rules
- One center has many children, many staff, many parents
- One parent can be linked to many children (siblings)
- Each child has a complete personal care profile: food preferences, allergies, medications, nap routines, fears, favorite activities, emotional support plan
- Staff fill daily logs; those logs instantly appear in the parent's feed via WebSocket
- All data is scoped to a center — no data leaks between centers

---

## 2. TECH STACK (EXACT LIBRARIES)

### Backend
```
Python 3.11+
FastAPI                  # Web framework
uvicorn[standard]        # ASGI server
SQLAlchemy 2.0           # ORM
alembic                  # Database migrations
psycopg2-binary          # PostgreSQL driver
python-jose[cryptography] # JWT tokens
passlib[bcrypt]          # Password hashing
python-multipart         # File upload support
cloudinary               # Media storage SDK
python-dotenv            # Load .env file
pydantic[email]          # Data validation (comes with FastAPI)
fastapi-mail             # Email sending
websockets               # WebSocket support (built into FastAPI)
```

Install all at once:
```bash
pip install fastapi uvicorn[standard] sqlalchemy alembic psycopg2-binary "python-jose[cryptography]" "passlib[bcrypt]" python-multipart cloudinary python-dotenv "pydantic[email]" fastapi-mail
```

### Frontend
```
React 18
Vite
Tailwind CSS
React Router v6          # Routing
Axios                    # HTTP client
Zustand                  # Global state (auth, socket)
@tanstack/react-query    # Server state, caching, refetch
React Hook Form          # Forms
Zod + @hookform/resolvers/zod  # Form validation
socket.io-client         # WebSocket client
Lucide React             # Icons
date-fns                 # Date formatting
react-hot-toast          # Toast notifications
recharts                 # Charts (admin dashboard)
jsQR                     # QR code scanning (attendance)
```

Install frontend:
```bash
npm create vite@latest nestcare-frontend -- --template react
cd nestcare-frontend
npm install react-router-dom axios zustand @tanstack/react-query react-hook-form zod @hookform/resolvers socket.io-client lucide-react date-fns react-hot-toast recharts jsqr
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Database
- PostgreSQL (managed via pgAdmin)
- Connection string: `postgresql://postgres:khansa1086@localhost:5432/nestcare`
- Create the database named `nestcare` in pgAdmin before running the app
- Use Alembic for all schema migrations — never edit tables manually in pgAdmin after initial setup

---

## 3. PROJECT FOLDER STRUCTURE

```
nestcare/
│
├── backend/
│   ├── main.py                        # FastAPI app entry point
│   ├── .env                           # Environment variables
│   ├── requirements.txt               # All Python dependencies
│   │
│   ├── alembic/                       # Database migrations
│   │   ├── env.py
│   │   └── versions/                  # Auto-generated migration files
│   ├── alembic.ini
│   │
│   ├── app/
│   │   ├── database.py                # SQLAlchemy engine + session
│   │   ├── models/                    # SQLAlchemy ORM models (one file per domain)
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── child.py
│   │   │   ├── child_profile.py       # personality, routines, development
│   │   │   ├── food.py
│   │   │   ├── health.py
│   │   │   ├── daily_log.py
│   │   │   ├── attendance.py
│   │   │   ├── media.py
│   │   │   ├── messaging.py
│   │   │   ├── billing.py
│   │   │   └── compliance.py
│   │   │
│   │   ├── schemas/                   # Pydantic schemas (request/response)
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   ├── child.py
│   │   │   ├── food.py
│   │   │   ├── health.py
│   │   │   ├── daily_log.py
│   │   │   ├── attendance.py
│   │   │   ├── media.py
│   │   │   ├── messaging.py
│   │   │   └── billing.py
│   │   │
│   │   ├── routers/                   # FastAPI routers (one per domain)
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── children.py
│   │   │   ├── child_profile.py
│   │   │   ├── food.py
│   │   │   ├── health.py
│   │   │   ├── daily_logs.py
│   │   │   ├── attendance.py
│   │   │   ├── media.py
│   │   │   ├── messaging.py
│   │   │   ├── billing.py
│   │   │   ├── staff.py
│   │   │   ├── parents.py
│   │   │   └── reports.py
│   │   │
│   │   ├── services/                  # Business logic (called by routers)
│   │   │   ├── auth_service.py
│   │   │   ├── child_service.py
│   │   │   ├── daily_log_service.py
│   │   │   ├── billing_service.py
│   │   │   ├── media_service.py
│   │   │   └── notification_service.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py              # Settings loaded from .env
│   │   │   ├── security.py            # JWT creation/verification, password hashing
│   │   │   ├── dependencies.py        # FastAPI Depends() functions
│   │   │   └── websocket_manager.py   # WebSocket connection manager
│   │   │
│   │   └── utils/
│   │       ├── response.py            # Standardized API response helper
│   │       └── pagination.py          # Pagination helper
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env
    ├── public/
    └── src/
        ├── main.jsx
        ├── App.jsx                    # All routes defined here
        │
        ├── api/                       # Axios call functions (one per domain)
        │   ├── client.js              # Axios instance + interceptors
        │   ├── auth.api.js
        │   ├── children.api.js
        │   ├── dailyLogs.api.js
        │   ├── health.api.js
        │   ├── food.api.js
        │   ├── attendance.api.js
        │   ├── messaging.api.js
        │   ├── billing.api.js
        │   └── reports.api.js
        │
        ├── store/
        │   ├── authStore.js           # Zustand — current user + token
        │   └── socketStore.js         # Zustand — socket connection instance
        │
        ├── hooks/
        │   ├── useAuth.js             # Auth helpers
        │   ├── useSocket.js           # Socket connection + event listeners
        │   └── useChildren.js         # React Query — fetch children
        │
        ├── layouts/
        │   ├── AdminLayout.jsx        # Sidebar + topbar for admin
        │   ├── StaffLayout.jsx        # Sidebar + topbar for staff
        │   └── ParentLayout.jsx       # Bottom nav + topbar for parent (mobile-first)
        │
        ├── components/
        │   ├── shared/                # Used across all roles
        │   │   ├── ProtectedRoute.jsx
        │   │   ├── AllergyBanner.jsx  # Red banner shown whenever a child is displayed
        │   │   ├── ChildAvatar.jsx
        │   │   ├── MoodBadge.jsx
        │   │   ├── TimelineEntry.jsx
        │   │   ├── MediaCard.jsx
        │   │   └── LoadingSkeleton.jsx
        │   ├── admin/
        │   ├── staff/
        │   └── parent/
        │
        └── pages/
            ├── auth/
            │   ├── Login.jsx
            │   └── ForgotPassword.jsx
            ├── admin/
            │   ├── Dashboard.jsx
            │   ├── Children.jsx
            │   ├── ChildDetail.jsx
            │   ├── Staff.jsx
            │   ├── Billing.jsx
            │   ├── Reports.jsx
            │   └── Settings.jsx
            ├── staff/
            │   ├── Dashboard.jsx
            │   ├── Attendance.jsx
            │   ├── DailyLog.jsx
            │   ├── ChildProfile.jsx
            │   └── Messages.jsx
            └── parent/
                ├── Dashboard.jsx
                ├── ChildFeed.jsx
                ├── ChildProfile.jsx
                ├── Messages.jsx
                └── Invoices.jsx
```

---

## 4. DATABASE — POSTGRESQL SETUP

### Step 1: Create the database in pgAdmin
1. Open pgAdmin
2. Right-click "Databases" → Create → Database
3. Name it: `nestcare`
4. Owner: `postgres`
5. Save

### Step 2: Connection string
Use this exact connection string everywhere:
```
postgresql://postgres:khansa1086@localhost:5432/nestcare
```

### Step 3: SQLAlchemy engine (`app/database.py`)
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Step 4: Config (`app/core/config.py`)
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:khansa1086@localhost:5432/nestcare"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"

settings = Settings()
```

---

## 5. DATABASE SCHEMA (COMPLETE SQL)

Run this SQL in pgAdmin Query Tool on the `nestcare` database, OR let Alembic generate it from SQLAlchemy models. The SQL below is the ground truth — every table, every column, every constraint.

```sql
-- ─────────────────────────────────
-- ENUMS
-- ─────────────────────────────────

CREATE TYPE user_role AS ENUM ('ADMIN', 'STAFF', 'PARENT');
CREATE TYPE gender_type AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE child_status AS ENUM ('ACTIVE', 'INACTIVE', 'WAITLISTED', 'GRADUATED');
CREATE TYPE feeding_method AS ENUM ('BOTTLE_FORMULA', 'BOTTLE_BREAST_MILK', 'BREASTFED', 'SOLID_FOODS', 'MIXED');
CREATE TYPE food_preference_type AS ENUM ('LOVES', 'LIKES', 'DISLIKES', 'REFUSES', 'ALLERGIC');
CREATE TYPE food_texture AS ENUM ('PUREE', 'MASHED', 'SOFT_LUMPS', 'CHOPPED', 'FINGER_FOODS', 'REGULAR');
CREATE TYPE allergen_severity AS ENUM ('MILD', 'MODERATE', 'SEVERE', 'ANAPHYLACTIC');
CREATE TYPE dietary_restriction_type AS ENUM ('VEGETARIAN', 'VEGAN', 'HALAL', 'KOSHER', 'GLUTEN_FREE', 'DAIRY_FREE', 'NUT_FREE', 'OTHER');
CREATE TYPE meal_type AS ENUM ('MORNING_BOTTLE', 'BREAKFAST', 'MID_MORNING_SNACK', 'LUNCH', 'AFTERNOON_BOTTLE', 'AFTERNOON_SNACK', 'DINNER', 'EVENING_BOTTLE');
CREATE TYPE portion_eaten AS ENUM ('ALL', 'MOST', 'HALF', 'LITTLE', 'NONE', 'REFUSED');
CREATE TYPE nap_quality AS ENUM ('EXCELLENT', 'GOOD', 'RESTLESS', 'REFUSED');
CREATE TYPE diaper_type AS ENUM ('WET', 'DIRTY', 'BOTH', 'DRY');
CREATE TYPE activity_type AS ENUM ('OUTDOOR_PLAY', 'INDOOR_PLAY', 'ARTS_AND_CRAFTS', 'STORY_TIME', 'MUSIC', 'SENSORY_PLAY', 'TUMMY_TIME', 'PHYSICAL_EXERCISE', 'EDUCATIONAL', 'FREE_PLAY', 'SOCIAL_ACTIVITY', 'OTHER');
CREATE TYPE engagement_level AS ENUM ('VERY_ENGAGED', 'ENGAGED', 'NEUTRAL', 'DISENGAGED', 'REFUSED');
CREATE TYPE arrival_mood AS ENUM ('HAPPY', 'NEUTRAL', 'FUSSY', 'CRYING', 'TIRED');
CREATE TYPE mood_type AS ENUM ('VERY_HAPPY', 'HAPPY', 'NEUTRAL', 'FUSSY', 'SAD', 'TIRED', 'SICK');
CREATE TYPE media_type AS ENUM ('PHOTO', 'VIDEO');
CREATE TYPE incident_type AS ENUM ('FALL', 'BITE', 'SCRATCH', 'ALLERGIC_REACTION', 'ILLNESS', 'BEHAVIOURAL', 'OTHER');
CREATE TYPE checkin_method AS ENUM ('QR_CODE', 'PIN', 'MANUAL');
CREATE TYPE conversation_type AS ENUM ('DIRECT', 'GROUP', 'ANNOUNCEMENT');
CREATE TYPE message_type AS ENUM ('TEXT', 'IMAGE', 'DOCUMENT', 'ANNOUNCEMENT');
CREATE TYPE audience_type AS ENUM ('ALL_PARENTS', 'ALL_STAFF', 'SPECIFIC_ROOM', 'INDIVIDUAL');
CREATE TYPE invoice_status AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED');
CREATE TYPE payment_method AS ENUM ('BANK_TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'CHEQUE', 'ONLINE');
CREATE TYPE payment_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
CREATE TYPE billing_cycle AS ENUM ('MONTHLY', 'WEEKLY', 'DAILY');
CREATE TYPE walking_stage AS ENUM ('NOT_WALKING', 'SUPPORTED', 'CRUISING', 'INDEPENDENT');
CREATE TYPE talking_stage AS ENUM ('BABBLING', 'FIRST_WORDS', 'TWO_WORDS', 'SENTENCES', 'FLUENT');
CREATE TYPE toilet_stage AS ENUM ('NOT_STARTED', 'AWARE', 'IN_TRAINING', 'MOSTLY_TRAINED', 'FULLY_TRAINED');
CREATE TYPE feeding_stage AS ENUM ('MILK_ONLY', 'INTRODUCING_SOLIDS', 'MIXED', 'TABLE_FOOD');
CREATE TYPE fear_severity AS ENUM ('MILD', 'MODERATE', 'SEVERE');
CREATE TYPE enthusiasm_level AS ENUM ('LOVES', 'LIKES', 'NEUTRAL');
CREATE TYPE interest_category AS ENUM ('SPORTS', 'ARTS', 'MUSIC', 'ANIMALS', 'VEHICLES', 'NATURE', 'BOOKS', 'TECHNOLOGY', 'DANCE', 'COOKING', 'OTHER');
CREATE TYPE relationship_type AS ENUM ('MOTHER', 'FATHER', 'GRANDMOTHER', 'GRANDFATHER', 'AUNT', 'UNCLE', 'GUARDIAN', 'OTHER');
CREATE TYPE age_group AS ENUM ('NEWBORN', 'INFANT', 'TODDLER', 'PRESCHOOL');
CREATE TYPE cert_status AS ENUM ('VALID', 'EXPIRING_SOON', 'EXPIRED');
CREATE TYPE checklist_status AS ENUM ('PENDING', 'COMPLETED', 'OVERDUE');
CREATE TYPE checklist_frequency AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY');

-- ─────────────────────────────────
-- CORE TABLES
-- ─────────────────────────────────

CREATE TABLE centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    license_number VARCHAR(100),
    capacity INTEGER DEFAULT 50,
    operating_hours VARCHAR(255),
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    role user_role NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    photo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    preferred_language VARCHAR(10) DEFAULT 'en',
    push_notifications BOOLEAN DEFAULT TRUE,
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    age_group age_group NOT NULL,
    max_capacity INTEGER NOT NULL,
    min_age_months INTEGER,
    max_age_months INTEGER,
    is_active BOOLEAN DEFAULT TRUE
);

-- ─────────────────────────────────
-- CHILDREN
-- ─────────────────────────────────

CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender gender_type,
    photo_url TEXT,
    room_name VARCHAR(100),
    status child_status DEFAULT 'ACTIVE',
    enrollment_date DATE NOT NULL,
    exit_date DATE,
    home_language VARCHAR(100),
    religion VARCHAR(100),
    cultural_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE parent_child (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    relationship relationship_type NOT NULL,
    is_primary_contact BOOLEAN DEFAULT FALSE,
    can_pickup BOOLEAN DEFAULT TRUE,
    receives_updates BOOLEAN DEFAULT TRUE,
    receives_invoices BOOLEAN DEFAULT FALSE,
    is_emergency_contact BOOLEAN DEFAULT FALSE,
    contact_priority INTEGER DEFAULT 1,
    UNIQUE(user_id, child_id)
);

CREATE TABLE authorized_pickups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    photo_url TEXT,
    relationship VARCHAR(100),
    id_type VARCHAR(50),
    id_number VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    phone_primary VARCHAR(50) NOT NULL,
    phone_secondary VARCHAR(50),
    contact_order INTEGER DEFAULT 1
);

-- ─────────────────────────────────
-- CHILD PERSONALITY & CARE PROFILE
-- ─────────────────────────────────

CREATE TABLE child_personalities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL UNIQUE REFERENCES children(id) ON DELETE CASCADE,
    favorite_toys TEXT,
    favorite_activities TEXT,
    favorite_sports TEXT,
    favorite_books TEXT,
    favorite_songs TEXT,
    comfort_objects TEXT,
    dislikes TEXT,
    things_that_calm_them TEXT,
    things_that_excite_them TEXT,
    social_style TEXT,
    learning_style TEXT,
    temperament_notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE child_fears (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    fear_description TEXT NOT NULL,
    severity fear_severity DEFAULT 'MILD',
    triggers TEXT,
    coping_strategy TEXT,
    staff_notes TEXT
);

CREATE TABLE child_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    interest_category interest_category NOT NULL,
    specific_interest VARCHAR(255) NOT NULL,
    enthusiasm_level enthusiasm_level DEFAULT 'LIKES',
    notes TEXT
);

CREATE TABLE emotional_support_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL UNIQUE REFERENCES children(id) ON DELETE CASCADE,
    separation_anxiety_notes TEXT,
    calming_techniques TEXT,
    triggers_to_avoid TEXT,
    positive_reinforcements TEXT,
    behavioral_notes TEXT,
    staff_guidance TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE child_routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL UNIQUE REFERENCES children(id) ON DELETE CASCADE,
    usual_wake_time TIME,
    usual_sleep_time TIME,
    nap_duration_minutes INTEGER,
    nap_preferences TEXT,
    bedtime_rituals TEXT,
    morning_mood TEXT,
    potty_training_stage toilet_stage DEFAULT 'NOT_STARTED',
    uses_pacifier BOOLEAN DEFAULT FALSE,
    uses_comfort_blanket BOOLEAN DEFAULT FALSE,
    comfort_blanket_desc TEXT,
    special_routines TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE child_development (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL UNIQUE REFERENCES children(id) ON DELETE CASCADE,
    walking_stage walking_stage DEFAULT 'NOT_WALKING',
    talking_stage talking_stage DEFAULT 'BABBLING',
    feeding_stage feeding_stage DEFAULT 'MILK_ONLY',
    toilet_stage toilet_stage DEFAULT 'NOT_STARTED',
    milestones_achieved TEXT,
    areas_to_support TEXT,
    staff_observations TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────
-- FOOD & FEEDING
-- ─────────────────────────────────

CREATE TABLE child_food_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL UNIQUE REFERENCES children(id) ON DELETE CASCADE,
    feeding_method feeding_method NOT NULL,
    bottle_size_ml INTEGER,
    formula_brand VARCHAR(255),
    breast_milk_notes TEXT,
    feeds_per_day INTEGER,
    meal_schedule TEXT,
    self_feeds BOOLEAN DEFAULT FALSE,
    needs_help_feeding BOOLEAN DEFAULT TRUE,
    utensils_preferred VARCHAR(255),
    cup_type VARCHAR(100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE food_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_profile_id UUID NOT NULL REFERENCES child_food_profiles(id) ON DELETE CASCADE,
    food_name VARCHAR(255) NOT NULL,
    preference_type food_preference_type NOT NULL,
    notes TEXT
);

CREATE TABLE food_textures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_profile_id UUID NOT NULL REFERENCES child_food_profiles(id) ON DELETE CASCADE,
    texture food_texture NOT NULL,
    accepted BOOLEAN NOT NULL,
    notes TEXT
);

CREATE TABLE dietary_restrictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_profile_id UUID NOT NULL REFERENCES child_food_profiles(id) ON DELETE CASCADE,
    restriction_type dietary_restriction_type NOT NULL,
    details TEXT,
    alternatives_provided TEXT
);

CREATE TABLE allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    allergen VARCHAR(255) NOT NULL,
    severity allergen_severity NOT NULL,
    reaction_symptoms TEXT,
    action_required TEXT NOT NULL,
    medication_if_reaction TEXT,
    epipen_required BOOLEAN DEFAULT FALSE,
    epipen_location TEXT,
    parent_notified_on_exposure BOOLEAN DEFAULT TRUE,
    diagnosed_date DATE
);

-- ─────────────────────────────────
-- HEALTH & MEDICAL
-- ─────────────────────────────────

CREATE TABLE health_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL UNIQUE REFERENCES children(id) ON DELETE CASCADE,
    blood_type VARCHAR(10),
    doctor_name VARCHAR(255),
    doctor_phone VARCHAR(50),
    clinic_name VARCHAR(255),
    hospital_preference VARCHAR(255),
    health_insurance_provider VARCHAR(255),
    insurance_number VARCHAR(100),
    has_special_needs BOOLEAN DEFAULT FALSE,
    special_needs_details TEXT,
    chronic_conditions TEXT,
    medical_notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    health_profile_id UUID REFERENCES health_profiles(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    route VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    reason TEXT,
    prescribing_doctor VARCHAR(255),
    storage_instructions TEXT,
    refrigerate BOOLEAN DEFAULT FALSE,
    instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE medication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES users(id),
    administered_at TIMESTAMP WITH TIME ZONE NOT NULL,
    dose_given VARCHAR(100),
    observations TEXT,
    parent_notified BOOLEAN DEFAULT FALSE
);

CREATE TABLE vaccinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    health_profile_id UUID REFERENCES health_profiles(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(255) NOT NULL,
    date_given DATE NOT NULL,
    next_due_date DATE,
    given_by VARCHAR(255),
    is_up_to_date BOOLEAN DEFAULT TRUE,
    notes TEXT
);

CREATE TABLE incident_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES users(id),
    center_id UUID NOT NULL REFERENCES centers(id),
    incident_type incident_type NOT NULL,
    description TEXT NOT NULL,
    action_taken TEXT NOT NULL,
    first_aid_given TEXT,
    doctor_consulted BOOLEAN DEFAULT FALSE,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    parent_notified BOOLEAN DEFAULT FALSE,
    parent_notified_at TIMESTAMP WITH TIME ZONE,
    parent_signed_at TIMESTAMP WITH TIME ZONE,
    parent_signature_url TEXT
);

-- ─────────────────────────────────
-- DAILY LOGS
-- ─────────────────────────────────

CREATE TABLE daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES users(id),
    log_date DATE NOT NULL,
    arrival_mood arrival_mood,
    departure_mood mood_type,
    overall_notes TEXT,
    had_good_day BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(child_id, log_date)
);

CREATE TABLE nap_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_log_id UUID NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES users(id),
    sleep_start TIMESTAMP WITH TIME ZONE NOT NULL,
    sleep_end TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    sleep_quality nap_quality,
    notes TEXT
);

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_log_id UUID NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES users(id),
    activity_type activity_type NOT NULL,
    activity_name VARCHAR(255) NOT NULL,
    description TEXT,
    engagement_level engagement_level,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    staff_notes TEXT
);

CREATE TABLE meal_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_log_id UUID NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES children(id),
    staff_id UUID NOT NULL REFERENCES users(id),
    meal_type meal_type NOT NULL,
    items_served TEXT NOT NULL,
    portion_eaten portion_eaten NOT NULL,
    refused_items TEXT,
    notes TEXT,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE diaper_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_log_id UUID NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES users(id),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    type diaper_type NOT NULL,
    notes TEXT
);

CREATE TABLE potty_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_log_id UUID NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES users(id),
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    successful BOOLEAN NOT NULL,
    notes TEXT
);

CREATE TABLE media_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES users(id),
    daily_log_id UUID REFERENCES daily_logs(id),
    media_type media_type NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    visible_to_parents BOOLEAN DEFAULT TRUE,
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────
-- ATTENDANCE
-- ─────────────────────────────────

CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    center_id UUID NOT NULL REFERENCES centers(id),
    date DATE NOT NULL,
    checkin_at TIMESTAMP WITH TIME ZONE,
    checkin_by VARCHAR(255),
    checkin_method checkin_method,
    checkout_at TIMESTAMP WITH TIME ZONE,
    checkout_by VARCHAR(255),
    late_pickup_alert BOOLEAN DEFAULT FALSE,
    notes TEXT,
    UNIQUE(child_id, date)
);

-- ─────────────────────────────────
-- MESSAGING
-- ─────────────────────────────────

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
    type conversation_type NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE conversation_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(conversation_id, user_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    center_id UUID NOT NULL REFERENCES centers(id),
    body TEXT NOT NULL,
    message_type message_type DEFAULT 'TEXT',
    attachment_url TEXT,
    is_announcement BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE message_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    audience audience_type NOT NULL,
    room_target VARCHAR(100),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────
-- BILLING
-- ─────────────────────────────────

CREATE TABLE fee_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    monthly_amount NUMERIC(10, 2) NOT NULL,
    registration_fee NUMERIC(10, 2),
    sibling_discount BOOLEAN DEFAULT FALSE,
    sibling_discount_pct NUMERIC(5, 2),
    billing_cycle billing_cycle DEFAULT 'MONTHLY'
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    center_id UUID NOT NULL REFERENCES centers(id),
    fee_plan_id UUID REFERENCES fee_plans(id),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    amount_due NUMERIC(10, 2) NOT NULL,
    amount_paid NUMERIC(10, 2) DEFAULT 0,
    due_date DATE NOT NULL,
    status invoice_status DEFAULT 'DRAFT',
    notes TEXT,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method payment_method NOT NULL,
    transaction_ref VARCHAR(255),
    status payment_status DEFAULT 'PENDING',
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────
-- COMPLIANCE & OPERATIONS
-- ─────────────────────────────────

CREATE TABLE staff_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    certification_name VARCHAR(255) NOT NULL,
    issued_by VARCHAR(255),
    issued_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    document_url TEXT,
    status cert_status DEFAULT 'VALID'
);

CREATE TABLE room_ratio_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
    room_name VARCHAR(100) NOT NULL,
    child_count INTEGER NOT NULL,
    staff_count INTEGER NOT NULL,
    ratio NUMERIC(5, 2) NOT NULL,
    within_limit BOOLEAN NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE regulatory_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
    checklist_name VARCHAR(255) NOT NULL,
    frequency checklist_frequency NOT NULL,
    due_date DATE NOT NULL,
    completed_date DATE,
    completed_by UUID REFERENCES users(id),
    status checklist_status DEFAULT 'PENDING',
    notes TEXT
);

CREATE TABLE enrollment_docs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id)
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 6. BACKEND — FASTAPI SETUP

### `main.py` (entry point)
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import (
    auth, children, child_profile, food, health,
    daily_logs, attendance, media, messaging,
    billing, staff, parents, reports
)
from app.core.websocket_manager import router as ws_router

app = FastAPI(title="NestCare API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(children.router, prefix="/api/children", tags=["children"])
app.include_router(child_profile.router, prefix="/api/children", tags=["child-profile"])
app.include_router(food.router, prefix="/api/children", tags=["food"])
app.include_router(health.router, prefix="/api/children", tags=["health"])
app.include_router(daily_logs.router, prefix="/api", tags=["daily-logs"])
app.include_router(attendance.router, prefix="/api/attendance", tags=["attendance"])
app.include_router(media.router, prefix="/api/media", tags=["media"])
app.include_router(messaging.router, prefix="/api", tags=["messaging"])
app.include_router(billing.router, prefix="/api", tags=["billing"])
app.include_router(staff.router, prefix="/api/staff", tags=["staff"])
app.include_router(parents.router, prefix="/api/parents", tags=["parents"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(ws_router)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
```

### Run command
```bash
cd backend
uvicorn main:app --reload --port 8000
```

### Standard API response format
Every endpoint must return this exact shape. Create a helper `app/utils/response.py`:

```python
from typing import Any, Optional

def success_response(data: Any, message: str = "", pagination: dict = None):
    response = {"success": True, "data": data}
    if message:
        response["message"] = message
    if pagination:
        response["pagination"] = pagination
    return response

def error_response(message: str, code: str = "ERROR", details: list = None):
    return {
        "success": False,
        "error": {
            "code": code,
            "message": message,
            "details": details or []
        }
    }
```

### Pagination helper `app/utils/pagination.py`
```python
def paginate(query, page: int = 1, limit: int = 20):
    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()
    return items, {
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": (total + limit - 1) // limit
    }
```

---

## 7. BACKEND — ALL API ENDPOINTS

### Auth (`/api/auth`)
```
POST   /api/auth/login                  Body: { email, password }
POST   /api/auth/refresh                Cookie: refresh_token
POST   /api/auth/logout                 Auth required
POST   /api/auth/forgot-password        Body: { email }
POST   /api/auth/reset-password         Body: { token, new_password }
GET    /api/auth/me                     Auth required
PUT    /api/auth/change-password        Auth required, Body: { old_password, new_password }
```

### Children (`/api/children`)
```
GET    /api/children                    Roles: ADMIN, STAFF    Query: ?page=1&limit=20&room=&status=
POST   /api/children                    Roles: ADMIN
GET    /api/children/{child_id}         Roles: ADMIN, STAFF, PARENT(own only)
PUT    /api/children/{child_id}         Roles: ADMIN
DELETE /api/children/{child_id}         Roles: ADMIN
```

### Child Profile sub-resources (`/api/children/{child_id}/...`)
```
GET/PUT  /api/children/{child_id}/personality
GET/PUT  /api/children/{child_id}/routines
GET/PUT  /api/children/{child_id}/development
GET/PUT  /api/children/{child_id}/emotional-plan

GET      /api/children/{child_id}/fears
POST     /api/children/{child_id}/fears
DELETE   /api/children/{child_id}/fears/{fear_id}

GET      /api/children/{child_id}/interests
POST     /api/children/{child_id}/interests
DELETE   /api/children/{child_id}/interests/{interest_id}

GET      /api/children/{child_id}/authorized-pickups
POST     /api/children/{child_id}/authorized-pickups
DELETE   /api/children/{child_id}/authorized-pickups/{pickup_id}

GET      /api/children/{child_id}/emergency-contacts
POST     /api/children/{child_id}/emergency-contacts
DELETE   /api/children/{child_id}/emergency-contacts/{contact_id}
```

### Food & Feeding
```
GET/PUT  /api/children/{child_id}/food-profile
GET      /api/children/{child_id}/food-preferences
POST     /api/children/{child_id}/food-preferences
DELETE   /api/children/{child_id}/food-preferences/{pref_id}

GET      /api/children/{child_id}/allergies
POST     /api/children/{child_id}/allergies
PUT      /api/children/{child_id}/allergies/{allergy_id}
DELETE   /api/children/{child_id}/allergies/{allergy_id}

GET      /api/children/{child_id}/dietary-restrictions
POST     /api/children/{child_id}/dietary-restrictions
DELETE   /api/children/{child_id}/dietary-restrictions/{restriction_id}
```

### Health
```
GET/PUT  /api/children/{child_id}/health

GET      /api/children/{child_id}/medications
POST     /api/children/{child_id}/medications
PUT      /api/children/{child_id}/medications/{med_id}
DELETE   /api/children/{child_id}/medications/{med_id}
POST     /api/medications/{med_id}/logs
GET      /api/medications/{med_id}/logs

GET      /api/children/{child_id}/vaccinations
POST     /api/children/{child_id}/vaccinations

GET      /api/children/{child_id}/incidents
POST     /api/children/{child_id}/incidents          Roles: STAFF
PUT      /api/children/{child_id}/incidents/{incident_id}/sign   Roles: PARENT (e-signature)
```

### Daily Logs
```
GET    /api/children/{child_id}/daily-logs           Query: ?page=1&date=
POST   /api/children/{child_id}/daily-logs           Roles: STAFF
GET    /api/children/{child_id}/daily-logs/{log_id}  Roles: ALL

POST   /api/daily-logs/{log_id}/naps                 Roles: STAFF
PUT    /api/daily-logs/{log_id}/naps/{nap_id}        Roles: STAFF

POST   /api/daily-logs/{log_id}/meals                Roles: STAFF
PUT    /api/daily-logs/{log_id}/meals/{meal_id}      Roles: STAFF

POST   /api/daily-logs/{log_id}/activities           Roles: STAFF
POST   /api/daily-logs/{log_id}/diapers              Roles: STAFF
POST   /api/daily-logs/{log_id}/potty                Roles: STAFF
```

### Attendance
```
GET    /api/attendance                               Roles: ADMIN, STAFF   Query: ?date=today
GET    /api/attendance/today                         Roles: ADMIN, STAFF
GET    /api/children/{child_id}/attendance           Roles: ALL
POST   /api/attendance/checkin                       Roles: STAFF   Body: { child_id, method, pin_or_qr }
PUT    /api/attendance/{attendance_id}/checkout      Roles: STAFF   Body: { checkout_by }
```

### Media
```
POST   /api/media/upload                             Roles: STAFF   Multipart: file, child_id, caption, daily_log_id
GET    /api/children/{child_id}/media                Roles: ALL     Query: ?page=1
DELETE /api/media/{media_id}                         Roles: STAFF, ADMIN
```

### Messaging
```
GET    /api/conversations                            Roles: ALL
POST   /api/conversations                            Roles: ALL
GET    /api/conversations/{conv_id}/messages         Roles: Members only
POST   /api/conversations/{conv_id}/messages         Roles: Members only
PUT    /api/conversations/{conv_id}/read             Roles: Members only

GET    /api/announcements                            Roles: ALL
POST   /api/announcements                            Roles: ADMIN, STAFF
```

### Billing
```
GET    /api/fee-plans                                Roles: ADMIN
POST   /api/fee-plans                                Roles: ADMIN
PUT    /api/fee-plans/{plan_id}                      Roles: ADMIN

GET    /api/invoices                                 Roles: ADMIN       Query: ?status=&page=
POST   /api/invoices                                 Roles: ADMIN
GET    /api/invoices/{invoice_id}                    Roles: ADMIN, PARENT(own)
POST   /api/invoices/generate-batch                  Roles: ADMIN       Body: { month, year }
POST   /api/invoices/{invoice_id}/payments           Roles: ADMIN
GET    /api/children/{child_id}/invoices             Roles: ADMIN, PARENT
```

### Staff
```
GET    /api/staff                                    Roles: ADMIN
POST   /api/staff                                    Roles: ADMIN   (creates user + sends setup email)
PUT    /api/staff/{user_id}                          Roles: ADMIN
DELETE /api/staff/{user_id}                          Roles: ADMIN
GET    /api/staff/{user_id}/certifications           Roles: ADMIN
POST   /api/staff/{user_id}/certifications           Roles: ADMIN
```

### Parents
```
GET    /api/parents                                  Roles: ADMIN
POST   /api/parents                                  Roles: ADMIN
PUT    /api/parents/{user_id}                        Roles: ADMIN
POST   /api/parents/{user_id}/link-child             Roles: ADMIN   Body: { child_id, relationship }
```

### Reports
```
GET    /api/reports/attendance-summary               Roles: ADMIN   Query: ?start_date=&end_date=
GET    /api/reports/room-ratios                      Roles: ADMIN
GET    /api/reports/billing-summary                  Roles: ADMIN   Query: ?month=&year=
GET    /api/reports/incident-summary                 Roles: ADMIN
GET    /api/reports/enrollment                       Roles: ADMIN
GET    /api/compliance/checklists                    Roles: ADMIN
POST   /api/compliance/checklists                    Roles: ADMIN
PUT    /api/compliance/checklists/{id}               Roles: ADMIN
```

### WebSocket
```
WS     /ws/{center_id}?token={access_token}
```

---

## 8. AUTHENTICATION & AUTHORIZATION

### JWT Strategy
- On login: generate `access_token` (expires 15 min) + `refresh_token` (expires 7 days)
- Return `access_token` in JSON response body
- Return `refresh_token` as an **httpOnly cookie** (not accessible to JavaScript)
- Frontend stores `access_token` in Zustand memory only — never in localStorage
- When access token expires, frontend silently calls `POST /api/auth/refresh` using the cookie

### `app/core/security.py`
```python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
```

### `app/core/dependencies.py`
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.core.security import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def require_roles(roles: list[str]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role.value not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

# Shortcut dependencies
get_admin = require_roles(["ADMIN"])
get_admin_or_staff = require_roles(["ADMIN", "STAFF"])
get_any_role = require_roles(["ADMIN", "STAFF", "PARENT"])
```

### Parent data isolation rule
In every service function that a PARENT calls, always verify the parent is linked to the child:
```python
def verify_parent_owns_child(db: Session, user_id: str, child_id: str):
    link = db.query(ParentChild).filter(
        ParentChild.user_id == user_id,
        ParentChild.child_id == child_id
    ).first()
    if not link:
        raise HTTPException(status_code=403, detail="Access denied")
```

### Center isolation rule
Inject `center_id` from `current_user.center_id` into every DB query. Never take `center_id` from request body.

---

## 9. FRONTEND — REACT + VITE + TAILWIND SETUP

### `tailwind.config.js`
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        brand: '#1D9E75',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### `src/api/client.js` — Axios instance with interceptors
```js
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // send httpOnly cookie on every request
})

// Attach access token to every request
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401: try refresh, then retry original request once
let isRefreshing = false
let failedQueue = []

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return client(original)
        })
      }
      original._retry = true
      isRefreshing = true
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        const newToken = data.data.access_token
        useAuthStore.getState().setAccessToken(newToken)
        failedQueue.forEach((p) => p.resolve(newToken))
        failedQueue = []
        original.headers.Authorization = `Bearer ${newToken}`
        return client(original)
      } catch {
        failedQueue.forEach((p) => p.reject())
        failedQueue = []
        useAuthStore.getState().logout()
        window.location.href = '/login'
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default client
```

### `src/store/authStore.js`
```js
import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  setAuth: (user, token) => set({ user, accessToken: token }),
  setAccessToken: (token) => set({ accessToken: token }),
  logout: () => set({ user: null, accessToken: null }),
}))
```

---

## 10. FRONTEND — ROUTING & LAYOUTS

### `src/App.jsx` — complete route structure
```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/shared/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import StaffLayout from './layouts/StaffLayout'
import ParentLayout from './layouts/ParentLayout'

// Auth pages
import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminChildren from './pages/admin/Children'
import AdminChildDetail from './pages/admin/ChildDetail'
import AdminStaff from './pages/admin/Staff'
import AdminBilling from './pages/admin/Billing'
import AdminReports from './pages/admin/Reports'
import AdminSettings from './pages/admin/Settings'

// Staff pages
import StaffDashboard from './pages/staff/Dashboard'
import StaffAttendance from './pages/staff/Attendance'
import StaffDailyLog from './pages/staff/DailyLog'
import StaffChildProfile from './pages/staff/ChildProfile'
import StaffMessages from './pages/staff/Messages'

// Parent pages
import ParentDashboard from './pages/parent/Dashboard'
import ParentChildFeed from './pages/parent/ChildFeed'
import ParentChildProfile from './pages/parent/ChildProfile'
import ParentMessages from './pages/parent/Messages'
import ParentInvoices from './pages/parent/Invoices'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/children" element={<AdminChildren />} />
            <Route path="/admin/children/:id" element={<AdminChildDetail />} />
            <Route path="/admin/staff" element={<AdminStaff />} />
            <Route path="/admin/billing" element={<AdminBilling />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['STAFF']} />}>
          <Route element={<StaffLayout />}>
            <Route path="/staff" element={<StaffDashboard />} />
            <Route path="/staff/attendance" element={<StaffAttendance />} />
            <Route path="/staff/children/:id" element={<StaffChildProfile />} />
            <Route path="/staff/children/:id/log" element={<StaffDailyLog />} />
            <Route path="/staff/messages" element={<StaffMessages />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['PARENT']} />}>
          <Route element={<ParentLayout />}>
            <Route path="/parent" element={<ParentDashboard />} />
            <Route path="/parent/children/:id" element={<ParentChildFeed />} />
            <Route path="/parent/children/:id/profile" element={<ParentChildProfile />} />
            <Route path="/parent/messages" element={<ParentMessages />} />
            <Route path="/parent/invoices" element={<ParentInvoices />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
```

### `ProtectedRoute.jsx` logic
1. On mount, check `useAuthStore` for `accessToken`
2. If none: call `GET /api/auth/me` with cookie (silent refresh attempt)
3. If that fails: redirect to `/login`
4. If user exists but role not in `allowedRoles`: redirect to their correct dashboard
5. Role → dashboard map: `ADMIN → /admin`, `STAFF → /staff`, `PARENT → /parent`

### Layout structure (all three layouts)
Each layout has:
- A fixed sidebar (desktop) or bottom navigation bar (mobile, parent layout)
- A top bar showing: app logo, current page title, user avatar + dropdown (logout)
- A main content area with `<Outlet />`
- Use Tailwind `lg:` prefix to toggle between mobile and desktop nav

---

## 11. FRONTEND — EVERY PAGE (DETAILED)

### Login Page (`/login`)
- Centered card, NestCare logo at top
- Email input, password input (show/hide toggle)
- "Sign in" button — on submit calls `POST /api/auth/login`
- On success: save user + token to Zustand, redirect based on role
- "Forgot password?" link → `/forgot-password`
- Show clear error message for wrong credentials

---

### Admin Dashboard (`/admin`)
**Top row — 4 stat cards:**
- Total enrolled children (count of ACTIVE children in center)
- Staff on duty today (attendance checkins today with STAFF role)
- Overdue invoices (count of invoices where status = OVERDUE)
- Open incidents (count of incidents where parent_signed_at IS NULL)

**Middle — 2 charts side by side:**
- Left: Bar chart — attendance per day for the past 7 days (Recharts BarChart)
- Right: Horizontal bar chart — room occupancy (current vs max capacity per room)

**Bottom — 2 tables:**
- Left: Recent incidents (last 5) — child name, type, date, status
- Right: Invoices due soon (next 7 days) — child name, amount, due date

---

### Admin Children (`/admin/children`)
- Search bar (search by name)
- Filter dropdown: All rooms / [room names]
- Filter dropdown: All statuses / Active / Waitlisted / Inactive
- Paginated table: avatar, full name, age (computed from DOB), room, status badge, action buttons (View, Edit, Deactivate)
- "Enroll new child" button → opens multi-step modal (4 steps):
  - **Step 1 — Basic info:** first name, last name, date of birth, gender, room (dropdown from rooms list), home language, religion, cultural notes
  - **Step 2 — Parents:** search existing parent users by email. If found, link with relationship type. If not found, create new parent (name + email — they'll get setup email). Can add multiple parents.
  - **Step 3 — Contacts:** add emergency contacts (name, phone, relationship, order). Add authorized pickups (name, phone, relationship, photo upload optional).
  - **Step 4 — Documents:** upload enrollment documents (birth certificate, immunization records, etc.) — each with a document type label.
- After enrollment, redirect to AdminChildDetail for that child.

---

### Admin Child Detail (`/admin/children/:id`)
Tabbed layout with 8 tabs. Tabs are always visible. Content loads for each tab.

**Tab 1 — Profile**
Editable fields: photo upload, name, DOB, gender, room, status, home language, religion, cultural notes. Save button.

**Tab 2 — Care Profile**
Four sub-sections in expandable accordion panels:
- Personality: favorite toys, activities, sports, books, songs, comfort objects, dislikes, calming things, exciting things, social/learning style, temperament
- Routines: wake time, sleep time, nap duration, nap preferences, bedtime rituals, morning mood, potty training stage, pacifier/blanket details
- Development: walking stage, talking stage, feeding stage, toilet stage, milestones, areas to support, observations
- Emotional support plan: separation anxiety, calming techniques, triggers to avoid, positive reinforcements, behavioral notes, staff guidance

Plus two separate lists (add/delete items):
- Fears list: description, severity, triggers, coping strategy, staff notes
- Interests list: category, specific interest, enthusiasm level, notes

**Tab 3 — Food & Feeding**
- Food profile form: feeding method, bottle size (if applicable), formula brand, feeds per day, meal schedule, self-feeds toggle, needs help toggle, utensil and cup preferences
- Food preferences list: add food name + preference type (LOVES / LIKES / DISLIKES / REFUSES / ALLERGIC)
- Food textures: for each texture type, accepted yes/no + notes
- Dietary restrictions: add restriction type + details + alternatives
- Allergies list (highlighted in red): allergen, severity, reaction symptoms, action required, epipen required toggle, epipen location

**Tab 4 — Health**
- Health profile form: blood type, doctor info, clinic, hospital preference, insurance, special needs toggle + details, chronic conditions, general notes
- Medications list: add medication (name, dosage, frequency, route, dates, doctor, storage, instructions). Each medication shows its administration log.
- Vaccinations list: add vaccine, date given, next due, is up to date toggle
- Incidents list: shows all incidents for this child with date, type, description, action taken, parent signature status

**Tab 5 — Daily Logs**
- Date range filter
- Timeline view: each day is a card showing arrival mood emoji, total nap time, meals (portion eaten per meal), activities count, diaper changes, photo count
- Click a day to expand full detail

**Tab 6 — Media**
- Photo/video gallery grid
- Filterable by date
- Click to open full screen

**Tab 7 — Billing**
- List of all invoices for this child
- Status badge (DRAFT / SENT / PAID / OVERDUE)
- "Generate invoice" button for this child
- Click invoice → see itemized detail + payments made

**Tab 8 — Documents**
- List of uploaded enrollment documents with type label, upload date, verified status
- Upload new document button

---

### Admin Staff (`/admin/staff`)
- List of staff: avatar, name, email, phone, certifications summary (X valid, Y expiring, Z expired)
- "Add staff" button → modal: full name, email, phone. System creates account + sends setup email.
- Click staff → side panel: edit details, view and add certifications (name, issued by, issued date, expiry date, upload document)
- Deactivate button (sets is_active = false)

---

### Admin Billing (`/admin/billing`)
**Fee Plans tab:**
- List of fee plans: name, monthly amount, billing cycle, sibling discount %
- Add/edit fee plan form

**Invoices tab:**
- Filter by status tabs: All / Draft / Sent / Paid / Overdue
- Table: child name, invoice number, amount due, amount paid, due date, status, actions
- "Generate batch invoices" button → modal: pick month + year → calls `POST /api/invoices/generate-batch` → generates one invoice per active child
- Click invoice → drawer with: itemized view, record payment button (amount, method, reference)

---

### Admin Reports (`/admin/reports`)
- Tabs: Attendance / Billing / Incidents / Enrollment / Compliance
- Each tab has date filters and a table + export CSV button
- Compliance tab shows regulatory checklists with status badges, add checklist button, mark complete button

---

### Staff Dashboard (`/staff`)
**Alert bar at top (if any):**
- Red pills for: children with severe allergies checked in today
- Amber pills for: children with medication due today
- Blue pills for: incident reports awaiting parent signature

**Room roster — card grid:**
Each card for a checked-in child shows:
- Child photo + name + age
- Arrival mood emoji
- Red allergy badge if any SEVERE or ANAPHYLACTIC allergies
- Medication due indicator (pill icon with count)
- Quick action buttons: "+ Log entry", "Photo"

**Today's summary:**
- Children checked in: X / Y enrolled
- Naps logged today: X
- Meals logged today: X
- Photos posted today: X

---

### Staff Attendance (`/staff/attendance`)
- Today's date, large and clear
- Two columns: "Expected today" (all active children) vs "Present" (checked in)
- QR Scan button → opens camera overlay using `getUserMedia` + `jsQR` library to decode QR
- Manual entry fallback: type child name or PIN
- On check-in: show a popup with child's allergies and medications before confirming
- On checkout: select who is picking up from the authorized_pickups list (show their photo if available), confirm
- Late pickup threshold: if checkout is > 10 minutes after center closing time, auto-set `late_pickup_alert = true` and emit WebSocket event

---

### Staff Daily Log (`/staff/children/:id/log`)
Single scrollable page. Staff fill this throughout the day on a tablet/phone.

**Section 1 — Arrival mood:**
Row of 5 emoji buttons: 😊 Happy / 😐 Neutral / 😤 Fussy / 😢 Crying / 😴 Tired. Tap to select.

**Section 2 — Meals:**
For each meal type relevant to this child's feeding schedule, show a row:
- Meal label (e.g. "Lunch")
- What was served (text input)
- Portion eaten (button row: All / Most / Half / Little / None / Refused)
- Refused items field (appears if portion is not ALL)
- Notes
- "+ Add another meal" button at bottom

**Section 3 — Naps:**
- "Start nap" button → records start time (current time)
- "End nap" button → records end time, auto-calculates duration
- Sleep quality selector: Excellent / Good / Restless / Refused
- Notes field
- Multiple naps can be added

**Section 4 — Diapers / Potty:**
- If child's potty_training_stage is NOT_STARTED or AWARE: show Diaper section
- If IN_TRAINING or beyond: show Potty section
- Diaper: large tap buttons: Wet / Dirty / Both / Dry. Each tap adds a log entry with current time.
- Potty: Successful / Not successful buttons. Each tap adds a log entry.
- Show history of today's logs as a timeline below the buttons

**Section 5 — Activities:**
- "+ Add activity" button → mini form: activity type (dropdown), activity name, description, engagement level, time
- Added activities show as chips/cards, can be removed

**Section 6 — Photos & Videos:**
- "Take photo" → device camera via `<input type="file" accept="image/*" capture="environment">`
- "Upload from gallery" → file picker
- Caption field per upload
- "Visible to parents" toggle (default ON)
- Uploaded files show as thumbnails

**Section 7 — Overall notes & save:**
- Text area for overall day notes
- "Good day?" toggle (default ON)
- Large "Save Daily Log" button at bottom
- On save: POST to create/update daily log + all sub-entries + emit WebSocket event to all parents of this child

**Important:** If a daily log already exists for this child today, pre-populate all fields when the page loads.

---

### Staff Child Profile (`/staff/children/:id`)
Read-only view (staff can edit food/health/personality/routines). Shows:
- Red allergy banner at very top if any SEVERE or ANAPHYLACTIC allergy exists — always visible
- Today's medication schedule
- Tabs: Overview / Food & Allergies / Health / Care Profile / Contacts

---

### Staff Messages (`/staff/messages`)
- Conversation list on left, message thread on right (full screen on mobile)
- Can start new conversation with any parent in the center
- Send text messages + attach images
- Announcements appear as a pinned item at top of conversation list (read-only for receiving staff)

---

### Parent Dashboard (`/parent`)
**Header:** "Good morning, [first name]" — today's date

**Child selector:** If parent has more than one child, show pill tabs. All content below reflects selected child.

**Today's card:**
- If log exists: show arrival mood emoji, total nap time (e.g. "1h 20min"), meals summary (e.g. "Ate most of lunch"), activity count, and photo count
- If no log yet: soft message "Your little one's day is just beginning!"
- Live indicator (green dot) if staff are currently active in the center

**Live feed (real-time timeline):**
- Chronological list of all log entries for today for this child
- Each entry has an icon, time, and description:
  - 🍽 Meal: "Had lunch — ate most. [items served]"
  - 🌙 Nap: "Napped for 45 minutes — quality: Good"
  - ⭐ Activity: "Did arts and crafts — very engaged"
  - 📷 Photo: shows thumbnail inline, tap to open full screen
  - 🚿 Diaper/Potty: "Diaper changed — wet"
- New entries appear at the top without page refresh (WebSocket)
- Unread entries have a subtle highlight that fades after 3 seconds

**Quick links row:**
- Messages button (with unread count badge)
- Next invoice due (amount + days remaining)

---

### Parent Child Feed (`/parent/children/:id`)
Full history timeline. Date picker at top. Filter by entry type (all / meals / naps / activities / photos). Infinite scroll (30 entries per page via React Query `useInfiniteQuery`).

---

### Parent Child Profile (`/parent/children/:id/profile`)
Read-only. Parent sees:
- Basic info (name, DOB, room, enrollment date)
- Personality & interests (what their child loves)
- Routines (nap schedule, morning mood, etc.)
- Food profile (what they eat, textures)
- Allergies list (prominently displayed)
- Health profile (doctor, insurance — they provided this, read-only confirmation)
- Authorized pickups list (can request changes via message)

Note at bottom: "To update this information, please message your child's room staff."

---

### Parent Messages (`/parent/messages`)
- Conversation list + message thread (same as staff messages UI)
- Can send messages to staff/admin only (not to other parents)
- Announcements section: read-only broadcast messages from admin
- Message input: text + image attachment
- Read receipts as grey/green tick marks

---

### Parent Invoices (`/parent/invoices`)
- List of all invoices across all their children
- Group by child (if multiple children)
- Each invoice row: month/year, amount due, amount paid, due date, status badge
- Tap row → expanded view: itemized breakdown, payment history
- "Pay online" button: show bank details or initiate online payment flow
- Overdue invoices highlighted in red

---

## 12. REAL-TIME (WEBSOCKETS)

### Backend WebSocket manager (`app/core/websocket_manager.py`)
```python
from fastapi import WebSocket
from typing import Dict, List

class WebSocketManager:
    def __init__(self):
        # Map center_id → list of (websocket, user_id, role)
        self.connections: Dict[str, List[dict]] = {}

    async def connect(self, websocket: WebSocket, center_id: str, user_id: str, role: str):
        await websocket.accept()
        if center_id not in self.connections:
            self.connections[center_id] = []
        self.connections[center_id].append({
            "ws": websocket, "user_id": user_id, "role": role
        })

    def disconnect(self, websocket: WebSocket, center_id: str):
        if center_id in self.connections:
            self.connections[center_id] = [
                c for c in self.connections[center_id] if c["ws"] != websocket
            ]

    async def broadcast_to_center(self, center_id: str, event: str, data: dict):
        for conn in self.connections.get(center_id, []):
            await conn["ws"].send_json({"event": event, "data": data})

    async def broadcast_to_parents_of_child(self, center_id: str, child_id: str, parent_ids: list, event: str, data: dict):
        for conn in self.connections.get(center_id, []):
            if conn["user_id"] in parent_ids:
                await conn["ws"].send_json({"event": event, "data": data})

    async def broadcast_to_roles(self, center_id: str, roles: list, event: str, data: dict):
        for conn in self.connections.get(center_id, []):
            if conn["role"] in roles:
                await conn["ws"].send_json({"event": event, "data": data})

manager = WebSocketManager()
```

### WebSocket endpoint
```python
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.core.security import decode_token
from app.core.websocket_manager import manager

router = APIRouter()

@router.websocket("/ws/{center_id}")
async def websocket_endpoint(websocket: WebSocket, center_id: str, token: str = Query(...)):
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        role = payload.get("role")
    except:
        await websocket.close(code=1008)
        return
    
    await manager.connect(websocket, center_id, user_id, role)
    try:
        while True:
            data = await websocket.receive_json()
            # Handle client-sent events (typing indicators, read receipts)
    except WebSocketDisconnect:
        manager.disconnect(websocket, center_id)
```

### WebSocket events reference

**Server → Client events (emit these from service functions after DB writes):**

| Event name | Triggered when | Who receives |
|---|---|---|
| `daily_log:updated` | Any sub-entry added to daily log | Parents of that child |
| `media:posted` | Photo/video uploaded | Parents of that child |
| `message:new` | New message in conversation | Conversation members |
| `attendance:checkin` | Child checked in | ADMIN + STAFF in center |
| `attendance:checkout` | Child checked out | ADMIN + STAFF in center |
| `incident:created` | Incident report filed | Parents of that child + ADMIN |
| `invoice:issued` | Invoice generated | Parent linked to that child |
| `announcement:new` | Announcement published | All users in center |

**Client → Server events:**

| Event name | Sent when |
|---|---|
| `message:typing` | User is typing in a conversation |
| `message:read` | User reads a message |

### Frontend WebSocket hook (`src/hooks/useSocket.js`)
```js
import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'

export function useSocket() {
  const { user, accessToken } = useAuthStore()
  const socketRef = useRef(null)

  useEffect(() => {
    if (!user || !accessToken) return

    // Connect to WebSocket
    const ws = new WebSocket(
      `${import.meta.env.VITE_WS_URL}/ws/${user.center_id}?token=${accessToken}`
    )

    ws.onmessage = (event) => {
      const { event: evtName, data } = JSON.parse(event.data)
      // Dispatch to React Query cache invalidation or Zustand
      window.dispatchEvent(new CustomEvent(evtName, { detail: data }))
    }

    socketRef.current = ws
    return () => ws.close()
  }, [user, accessToken])

  return socketRef
}
```

In each page that needs real-time updates, listen for the custom events:
```js
useEffect(() => {
  const handler = (e) => {
    // Invalidate React Query cache to trigger refetch
    queryClient.invalidateQueries(['daily-log', childId])
  }
  window.addEventListener('daily_log:updated', handler)
  return () => window.removeEventListener('daily_log:updated', handler)
}, [childId])
```

---

## 13. FILE UPLOADS (CLOUDINARY)

### Backend — `app/services/media_service.py`
```python
import cloudinary
import cloudinary.uploader
from app.core.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)

def upload_media(file_bytes: bytes, child_id: str, center_id: str, media_type: str) -> dict:
    folder = f"nestcare/{center_id}/{child_id}"
    
    if media_type == "VIDEO":
        result = cloudinary.uploader.upload_large(
            file_bytes,
            folder=folder,
            resource_type="video",
            eager=[{"format": "jpg", "so": "0"}],  # thumbnail at 0 seconds
        )
        return {
            "url": result["secure_url"],
            "thumbnail_url": result["eager"][0]["secure_url"] if result.get("eager") else None,
        }
    else:
        result = cloudinary.uploader.upload(
            file_bytes,
            folder=folder,
            transformation=[
                {"width": 1200, "crop": "limit"},
                {"quality": "auto"},
                {"fetch_format": "auto"},
            ],
        )
        return {"url": result["secure_url"], "thumbnail_url": None}
```

### Media upload endpoint (`app/routers/media.py`)
```python
@router.post("/upload")
async def upload_media(
    file: UploadFile = File(...),
    child_id: str = Form(...),
    caption: str = Form(None),
    daily_log_id: str = Form(None),
    current_user: User = Depends(get_admin_or_staff),
    db: Session = Depends(get_db),
):
    # Validate file size (25MB max)
    MAX_SIZE = 25 * 1024 * 1024
    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(400, "File too large. Max 25MB.")
    
    # Determine type
    media_type = "VIDEO" if file.content_type.startswith("video") else "PHOTO"
    
    # Upload to Cloudinary
    result = upload_media(contents, child_id, current_user.center_id, media_type)
    
    # Save to DB
    post = MediaPost(
        child_id=child_id,
        staff_id=current_user.id,
        daily_log_id=daily_log_id,
        media_type=media_type,
        url=result["url"],
        thumbnail_url=result["thumbnail_url"],
        caption=caption,
    )
    db.add(post)
    db.commit()
    
    # Notify parents via WebSocket
    parent_ids = get_parent_ids_for_child(db, child_id)
    await manager.broadcast_to_parents_of_child(
        current_user.center_id, child_id, parent_ids,
        "media:posted", {"child_id": child_id, "url": result["url"], "caption": caption}
    )
    
    return success_response(post)
```

---

## 14. ENVIRONMENT VARIABLES

### `backend/.env`
```env
DATABASE_URL=postgresql://postgres:khansa1086@localhost:5432/nestcare
SECRET_KEY=generate_a_random_64_character_string_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=http://localhost:5173
```

### `frontend/.env`
```env
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
```

---

## 15. BUILD ORDER (STEP BY STEP)

Follow this sequence exactly. Complete each phase fully before moving to the next.

### Phase 1 — Database setup
1. Open pgAdmin, create database named `nestcare`
2. Open Query Tool on `nestcare` database
3. Run the full SQL from Section 5 — creates all enums and all tables
4. Verify all 40+ tables appear in pgAdmin under nestcare → Schemas → public → Tables

### Phase 2 — Backend project init
5. Create `backend/` folder
6. Create virtual environment: `python -m venv venv` → activate it
7. Install all dependencies from Section 2
8. Create `requirements.txt`: `pip freeze > requirements.txt`
9. Create all folders: `app/models/`, `app/schemas/`, `app/routers/`, `app/services/`, `app/core/`, `app/utils/`
10. Write `app/database.py` (SQLAlchemy engine + get_db)
11. Write `app/core/config.py` (Settings class)
12. Write `backend/.env` with all values from Section 14
13. Write `app/utils/response.py` and `app/utils/pagination.py`
14. Write `app/core/security.py` (JWT + bcrypt)
15. Write `app/core/dependencies.py` (get_current_user, require_roles)
16. Write `app/core/websocket_manager.py`
17. Write all SQLAlchemy models in `app/models/` matching the SQL schema from Section 5
18. Write `main.py` entry point
19. Run `uvicorn main:app --reload --port 8000` — confirm FastAPI starts and `/api/health` returns `{"status": "ok"}`

### Phase 3 — Auth module
20. Write `app/schemas/auth.py` (LoginRequest, TokenResponse, etc.)
21. Write `app/routers/auth.py` (all auth endpoints)
22. Write `app/services/auth_service.py`
23. Test with Swagger UI at `http://localhost:8000/docs`:
    - Create a center and admin user manually in pgAdmin
    - Test `POST /api/auth/login` with that admin's email/password
    - Confirm access_token returned

### Phase 4 — Seed data
24. Write `backend/seed.py` — creates:
    - 1 center
    - 1 admin user (email: admin@nestcare.com, password: Admin1234!)
    - 2 staff users
    - 2 parent users
    - 3 children (1 newborn, 1 toddler, 1 preschooler) — each with full sub-profiles (personality, routines, development, food profile with preferences and allergies, health profile with medications, fears, interests)
    - Link each parent to at least 1 child
    - 3 authorized pickups
    - 2 emergency contacts per child
    - 5 daily logs with naps, meals, activities
    - 3 media posts (use placeholder image URLs)
    - 2 invoices (1 paid, 1 overdue)
    - 1 fee plan
25. Run `python seed.py` — verify data in pgAdmin

### Phase 5 — Core backend modules (in this order)
26. Children CRUD (`app/routers/children.py` + `app/services/child_service.py`)
27. Child sub-profiles: personality, routines, development, emotional plan
28. Fears and interests (CRUD lists)
29. Authorized pickups and emergency contacts
30. Food profile, food preferences, food textures, dietary restrictions, allergies
31. Health profile, medications, medication logs, vaccinations
32. Incident reports (create + parent sign-off endpoint)
33. Daily logs: create log, add nap, add meal, add activity, add diaper, add potty
34. Attendance: checkin, checkout, today's roster
35. Media upload (Cloudinary integration)
36. Messaging: conversations, messages, read receipts, announcements
37. Billing: fee plans, invoices, batch generation, payments
38. Staff management endpoints
39. Parent management + link-child endpoint
40. Reports endpoints
41. WebSocket endpoint

### Phase 6 — Frontend project init
42. Run Vite create command from Section 2
43. Install all frontend dependencies
44. Configure Tailwind CSS (tailwind.config.js from Section 9)
45. Write `src/api/client.js` (Axios + interceptors)
46. Write `src/store/authStore.js`
47. Write `src/hooks/useAuth.js`, `useSocket.js`
48. Write all three layouts (AdminLayout, StaffLayout, ParentLayout) — sidebar nav with correct menu items, top bar with user avatar, Outlet
49. Write `ProtectedRoute.jsx`
50. Set up `App.jsx` with all routes from Section 10
51. Write Login page — test full login flow end-to-end

### Phase 7 — Staff frontend
52. Staff Dashboard (room roster cards, alerts, today's summary)
53. Staff Attendance (QR scanner with jsQR, manual entry, checkin/checkout flow)
54. Staff Daily Log (all 7 sections, pre-populate if log exists, save button)
55. Staff Child Profile (read-only tabs, allergy banner always visible at top)
56. Staff Messages (conversation list + thread)

### Phase 8 — Parent frontend
57. Parent Dashboard (child selector, today's card, live feed timeline)
58. Parent Child Feed (full timeline, date picker, infinite scroll)
59. Parent Child Profile (read-only care profile)
60. Parent Messages
61. Parent Invoices

### Phase 9 — Admin frontend
62. Admin Dashboard (4 stat cards, 2 charts, 2 tables)
63. Admin Children list (search, filter, table)
64. Multi-step enrollment modal (4 steps)
65. Admin Child Detail (8 tabs — all implemented)
66. Admin Staff management
67. Admin Billing (fee plans tab + invoices tab + batch generation)
68. Admin Reports (5 tabs with tables + CSV export)

### Phase 10 — Real-time integration
69. Connect WebSocket in frontend using `useSocket` hook
70. On `daily_log:updated` → invalidate React Query cache for parent feed
71. On `media:posted` → append photo card to parent feed live
72. On `message:new` → append to conversation + update unread badge
73. On `attendance:checkin/checkout` → update staff dashboard roster
74. On `incident:created` → show toast to admin
75. On `invoice:issued` → show toast to parent

### Phase 11 — Polish & edge cases
76. Add loading skeletons (Tailwind `animate-pulse`) to all data-loading states
77. Add empty state messages to all lists ("No children enrolled yet", "No messages yet", etc.)
78. Add error boundaries around each page
79. Test all role isolation — log in as parent, try accessing `/admin` → should redirect
80. Test parent data isolation — parent A should not see parent B's child data
81. Verify allergy banner appears on every screen that shows a child with SEVERE/ANAPHYLACTIC allergy
82. Full end-to-end test:
    - Admin enrolls a new child with allergies and food preferences
    - Staff checks child in → parent sees checkin in feed
    - Staff logs lunch → parent sees meal entry appear live
    - Staff uploads photo → parent sees photo appear live
    - Staff logs an incident → parent gets notification, signs off
    - Admin generates invoice → parent sees it in invoices

---

## 16. CRITICAL RULES — DO NOT SKIP

**Security:**
- Passwords hashed with bcrypt (saltRounds=12), never stored or logged in plain text
- `center_id` always taken from `current_user.center_id` (JWT payload) — never from request body
- Parent data isolation enforced in every service function via `verify_parent_owns_child()`
- File upload size limit: 25MB, enforced in the backend endpoint before calling Cloudinary
- All inputs validated with Pydantic schemas before any DB operation

**Database:**
- All timestamps stored as `TIMESTAMP WITH TIME ZONE` (UTC)
- Frontend converts UTC to local display time using `date-fns` `format()` with `toLocalTime`
- Never edit table structure manually in pgAdmin after initial setup — use SQL migrations
- `daily_logs` has a UNIQUE constraint on `(child_id, log_date)` — if staff save twice on same day, it updates the existing log, does not create duplicate

**Frontend:**
- Access token stored in Zustand memory only — never `localStorage`, never `sessionStorage`
- Mobile responsiveness required on all pages — use Tailwind `sm:` / `md:` / `lg:` prefixes
- Staff Daily Log page saves a draft to `localStorage` every 30 seconds as a safety net — on page load, if a draft exists for today's date + child_id, offer to restore it
- Allergy banner (`AllergyBanner.jsx`) must be imported and rendered at the top of every component that displays a child — no exceptions
- All date displays use `date-fns` — no raw `new Date().toString()`

**WebSocket:**
- WebSocket connects on layout mount and disconnects on layout unmount
- If WebSocket disconnects, retry with exponential backoff (1s, 2s, 4s, 8s, max 30s)
- WebSocket events trigger React Query cache invalidations, not direct state mutations

**Real-time parent feed:**
- New timeline entries slide in from top with a short CSS fade-in animation
- Unread entries have a green left border that fades after 3 seconds

**QR Code:**
- Each child's QR code encodes their `child_id` UUID
- Generate and display QR code in Admin Child Detail (Tab 1 — Profile) using any QR generation library
- Staff scan this QR on the attendance page

**Invoice numbering:**
- Auto-generate invoice numbers as: `NC-{YEAR}-{MONTH}-{4-digit-sequence}` e.g. `NC-2025-06-0042`
- Sequence resets to 0001 each month

**Seeded admin credentials:**
- Email: `admin@nestcare.com`
- Password: `Admin1234!`
- These must work immediately after running `seed.py`

---

## 17. DEPLOYMENT (PRODUCTION)

### Platform decisions — read this first

| Layer | Platform | Why |
|---|---|---|
| **Frontend (React + Vite)** | Vercel | Optimized for static SPA builds, free tier, instant deploys from GitHub |
| **Backend (FastAPI)** | Render | Runs as a persistent long-running server — required for WebSockets. Vercel serverless functions do NOT support WebSockets and kill connections after ~10 seconds. Never deploy this FastAPI backend to Vercel. |
| **Database (PostgreSQL)** | Render Managed PostgreSQL | Sits in the same Render private network as the backend — low latency, no public exposure needed |
| **Media (photos/videos)** | Cloudinary | Already integrated — no change needed |

> **Why not Railway or Fly.io?** Both are valid alternatives to Render for the backend.
> Railway is simpler to set up. Fly.io gives more control. Render is recommended here
> because it has a free tier for both web services AND managed PostgreSQL, making
> zero-cost staging possible. The deployment steps below are written for Render.
> If the team prefers Railway or Fly.io, the FastAPI config is identical — only the
> platform UI steps differ.

---

### Part A — Backend deployment on Render

#### Step 1: Prepare the backend repo
Ensure the backend folder contains these files at its root:

**`requirements.txt`** — must exist and be up to date:
```bash
pip freeze > requirements.txt
```

**`Procfile`** — tells Render how to start the server:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

> Do NOT hardcode `--port 8000` in the Procfile. Render injects `$PORT` dynamically.

**`runtime.txt`** — pins Python version:
```
python-3.11.0
```

#### Step 2: Create Render Managed PostgreSQL
1. Go to [render.com](https://render.com) → New → PostgreSQL
2. Name: `nestcare-db`
3. Region: pick the closest to your users
4. Plan: Free (for staging) or Starter (for production)
5. Click Create Database
6. Copy the **Internal Database URL** (looks like `postgresql://user:pass@dpg-xxx.internal/nestcare`) — this is used ONLY by backend services inside Render's network
7. Also copy the **External Database URL** — used only for running migrations from your local machine if needed

#### Step 3: Deploy the FastAPI backend as a Render Web Service
1. Go to Render → New → Web Service
2. Connect your GitHub repo
3. Set **Root Directory** to `backend` (if monorepo) or leave blank (if backend is the repo root)
4. **Runtime:** Python 3
5. **Build Command:**
   ```
   pip install -r requirements.txt
   ```
6. **Start Command:**
   ```
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
7. **Plan:** Free (for staging) — note: free tier spins down after 15 min inactivity (first request is slow). Use Starter plan for production to keep it always-on.

#### Step 4: Set environment variables on Render backend service
In Render dashboard → your web service → Environment, add these exactly:

```
DATABASE_URL        = [paste the Internal Database URL from Step 2]
SECRET_KEY          = [generate: python -c "import secrets; print(secrets.token_hex(64))"]
ALGORITHM           = HS256
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS   = 7
CLOUDINARY_CLOUD_NAME       = [your Cloudinary cloud name]
CLOUDINARY_API_KEY          = [your Cloudinary API key]
CLOUDINARY_API_SECRET       = [your Cloudinary API secret]
FRONTEND_URL        = https://nestcare.vercel.app   ← update after frontend is deployed
```

> Do NOT commit `.env` to GitHub. All secrets live in Render's environment panel only.

#### Step 5: Run database migrations on production
After the Render service is live, open Render's Shell tab (or use the external DB URL locally):
```bash
# Option A — via Render Shell
cd backend
python -c "from app.database import engine; from app.models import *; Base.metadata.create_all(bind=engine)"

# Option B — run the seed SQL from Section 5 via psql using the External Database URL
psql [external-database-url] -f schema.sql
```

Then run the seed script to populate initial data:
```bash
python seed.py
```

#### Step 6: Verify backend is live
Visit `https://your-render-service.onrender.com/api/health` — should return `{"status": "ok"}`

Visit `https://your-render-service.onrender.com/docs` — FastAPI Swagger UI should be accessible (disable in production by passing `docs_url=None` to FastAPI constructor if you want to hide it).

---

### Part B — Frontend deployment on Vercel

#### Step 1: Update production environment variables
Create `frontend/.env.production` (this file IS safe to commit — no secrets, only public URLs):
```env
VITE_API_URL=https://your-render-service.onrender.com/api
VITE_WS_URL=wss://your-render-service.onrender.com
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
```

> Note `wss://` (secure WebSocket) not `ws://` for production.

#### Step 2: Add `vercel.json` for SPA routing
Create `frontend/vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
This ensures React Router handles all routes — without it, refreshing `/admin/children` returns a 404 from Vercel.

#### Step 3: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) → New Project → Import your GitHub repo
2. Set **Root Directory** to `frontend` (if monorepo)
3. **Framework Preset:** Vite (Vercel auto-detects this)
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. Click Deploy

#### Step 4: Set environment variables on Vercel
In Vercel dashboard → your project → Settings → Environment Variables, add:
```
VITE_API_URL             = https://your-render-service.onrender.com/api
VITE_WS_URL              = wss://your-render-service.onrender.com
VITE_CLOUDINARY_CLOUD_NAME = your_cloudinary_cloud_name
```
Set all three for: Production, Preview, and Development environments.

> Vercel only injects `VITE_` prefixed variables into the React build. Any variable
> without `VITE_` prefix will be silently ignored by Vite and undefined at runtime.

#### Step 5: Update backend CORS
After Vercel assigns your domain (e.g. `nestcare.vercel.app`), go back to Render and update:
```
FRONTEND_URL = https://nestcare.vercel.app
```
Then redeploy the backend (Render auto-redeploys on env var changes).

---

### Part C — WebSocket in production (critical)

The backend runs on Render as a **persistent long-running process** — this is exactly what WebSockets need. The connection stays open as long as the client is connected.

**Frontend WebSocket URL in production:**
```
wss://your-render-service.onrender.com/ws/{center_id}?token={access_token}
```
Note the `wss://` protocol (WebSocket Secure) — required because Render serves over HTTPS.

**Render free tier caveat:** The free tier spins down after 15 minutes of inactivity. A spun-down server cannot maintain WebSocket connections. Use **Render Starter plan ($7/month)** for production so the server is always running.

**Frontend reconnection logic** (already specified in Section 12 but critical for production):
```js
// In useSocket.js — exponential backoff reconnect
let retryDelay = 1000
const MAX_DELAY = 30000

function connect() {
  const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}/ws/${centerId}?token=${token}`)
  
  ws.onopen = () => { retryDelay = 1000 } // reset on success
  
  ws.onclose = () => {
    setTimeout(() => {
      retryDelay = Math.min(retryDelay * 2, MAX_DELAY)
      connect() // retry
    }, retryDelay)
  }
  
  return ws
}
```

---

### Part D — CI/CD with GitHub Actions (optional but recommended)

Create `.github/workflows/deploy.yml` in the repo root:

```yaml
name: Test and Deploy

on:
  push:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r backend/requirements.txt
      - run: cd backend && python -m pytest tests/ -v
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
          SECRET_KEY: test_secret_key_for_ci

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: cd frontend && npm ci && npm run build

  # Render and Vercel auto-deploy from main branch — no manual deploy step needed
  # Just ensure both are connected to the GitHub repo with auto-deploy enabled
```

> Render and Vercel both watch the `main` branch and auto-deploy on every push.
> GitHub Actions just runs the tests as a gate — if tests fail, you'll see it in
> the PR before merging.

---

### Part E — Production checklist before going live

Run through every item before sharing the URL with real users:

**Backend:**
- [ ] `SECRET_KEY` is a random 64-character string — not a guessable value
- [ ] `DATABASE_URL` points to Render's internal PostgreSQL URL (not localhost)
- [ ] `FRONTEND_URL` in Render env vars matches the exact Vercel domain (no trailing slash)
- [ ] FastAPI Swagger docs disabled in production: `FastAPI(docs_url=None, redoc_url=None)`
- [ ] Seed script has been run — admin account exists and works
- [ ] `GET /api/health` returns `{"status": "ok"}`

**Database:**
- [ ] All tables exist in production PostgreSQL (verify via Render's psql shell)
- [ ] No local `localhost` connection string anywhere in deployed code

**Frontend:**
- [ ] `VITE_API_URL` points to Render backend URL (not localhost)
- [ ] `VITE_WS_URL` uses `wss://` not `ws://`
- [ ] `vercel.json` rewrites are in place — test by hard-refreshing `/admin`
- [ ] Login works and redirects correctly for all three roles

**WebSocket:**
- [ ] WebSocket connects successfully in production (check browser DevTools → Network → WS tab)
- [ ] Staff logs a meal → parent sees it appear within 2 seconds without page refresh
- [ ] Reconnection logic triggers correctly after server restart

**Media:**
- [ ] Photo upload from Staff Daily Log works end-to-end (uploads to Cloudinary, URL saved to DB, visible in parent feed)
- [ ] Videos generate a thumbnail URL

**Security:**
- [ ] Parent A cannot access Parent B's child data (test manually)
- [ ] Accessing `/admin` as a PARENT role redirects to `/parent`
- [ ] JWT tokens expire and refresh silently without logging the user out
