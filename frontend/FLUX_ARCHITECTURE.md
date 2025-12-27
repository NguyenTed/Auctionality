# Flux Architecture Implementation

This frontend follows the **Flux Architecture** pattern as required by the proposal.

## Flux Architecture Components

### 1. **Dispatcher** (`flux/Dispatcher.ts`)

- Central dispatcher for all actions
- Singleton pattern - single source of truth for action dispatching
- Prevents dispatching during an active dispatch (prevents infinite loops)
- Supports action-specific callbacks and global callbacks

### 2. **Action Types** (`flux/ActionTypes.ts`)

- Centralized action type constants
- Prevents typos and ensures consistency
- Organized by domain (Auth, Product, Category)

### 3. **Actions (Action Creators)** (`flux/actions/AuthActions.ts`)

- Action creators that dispatch actions to the dispatcher
- Handle async operations (API calls)
- Dispatch REQUEST, SUCCESS, and FAILURE actions
- Update localStorage/persistence layer

### 4. **Stores** (`flux/stores/AuthStore.ts`)

- Manage application state
- Subscribe to dispatcher for relevant actions
- Emit change events when state updates
- Provide getters for state access
- Singleton pattern

### 5. **Views (React Components)**

- Subscribe to stores via `useFluxStore` hook
- Dispatch actions via Action Creators
- Re-render when stores emit change events

## Data Flow

```
User Interaction (View)
    ↓
Action Creator (AuthActions.login)
    ↓
Dispatcher (AppDispatcher.dispatch)
    ↓
Store (AuthStore receives action)
    ↓
Store updates state & emits change
    ↓
View re-renders (via useFluxStore hook)
```

## Unidirectional Data Flow

1. **User Action** → Component calls `AuthActions.login()`
2. **Action Creator** → Dispatches action via `AppDispatcher.dispatch()`
3. **Dispatcher** → Notifies all registered stores
4. **Store** → Updates state based on action type
5. **Store** → Emits "change" event
6. **View** → Re-renders via `useFluxStore` hook subscription

## Key Principles

✅ **Unidirectional Data Flow** - Data flows in one direction only
✅ **Single Source of Truth** - Stores are the only place state lives
✅ **Actions are Plain Objects** - Actions describe what happened
✅ **Stores Have No Setters** - Stores only update via dispatcher
✅ **Views Subscribe to Stores** - Views react to store changes

## File Structure

```
frontend/src/
├── flux/
│   ├── Dispatcher.ts          # Central dispatcher
│   ├── ActionTypes.ts         # Action type constants
│   ├── actions/
│   │   └── AuthActions.ts     # Auth action creators
│   └── stores/
│       └── AuthStore.ts       # Auth state store
├── hooks/
│   └── useFluxStore.ts        # Hook to subscribe to stores
└── contexts/
    └── AuthContext.tsx        # React Context wrapper (uses Flux internally)
```

## Benefits

1. **Predictable State Updates** - All state changes go through dispatcher
2. **Easy Debugging** - Can log all actions
3. **Separation of Concerns** - Actions, Stores, Views are separate
4. **Testability** - Each layer can be tested independently
5. **Scalability** - Easy to add new stores and actions

## Usage Example

```typescript
// In a component
import { useAuth } from "../contexts/AuthContext";
import { AuthActions } from "../flux/actions/AuthActions";

function MyComponent() {
  const { user, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    await AuthActions.login({ email, password });
    // Store automatically updates, component re-renders
  };

  return <div>{isAuthenticated ? user.email : "Not logged in"}</div>;
}
```
