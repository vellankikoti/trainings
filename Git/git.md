# **Git Mastery Course - Complete Professional Guide**
## **🚀 Master Git Like a Pro!**
**Professional Mantra: "Version control is the foundation of all professional software development!"**

---

# **PART 1: INTRODUCTION, INSTALLATION & CONFIGURATION**

## **📋 What You'll Learn in Part 1**
- Introduction to Git and Version Control
- Installing Git on Different Platforms
- Essential Git Configuration
- Git Concepts and Architecture
- How Git Works Under the Hood

---

## **1. Introduction to Git**

### **What is Version Control?**
Version control is a system that records changes to files over time so you can recall specific versions later. Think of it as a "time machine" for your code.

```
Without Version Control:
├── project.py
├── project_backup.py
├── project_final.py
├── project_final_v2.py
├── project_REALLY_final.py
└── project_REALLY_REALLY_final.py

With Git:
├── project.py (with complete history)
└── .git/ (invisible database of all changes)
```

### **Why Git?**
Git is a **distributed version control system** that offers:

**🔥 Key Benefits:**
- **Complete History**: Every change is tracked with who, what, when, why
- **Branching**: Work on multiple features simultaneously
- **Collaboration**: Multiple developers can work on the same project
- **Backup**: Your code is stored in multiple places
- **Rollback**: Easily return to any previous version
- **Blame/Credit**: See who changed what and when

### **Git vs Other Version Control Systems**

| Feature | Git | SVN | CVS |
|---------|-----|-----|-----|
| **Type** | Distributed | Centralized | Centralized |
| **Speed** | Very Fast | Moderate | Slow |
| **Offline Work** | ✅ Full functionality | ❌ Limited | ❌ Limited |
| **Branching** | ✅ Lightweight | ⚠️ Heavy | ❌ Poor |
| **Merging** | ✅ Smart | ⚠️ Basic | ❌ Manual |
| **Learning Curve** | Moderate | Easy | Easy |

### **Real-World Git Usage Statistics**
- **90%** of software projects use Git
- **GitHub** hosts over 200 million repositories
- **Companies using Git**: Google, Microsoft, Facebook, Netflix, Spotify, Uber

---

## **2. Installing Git**

### **Installing on Windows**

#### **Method 1: Git for Windows (Recommended)**
```bash
# Step 1: Download from https://git-scm.com/download/win
# Step 2: Run the installer with these recommended settings:

✅ Use Git from Git Bash only (safest option)
✅ Use the OpenSSL library
✅ Checkout Windows-style, commit Unix-style line endings
✅ Use MinTTY (the default terminal of MSYS2)
✅ Enable file system caching
✅ Enable Git Credential Manager
```

#### **Method 2: Using Package Managers**
```powershell
# Using Chocolatey
choco install git

# Using Winget
winget install Git.Git

# Using Scoop
scoop install git
```

**🔧 Verify Installation:**
```bash
git --version
# Output: git version 2.42.0.windows.1
```

### **Installing on macOS**

#### **Method 1: Using Homebrew (Recommended)**
```bash
# Install Homebrew first (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Git
brew install git

# Verify installation
git --version
```

#### **Method 2: Using Xcode Command Line Tools**
```bash
# This installs Git as part of Xcode tools
xcode-select --install

# Verify
git --version
```

#### **Method 3: Download from Official Site**
```bash
# Download from: https://git-scm.com/download/mac
# Install the .dmg package
```

### **Installing on Linux**

#### **Ubuntu/Debian:**
```bash
# Update package index
sudo apt update

# Install Git
sudo apt install git-all

# Verify installation
git --version
```

#### **CentOS/RHEL/Fedora:**
```bash
# For CentOS/RHEL
sudo yum install git-all
# or for newer versions
sudo dnf install git-all

# For Fedora
sudo dnf install git-all

# Verify installation
git --version
```

#### **Arch Linux:**
```bash
sudo pacman -S git
```

### **Building Git from Source (Advanced)**
```bash
# Install dependencies (Ubuntu/Debian)
sudo apt install make libssl-dev libghc-zlib-dev libcurl4-gnutls-dev libxml2-dev libfuse-dev

# Download and compile
cd /tmp
wget https://github.com/git/git/archive/v2.42.0.tar.gz
tar -xzf v2.42.0.tar.gz
cd git-2.42.0
make configure
./configure --prefix=/usr/local
make all
sudo make install

# Verify
git --version
```

---

## **3. Essential Git Configuration**

### **Configuration Levels**
Git has three levels of configuration:

```
1. System Level   (/etc/gitconfig)           - Affects all users
2. Global Level   (~/.gitconfig)             - Affects current user
3. Local Level    (.git/config)              - Affects current repository
```

**Priority**: Local > Global > System

### **First-Time Setup (Essential)**

#### **User Identity (Required)**
```bash
# Set your name (will appear in commits)
git config --global user.name "John Doe"

# Set your email (will appear in commits)
git config --global user.email "john.doe@company.com"

# Verify settings
git config --global user.name
git config --global user.email
```

#### **Default Text Editor**
```bash
# Set VS Code as default editor
git config --global core.editor "code --wait"

# Set Vim as default editor
git config --global core.editor "vim"

# Set Nano as default editor
git config --global core.editor "nano"

# Set Sublime Text as default editor
git config --global core.editor "subl -n -w"
```

#### **Default Branch Name**
```bash
# Set default branch name to 'main' (modern standard)
git config --global init.defaultBranch main
```

### **Professional Configuration Setup**

#### **Line Ending Configuration**
```bash
# For Windows users (converts LF to CRLF on checkout, CRLF to LF on commit)
git config --global core.autocrlf true

# For Mac/Linux users (converts CRLF to LF on commit, no conversion on checkout)
git config --global core.autocrlf input

# For cross-platform teams (no automatic conversion)
git config --global core.autocrlf false
```

#### **Merge and Diff Tools**
```bash
# Set VS Code as merge tool
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd 'code --wait $MERGED'

# Set VS Code as diff tool
git config --global diff.tool vscode
git config --global difftool.vscode.cmd 'code --wait --diff $LOCAL $REMOTE'

# Alternative: Set Meld as diff/merge tool
git config --global merge.tool meld
git config --global diff.tool meld
```

#### **Useful Aliases (Time Savers)**
```bash
# Status shortcuts
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit

# Advanced aliases
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'

# Beautiful log alias
git config --global alias.lg "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"

# Show all aliases
git config --global alias.alias "config --get-regexp ^alias\."
```

#### **Security and Performance**
```bash
# Enable credential caching (15 minutes default)
git config --global credential.helper cache

# For Windows (use Windows Credential Manager)
git config --global credential.helper manager

# For macOS (use Keychain)
git config --global credential.helper osxkeychain

# Enable file system monitor for better performance
git config --global core.fsmonitor true
git config --global core.untrackedcache true
```

### **View All Configurations**
```bash
# View all configurations
git config --list

# View global configurations only
git config --global --list

# View local configurations only
git config --local --list

# View specific configuration
git config user.name
git config --global user.email
```

### **Professional .gitconfig Example**
```bash
# View your complete configuration file
cat ~/.gitconfig
```

Example professional `.gitconfig`:
```ini
[user]
    name = John Doe
    email = john.doe@company.com

[core]
    editor = code --wait
    autocrlf = input
    fsmonitor = true
    untrackedcache = true

[init]
    defaultBranch = main

[merge]
    tool = vscode

[mergetool "vscode"]
    cmd = code --wait $MERGED

[diff]
    tool = vscode

[difftool "vscode"]
    cmd = code --wait --diff $LOCAL $REMOTE

[credential]
    helper = cache --timeout=3600

[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    unstage = reset HEAD --
    last = log -1 HEAD
    lg = log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit
    alias = config --get-regexp ^alias\.

[push]
    default = simple

[pull]
    rebase = false
```

---

## **4. Git Concepts and Architecture**

### **Git's Three-Tree Architecture**

Git operates on a three-tree architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Working Tree   │───▶│  Staging Area   │───▶│   Repository    │
│   (Workspace)   │    │    (Index)      │    │   (.git dir)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
    Your files            Prepared changes        Committed history
```

#### **1. Working Tree (Working Directory)**
- Your actual project files
- Where you make changes
- What you see in your file explorer

#### **2. Staging Area (Index)**
- Intermediate area between working tree and repository
- Contains changes prepared for the next commit
- Allows you to review changes before committing

#### **3. Repository (.git directory)**
- Contains all project history
- Stores commits, branches, tags
- The permanent record of your project

### **Git Objects (Under the Hood)**

Git stores everything as objects in a content-addressable filesystem:

#### **Object Types:**
1. **Blob** - File content
2. **Tree** - Directory structure
3. **Commit** - Snapshot of the project
4. **Tag** - Named reference to a commit

```
Commit Object:
├── Tree (project snapshot)
│   ├── Blob (file1.txt content)
│   ├── Blob (file2.py content)
│   └── Tree (subdirectory)
│       └── Blob (file3.js content)
├── Parent commit(s)
├── Author information
├── Commit message
└── Timestamp
```

### **Git References**

#### **Branches**
- Lightweight, movable pointers to commits
- Default branch: `main` (or `master` in older repos)
- Current branch tracked by `HEAD`

#### **HEAD**
- Pointer to the current branch
- Shows where you are in the project history
- Can point directly to a commit (detached HEAD state)

#### **Tags**
- Immutable references to specific commits
- Used for marking releases (v1.0, v2.0, etc.)
- Two types: lightweight and annotated

### **Visual Representation**
```
main branch:    A ── B ── C ── D (HEAD)
                │
feature branch: └── E ── F
                    │
hotfix branch:      └── G

A, B, C, D, E, F, G = Commits
HEAD = Current position
```

---

## **5. How Git Works?**

### **Git's Distributed Nature**

Unlike centralized systems, Git is **distributed**:

```
Centralized (SVN):
                    ┌─────────────┐
                    │   Central   │
                    │   Server    │
                    └─────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌─────────┐        ┌─────────┐        ┌─────────┐
   │ Dev A   │        │ Dev B   │        │ Dev C   │
   │ (clone) │        │ (clone) │        │ (clone) │
   └─────────┘        └─────────┘        └─────────┘

Distributed (Git):
   ┌─────────┐        ┌─────────┐        ┌─────────┐
   │ Dev A   │◄──────►│ Dev B   │◄──────►│ Dev C   │
   │(complete│        │(complete│        │(complete│
   │  repo)  │        │  repo)  │        │  repo)  │
   └─────────┘        └─────────┘        └─────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌─────────────┐
                    │   Remote    │
                    │ Repository  │
                    │  (GitHub)   │
                    └─────────────┘
```

### **Git Workflow States**

Files in Git can be in different states:

```
┌─────────────┐    git add    ┌─────────────┐    git commit    ┌─────────────┐
│ Untracked/  │──────────────►│   Staged    │─────────────────►│ Committed   │
│  Modified   │               │             │                  │             │
└─────────────┘               └─────────────┘                  └─────────────┘
       ▲                             │                                │
       │                             │                                │
       └─────────────────────────────┴────────────────────────────────┘
                            git reset / git checkout
```

#### **File States Explained:**

1. **Untracked**: New files not yet added to Git
2. **Modified**: Changes made to tracked files
3. **Staged**: Changes prepared for commit
4. **Committed**: Changes safely stored in repository

### **Git Storage Model**

#### **Content-Addressable Storage**
Git uses SHA-1 hashes to identify objects:

```bash
# Every object has a unique 40-character hash
commit: a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0
tree:   f1e2d3c4b5a6978e5d4c3b2a1f0e9d8c7b6a5948
blob:   3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b
```

#### **Delta Compression**
Git efficiently stores changes using delta compression:

```
Version 1: Full file content (100 lines)
Version 2: Base + Delta (5 changed lines)
Version 3: Base + Delta (3 changed lines)
```

### **Branch Management**

#### **Lightweight Branches**
```bash
# A branch is just a 41-byte file containing a commit hash
cat .git/refs/heads/main
# Output: a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0
```

#### **Fast-Forward vs. Merge Commits**
```
Fast-Forward Merge:
main:    A ── B ── C
         │
feature: └── D ── E

After merge:
main:    A ── B ── C ── D ── E

Three-Way Merge:
main:    A ── B ── C ── F ── G
         │              /
feature: └── D ── E ────┘
```

---

## **🧪 Hands-On Exercises - Part 1**

### **Exercise 1: Installation Verification**
```bash
# 1. Verify Git installation
git --version

# 2. Check where Git is installed
which git  # Unix/Linux/macOS
where git  # Windows

# 3. Get help
git help
git help config
```

### **Exercise 2: Basic Configuration**
```bash
# 1. Set up your identity
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 2. Set up useful configurations
git config --global init.defaultBranch main
git config --global core.editor "your-preferred-editor"

# 3. Create useful aliases
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.lg "log --oneline --graph --decorate"

# 4. View your configuration
git config --list --global
```

### **Exercise 3: Understanding Git Internals**
```bash
# 1. Create a test directory
mkdir git-test
cd git-test

# 2. Initialize a Git repository
git init

# 3. Explore the .git directory
ls -la
ls -la .git/
cat .git/HEAD
ls .git/refs/heads/

# 4. Create a file and see Git objects
echo "Hello, Git!" > hello.txt
git add hello.txt
git commit -m "Initial commit"

# 5. Explore Git objects
find .git/objects/ -type f
git cat-file -t <object-hash>  # Replace with actual hash
git cat-file -p <object-hash>  # Replace with actual hash
```

### **Exercise 4: Configuration Troubleshooting**
```bash
# 1. Check current configuration
git config --list

# 2. Find configuration files
git config --list --show-origin

# 3. Fix common issues
# If name/email not set:
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# If line ending issues:
git config --global core.autocrlf input  # Mac/Linux
git config --global core.autocrlf true   # Windows

# 4. Test configuration
git config user.name
git config user.email
```

---

## **🎯 Part 1 Summary**

You've completed the foundation of Git mastery! Here's what you've learned:

### **Key Achievements:**
✅ **Understood** what Git is and why it's essential  
✅ **Installed** Git on your operating system  
✅ **Configured** Git with professional settings  
✅ **Learned** Git's architecture and how it works  
✅ **Explored** Git's internal structure  

### **Essential Commands Learned:**
```bash
git --version          # Check Git version
git config            # Configure Git settings
git init             # Initialize repository
git help             # Get help
```

### **Professional Tips:**
- Always configure your name and email before using Git
- Use meaningful aliases to speed up your workflow
- Understand the three-tree architecture
- Git is distributed - every clone is a complete backup

---

# **PART 2: GIT WORKFLOW & FILE OPERATIONS**

## **📋 What You'll Learn in Part 2**
- The Complete Git Workflow
- Working with Files in Git
- Adding, Editing, and Managing Files
- Viewing Changes with diff
- Understanding Staging vs Working Directory
- File States and Transitions

---

## **6. The Git Workflow**

### **Understanding the Complete Workflow**

The Git workflow involves moving changes through different states:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Untracked     │───▶│    Modified     │───▶│     Staged      │───▶│   Committed     │
│                 │    │                 │    │                 │    │                 │
│ New files not   │    │ Changed files   │    │ Changes ready   │    │ Changes saved   │
│ in Git yet      │    │ in working dir  │    │ for commit      │    │ in repository   │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         │                       ▼                       ▼                       │
         │              ┌─────────────────┐    ┌─────────────────┐              │
         │              │   Unmodified    │    │    Ignored      │              │
         │              │                 │    │                 │              │
         │              │ Clean files in  │    │ Files Git will  │              │
         │              │ working dir     │    │ never track     │              │
         │              └─────────────────┘    └─────────────────┘              │
         │                       ▲                                               │
         └───────────────────────┴───────────────────────────────────────────────┘
```

### **Git Command Workflow**

```bash
# 1. Check status (always start here)
git status

# 2. Add files to staging area
git add <file>          # Add specific file
git add .               # Add all files in current directory
git add -A              # Add all files in repository

# 3. Review staged changes
git diff --staged

# 4. Commit changes
git commit -m "Your commit message"

# 5. View history
git log

# 6. Check status again
git status
```

### **Professional Workflow Example**

Let's walk through a real-world development scenario:

```bash
# Starting a new feature
mkdir my-project
cd my-project
git init
git status
# On branch main
# No commits yet
# nothing to commit (create/copy files and use "git add" to track)

# Create initial project structure
mkdir src tests docs
touch README.md src/main.py tests/test_main.py docs/api.md

git status
# On branch main
# No commits yet
# Untracked files:
#   (use "git add <file>..." to include in what will be committed)
#         README.md
#         docs/
#         src/
#         tests/
```

---

## **7. Working with Files in Git**

### **Adding Files**

#### **Adding Specific Files**
```bash
# Add a single file
git add README.md

# Add multiple specific files
git add src/main.py tests/test_main.py

# Add files with pattern matching
git add *.py           # Add all Python files
git add src/*.js       # Add all JavaScript files in src/
git add "*.txt"        # Add all txt files (quoted to prevent shell expansion)
```

#### **Adding Directories**
```bash
# Add entire directory
git add src/

# Add directory recursively (default behavior)
git add docs/

# Check what will be added (dry run)
git add --dry-run .
```

#### **Interactive Adding**
```bash
# Interactive staging (choose what to stage)
git add -i

# Patch mode (stage parts of files)
git add -p filename.py

# Interactive patch mode for all modified files
git add -p
```

**Interactive Add Example:**
```bash
git add -p
# diff --git a/src/main.py b/src/main.py
# index 1234567..abcdefg 100644
# --- a/src/main.py
# +++ b/src/main.py
# @@ -1,3 +1,6 @@
#  def main():
# +    print("Starting application")
#      pass
# +    print("Application finished")
# 
# Stage this hunk [y,n,q,a,d,s,e,?]? y
```

**Interactive Options:**
- `y` - stage this hunk
- `n` - do not stage this hunk
- `q` - quit; do not stage this hunk or any remaining ones
- `a` - stage this hunk and all later hunks in the file
- `d` - do not stage this hunk or any later hunks in the file
- `s` - split the current hunk into smaller hunks
- `e` - manually edit the current hunk

### **Editing Files**

#### **Making Changes to Tracked Files**
```bash
# Create and edit a file
echo "# My Project" > README.md
echo "This is a sample project" >> README.md

# Edit with your preferred editor
nano src/main.py
# or
code src/main.py
# or
vim src/main.py

# Check file status after editing
git status
# On branch main
# Changes not staged for commit:
#   (use "git add <file>..." to update what will be committed)
#   (use "git checkout -- <file>..." to discard changes in working directory)
#         modified:   README.md
#         modified:   src/main.py
```

#### **Viewing File Contents**
```bash
# Show file content as Git sees it
git show HEAD:README.md        # File content from last commit
git show main:src/main.py      # File content from main branch

# Show file content from specific commit
git show a1b2c3d:README.md     # File content from specific commit
```

### **Viewing Changes with diff**

#### **Understanding git diff**

Git diff shows changes between different states:

```bash
# Show unstaged changes (working directory vs staging area)
git diff

# Show staged changes (staging area vs last commit)
git diff --staged
# or
git diff --cached

# Show all changes (working directory vs last commit)
git diff HEAD

# Compare specific files
git diff README.md
git diff --staged src/main.py
```

#### **Practical diff Examples**

**Example 1: Viewing unstaged changes**
```bash
# Make some changes
echo "print('Hello, World!')" > src/main.py
echo "## Installation" >> README.md

# View changes
git diff
# diff --git a/README.md b/README.md
# index e69de29..8b13789 100644
# --- a/README.md
# +++ b/README.md
# @@ -0,0 +1,2 @@
# +# My Project
# +## Installation
# diff --git a/src/main.py b/src/main.py
# index e69de29..8b13789 100644
# --- a/src/main.py
# +++ b/src/main.py
# @@ -0,0 +1 @@
# +print('Hello, World!')
```

**Reading diff output:**
- `---` old file version
- `+++` new file version
- `@@` line number information
- `+` lines added
- `-` lines removed
- ` ` (space) unchanged lines

**Example 2: Viewing only staged changes**
```bash
# Stage some files
git add README.md

# View staged changes only
git diff --staged
# Shows only changes for README.md (staged)

# View unstaged changes
git diff
# Shows only changes for src/main.py (not staged)
```

#### **Advanced diff Options**

```bash
# Word-level diff (instead of line-level)
git diff --word-diff

# Ignore whitespace changes
git diff --ignore-all-space
git diff --ignore-space-change

# Show statistics
git diff --stat

# Show both statistics and changes
git diff --stat --patch

# Compare with specific commits
git diff HEAD~1                # Compare with previous commit
git diff HEAD~2 HEAD~1         # Compare two commits
git diff main feature-branch   # Compare branches

# Compare specific files between commits
git diff HEAD~1 HEAD -- README.md

# Show diff with more context lines
git diff -U10                  # Show 10 lines of context instead of 3
```

### **Viewing Only Staged Changes**

Understanding what's staged vs what's not is crucial:

```bash
# Scenario: Multiple changes, partial staging
echo "def hello():" >> src/main.py
echo "    return 'Hello!'" >> src/main.py
echo "Documentation updated" >> README.md
echo "## Usage" >> README.md

# Stage only some changes
git add README.md

# Now you have:
# - Staged: README.md changes
# - Unstaged: src/main.py changes

# View staged changes only
git diff --staged
# Shows only README.md changes

# View unstaged changes only  
git diff
# Shows only src/main.py changes

# View all changes (staged + unstaged)
git diff HEAD
# Shows both README.md and src/main.py changes
```

#### **Status vs Diff**

```bash
# git status tells you WHAT files changed
git status
# On branch main
# Changes to be committed:
#   (use "git reset HEAD <file>..." to unstage)
#         modified:   README.md
# 
# Changes not staged for commit:
#   (use "git add <file>..." to update what will be committed)
#         modified:   src/main.py

# git diff tells you WHAT changed in the files
git diff --staged    # Shows content changes in staged files
git diff            # Shows content changes in unstaged files
```

### **Deleting Files**

#### **Removing Files from Git**

```bash
# Remove file from both Git and file system
git rm filename.txt

# Remove file from Git but keep in file system
git rm --cached filename.txt

# Remove directory recursively
git rm -r directory/

# Force remove (even if file has uncommitted changes)
git rm -f filename.txt
```

#### **Practical Examples**

**Example 1: Remove file completely**
```bash
# Create and commit a file
echo "temporary file" > temp.txt
git add temp.txt
git commit -m "Add temporary file"

# Remove it completely
git rm temp.txt
git status
# On branch main
# Changes to be committed:
#   (use "git reset HEAD <file>..." to unstage)
#         deleted:    temp.txt

git commit -m "Remove temporary file"
```

**Example 2: Stop tracking but keep file**
```bash
# Stop tracking a config file but keep it locally
git rm --cached config/secrets.conf
git status
# On branch main
# Changes to be committed:
#   (use "git reset HEAD <file>..." to unstage)
#         deleted:    config/secrets.conf
# 
# Untracked files:
#   (use "git add <file>..." to include in what will be committed)
#         config/secrets.conf

# File still exists locally but Git won't track it anymore
ls config/secrets.conf
# config/secrets.conf

git commit -m "Stop tracking secrets config file"
```

**Example 3: Handle deleted files**
```bash
# If you delete a file outside of Git
rm src/old_module.py

git status
# On branch main
# Changes not staged for commit:
#   (use "git add <file>..." to update what will be committed)
#   (use "git checkout -- <file>..." to discard changes in working directory)
#         deleted:    src/old_module.py

# Stage the deletion
git add src/old_module.py
# or
git rm src/old_module.py

git commit -m "Remove old module"
```

### **Moving and Renaming Files**

#### **Using git mv**

```bash
# Rename a file
git mv old_name.py new_name.py

# Move a file to different directory
git mv src/utils.py lib/utils.py

# Move multiple files
git mv src/*.py lib/

# Rename directory
git mv old_directory/ new_directory/
```

#### **What git mv Actually Does**

```bash
# git mv is equivalent to:
mv old_name.py new_name.py    # 1. Move the file
git rm old_name.py            # 2. Remove old name from Git
git add new_name.py           # 3. Add new name to Git

# Check the result
git status
# On branch main
# Changes to be committed:
#   (use "git reset HEAD <file>..." to unstage)
#         renamed:    old_name.py -> new_name.py
```

#### **Handling Manual Moves**

If you move/rename files outside of Git:

```bash
# Manual file rename
mv README.md README.txt

git status
# On branch main
# Changes not staged for commit:
#   (use "git add <file>..." to update what will be committed)
#   (use "git checkout -- <file>..." to discard changes in working directory)
#         deleted:    README.md
# 
# Untracked files:
#   (use "git add <file>..." to include in what will be committed)
#         README.txt

# Fix by staging both operations
git rm README.md
git add README.txt

git status
# On branch main
# Changes to be committed:
#   (use "git reset HEAD <file>..." to unstage)
#         renamed:    README.md -> README.txt
```

### **Making Changes to Files - Advanced Scenarios**

#### **Partial File Staging**

Sometimes you want to commit only part of your changes:

```bash
# Create a file with multiple logical changes
cat > src/calculator.py << EOF
def add(a, b):
    """Add two numbers"""
    return a + b

def subtract(a, b):
    """Subtract two numbers"""
    return a - b

def multiply(a, b):
    """Multiply two numbers"""
    return a * b

# TODO: Add division function
# TODO: Add validation
EOF

git add src/calculator.py
git commit -m "Add basic calculator functions"

# Now make multiple unrelated changes
cat > src/calculator.py << EOF
def add(a, b):
    """Add two numbers"""
    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
        raise TypeError("Arguments must be numbers")
    return a + b

def subtract(a, b):
    """Subtract two numbers"""
    return a - b

def multiply(a, b):
    """Multiply two numbers"""
    return a * b

def divide(a, b):
    """Divide two numbers"""
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b

# Debug print - remove before production
print("Calculator module loaded")
EOF

# Use patch mode to stage only the validation and divide function
git add -p src/calculator.py
# You can choose which hunks to stage
```

#### **Working with Binary Files**

```bash
# Add binary files (images, PDFs, etc.)
git add images/logo.png
git add docs/manual.pdf

# Git will detect binary files
git diff --stat
# images/logo.png | Bin 0 -> 15234 bytes
# docs/manual.pdf | Bin 0 -> 87456 bytes

# For binary files, diff shows only that they changed
git diff images/logo.png
# diff --git a/images/logo.png b/images/logo.png
# index 0000000..1234567 100644
# Binary files /dev/null and b/images/logo.png differ
```

#### **File Permission Changes**

```bash
# Make a script executable
chmod +x scripts/deploy.sh

git status
# On branch main
# Changes not staged for commit:
#   (use "git add <file>..." to update what will be committed)
#         modified:   scripts/deploy.sh

git diff scripts/deploy.sh
# diff --git a/scripts/deploy.sh b/scripts/deploy.sh
# old mode 100644
# new mode 100755

git add scripts/deploy.sh
git commit -m "Make deploy script executable"
```

---

## **8. Understanding File States in Detail**

### **Complete File State Diagram**

```
                    ┌─────────────────┐
                    │   Untracked     │
                    │                 │
                    │ git add         │
                    └─────────┬───────┘
                              │
                              ▼
    ┌─────────────────────────────────────────────────────────┐
    │                    Tracked                              │
    │                                                         │
    │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
    │  │ Unmodified  │───▶│  Modified   │───▶│   Staged    │ │
    │  │             │    │             │    │             │ │
    │  │             │    │             │    │             │ │
    │  └─────────────┘    └─────────────┘    └─────────────┘ │
    │         │                   │                   │      │
    │         │                   │          git commit     │
    │         │                   │                   │      │
    │         │                   └───────────────────┼──────┘
    │         │                                       │
    │         │                git reset              │
    │         │                                       │
    │         └───────────────────────────────────────┘
    │
    └─────────────────────────────────────────────────────────┘
```

### **Checking File States**

```bash
# Detailed status
git status

# Short status format
git status -s
# ?? untracked_file.txt
#  M modified_not_staged.py
# M  modified_and_staged.py
# MM modified_staged_and_modified_again.py
# A  new_file_staged.txt
# D  deleted_file.txt
# R  renamed_file.py -> new_renamed_file.py

# Status format explanation:
# First column: Staging area status
# Second column: Working directory status
# ?? = Untracked
# A  = Added (new file staged)
# M  = Modified
# D  = Deleted
# R  = Renamed
# C  = Copied
# U  = Unmerged (conflict)
```

### **File State Examples**

#### **Example 1: New File Lifecycle**
```bash
# 1. Create new file (Untracked)
echo "print('Hello')" > hello.py
git status -s
# ?? hello.py

# 2. Add to staging (Staged)
git add hello.py
git status -s
# A  hello.py

# 3. Commit (Unmodified/Committed)
git commit -m "Add hello script"
git status -s
# (clean working directory)

# 4. Modify file (Modified)
echo "print('World')" >> hello.py
git status -s
#  M hello.py

# 5. Stage modification (Staged)
git add hello.py
git status -s
# M  hello.py

# 6. Modify again after staging (Staged + Modified)
echo "print('!')" >> hello.py
git status -s
# MM hello.py
```

#### **Example 2: Complex File States**
```bash
# Setup: Multiple files in different states
echo "File 1" > file1.txt      # New file
echo "File 2" > file2.txt      # New file
git add file1.txt              # Stage file1
echo "Modified" >> file1.txt   # Modify staged file
git add file2.txt              # Stage file2
echo "File 3" > file3.txt      # Another new file

git status -s
# MM file1.txt    # Staged and modified
# A  file2.txt    # Staged (new)
# ?? file3.txt    # Untracked

# View different diffs
git diff                # Shows unstaged changes (file1.txt modification)
git diff --staged       # Shows staged changes (file1.txt first change + file2.txt)
git diff HEAD          # Shows all changes vs last commit
```

### **Working Directory vs Staging Area**

Understanding the difference is crucial:

```bash
# Working Directory: Your actual files
# Staging Area: Prepared snapshot for next commit

# Example scenario
echo "Line 1" > demo.txt
git add demo.txt                    # Stage initial version
echo "Line 2" >> demo.txt           # Modify working directory

# Now you have different versions:
cat demo.txt                       # Working directory version
# Line 1
# Line 2

git show :demo.txt                 # Staged version
# Line 1

git show HEAD:demo.txt             # Last committed version (if exists)
# (empty or previous content)
```

---

## **🧪 Hands-On Exercises - Part 2**

### **Exercise 1: Basic File Operations**

```bash
# 1. Create a new project
mkdir git-workflow-practice
cd git-workflow-practice
git init

# 2. Create project structure
mkdir src tests docs
echo "# My Project" > README.md
echo "def main(): pass" > src/app.py
echo "# Tests" > tests/test_app.py

# 3. Practice adding files
git status                          # What do you see?
git add README.md                   # Add single file
git status                          # What changed?
git add src/                        # Add directory
git status                          # What changed?
git add .                           # Add everything remaining
git status                          # What changed?

# 4. Make your first commit
git commit -m "Initial project structure"
git status                          # Clean working directory?
```

### **Exercise 2: Understanding diff**

```bash
# 1. Make changes to multiple files
echo "## Installation" >> README.md
echo "pip install myproject" >> README.md

echo "def hello(): return 'Hello World'" >> src/app.py
echo "print(hello())" >> src/app.py

# 2. Practice viewing changes
git status                          # What files changed?
git diff                            # What are the actual changes?
git diff README.md                  # Changes in specific file?

# 3. Partial staging
git add README.md                   # Stage only README
git status                          # What's staged vs unstaged?
git diff                            # Shows what?
git diff --staged                   # Shows what?
git diff HEAD                       # Shows what?

# 4. Complete the commit
git add src/app.py
git commit -m "Add installation instructions and hello function"
```

### **Exercise 3: File State Management**

```bash
# 1. Create complex scenario
echo "config.ini" > .gitignore       # Create gitignore
echo "secret=123" > config.ini       # Create config file
echo "temp data" > temp.txt          # Create temp file

# 2. Stage some files
git add .gitignore
echo "Updated" >> README.md          # Modify tracked file
echo "More secrets" >> config.ini    # Modify ignored file

# 3. Analyze states
git status                           # What do you see?
git status -s                        # Short format
git diff                             # What shows up?

# 4. Practice file operations
git add README.md                    # Stage modification
git rm temp.txt                      # Remove untracked file
git status                           # Final state?
```

### **Exercise 4: Moving and Renaming**

```bash
# 1. Create files to move
mkdir utils
echo "def helper(): pass" > src/helper.py
echo "def util(): pass" > utils.py

# 2. Practice git mv
git add src/helper.py utils.py
git commit -m "Add utility functions"

git mv utils.py utils/utils.py       # Move file
git mv src/helper.py utils/helper.py # Move another file
git status                           # What does Git show?

# 3. Rename files
git mv utils/utils.py utils/common.py
git status                           # How does Git track this?

# 4. Commit changes
git commit -m "Reorganize utility files"
git log --stat                       # See the history
```

### **Exercise 5: Advanced diff and staging**

```bash
# 1. Create a file with multiple logical changes
cat > src/calculator.py << 'EOF'
def add(a, b):
    return a + b

def subtract(a, b):
    return a - b
EOF

git add src/calculator.py
git commit -m "Add basic calculator"

# 2. Make multiple changes
cat > src/calculator.py << 'EOF'
def add(a, b):
    """Add two numbers with validation"""
    if not isinstance(a, (int, float)):
        raise TypeError("a must be a number")
    if not isinstance(b, (int, float)):
        raise TypeError("b must be a number")
    return a + b

def subtract(a, b):
    """Subtract two numbers"""
    return a - b

def multiply(a, b):
    """Multiply two numbers"""
    return a * b

# DEBUG: Remove this line
print("Debug mode enabled")
EOF

# 3. Practice interactive staging
git add -p src/calculator.py
# Try different options: y, n, s, e
# Goal: Stage the validation and multiply function, 
#       but not the debug print

# 4. Verify partial staging
git diff --staged                    # What's staged?
git diff                            # What's not staged?

# 5. Make two separate commits
git commit -m "Add input validation and multiply function"
# Edit file to remove debug line
sed -i '/print("Debug mode enabled")/d' src/calculator.py
git add src/calculator.py
git commit -m "Remove debug print"
```

---

## **🎯 Part 2 Summary**

Congratulations! You've mastered the core Git workflow and file operations:

### **Key Achievements:**
✅ **Mastered** the three-tree architecture (Working → Staging → Repository)  
✅ **Learned** all file operations (add, edit, delete, move, rename)  
✅ **Understood** git diff in all its forms  
✅ **Practiced** file state management  
✅ **Explored** interactive staging for precise control  

### **Essential Commands Mastered:**
```bash
git status / git status -s     # Check file states
git add / git add -p          # Stage changes (interactive)
git diff / git diff --staged  # View changes
git rm / git mv               # Remove/move files
git commit                    # Save changes to repository
```

### **Professional Workflow:**
```bash
# The professional daily workflow:
1. git status                 # Always start here
2. git diff                   # Review what changed
3. git add (selectively)      # Stage what you want to commit
4. git diff --staged          # Review what you're committing
5. git commit -m "message"    # Commit with clear message
6. git status                 # Verify clean state
```

### **Key Concepts Mastered:**
- **File States**: Untracked → Modified → Staged → Committed
- **Three Trees**: Working Directory, Staging Area, Repository
- **Selective Staging**: Stage only what belongs together
- **Change Visibility**: Different diffs show different perspectives

---

# **PART 3: UNDOING CHANGES & FILE MANAGEMENT**

## **📋 What You'll Learn in Part 3**
- Undoing Changes (Reset, Revert, Checkout)
- Amending Commits
- Ignoring Files with .gitignore
- Advanced Change Management
- Professional Undo Strategies

---

## **9. Undoing Changes**

### **Understanding Different Types of "Undo"**

Git provides multiple ways to undo changes, each serving different purposes:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Working Directory│    │ Staging Area    │    │ Repository      │
│                 │    │                 │    │                 │
│ git checkout -- │    │ git reset HEAD  │    │ git revert      │
│ git restore     │    │ git restore     │    │ git reset       │
│                 │    │ --staged        │    │ (dangerous)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **The Three Main Undo Commands**

1. **git checkout / git restore** - Undo working directory changes
2. **git reset** - Move HEAD and optionally staging area/working directory
3. **git revert** - Create new commit that undoes previous commit

---

## **10. Reset - Moving Through History**

### **Understanding git reset**

`git reset` moves the current branch pointer and optionally updates staging area and working directory:

```
Before reset:
main: A ── B ── C ── D (HEAD)

After git reset --soft HEAD~2:
main: A ── B (HEAD)    C ── D (commits still exist but not reachable)
      └─ staging area contains changes from C and D
      └─ working directory unchanged

After git reset --mixed HEAD~2 (default):
main: A ── B (HEAD)    C ── D (commits still exist but not reachable)
      └─ staging area cleared
      └─ working directory contains changes from C and D

After git reset --hard HEAD~2:
main: A ── B (HEAD)    C ── D (commits still exist but not reachable)
      └─ staging area cleared
      └─ working directory cleared (changes lost!)
```

### **Three Types of Reset**

#### **1. Soft Reset (--soft)**
Moves HEAD only, keeps staging area and working directory:

```bash
# Move HEAD back 1 commit, keep all changes staged
git reset --soft HEAD~1

# Example scenario
echo "Feature 1" > feature1.txt
git add feature1.txt
git commit -m "Add feature 1"

echo "Feature 2" > feature2.txt
git add feature2.txt
git commit -m "Add feature 2"

# Oops, want to combine these commits
git reset --soft HEAD~1

git status
# On branch main
# Changes to be committed:
#   (use "git reset HEAD <file>..." to unstage)
#         new file:   feature2.txt

# Now you can make a combined commit
git commit -m "Add feature 1 and feature 2"
```

#### **2. Mixed Reset (--mixed, default)**
Moves HEAD and resets staging area, keeps working directory:

```bash
# Move HEAD back and unstage changes (default behavior)
git reset HEAD~1
# Same as: git reset --mixed HEAD~1

# Example scenario
echo "Bugfix" > bugfix.txt
git add bugfix.txt
git commit -m "Fix critical bug"

echo "Documentation" > docs.txt
git add docs.txt

# Oops, want to undo the commit but keep working on files
git reset HEAD~1

git status
# On branch main
# Changes not staged for commit:
#   (use "git add <file>..." to update what will be committed)
#         modified:   bugfix.txt
# 
# Untracked files:
#   (use "git add <file>..." to include in what will be committed)
#         docs.txt
```

#### **3. Hard Reset (--hard) ⚠️ DANGEROUS**
Moves HEAD, resets staging area AND working directory:

```bash
# DANGER: This will lose all uncommitted changes!
git reset --hard HEAD~1

# Example scenario (BE CAREFUL!)
echo "Important work" > important.txt
git add important.txt
git commit -m "Important changes"

echo "More work" >> important.txt
echo "Other changes" > other.txt
git add other.txt

# This will lose "More work" and "other.txt" completely!
git reset --hard HEAD~1

git status
# On branch main
# nothing to commit, working tree clean

# important.txt is back to committed state
# "More work" is lost forever!
# "other.txt" is deleted!
```

### **Practical Reset Examples**

#### **Unstaging Files**
```bash
# Stage multiple files
git add file1.txt file2.txt file3.txt

# Unstage specific file
git reset HEAD file2.txt

# Unstage all files
git reset HEAD

# Modern syntax (Git 2.23+)
git restore --staged file2.txt    # Unstage specific file
git restore --staged .             # Unstage all files
```

#### **Fixing the Last Commit**
```bash
# Scenario: Committed too early, want to add more changes
git add file1.txt
git commit -m "Add feature"

# Realize you forgot to add another file
echo "More feature code" > file2.txt
git add file2.txt

# Option 1: Soft reset and recommit
git reset --soft HEAD~1
git commit -m "Add complete feature"

# Option 2: Amend commit (covered later)
git commit --amend -m "Add complete feature"
```

#### **Going Back Multiple Commits**
```bash
# View commit history
git log --oneline
# a1b2c3d Add feature C
# d4e5f6g Add feature B  
# g7h8i9j Add feature A
# j1k2l3m Initial commit

# Go back to before feature B (keep changes as unstaged)
git reset d4e5f6g

# Go back to initial commit (lose all changes)
git reset --hard j1k2l3m
```

### **Reset Safety Tips**

#### **Before Dangerous Resets**
```bash
# Create a backup branch before hard reset
git branch backup-before-reset
git reset --hard HEAD~3

# If you made a mistake:
git reset --hard backup-before-reset

# Or use reflog to recover
git reflog
git reset --hard HEAD@{1}
```

---

## **11. Revert - Safe Undoing**

### **Understanding git revert**

Unlike `reset`, `revert` creates new commits that undo previous commits. This is safe for shared history:

```
Before revert:
main: A ── B ── C ── D (HEAD)

After git revert HEAD:
main: A ── B ── C ── D ── D' (HEAD)
                    └─ D' undoes changes from D

After git revert HEAD~2:
main: A ── B ── C ── D ── B' (HEAD)
           └─ B' undoes changes from B
```

### **Basic Revert Operations**

#### **Reverting the Last Commit**
```bash
# Create some commits
echo "Feature 1" > feature1.txt
git add feature1.txt
git commit -m "Add feature 1"

echo "Feature 2" > feature2.txt
git add feature2.txt
git commit -m "Add feature 2"

echo "Bug introduced" > bug.txt
git add bug.txt
git commit -m "Add buggy feature"

# Revert the buggy commit
git revert HEAD

# Git opens editor for revert commit message:
# Revert "Add buggy feature"
# 
# This reverts commit a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0.

git log --oneline
# f9e8d7c6 Revert "Add buggy feature"
# a1b2c3d4 Add buggy feature
# b5a6c7d8 Add feature 2
# c9d8e7f6 Add feature 1
```

#### **Reverting Specific Commits**
```bash
# Revert a commit from 3 commits ago
git revert HEAD~3

# Revert using commit hash
git revert a1b2c3d4

# Revert without opening editor
git revert --no-edit HEAD

# Revert but don't commit immediately (stage the revert)
git revert --no-commit HEAD
git status
# On branch main
# You are currently reverting commit a1b2c3d.
#   (all conflicts fixed: run "git revert --continue")
#   (use "git revert --abort" to cancel the revert operation)
```

#### **Reverting Multiple Commits**
```bash
# Revert a range of commits (creates separate revert commit for each)
git revert HEAD~3..HEAD

# Revert multiple commits without individual commits
git revert --no-commit HEAD~3..HEAD
git commit -m "Revert features X, Y, and Z"
```

### **Revert vs Reset Comparison**

| Aspect | git revert | git reset |
|--------|------------|-----------|
| **Safety** | ✅ Safe for shared history | ⚠️ Dangerous for shared history |
| **History** | Preserves history | Rewrites history |
| **Commits** | Creates new commits | Moves/removes commits |
| **Collaboration** | Safe to push | Requires force push |
| **Use Case** | Fix mistakes in public repos | Local history cleanup |

```bash
# Example: When to use each

# Shared repository - use revert
git revert HEAD                    # Safe, creates new commit

# Local repository - can use reset  
git reset --hard HEAD~1            # Dangerous but ok locally

# Already pushed commits - use revert
git revert HEAD                    # Safe
git push origin main               # No problems

# Already pushed commits - avoid reset
git reset --hard HEAD~1            # Local only
git push origin main               # This will fail!
git push --force origin main       # Dangerous! Breaks others' work
```

---

## **12. Checkout and Restore - Working Directory Changes**

### **Undoing Working Directory Changes**

#### **Old Syntax (git checkout)**
```bash
# Discard changes in working directory (restore from staging area)
git checkout -- filename.txt

# Discard all changes in working directory
git checkout -- .

# Restore file from specific commit
git checkout HEAD~1 -- filename.txt
git checkout a1b2c3d -- filename.txt
```

#### **New Syntax (git restore) - Git 2.23+**
```bash
# Discard changes in working directory
git restore filename.txt

# Discard all changes in working directory
git restore .

# Restore file from specific commit
git restore --source=HEAD~1 filename.txt
git restore --source=a1b2c3d filename.txt

# Unstage file (restore staging area from HEAD)
git restore --staged filename.txt

# Both unstage and discard working directory changes
git restore --staged --worktree filename.txt
```

### **Practical Examples**

#### **Discarding Unwanted Changes**
```bash
# Make some changes
echo "Good changes" > good.txt
echo "Bad changes" > bad.txt
git add good.txt

# Oops, bad.txt has unwanted changes
echo "More bad changes" >> bad.txt

# Discard bad.txt changes, keep good.txt staged
git restore bad.txt

git status
# On branch main
# Changes to be committed:
#   (use "git restore --staged <file>..." to unstage)
#         new file:   good.txt
# 
# nothing to commit, working tree clean
```

#### **Recovering Deleted Files**
```bash
# Accidentally delete a file
rm important.txt

git status
# On branch main
# Changes not staged for commit:
#   (use "git add <file>..." to update what will be committed)
#   (use "git restore <file>..." to discard changes in working directory)
#         deleted:    important.txt

# Restore the deleted file
git restore important.txt

# File is back!
ls important.txt
# important.txt
```

#### **Exploring Different Versions**
```bash
# Look at file from different commits
git restore --source=HEAD~2 config.txt    # From 2 commits ago
cat config.txt                            # See old version

# Restore to current version
git restore config.txt                     # Back to HEAD version

# See differences between versions
git show HEAD~2:config.txt                # Show old version
git show HEAD:config.txt                  # Show current version
```

---

## **13. Amending Commits**

### **Fixing the Last Commit**

Sometimes you need to fix the most recent commit:

```bash
# Scenario: Made a commit but forgot to add a file
echo "Main feature" > feature.txt
git add feature.txt
git commit -m "Add new feature"

# Oops! Forgot the documentation
echo "Feature documentation" > feature_docs.txt
git add feature_docs.txt

# Amend the previous commit to include the documentation
git commit --amend -m "Add new feature with documentation"

# The previous commit is replaced (new hash)
git log --oneline
# b2c3d4e5 Add new feature with documentation
# a1b2c3d4 Previous commit
```

### **What Amend Actually Does**

```
Before amend:
main: A ── B ── C (HEAD)

After amend:
main: A ── B ── C' (HEAD)
              └─ C is replaced by C' (new hash)
```

⚠️ **Warning**: Amending changes the commit hash. Never amend commits that have been pushed and shared!

### **Practical Amend Examples**

#### **Adding Forgotten Files**
```bash
# Initial commit
git add main.py
git commit -m "Implement user authentication"

# Realize you forgot to add the test file
git add test_auth.py
git commit --amend --no-edit    # Keep same commit message

# Or change the message too
git commit --amend -m "Implement user authentication with tests"
```

#### **Fixing Commit Messages**
```bash
# Made a typo in commit message
git commit -m "Fix critcial bug"    # Oops, "critical" is misspelled

# Fix the message
git commit --amend -m "Fix critical bug"
```

#### **Removing Files from Last Commit**
```bash
# Accidentally committed a file you didn't want
git add .
git commit -m "Add feature"

# Remove unwanted file from commit
git reset --soft HEAD~1             # Undo commit, keep changes staged
git reset HEAD unwanted_file.txt    # Unstage unwanted file
git commit -m "Add feature"         # Recommit without unwanted file

# Alternative using amend
git reset HEAD unwanted_file.txt    # Unstage unwanted file
git commit --amend --no-edit        # Amend commit without the file
```

### **Interactive Amend with Editor**

```bash
# Open editor to modify commit message and see changes
git commit --amend

# This opens your default editor with:
# Add new feature
# 
# # Please enter the commit message for your changes. Lines starting
# # with '#' are ignored, and an empty message aborts the commit.
# #
# # Date:      Wed Nov 15 14:30:25 2023 +0000
# #
# # On branch main
# # Changes to be committed:
# #       new file:   feature.txt
# #       new file:   feature_docs.txt
```

### **Amend Safety Rules**

```bash
# ✅ Safe to amend (not pushed yet)
git commit -m "Fix bug"
git commit --amend -m "Fix critical security bug"

# ❌ Dangerous to amend (already pushed)
git commit -m "Fix bug"
git push origin main
git commit --amend -m "Fix critical security bug"  # Changes hash!
git push origin main                               # Will fail
git push --force origin main                      # Breaks collaborators!

# ✅ Safe alternative for pushed commits
git revert HEAD                    # Creates new commit that undoes
git commit -m "Fix critical security bug"
```

---

## **14. Ignoring Files**

### **Understanding .gitignore**

`.gitignore` tells Git which files to never track. This is essential for:
- Temporary files
- Build artifacts
- IDE configurations
- Secrets and credentials
- Operating system files

### **Creating .gitignore**

```bash
# Create .gitignore file
touch .gitignore

# Add patterns to ignore
cat > .gitignore << 'EOF'
# Compiled Python files
*.pyc
__pycache__/
*.pyo
*.pyd

# Virtual environments
venv/
env/
.env

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Build artifacts
dist/
build/
*.egg-info/

# Logs
*.log
logs/

# Database files
*.db
*.sqlite3

# Configuration files with secrets
config/secrets.ini
.env.local
EOF

# Add and commit .gitignore
git add .gitignore
git commit -m "Add gitignore file"
```

### **Gitignore Patterns**

#### **Basic Patterns**
```bash
# Ignore specific file
secret.txt

# Ignore all files with specific extension
*.log
*.tmp

# Ignore directory
temp/
cache/

# Ignore files in specific directory
logs/*.log

# Ignore all .txt files in any subdirectory
**/*.txt
```

#### **Advanced Patterns**
```bash
# Ignore everything in directory except specific file
build/*
!build/README.md

# Ignore files matching pattern but not directories
*.log
!important.log

# Range of characters
temp[0-9].txt        # temp0.txt, temp1.txt, etc.

# Alternative patterns
*.{jpg,jpeg,png}     # All image files

# Negate patterns (don't ignore)
*.log                # Ignore all .log files
!important.log       # But don't ignore this one

# Comments
# This is a comment
*.tmp                # Ignore temp files
```

### **Practical .gitignore Examples**

#### **Python Project**
```bash
cat > .gitignore << 'EOF'
# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class

# C extensions
*.so

# Distribution / packaging
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# PyInstaller
*.manifest
*.spec

# Virtual environments
venv/
ENV/
env/
.venv/

# IDEs
.vscode/
.idea/
*.swp
*.swo

# Testing
.pytest_cache/
.coverage
htmlcov/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
EOF
```

#### **Node.js Project**
```bash
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Build output
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
EOF
```

#### **Java Project**
```bash
cat > .gitignore << 'EOF'
# Compiled class files
*.class

# Log files
*.log

# BlueJ files
*.ctxt

# Mobile Tools for Java (J2ME)
.mtj.tmp/

# Package Files
*.jar
*.war
*.nar
*.ear
*.zip
*.tar.gz
*.rar

# Virtual machine crash logs
hs_err_pid*

# IDE
.idea/
*.iws
*.iml
*.ipr
.vscode/

# Maven
target/
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup
pom.xml.next
release.properties
dependency-reduced-pom.xml
buildNumber.properties
.mvn/timing.properties

# Gradle
.gradle
/build/
gradle-app.setting
!gradle-wrapper.jar
!gradle-wrapper.properties

# OS
.DS_Store
Thumbs.db
EOF
```

### **Managing Already Tracked Files**

Sometimes you need to ignore files that are already tracked:

```bash
# File is already tracked but you want to ignore it
git ls-files                    # List tracked files
# config/database.ini           # This file is tracked

# Add to .gitignore
echo "config/database.ini" >> .gitignore

# File is still tracked! Need to untrack it first
git rm --cached config/database.ini
git commit -m "Stop tracking database config"

# Now the file is ignored
echo "new content" >> config/database.ini
git status
# nothing to commit, working tree clean
```

### **Checking What's Ignored**

```bash
# Check if file is ignored
git check-ignore config/secrets.ini
# config/secrets.ini            # If output, file is ignored

# See which rule ignores a file
git check-ignore -v config/secrets.ini
# .gitignore:23:config/secrets.ini    config/secrets.ini

# List all ignored files
git status --ignored
# Ignored files:
#   (use "git add -f <file>..." to include in what will be committed)
#         config/secrets.ini
#         __pycache__/
#         *.pyc

# Force add ignored file (if really needed)
git add -f config/secrets.ini
```

### **Global .gitignore**

For files you never want to track across all projects:

```bash
# Create global gitignore
touch ~/.gitignore_global

# Add common patterns
cat > ~/.gitignore_global << 'EOF'
# OS files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# Temporary files
*.tmp
*.temp
.#*
EOF

# Configure Git to use global gitignore
git config --global core.excludesfile ~/.gitignore_global
```

### **Common Gitignore Mistakes**

#### **Mistake 1: Ignoring after tracking**
```bash
# Wrong way:
git add secrets.txt
git commit -m "Add secrets"
echo "secrets.txt" >> .gitignore    # Too late! Already tracked

# Right way:
echo "secrets.txt" >> .gitignore    # Ignore first
git add .gitignore
git commit -m "Add gitignore"
# Then create secrets.txt
```

#### **Mistake 2: Trailing spaces**
```bash
# Wrong (has trailing space):
*.log 

# Right (no trailing space):
*.log
```

#### **Mistake 3: Wrong directory syntax**
```bash
# Wrong (ignores files named "temp"):
temp

# Right (ignores directory named "temp"):
temp/
```

---

## **🧪 Hands-On Exercises - Part 3**

### **Exercise 1: Practicing Reset**

```bash
# 1. Setup repository with multiple commits
mkdir git-reset-practice
cd git-reset-practice
git init

echo "Version 1" > file.txt
git add file.txt
git commit -m "Commit 1"

echo "Version 2" >> file.txt
git add file.txt
git commit -m "Commit 2"

echo "Version 3" >> file.txt
git add file.txt
git commit -m "Commit 3"

# 2. Practice soft reset
git log --oneline                   # Note the commit hashes
git reset --soft HEAD~1             # Move back 1 commit
git status                          # What's staged?
cat file.txt                        # What's in working directory?

# 3. Recommit
git commit -m "Commit 2 and 3 combined"

# 4. Practice mixed reset
echo "Version 4" >> file.txt
git add file.txt
git commit -m "Commit 4"

git reset HEAD~1                    # Mixed reset (default)
git status                          # What's staged vs unstaged?

# 5. Practice hard reset (CAREFUL!)
git add file.txt
git commit -m "Commit 4 again"

echo "Unsaved work" >> file.txt     # This will be lost!
git reset --hard HEAD~1             # DANGER!
cat file.txt                        # What happened to "Unsaved work"?
```

### **Exercise 2: Safe Undoing with Revert**

```bash
# 1. Create a scenario with problematic commit
mkdir git-revert-practice
cd git-revert-practice
git init

echo "Good feature 1" > feature1.txt
git add feature1.txt
git commit -m "Add feature 1"

echo "Good feature 2" > feature2.txt
git add feature2.txt
git commit -m "Add feature 2"

echo "Buggy code" > bug.txt
git add bug.txt
git commit -m "Add buggy feature"

echo "Good feature 3" > feature3.txt
git add feature3.txt
git commit -m "Add feature 3"

# 2. Revert the buggy commit
git log --oneline                   # Find the buggy commit
git revert HEAD~1                   # Revert "Add buggy feature"

# 3. Verify the revert
git log --oneline                   # See the revert commit
ls                                  # Is bug.txt gone?
git show HEAD                       # What did the revert do?

# 4. Practice reverting multiple commits
git revert --no-commit HEAD~2..HEAD # Revert last 2 commits
git status                          # What's staged?
git commit -m "Revert features 2 and 3"
```

### **Exercise 3: Working Directory Management**

```bash
# 1. Setup files in different states
mkdir git-restore-practice
cd git-restore-practice
git init

echo "Original content" > file1.txt
echo "Original content" > file2.txt
git add .
git commit -m "Initial commit"

# 2. Make various changes
echo "Modified content" > file1.txt        # Modified
echo "New file content" > file3.txt        # Untracked
git add file1.txt                          # Staged

echo "More changes" >> file1.txt           # Staged + modified
echo "Another change" >> file2.txt         # Modified

# 3. Practice selective restoration
git status                          # See all the states
git restore file2.txt               # Discard working directory changes
git status                          # What changed?

git restore --staged file1.txt      # Unstage changes
git status                          # What changed?

git restore file1.txt               # Discard working directory changes
git status                          # Clean except file3.txt?

# 4. Practice restoration from specific commits
echo "New content" > file1.txt
git add file1.txt
git commit -m "Update file1"

echo "Newer content" > file1.txt
git restore --source=HEAD~1 file1.txt     # Restore from previous commit
cat file1.txt                       # What content?
```

### **Exercise 4: Mastering Amend**

```bash
# 1. Setup scenario
mkdir git-amend-practice
cd git-amend-practice
git init

# 2. Create incomplete commit
echo "Main feature code" > feature.py
git add feature.py
git commit -m "Add new feature"

# 3. Realize you forgot something
echo "# Feature Documentation" > README.md
echo "This feature does X" >> README.md
git add README.md

# Amend the previous commit
git commit --amend -m "Add new feature with documentation"

# 4. Fix commit message
git commit --amend -m "Add user authentication feature with documentation"

# 5. Verify the result
git log --oneline                   # Only one commit?
git show HEAD                       # Contains both files?
```

### **Exercise 5: Complete .gitignore Setup**

```bash
# 1. Create project with files that should be ignored
mkdir git-ignore-practice
cd git-ignore-practice
git init

# Create various file types
echo "print('Hello')" > main.py
echo "print('Test')" > test.py
mkdir __pycache__
echo "compiled" > __pycache__/main.pyc
echo "log entry" > app.log
echo "secret=password" > .env
mkdir .vscode
echo "settings" > .vscode/settings.json

# 2. Create appropriate .gitignore
cat > .gitignore << 'EOF'
# Python
__pycache__/
*.pyc
*.pyo

# Environment
.env
.env.local

# IDE
.vscode/
.idea/

# Logs
*.log

# OS
.DS_Store
Thumbs.db
EOF

# 3. Test .gitignore
git status                          # What files are shown?
git add .                           # Add everything not ignored
git status                          # What's staged?

# 4. Test ignore checking
git check-ignore .env               # Should output .env
git check-ignore -v app.log         # Should show which rule

# 5. Handle already tracked file
echo "config=value" > config.ini
git add config.ini
git commit -m "Add config"

# Now want to ignore it
echo "config.ini" >> .gitignore
echo "new config" >> config.ini
git status                          # Still tracked!

git rm --cached config.ini          # Stop tracking
git commit -m "Stop tracking config file"
echo "newer config" >> config.ini
git status                          # Now ignored?
```

### **Exercise 6: Undo Strategy Decision Tree**

Practice choosing the right undo method:

```bash
# Setup complex scenario
mkdir git-undo-decision
cd git-undo-decision
git init

# Create commits
for i in {1..5}; do
    echo "Feature $i" > "feature$i.txt"
    git add "feature$i.txt"
    git commit -m "Add feature $i"
done

# Scenario 1: Just made a commit, want to add more files
echo "Extra file" > extra.txt
git add extra.txt
# Solution: git commit --amend

# Scenario 2: Working directory has unwanted changes
echo "Bad changes" >> feature1.txt
# Solution: git restore feature1.txt

# Scenario 3: Staged wrong file
git add feature2.txt
# Solution: git restore --staged feature2.txt

# Scenario 4: Last commit was wrong (not pushed)
# Solution: git reset --soft HEAD~1

# Scenario 5: Commit from 3 commits ago was wrong (already pushed)
# Solution: git revert HEAD~3

# Practice each solution!
```

---

## **🎯 Part 3 Summary**

Excellent! You've mastered the art of undoing changes in Git:

### **Key Achievements:**
✅ **Mastered** three types of reset (soft, mixed, hard)  
✅ **Learned** safe undoing with revert  
✅ **Practiced** working directory management  
✅ **Understood** commit amending  
✅ **Created** comprehensive .gitignore files  

### **Undo Command Reference:**
```bash
# Working Directory Changes
git restore file.txt              # Discard working changes
git checkout -- file.txt         # Old syntax

# Staging Area Changes  
git restore --staged file.txt    # Unstage file
git reset HEAD file.txt          # Old syntax

# Local Commit History
git reset --soft HEAD~1          # Undo commit, keep staged
git reset HEAD~1                 # Undo commit, keep unstaged
git reset --hard HEAD~1          # Undo commit, lose changes

# Safe Public History Changes
git revert HEAD                  # Create new commit that undoes

# Last Commit Fixes
git commit --amend               # Fix last commit message/files
```

### **Decision Matrix:**

| Situation | Command | Safety | Use When |
|-----------|---------|--------|----------|
| **Discard file changes** | `git restore file.txt` | ✅ Safe | Local changes unwanted |
| **Unstage file** | `git restore --staged file.txt` | ✅ Safe | Staged wrong file |
| **Fix last commit** | `git commit --amend` | ⚠️ Not if pushed | Forgot files/wrong message |
| **Undo local commits** | `git reset HEAD~1` | ⚠️ Lose commits | Local history cleanup |
| **Undo public commits** | `git revert HEAD` | ✅ Safe | Fix pushed mistakes |

### **Professional Guidelines:**
- **Always** check `git status` before undoing
- **Never** use `--hard` reset without backup
- **Never** amend or reset pushed commits
- **Always** use revert for shared repositories
- **Create** comprehensive .gitignore files early

---

# **PART 4: BRANCHING, MERGING & CONFLICT RESOLUTION**

## **📋 What You'll Learn in Part 4**
- Branching and Merging using Git
- Working with Conflict Resolution
- Comparing commits, branches and workspace
- Advanced Branch Management
- Professional Branching Strategies

---

## **15. Branching and Merging using Git**

### **Understanding Branches**

Branches are lightweight, movable pointers to specific commits. They allow you to:
- Work on different features simultaneously
- Experiment without affecting main code
- Collaborate with others safely
- Maintain multiple versions

```
Branch Visualization:
                    ┌─ feature-A
                    │
main: A ── B ── C ──┤
                    │
                    └─ feature-B

Each branch is just a pointer:
main: points to commit C
feature-A: points to commit C  
feature-B: points to commit C
HEAD: points to current branch
```

### **Basic Branch Operations**

#### **Creating Branches**
```bash
# Create new branch (stays on current branch)
git branch feature-login

# Create and switch to new branch
git checkout -b feature-login
# or (Git 2.23+)
git switch -c feature-login

# Create branch from specific commit
git branch hotfix a1b2c3d
git checkout -b feature-payment HEAD~2

# List all branches
git branch
#   feature-login
# * main              # * indicates current branch

# List all branches with last commit
git branch -v
#   feature-login a1b2c3d Add login form
# * main          d4e5f6g Update README
```

#### **Switching Branches**
```bash
# Switch to existing branch
git checkout main
git checkout feature-login

# Modern syntax (Git 2.23+)
git switch main
git switch feature-login

# Switch to previous branch
git checkout -
git switch -

# Create and switch in one command
git checkout -b new-feature
git switch -c new-feature
```

#### **Branch Scenarios**
```bash
# Scenario 1: Start new feature
git checkout main                    # Start from main
git pull origin main                 # Get latest changes
git checkout -b feature-user-profile # Create feature branch
# Work on feature...
echo "User profile code" > profile.py
git add profile.py
git commit -m "Add user profile functionality"

# Scenario 2: Quick hotfix
git checkout main                    # Switch to main
git checkout -b hotfix-security     # Create hotfix branch
echo "Security fix" > security.py
git add security.py
git commit -m "Fix security vulnerability"
```

### **Merging Branches**

There are two main types of merges:

#### **1. Fast-Forward Merge**
When the target branch hasn't diverged:

```
Before merge:
main:         A ── B
                   │
feature:           └── C ── D

After fast-forward merge:
main:         A ── B ── C ── D
feature:                     └── (same as main)
```

```bash
# Create scenario for fast-forward merge
git checkout main
git checkout -b feature-ff
echo "Feature 1" > feature1.txt
git add feature1.txt
git commit -m "Add feature 1"
echo "Feature 2" > feature2.txt
git add feature2.txt
git commit -m "Add feature 2"

# Merge back to main (fast-forward)
git checkout main
git merge feature-ff
# Updating a1b2c3d..d4e5f6g
# Fast-forward
#  feature1.txt | 1 +
#  feature2.txt | 1 +
#  2 files changed, 2 insertions(+)

git log --oneline
# d4e5f6g Add feature 2
# c3d4e5f Add feature 1
# a1b2c3d Initial commit
```

#### **2. Three-Way Merge**
When both branches have diverged:

```
Before merge:
main:         A ── B ── E ── F
                   │
feature:           └── C ── D

After three-way merge:
main:         A ── B ── E ── F ── M
                   │              /
feature:           └── C ── D ────┘
```

```bash
# Create scenario for three-way merge
git checkout main
echo "Main branch change" > main.txt
git add main.txt
git commit -m "Update main branch"

git checkout feature-ff
echo "Feature branch change" > feature.txt
git add feature.txt
git commit -m "Update feature branch"

# Merge feature into main (three-way merge)
git checkout main
git merge feature-ff
# Merge made by the 'recursive' strategy.
#  feature.txt | 1 +
#  1 file changed, 1 insertion(+)

# Git creates a merge commit
git log --oneline --graph
# *   g7h8i9j Merge branch 'feature-ff'
# |\  
# | * f6g7h8i Update feature branch
# * | e5f6g7h Update main branch
# |/  
# * d4e5f6g Add feature 2
```

### **Merge Options and Strategies**

#### **No Fast-Forward Merge**
Force creation of merge commit even when fast-forward is possible:

```bash
# Always create merge commit
git merge --no-ff feature-branch

# Result: Always shows branch history
git log --oneline --graph
# *   a1b2c3d Merge branch 'feature-branch'
# |\  
# | * d4e5f6g Feature work
# |/  
# * g7h8i9j Main work
```

#### **Squash Merge**
Combine all feature commits into single commit:

```bash
# Squash all commits from feature branch
git merge --squash feature-branch
git commit -m "Add complete feature X"

# Result: Clean linear history
git log --oneline
# a1b2c3d Add complete feature X
# g7h8i9j Previous main commit
```

#### **Cherry-Pick Specific Commits**
Apply specific commits from another branch:

```bash
# Pick specific commit from another branch
git cherry-pick d4e5f6g

# Pick multiple commits
git cherry-pick a1b2c3d..f6g7h8i

# Pick without committing (stage changes)
git cherry-pick --no-commit d4e5f6g
```

### **Deleting Branches**

```bash
# Delete merged branch (safe)
git branch -d feature-branch

# Force delete unmerged branch (dangerous)
git branch -D feature-branch

# Delete remote tracking branch
git branch -dr origin/feature-branch

# Delete remote branch
git push origin --delete feature-branch
```

---

## **16. Working with Conflict Resolution**

### **Understanding Merge Conflicts**

Conflicts occur when Git cannot automatically merge changes:

```
Common conflict scenarios:
1. Same line modified in both branches
2. File deleted in one branch, modified in another
3. File renamed in one branch, modified in another
4. Binary files modified in both branches
```

### **Creating and Resolving Conflicts**

#### **Setting Up a Conflict**
```bash
# Setup repository
mkdir conflict-demo
cd conflict-demo
git init

# Create initial file
echo "Line 1
Line 2
Line 3" > conflict.txt
git add conflict.txt
git commit -m "Initial file"

# Create two branches with conflicting changes
git checkout -b branch-a
sed -i 's/Line 2/Line 2 - Modified by Branch A/' conflict.txt
git commit -am "Modify line 2 in branch A"

git checkout main
git checkout -b branch-b
sed -i 's/Line 2/Line 2 - Modified by Branch B/' conflict.txt
git commit -am "Modify line 2 in branch B"

# Create the conflict
git checkout main
git merge branch-a          # This works fine
git merge branch-b          # This creates conflict!
# Auto-merging conflict.txt
# CONFLICT (content): Merge conflict in conflict.txt
# Automatic merge failed; fix conflicts and then commit the result.
```

#### **Understanding Conflict Markers**
```bash
cat conflict.txt
# Line 1
# <<<<<<< HEAD
# Line 2 - Modified by Branch A
# =======
# Line 2 - Modified by Branch B
# >>>>>>> branch-b
# Line 3
```

**Conflict Markers Explained:**
- `<<<<<<< HEAD` - Start of current branch content
- `=======` - Separator between conflicting content
- `>>>>>>> branch-name` - End of incoming branch content

### **Manual Conflict Resolution**

#### **Method 1: Edit Directly**
```bash
# Edit the file to resolve conflict
cat > conflict.txt << 'EOF'
Line 1
Line 2 - Modified by both branches (combined)
Line 3
EOF

# Mark as resolved and commit
git add conflict.txt
git commit -m "Resolve merge conflict in conflict.txt"
```

#### **Method 2: Choose One Side**
```bash
# During a conflict, choose one side:

# Keep current branch version (ours)
git checkout --ours conflict.txt
git add conflict.txt

# Keep incoming branch version (theirs)  
git checkout --theirs conflict.txt
git add conflict.txt

git commit -m "Resolve conflict by choosing branch-b version"
```

### **Using Merge Tools**

#### **Configure Merge Tool**
```bash
# Configure VS Code as merge tool
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd 'code --wait $MERGED'

# Configure other popular tools
git config --global merge.tool vimdiff    # Vim
git config --global merge.tool meld       # Meld (GUI)
git config --global merge.tool kdiff3     # KDiff3 (GUI)
```

#### **Using Merge Tool**
```bash
# When conflict occurs, launch merge tool
git mergetool

# VS Code will open with:
# - LEFT: Current branch (HEAD)
# - RIGHT: Incoming branch  
# - MIDDLE: Result (edit this)
# - BOTTOM: Original base version

# After resolving in tool:
git add resolved-file.txt
git commit -m "Resolve merge conflict"
```

### **Advanced Conflict Scenarios**

#### **Multiple File Conflicts**
```bash
# See all conflicted files
git status
# You have unmerged paths.
#   (fix conflicts and run "git commit")
#   (use "git merge --abort" to abort the merge)
# 
# Unmerged paths:
#   (use "git add <file>..." to mark resolution)
#         both modified:   file1.txt
#         both modified:   file2.txt
#         deleted by us:   file3.txt

# Resolve each file
git mergetool file1.txt
git mergetool file2.txt

# Handle deleted file
git rm file3.txt          # Accept deletion
# or
git add file3.txt          # Keep the file

# Commit resolution
git commit -m "Resolve all merge conflicts"
```

#### **Binary File Conflicts**
```bash
# Binary files cannot be merged automatically
git status
# Unmerged paths:
#   both modified:   logo.png

# Choose one version
git checkout --ours logo.png      # Keep current version
# or
git checkout --theirs logo.png    # Keep incoming version

git add logo.png
git commit -m "Resolve binary file conflict"
```

### **Aborting and Restarting Merges**

```bash
# Abort current merge
git merge --abort

# Reset to pre-merge state
git reset --hard HEAD

# If you've made partial progress
git reset --merge

# See what you're merging
git log --merge            # Show conflicting commits
git diff --merge           # Show conflicting changes
```

### **Preventing Conflicts**

#### **Best Practices**
```bash
# 1. Keep branches up to date
git checkout feature-branch
git merge main             # Regularly merge main into feature

# 2. Use rebase instead of merge for private branches
git rebase main            # Replay feature commits on top of main

# 3. Communicate with team about file changes
# Use .gitattributes for merge strategies

# 4. Use smaller, focused commits
# Easier to resolve conflicts with small changes
```

#### **Merge Strategies**
```bash
# Default recursive strategy (handles most cases)
git merge -s recursive feature-branch

# Ours strategy (always prefer current branch)
git merge -s ours feature-branch

# Theirs strategy (always prefer incoming branch)  
git merge -X theirs feature-branch

# Theirs strategy (always prefer incoming branch)  
git merge -X theirs feature-branch

# Ignore whitespace conflicts
git merge -X ignore-space-change feature-branch
git merge -X ignore-all-space feature-branch
```

---

## **17. Comparing commits, branches and workspace**

### **Comparing Different Git Objects**

Git provides powerful comparison tools to understand differences between:
- Working directory and staging area
- Staging area and repository
- Different commits
- Different branches
- Different time points

### **Basic Diff Commands Review**

```bash
# Working directory vs staging area (unstaged changes)
git diff

# Staging area vs last commit (staged changes)
git diff --staged
git diff --cached

# Working directory vs last commit (all changes)
git diff HEAD

# Working directory vs specific commit
git diff a1b2c3d
git diff HEAD~2
```

### **Comparing Commits**

#### **Two Specific Commits**
```bash
# Compare two commits
git diff a1b2c3d b4e5f6g

# Compare commit with its parent
git diff HEAD~1 HEAD

# Compare with previous commits
git diff HEAD~3 HEAD~1        # Compare 3rd and 1st parent
git diff @~3 @~1              # Shorthand syntax

# Show changes in specific commit
git show a1b2c3d              # Show commit + diff
git show HEAD~2              # Show 2 commits ago
```

#### **Commit Range Comparisons**
```bash
# Show commits between two points
git log a1b2c3d..b4e5f6g      # Commits reachable from b4e5f6g but not a1b2c3d

# Show changes between two points
git diff a1b2c3d..b4e5f6g     # Total diff between two commits

# Three-dot syntax (symmetric difference)
git diff a1b2c3d...b4e5f6g    # Changes since common ancestor
```

### **Comparing Branches**

#### **Branch vs Branch**
```bash
# Compare two branches
git diff main feature-branch

# Compare current branch with another
git diff main                 # Current branch vs main

# Show commits in feature-branch not in main
git log main..feature-branch

# Show commits in main not in feature-branch
git log feature-branch..main

# Show all commits that differ between branches
git log --left-right main...feature-branch
```

#### **Branch Comparison Examples**
```bash
# Setup scenario
git checkout main
echo "Main file" > main.txt
git add main.txt
git commit -m "Add main file"

git checkout -b feature
echo "Feature file" > feature.txt
git add feature.txt
git commit -m "Add feature file"

echo "Updated feature" >> feature.txt
git commit -am "Update feature file"

# Compare branches
git diff main feature
# Shows all differences between branches

git log --oneline main..feature
# Shows commits in feature not in main:
# b2c3d4e Update feature file
# a1b2c3d Add feature file

git log --oneline feature..main
# Shows commits in main not in feature:
# (empty if main hasn't changed)
```

### **Advanced Comparison Options**

#### **File-Specific Comparisons**
```bash
# Compare specific file between branches
git diff main feature -- filename.txt

# Compare file with different version
git diff HEAD~3:filename.txt filename.txt

# Show file content from specific commit/branch
git show main:filename.txt
git show HEAD~2:path/to/file.py
```

#### **Statistical Comparisons**
```bash
# Show statistics only
git diff --stat main feature
#  feature.txt | 2 ++
#  main.txt    | 1 +
#  2 files changed, 3 insertions(+)

# Show both stats and changes
git diff --stat --patch main feature

# Show name-only changes
git diff --name-only main feature
# feature.txt
# main.txt

# Show name and status
git diff --name-status main feature
# A       feature.txt
# M       main.txt
```

#### **Context and Formatting Options**
```bash
# More context lines
git diff -U10 main feature     # Show 10 context lines

# Side-by-side diff
git diff --word-diff main feature

# Ignore whitespace
git diff --ignore-all-space main feature
git diff --ignore-space-change main feature

# Color-coded diff (if not automatic)
git diff --color main feature
```

### **Workspace Comparisons**

#### **Working Directory Analysis**
```bash
# See what changed since last commit
git diff HEAD

# See what would be committed
git diff --staged

# See differences between workspace and specific branch
git diff feature-branch

# See only names of changed files
git diff --name-only HEAD
```

#### **Stash Comparisons**
```bash
# Compare with stash
git stash show                 # Summary of stash
git stash show -p             # Full diff of stash
git diff stash@{0}            # Compare workspace with stash

# Compare stash with commit
git diff HEAD stash@{0}
```

### **Practical Comparison Workflows**

#### **Pre-Merge Analysis**
```bash
# Before merging feature branch, analyze differences
git checkout main
git fetch origin              # Get latest changes

# See what will be merged
git log --oneline main..feature-branch
git diff main...feature-branch

# See merge conflicts before merging
git merge-tree $(git merge-base main feature-branch) main feature-branch
```

#### **Release Comparison**
```bash
# Compare current state with last release
git diff v1.0.0 HEAD

# See all changes since release
git log --oneline v1.0.0..HEAD

# Generate changelog
git log --pretty=format:"- %s" v1.0.0..HEAD
```

#### **Code Review Workflow**
```bash
# Review changes in feature branch
git log --oneline --graph main..feature-branch
git diff main...feature-branch

# Review specific commits
git show a1b2c3d
git show --stat a1b2c3d

# Review changes to specific files
git log -p --follow filename.txt
```

### **Visual Diff Tools**

#### **External Diff Tools**
```bash
# Configure external diff tool
git config --global diff.tool vimdiff
git config --global diff.tool meld
git config --global diff.tool vscode

# Use external tool
git difftool HEAD~1 HEAD
git difftool main feature-branch

# Configure VS Code as diff tool
git config --global diff.tool vscode
git config --global difftool.vscode.cmd 'code --wait --diff $LOCAL $REMOTE'
```

#### **Git Built-in Visualization**
```bash
# Graphical log with diff
git log --graph --patch

# Interactive log browser (if available)
gitk --all

# Web interface (if available)
git instaweb
```

---

## **🧪 Hands-On Exercises - Part 4**

### **Exercise 1: Branch Creation and Basic Merging**

```bash
# 1. Setup repository
mkdir git-branching-practice
cd git-branching-practice
git init

# Create initial commit
echo "# Project Main" > README.md
echo "Initial content" > main.py
git add .
git commit -m "Initial commit"

# 2. Create and work on feature branch
git checkout -b feature-user-auth
echo "def login(): pass" >> main.py
echo "def logout(): pass" >> main.py
git commit -am "Add authentication functions"

echo "# Authentication Module" > auth.py
echo "def authenticate(user): return True" > auth.py
git add auth.py
git commit -m "Add authentication module"

# 3. Switch back to main and make different changes
git checkout main
echo "def main(): print('Hello World')" >> main.py
git commit -am "Add main function"

# 4. Practice different merge types
git log --oneline --graph --all    # Visualize branches

# Fast-forward merge (create new branch from current state)
git checkout -b feature-simple
echo "# Simple feature" > simple.py
git add simple.py
git commit -m "Add simple feature"

git checkout main
git merge feature-simple            # Should be fast-forward

# Three-way merge
git merge feature-user-auth         # Should create merge commit

# 5. Verify results
git log --oneline --graph
git branch -d feature-simple       # Clean up merged branch
git branch -d feature-user-auth    # Clean up merged branch
```

### **Exercise 2: Conflict Resolution Practice**

```bash
# 1. Setup conflict scenario
mkdir git-conflict-practice
cd git-conflict-practice
git init

# Create initial file
cat > config.py << 'EOF'
DEBUG = False
DATABASE_URL = "sqlite:///app.db"
SECRET_KEY = "your-secret-key"
EOF

git add config.py
git commit -m "Initial configuration"

# 2. Create conflicting branches
git checkout -b feature-database
sed -i 's/sqlite:\/\/\/app.db/postgresql:\/\/localhost\/app/' config.py
echo "DATABASE_TIMEOUT = 30" >> config.py
git commit -am "Switch to PostgreSQL database"

git checkout main
git checkout -b feature-security
sed -i 's/your-secret-key/super-secure-random-key-123/' config.py
echo "SECURITY_ENABLED = True" >> config.py
git commit -am "Enhance security configuration"

# 3. Create the conflict
git checkout main
git merge feature-database          # This should work

git merge feature-security          # This will conflict!

# 4. Analyze the conflict
git status
cat config.py                      # See conflict markers

# 5. Resolve manually
cat > config.py << 'EOF'
DEBUG = False
DATABASE_URL = "postgresql://localhost/app"
SECRET_KEY = "super-secure-random-key-123"
DATABASE_TIMEOUT = 30
SECURITY_ENABLED = True
EOF

git add config.py
git commit -m "Resolve database and security configuration conflict"

# 6. Verify resolution
git log --oneline --graph
```

### **Exercise 3: Advanced Conflict Resolution**

```bash
# 1. Setup complex conflict scenario
mkdir git-advanced-conflicts
cd git-advanced-conflicts
git init

# Create multiple files
echo "function calculateTotal() { return 0; }" > calculator.js
echo "function validateInput() { return true; }" > validator.js
echo "class User {}" > user.js
git add .
git commit -m "Initial JavaScript modules"

# 2. Branch A: Refactor and enhance
git checkout -b refactor-branch
cat > calculator.js << 'EOF'
function calculateTotal(items) {
    return items.reduce((sum, item) => sum + item.price, 0);
}

function calculateTax(total, rate = 0.1) {
    return total * rate;
}
EOF

cat > validator.js << 'EOF'
function validateInput(data) {
    if (!data || typeof data !== 'object') {
        return false;
    }
    return true;
}

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
EOF

git commit -am "Refactor calculator and validator with enhanced functionality"

# 3. Branch B: Different enhancements
git checkout main
git checkout -b enhancement-branch

cat > calculator.js << 'EOF'
function calculateTotal(products) {
    let total = 0;
    for (let product of products) {
        total += product.cost;
    }
    return total;
}

function applyDiscount(total, discount) {
    return total * (1 - discount);
}
EOF

cat > user.js << 'EOF'
class User {
    constructor(name, email) {
        this.name = name;
        this.email = email;
    }
    
    getName() {
        return this.name;
    }
}
EOF

git commit -am "Enhance calculator and user class"

# 4. Create multiple conflicts
git checkout main
git merge refactor-branch           # Should work

git merge enhancement-branch        # Multiple conflicts!

# 5. Practice different resolution methods
git status                          # See all conflicted files

# Resolve calculator.js by combining both approaches
cat > calculator.js << 'EOF'
function calculateTotal(items) {
    return items.reduce((sum, item) => sum + (item.price || item.cost), 0);
}

function calculateTax(total, rate = 0.1) {
    return total * rate;
}

function applyDiscount(total, discount) {
    return total * (1 - discount);
}
EOF

# Keep refactor version of validator.js
git checkout --ours validator.js

# Keep enhancement version of user.js  
git checkout --theirs user.js

# Finalize resolution
git add .
git commit -m "Resolve complex merge conflicts combining features"

# 6. Verify final state
git log --oneline --graph
git show HEAD                       # See the merge commit
```

### **Exercise 4: Branch Comparison Mastery**

```bash
# 1. Setup repository with multiple branches
mkdir git-comparison-practice
cd git-comparison-practice
git init

# Create main branch content
echo "# Main Project" > README.md
mkdir src tests docs
echo "def main(): pass" > src/app.py
echo "# Tests" > tests/test_app.py
echo "# Documentation" > docs/README.md
git add .
git commit -m "Initial project structure"

# 2. Create feature branch with multiple commits
git checkout -b feature-authentication
echo "def login(username, password): pass" >> src/app.py
echo "def logout(): pass" >> src/app.py
git commit -am "Add authentication functions"

echo "import unittest" > tests/test_auth.py
echo "class TestAuth(unittest.TestCase): pass" >> tests/test_auth.py
git add tests/test_auth.py
git commit -m "Add authentication tests"

echo "## Authentication" >> docs/README.md
echo "Login and logout functionality" >> docs/README.md
git commit -am "Update documentation for authentication"

# 3. Switch to main and make different changes
git checkout main
echo "def validate_input(data): return True" >> src/app.py
git commit -am "Add input validation"

echo "## Validation" >> docs/README.md
git commit -am "Document validation features"

# 4. Practice comprehensive comparisons
# See branch differences
git diff main feature-authentication

# See commit differences
git log --oneline main..feature-authentication
git log --oneline feature-authentication..main

# See file-specific differences
git diff main feature-authentication -- src/app.py
git diff main feature-authentication -- docs/README.md

# Statistical comparison
git diff --stat main feature-authentication

# 5. Create comparison reports
# Generate summary of differences
echo "# Branch Comparison Report" > comparison_report.md
echo "## Commits in feature-authentication not in main:" >> comparison_report.md
git log --oneline main..feature-authentication >> comparison_report.md

echo "" >> comparison_report.md
echo "## File changes:" >> comparison_report.md
git diff --name-status main feature-authentication >> comparison_report.md

echo "" >> comparison_report.md
echo "## Statistics:" >> comparison_report.md
git diff --stat main feature-authentication >> comparison_report.md

cat comparison_report.md

# 6. Analyze merge impact
git log --graph --oneline --all
git merge-tree $(git merge-base main feature-authentication) main feature-authentication
```

### **Exercise 5: Professional Branching Workflow**

```bash
# 1. Simulate professional development workflow
mkdir git-professional-workflow
cd git-professional-workflow
git init

# Setup initial project
echo "# E-commerce Platform" > README.md
mkdir src tests config
echo "from flask import Flask" > src/app.py
echo "app = Flask(__name__)" >> src/app.py
echo "DEBUG = True" > config/settings.py
git add .
git commit -m "Initial e-commerce platform setup"

# 2. Feature development workflow
git checkout -b feature/user-registration
echo "def register_user(email, password): pass" >> src/app.py
git commit -am "Add user registration endpoint"

echo "import pytest" > tests/test_registration.py
echo "def test_user_registration(): pass" >> tests/test_registration.py
git add tests/test_registration.py
git commit -m "Add user registration tests"

# 3. Hotfix workflow
git checkout main
git checkout -b hotfix/security-patch
sed -i 's/DEBUG = True/DEBUG = False/' config/settings.py
echo "SECURE_SSL_REDIRECT = True" >> config/settings.py
git commit -am "Apply security patch - disable debug, enable SSL"

# 4. Another feature branch
git checkout main
git checkout -b feature/product-catalog
echo "def list_products(): pass" >> src/app.py
echo "def get_product(id): pass" >> src/app.py
git commit -am "Add product catalog functionality"

mkdir templates
echo "<h1>Products</h1>" > templates/products.html
git add templates/
git commit -m "Add product listing template"

# 5. Integration and comparison workflow
git checkout main

# Compare what each branch brings
echo "=== Hotfix Changes ==="
git diff --stat main hotfix/security-patch
git log --oneline main..hotfix/security-patch

echo "=== User Registration Changes ==="
git diff --stat main feature/user-registration
git log --oneline main..feature/user-registration

echo "=== Product Catalog Changes ==="
git diff --stat main feature/product-catalog
git log --oneline main..feature/product-catalog

# 6. Strategic merging
# Merge hotfix first (urgent)
git merge hotfix/security-patch
git branch -d hotfix/security-patch

# Merge features
git merge feature/user-registration
git merge feature/product-catalog

# 7. Final verification
git log --oneline --graph
git diff HEAD~6 HEAD --stat     # See all changes since start
```

---

## **🎯 Part 4 Summary**

Excellent work! You've mastered Git's most powerful collaborative features:

### **Key Achievements:**
✅ **Mastered** branch creation, switching, and deletion  
✅ **Learned** fast-forward vs three-way merges  
✅ **Conquered** merge conflict resolution  
✅ **Practiced** advanced comparison techniques  
✅ **Implemented** professional branching workflows  

### **Branch Management Commands:**
```bash
# Branch Operations
git branch feature-name           # Create branch
git checkout -b feature-name      # Create and switch
git switch -c feature-name        # Modern syntax
git branch -d feature-name        # Delete merged branch
git branch -D feature-name        # Force delete

# Merging
git merge feature-branch          # Merge into current branch
git merge --no-ff feature-branch  # Force merge commit
git merge --squash feature-branch # Squash commits

# Conflict Resolution
git mergetool                     # Open merge tool
git checkout --ours file.txt     # Choose current branch
git checkout --theirs file.txt   # Choose incoming branch
git merge --abort                 # Abort merge
```

### **Comparison Commands:**
```bash
# Basic Comparisons
git diff branch1 branch2          # Compare branches
git diff HEAD~3 HEAD              # Compare commits
git log main..feature            # Commits in feature not main

# Advanced Comparisons
git diff --stat main feature     # Statistical comparison
git diff --name-only HEAD~2      # Files changed
git show main:file.txt           # File from specific branch
```

### **Professional Conflict Resolution Strategy:**
1. **Analyze** the conflict with `git status` and `git diff`
2. **Understand** what each side is trying to do
3. **Choose** the appropriate resolution method:
   - Manual editing for complex logic conflicts
   - `--ours` for current branch preference
   - `--theirs` for incoming branch preference
   - Merge tool for visual resolution
4. **Test** the resolved code
5. **Commit** with descriptive message

### **Branching Best Practices:**
- Create branches for all new features
- Keep branches focused and small
- Merge main into feature branches regularly
- Delete merged branches to keep repository clean
- Use descriptive branch names (`feature/user-auth`, `hotfix/security`)

**Remember**: "Branches are cheap, use them liberally!" 🚀

---

# **PART 5: REMOTE REPOSITORIES, GITHUB & TAGGING - FINAL MASTERY**

## **📋 What You'll Learn in Part 5**
- Working with Remote Git Repositories using GitHub
- Push, Pull, and Fetch Operations
- Remote Branch Management
- Tagging with Git
- Professional Collaborative Workflows
- Final Assessment and Next Steps

---

## **18. Working with Remote Git Repositories using GitHub**

### **Understanding Remote Repositories**

Remote repositories are Git repositories hosted on servers that enable collaboration:

```
Local Repository Structure:
┌─────────────────────────────────────────┐
│ Local Repository                        │
│ ┌─────────────┐  ┌─────────────────────┐ │
│ │ Working Dir │  │ Local Repository    │ │
│ │ (Your Files)│  │ (.git directory)    │ │
│ └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────┘
                    │
                    │ push/pull/fetch
                    ▼
┌─────────────────────────────────────────┐
│ Remote Repository (GitHub)              │
│ ┌─────────────────────────────────────┐ │
│ │ Shared Repository                   │ │
│ │ (origin/main, origin/feature)      │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### **Setting Up GitHub Repository**

#### **Creating Repository on GitHub**
1. Go to GitHub.com and sign in
2. Click "New repository" or "+"
3. Choose repository name and settings
4. Select public or private
5. Initialize with README (optional)

#### **Connecting Local Repository to GitHub**

**Method 1: Start with existing local repository**
```bash
# Create local repository
mkdir my-awesome-project
cd my-awesome-project
git init

# Create initial content
echo "# My Awesome Project" > README.md
echo "print('Hello, World!')" > main.py
git add .
git commit -m "Initial commit"

# Add GitHub remote
git remote add origin https://github.com/username/my-awesome-project.git

# Push to GitHub
git branch -M main                    # Ensure main branch name
git push -u origin main              # Push and set upstream
```

**Method 2: Clone from GitHub**
```bash
# Clone existing repository
git clone https://github.com/username/my-awesome-project.git
cd my-awesome-project

# Remote is automatically configured
git remote -v
# origin  https://github.com/username/my-awesome-project.git (fetch)
# origin  https://github.com/username/my-awesome-project.git (push)
```

### **Authentication with GitHub**

#### **HTTPS Authentication**
```bash
# Using Personal Access Token (recommended)
git remote set-url origin https://username:token@github.com/username/repo.git

# Using Git Credential Manager (Windows/Mac)
git config --global credential.helper manager

# Using credential cache (Linux)
git config --global credential.helper cache
git config --global credential.helper 'cache --timeout=3600'
```

#### **SSH Authentication (Recommended)**
```bash
# 1. Generate SSH key
ssh-keygen -t ed25519 -C "your.email@example.com"
# Press Enter for default location (~/.ssh/id_ed25519)
# Enter passphrase (optional but recommended)

# 2. Add SSH key to ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# 3. Copy public key to GitHub
cat ~/.ssh/id_ed25519.pub
# Copy output and add to GitHub Settings > SSH Keys

# 4. Test connection
ssh -T git@github.com
# Hi username! You've successfully authenticated

# 5. Use SSH URL for repository
git remote set-url origin git@github.com:username/repo.git
```

### **Working with Multiple Remotes**

```bash
# List remotes
git remote -v

# Add additional remotes
git remote add upstream https://github.com/original-owner/repo.git
git remote add backup https://gitlab.com/username/repo.git

# Fetch from specific remote
git fetch upstream
git fetch origin

# Push to specific remote
git push origin main
git push backup main

# Set different URLs for fetch and push
git remote set-url origin https://github.com/username/repo.git
git remote set-url --push origin git@github.com:username/repo.git
```

---

## **19. Push - Pull - Fetch using GitHub**

### **Understanding Push, Pull, and Fetch**

```
Git Remote Operations:

FETCH: Download objects and refs from remote
┌─────────────┐    fetch    ┌─────────────────┐
│   Remote    │────────────▶│ Local Remote    │
│ Repository  │             │ Tracking Branch │
└─────────────┘             └─────────────────┘

PULL: Fetch + Merge (or Rebase)
┌─────────────┐    pull     ┌─────────────────┐
│   Remote    │────────────▶│ Local Working   │
│ Repository  │             │ Branch          │
└─────────────┘             └─────────────────┘

PUSH: Upload local refs to remote
┌─────────────┐    push     ┌─────────────────┐
│   Local     │────────────▶│     Remote      │
│ Repository  │             │   Repository    │
└─────────────┘             └─────────────────┘
```

### **Fetch Operations**

#### **Basic Fetch**
```bash
# Fetch all changes from all remotes
git fetch

# Fetch from specific remote
git fetch origin

# Fetch specific branch
git fetch origin main
git fetch origin feature-branch

# Fetch with pruning (remove deleted remote branches)
git fetch --prune
git fetch -p

# Fetch all branches and tags
git fetch --all
git fetch --tags
```

#### **Understanding Fetch Results**
```bash
# After fetch, see what's available
git branch -r                        # List remote branches
git branch -a                        # List all branches (local + remote)

# Compare local with remote
git log HEAD..origin/main            # Commits in remote not in local
git log origin/main..HEAD            # Commits in local not in remote

# Show remote tracking branch status
git status -sb                       # Short status with branch info
```

### **Pull Operations**

#### **Basic Pull**
```bash
# Pull changes from upstream branch
git pull

# Pull from specific remote and branch
git pull origin main
git pull upstream main

# Pull with rebase instead of merge
git pull --rebase
git pull --rebase origin main

# Pull and automatically prune deleted remote branches
git pull --prune
```

#### **Pull Strategies**
```bash
# Configure default pull strategy
git config --global pull.rebase false   # Merge (default)
git config --global pull.rebase true    # Rebase
git config --global pull.ff only        # Fast-forward only

# One-time pull strategies
git pull --no-rebase                    # Force merge
git pull --rebase                       # Force rebase
git pull --ff-only                      # Fast-forward only (fail if not possible)
```

#### **Handling Pull Conflicts**
```bash
# If pull with merge creates conflicts
git pull origin main
# CONFLICT (content): Merge conflict in file.txt
# Automatic merge failed; fix conflicts and then commit the result.

# Resolve conflicts and complete merge
git status                             # See conflicted files
# Edit files to resolve conflicts
git add resolved-file.txt
git commit -m "Resolve merge conflict"

# If pull with rebase creates conflicts
git pull --rebase origin main
# CONFLICT (content): Merge conflict in file.txt
# error: could not apply a1b2c3d... commit message

# Resolve conflicts and continue rebase
# Edit files to resolve conflicts
git add resolved-file.txt
git rebase --continue

# Or abort rebase
git rebase --abort
```

### **Push Operations**

#### **Basic Push**
```bash
# Push current branch to its upstream
git push

# Push specific branch to remote
git push origin main
git push origin feature-branch

# Push new branch and set upstream
git push -u origin new-feature
git push --set-upstream origin new-feature

# Push all branches
git push --all origin

# Push tags
git push --tags origin
git push origin tag-name
```

#### **Force Push (Use with Caution)**
```bash
# Force push (dangerous!)
git push --force origin main

# Safer force push (checks remote hasn't changed)
git push --force-with-lease origin main

# Force push specific branch
git push --force origin feature-branch
```

⚠️ **Force Push Warnings:**
- Never force push to shared branches (main, develop)
- Only force push to your own feature branches
- Always use `--force-with-lease` when possible
- Communicate with team before force pushing

#### **Push Scenarios**
```bash
# Scenario 1: First push of new repository
git push -u origin main

# Scenario 2: Regular development push
git add .
git commit -m "Add new feature"
git push

# Scenario 3: Push new feature branch
git checkout -b feature-authentication
# Make changes and commit
git push -u origin feature-authentication

# Scenario 4: Delete remote branch
git push origin --delete feature-branch
git push origin :feature-branch        # Alternative syntax
```

### **Tracking Branches**

#### **Understanding Upstream Branches**
```bash
# See tracking relationship
git branch -vv
# * main                a1b2c3d [origin/main] Latest commit
#   feature-auth       b2c3d4e [origin/feature-auth: ahead 2] Add auth

# Set upstream for existing branch
git branch --set-upstream-to=origin/main main
git push --set-upstream origin feature-branch

# Create local branch tracking remote branch
git checkout -b local-branch origin/remote-branch
git switch -c local-branch origin/remote-branch
```

#### **Working with Remote Branches**
```bash
# List remote branches
git branch -r
# origin/main
# origin/feature-auth
# origin/hotfix-security

# Check out remote branch
git checkout origin/feature-auth        # Detached HEAD
git checkout -b feature-auth origin/feature-auth  # Create local tracking branch

# Update remote branch list
git remote prune origin                 # Remove deleted remote branches
git fetch --prune                       # Fetch and prune in one command
```

---

## **20. Tagging with Git**

### **Understanding Git Tags**

Tags are references that point to specific commits, typically used for marking release points:

```
Tag Types:
1. Lightweight tags: Simple pointer to a commit
2. Annotated tags: Full objects with metadata (recommended)

Timeline with tags:
A ── B ── C ── D ── E ── F
     │         │         │
   v1.0      v1.1      v2.0 (tags)
```

### **Creating Tags**

#### **Lightweight Tags**
```bash
# Create lightweight tag at current commit
git tag v1.0

# Create lightweight tag at specific commit
git tag v0.9 a1b2c3d

# Lightweight tags are just pointers (no metadata)
```

#### **Annotated Tags (Recommended)**
```bash
# Create annotated tag with message
git tag -a v1.0 -m "Release version 1.0"

# Create annotated tag at specific commit
git tag -a v0.9 a1b2c3d -m "Beta release 0.9"

# Create annotated tag with detailed message (opens editor)
git tag -a v1.0

# Example annotated tag message:
# Release version 1.0
# 
# New features:
# - User authentication
# - Product catalog
# - Shopping cart
# 
# Bug fixes:
# - Fixed login redirect issue
# - Resolved payment processing error
```

#### **Signed Tags (Maximum Security)**
```bash
# Create GPG-signed tag
git tag -s v1.0 -m "Signed release 1.0"

# Verify signed tag
git tag -v v1.0
```

### **Viewing Tags**

#### **Listing Tags**
```bash
# List all tags
git tag

# List tags with pattern
git tag -l "v1.*"
git tag --list "v2.0*"

# List tags with commit info
git tag -n
# v1.0            Release version 1.0
# v1.1            Bug fix release

# List tags with detailed info
git tag -n5                          # Show first 5 lines of tag message
```

#### **Tag Information**
```bash
# Show tag details
git show v1.0

# For annotated tag, shows:
# - Tag object info (tagger, date, message)
# - Commit info
# - Commit diff

# Show only tag object (for annotated tags)
git cat-file -p v1.0

# Show commit that tag points to
git rev-list -n 1 v1.0
```

### **Working with Remote Tags**

#### **Pushing Tags**
```bash
# Push specific tag
git push origin v1.0

# Push all tags
git push origin --tags
git push --tags

# Push both commits and tags
git push --follow-tags
```

#### **Fetching Tags**
```bash
# Fetch tags along with commits
git fetch origin

# Fetch only tags
git fetch origin --tags

# Fetch specific tag
git fetch origin refs/tags/v1.0:refs/tags/v1.0
```

#### **Deleting Tags**
```bash
# Delete local tag
git tag -d v1.0

# Delete remote tag
git push origin --delete v1.0
git push origin :refs/tags/v1.0      # Alternative syntax

# Delete multiple local tags
git tag -d v1.0 v1.1 v2.0
```

### **Release Management with Tags**

#### **Semantic Versioning**
```bash
# Follow semantic versioning: MAJOR.MINOR.PATCH
# Example: 2.1.3
# MAJOR: Breaking changes
# MINOR: New features (backward compatible)
# PATCH: Bug fixes (backward compatible)

# Tag examples
git tag -a v1.0.0 -m "Initial release"
git tag -a v1.1.0 -m "Add user authentication feature"
git tag -a v1.1.1 -m "Fix authentication bug"
git tag -a v2.0.0 -m "Breaking change: New API structure"
```

#### **Release Workflow**
```bash
# 1. Prepare release
git checkout main
git pull origin main

# 2. Update version files (if applicable)
echo "VERSION = '1.2.0'" > version.py
git add version.py
git commit -m "Bump version to 1.2.0"

# 3. Create release tag
git tag -a v1.2.0 -m "Release version 1.2.0

Features:
- Enhanced user interface
- Performance improvements
- New dashboard widgets

Bug fixes:
- Fixed memory leak in data processing
- Resolved CSS styling issues
- Fixed timezone handling

Breaking changes:
- API endpoint /api/v1/users moved to /api/v2/users"

# 4. Push release
git push origin main
git push origin v1.2.0

# 5. Create GitHub release (optional)
# Go to GitHub → Releases → Create new release
# Select tag v1.2.0 and add release notes
```

### **Working with Tag History**

#### **Checking Out Tags**
```bash
# Check out specific tag (detached HEAD)
git checkout v1.0
# Note: switching to 'v1.0'.
# You are in 'detached HEAD' state...

# Create branch from tag
git checkout -b hotfix-v1.0 v1.0

# See files as they were at tag
git show v1.0:filename.txt
```

#### **Comparing Tags**
```bash
# Compare two tags
git diff v1.0 v1.1

# See commits between tags
git log v1.0..v1.1

# See only commit messages between tags
git log --oneline v1.0..v1.1

# Generate changelog between tags
git log --pretty=format:"- %s" v1.0..v1.1
```

#### **Finding Tags**
```bash
# Find tags containing specific commit
git tag --contains a1b2c3d

# Find most recent tag reachable from commit
git describe
git describe --tags

# Find all tags in history
git log --oneline --decorate
```

---

## **🧪 Final Hands-On Exercises - Master Level**

### **Exercise 1: Complete GitHub Workflow**

```bash
# 1. Create and setup repository
mkdir e-commerce-platform
cd e-commerce-platform
git init

# Create project structure
mkdir src tests docs config
echo "# E-commerce Platform" > README.md
echo "A modern e-commerce solution" >> README.md

cat > src/app.py << 'EOF'
"""
E-commerce Platform Main Application
"""

def main():
    print("E-commerce Platform Starting...")

if __name__ == "__main__":
    main()
EOF

cat > config/settings.py << 'EOF'
# Application Configuration
DEBUG = True
DATABASE_URL = "sqlite:///ecommerce.db"
SECRET_KEY = "dev-secret-key"
EOF

cat > .gitignore << 'EOF'
# Python
__pycache__/
*.pyc
*.pyo

# Environment
.env
venv/

# Database
*.db
*.sqlite3

# IDE
.vscode/
.idea/
EOF

git add .
git commit -m "Initial e-commerce platform setup"

# 2. Create GitHub repository and connect
# (Create repository on GitHub first)
git remote add origin https://github.com/yourusername/e-commerce-platform.git
git branch -M main
git push -u origin main

# 3. Create feature branch workflow
git checkout -b feature/user-authentication

echo "def register_user(email, password): pass" >> src/app.py
echo "def login_user(email, password): pass" >> src/app.py
echo "def logout_user(): pass" >> src/app.py
git commit -am "Add user authentication functions"

cat > tests/test_auth.py << 'EOF'
import unittest
from src.app import register_user, login_user

class TestAuthentication(unittest.TestCase):
    def test_register_user(self):
        # Test user registration
        pass
    
    def test_login_user(self):
        # Test user login
        pass
EOF

git add tests/test_auth.py
git commit -m "Add authentication tests"

# 4. Push feature branch
git push -u origin feature/user-authentication

# 5. Simulate main branch updates (another developer's work)
git checkout main
echo "def validate_email(email): pass" >> src/app.py
git commit -am "Add email validation utility"
git push origin main

# 6. Update feature branch with main changes
git checkout feature/user-authentication
git fetch origin
git merge origin/main  # or git rebase origin/main

# Resolve any conflicts if they occur
git push origin feature/user-authentication

# 7. Complete feature and merge
git checkout main
git pull origin main
git merge feature/user-authentication
git push origin main

# 8. Clean up
git branch -d feature/user-authentication
git push origin --delete feature/user-authentication
```

### **Exercise 2: Advanced Remote Management**

```bash
# 1. Setup scenario with multiple remotes
mkdir open-source-contribution
cd open-source-contribution

# Fork a repository on GitHub, then clone your fork
git clone https://github.com/yourusername/popular-project.git
cd popular-project

# 2. Add upstream remote (original repository)
git remote add upstream https://github.com/original-owner/popular-project.git

# Verify remotes
git remote -v
# origin    https://github.com/yourusername/popular-project.git (fetch)
# origin    https://github.com/yourusername/popular-project.git (push)
# upstream  https://github.com/original-owner/popular-project.git (fetch)
# upstream  https://github.com/original-owner/popular-project.git (push)

# 3. Keep fork synchronized
git fetch upstream
git checkout main
git merge upstream/main
git push origin main

# 4. Create contribution branch
git checkout -b feature/improve-documentation
echo "## Installation Guide" >> README.md
echo "Detailed installation instructions..." >> README.md
git commit -am "Improve installation documentation"

# 5. Push to your fork
git push -u origin feature/improve-documentation

# 6. Simulate upstream changes while you work
git fetch upstream

# Check what changed upstream
git log HEAD..upstream/main

# Rebase your feature on latest upstream
git rebase upstream/main

# 7. Force push rebased branch (safe because it's your branch)
git push --force-with-lease origin feature/improve-documentation

# 8. After PR is merged upstream, clean up
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
git branch -d feature/improve-documentation
git push origin --delete feature/improve-documentation
```

### **Exercise 3: Complete Release Management**

```bash
# 1. Setup release repository
mkdir product-release-demo
cd product-release-demo
git init

# Create initial version
cat > VERSION << 'EOF'
0.1.0
EOF

cat > CHANGELOG.md << 'EOF'
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [0.1.0] - 2023-11-15
### Added
- Initial release
- Basic functionality
EOF

cat > src/main.py << 'EOF'
#!/usr/bin/env python3
"""
Product Demo Application
Version: 0.1.0
"""

VERSION = "0.1.0"

def main():
    print(f"Product Demo v{VERSION}")
    print("Basic functionality working!")

if __name__ == "__main__":
    main()
EOF

git add .
git commit -m "Initial release v0.1.0"
git tag -a v0.1.0 -m "Initial release v0.1.0"

# 2. Develop new features
cat > src/feature1.py << 'EOF'
def new_feature():
    return "New awesome feature!"
EOF

git add src/feature1.py
git commit -m "Add new awesome feature"

# Update main.py to use new feature
cat > src/main.py << 'EOF'
#!/usr/bin/env python3
"""
Product Demo Application
Version: 0.2.0
"""

from feature1 import new_feature

VERSION = "0.2.0"

def main():
    print(f"Product Demo v{VERSION}")
    print("Basic functionality working!")
    print(f"Extra: {new_feature()}")

if __name__ == "__main__":
    main()
EOF

git commit -am "Integrate new feature into main application"

# 3. Prepare minor release
echo "0.2.0" > VERSION

cat > CHANGELOG.md << 'EOF'
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [0.2.0] - 2023-11-16
### Added
- New awesome feature
- Feature integration

## [0.1.0] - 2023-11-15
### Added
- Initial release
- Basic functionality
EOF

git add VERSION CHANGELOG.md
git commit -m "Prepare release v0.2.0"

# 4. Create release tag
git tag -a v0.2.0 -m "Release v0.2.0

### Added
- New awesome feature  
- Feature integration with main application

### Changed
- Updated main application to showcase new feature

This release adds exciting new functionality while maintaining
backward compatibility."

# 5. Develop bug fix
sed -i 's/awesome/amazing/' src/feature1.py
git commit -am "Fix typo in feature description"

# 6. Prepare patch release
echo "0.2.1" > VERSION

cat > CHANGELOG.md << 'EOF'
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [0.2.1] - 2023-11-16
### Fixed
- Fixed typo in feature description

## [0.2.0] - 2023-11-16
### Added
- New awesome feature
- Feature integration

## [0.1.0] - 2023-11-15
### Added
- Initial release
- Basic functionality
EOF

cat > src/main.py << 'EOF'
#!/usr/bin/env python3
"""
Product Demo Application
Version: 0.2.1
"""

from feature1 import new_feature

VERSION = "0.2.1"

def main():
    print(f"Product Demo v{VERSION}")
    print("Basic functionality working!")
    print(f"Extra: {new_feature()}")

if __name__ == "__main__":
    main()
EOF

git add VERSION CHANGELOG.md src/main.py
git commit -m "Prepare patch release v0.2.1"

git tag -a v0.2.1 -m "Patch release v0.2.1

### Fixed
- Fixed typo in feature description

Quick patch release to fix minor text issue."

# 7. View release history
git log --oneline --decorate
git tag -l
git show v0.2.1

# 8. Compare releases
git diff v0.1.0 v0.2.1
git log --oneline v0.1.0..v0.2.1

# 9. Generate release notes
echo "# Release Notes v0.2.1" > RELEASE_NOTES.md
echo "" >> RELEASE_NOTES.md
echo "## Changes since v0.1.0:" >> RELEASE_NOTES.md
git log --pretty=format:"- %s" v0.1.0..v0.2.1 >> RELEASE_NOTES.md

cat RELEASE_NOTES.md
```

### **Exercise 4: Professional Collaboration Workflow**

```bash
# 1. Setup team repository simulation
mkdir team-collaboration-demo
cd team-collaboration-demo
git init

# Create initial project (Team Lead)
mkdir src tests docs
echo "# Team Project" > README.md
echo "def calculate(a, b): return a + b" > src/calculator.py
echo "# Documentation" > docs/README.md
git add .
git commit -m "Initial team project setup"

# Simulate GitHub setup
git branch -M main

# 2. Simulate team member workflow
git checkout -b team-member-alice
echo "def subtract(a, b): return a - b" >> src/calculator.py
echo "def multiply(a, b): return a * b" >> src/calculator.py
git commit -am "Add subtract and multiply functions - Alice"

# 3. Simulate another team member
git checkout main
git checkout -b team-member-bob
echo "import unittest" > tests/test_calculator.py
echo "from src.calculator import calculate" >> tests/test_calculator.py
echo "" >> tests/test_calculator.py
echo "class TestCalculator(unittest.TestCase):" >> tests/test_calculator.py
echo "    def test_calculate(self):" >> tests/test_calculator.py
echo "        self.assertEqual(calculate(2, 3), 5)" >> tests/test_calculator.py
git add tests/test_calculator.py
git commit -m "Add unit tests for calculator - Bob"

# 4. Simulate main branch updates (Team Lead)
git checkout main
echo "## Features" >> README.md
echo "- Basic arithmetic operations" >> README.md
git commit -am "Update documentation with feature list"

# 5. Team member syncs and resolves conflicts
git checkout team-member-alice
git fetch origin  # Simulate fetch from remote
git merge main    # Merge main changes

# Continue Alice's work
echo "def divide(a, b):" >> src/calculator.py
echo "    if b == 0:" >> src/calculator.py
echo "        raise ValueError('Cannot divide by zero')" >> src/calculator.py
echo "    return a / b" >> src/calculator.py
git commit -am "Add division function with error handling - Alice"

# 6. Bob syncs and extends tests
git checkout team-member-bob
git merge main    # Merge main changes

# Add more tests
echo "" >> tests/test_calculator.py
echo "    def test_calculate_negative(self):" >> tests/test_calculator.py
echo "        self.assertEqual(calculate(-1, 1), 0)" >> tests/test_calculator.py
git commit -am "Add negative number test - Bob"

# 7. Merge Alice's work first
git checkout main
git merge team-member-alice

# 8. Merge Bob's work (might need conflict resolution)
git merge team-member-bob
# If conflicts occur in tests, resolve them

# 9. Add comprehensive tests for all functions
cat >> tests/test_calculator.py << 'EOF'

    def test_subtract(self):
        self.assertEqual(subtract(5, 3), 2)
    
    def test_multiply(self):
        self.assertEqual(multiply(4, 3), 12)
    
    def test_divide(self):
        self.assertEqual(divide(6, 2), 3)
        
    def test_divide_by_zero(self):
        with self.assertRaises(ValueError):
            divide(5, 0)
EOF

git add tests/test_calculator.py
git commit -m "Complete test suite for all calculator functions"

# 10. Create final release
echo "v1.0.0" > VERSION
git add VERSION
git commit -m "Prepare version 1.0.0 release"

git tag -a v1.0.0 -m "Version 1.0.0 - Complete Calculator

Features:
- Basic arithmetic operations (add, subtract, multiply, divide)
- Error handling for division by zero
- Comprehensive test suite
- Full documentation

Contributors:
- Alice (arithmetic functions)
- Bob (test suite)
- Team Lead (project structure and documentation)"

# 11. View final project state
git log --oneline --graph --all
git show v1.0.0
git diff --name-status v1.0.0~5 v1.0.0
```

---

## **🎓 Git Mastery Assessment & Graduation**

### **Final Assessment Quiz**

Test your Git mastery with these professional scenarios:

```bash
# Assessment repository setup
mkdir git-mastery-assessment
cd git-mastery-assessment
git init

# Create test scenario
echo "# Git Mastery Assessment" > README.md
git add README.md
git commit -m "Initial assessment setup"
```

#### **Scenario 1: Emergency Hotfix**
*You're working on a feature branch when a critical bug is discovered in production. How do you handle this?*

**Your Solution:**
```bash
# 1. Save current work
git stash push -m "WIP: feature development"

# 2. Switch to main and create hotfix
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-bug

# 3. Fix the bug
echo "SECURITY_PATCH = True" > security_fix.py
git add security_fix.py
git commit -m "Fix critical security vulnerability"

# 4. Deploy hotfix
git checkout main
git merge hotfix/critical-security-bug
git tag -a v1.2.1 -m "Emergency security patch"
git push origin main
git push origin v1.2.1

# 5. Update feature branch with fix
git checkout feature-branch
git merge main

# 6. Resume work
git stash pop

# 7. Clean up
git branch -d hotfix/critical-security-bug
```

#### **Scenario 2: Collaborative Conflict Resolution**
*Two team members modified the same file. How do you merge their changes?*

**Your Solution:**
```bash
# Setup the conflict scenario
git checkout -b feature-teamA
echo "function userAuth() { /* Team A implementation */ }" > auth.js
git add auth.js
git commit -m "Team A: Add authentication"

git checkout main
git checkout -b feature-teamB
echo "function userAuth() { /* Team B implementation */ }" > auth.js
git add auth.js
git commit -m "Team B: Add authentication"

# Merge Team A first
git checkout main
git merge feature-teamA

# Merge Team B (conflict!)
git merge feature-teamB

# Resolve by combining approaches
cat > auth.js << 'EOF'
function userAuth() {
    // Combined implementation from Team A and Team B
    // Team A approach: validation
    // Team B approach: security
    /* Combined best practices implementation */
}
EOF

git add auth.js
git commit -m "Resolve authentication implementation - combine Team A and B approaches"
```

#### **Scenario 3: Release Management**
*Create a proper release workflow with semantic versioning.*

**Your Solution:**
```bash
# 1. Prepare release branch
git checkout -b release/v2.0.0

# 2. Update version information
echo "VERSION = '2.0.0'" > version.py
echo "2.0.0" > VERSION

# 3. Update changelog
cat > CHANGELOG.md << 'EOF'
# Changelog

## [2.0.0] - 2023-11-16
### Added
- New user interface
- Advanced authentication
- Performance improvements

### Changed
- API structure (breaking change)
- Database schema update

### Removed
- Deprecated legacy endpoints
EOF

git add version.py VERSION CHANGELOG.md
git commit -m "Prepare release v2.0.0"

# 4. Create and push release
git checkout main
git merge release/v2.0.0
git tag -a v2.0.0 -m "Major release v2.0.0 with breaking changes"
git push origin main
git push origin v2.0.0

# 5. Clean up
git branch -d release/v2.0.0
```

### **Mastery Checklist**

Mark each skill as mastered:

#### **Foundation Skills**
- [ ] Git installation and configuration
- [ ] Repository initialization and cloning
- [ ] Basic file operations (add, commit, status)
- [ ] Understanding Git's three-tree architecture

#### **File Management**
- [ ] Staging and unstaging files
- [ ] Viewing differences with git diff
- [ ] Moving and renaming files
- [ ] Working with .gitignore files

#### **Change Management**
- [ ] Undoing changes (reset, revert, restore)
- [ ] Amending commits
- [ ] Interactive staging
- [ ] Stashing changes

#### **Branching & Merging**
- [ ] Creating and switching branches
- [ ] Merging strategies (fast-forward, three-way)
- [ ] Resolving merge conflicts
- [ ] Comparing branches and commits

#### **Remote Repositories**
- [ ] Adding and managing remotes
- [ ] Push, pull, and fetch operations
- [ ] Remote branch management
- [ ] Authentication setup (SSH/HTTPS)

#### **Collaboration**
- [ ] Fork and pull request workflow
- [ ] Handling upstream repositories
- [ ] Team collaboration strategies
- [ ] Code review processes

#### **Release Management**
- [ ] Creating and managing tags
- [ ] Semantic versioning
- [ ] Release branching strategies
- [ ] Changelog management

#### **Advanced Skills**
- [ ] Interactive rebase
- [ ] Cherry-picking commits
- [ ] Advanced conflict resolution
- [ ] Git hooks and automation

---

## **🎉 Congratulations - Git Master Achieved!**

### **Certificate of Git Mastery**

```
╔══════════════════════════════════════════════════════════════╗
║                     🏆 CERTIFICATE OF MASTERY 🏆            ║
║                                                              ║
║                        Git Version Control                   ║
║                                                              ║
║    This certifies that you have successfully mastered       ║
║              Professional Git Development                    ║
║                                                              ║
║                     ⭐ SKILLS MASTERED ⭐                    ║
║   • Complete Git Workflow Management                        ║
║   • Advanced Branching and Merging                          ║
║   • Professional Collaboration Techniques                   ║
║   • Release Management and Tagging                          ║
║   • Conflict Resolution Expertise                           ║
║   • Remote Repository Management                            ║
║                                                              ║
║          "Version control is the foundation of              ║
║           all professional software development!"           ║
║                                                              ║
║     🚀 Ready for Professional Software Development! 🚀      ║
╚══════════════════════════════════════════════════════════════╝
```

### **Your Git Toolkit Summary**

You now have mastery over these essential Git commands:

```bash
# Repository Management
git init, git clone, git remote

# File Operations  
git add, git commit, git status, git diff, git rm, git mv

# Change Management
git reset, git revert, git restore, git stash

# Branch Management
git branch, git checkout, git switch, git merge

# Remote Operations
git push, git pull, git fetch

# Release Management
git tag, git show, git log

# Collaboration
git blame, git bisect, git cherry-pick, git rebase
```

### **Professional Development Path**

#### **Next Steps in Your Journey:**

1. **Advanced Git Techniques:**
   - Interactive rebase (`git rebase -i`)
   - Git hooks for automation
   - Advanced conflict resolution strategies
   - Git submodules and subtrees

2. **DevOps Integration:**
   - CI/CD pipeline integration
   - Git with Docker workflows
   - Infrastructure as Code with Git
   - Automated testing and deployment

3. **Team Leadership:**
   - Establishing Git workflows for teams
   - Code review best practices
   - Release management strategies
   - Git training and mentoring

4. **Specialized Workflows:**
   - GitFlow workflow
   - GitHub Flow
   - GitLab Flow
   - Custom enterprise workflows

### **Professional Applications:**

Your Git mastery enables you to excel in:

- **Software Development**: Version control for any programming language
- **DevOps Engineering**: Infrastructure and deployment automation
- **Technical Writing**: Documentation version control
- **Data Science**: Experiment and model versioning
- **System Administration**: Configuration management
- **Project Management**: Technical project coordination

### **Community and Resources:**

- **Git Official Documentation**: https://git-scm.com/doc
- **GitHub Learning Lab**: https://lab.github.com/
- **Atlassian Git Tutorials**: https://www.atlassian.com/git/tutorials
- **Pro Git Book**: https://git-scm.com/book (Free online)

### **Final Words**

You've completed a comprehensive journey from Git basics to professional mastery. You now possess the skills that 90% of software professionals rely on daily. Git is more than just a tool—it's the foundation that enables modern collaborative software development.

**Remember our Professional Mantra**: *"Version control is the foundation of all professional software development!"*

Your Git journey doesn't end here—it evolves. Every project will teach you new patterns, every team will show you new workflows, and every challenge will deepen your expertise.

**Welcome to the ranks of Git Masters!** 🚀

Go forth and version control the world! 🌟 tag at current commit
git tag v1.0

# Create lightweight
