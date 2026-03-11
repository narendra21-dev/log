import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Create or find admin user
    let admin = await db.user.findUnique({ where: { email: 'admin@blog.com' } });
    let author = await db.user.findUnique({ where: { email: 'author@blog.com' } });
    
    if (!admin) {
      admin = await db.user.create({
        data: { 
          email: 'admin@blog.com', 
          name: 'Alex Thompson', 
          password: 'admin123', 
          role: 'admin', 
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face', 
          bio: 'Senior Software Engineer & Tech Writer. Passionate about web development, AI, and sharing knowledge with the developer community. 10+ years of experience building scalable applications.' 
        }
      });
    }

    if (!author) {
      author = await db.user.create({
        data: { 
          email: 'author@blog.com', 
          name: 'Sarah Chen', 
          password: 'author123', 
          role: 'admin', 
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face', 
          bio: 'Full-stack developer and UX enthusiast. I write about modern web technologies, design systems, and developer productivity.' 
        }
      });
    }

    // Create categories
    const categoryData = [
      { name: 'Technology', slug: 'technology', color: '#3b82f6', description: 'Latest tech news and tutorials', icon: '💻' },
      { name: 'Design', slug: 'design', color: '#ec4899', description: 'UI/UX design insights and trends', icon: '🎨' },
      { name: 'Development', slug: 'development', color: '#10b981', description: 'Web and software development guides', icon: '🚀' },
      { name: 'Lifestyle', slug: 'lifestyle', color: '#f59e0b', description: 'Life hacks and personal growth', icon: '✨' },
      { name: 'Business', slug: 'business', color: '#8b5cf6', description: 'Entrepreneurship and business tips', icon: '📈' },
      { name: 'AI & Machine Learning', slug: 'ai-ml', color: '#06b6d4', description: 'Artificial intelligence and ML insights', icon: '🤖' },
    ];

    const categories: Record<string, any> = {};
    for (const cat of categoryData) {
      const existing = await db.category.findUnique({ where: { slug: cat.slug } });
      if (!existing) {
        categories[cat.slug] = await db.category.create({ data: cat });
      } else {
        categories[cat.slug] = existing;
      }
    }

    // Create tags
    const tagData = [
      { name: 'JavaScript', slug: 'javascript', color: '#f7df1e' },
      { name: 'React', slug: 'react', color: '#61dafb' },
      { name: 'Next.js', slug: 'nextjs', color: '#ffffff' },
      { name: 'TypeScript', slug: 'typescript', color: '#3178c6' },
      { name: 'CSS', slug: 'css', color: '#264de4' },
      { name: 'Tailwind', slug: 'tailwind', color: '#38b2ac' },
      { name: 'Node.js', slug: 'nodejs', color: '#68a063' },
      { name: 'Python', slug: 'python', color: '#3776ab' },
      { name: 'AI', slug: 'ai', color: '#ff6f61' },
      { name: 'Web Development', slug: 'web-development', color: '#e34c26' },
      { name: 'Career', slug: 'career', color: '#9b59b6' },
      { name: 'Productivity', slug: 'productivity', color: '#2ecc71' },
    ];

    const tags: Record<string, any> = {};
    for (const tag of tagData) {
      const existing = await db.tag.findUnique({ where: { slug: tag.slug } });
      if (!existing) {
        tags[tag.slug] = await db.tag.create({ data: tag });
      } else {
        tags[tag.slug] = existing;
      }
    }

    // Create comprehensive sample posts
    const postsData = [
      {
        title: 'Getting Started with Next.js 15: A Complete Guide',
        slug: 'getting-started-nextjs-15',
        excerpt: 'Learn how to build modern web applications with Next.js 15, featuring the new App Router, Server Components, and enhanced performance optimizations.',
        content: `# Getting Started with Next.js 15

Next.js 15 represents a significant evolution in the React framework ecosystem. Let's explore everything you need to know to get started.

## What's New in Next.js 15

### Server Components by Default
Server Components are now the default, providing better performance out of the box.

### Enhanced App Router
The App Router has been refined with better error handling and improved developer experience.

### Improved Performance
- Faster cold starts
- Better caching strategies
- Optimized bundle sizes

## Quick Start

\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm run dev
\`\`\`

## Key Features

1. **Server-Side Rendering** - First-class support for SSR
2. **Static Generation** - Pre-render pages at build time
3. **API Routes** - Build APIs within your Next.js app
4. **Image Optimization** - Automatic image optimization
5. **TypeScript Support** - Built-in TypeScript support

## Conclusion

Next.js 15 provides everything you need for modern web development. Start building today!`,
        coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200',
        published: true,
        featured: true,
        readTime: 8,
        authorId: author.id,
        categoryId: categories['development']?.id,
        tags: ['nextjs', 'react', 'javascript', 'web-development']
      },
      {
        title: 'The Art of Modern UI Design: Trends and Best Practices',
        slug: 'modern-ui-design-trends',
        excerpt: 'Explore the latest UI design trends and best practices that will help you create stunning, user-friendly interfaces.',
        content: `# The Art of Modern UI Design

Design trends evolve rapidly. Let's explore the most impactful design trends shaping modern web interfaces.

## Current Trends

### 1. Minimalism
Less is more. Clean, uncluttered interfaces help users focus on what matters.

### 2. Dark Mode
Dark mode done right reduces eye strain and saves battery life on OLED screens.

### 3. Micro-interactions
Small animations matter. They provide feedback and make interfaces feel alive.

### 4. Glassmorphism
Translucent, frosted-glass effects create depth and visual interest.

## Best Practices

- **Consistency** - Use consistent spacing, colors, and typography
- **Accessibility** - Design for everyone, including users with disabilities
- **Performance** - Optimize images and animations
- **Mobile-First** - Design for mobile, then enhance for desktop

> **Pro Tip**: Always consider accessibility in your designs. Good design is inclusive design.`,
        coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200',
        published: true,
        featured: true,
        readTime: 6,
        authorId: admin.id,
        categoryId: categories['design']?.id,
        tags: ['css', 'tailwind']
      },
      {
        title: 'Mastering Tailwind CSS: Advanced Techniques',
        slug: 'mastering-tailwind-css',
        excerpt: 'Take your Tailwind CSS skills to the next level with advanced customization techniques and best practices.',
        content: `# Mastering Tailwind CSS

Tailwind CSS has revolutionized how we write CSS. Let's dive into advanced techniques.

## Custom Configuration

\`\`\`javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
}
\`\`\`

## Custom Utilities

\`\`\`css
@layer utilities {
  .btn-primary {
    @apply px-4 py-2 bg-primary text-white rounded-lg 
           hover:bg-primary/90 transition-colors;
  }
}
\`\`\`

## Responsive Design

Tailwind makes responsive design intuitive:

\`\`\`html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Responsive grid -->
</div>
\`\`\``,
        coverImage: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=1200',
        published: true,
        featured: false,
        readTime: 7,
        authorId: author.id,
        categoryId: categories['development']?.id,
        tags: ['tailwind', 'css', 'web-development']
      },
      {
        title: 'AI in Web Development: Transforming the Way We Build',
        slug: 'ai-in-web-development',
        excerpt: 'Discover how AI is revolutionizing web development with intelligent code generation, design assistance, and automated testing.',
        content: `# AI in Web Development

Artificial Intelligence is transforming web development in remarkable ways.

## AI-Powered Tools

### Code Generation
- GitHub Copilot
- ChatGPT for code assistance
- AI-powered code completion

### Design to Code
- Convert Figma designs to code
- Generate UI components from descriptions
- Automatic responsive adaptations

### Automated Testing
- AI-generated test cases
- Intelligent bug detection
- Performance optimization suggestions

## Getting Started

1. Choose your AI tools wisely
2. Learn to write good prompts
3. Always review AI-generated code
4. Use AI as a supplement, not replacement`,
        coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200',
        published: true,
        featured: false,
        readTime: 5,
        authorId: author.id,
        categoryId: categories['ai-ml']?.id,
        tags: ['ai', 'web-development']
      },
      {
        title: 'Building Accessible Web Applications',
        slug: 'building-accessible-web-applications',
        excerpt: 'Create web applications that everyone can use. Learn about WCAG guidelines, semantic HTML, and assistive technologies.',
        content: `# Building Accessible Web Applications

Web accessibility ensures websites are usable by everyone, including people with disabilities.

## WCAG Guidelines

### Four Principles (POUR)

1. **Perceivable** - Users must be able to perceive the content
2. **Operable** - Users must be able to operate the interface
3. **Understandable** - Users must understand the content and interface
4. **Robust** - Content must work across different technologies

## Key Practices

### Semantic HTML
\`\`\`html
<button aria-label="Close menu">
  <span aria-hidden="true">×</span>
</button>
\`\`\`

### Focus Management
- Visible focus indicators
- Logical tab order
- Skip navigation links

### Color Contrast
Ensure sufficient contrast between text and backgrounds.`,
        coverImage: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200',
        published: true,
        featured: false,
        readTime: 9,
        authorId: admin.id,
        categoryId: categories['development']?.id,
        tags: ['web-development', 'career']
      },
      {
        title: 'Work-Life Balance for Developers',
        slug: 'work-life-balance-developers',
        excerpt: 'Strategies for maintaining a healthy work-life balance in the demanding tech industry.',
        content: `# Work-Life Balance for Developers

The tech industry is known for long hours and high pressure. Here's how to achieve balance.

## Setting Boundaries

### Define Your Hours
- Establish clear work hours
- Communicate availability to your team
- Learn to say no

### Create a Dedicated Workspace
- Separate work from personal space
- Invest in ergonomic equipment
- Minimize distractions

### Take Regular Breaks
- Use the Pomodoro Technique
- Step away from screens
- Exercise and stretch

## Signs of Burnout

1. Chronic fatigue
2. Reduced productivity
3. Cynicism about work
4. Difficulty concentrating

> **Remember**: Taking care of yourself isn't just good for you—it's good for your code.`,
        coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200',
        published: true,
        featured: false,
        readTime: 6,
        authorId: author.id,
        categoryId: categories['lifestyle']?.id,
        tags: ['career', 'productivity']
      },
      {
        title: 'React Hooks Deep Dive: useState and useEffect',
        slug: 'react-hooks-deep-dive',
        excerpt: 'Master React Hooks with this comprehensive guide to useState, useEffect, and custom hooks.',
        content: `# React Hooks Deep Dive

React Hooks changed how we write React components. Let's master them.

## useState

\`\`\`javascript
const [count, setCount] = useState(0);

// Functional updates
setCount(prev => prev + 1);

// Lazy initialization
const [data, setData] = useState(() => {
  return expensiveComputation();
});
\`\`\`

## useEffect

\`\`\`javascript
// Run on every render
useEffect(() => {
  console.log('Rendered!');
});

// Run once on mount
useEffect(() => {
  console.log('Mounted!');
}, []);

// Run when dependency changes
useEffect(() => {
  fetchData(userId);
}, [userId]);

// Cleanup
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe();
}, []);
\`\`\``,
        coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200',
        published: true,
        featured: false,
        readTime: 8,
        authorId: author.id,
        categoryId: categories['development']?.id,
        tags: ['react', 'javascript', 'web-development']
      },
      {
        title: 'TypeScript Best Practices for 2024',
        slug: 'typescript-best-practices-2024',
        excerpt: 'Level up your TypeScript skills with these essential best practices and advanced type patterns.',
        content: `# TypeScript Best Practices

TypeScript makes your code more robust and maintainable. Here's how to use it effectively.

## Strict Mode

Always enable strict mode in tsconfig.json:

\`\`\`json
{
  "compilerOptions": {
    "strict": true
  }
}
\`\`\`

## Type Definitions

\`\`\`typescript
// Prefer interfaces for objects
interface User {
  id: string;
  name: string;
  email: string;
}

// Use types for unions/intersections
type Status = 'pending' | 'approved' | 'rejected';

// Generic types
function identity<T>(arg: T): T {
  return arg;
}
\`\`\`

## Avoid Any

Never use \`any\`. Use \`unknown\` when type is truly unknown:

\`\`\`typescript
function parse(json: string): unknown {
  return JSON.parse(json);
}
\`\`\``,
        coverImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200',
        published: true,
        featured: false,
        readTime: 7,
        authorId: admin.id,
        categoryId: categories['development']?.id,
        tags: ['typescript', 'web-development']
      },
      {
        title: 'The Future of Web Development',
        slug: 'future-of-web-development',
        excerpt: 'Explore emerging technologies and trends shaping the future of web development.',
        content: `# The Future of Web Development

The web development landscape is constantly evolving. Here's what's coming.

## Emerging Technologies

### WebAssembly
Near-native performance in the browser. Run code written in Rust, C++, or Go.

### Edge Computing
Run code closer to users for faster response times. Vercel Edge, Cloudflare Workers.

### AI Integration
AI-powered features becoming standard in web applications.

## Trends to Watch

1. **Server Components** - React Server Components, Next.js
2. **Micro-frontends** - Modular, independently deployable UIs
3. **No-Code/Low-Code** - Faster development for simpler apps
4. **Web3** - Decentralized applications and blockchain

## Preparing for the Future

- Keep learning new technologies
- Focus on fundamentals
- Build side projects
- Contribute to open source`,
        coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200',
        published: true,
        featured: true,
        readTime: 6,
        authorId: author.id,
        categoryId: categories['technology']?.id,
        tags: ['web-development', 'ai']
      },
      {
        title: 'Building a Portfolio That Gets You Hired',
        slug: 'building-portfolio-gets-hired',
        excerpt: 'Create a developer portfolio that stands out and helps you land your dream job.',
        content: `# Building a Portfolio That Gets You Hired

Your portfolio is your first impression. Make it count.

## Essential Elements

### 1. About Section
Tell your story. Who are you? What do you do? What are you passionate about?

### 2. Projects
Showcase 4-6 of your best projects. Include:
- Problem statement
- Your solution
- Technologies used
- Live demo link
- Source code link

### 3. Skills
List your technical skills honestly. Group them by category.

### 4. Contact
Make it easy to reach you.

## Tips for Success

- **Keep it simple** - Clean, professional design
- **Show, don't tell** - Let your work speak
- **Mobile-first** - Ensure it works on all devices
- **Fast loading** - Optimize images and code
- **SEO friendly** - Help recruiters find you`,
        coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200',
        published: true,
        featured: false,
        readTime: 5,
        authorId: admin.id,
        categoryId: categories['career']?.id,
        tags: ['career', 'web-development']
      },
      {
        title: 'Node.js Performance Optimization',
        slug: 'nodejs-performance-optimization',
        excerpt: 'Learn how to optimize your Node.js applications for maximum performance and scalability.',
        content: `# Node.js Performance Optimization

Make your Node.js applications faster and more efficient.

## Key Strategies

### 1. Asynchronous Operations
Always use async/await or Promises. Never block the event loop.

\`\`\`javascript
// Bad
const data = fs.readFileSync('file.json');

// Good
const data = await fs.promises.readFile('file.json', 'utf8');
\`\`\`

### 2. Caching
Implement caching strategies:
- In-memory cache (Redis, Memcached)
- HTTP caching headers
- CDN for static assets

### 3. Database Optimization
- Use connection pooling
- Index your queries
- Implement pagination

### 4. Code Optimization
- Use streaming for large files
- Implement clustering
- Profile your application`,
        coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200',
        published: true,
        featured: false,
        readTime: 8,
        authorId: author.id,
        categoryId: categories['development']?.id,
        tags: ['nodejs', 'javascript', 'web-development']
      },
      {
        title: 'Python for Web Development in 2024',
        slug: 'python-web-development-2024',
        excerpt: 'Explore modern Python web development with Django, FastAPI, and Flask.',
        content: `# Python for Web Development

Python continues to be a top choice for web development. Here's why.

## Popular Frameworks

### Django
Full-featured framework with batteries included.

\`\`\`python
# views.py
from django.views import View
from django.http import JsonResponse

class PostView(View):
    def get(self, request):
        return JsonResponse({'message': 'Hello, Django!'})
\`\`\`

### FastAPI
Modern, fast, for building APIs.

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello, FastAPI!"}
\`\`\`

### Flask
Lightweight and flexible.

\`\`\`python
from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello, Flask!'
\`\`\``,
        coverImage: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1200',
        published: true,
        featured: false,
        readTime: 7,
        authorId: admin.id,
        categoryId: categories['development']?.id,
        tags: ['python', 'web-development']
      },
      {
        title: 'Cybersecurity Best Practices for Developers',
        slug: 'cybersecurity-best-practices-developers',
        excerpt: 'Essential security practices every developer should know to protect applications and user data.',
        content: `# Cybersecurity Best Practices

Security should be a priority, not an afterthought.

## Authentication Security

### Password Storage
- Never store plain text passwords
- Use bcrypt or Argon2
- Implement password policies

### Two-Factor Authentication
- SMS-based 2FA (less secure)
- Authenticator apps (recommended)
- Hardware keys (most secure)

## Common Vulnerabilities

### 1. SQL Injection
\`\`\`javascript
// Bad
const query = \`SELECT * FROM users WHERE id = \${userId}\`;

// Good
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);
\`\`\`

### 2. XSS (Cross-Site Scripting)
- Sanitize user input
- Use Content Security Policy
- Escape HTML entities

### 3. CSRF
- Use CSRF tokens
- Same-site cookies`,
        coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200',
        published: true,
        featured: false,
        readTime: 9,
        authorId: author.id,
        categoryId: categories['technology']?.id,
        tags: ['web-development', 'career']
      },
      {
        title: 'Startup Funding: A Complete Guide',
        slug: 'startup-funding-guide',
        excerpt: 'Navigate the world of startup funding from bootstrapping to IPO.',
        content: `# Startup Funding Guide

Understanding the funding landscape is crucial for entrepreneurs.

## Funding Stages

### Pre-Seed
- Personal savings
- Friends and family
- Grants and competitions
- Typical: $10K - $150K

### Seed
- Angel investors
- Early-stage VCs
- Accelerators
- Typical: $150K - $2M

### Series A
- Product-market fit achieved
- Scaling operations
- Typical: $2M - $15M

### Series B+
- Rapid growth
- Market expansion
- $15M - $100M+

## Key Metrics

1. **Revenue** - Monthly Recurring Revenue (MRR)
2. **Growth Rate** - Month-over-month growth
3. **CAC** - Customer Acquisition Cost
4. **LTV** - Lifetime Value`,
        coverImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200',
        published: true,
        featured: false,
        readTime: 8,
        authorId: admin.id,
        categoryId: categories['business']?.id,
        tags: ['career']
      },
      {
        title: 'Machine Learning for Web Developers',
        slug: 'machine-learning-web-developers',
        excerpt: 'Introduction to machine learning concepts and how to integrate ML into web applications.',
        content: `# Machine Learning for Web Developers

Bring intelligence to your web applications.

## Getting Started

### TensorFlow.js
Run ML models in the browser.

\`\`\`javascript
import * as tf from '@tensorflow/tfjs';

// Create a simple model
const model = tf.sequential();
model.add(tf.layers.dense({units: 1, inputShape: [1]}));

// Compile
model.compile({
  optimizer: 'sgd',
  loss: 'meanSquaredError'
});
\`\`\`

## Use Cases

### 1. Image Recognition
- User uploads
- Content moderation
- Accessibility

### 2. Natural Language Processing
- Chatbots
- Sentiment analysis
- Translation

### 3. Recommendations
- Product suggestions
- Content personalization

## Resources

- TensorFlow.js documentation
- ML5.js for beginners
- Brain.js for neural networks`,
        coverImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200',
        published: true,
        featured: false,
        readTime: 6,
        authorId: author.id,
        categoryId: categories['ai-ml']?.id,
        tags: ['ai', 'web-development']
      },
      {
        title: 'Remote Work Productivity Tips',
        slug: 'remote-work-productivity-tips',
        excerpt: 'Maximize your productivity while working from home with these proven strategies.',
        content: `# Remote Work Productivity Tips

Working from home comes with challenges. Here's how to thrive.

## Setting Up Your Space

### Dedicated Workspace
- Separate work from rest areas
- Good lighting
- Comfortable chair and desk
- Minimal distractions

### Tech Setup
- Reliable internet
- Quality webcam and microphone
- Second monitor (optional but recommended)

## Productivity Techniques

### Time Blocking
Schedule your day in blocks:
- Morning: Deep work
- Afternoon: Meetings and collaboration
- Evening: Planning and learning

### The 2-Minute Rule
If a task takes less than 2 minutes, do it now.

### Batch Similar Tasks
Group similar tasks together for efficiency.

## Communication

- Over-communicate with your team
- Use async communication when possible
- Have regular check-ins`,
        coverImage: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200',
        published: true,
        featured: false,
        readTime: 5,
        authorId: admin.id,
        categoryId: categories['lifestyle']?.id,
        tags: ['productivity', 'career']
      },
      {
        title: 'API Design Best Practices',
        slug: 'api-design-best-practices',
        excerpt: 'Design RESTful APIs that developers love with these proven patterns and practices.',
        content: `# API Design Best Practices

Create APIs that are a joy to use.

## RESTful Principles

### Resource-Based URLs
\`\`\`
GET /users           # List users
GET /users/123       # Get specific user
POST /users          # Create user
PUT /users/123       # Update user
DELETE /users/123    # Delete user
\`\`\`

### HTTP Status Codes
- 200: OK
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

## Response Format

\`\`\`json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "total": 100
  },
  "links": {
    "next": "/api/users?page=2",
    "prev": null
  }
}
\`\`\`

## Documentation

- Use OpenAPI/Swagger
- Include examples
- Document error responses`,
        coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200',
        published: true,
        featured: false,
        readTime: 7,
        authorId: author.id,
        categoryId: categories['development']?.id,
        tags: ['web-development', 'nodejs']
      },
      {
        title: 'CSS Grid vs Flexbox: When to Use What',
        slug: 'css-grid-vs-flexbox',
        excerpt: 'Understand when to use CSS Grid and when to use Flexbox for optimal layouts.',
        content: `# CSS Grid vs Flexbox

Both are powerful layout tools. Know when to use each.

## Flexbox

Best for **one-dimensional** layouts.

\`\`\`css
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
\`\`\`

**Use Flexbox when:**
- Navigation bars
- Card components
- Form layouts
- Aligning items

## CSS Grid

Best for **two-dimensional** layouts.

\`\`\`css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
\`\`\`

**Use Grid when:**
- Page layouts
- Card grids
- Complex layouts
- Dashboard designs

## Combining Both

\`\`\`css
.page {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main";
}

.nav {
  display: flex; /* Inside grid area */
}
\`\`\``,
        coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200',
        published: true,
        featured: false,
        readTime: 6,
        authorId: admin.id,
        categoryId: categories['design']?.id,
        tags: ['css', 'web-development']
      },
      {
        title: 'Building Scalable Systems',
        slug: 'building-scalable-systems',
        excerpt: 'Architecture patterns and best practices for building systems that scale.',
        content: `# Building Scalable Systems

Design systems that grow with your users.

## Scalability Types

### Vertical Scaling
- More powerful hardware
- Easier to implement
- Limited ceiling

### Horizontal Scaling
- More machines
- Load balancing
- Unlimited potential

## Key Patterns

### Load Balancing
Distribute traffic across servers.

### Caching
- Redis for session data
- CDN for static assets
- Database query caching

### Database Scaling
- Read replicas
- Sharding
- Connection pooling

### Microservices
Break monoliths into services.

## Monitoring

- Application Performance Monitoring (APM)
- Log aggregation
- Alert systems
- Health checks`,
        coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200',
        published: true,
        featured: false,
        readTime: 8,
        authorId: author.id,
        categoryId: categories['development']?.id,
        tags: ['web-development', 'nodejs']
      },
      {
        title: 'Design Systems: A Practical Guide',
        slug: 'design-systems-practical-guide',
        excerpt: 'Create and maintain design systems that improve consistency and speed up development.',
        content: `# Design Systems

Build consistency at scale.

## Components of a Design System

### Design Tokens
\`\`\`css
:root {
  --color-primary: #3b82f6;
  --spacing-md: 1rem;
  --radius-lg: 0.5rem;
  --font-sans: 'Inter', sans-serif;
}
\`\`\`

### Component Library
- Buttons
- Forms
- Cards
- Modals
- Navigation

### Documentation
- Usage guidelines
- Code examples
- Accessibility notes
- Design rationale

## Benefits

1. **Consistency** - Same look everywhere
2. **Efficiency** - Don't reinvent the wheel
3. **Quality** - Tested components
4. **Collaboration** - Common language

## Maintenance

- Version your system
- Gather feedback
- Regular updates
- Contribution guidelines`,
        coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200',
        published: true,
        featured: false,
        readTime: 7,
        authorId: admin.id,
        categoryId: categories['design']?.id,
        tags: ['css', 'tailwind', 'web-development']
      }
    ];

    // Create posts
    let createdCount = 0;
    for (const postData of postsData) {
      const existing = await db.post.findUnique({ where: { slug: postData.slug } });
      if (!existing) {
        const { tags: postTags, ...postOnly } = postData;
        const post = await db.post.create({ 
          data: { 
            ...postOnly, 
            publishedAt: postOnly.published ? new Date() : null,
            excerpt: postOnly.excerpt || postOnly.title
          } 
        });
        
        // Create tag associations
        if (postTags && postTags.length > 0) {
          for (const tagSlug of postTags) {
            const tag = tags[tagSlug];
            if (tag) {
              await db.postTag.create({
                data: {
                  postId: post.id,
                  tagId: tag.id
                }
              });
            }
          }
        }
        createdCount++;
      }
    }

    // Create sample ads if they don't exist
    const existingAds = await db.ad.findMany();
    if (existingAds.length === 0) {
      const adsData = [
        {
          title: 'Tech Courses Banner',
          type: 'banner',
          position: 'header',
          imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=200&fit=crop',
          linkUrl: 'https://example.com/courses',
          linkText: 'Learn More',
          active: true,
          priority: 10
        },
        {
          title: 'Developer Tools Sidebar',
          type: 'banner',
          position: 'sidebar',
          imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
          linkUrl: 'https://example.com/tools',
          linkText: 'Explore Tools',
          active: true,
          priority: 8
        },
        {
          title: 'In-Post Native Ad',
          type: 'native',
          position: 'in-post',
          content: '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; color: white; text-align: center;"><h3 style="margin: 0 0 8px 0; font-size: 18px;">🚀 Boost Your Productivity</h3><p style="margin: 0; opacity: 0.9;">Get 50% off on premium developer tools. Limited time offer!</p></div>',
          linkUrl: 'https://example.com/promo',
          linkText: 'Claim Offer',
          active: true,
          priority: 5
        },
        {
          title: 'Footer Sponsor',
          type: 'banner',
          position: 'footer',
          imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=150&fit=crop',
          linkUrl: 'https://example.com/sponsor',
          linkText: 'Visit Sponsor',
          active: true,
          priority: 3
        },
        {
          title: 'Between Posts Ad',
          type: 'native',
          position: 'between-posts',
          content: '<div style="border: 2px dashed #3b82f6; padding: 16px; border-radius: 8px; text-align: center; background: #f0f9ff;"><p style="margin: 0; color: #1e40af; font-weight: 500;">📢 Your Ad Here</p><p style="margin: 4px 0 0 0; color: #3b82f6; font-size: 14px;">Reach thousands of developers daily</p></div>',
          linkUrl: 'https://example.com/advertise',
          linkText: 'Advertise With Us',
          active: true,
          priority: 1
        }
      ];

      for (const adData of adsData) {
        await db.ad.create({ data: adData });
      }
    }

    // Get counts
    const totalPosts = await db.post.count();
    const totalCategories = await db.category.count();
    const totalTags = await db.tag.count();
    const totalAds = await db.ad.count();

    return NextResponse.json({ 
      message: `Database seeded! Created ${createdCount} new posts.`,
      stats: {
        posts: totalPosts,
        categories: totalCategories,
        tags: totalTags,
        ads: totalAds
      },
      admin: { email: 'admin@blog.com', password: 'admin123' } 
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed' }, { status: 500 });
  }
}
