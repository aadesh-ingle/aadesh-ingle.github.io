# aadesh-ingle.github.io

This repository contains the generated static files for my personal blog. These files are automatically generated and deployed from the source repository [aadesh-ingle/my-blog](https://github.com/aadesh-ingle/my-blog) using GitHub Actions.

## ⚠️ Important Notice

**DO NOT MAKE DIRECT CHANGES TO THIS REPOSITORY**

All content is automatically generated and deployed from the source repository. Any direct changes to this repository will be overwritten on the next deployment.

## Repository Purpose

This repository serves as the publishing endpoint for my Hugo-based blog. GitHub Pages serves the content of this repository at [https://aadesh-ingle.github.io](https://aadesh-ingle.github.io).

## How It Works

1. The source code and content are maintained in [aadesh-ingle/my-blog](https://github.com/aadesh-ingle/my-blog)
2. When changes are pushed to the main branch of the source repository, a GitHub Actions workflow is triggered
3. The workflow builds the Hugo site and deploys the generated files to this repository
4. GitHub Pages then serves the content from this repository

## Deployment Process

The deployment is handled by a GitHub Actions workflow in the source repository which:

1. Checks out the source code with submodules
2. Sets up Hugo Extended version
3. Builds the site with minification
4. Deploys the build output to this repository

The GitHub Actions workflow uses an SSH deploy key to securely push changes to this repository.

## Repository Structure

This repository contains the static HTML, CSS, JavaScript, and media files that make up the published website:

```
aadesh-ingle.github.io/
├── index.html              # Main homepage
├── css/                    # Stylesheets
├── js/                     # JavaScript files
├── images/                 # Image files
├── blog/                   # Blog posts
│   ├── index.html          # Blog listing page
│   ├── post-1/index.html   # Individual post pages
│   └── ...
├── tags/                   # Tag archive pages
├── categories/             # Category archive pages
├── page/                   # Pagination pages
└── ...                     # Other static content
```

## Troubleshooting

If you notice issues with the deployed site:

1. **Do not fix them here** - they will be overwritten on the next deployment
2. Check the source repository at [aadesh-ingle/my-blog](https://github.com/aadesh-ingle/my-blog)
3. Look at the GitHub Actions workflow logs for build or deployment issues
4. Make necessary changes in the source repository

## Local Development

For local development, please use the source repository:

```bash
# Clone the source repository
git clone --recurse-submodules https://github.com/aadesh-ingle/my-blog.git

# Navigate to the project directory
cd my-blog

# Start the Hugo development server
hugo server -D
```

## Build Information

- Built with [Hugo](https://gohugo.io/)
- Theme: [Hugo Bear Cub](https://github.com/clente/hugo-bearcub)
- Deployment: GitHub Actions (see source repository for workflow details)

## License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

## Contact

For questions or issues, please [open an issue](https://github.com/aadesh-ingle/my-blog/issues) on the source repository.
