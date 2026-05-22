# ✅ NearNest Developer Onboarding Checklist

## 🚀 First Day (2 hours)

### 1. Environment Setup (15 min)
- [ ] Clone repository: `git clone <repo-url>`
- [ ] Navigate to project: `cd NearNest`
- [ ] Read [QUICKSTART.md](./QUICKSTART.md)

### 2. Backend Setup (30 min)
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```
- [ ] Backend runs on `http://localhost:5000`
- [ ] No errors in console
- [ ] Check logs are being created

### 3. Frontend Setup (30 min)
```bash
cd ../client
npm install
npm run dev
```
- [ ] Frontend runs on `http://localhost:3000`
- [ ] No errors in console
- [ ] Page loads successfully

### 4. Test Basic Functionality (30 min)
- [ ] Open http://localhost:3000 in browser
- [ ] Click "Use Current Location"
- [ ] See products populate
- [ ] Adjust radius slider
- [ ] Products update in real-time
- [ ] Try search functionality
- [ ] Try category filtering

### 5. Documentation Review (15 min)
- [ ] Skim [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- [ ] Bookmark [API_REFERENCE.md](./API_REFERENCE.md)
- [ ] Review [DEVELOPMENT_HANDOFF.md](./DEVELOPMENT_HANDOFF.md) overview

---

## 📚 Second Day (3 hours)

### 1. Code Architecture Tour (1 hour)
- [ ] Review backend folder structure in VS Code
- [ ] Read [server/src/config/env.ts](./server/src/config/env.ts) (env setup)
- [ ] Read [server/src/models/Schemas.ts](./server/src/models/Schemas.ts) (data models)
- [ ] Read [server/src/services/geoService.ts](./server/src/services/geoService.ts) (core logic)
- [ ] Review [server/src/routes/apiRoutes.ts](./server/src/routes/apiRoutes.ts) (endpoints)

### 2. Frontend Architecture Tour (1 hour)
- [ ] Review client folder structure
- [ ] Read [client/src/pages/Home.tsx](./client/src/pages/Home.tsx)
- [ ] Read [client/src/hooks/useNearbyProducts.ts](./client/src/hooks/useNearbyProducts.ts)
- [ ] Read [client/src/types/api.ts](./client/src/types/api.ts)
- [ ] Check [client/tailwind.config.ts](./client/tailwind.config.ts) for design tokens

### 3. API Testing (1 hour)
- [ ] Test `/auth/register` endpoint with Postman/cURL
- [ ] Test `/auth/login` endpoint
- [ ] Test `/geo/nearby-products` with your location
- [ ] See responses match [API_REFERENCE.md](./API_REFERENCE.md)

### 4. Database Exploration (30 min)
- [ ] Connect to MongoDB Atlas
- [ ] View database structure
- [ ] Check collection indexes
- [ ] Verify 2dsphere index on location fields

### 5. Documentation Mastery (30 min)
- [ ] Fully read [API_REFERENCE.md](./API_REFERENCE.md)
- [ ] Fully read [DEVELOPMENT_HANDOFF.md](./DEVELOPMENT_HANDOFF.md)
- [ ] Mark sections for future reference

---

## 🔧 Third Day (2 hours)

### 1. Component Development Setup
- [ ] Understand React Hook patterns used
- [ ] Review existing components
- [ ] Check Tailwind CSS classes used
- [ ] Understand mobile-first approach

### 2. State Management
- [ ] Review [client/src/context/](./client/src/context/) structure
- [ ] Understand CartContext pattern
- [ ] Understand AuthContext pattern
- [ ] Know how to use custom hooks

### 3. Styling Consistency
- [ ] Check color palette in tailwind.config.ts
- [ ] Understand responsive breakpoints
- [ ] Review existing component styling
- [ ] Test on mobile viewport (375px)

### 4. Error Handling
- [ ] Review how errors are handled in services
- [ ] See how API errors are displayed
- [ ] Understand error types and messages

---

## 🎯 First Week Goals

### Days 1-3: Learning Phase ✅ (Above)

### Days 4-5: Contribution Phase

#### Choose ONE feature to implement:

**Option A: Auth UI Pages** (3 hours)
- [ ] Create `client/src/pages/auth/Login.tsx`
- [ ] Create `client/src/pages/auth/Register.tsx`
- [ ] Create `client/src/pages/auth/OTPVerify.tsx`
- [ ] Test with backend API
- [ ] Ensure mobile responsive

**Option B: Product Detail Page** (3 hours)
- [ ] Create `client/src/pages/ProductDetail.tsx`
- [ ] Fetch product from API
- [ ] Build image carousel
- [ ] Display seller info
- [ ] Add to cart functionality

**Option C: Shopping Cart** (3 hours)
- [ ] Update CartContext with full CRUD
- [ ] Create `client/src/pages/Cart.tsx`
- [ ] Implement item management
- [ ] Add persistence to localStorage
- [ ] Test on mobile

---

## 📖 Key Files to Know

### Must Read
- [README.md](./README.md) - Project overview
- [QUICKSTART.md](./QUICKSTART.md) - 5-minute guide
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Complete setup
- [API_REFERENCE.md](./API_REFERENCE.md) - All endpoints

### Architecture & Decisions
- [DEVELOPMENT_HANDOFF.md](./DEVELOPMENT_HANDOFF.md) - Why things are designed this way
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Feature matrix and progress
- [IMPLEMENTATION_PROGRESS.md](./IMPLEMENTATION_PROGRESS.md) - Detailed implementation notes

### Backend Core
- [server/src/config/env.ts](./server/src/config/env.ts) - Environment configuration
- [server/src/models/Schemas.ts](./server/src/models/Schemas.ts) - Database models
- [server/src/services/geoService.ts](./server/src/services/geoService.ts) - Geospatial logic
- [server/src/middleware/auth.ts](./server/src/middleware/auth.ts) - JWT authentication

### Frontend Core
- [client/src/pages/Home.tsx](./client/src/pages/Home.tsx) - Main discovery page
- [client/src/hooks/useNearbyProducts.ts](./client/src/hooks/useNearbyProducts.ts) - Data fetching
- [client/src/types/api.ts](./client/src/types/api.ts) - Type definitions

---

## 🧪 Testing Checklist

### Before Starting Work
- [ ] Backend running and no errors
- [ ] Frontend running and no errors
- [ ] Can access http://localhost:3000
- [ ] Console has no red errors

### After Making Changes
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Feature works on desktop (1920px)
- [ ] Feature works on tablet (768px)
- [ ] Feature works on mobile (375px)
- [ ] API calls return correct data

### Before Committing
- [ ] Code follows existing patterns
- [ ] Added comments for complex logic
- [ ] Tested error scenarios
- [ ] No console warnings
- [ ] Type safety maintained (no `any`)

---

## 🐛 Troubleshooting Guide

### "Cannot find module" error
```bash
cd [folder-with-error]
rm -rf node_modules package-lock.json
npm install
```

### Backend not responding
- Check if running: `npm run dev`
- Check port 5000 is free: `netstat -an | grep 5000`
- Verify .env file exists and has values

### Frontend not loading
- Clear browser cache (Ctrl+Shift+Del)
- Restart dev server
- Check console for errors (F12)

### Database connection error
- Check MongoDB URI in .env
- Verify IP is whitelisted on MongoDB Atlas
- Test connection: `mongosh "mongodb+srv://..."`

### Redis connection error
- Check Redis is running locally or accessible
- Verify REDIS_URL format in .env
- Test with: `redis-cli ping`

---

## 📊 Project Metrics to Track

As you work, monitor these:

| Metric | Target | How to Check |
|--------|--------|-------------|
| TypeScript Errors | 0 | `npm run build` |
| Lighthouse Score | 90+ | Chrome DevTools → Lighthouse |
| Mobile Width | 375px+ | Chrome DevTools responsive |
| Bundle Size | <500KB | `npm run build` info |
| API Response Time | <100ms | Network tab in DevTools |

---

## 💬 Communication Checklist

### When Starting Work
- [ ] Assign yourself to issue/task
- [ ] Create feature branch: `git checkout -b feature/name`
- [ ] Let team know what you're working on

### During Work
- [ ] Commit frequently with clear messages
- [ ] Keep PRs focused on single feature
- [ ] Ask questions in team chat

### When Done
- [ ] Create pull request with description
- [ ] Reference related issues
- [ ] Request review from senior dev
- [ ] Merge after approval
- [ ] Delete feature branch

---

## 🎓 Learning Resources

### For Understanding Technologies
- [MongoDB Docs](https://docs.mongodb.com/) - Database queries
- [React Docs](https://react.dev/) - Hook patterns
- [Express Docs](https://expressjs.com/) - Middleware
- [Tailwind Docs](https://tailwindcss.com/) - Styling
- [TypeScript Docs](https://www.typescriptlang.org/) - Type safety
- [JWT.io](https://jwt.io/) - Token understanding

### For Architecture Patterns
- [12 Factor App](https://12factor.net/) - App design
- [REST API Design](https://restfulapi.net/) - API patterns
- [Clean Code](https://en.wikipedia.org/wiki/Clean_code) - Code quality
- [Design Patterns](https://refactoring.guru/design-patterns) - Common patterns

---

## ✨ Success Criteria for Week 1

By end of first week, you should be able to:

- [ ] ✅ Run backend and frontend locally
- [ ] ✅ Explain project architecture
- [ ] ✅ Test API endpoints with tools
- [ ] ✅ Read and understand existing code
- [ ] ✅ Make a small code contribution
- [ ] ✅ Deploy a feature without breaking existing code
- [ ] ✅ Write TypeScript with proper types
- [ ] ✅ Debug issues using browser DevTools

---

## 🎯 First PR Checklist

Before submitting first pull request:

### Code Quality
- [ ] Follows existing naming conventions
- [ ] Uses TypeScript types (no `any`)
- [ ] Has error handling
- [ ] Has comments for complex logic
- [ ] Passes TypeScript check: `npm run build`

### Functionality
- [ ] Feature works as described
- [ ] Tested on mobile (375px+)
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] API calls working correctly

### Documentation
- [ ] Updated relevant .md files
- [ ] Added code comments where needed
- [ ] PR description explains changes

### Testing
- [ ] Manually tested feature
- [ ] Tested error scenarios
- [ ] Verified mobile responsiveness

---

## 🚀 Progression Path

```
Week 1: Learning Phase
  ├─ Setup environment
  ├─ Understand architecture
  ├─ Read documentation
  └─ Make first contribution

Week 2-3: Feature Development
  ├─ Build assigned features
  ├─ Test thoroughly
  ├─ Get code reviews
  └─ Iterate on feedback

Week 4+: Independent Development
  ├─ Take ownership of features
  ├─ Mentor new team members
  ├─ Optimize performance
  └─ Lead architecture discussions
```

---

## 📝 Notes Template

Create a file for your development notes:

```
# Development Notes - [Your Name]

## Week 1 Learnings
- Understanding geospatial queries...
- How JWT token rotation works...
- Mobile-first design approach...

## Questions & Answers
- Q: How do I...?
- A: You can find this in...

## Useful Commands
- npm run dev
- npm run build
- npm test

## Links
- API Reference: ./API_REFERENCE.md
- Setup Guide: ./SETUP_GUIDE.md
```

---

<div align="center">

## 🎉 Welcome to NearNest!

You've got this! 💪

Start with [QUICKSTART.md](./QUICKSTART.md) and reach out if you get stuck.

**Happy coding! 🚀**

</div>
