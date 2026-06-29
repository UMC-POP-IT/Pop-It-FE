# GitHub Copilot Instructions

Copilot must follow these instructions when generating code or performing code reviews.

## 1. Language & Tone

- **Language:** Respond in **Korean (한국어)**.
- **Tone:** Be concise, professional, and focus on the solution.

## 2. Tech Stack

- **Framework:** React (TypeScript) with Vite.
- **Styling:** Tailwind CSS v4. (Avoid CSS-in-JS or .css files unless necessary).
- **State Management:** TanStack Query (Server State), Zustand (Client State).

## 3. File Naming Conventions

| Type | Case | Example |
| --- | --- | --- |
| **Pages & Components** | PascalCase | `LoginPage.tsx`, `SidebarItem.tsx` |
| **Hooks** | camelCase | `useAuth.ts` |
| **Utilities/Others** | snake_case | `auth_api.ts`, `data_utils.ts` |

## 4. Code Writing Conventions

| Type | Case | Example |
| --- | --- | --- |
| **Variables** | camelCase | `const userInfo = ...`, `const isLoggedIn = true` |
| **Functions** | camelCase | `const getUserData = () => {}`, `const handleClick = () => {}` |
| **Component Funcs** | PascalCase | `export const LoginPage = () => {}` |

## 5. Naming Rules (Detailed)

| Data Type | Rule | Good Example (✅) | Bad Example (❌) |
| --- | --- | --- | --- |
| **Array** | Plural (-s) or `List` suffix | `const users = []`, `const mediaList = []` | `const user = []`, `const medias` |
| **Object / Single** | Singular | `const currentUser = {...}`, `const selectedId = 1` | `const users = {...}` |
| **Boolean** | Prefix: `is`, `has`, `should` | `const isLoading = true`, `const hasError = false` | `const loading = true`, `const check = false` |
| **Function** | Verb + Noun | `getUserData()`, `handleClick()` | `userData()`, `process()` |

## 6. Code Style Guide

- **Function Syntax:** Always use **Arrow Functions** (`const`) for components and regular functions.
- **Component Placement:** Place the **Main Component** at the top of the file.
- **Concise Syntax:** For short utility functions (one-liners), use **implicit return**.
- **Functional Components:** Always use Functional Components with Hooks. Avoid Class Components.
- **Interfaces:** Define interfaces for Props and State explicitly.
- **Path Alias:** Use `@/` alias instead of relative paths (e.g., `@/shared/components/Button`).
