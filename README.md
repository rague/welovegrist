# We ❤️ Grist - Custom widgets by /ut7
*A personal collection of custom widgets for* [Grist](https://www.getgrist.com/)

> 🇬🇧 **English documentation available [below](#-english)**  

# 🇫🇷 Francais

>⚠️ **Projet en développement** - Les widgets peuvent évoluer et changer  

## 🧩 Widgets Disponibles

| Widget | Description |
|--------|-------------|
| [✍️ Sign a PDF](#sign-a-pdf) | Signer des documents PDF dans Grist |
| [🪟 Grid Display](#grid-display) | Affichage en grille bidimensionnelle |

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

[Démo](https://ut7.getgrist.com/2g8wDt9wsPHA/exemple-de-signature-dun-document-SHARED/)

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

# 🇬🇧 English

> ⚠️ **Work in progress** - Widgets may evolve and change

### Available Widgets

| Widget | Description |
|--------|-------------|
| [✍️ Sign a PDF](#sign-a-pdf-1) | Sign PDF documents within Grist |
| [🪟 Grid Display](#grid-display-1) | Bidimensional grid display |

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

[Demo](https://ut7.getgrist.com/2g8wDt9wsPHA/exemple-de-signature-dun-document-SHARED/)

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

<p align="center">
  <a href="https://github.com/ut7/">
    <img src="sign-a-pdf/ut7_loves_grist.png" alt="/ut7 loves Grist" width="200">
  </a>
</p>
