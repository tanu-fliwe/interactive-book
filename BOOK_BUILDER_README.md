# FiWe Book Builder - Deployment Guide

This guide explains how to deploy the Book Builder admin UI to Vercel.

## Features

- **Admin UI** at `/admin/books` for managing books
- **Upload PNG pages** with drag-and-drop support
- **Page ordering and indexing** with visual thumbnail grid
- **Interactive page tagging** with overlay rectangle editor
- **Manifest generation** stored in Vercel Blob
- **Dynamic viewer** at `/book/[bookId]` that reads from manifest
- **Simple password authentication** for admin routes

## Architecture

```
Storage: Vercel Blob
├── books/
│   ├── {bookId}/
│   │   ├── manifest.json       # Book metadata and page configuration
│   │   └── pages/
│   │       ├── 001.png
│   │       ├── 002.png
│   │       └── ...
```

## Prerequisites

- Vercel account
- Node.js 18+ (for local development)

## Environment Variables

Add these environment variables in your Vercel project settings:

### Required

1. **`BLOB_READ_WRITE_TOKEN`** (Vercel Blob storage token)
   - Go to your Vercel project → Storage → Create Blob Store
   - Copy the `BLOB_READ_WRITE_TOKEN` from the environment variables

2. **`ADMIN_PASSWORD`** (Admin login password)
   - Set this to a secure password
   - Example: `ADMIN_PASSWORD=your_secure_password_here`

### How to Set Environment Variables in Vercel

1. Go to your project on Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - Name: `BLOB_READ_WRITE_TOKEN`
   - Value: (paste your token)
   - Environments: Production, Preview, Development
4. Repeat for `ADMIN_PASSWORD`

## Deployment Steps

### 1. Initial Setup

```bash
# Install dependencies
npm install

# Build locally (optional, to test)
npm run build

# Run dev server (optional)
npm run dev
```

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables (if not set via dashboard)
vercel env add BLOB_READ_WRITE_TOKEN
vercel env add ADMIN_PASSWORD

# Deploy to production
vercel --prod
```

#### Option B: Using GitHub Integration

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically deploy on push
4. Set environment variables in Vercel dashboard (see above)

### 3. Enable Vercel Blob Storage

1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Create Database** → **Blob**
4. Give it a name (e.g., "book-storage")
5. Vercel will automatically add `BLOB_READ_WRITE_TOKEN` to your environment variables

## Usage

### Admin Workflow

1. **Login**
   - Go to `/admin/login`
   - Enter the password you set in `ADMIN_PASSWORD`

2. **Create a Book**
   - Click "Create New Book"
   - Fill in Book ID (e.g., `grade3_lesson1`), Title, Grade, Lesson Name
   - Click "Create Book"

3. **Upload Pages**
   - Drag and drop PNG files or click to upload
   - Files will auto-detect page numbers from filenames:
     - `7.png` → page 7
     - `page-7.png` → page 7
     - `001.png` → page 1
   - If no number detected, pages use upload order

4. **Order Pages**
   - Drag thumbnails to reorder
   - Or manually change page numbers in inputs
   - Click "Auto-Index" to reset to 1..N

5. **Tag Interactive Pages**
   - Go to "Interactive Pages" tab
   - Check "Interactive" for activity pages
   - Select activity type:
     - **Skills Match** - Drag-and-drop Phaser game
     - **Reflections** - Text input form (saved locally)
     - **Vocab Flip** - Flashcard vocabulary
   - Click "Edit Overlay Rectangle" to position the activity area

6. **Visual Overlay Editor**
   - Drag to move the overlay rectangle
   - Resize from corners and edges
   - Values are normalized (0-1) for responsive positioning
   - Click "Save Rectangle"

7. **Save Book**
   - Click "Save Book" to write manifest to Blob
   - Book is now live at `/book/{bookId}`

### Viewing a Book

- Go to `/book/{bookId}` (e.g., `/book/grade3_lesson1`)
- Use "Previous" and "Next" buttons to flip pages
- Interactive pages will show overlays with activities

## File Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── login/page.tsx          # Admin login page
│   │   └── books/page.tsx          # Book management UI
│   ├── book/[bookId]/page.tsx      # Dynamic book viewer
│   └── api/
│       ├── auth/                   # Login/logout endpoints
│       └── books/                  # Book CRUD endpoints
├── components/
│   ├── admin/                      # Admin UI components
│   │   ├── BookList.tsx
│   │   ├── BookEditor.tsx
│   │   ├── PageUploader.tsx
│   │   ├── PageOrderer.tsx
│   │   ├── InteractivePageEditor.tsx
│   │   └── OverlayEditor.tsx
│   ├── overlays/                   # Activity overlays
│   │   ├── SkillsMatchGame.tsx
│   │   ├── ReflectionsOverlay.tsx
│   │   └── VocabOverlay.tsx
│   └── Flipbook.tsx                # Main flipbook component
├── types/
│   └── book.ts                     # TypeScript types
└── middleware.ts                   # Auth middleware
```

## API Endpoints

- `GET /api/books` - List all books
- `POST /api/books` - Create/update book metadata
- `GET /api/books/[bookId]` - Get book manifest
- `DELETE /api/books/[bookId]` - Delete book and all pages
- `POST /api/books/[bookId]/upload` - Upload page images
- `POST /api/books/[bookId]/manifest` - Save complete manifest
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout

## Manifest Format

```json
{
  "bookId": "grade3_lesson1",
  "title": "Grade 3 - Lesson 1",
  "grade": "3",
  "lessonName": "Introduction to Fractions",
  "pageCount": 12,
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T14:30:00.000Z",
  "pages": [
    {
      "index": 1,
      "url": "https://blob.vercel-storage.com/books/grade3_lesson1/pages/001.png",
      "filename": "001.png"
    }
  ],
  "interactivePages": {
    "4": {
      "type": "skills-match",
      "rect": { "x": 0.04, "y": 0.12, "w": 0.92, "h": 0.72 }
    }
  }
}
```

## Security Notes

- Admin routes are protected by middleware
- Password is compared against `ADMIN_PASSWORD` env var
- Session stored in httpOnly cookie
- All uploads go through API validation
- Only PNG/JPG files accepted

## Troubleshooting

### "Failed to upload files"
- Check `BLOB_READ_WRITE_TOKEN` is set correctly
- Verify Blob storage is enabled in Vercel dashboard

### "Invalid password" on login
- Verify `ADMIN_PASSWORD` environment variable is set
- Check for typos in password
- Redeploy after changing environment variables

### Images not loading in viewer
- Check that manifest was saved after uploading pages
- Verify Blob storage has public read access
- Check browser console for CORS errors

### Pages appear in wrong order
- Use "Auto-Index" button to reset to 1..N
- Manually adjust page indices in Page Order UI
- Re-save manifest after reordering

## Local Development

```bash
# Create .env.local file
echo "BLOB_READ_WRITE_TOKEN=your_token_here" > .env.local
echo "ADMIN_PASSWORD=admin123" >> .env.local

# Install dependencies
npm install

# Run dev server
npm run dev

# Open http://localhost:3000/admin/login
```

## Support

For issues or questions, refer to:
- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [react-pageflip Documentation](https://www.npmjs.com/package/react-pageflip)
