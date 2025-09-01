# What to Eat - Code Review Todo List

## 🎯 Overall Assessment
- **Code Quality Score: 7.5/10**
- **Status: Needs Critical Fixes Before Production**
- **Review Date: 2025-09-01**
- **Reviewer: Claude Code + Gemini 2.5 Pro**

---

## 🔴 **CRITICAL ISSUES** (Must Fix Immediately)

### 1. Database Schema Mismatch ⚡ BLOCKING
**Files:** `schema.sql` vs `src/types/index.ts` vs `worker/db.ts`
**Problem:** Schema defines `prep_time`, `cook_time`, `servings`, `difficulty`, `category`, `instructions`, nutrition fields that are completely removed from TypeScript types and database operations.
**Impact:** Data loss, broken tests, sync failures

**Solution Options:**
- [ ] **Option A (Recommended):** Update TypeScript types to match full schema
- [ ] **Option B:** Simplify schema.sql to match current minimal types

**Implementation:**
- [ ] Choose approach and update all related files consistently
- [ ] Fix `worker/db.ts` createRecipe/updateRecipe methods
- [ ] Update test fixtures in `src/pages/__tests__/RecipesPage.test.tsx`
- [ ] Fix `sync-production-data.js` script

### 2. Security: Permissive CORS ⚡ SECURITY
**File:** `worker/index.ts:16`
**Problem:** `'Access-Control-Allow-Origin': '*'` allows any website to access API
**Impact:** CSRF attacks, unauthorized data access

**Fix:**
- [ ] Replace wildcard CORS with specific domains
- [ ] Add environment-based CORS configuration
- [ ] Test with production and development URLs

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': env.NODE_ENV === 'production' 
    ? 'https://eat.zhengsanniu.com' 
    : 'http://localhost:5173',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Vary': 'Origin'
}
```

---

## 🟠 **HIGH PRIORITY ISSUES** (Fix This Week)

### 3. Missing Input Validation ⚡ SECURITY
**File:** `worker/index.ts:70,90,111`
**Problem:** API endpoints use `as any` casting, no validation
**Impact:** Data corruption, injection attacks

**Implementation:**
- [ ] Install and configure Zod schemas for all endpoints
- [ ] Add RecipeSchema validation
- [ ] Add MealSchema validation  
- [ ] Add proper error responses with validation details
- [ ] Test validation with invalid payloads

```typescript
const RecipeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional()
})
```

### 4. Broken Test Infrastructure ⚡ QUALITY
**File:** `src/components/__tests__/Layout.test.tsx:16`
**Problem:** Tests fail - missing ClerkProvider, outdated mock data
**Impact:** No test coverage, CI/CD failures

**Implementation:**
- [ ] Create `src/test/test-utils.tsx` with ClerkProvider wrapper
- [ ] Fix Layout.test.tsx with proper providers
- [ ] Update RecipesPage.test.tsx mock data to match current schema
- [ ] Configure vitest.config.ts with path aliases
- [ ] Add test setup file for global configurations
- [ ] Verify all tests pass locally and in CI

---

## 🟡 **MEDIUM PRIORITY ISSUES** (Fix Next Week)

### 5. Weak File Upload Security 
**File:** `worker/index.ts:148`
**Problem:** Only validates MIME type (easily spoofed)
**Solution:**
- [ ] Add file extension validation
- [ ] Implement file size limits  
- [ ] Add magic byte validation (optional)
- [ ] Test with spoofed file uploads

### 6. Missing Error Boundaries
**File:** `src/App.tsx`
**Problem:** Unhandled errors crash entire app
**Solution:**
- [ ] Create ErrorBoundary component
- [ ] Wrap main App with ErrorBoundary
- [ ] Add fallback UI for errors
- [ ] Test error boundary with intentional errors

### 7. No Retry Logic & Loading States
**Files:** `src/services/api.ts`, `src/pages/*.tsx`
**Problem:** No retry mechanisms, poor UX during loading/errors
**Solution:**
- [ ] Implement exponential backoff retry in API client
- [ ] Add loading skeletons to all pages
- [ ] Improve error messages with actionable guidance
- [ ] Add offline detection and handling

---

## 🟢 **LOW PRIORITY ISSUES** (Future Improvements)

### 8. Generic Documentation
**File:** `README.md`
**Problem:** Still contains Vite template content
**Solution:**
- [ ] Write project-specific README
- [ ] Document setup instructions (Clerk keys, etc.)
- [ ] List available npm scripts
- [ ] Add architecture overview
- [ ] Document deployment process

### 9. Performance Optimizations
**Various Files**
**Solutions:**
- [ ] Add image compression/resizing for uploads
- [ ] Implement React.memo for expensive components
- [ ] Add proper database indexes for user queries
- [ ] Implement query result caching
- [ ] Add bundle size analysis and optimization

### 10. Enhanced Developer Experience
**Solution:**
- [ ] Add pre-commit hooks with linting
- [ ] Set up code coverage reporting
- [ ] Add Storybook for component development
- [ ] Implement proper TypeScript strict mode
- [ ] Add API endpoint documentation

---

## 📅 **Implementation Timeline**

### Week 1: Critical Fixes (Must Have)
- [ ] **Day 1-2:** Fix schema mismatch (choose approach and implement)
- [ ] **Day 3:** Implement proper CORS configuration  
- [ ] **Day 4:** Add Zod validation to all API endpoints
- [ ] **Day 5:** Fix test infrastructure and verify all tests pass

### Week 2: High Priority (Should Have)  
- [ ] **Day 1:** Strengthen file upload validation
- [ ] **Day 2:** Add error boundaries and proper error handling
- [ ] **Day 3:** Implement retry logic and better loading states
- [ ] **Day 4:** Add comprehensive error messages
- [ ] **Day 5:** Testing and bug fixes

### Week 3: Polish (Nice to Have)
- [ ] **Day 1-2:** Performance optimizations (images, caching)
- [ ] **Day 3:** Update documentation (README, API docs)
- [ ] **Day 4:** Developer experience improvements
- [ ] **Day 5:** Final testing and deployment preparation

---

## 🧪 **Testing Checklist**

### Before Each Release:
- [ ] All tests pass locally (`npm run test`)
- [ ] Build succeeds without warnings (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] Manual testing on mobile devices
- [ ] Security scan with tools like npm audit
- [ ] Performance testing with Lighthouse

### Security Testing:
- [ ] Test CORS policy with different origins
- [ ] Attempt file upload with invalid/malicious files
- [ ] Test API endpoints with invalid/malicious payloads
- [ ] Verify authentication works properly
- [ ] Test rate limiting (if implemented)

---

## 🎯 **Success Criteria**

### Definition of Done:
- [ ] All critical and high priority issues resolved
- [ ] Test coverage above 80%
- [ ] No TypeScript errors or warnings
- [ ] Security scan shows no high/critical vulnerabilities
- [ ] Performance score above 90 on Lighthouse
- [ ] Mobile responsiveness verified on common devices
- [ ] Documentation is complete and up-to-date

---

## 🌟 **Positive Aspects to Maintain**

✅ **Keep These Excellent Patterns:**
- Modern tech stack (React 19, TypeScript, Vite, Cloudflare Workers)
- Clean component architecture with proper separation of concerns
- Effective Clerk authentication integration
- Responsive navigation with mobile hamburger menu
- Well-structured API client with proper error handling patterns
- Good project structure and file organization
- Proper CI/CD pipeline with GitHub Actions
- Modern build tools and development workflow

---

## 📝 **Notes**

- **Code Review Method:** Systematic analysis using Claude Code + Gemini 2.5 Pro
- **Focus Areas:** Security, performance, maintainability, testing, documentation
- **Architecture Strengths:** Clean React patterns, good TypeScript usage, proper auth flow
- **Main Concerns:** Data consistency, input validation, test coverage

**Next Review:** Schedule follow-up review after critical fixes are implemented.