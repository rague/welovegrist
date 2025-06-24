# We ❤️ Grist - Custom widgets by /ut7
*A personal collection of custom widgets for* [Grist](https://www.getgrist.com/)

> 🇬🇧 **English documentation available [below](#-english)**  

# 🇫🇷 Francais

>⚠️ **Projet en développement** - Les widgets peuvent évoluer et changer  

## 🧩 Widgets Disponibles

| Widget | Description | Démo |
|--------|-------------|------|
| [✍️ Sign a PDF](#sign-a-pdf) | Signer des documents PDF dans Grist | [🔗](https://ut7.getgrist.com/2g8wDt9wsPHA/exemple-de-signature-dun-document-SHARED/) |
| [🪟 Grid Display](#grid-display) | Affichage en grille bidimensionnelle | [🔗](https://ut7.getgrist.com/mnN6xDU3ueUi/Grid-widget-demo-SHARED) |
| [🐠 Mermaid Viewer](#mermaid-viewer) | Rendu de diagrammes Mermaid | [🔗](https://ut7.getgrist.com/w1KH9AFGU2TH/mermaid-widget-demo-SHARED) |

---

## ✍️ Sign a PDF

URL : `https://ut7.github.io/welovegrist/sign-a-pdf/`

Signez des documents PDF directement dans vos tables Grist.

C'est pas sec du tout.

**Colonnes requises :**
- **source** : Pièce jointe (PDF à signer)
- **target** : Pièce jointe (PDF signé)
- **signed** (optionnel) : Booléen - se souvient si le document a été signé. Utile quand un seule colonne est à la fois source et target

**Utilisation :**
1. Créez un widget personnalisé avec l'URL ci-dessus
2. Uploadez votre signature (PNG)
3. Cliquez sur un PDF pour le signer

Reste à faire :
- améliorer l'ergonomie (notamment l'accès au panneau de configuration)
- créer un mode de signature avec du texte seulement - issu d'une colonne
- régler les problèmes d'alignement

---

## 🪟 Grid Display

URL : `https://ut7.github.io/welovegrist/grid/`

Affichez vos données sous forme de grille bidimensionnelle avec navigation.

**Colonnes requises :**
- **VerticalAxis** : Axe vertical (lignes)
- **HorizontalAxis** : Axe horizontal (colonnes)
- **Content** : Contenu des cellules
- **VerticalOrder** (optionnel) : Numeric
- **HorizontalOrder** (optionnel) : Numeric
- **BackgroundColor** (optionnel) : Couleur de fond

**Utilisation :**
1. Créez un widget personnalisé avec l'URL ci-dessus
2. Configurez les colonnes
3. Cliquez sur les éléments pour naviguer

---

## 🐠 Mermaid Viewer

URL : `https://ut7.github.io/welovegrist/mermaid-viewer/`

Affichez des diagrammes Mermaid directement dans vos tables Grist.

**Colonne requise :**
- **Content** : Texte contenant des diagrammes Mermaid (délimiteurs ````mermaid`)

**Fonctionnalités :**
- ✅ **Diagrammes Mermaid** : Flowcharts, séquences, Gantt, ER, états, pie charts, etc.
- ✅ **Thème adaptatif** : S'adapte automatiquement au dark/light mode de Grist
- ✅ **Gestion d'erreurs** : Affiche le code source en cas d'erreur de syntaxe
- ✅ Support Markdown (bonus)

**Version :** Mermaid 10.6.1

**Documentation :** [Syntaxe Mermaid officielle](https://mermaid.js.org/intro/syntax-reference.html)

**Utilisation :**
1. Créez un widget personnalisé avec l'URL ci-dessus
2. Configurez la colonne "Content"
3. Le contenu se met à jour automatiquement selon la sélection

---

# 🇬🇧 English

> ⚠️ **Work in progress** - Widgets may evolve and change

### Available Widgets

| Widget | Description | Demo |
|--------|-------------|------|
| [✍️ Sign a PDF](#sign-a-pdf-1) | Sign PDF documents within Grist | [🔗](https://ut7.getgrist.com/2g8wDt9wsPHA/exemple-de-signature-dun-document-SHARED/) |
| [🪟 Grid Display](#grid-display-1) | Bidimensional grid display | [🔗](https://ut7.getgrist.com/mnN6xDU3ueUi/Grid-widget-demo-SHARED) |
| [🐠 Mermaid Viewer](#mermaid-viewer-1) | Render Mermaid diagrams | [🔗](https://ut7.getgrist.com/w1KH9AFGU2TH/mermaid-widget-demo-SHARED) |

---

## ✍️ Sign a PDF

URL: `https://ut7.github.io/welovegrist/sign-a-pdf/`

Sign PDF documents directly within your Grist tables.

It's not dry at all.

**Required columns:**
- **source**: Attachment (PDF to sign)
- **target**: Attachment (signed PDF)
- **signed** (optional): Boolean - remembers if the document has been signed. Useful when a single column serves as both source and target

**Usage:**
1. Create custom widget with URL above
2. Upload your signature (PNG)
3. Click on PDF to sign it

TODO:
- improve UX (especially configuration panel access)
- create text-only signature mode - from a column
- fix alignment issues

---

## 🪟 Grid Display

URL: `https://ut7.github.io/welovegrist/grid/`

Display your data as bidimensional grid with navigation.

**Required columns:**
- **VerticalAxis**: Vertical axis (rows)
- **HorizontalAxis**: Horizontal axis (columns)
- **Content**: Cell content
- **VerticalOrder** (optional): Numeric
- **HorizontalOrder** (optional): Numeric
- **BackgroundColor** (optional): Background color

**Usage:**
1. Create custom widget with URL above
2. Configure columns
3. Click on items to navigate

---

## 🐠 Mermaid Viewer

URL: `https://ut7.github.io/welovegrist/mermaid-viewer/`

Display Mermaid diagrams directly in your Grist tables.

**Required column:**
- **Content**: Text containing Mermaid diagrams (````mermaid` delimiters)

**Features:**
- ✅ **Mermaid diagrams**: Flowcharts, sequences, Gantt, ER, states, pie charts, etc.
- ✅ **Adaptive theming**: Automatically adapts to Grist's dark/light mode
- ✅ **Error handling**: Shows source code when syntax errors occur
- ✅ Markdown support (bonus)

**Version:** Mermaid 10.6.1

**Documentation:** [Official Mermaid syntax](https://mermaid.js.org/intro/syntax-reference.html)

**Usage:**
1. Create custom widget with URL above
2. Configure the "Content" column
3. Content updates automatically based on selection

---

<p align="center">
  <a href="https://github.com/ut7/">
    <img src="sign-a-pdf/ut7_loves_grist.png" alt="/ut7 loves Grist" width="200">
  </a>
</p>
