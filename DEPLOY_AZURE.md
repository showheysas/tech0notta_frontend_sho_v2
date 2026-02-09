# Azure App Service デプロイガイド

## なぜ App Service なのか？

このアプリケーションは以下の理由で **Azure App Service** が最適です：

✅ 動的ルート (`/customers/[id]`, `/review/[id]`) を使用  
✅ クライアントサイドルーティング (Next.js App Router)  
✅ SSR (Server-Side Rendering) 対応  
✅ API Routes の可能性

**Azure Static Web Apps は静的エクスポートのみ対応のため不適合です。**

---

## 前提条件

- Azure アカウント
- Azure CLI インストール済み
- Node.js 20.x 以上

---

## デプロイ手順

### 方法1: Azure Portal から (推奨・最も簡単)

#### 1. App Service の作成

1. **Azure Portal にログイン**
   - https://portal.azure.com

2. **App Service を作成**
   - 「リソースの作成」→「Web App」を検索
   - 「作成」をクリック

3. **基本設定**
   - サブスクリプション: 選択
   - リソースグループ: 新規作成 (例: `rg-notta-frontend`)
   - 名前: `notta-frontend` (グローバルで一意)
   - 公開: `コード`
   - ランタイムスタック: `Node 20 LTS`
   - オペレーティングシステム: `Linux`
   - リージョン: `Japan East`
   - App Service プラン: 新規作成
     - 名前: `plan-notta`
     - 価格プラン: `B1` (開発用) または `P1V2` (本番用)

4. **デプロイ設定**
   - 「デプロイ」タブ
   - GitHub Actions を有効化: `はい`
   - GitHub アカウントで認証
   - 組織: 自分のアカウント
   - リポジトリ: プロジェクトのリポジトリを選択
   - ブランチ: `main`

5. **確認と作成**
   - 「確認および作成」→「作成」

#### 2. アプリケーション設定

1. **環境変数の設定**
   - App Service のリソースを開く
   - 「構成」→「アプリケーション設定」
   - 新しい設定を追加:
     ```
     NEXT_PUBLIC_API_URL=https://app-002-tech0notta-backend-dev.azurewebsites.net
     PORT=8080
     WEBSITE_NODE_DEFAULT_VERSION=20-lts
     ```
   - 「保存」

2. **スタートアップコマンドの設定**
   - 「構成」→「全般設定」
   - スタートアップコマンド: `node .next/standalone/server.js`
   - 「保存」

#### 3. デプロイ確認

- GitHub Actions が自動実行される
- リポジトリの「Actions」タブで進行状況を確認
- 完了後、App Service の URL にアクセス
  - 例: `https://notta-frontend.azurewebsites.net`

---

### 方法2: Azure CLI から

```bash
# 1. Azure にログイン
az login

# 2. リソースグループ作成
az group create \
  --name rg-notta-frontend \
  --location japaneast

# 3. App Service Plan 作成
az appservice plan create \
  --name plan-notta \
  --resource-group rg-notta-frontend \
  --sku B1 \
  --is-linux

# 4. Web App 作成
az webapp create \
  --name notta-frontend \
  --resource-group rg-notta-frontend \
  --plan plan-notta \
  --runtime "NODE:20-lts"

# 5. 環境変数設定
az webapp config appsettings set \
  --name notta-frontend \
  --resource-group rg-notta-frontend \
  --settings \
    NEXT_PUBLIC_API_URL=https://app-002-tech0notta-backend-dev.azurewebsites.net \
    PORT=8080 \
    WEBSITE_NODE_DEFAULT_VERSION=20-lts

# 6. スタートアップコマンド設定
az webapp config set \
  --name notta-frontend \
  --resource-group rg-notta-frontend \
  --startup-file "node .next/standalone/server.js"

# 7. GitHub Actions デプロイ設定
az webapp deployment github-actions add \
  --name notta-frontend \
  --resource-group rg-notta-frontend \
  --repo YOUR_USERNAME/YOUR_REPO \
  --branch main \
  --login-with-github
```

---

### 方法3: 手動デプロイ (テスト用)

```bash
# 1. ビルド
cd frontend_sho_clone
npm ci
npm run build

# 2. ZIP作成 (standaloneモード)
cd .next/standalone
zip -r ../../deploy.zip .
cd ../..
cd .next/static
zip -r ../../deploy.zip . -g
cd ../..

# 3. デプロイ
az webapp deployment source config-zip \
  --name notta-frontend \
  --resource-group rg-notta-frontend \
  --src deploy.zip
```

---

## GitHub Actions ワークフロー

自動生成されたワークフローを確認・カスタマイズ:

`.github/workflows/main_notta-frontend.yml`

```yaml
name: Build and deploy Node.js app to Azure Web App

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js version
        uses: actions/setup-node@v3
        with:
          node-version: '20.x'

      - name: npm install and build
        run: |
          cd frontend_sho_clone
          npm ci
          npm run build

      - name: Zip artifact for deployment
        run: |
          cd frontend_sho_clone/.next/standalone
          zip -r ../../../release.zip .
          cd ../static
          zip -r ../../../release.zip . -g

      - name: Upload artifact for deployment job
        uses: actions/upload-artifact@v3
        with:
          name: node-app
          path: release.zip

  deploy:
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: 'Production'
      url: ${{ steps.deploy-to-webapp.outputs.webapp-url }}

    steps:
      - name: Download artifact from build job
        uses: actions/download-artifact@v3
        with:
          name: node-app

      - name: Unzip artifact for deployment
        run: unzip release.zip

      - name: 'Deploy to Azure Web App'
        id: deploy-to-webapp
        uses: azure/webapps-deploy@v2
        with:
          app-name: 'notta-frontend'
          slot-name: 'Production'
          publish-profile: ${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE }}
          package: .
```

---

## GitHub Secrets の設定

1. GitHub リポジトリ → Settings → Secrets and variables → Actions
2. 新しいシークレットを追加:
   - `AZUREAPPSERVICE_PUBLISHPROFILE`: Azure Portal の App Service → 「発行プロファイルの取得」からダウンロードした内容を貼り付け
   - `NEXT_PUBLIC_API_URL`: `https://app-002-tech0notta-backend-dev.azurewebsites.net`

---

## デプロイ後の確認

### 1. URL の確認
- Azure Portal → App Service → 「概要」
- URL: `https://notta-frontend.azurewebsites.net`

### 2. ログの確認
```bash
# リアルタイムログ
az webapp log tail \
  --name notta-frontend \
  --resource-group rg-notta-frontend

# ログストリーム有効化
az webapp log config \
  --name notta-frontend \
  --resource-group rg-notta-frontend \
  --application-logging filesystem \
  --level information
```

### 3. カスタムドメインの設定 (オプション)
- App Service → 「カスタムドメイン」
- ドメインを追加して DNS 設定

---

## トラブルシューティング

### ビルドエラー

```bash
# ローカルでビルドテスト
cd frontend_sho_clone
npm ci
npm run build
```

### アプリが起動しない

1. **ログを確認**
   ```bash
   az webapp log tail --name notta-frontend --resource-group rg-notta-frontend
   ```

2. **スタートアップコマンドを確認**
   - Azure Portal → App Service → 構成 → 全般設定
   - スタートアップコマンド: `node .next/standalone/server.js`

3. **環境変数を確認**
   - `PORT=8080` が設定されているか
   - `NEXT_PUBLIC_API_URL` が正しいか

### 404 エラー

- Next.js の動的ルートが正しく動作しているか確認
- `output: "standalone"` が `next.config.ts` に設定されているか確認

### 環境変数が反映されない

- Azure Portal で設定を確認
- App Service を再起動
- GitHub Actions を再実行

---

## コスト

| プラン | スペック | 価格 (月額) | 用途 |
|--------|---------|------------|------|
| **F1 (Free)** | 1GB RAM, 60分/日 | 無料 | 開発・テスト |
| **B1 (Basic)** | 1.75GB RAM, 常時稼働 | 約 ¥1,500 | 開発・小規模 |
| **P1V2 (Premium)** | 3.5GB RAM, 自動スケール | 約 ¥10,000 | 本番環境 |

---

## パフォーマンス最適化

### 1. Always On を有効化 (B1以上)
```bash
az webapp config set \
  --name notta-frontend \
  --resource-group rg-notta-frontend \
  --always-on true
```

### 2. 自動スケール設定 (P1V2以上)
- Azure Portal → App Service Plan → スケールアウト
- ルールを追加 (CPU使用率 > 70% でスケールアウト)

### 3. CDN の追加 (オプション)
- Azure CDN を作成
- App Service をオリジンとして設定

---

## 参考リンク

- [Azure App Service ドキュメント](https://learn.microsoft.com/ja-jp/azure/app-service/)
- [Next.js on Azure App Service](https://learn.microsoft.com/ja-jp/azure/app-service/quickstart-nodejs)
- [Next.js Standalone Output](https://nextjs.org/docs/app/api-reference/next-config-js/output)
