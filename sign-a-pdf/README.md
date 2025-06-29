# ✍️ Sign a PDF

**URL:** `https://ut7.github.io/welovegrist/sign-a-pdf/`

**Demo:** [🔗](https://ut7.getgrist.com/2g8wDt9wsPHA/exemple-de-signature-dun-document-SHARED/)

## 🇫🇷 Français

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

## 🇬🇧 English

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