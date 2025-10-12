# Proposed Folder Structure
├── assets/
├── scripts/
├── src/
│   ├── app/
│   │   ├── api/                    # API routes in a separate folder
│   │   │   ├── event+api.ts
│   │   │   └── user+api.ts
│   │   ├── _layout.tsx
│   │   ├── _layout.web.tsx         # separate layout file for web
│   │   ├── index.tsx
│   │   ├── events.tsx
│   │   └── settings.tsx
│   ├── components/
│   │   ├── Table/
│   │   │   ├── Cell.tsx
│   │   │   └── index.tsx
│   │   ├── BarChart.tsx
│   │   ├── BarChart.web.tsx        # separate components for web and native
│   │   └── Button.tsx
│   ├── screens/
│   │   ├── Home/
│   │   │   ├── Card.tsx            # component only used in the home page
│   │   │   └── index.tsx           # returned from /src/app/index.tsx
│   │   ├── Events.tsx              # returned from /src/app/events.tsx
│   │   └── Settings.tsx            # returned from /src/app/settings.tsx
│   ├── utils/                      # reusable utilities
│   │   ├── formatDate.ts
│   │   ├── formatDate.test.ts      # unit test next to the file being tested
│   │   └── pluralize.ts
│   ├── hooks/
│   │   ├── useAppState.ts
│   │   └── useTheme.ts
├── app.json
└── package.json
