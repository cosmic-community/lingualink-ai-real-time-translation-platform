# LinguaLink AI - Real-Time Translation Platform

![App Preview](https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=1200&h=300&fit=crop&auto=format)

An AI-powered real-time translation platform that breaks down language barriers and promotes global communication. Translate text, voice, and documents instantly across 100+ languages with advanced AI technology.

## ✨ Features

- **Real-Time Text Translation**: Instant translation between 100+ languages
- **Voice Translation**: Speak and hear translations with natural pronunciation
- **Document Translation**: Upload PDFs, Word docs, and images for translation
- **Conversation Mode**: Two-way real-time conversations with auto-detection
- **Translation History**: Save and organize important translations
- **Language Learning**: Interactive features to help learn new languages
- **Offline Support**: Download language packs for offline translation
- **Multi-Platform**: Works seamlessly on desktop and mobile devices

## 🚀 Clone this Project

## Clone this Project

Want to create your own version of this project with all the content and structure? Clone this Cosmic bucket and code repository to get started instantly:

[![Clone this Project](https://img.shields.io/badge/Clone%20this%20Project-29abe2?style=for-the-badge&logo=cosmic&logoColor=white)](https://app.cosmicjs.com/projects/new?clone_bucket=68b86aac66cccb5104c6ffae&clone_repository=68b86d7f66cccb5104c6ffbf)

## 📝 Prompts

This application was built using the following prompts to generate the content structure and code:

### Content Model Prompt

> No content model prompt provided - app built from existing content structure

### Code Generation Prompt

> Create an AI-powered app for real-time translation, breaking language barriers and promoting global communication and understanding

The app has been tailored to work with your existing Cosmic content structure and includes all the features requested above.

## 🛠️ Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Cosmic CMS** - Headless CMS for content management
- **OpenAI API** - AI-powered translation engine
- **Web Speech API** - Voice recognition and synthesis
- **React Hook Form** - Form handling and validation
- **Framer Motion** - Smooth animations and transitions

## 🏁 Getting Started

### Prerequisites

- Node.js 18+ or Bun runtime
- A Cosmic account and bucket
- OpenAI API key for translation services

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up your environment variables:
   ```env
   COSMIC_BUCKET_SLUG=your-bucket-slug
   COSMIC_READ_KEY=your-read-key  
   COSMIC_WRITE_KEY=your-write-key
   OPENAI_API_KEY=your-openai-api-key
   ```

4. Run the development server:
   ```bash
   bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🌐 Cosmic SDK Examples

### Fetching Supported Languages
```typescript
const { objects: languages } = await cosmic.objects
  .find({
    type: 'languages'
  })
  .props(['title', 'slug', 'metadata'])
  .depth(1)
```

### Saving Translation History
```typescript
await cosmic.objects.insertOne({
  title: 'Translation Session',
  type: 'translations',
  metadata: {
    source_text: 'Hello world',
    translated_text: 'Hola mundo',
    source_language: 'English',
    target_language: 'Spanish',
    user_id: userId,
    translation_method: 'text'
  }
})
```

### Managing User Preferences
```typescript
await cosmic.objects.updateOne(userId, {
  metadata: {
    preferred_languages: ['English', 'Spanish', 'French'],
    voice_settings: {
      speed: 1.0,
      pitch: 1.0
    }
  }
})
```

## 🔗 Cosmic CMS Integration

This app integrates with Cosmic CMS to manage:

- **Language Configurations**: Supported languages and their settings
- **User Profiles**: Preferences, history, and saved translations
- **Translation Sessions**: Conversation logs and document translations
- **Learning Content**: Language learning materials and progress tracking

The flexible content model allows for easy expansion of supported languages and features while maintaining user data across sessions.

## 🚀 Deployment Options

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Netlify
1. Push your code to GitHub
2. Connect your repository to Netlify
3. Add environment variables in Netlify dashboard
4. Deploy with build command: `bun run build`

### Environment Variables for Production
Set these in your hosting platform:
- `COSMIC_BUCKET_SLUG`
- `COSMIC_READ_KEY`
- `COSMIC_WRITE_KEY`
- `OPENAI_API_KEY`

<!-- README_END -->