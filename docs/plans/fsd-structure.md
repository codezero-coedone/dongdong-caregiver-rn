# Feature-Sliced Design (FSD) Adoption Plan

This document outlines the plan to adopt Feature-Sliced Design (FSD) for the DongDong Caregiver RN project. FSD will help in organizing the codebase by business domain, improving maintainability and scalability.

## Core Concepts

FSD organizes the project into layers, ordered by dependency rule (lower layers cannot depend on higher layers):

1.  **App**: Global app setup (providers, styles, etc.). In Expo Router, this integrates with the `app/` directory.
2.  **Pages**: Composition of widgets and features for specific screens.
3.  **Widgets**: Compositional layer to connect features and entities (e.g., a Header with UserProfile and Menu).
4.  **Features**: User interactions (e.g., Auth, AddToCart, LikePost).
5.  **Entities**: Business entities (e.g., User, Product, Order).
6.  **Shared**: Reusable infrastructure code (UI kit, API client, helpers).

## Proposed Directory Structure

We will introduce a `src` directory to house the FSD layers, keeping the Expo `app` directory strictly for routing.

```
/
├── app/                  # Expo Router (Routing layer)
│   ├── _layout.tsx       # Root layout
│   ├── index.tsx         # Home route -> imports from src/pages/home
│   └── ...
├── src/
│   ├── app/              # App-wide settings, providers, styles
│   ├── pages/            # Page components (composed of widgets/features)
│   │   ├── home/
│   │   ├── login/
│   │   └── ...
│   ├── widgets/          # Complex UI blocks
│   │   ├── layout/       # Global layouts (Header, Sidebar)
│   │   └── ...
│   ├── features/         # User actions/interactions
│   │   ├── auth/         # Login, Logout, Register
│   │   └── ...
│   ├── entities/         # Business domain models
│   │   ├── user/         # User model, ui, lib
│   │   └── ...
│   └── shared/           # Generic reusable code
│       ├── ui/           # UI Kit (Buttons, Inputs)
│       ├── api/          # API client
│       ├── lib/          # Helpers
│       └── ...
└── ...
```

## Migration Strategy

1.  **Initialize `src` Structure**: Create the basic folder structure.
2.  **Move Shared Code**: Move `components/` (generic ones) to `src/shared/ui`, `hooks/` to `src/shared/lib` or specific layers, `constants/` to `src/shared/config`.
3.  **Define Entities**: Identify core entities (e.g., User, Patient) and move related code to `src/entities`.
4.  **Extract Features**: Identify interactive features and move them to `src/features`.
5.  **Compose Widgets**: Group related components into `src/widgets`.
6.  **Refactor Pages**: Move screen logic from `app/` to `src/pages/` and have `app/` files simply import and render the page.

## Naming Convention

-   **Slices**: `src/layer/slice` (e.g., `src/entities/user`)
-   **Segments**: `src/layer/slice/segment` (e.g., `src/entities/user/ui`, `src/entities/user/model`)

## Benefits

-   **Explicit Dependencies**: Clear flow of data and dependencies.
-   **Scalability**: Easier to add new features without tangling code.
-   **Team Work**: Clear boundaries allow parallel development.
