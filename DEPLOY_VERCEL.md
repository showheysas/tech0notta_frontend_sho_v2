# Vercel デプロイガイド

## なぜ Vercel なのか？

✅ **Next.js 開発元**のホスティングサービス  
✅ **最速デプロイ** - 通常1-3分で完了  
✅ **動的ルート完全対応**  
✅ **無料プラン**で十分な機能  
✅ **自動HTTPS・CDN**標準装備  
✅ **GitHub連携**で自動デプロイ

---

## デプロイ手順

### 方法1: Vercel Dashboard から（推奨・最も簡単）

#### 1. **Vercel アカウント作成**
- https://vercel.com にアクセス
- **「Start Deploying」** または **「Sign Up」** をクリック
- **GitHub アカウント**でサインアップ（推奨）

#### 2. **新しいプロジェクトを作成**
- ダッシュボードで **「Add New...」** → **「Project」**
- **「Import Git Repository」** を選択

#### 3. **リポジトリを選択**
- GitHubリポジトリ一覧から該当リポジトリを選択
- **「Import」** をクリック

#### 4. **プロジェクト設定**
```
Project Name: notta-frontend
Framework Preset: Next.js (自動検出)
Root Directory: frontend_sho_clone
Build Command: npm run build (自動設定)
Output Directory: .next (自動設定)
Install Command: npm ci (自動設定)
```

#### 5. **環境変数の設定**
**「Environment Variables」** セクションで追加:
```
Name: NEXT_PUBLIC_API_URL
Value: https://app-002-tech0notta-backend-dev.azurewebsites.net
```

#### 6. **デプロイ実行**
- **「Deploy」** ボタンをクリック
- 1-3分でデプロイ完了

---

### 方法2: Vercel CLI から

#### 1. **Vercel CLI インストール**
```bash
npm i -g vercel
```

#### 2. **ログイン**
```bash
vercel login
```

#### 3. **プロジェクトディレクトリに移動**
```bash
cd frontend_sho_clone
```

#### 4. **デプロイ**
```bash
vercel
```

#### 5. **設定質問への回答**
```
? Set up and deploy "frontend_sho_clone"? [Y/n] Y
? Which scope do you want to deploy to? [あなたのアカウント]
? Link to existing project? [Y/n] n
? What's your project's name? notta-frontend
? In which directory is your code located? ./
```

#### 6. **環境変数の設定**
```bash
vercel env add NEXT_PUBLIC_API_URL
# 値を入力: https://app-002-tech0notta-backend-dev.azurewebsites.net
# 環境を選択: Production, Preview, Development (すべて選択推奨)
```

#### 7. **本番デプロイ**
```bash
vercel --prod
```

---

## デプロイ後の確認

### 1. **URL の確認**
- Vercel ダッシュボードで確認
- 例: `https://notta-frontend-username.vercel.app`

### 2. **カスタムドメイン設定**（オプション）
- プロジェクト設定 → **「Domains」**
- 独自ドメインを追加可能

### 3. **動作確認**
- メインページが表示されるか
- 動的ルート (`/customers/[id]`, `/review/[id]`) が動作するか
- API通信が正常に行われるか

---

## Vercel の特徴

### **無料プランの制限**
- **帯域幅**: 100GB/月
- **ビルド時間**: 6,000分/月
- **関数実行**: 100GB-時間/月
- **プロジェクト数**: 無制限

### **自動機能**
- **HTTPS**: 自動設定
- **CDN**: グローバル配信
- **プレビューデプロイ**: PR毎に自動生成
- **分析**: パフォーマンス監視

---

## GitHub連携の設定

### **自動デプロイ**
- `main` ブランチへのプッシュで自動デプロイ
- プルリクエストで自動プレビュー生成

### **環境変数の管理**
- Vercel ダッシュボードで管理
- 本番・プレビュー・開発環境別に設定可能

---

## トラブルシューティング

### **ビルドエラー**
```bash
# ローカルでビルドテスト
npm run build
```

### **環境変数が反映されない**
- Vercel ダッシュボード → プロジェクト → Settings → Environment Variables
- 設定後、再デプロイが必要

### **動的ルートが404**
- Next.js の App Router は自動対応
- `next.config.ts` の設定を確認

---

## コスト比較

| サービス | 無料枠 | 有料プラン |
|---------|--------|-----------|
| **Vercel** | 100GB帯域幅/月 | $20/月〜 |
| **Azure App Service** | なし | ¥1,500/月〜 |

---

## 推奨設定

### **開発・個人プロジェクト**
```
プラン: Hobby (無料)
ドメイン: vercel.app サブドメイン
機能: 基本機能すべて利用可能
```

### **商用・チーム利用**
```
プラン: Pro ($20/月)
ドメイン: カスタムドメイン
機能: 高度な分析、優先サポート
```

---

## 次のステップ

1. **Vercel アカウント作成**
2. **GitHub リポジトリ連携**
3. **環境変数設定**
4. **デプロイ実行**
5. **動作確認**

**最も簡単な「方法1: Vercel Dashboard」から始めることをお勧めします！**