# The Complete Git & GitHub Mastery Course
*Part 3: Advanced Git Operations & Workflows*

---

## 🎯 **Part 3: Advanced Git Operations & Workflows**

### Mastering the Complexities: Beyond Basic Git

You've mastered the foundations and collaboration. Now we dive into the advanced Git operations that separate senior developers from junior ones. These skills are essential for:

- **Complex project management** with intricate histories
- **Team leadership** requiring sophisticated Git knowledge  
- **Problem-solving** when things go wrong
- **Repository maintenance** at enterprise scale
- **Advanced workflows** for large teams

### Advanced Skills Career Impact
- **Senior Developer ($85K-$110K)**: Advanced Git operations and workflow design
- **Tech Lead ($100K-$125K)**: Repository strategy and team guidance
- **Principal Engineer ($130K-$160K)**: Complex problem resolution and architecture

---

## 🔄 **Interactive Rebase: Rewriting History Like a Pro**

### Understanding Interactive Rebase

Interactive rebase is Git's most powerful history editing tool. Think of it as:
- **Time travel with editing powers** - go back and modify the past
- **Story editor** - clean up your commit narrative
- **Quality control** - prepare perfect history for code review

### Exercise 31: Interactive Rebase Fundamentals

```bash
# Create a feature branch with messy history
git checkout -b feature/user-dashboard
echo "Basic dashboard structure" > dashboard.js
git add . && git commit -m "add dashboard"

echo "Fix typo in dashboard" >> dashboard.js  
git add . && git commit -m "fix typo"

echo "Add user widget" >> dashboard.js
git add . && git commit -m "user widget"

echo "Fix user widget bug" >> dashboard.js
git add . && git commit -m "fix widget"

echo "Add styles" > dashboard.css
git add . && git commit -m "add styles"

echo "Update styles" >> dashboard.css
git add . && git commit -m "update styles"

# View the messy history
git log --oneline -6

# Interactive rebase to clean up last 6 commits
git rebase -i HEAD~6

# In the editor that opens, you'll see:
# pick a1b2c3d add dashboard
# pick b2c3d4e fix typo  
# pick c3d4e5f user widget
# pick d4e5f6g fix widget
# pick e5f6g7h add styles
# pick f6g7h8i update styles

# Change to:
# pick a1b2c3d add dashboard
# squash b2c3d4e fix typo
# pick c3d4e5f user widget  
# squash d4e5f6g fix widget
# pick e5f6g7h add styles
# squash f6g7h8i update styles

# Save and close. Git will prompt for new commit messages.
# Result: 3 clean commits instead of 6 messy ones
```

**Interactive Rebase Commands**:
- `pick` (p): Keep commit as-is
- `reword` (r): Keep commit but edit message
- `edit` (e): Keep commit but stop to amend
- `squash` (s): Combine with previous commit
- `fixup` (f): Combine with previous, discard message
- `drop` (d): Remove commit entirely

### Exercise 32: Advanced History Editing

```bash
# Create complex scenario requiring advanced editing
git checkout -b feature/payment-system

# Simulate development over time
echo "Payment service structure" > payment.js
git add . && git commit -m "feat: add payment service structure"

echo "Add validation" >> payment.js
git add . && git commit -m "add payment validation"

echo "WIP: debugging payment flow" >> payment.js
git add . && git commit -m "WIP: debug payment"

echo "Add tests" > payment.test.js
git add . && git commit -m "add payment tests"

echo "Fixed payment bug" >> payment.js
git add . && git commit -m "fix: resolve payment processing bug"

echo "More test coverage" >> payment.test.js
git add . && git commit -m "test: expand payment test coverage"

# Interactive rebase with multiple operations
git rebase -i HEAD~6

# Advanced editing scenario:
# pick 1st commit (payment structure) 
# edit 2nd commit (to add more changes)
# drop 3rd commit (remove WIP commit)
# reword 4th commit (better test message)
# squash 5th commit (combine with 2nd)
# pick 6th commit (keep test expansion)

# When Git stops at 'edit' commit:
echo "Enhanced validation logic" >> payment.js
echo "Add error handling" >> payment.js
git add payment.js
git commit --amend -m "feat: implement comprehensive payment validation

- Add input validation for all payment fields
- Implement error handling for edge cases  
- Add security checks for payment data
- Enhanced logging for debugging"

# Continue rebase
git rebase --continue

# Result: Clean, professional commit history
git log --oneline
```

### Exercise 33: Splitting Large Commits

```bash
# Create a large commit that should be split
git checkout -b feature/authentication-system

# Make multiple unrelated changes in one commit
mkdir auth
echo "User authentication service" > auth/login.js
echo "Password hashing utilities" > auth/hash.js
echo "Session management" > auth/session.js
echo "Email verification" > auth/email.js
mkdir tests
echo "Login tests" > tests/login.test.js
echo "Hash tests" > tests/hash.test.js
echo "Session tests" > tests/session.test.js

git add .
git commit -m "Add authentication system with tests"

# This commit is too large - let's split it
git rebase -i HEAD~1

# Change 'pick' to 'edit' for the large commit
# When Git stops, reset the commit but keep changes
git reset HEAD~1

# Now commit changes logically
git add auth/login.js auth/session.js
git commit -m "feat(auth): implement login and session management"

git add auth/hash.js  
git commit -m "feat(auth): add password hashing utilities"

git add auth/email.js
git commit -m "feat(auth): implement email verification system"

git add tests/
git commit -m "test(auth): add comprehensive authentication tests"

# Continue rebase
git rebase --continue

# View the improved history
git log --oneline -4
```

---

## 🍒 **Cherry-Picking: Selective Change Management**

### Understanding Cherry-Pick

Cherry-picking lets you apply specific commits from one branch to another without merging entire branches. Essential for:
- **Hotfixes** that need to go to multiple branches
- **Feature migration** between release branches
- **Bug fixes** that need immediate deployment

### Exercise 34: Basic Cherry-Picking Operations

```bash
# Set up scenario with multiple branches
git checkout main
git checkout -b release/v2.0.0
git checkout -b hotfix/security-patch

# Create security fix
echo "Security patch for authentication" > security-fix.js
git add security-fix.js
git commit -m "fix: patch critical authentication vulnerability CVE-2024-1234"

# Create another important fix
echo "Performance optimization" > performance.js  
git add performance.js
git commit -m "perf: optimize database query performance by 40%"

# Record commit hashes for cherry-picking
SECURITY_COMMIT=$(git rev-parse HEAD~1)
PERFORMANCE_COMMIT=$(git rev-parse HEAD)

# Apply security fix to release branch
git checkout release/v2.0.0
git cherry-pick $SECURITY_COMMIT

# Apply both fixes to main branch
git checkout main
git cherry-pick $SECURITY_COMMIT $PERFORMANCE_COMMIT

# Verify commits were applied
git log --oneline -3
```

### Exercise 35: Cherry-Pick with Conflict Resolution

```bash
# Create conflicting changes scenario
git checkout main
echo "Original authentication logic" > auth.js
git add auth.js
git commit -m "feat: original authentication implementation"

# Create feature branch with changes
git checkout -b feature/enhanced-auth
echo "Enhanced authentication with 2FA" > auth.js
git add auth.js
git commit -m "feat: add two-factor authentication support"

echo "Additional security measures" >> auth.js
git add auth.js  
git commit -m "feat: implement additional security measures"

# Meanwhile, main branch has conflicting changes
git checkout main
echo "Different authentication approach" > auth.js
git add auth.js
git commit -m "refactor: simplify authentication logic"

# Try to cherry-pick the 2FA feature (will conflict)
ENHANCED_AUTH_COMMIT=$(git rev-parse feature/enhanced-auth~1)
git cherry-pick $ENHANCED_AUTH_COMMIT

# Conflict occurs - resolve manually
# Edit auth.js to combine both approaches
cat > auth.js << 'EOF'
// Enhanced authentication with 2FA (cherry-picked)
// Combined with simplified authentication logic (main branch)

class AuthenticationService {
    constructor() {
        this.twoFactorEnabled = false;
    }
    
    // Simplified base authentication
    authenticate(username, password) {
        if (!this.validateCredentials(username, password)) {
            return false;
        }
        
        // Enhanced 2FA support
        if (this.twoFactorEnabled) {
            return this.verify2FA();
        }
        
        return true;
    }
    
    validateCredentials(username, password) {
        // Simplified validation logic
        return username && password && password.length >= 8;
    }
    
    verify2FA() {
        // Two-factor authentication logic
        return this.checkTOTP() || this.checkSMS();
    }
    
    checkTOTP() {
        // Time-based one-time password verification
        return true; // Simplified for demo
    }
    
    checkSMS() {
        // SMS verification
        return true; // Simplified for demo  
    }
}
EOF

# Stage resolved file and continue cherry-pick
git add auth.js
git cherry-pick --continue

# Verify successful cherry-pick with conflict resolution
git log --oneline -2
```

### Exercise 36: Cherry-Pick Range and Advanced Options

```bash
# Set up multiple commits to cherry-pick
git checkout -b feature/dashboard-improvements

# Create series of improvements
echo "Dashboard layout update" > dashboard-layout.js
git add . && git commit -m "feat: improve dashboard layout structure"

echo "Performance metrics widget" > metrics-widget.js
git add . && git commit -m "feat: add real-time performance metrics"

echo "User activity tracking" > activity-tracker.js
git add . && git commit -m "feat: implement user activity tracking"

echo "Export functionality" > export-utils.js
git add . && git commit -m "feat: add dashboard export functionality"

echo "Bug fix for metrics" >> metrics-widget.js
git add . && git commit -m "fix: resolve metrics calculation error"

# Cherry-pick a range of commits (excluding the bug fix)
git checkout main
git cherry-pick feature/dashboard-improvements~4..feature/dashboard-improvements~1

# Cherry-pick without committing (for review)
git cherry-pick --no-commit feature/dashboard-improvements

# Review changes
git diff --staged

# Commit with custom message
git commit -m "feat: integrate dashboard improvements from feature branch

Cherry-picked improvements:
- Enhanced layout structure
- Real-time performance metrics  
- User activity tracking
- Export functionality
- Fixed metrics calculation bug

All features tested and ready for production deployment."

# Cherry-pick with signing (enterprise requirement)
git cherry-pick -S feature/dashboard-improvements~4
```

---

## 🔍 **Git Bisect: Automated Bug Hunting**

### Understanding Git Bisect

Git bisect uses binary search to find the exact commit that introduced a bug. It's like having a detective that automatically narrows down suspects:
- **Automated testing** across commit history
- **Binary search algorithm** for efficiency
- **Scriptable** for complex test scenarios

### Exercise 37: Manual Git Bisect

```bash
# Set up scenario with a bug introduction
git checkout -b feature/calculator-app

# Create initial working version
cat > calculator.js << 'EOF'
class Calculator {
    add(a, b) {
        return a + b;
    }
    
    subtract(a, b) {
        return a - b;
    }
    
    multiply(a, b) {
        return a * b;
    }
    
    divide(a, b) {
        if (b === 0) {
            throw new Error("Division by zero");
        }
        return a / b;
    }
}

module.exports = Calculator;
EOF

git add . && git commit -m "feat: implement basic calculator functionality"

# Add several more commits (bug will be in one of them)
echo "// Added logging" >> calculator.js
git add . && git commit -m "feat: add calculation logging"

echo "// Performance optimization" >> calculator.js  
git add . && git commit -m "perf: optimize calculation methods"

# Introduce the bug (subtle error in divide method)
sed -i 's/b === 0/b == 0/' calculator.js
git add . && git commit -m "refactor: improve code style"

echo "// Added validation" >> calculator.js
git add . && git commit -m "feat: add input validation"

echo "// Enhanced error handling" >> calculator.js
git add . && git commit -m "feat: improve error handling"

# Now the bug is somewhere in our history
# Create a test to detect the bug
cat > test-calculator.js << 'EOF'
const Calculator = require('./calculator.js');

const calc = new Calculator();

// Test that should fail with the bug
try {
    const result = calc.divide(10, "0"); // String "0" vs number 0
    console.log("Bug detected: Division by string '0' should throw error");
    process.exit(1); // Bug exists
} catch (error) {
    console.log("No bug: Correctly threw error for division by zero");
    process.exit(0); // No bug
}
EOF

# Start bisect process
git bisect start

# Mark current commit as bad (has bug)
git bisect bad

# Mark initial commit as good (no bug)
git bisect good HEAD~5

# Git checks out a commit in the middle
# Test manually
node test-calculator.js

# Based on result, mark as good or bad
# git bisect good   # If test passes
# git bisect bad    # If test fails

# Continue until Git finds the exact commit
# git bisect good
# git bisect bad

# Git will report: "commit xyz is the first bad commit"

# End bisect session
git bisect reset

# View the problematic commit
git show <problematic-commit-hash>
```

### Exercise 38: Automated Git Bisect

```bash
# Create automated bisect with test script
cat > bisect-test.sh << 'EOF'
#!/bin/bash

# Automated test script for git bisect
echo "Running automated bisect test..."

# Check if calculator.js exists
if [ ! -f "calculator.js" ]; then
    echo "calculator.js not found"
    exit 125  # Skip this commit
fi

# Run the test
if node test-calculator.js > /dev/null 2>&1; then
    echo "Test passed - no bug in this commit"
    exit 0  # Good commit
else
    echo "Test failed - bug exists in this commit"  
    exit 1  # Bad commit
fi
EOF

chmod +x bisect-test.sh

# Start automated bisect
git bisect start HEAD HEAD~5
git bisect run ./bisect-test.sh

# Git automatically finds the problematic commit
# View the result
git bisect log

# Reset bisect
git bisect reset

# Now fix the bug
sed -i 's/b == 0/b === 0/' calculator.js
git add calculator.js
git commit -m "fix: use strict equality for division by zero check

The bug was introduced by using loose equality (==) instead of strict 
equality (===) in the divide method. This caused string '0' to be 
treated as equivalent to number 0, preventing proper error handling.

Fixed by restoring strict equality check for type safety."
```

### Exercise 39: Complex Bisect Scenarios

```bash
# Set up complex scenario with multiple potential issues
git checkout -b feature/api-service

# Create API service with gradual degradation
cat > api-service.js << 'EOF'
class APIService {
    constructor() {
        this.endpoints = new Map();
        this.rateLimits = new Map();
    }
    
    registerEndpoint(path, handler) {
        this.endpoints.set(path, handler);
    }
    
    async handleRequest(path, data) {
        if (!this.endpoints.has(path)) {
            throw new Error(`Endpoint ${path} not found`);
        }
        
        const handler = this.endpoints.get(path);
        return await handler(data);
    }
}
EOF

git add . && git commit -m "feat: implement basic API service"

# Add rate limiting (working)
cat >> api-service.js << 'EOF'

    checkRateLimit(clientId) {
        const now = Date.now();
        const limit = this.rateLimits.get(clientId) || 0;
        
        if (now - limit < 1000) { // 1 second between requests
            return false;
        }
        
        this.rateLimits.set(clientId, now);
        return true;
    }
EOF

git add . && git commit -m "feat: add rate limiting functionality"

# Add caching (introduces memory leak)
cat >> api-service.js << 'EOF'

    constructor() {
        this.endpoints = new Map();
        this.rateLimits = new Map();
        this.cache = new Map(); // This will cause memory leak
    }
    
    async handleRequestWithCache(path, data) {
        const cacheKey = `${path}:${JSON.stringify(data)}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        const result = await this.handleRequest(path, data);
        this.cache.set(cacheKey, result); // Never cleared!
        return result;
    }
EOF

git add . && git commit -m "feat: add response caching for performance"

# Add more features that compound the problem
echo "// Additional API methods" >> api-service.js
git add . && git commit -m "feat: extend API functionality"

echo "// More caching logic" >> api-service.js  
git add . && git commit -m "perf: optimize caching strategy"

# Create comprehensive test for memory usage
cat > memory-test.js << 'EOF'
const APIService = require('./api-service.js');

async function testMemoryUsage() {
    const service = new APIService();
    
    // Register test endpoint
    service.registerEndpoint('/test', async (data) => {
        return { result: data.value * 2 };
    });
    
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Simulate many requests (should cause memory leak)
    for (let i = 0; i < 1000; i++) {
        if (service.handleRequestWithCache) {
            await service.handleRequestWithCache('/test', { value: i });
        }
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    console.log(`Memory increase: ${memoryIncrease} bytes`);
    
    // Fail if memory increased significantly (indicates leak)
    if (memoryIncrease > 100000) { // 100KB threshold
        console.log("Memory leak detected!");
        process.exit(1);
    } else {
        console.log("Memory usage acceptable");
        process.exit(0);
    }
}

testMemoryUsage().catch(error => {
    console.error("Test error:", error);
    process.exit(125); // Skip this commit
});
EOF

# Create automated bisect for memory leak
cat > memory-bisect.sh << 'EOF'
#!/bin/bash

echo "Testing for memory leak..."

# Check if required files exist
if [ ! -f "api-service.js" ] || [ ! -f "memory-test.js" ]; then
    exit 125  # Skip commit
fi

# Run memory test
timeout 10 node memory-test.js
exit_code=$?

if [ $exit_code -eq 124 ]; then
    echo "Test timeout - assuming bad commit"
    exit 1
fi

exit $exit_code
EOF

chmod +x memory-bisect.sh

# Run automated bisect to find memory leak introduction
git bisect start HEAD HEAD~5
git bisect run ./memory-bisect.sh

# Analyze result and fix the issue
git bisect reset
```

---

## 🌿 **Advanced Branch Management**

### Exercise 40: Git Worktrees for Parallel Development

```bash
# Scenario: Need to work on hotfix while feature is in progress
git checkout main

# Create main worktree for feature development
git worktree add ../feature-workspace feature/user-notifications

# Create separate worktree for hotfix
git worktree add ../hotfix-workspace -b hotfix/critical-security

# Work in feature workspace
cd ../feature-workspace
echo "User notification system" > notifications.js
git add . && git commit -m "feat: implement user notifications"

# Simultaneously work on hotfix in different directory
cd ../hotfix-workspace  
echo "Security patch applied" > security-patch.js
git add . && git commit -m "fix: patch authentication vulnerability"

# Push hotfix immediately
git push origin hotfix/critical-security

# Continue feature work
cd ../feature-workspace
echo "Email notification support" >> notifications.js
git add . && git commit -m "feat: add email notification delivery"

# Clean up worktrees when done
cd ../main-workspace
git worktree remove ../feature-workspace
git worktree remove ../hotfix-workspace

# List active worktrees
git worktree list
```

### Exercise 41: Git Subtrees for Dependency Management

```bash
# Add external library as subtree
git subtree add --prefix=libs/utility-library \
    https://github.com/company/utility-library.git main --squash

# Make local changes to the subtree
echo "// Local customization" >> libs/utility-library/main.js
git add libs/utility-library/main.js
git commit -m "feat: customize utility library for project needs"

# Pull updates from upstream subtree
git subtree pull --prefix=libs/utility-library \
    https://github.com/company/utility-library.git main --squash

# Push local changes back to subtree repository
git subtree push --prefix=libs/utility-library \
    https://github.com/company/utility-library.git feature/local-improvements

# Extract subtree into separate repository
git subtree split --prefix=libs/utility-library -b utility-library-split
git push origin utility-library-split
```

### Exercise 42: Advanced Stashing Techniques

```bash
# Create complex stashing scenario
git checkout -b feature/payment-processing

# Start working on multiple files
echo "Payment gateway integration" > payment-gateway.js
echo "Credit card validation" > card-validator.js
echo "Payment processing tests" > payment.test.js

# Stage some changes
git add payment-gateway.js

# Modify staged file further
echo "Additional gateway logic" >> payment-gateway.js

# Stash with custom message and include untracked files
git stash push -u -m "WIP: payment processing implementation"

# Stash only specific files
echo "Database migration for payments" > payment-migration.sql
echo "API documentation" > payment-api-docs.md
git add payment-migration.sql

# Stash only the staged changes
git stash push -m "payment database migration" payment-migration.sql

# Create partial stash with interactive selection
git stash push -p -m "selective payment changes"

# List all stashes
git stash list

# Apply specific stash without removing it
git stash apply stash@{1}

# Apply stash and immediately drop it
git stash pop stash@{0}

# Create branch from stash
git stash branch feature/payment-migration stash@{1}

# Show stash contents
git stash show -p stash@{0}

# Clear all stashes
# git stash clear
```

---

## 🔧 **Advanced Merge Strategies**

### Exercise 43: Octopus Merges for Multiple Branches

```bash
# Set up scenario with multiple feature branches ready to merge
git checkout main

# Create multiple feature branches
git checkout -b feature/user-auth
echo "User authentication system" > auth.js
git add . && git commit -m "feat: implement user authentication"

git checkout main
git checkout -b feature/payment-system  
echo "Payment processing system" > payments.js
git add . && git commit -m "feat: implement payment processing"

git checkout main
git checkout -b feature/notification-system
echo "Notification delivery system" > notifications.js
git add . && git commit -m "feat: implement notification system"

# Perform octopus merge (merge multiple branches at once)
git checkout main
git merge feature/user-auth feature/payment-system feature/notification-system

# View the octopus merge in log
git log --graph --oneline -10

# Alternative: Create octopus merge manually
git checkout main
git reset --hard HEAD~1  # Undo the octopus merge

# Manual octopus merge with custom message
git merge --no-ff -m "feat: integrate user auth, payments, and notifications

This octopus merge combines three major feature implementations:
- User authentication with OAuth2 support
- Payment processing with multiple gateways
- Real-time notification delivery system

All features have been tested individually and in integration.
Ready for staging deployment." \
feature/user-auth feature/payment-system feature/notification-system
```

### Exercise 44: Custom Merge Strategies

```bash
# Set up conflict scenario requiring custom strategy
git checkout -b feature/config-management
cat > config.json << 'EOF'
{
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "production_db"
  },
  "api": {
    "version": "v1",
    "rate_limit": 1000
  },
  "features": {
    "new_dashboard": false,
    "advanced_search": false
  }
}
EOF

git add . && git commit -m "feat: add production configuration"

# Create conflicting branch
git checkout main
cat > config.json << 'EOF'
{
  "database": {
    "host": "db.company.com",
    "port": 5432,
    "name": "main_database"
  },
  "api": {
    "version": "v2",
    "rate_limit": 2000
  },
  "features": {
    "new_dashboard": true,
    "advanced_search": true
  }
}
EOF

git add . && git commit -m "feat: update configuration for v2 release"

# Use 'ours' strategy to keep main branch version
git merge -s ours feature/config-management

# Use 'theirs' strategy to take feature branch version
git reset --hard HEAD~1
git merge -X theirs feature/config-management

# Use custom merge strategy for specific files
git reset --hard HEAD~1
git merge --no-commit feature/config-management

# Manually resolve by combining both configurations
cat > config.json << 'EOF'
{
  "database": {
    "host": "db.company.com",
    "port": 5432,
    "name": "main_database"
  },
  "api": {
    "version": "v2",
    "rate_limit": 2000
  },
  "features": {
    "new_dashboard": true,
    "advanced_search": true,
    "legacy_support": true
  }
}
EOF

git add config.json
git commit -m "merge: combine configuration changes with enhanced features"
```

### Exercise 45: Merge Conflict Resolution Mastery

```bash
# Create complex merge conflict scenario
git checkout -b feature/api-refactor

cat > api.js << 'EOF'
class APIHandler {
    constructor() {
        this.version = "2.0";
        this.endpoints = new Map();
        this.middleware = [];
    }
    
    addEndpoint(path, handler) {
        this.endpoints.set(path, handler);
    }
    
    async processRequest(request) {
        // Enhanced request processing
        const result = await this.validateRequest(request);
        return this.formatResponse(result);
    }
    
    validateRequest(request) {
        // New validation logic
        return request.data;
    }
    
    formatResponse(data) {
        return {
            status: "success",
            data: data,
            timestamp: new Date().toISOString()
        };
    }
}
EOF

git add . && git commit -m "feat: refactor API with enhanced processing"

# Meanwhile, main branch has different changes
git checkout main
cat > api.js << 'EOF'
class APIHandler {
    constructor() {
        this.version = "1.5";
        this.routes = new Map();
        this.filters = [];
    }
    
    registerRoute(path, callback) {
        this.routes.set(path, callback);
    }
    
    async handleRequest(req) {
        // Improved request handling
        const validated = await this.securityCheck(req);
        return this.buildResponse(validated);
    }
    
    securityCheck(request) {
        // Security enhancements
        return request.payload;
    }
    
    buildResponse(payload) {
        return {
            success: true,
            result: payload,
            meta: {
                version: this.version,
                timestamp: Date.now()
            }
        };
    }
}
EOF

git add . && git commit -m "feat: enhance API security and response format"

# Attempt merge (will conflict)
git merge feature/api-refactor

# Complex conflict resolution strategy
# 1. Analyze both versions
git show HEAD:api.js > main-version.js
git show feature/api-refactor:api.js > feature-version.js

# 2. Create combined solution
cat > api.js << 'EOF'
class APIHandler {
    constructor() {
        this.version = "2.0";  // Use newer version from feature
        this.endpoints = new Map();  // Use feature naming
        this.routes = new Map();     // Keep main compatibility
        this.middleware = [];        // Feature middleware
        this.filters = [];          // Main filters
    }
    
    // Feature method
    addEndpoint(path, handler) {
        this.endpoints.set(path, handler);
    }
    
    // Main method for compatibility
    registerRoute(path, callback) {
        this.routes.set(path, callback);
    }
    
    // Combined request processing
    async processRequest(request) {
        // Security check from main
        const secured = await this.securityCheck(request);
        // Validation from feature
        const validated = await this.validateRequest(secured);
        // Enhanced formatting
        return this.formatResponse(validated);
    }
    
    // Alias for compatibility
    async handleRequest(req) {
        return this.processRequest(req);
    }
    
    // Security from main branch
    securityCheck(request) {
        // Security enhancements
        return request.payload || request.data;
    }
    
    // Validation from feature branch
    validateRequest(request) {
        // New validation logic
        return request;
    }
    
    // Combined response formatting
    formatResponse(data) {
        return {
            status: "success",      // Feature format
            success: true,          // Main compatibility
            data: data,
            result: data,           // Main compatibility
            meta: {
                version: this.version,
                timestamp: new Date().toISOString()
            }
        };
    }
}
EOF

# Stage resolved file
git add api.js

# Commit with detailed resolution message
git commit -m "merge: resolve API refactor conflicts with backward compatibility

Conflict Resolution Strategy:
- Combined version numbering (2.0 from feature)
- Maintained both endpoint and route registration methods
- Integrated security checks from main branch
- Enhanced validation from feature branch  
- Unified response format supporting both APIs

Backward Compatibility:
- Kept registerRoute method for existing code
- Maintained success field in responses
- Added handleRequest alias for processRequest

Forward Compatibility:
- Enhanced middleware and filter support
- Improved validation pipeline
- Modern response formatting

All existing API consumers will continue to work while
new consumers can use enhanced features."

# Clean up temporary files
rm main-version.js feature-version.js
```

---

## 🔄 **Git Reflog: The Safety Net**

### Exercise 46: Using Reflog for Recovery

```bash
# Create scenario where reflog saves the day
git checkout -b feature/data-processing

# Create important work
cat > data-processor.js << 'EOF'
class DataProcessor {
    constructor() {
        this.processors = new Map();
        this.cache = new Map();
    }
    
    registerProcessor(type, processor) {
        this.processors.set(type, processor);
    }
    
    async processData(type, data) {
        if (!this.processors.has(type)) {
            throw new Error(`No processor for type: ${type}`);
        }
        
        const cacheKey = `${type}:${JSON.stringify(data)}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        const processor = this.processors.get(type);
        const result = await processor(data);
        this.cache.set(cacheKey, result);
        
        return result;
    }
    
    clearCache() {
        this.cache.clear();
    }
}

module.exports = DataProcessor;
EOF

git add . && git commit -m "feat: implement data processing system with caching"

# Add more important commits
echo "// Performance optimizations" >> data-processor.js
git add . && git commit -m "perf: optimize data processing performance"

echo "// Error handling improvements" >> data-processor.js
git add . && git commit -m "feat: enhance error handling and logging"

# Accidentally perform destructive operation
git reset --hard HEAD~10  # Oops! Went too far back

# Check reflog to see what happened
git reflog

# Recover the lost commits
# Find the commit hash from reflog (e.g., abc123)
LOST_COMMIT=$(git reflog | grep "enhance error handling" | awk '{print $1}')
git reset --hard $LOST_COMMIT

# Verify recovery
git log --oneline -5

# Create new branch from reflog entry
git branch recovered-work HEAD@{2}
```

### Exercise 47: Advanced Reflog Operations

```bash
# Explore reflog capabilities
git checkout main

# Show reflog for specific branch
git reflog show feature/data-processing

# Show reflog with dates
git reflog --date=iso

# Find commits by message in reflog
git reflog --grep="performance"

# Show reflog for specific time period
git reflog --since="2 hours ago"

# Recover deleted branch using reflog
git branch -D feature/data-processing
# Branch is gone, but reflog remembers
git reflog --all | grep "data-processing"

# Recover the deleted branch
BRANCH_TIP=$(git reflog --all | grep "data-processing" | head -1 | awk '{print $1}')
git branch feature/data-processing-recovered $BRANCH_TIP

# Expire reflog entries (cleanup)
git reflog expire --expire=30.days refs/heads/main
git reflog expire --expire-unreachable=7.days --all

# Show detailed reflog with patch
git log -g --patch
```

---

## 🧹 **Repository Maintenance and Optimization**

### Exercise 48: Git Garbage Collection and Optimization

```bash
# Check repository size and object count
git count-objects -v

# Show repository disk usage
du -sh .git

# Run garbage collection manually
git gc

# Aggressive garbage collection for maximum compression
git gc --aggressive --prune=now

# Check for dangling objects
git fsck --unreachable

# Find large objects in repository
git rev-list --objects --all | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  awk '/^blob/ {print substr($0,6)}' | \
  sort --numeric-sort --key=2 | \
  tail -10

# Remove large files from history (use with caution)
# First, identify the large file path
LARGE_FILE="path/to/large-file.zip"

# Remove from all history using filter-branch
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch $LARGE_FILE" \
  --prune-empty --tag-name-filter cat -- --all

# Alternative: Use git-filter-repo (modern approach)
# pip install git-filter-repo
# git filter-repo --path $LARGE_FILE --invert-paths

# Force garbage collection after filter-branch
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Exercise 49: Repository Health Monitoring

```bash
# Create comprehensive repository health check script
cat > repo-health-check.sh << 'EOF'
#!/bin/bash

echo "🔍 Repository Health Check Report"
echo "Generated: $(date)"
echo "Repository: $(git remote get-url origin 2>/dev/null || echo 'Local repository')"
echo "=================================="

# Basic repository information
echo ""
echo "📊 Repository Overview:"
echo "Current branch: $(git branch --show-current)"
echo "Total commits: $(git rev-list --all --count)"
echo "Total branches: $(git branch -a | wc -l)"
echo "Total tags: $(git tag | wc -l)"
echo "Repository size: $(du -sh .git | cut -f1)"

# Object statistics
echo ""
echo "🗃️ Object Statistics:"
git count-objects -v

# Check for issues
echo ""
echo "🔧 Health Checks:"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Uncommitted changes detected"
else
    echo "✅ Working directory clean"
fi

# Check for untracked files
if [ -n "$(git ls-files --others --exclude-standard)" ]; then
    echo "⚠️  Untracked files present"
else
    echo "✅ No untracked files"
fi

# Check for large files
echo ""
echo "📦 Large Files Analysis:"
git rev-list --objects --all | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  awk '/^blob/ {if($3 > 1048576) print $4 " (" $3/1048576 " MB)"}' | \
  head -5

# Check for potential issues
echo ""
echo "🚨 Potential Issues:"

# Check for merge conflicts markers
if git grep -l "<<<<<<< \|======= \|>>>>>>> " 2>/dev/null; then
    echo "⚠️  Merge conflict markers found in files"
else
    echo "✅ No merge conflict markers"
fi

# Check for debugging statements
if git grep -l "console.log\|debugger\|TODO\|FIXME" 2>/dev/null; then
    echo "⚠️  Debug statements or TODOs found"
else
    echo "✅ No debug statements found"
fi

# Repository integrity check
echo ""
echo "🔒 Integrity Check:"
if git fsck --quiet 2>/dev/null; then
    echo "✅ Repository integrity verified"
else
    echo "❌ Repository integrity issues detected"
    git fsck 2>&1
fi

# Recommendations
echo ""
echo "💡 Recommendations:"

# Check if GC is needed
OBJECT_COUNT=$(git count-objects | awk '{print $1}')
if [ $OBJECT_COUNT -gt 1000 ]; then
    echo "🧹 Consider running 'git gc' to optimize repository"
fi

# Check for old branches
OLD_BRANCHES=$(git for-each-ref --format='%(refname:short) %(committerdate)' refs/heads | \
  awk '$2 < "'$(date -d '30 days ago' '+%Y-%m-%d')'"' | wc -l)
if [ $OLD_BRANCHES -gt 0 ]; then
    echo "🌿 Consider cleaning up $OLD_BRANCHES old branches"
fi

echo ""
echo "✅ Health check complete!"
EOF

chmod +x repo-health-check.sh
./repo-health-check.sh
```

### Exercise 50: Advanced Repository Cleanup

```bash
# Clean up repository systematically

# 1. Remove merged branches
echo "Cleaning up merged branches..."
git branch --merged main | grep -v "main\|master" | xargs -n 1 git branch -d

# 2. Remove remote tracking branches for deleted remotes
git remote prune origin

# 3. Clean up untracked files and directories
git clean -fd

# 4. Remove ignored files from working directory
git clean -fX

# 5. Compress and optimize repository
git repack -ad
git prune

# 6. Create backup before major cleanup
git bundle create ../repository-backup.bundle --all

# 7. Verify backup integrity
git bundle verify ../repository-backup.bundle

# 8. Remove specific file types from history (if needed)
# Example: Remove all .log files from history
# git filter-repo --path-glob '*.log' --invert-paths

# 9. Update references and clean up
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 10. Final verification
echo "Final repository statistics:"
git count-objects -v
du -sh .git
```

---

## 🎓 **Part 3 Knowledge Check and Mastery**

### Advanced Operations Quiz

1. **Interactive Rebase**: How do you combine commits while keeping others separate?
2. **Cherry-picking**: What's the difference between cherry-pick and merge?
3. **Git Bisect**: How would you automate bug hunting with custom tests?
4. **Worktrees**: When would you use worktrees instead of branches?
5. **Reflog**: How do you recover a deleted branch?

### Practical Mastery Challenge

```bash
# Complete scenario: Fix a complex repository situation
git checkout -b challenge/complex-scenario

# 1. Create messy history with 8 commits
for i in {1..8}; do
    echo "Change $i" >> file$i.txt
    git add .
    if [ $((i % 2)) -eq 0 ]; then
        git commit -m "fix: correction $i"
    else
        git commit -m "feat: feature $i"
    fi
done

# 2. Use interactive rebase to:
#    - Combine fix commits with their preceding features
#    - Reorder commits logically
#    - Remove one unnecessary commit
git rebase -i HEAD~8

# 3. Create a bug scenario and use bisect to find it
echo "bug introduced" >> file4.txt
git add . && git commit -m "refactor: code cleanup"

# Write test and use bisect to find when bug was introduced
cat > bug-test.sh << 'EOF'
#!/bin/bash
if grep -q "bug introduced" file4.txt; then
    exit 1  # Bug found
else
    exit 0  # No bug
fi
EOF

chmod +x bug-test.sh
git bisect start HEAD HEAD~9
git bisect run ./bug-test.sh

# 4. Fix the bug and clean up
git bisect reset
sed -i '/bug introduced/d' file4.txt
git add file4.txt
git commit -m "fix: remove problematic code"

# 5. Use cherry-pick to apply fix to another branch
git checkout main
git cherry-pick challenge/complex-scenario
```

### Real-World Scenarios Mastery

#### Scenario 1: Emergency Production Fix

```bash
# Production is down, need immediate fix across multiple branches
git checkout main
git checkout -b hotfix/production-emergency

# Apply fix
echo "Emergency fix applied" > emergency-fix.js
git add . && git commit -m "fix: resolve critical production issue"

# Apply to release branches
git checkout release/v2.0
git cherry-pick hotfix/production-emergency

git checkout release/v2.1  
git cherry-pick hotfix/production-emergency

# Apply to development branch
git checkout develop
git cherry-pick hotfix/production-emergency

# Tag and deploy
git checkout main
git merge --no-ff hotfix/production-emergency
git tag -a v2.1.1 -m "Emergency hotfix v2.1.1"
```

#### Scenario 2: Repository Corruption Recovery

```bash
# Simulate corruption and recovery
cp -r .git .git-backup

# Use reflog and fsck to identify and fix issues
git fsck --full
git reflog --all

# Recover from backup if needed
# rm -rf .git
# mv .git-backup .git

# Alternative: recover from remote
# git clone --mirror <remote-url> .git
```

---

## 🚀 **What's Next in Part 4**

### Enterprise Branching Strategies
- **GitFlow mastery** with real enterprise scenarios
- **GitHub Flow optimization** for continuous deployment
- **GitLab Flow** for environment-based development
- **Custom workflow design** for specific team needs
- **Release management** and versioning strategies
- **Branch protection policies** and governance

### Advanced Team Collaboration
- **Code review workflows** and best practices
- **Conflict prevention** strategies for large teams
- **Repository policies** and enforcement
- **Team onboarding** and Git training programs

---

## 📚 **Part 3 Summary: Advanced Git Mastery**

You've now mastered the advanced Git operations that separate senior developers from intermediate ones:

### ✅ **Skills Acquired**
- **Interactive rebase** for clean history management
- **Cherry-picking** for selective change application
- **Git bisect** for automated debugging
- **Advanced branching** with worktrees and subtrees
- **Complex merge strategies** and conflict resolution
- **Repository maintenance** and optimization
- **Recovery techniques** using reflog and fsck

### 🎯 **Career Impact**
These advanced skills enable you to:
- **Lead technical teams** with confidence
- **Solve complex repository problems** quickly
- **Design efficient workflows** for large projects
- **Maintain repository health** at enterprise scale
- **Recover from disasters** and mistakes
- **Optimize team productivity** through better Git practices

### 🏆 **Professional Recognition**
You can now handle:
- Senior developer responsibilities
- Complex merge scenarios  
- Repository architecture decisions
- Team mentoring and training
- Emergency response situations
- Enterprise-scale challenges

---

*Continue to Part 4 for enterprise branching strategies and team workflow mastery!*
