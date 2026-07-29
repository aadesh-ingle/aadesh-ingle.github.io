

# Aadesh Ingle — Personal Website

A production-grade, statically hosted personal website and blog built for performance, accessibility, and developer craftsmanship. This repository contains the optimized build output for `https://aadesh-ingle.github.io/`, serving as an engineering journal, curated reading list, photography gallery, and portfolio for Aadesh Ingle.

## Features
- ⚡ **Performance-First**: Vite-optimized builds, inlined critical CSS, self-hosted variable fonts (zero FOUT/CDN roundtrips), and lazy-loaded responsive images (AVIF/WebP with `srcset`).
- 🔍 **Prerendered Navigation**: Chrome Speculation Rules API enables near-instant page transitions by prerendering routes on hover/pointer intent.
- ♿ **Accessibility & UX**: Skip-to-content links, ARIA-compliant components, `prefers-reduced-motion` support, semantic HTML, and keyboard-navigable UI.
- 📖 **Content Modules**: Engineering journal with category filters and estimated reading time, curated bookshelf with highlights/ratings, photo gallery, and about page.
- 📧 **Secure Contact Form**: EmailJS integration with honeypot spam protection, client-side validation, and automatic rate limiting.
- 🌙 **Theming & Search**: System-aware dark mode toggle and quick-access global search (`⌘/Ctrl + K`).
- 📦 **Offline Resilience**: Service Worker registration for asset caching and improved repeat-visit performance.
- 🔍 **SEO Optimized**: Per-page canonical URLs, Open Graph, Twitter cards, and JSON-LD structured data.

## Tech Stack
- **Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + custom design system utilities
- **Icons**: Lucide React
- **Routing**: Custom client-side router with prerender support
- **Forms**: EmailJS SDK
- **Hosting**: GitHub Pages (Static SPA)

## Installation & Usage
*Note: This repository contains the production build output. If you have access to the source project, the standard workflow is as follows:*

```bash
# Clone the repository
git clone https://github.com/aadesh-ingle/aadesh-ingle.github.io.git
cd aadesh-ingle.github.io

# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

## Configuration & Customization
- **EmailJS**: The contact form communicates with `https://api.emailjs.com`. To enable it in a fork, configure your `PUBLIC_KEY`, `SERVICE_ID`, and `TEMPLATE_ID` in your environment or build config. The form includes a hidden honeypot field (`website`) and a 900ms client-side throttle to block automated spam.
- **Routing on GitHub Pages**: `404.html` acts as the catch-all SPA entry point. This is required for GitHub Pages to properly handle client-side routes without server-side fallbacks.
- **Content**: Blog posts, books, and gallery items are currently compiled into the build. In the source repository, these are typically managed via a local CMS, markdown files, or data files that Vite transforms at build time.
- **Assets**: Replace images in the `public/` directory with optimized formats. The custom `<Image />` component automatically generates `srcset` arrays for AVIF, WebP, and JPEG fallbacks.

## Deployment
The site is deployed to **GitHub Pages** by pushing the `dist/` or `build/` output directly to the `main` branch. GitHub Pages is configured to use `404.html` as the fallback for all routes, enabling seamless client-side navigation.

## Credits & Contact
- **Author**: [Aadesh Ingle](https://aadesh-ingle.github.io/about)
- **Twitter**: [@aadesh_gi](https://twitter.com/aadesh_gi)
- **LinkedIn**: [aadesh-ingle](https://linkedin.com/in/aadesh-ingle)
- **GitHub**: [aadesh-ingle](https://github.com/aadesh-ingle)
- **Email**: adesh.ingle74@gmail.com

---
*Patient Systems · Built to last*
