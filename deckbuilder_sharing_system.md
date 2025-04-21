
# Deckbuilder Sharing and Saving System

## 🛠️ Deck Creation
- Anyone (logged in or not) can build a deck immediately in the deckbuilder.

## 🔗 Sharing a Deck
- When the user clicks **“Share Deck”**:
  - **If logged in** → deck is saved under their account and marked as public.
  - **If not logged in** → deck is saved anonymously in the database and given a public URL.
- In both cases, a clean, shareable URL like `/deck/abc123` is returned.

## ✍️ Editing Behavior
- Anyone visiting the shared URL can view and edit the deck freely.
- Edits are **not saved** unless the user explicitly clicks **“Save”**.

## 💾 Saving a Deck
- If a visitor clicks **“Save”**:
  - **If logged in** → the deck is saved to their account as a new personal copy.
  - **If not logged in** → prompt login/signup, then save the current state under their new account.

## 🧹 Anonymous Decks
- Anonymous decks are stored with no owner.
- Optional: set a cleanup rule (e.g., auto-delete after 30 days).

## ✅ Key Benefits
- Decks are fully usable and shareable without login.
- Logged-in users retain ownership and control.
- System is simple, intuitive, and encourages viral sharing.
