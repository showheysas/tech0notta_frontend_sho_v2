# Frontend Sho Clone

TechNotta AIの議事録管理システムのフロントエンドアプリケーション（ローカル開発専用）。

## Technology Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **UI Library**: React 19.0.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Date Handling**: date-fns 4.1.0
- **Testing**: Jest 29, React Testing Library, fast-check

## Getting Started

### Prerequisites

- Node.js 20 LTS or higher
- npm or yarn
- Backend API running on `http://localhost:8000`

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Backend API URL
# For local backend: http://localhost:8000
# For Azure backend (current): https://app-002-tech0notta-backend-dev.azurewebsites.net
NEXT_PUBLIC_API_URL=https://app-002-tech0notta-backend-dev.azurewebsites.net
```

### Development

```bash
# Start development server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

### Testing

```bash
# Run tests in watch mode
npm test

# Run tests once with coverage
npm run test:coverage

# Run property-based tests only
npm run test:properties

# Run tests in CI mode
npm run test:ci
```

### Build

```bash
npm run build
```

### Production (Local)

```bash
# Build first
npm run build

# Start production server
npm start
```

## Project Structure

```
frontend_sho_clone/
├── app/                      # Next.js App Router
│   ├── customers/           # Customer management
│   ├── deals/               # Deal management
│   ├── join/                # Tech Bot meeting join
│   ├── review/              # Meeting review
│   ├── tasks/               # Task management
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page (dashboard)
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── crm/                # CRM components
│   ├── layout/             # Layout components (AppShell, Sidebar, etc.)
│   ├── tasks/              # Task components
│   ├── ui/                 # UI components
│   └── upload/             # Upload components
├── lib/                    # Utilities and types
│   ├── api/                # API clients
│   ├── constants/          # Constants
│   ├── types/              # TypeScript types
│   ├── validation/         # Validation functions
│   └── config.ts           # Configuration
├── __tests__/              # Test files
└── public/                 # Static assets
```

## Features

- 音声・動画ファイルアップロード機能
- 処理状態のリアルタイム可視化
- 議事録の確認・修正・承認
- チャット形式での対話型リライト
- タスク管理機能
- CRM機能（顧客・商談管理）
- Notion統合
- レスポンシブデザイン
- アクセシビリティ対応

## API Endpoints

バックエンドAPIは現在Azureで実行されています：
- **Azure Backend**: https://app-002-tech0notta-backend-dev.azurewebsites.net

ローカルバックエンドを使用する場合は、`.env.local` を以下のように変更してください：
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

主要なエンドポイント:
- `POST /api/upload` - 音声ファイルアップロード
- `GET /api/jobs` - 議事録一覧取得
- `GET /api/jobs/stats` - 統計情報取得
- `POST /api/transcribe` - 文字起こし開始
- `GET /api/transcribe/status` - 文字起こしステータス確認

詳細は `docs/frontend_api_client_examples.md` を参照してください。

## Documentation

- `docs/frontend_reconstruction_guide.md` - フロントエンド再構築ガイド
- `docs/frontend_ui_design_guide.md` - UIデザインガイド
- `docs/requirements_integrated_story_1_2.md` - 要件定義書

## Notes

このプロジェクトはローカル開発専用です（フロントエンドのみ）。
バックエンドAPIは現在Azureで実行されています。

## License

Private
