# Azure App Service デプロイガイド (Next.js with Dynamic Routes)

## 重要な注意事項

このアプリケーションは動的ルート (`/customers/[id]`, `/review/[id]`) を使用しているため、**Azure App Service** が最適です。

Azure Static Web Apps は静的エクスポートのみをサポートしており、動的ルートには対応していません。

---

# Azure App Service デプロイガイド

## 前提条件

- Azure アカウント
- GitHub リポジトリ
- Azure CLI (オプション)

## デプロイ手順

### 方法1: Azure Portal から (推奨・最も簡単)

1. **Azure Portal にログイン**
   - https://portal.azure.com

2. **Static Web App を作成**
   - 「リソースの作成」→「Static Web App」を検索
   - 「作成」をクリック

3. **基本設定**
   - サブスクリプション: 選択
   - リソースグループ: 新規作成 (例: `rg-notta-frontend`)
   - 名前: `notta-frontend` (グローバルで一意)
   - プランの種類: `Free` (開発用) または `Standard` (本番用)
   - リージョン: `East Asia` または `Japan East`

4. **デプロイの詳細**
   - ソース: `GitHub`
   - GitHub アカウントで認証
   - 組織: 自分のアカウント
   - リポジトリ: プロジェクトのリポジトリを選択
   - ブランチ: `main`

5. **ビルドの詳細**
   - ビルドプリセット: `Next.js`
   - アプリの場所: `/frontend_sho_clone`
   - API の場所: (空欄)
   - 出力場所: `out`

6. **確認と作成**
   - 「確認および作成」→「作成」

7. **環境変数の設定**
   - デプロイ完了後、Static Web App のリソースを開く
   - 「構成」→「アプリケーション設定」
   - 新しい設定を追加:
     - 名前: `NEXT_PUBLIC_API_URL`
     - 値: `https://app-002-tech0notta-backend-dev.azurewebsites.net`
   - 「保存」

8. **デプロイ確認**
   - GitHub Actions が自動実行される
   - リポジトリの「Actions」タブで進行状況を確認
   - 完了後、Static Web App の URL にアクセス

---

### 方法2: Azure CLI から

```bash
# 1. Azure にログイン
az login

# 2. リソースグループ作成
az group create \
  --name rg-notta-frontend \
  --location japaneast

# 3. Static Web App 作成
az staticwebapp create \
  --name notta-frontend \
  --resource-group rg-notta-frontend \
  --source https://github.com/YOUR_USERNAME/YOUR_REPO \
  --location japaneast \
  --branch main \
  --app-location "frontend_sho_clone" \
  --output-location "out" \
  --login-with-github

# 4. 環境変数設定
az staticwebapp appsettings set \
  --name notta-frontend \
  --resource-group rg-notta-frontend \
  --setting-names NEXT_PUBLIC_API_URL=https://app-002-tech0notta-backend-dev.azurewebsites.net
```

---

### 方法3: 手動デプロイ (テスト用)

```bash
# 1. ビルド
cd frontend_sho_clone
npm run build

# 2. Azure Static Web Apps CLI をインストール
npm install -g @azure/static-web-apps-cli

# 3. デプロイ
swa deploy ./out \
  --deployment-token YOUR_DEPLOYMENT_TOKEN \
  --app-name notta-frontend
```

---

## GitHub Secrets の設定

GitHub Actions を使用する場合、以下のシークレットを設定:

1. GitHub リポジトリ → Settings → Secrets and variables → Actions
2. 新しいシークレットを追加:
   - `AZURE_STATIC_WEB_APPS_API_TOKEN`: Azure Portal の Static Web App → 「デプロイトークンの管理」からコピー
   - `NEXT_PUBLIC_API_URL`: `https://app-002-tech0notta-backend-dev.azurewebsites.net`

---

## デプロイ後の確認

1. **URL の確認**
   - Azure Portal → Static Web App → 「概要」
   - URL: `https://notta-frontend.azurestaticapps.net` (例)

2. **カスタムドメインの設定** (オプション)
   - Static Web App → 「カスタムドメイン」
   - ドメインを追加して DNS 設定

3. **ログの確認**
   - GitHub Actions のログ
   - Azure Portal → Static Web App → 「ログ」

---

## トラブルシューティング

### ビルドエラー

```bash
# ローカルでビルドテスト
cd frontend_sho_clone
npm run build
```

### 環境変数が反映されない

- Azure Portal で設定を確認
- GitHub Actions を再実行

### 404 エラー

- `staticwebapp.config.json` の設定を確認
- `navigationFallback` が正しく設定されているか確認

---

## コスト

- **Free プラン**: 
  - 100GB 帯域幅/月
  - 0.5GB ストレージ
  - カスタムドメイン 2個
  - 無料

- **Standard プラン**:
  - 100GB 帯域幅/月 (超過分: $0.20/GB)
  - 0.5GB ストレージ (超過分: $0.50/GB)
  - カスタムドメイン無制限
  - 約 $9/月

---

## 参考リンク

- [Azure Static Web Apps ドキュメント](https://learn.microsoft.com/ja-jp/azure/static-web-apps/)
- [Next.js on Azure Static Web Apps](https://learn.microsoft.com/ja-jp/azure/static-web-apps/deploy-nextjs-hybrid)
