# Linux Shell Scripting - Complete Hands-On Guide

## 🚀 Master Shell Scripting Like Magic!

**Magic Mantra: "Scripts are like recipes - write once, use forever!"**

---

## 📋 Complete Course Contents

1. [Introduction to Shells](#1-introduction-to-shells)
2. [Writing Your First Bash Script](#2-writing-your-first-bash-script)
3. [Script Permissions and Execution](#3-script-permissions-and-execution)
4. [Variables and User Input](#4-variables-and-user-input)
5. [Conditional Statements](#5-conditional-statements)
6. [Loops (for, while, until)](#6-loops-for-while-until)
7. [Case Statements](#7-case-statements)
8. [Functions in Shell Scripts](#8-functions-in-shell-scripts)
9. [Working with Arguments and Return Values](#9-working-with-arguments-and-return-values)
10. [Reading Files in Scripts](#10-reading-files-in-scripts)
11. [Logging Script Output](#11-logging-script-output)
12. [Debugging Shell Scripts](#12-debugging-shell-scripts)
13. [Automating System Tasks](#13-automating-system-tasks)
14. [Script Scheduling with Crontab](#14-script-scheduling-with-crontab)
15. [Interactive Scripts with Menus and Colors](#15-interactive-scripts-with-menus-and-colors)
16. [Best Practices for Writing Maintainable Scripts](#16-best-practices-for-writing-maintainable-scripts)
17. [Creating a Library of Reusable Shell Scripts](#17-creating-a-library-of-reusable-shell-scripts)
18. [Real-World Examples](#18-real-world-examples)

---

# 1. Introduction to Shells

## 🔑 Core Concept
Shell is your interpreter - it translates your commands into system language. bash is the most popular!

## 📊 Shell Types and Features
```
Shell Family Tree

├── Bourne Shell (sh)      ← Original UNIX shell
├── Bash (bash)            ← Bourne Again Shell (most popular)
├── Z Shell (zsh)          ← Enhanced bash with features
├── C Shell (csh)          ← C-like syntax
├── Korn Shell (ksh)       ← Advanced features
└── Fish (fish)            ← User-friendly shell

Bash Features:
├── Command History        ← Up/Down arrows
├── Tab Completion        ← Auto-complete commands
├── Job Control           ← Background/foreground jobs
├── Aliases               ← Command shortcuts
├── Functions             ← Reusable code blocks
├── Variables             ← Store data
├── Arrays                ← Store multiple values
└── Scripting             ← Automation
```

## 🛠️ Hands-On Commands

### Step 1: Understanding Your Shell Environment
```bash
# Check available shells
cat /etc/shells

# Check current shell
echo $SHELL
echo $0

# Shell features
echo $BASH_VERSION      # Bash version
set                     # All shell variables
env                     # Environment variables
alias                   # Current aliases

# Change shell (temporary)
bash                    # Start bash shell
zsh                     # Start zsh shell (if available)
exit                    # Exit current shell

# Shell history
history                 # Command history
history | tail -10      # Last 10 commands
!!                      # Repeat last command
!10                     # Repeat command #10
!ssh                    # Repeat last ssh command
```

### Step 2: Shell Variables and Environment
```bash
# Important shell variables
echo "Shell: $SHELL"
echo "Home: $HOME"
echo "User: $USER"
echo "Path: $PATH"
echo "PWD: $PWD"
echo "Process ID: $$"
echo "Exit Status: $?"

# Create and use variables
MY_VAR="Hello World"
echo $MY_VAR
echo ${MY_VAR}

# Export variables to environment
export GLOBAL_VAR="Available to child processes"
bash -c 'echo $GLOBAL_VAR'
```

### Step 3: Command Line Editing
```bash
# Bash shortcuts (memorize these!)
echo "Essential Bash Shortcuts:"
echo "Ctrl+A - Move to beginning of line"
echo "Ctrl+E - Move to end of line"
echo "Ctrl+K - Delete from cursor to end"
echo "Ctrl+U - Delete from cursor to beginning"
echo "Ctrl+W - Delete word before cursor"
echo "Ctrl+Y - Paste last deleted text"
echo "Ctrl+R - Search command history"
echo "Ctrl+L - Clear screen"
echo "Tab - Auto-complete"
echo "!! - Repeat last command"
```

### Step 4: Shell Configuration Files
```bash
# Check shell configuration files
echo "=== SHELL CONFIGURATION FILES ==="
ls -la ~/.bash* 2>/dev/null || echo "No bash config files"
ls -la ~/.profile 2>/dev/null || echo "No .profile file"

# Configuration file hierarchy
echo ""
echo "Configuration file loading order:"
echo "1. /etc/profile (system-wide)"
echo "2. ~/.bash_profile or ~/.profile (user login)"
echo "3. ~/.bashrc (user interactive)"
echo "4. ~/.bash_logout (logout)"
```

## 🎯 Practice Exercise 1.1: Shell Environment Analysis
```bash
# Create shell environment analysis script
cat << 'EOF' > shell_analysis.sh
#!/bin/bash
# Shell Environment Analysis

echo "=== SHELL ENVIRONMENT ANALYSIS ==="
echo "Analysis Date: $(date)"
echo ""

echo "1. SHELL INFORMATION:"
echo "   Current Shell: $SHELL"
echo "   Shell Version: $BASH_VERSION"
echo "   Shell Level: $SHLVL"
echo "   Process ID: $$"
echo "   Parent PID: $PPID"
echo ""

echo "2. USER ENVIRONMENT:"
echo "   Username: $USER"
echo "   Home Directory: $HOME"
echo "   Current Directory: $PWD"
echo "   Previous Directory: $OLDPWD"
echo ""

echo "3. SYSTEM ENVIRONMENT:"
echo "   Hostname: $HOSTNAME"
echo "   Operating System: $OSTYPE"
echo "   Machine Type: $MACHTYPE"
echo "   Terminal: $TERM"
echo ""

echo "4. PATH ANALYSIS:"
echo "   PATH has $(echo $PATH | tr ':' '\n' | wc -l) directories:"
echo $PATH | tr ':' '\n' | nl
echo ""

echo "5. SHELL OPTIONS:"
echo "   Current shell options:"
set -o | grep on | head -5
echo ""

echo "6. ALIASES:"
echo "   Current aliases:"
alias | head -5
echo ""

echo "7. FUNCTIONS:"
echo "   User-defined functions:"
declare -F | head -5 || echo "   No user-defined functions"
echo ""

echo "8. HISTORY:"
echo "   Command history size: $HISTSIZE"
echo "   History file: $HISTFILE"
echo "   Last 3 commands:"
history | tail -3

echo ""
echo "=== ANALYSIS COMPLETE ==="
EOF

chmod +x shell_analysis.sh
./shell_analysis.sh
```

**🔍 What You Learned:**
- Bash is the most common Linux shell
- Shell variables store information
- Configuration files customize your environment
- Command history and shortcuts boost productivity
- Environment variables are inherited by child processes

---

# 2. Writing Your First Bash Script

## 🔑 Core Concept
Scripts are like recipes - step by step instructions saved in a file!

## 📊 Script Structure and Components
```
Basic Script Structure:

#!/bin/bash              ← Shebang (tells system which interpreter to use)
#                        ← Comments start with #
# Script: myscript.sh    ← Good practice: describe the script
# Purpose: What it does  ← Always document purpose
# Author: Your name      ← Credit yourself
# Date: Creation date    ← When was it created

# Variables
SCRIPT_NAME="My Script"
VERSION="1.0"

# Functions
function_name() {
    # Function code here
    echo "Function executed"
}

# Main script logic
echo "Script starting..."
function_name
echo "Script finished"

# Exit with status code
exit 0                   ← 0 = success, 1+ = error
```

## 🛠️ Hands-On Commands

### Step 1: Create Your First Script
```bash
# Create a simple "Hello World" script
cat << 'EOF' > hello_world.sh
#!/bin/bash
# My First Bash Script
# Purpose: Print Hello World and system info

echo "Hello, World!"
echo "Today is: $(date)"
echo "Current user: $(whoami)"
echo "Current directory: $(pwd)"
echo "System uptime: $(uptime)"
EOF

# Make it executable
chmod +x hello_world.sh

# Run the script
./hello_world.sh
```

### Step 2: Enhanced First Script with Variables
```bash
# Create an enhanced script with variables
cat << 'EOF' > enhanced_hello.sh
#!/bin/bash
# Enhanced Hello World Script
# Purpose: Demonstrate variables and system information

# Script metadata
SCRIPT_NAME="Enhanced Hello Script"
VERSION="1.0"
AUTHOR="$(whoami)"
DATE="$(date '+%Y-%m-%d')"

# System variables
HOSTNAME="$(hostname)"
KERNEL="$(uname -r)"
UPTIME="$(uptime -p)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script output
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}$SCRIPT_NAME v$VERSION${NC}"
echo -e "${GREEN}Created by: $AUTHOR${NC}"
echo -e "${GREEN}Date: $DATE${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

echo -e "${BLUE}System Information:${NC}"
echo -e "${YELLOW}Hostname:${NC} $HOSTNAME"
echo -e "${YELLOW}Kernel:${NC} $KERNEL"
echo -e "${YELLOW}Uptime:${NC} $UPTIME"
echo -e "${YELLOW}Current User:${NC} $(whoami)"
echo -e "${YELLOW}Current Directory:${NC} $(pwd)"
echo -e "${YELLOW}Date/Time:${NC} $(date)"

echo ""
echo -e "${RED}Script execution completed!${NC}"
EOF

chmod +x enhanced_hello.sh
./enhanced_hello.sh
```

### Step 3: Script with Basic Error Handling
```bash
# Create script with error handling
cat << 'EOF' > error_handling_demo.sh
#!/bin/bash
# Error Handling Demo Script
# Purpose: Demonstrate basic error handling

# Exit on any error
set -e

# Function to handle errors
error_exit() {
    echo "ERROR: $1" >&2
    exit 1
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo "=== ERROR HANDLING DEMONSTRATION ==="

# Check if required commands exist
echo "Checking required commands..."
for cmd in ls pwd whoami date; do
    if command_exists "$cmd"; then
        echo "✅ $cmd is available"
    else
        error_exit "$cmd command not found"
    fi
done

# Test file operations with error checking
echo ""
echo "Testing file operations..."

# Create a test file
TEST_FILE="/tmp/test_file.txt"
echo "Creating test file: $TEST_FILE"
echo "Test content" > "$TEST_FILE" || error_exit "Failed to create test file"
echo "✅ Test file created successfully"

# Read the test file
echo "Reading test file..."
if [ -f "$TEST_FILE" ]; then
    echo "✅ File exists, content: $(cat $TEST_FILE)"
else
    error_exit "Test file does not exist"
fi

# Clean up
echo "Cleaning up..."
rm "$TEST_FILE" || error_exit "Failed to remove test file"
echo "✅ Cleanup completed"

echo ""
echo "🎉 All operations completed successfully!"
EOF

chmod +x error_handling_demo.sh
./error_handling_demo.sh
```

### Step 4: Interactive Script
```bash
# Create an interactive script
cat << 'EOF' > interactive_script.sh
#!/bin/bash
# Interactive Script Demo
# Purpose: Get user input and respond

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== INTERACTIVE SCRIPT DEMO ===${NC}"
echo ""

# Get user's name
echo -e "${BLUE}What's your name?${NC}"
read -p "Enter your name: " USER_NAME

# Get user's age
echo -e "${BLUE}How old are you?${NC}"
read -p "Enter your age: " USER_AGE

# Get user's favorite color
echo -e "${BLUE}What's your favorite color?${NC}"
read -p "Enter your favorite color: " FAVORITE_COLOR

# Display collected information
echo ""
echo -e "${YELLOW}=== USER INFORMATION ===${NC}"
echo -e "${YELLOW}Name:${NC} $USER_NAME"
echo -e "${YELLOW}Age:${NC} $USER_AGE"
echo -e "${YELLOW}Favorite Color:${NC} $FAVORITE_COLOR"

# Provide age-based message
echo ""
if [ "$USER_AGE" -lt 18 ]; then
    echo -e "${GREEN}You're young! Enjoy your youth, $USER_NAME!${NC}"
elif [ "$USER_AGE" -lt 65 ]; then
    echo -e "${GREEN}You're in your prime, $USER_NAME!${NC}"
else
    echo -e "${GREEN}Wisdom comes with age, $USER_NAME!${NC}"
fi

echo ""
echo -e "${BLUE}Thanks for using the interactive script!${NC}"
EOF

chmod +x interactive_script.sh
# Run it interactively
echo "Run: ./interactive_script.sh"
```

### Step 5: System Information Script
```bash
# Create comprehensive system information script
cat << 'EOF' > system_info.sh
#!/bin/bash
# System Information Script
# Purpose: Display comprehensive system information

# Script metadata
SCRIPT_NAME="System Information Reporter"
VERSION="2.0"
REPORT_DATE="$(date)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Function to print section header
print_header() {
    echo -e "\n${GREEN}=== $1 ===${NC}"
}

# Function to print key-value pair
print_info() {
    printf "%-20s: %s\n" "$1" "$2"
}

# Main report
echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║           $SCRIPT_NAME v$VERSION            ║${NC}"
echo -e "${CYAN}║           Generated: $(date '+%Y-%m-%d %H:%M')          ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"

# System Information
print_header "SYSTEM INFORMATION"
print_info "Hostname" "$(hostname)"
print_info "Operating System" "$(lsb_release -d 2>/dev/null | cut -f2 || echo 'Unknown')"
print_info "Kernel Version" "$(uname -r)"
print_info "Architecture" "$(uname -m)"
print_info "Uptime" "$(uptime -p)"

# User Information
print_header "USER INFORMATION"
print_info "Current User" "$(whoami)"
print_info "User ID" "$(id -u)"
print_info "Group ID" "$(id -g)"
print_info "Home Directory" "$HOME"
print_info "Shell" "$SHELL"

# Hardware Information
print_header "HARDWARE INFORMATION"
print_info "CPU Model" "$(lscpu | grep 'Model name' | cut -d':' -f2 | xargs)"
print_info "CPU Cores" "$(nproc)"
print_info "Total Memory" "$(free -h | grep Mem | awk '{print $2}')"
print_info "Available Memory" "$(free -h | grep Mem | awk '{print $7}')"

# Disk Information
print_header "DISK INFORMATION"
print_info "Root Filesystem" "$(df -h / | tail -1 | awk '{print $2}')"
print_info "Used Space" "$(df -h / | tail -1 | awk '{print $3}')"
print_info "Available Space" "$(df -h / | tail -1 | awk '{print $4}')"
print_info "Usage Percentage" "$(df -h / | tail -1 | awk '{print $5}')"

# Network Information
print_header "NETWORK INFORMATION"
print_info "IP Address" "$(ip route get 8.8.8.8 | awk '{print $7}' | head -1)"
print_info "Gateway" "$(ip route | grep default | awk '{print $3}' | head -1)"

# Process Information
print_header "PROCESS INFORMATION"
print_info "Total Processes" "$(ps aux | wc -l)"
print_info "Running Processes" "$(ps aux | awk '$8 ~ /R/ {count++} END {print count+0}')"
print_info "Load Average" "$(uptime | awk -F'load average:' '{print $2}')"

echo ""
echo -e "${GREEN}Report generated successfully!${NC}"
echo -e "${YELLOW}Execution time: $(date)${NC}"
EOF

chmod +x system_info.sh
./system_info.sh
```

## 🎯 Practice Exercise 2.1: Personal Script Creator
```bash
# Create a script that helps create other scripts
cat << 'EOF' > script_creator.sh
#!/bin/bash
# Script Creator Tool
# Purpose: Help create new bash scripts with templates

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== BASH SCRIPT CREATOR ===${NC}"
echo ""

# Get script name
read -p "Enter script name (without .sh): " SCRIPT_NAME
SCRIPT_FILE="${SCRIPT_NAME}.sh"

# Check if file already exists
if [ -f "$SCRIPT_FILE" ]; then
    echo -e "${RED}Error: $SCRIPT_FILE already exists!${NC}"
    read -p "Overwrite? (y/N): " OVERWRITE
    if [[ ! "$OVERWRITE" =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

# Get script details
read -p "Enter script purpose: " SCRIPT_PURPOSE
read -p "Enter your name: " AUTHOR_NAME

# Create the script
cat << SCRIPT_TEMPLATE > "$SCRIPT_FILE"
#!/bin/bash
# Script: $SCRIPT_NAME.sh
# Purpose: $SCRIPT_PURPOSE
# Author: $AUTHOR_NAME
# Date: $(date '+%Y-%m-%d')
# Version: 1.0

# Exit on any error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Script variables
SCRIPT_NAME="$SCRIPT_NAME"
VERSION="1.0"
AUTHOR="$AUTHOR_NAME"

# Function to print colored output
print_info() {
    echo -e "\${BLUE}INFO:\${NC} \$1"
}

print_success() {
    echo -e "\${GREEN}SUCCESS:\${NC} \$1"
}

print_warning() {
    echo -e "\${YELLOW}WARNING:\${NC} \$1"
}

print_error() {
    echo -e "\${RED}ERROR:\${NC} \$1" >&2
}

# Main script logic starts here
echo -e "\${GREEN}=== \$SCRIPT_NAME v\$VERSION ===\${NC}"
echo -e "\${BLUE}Purpose:\${NC} $SCRIPT_PURPOSE"
echo -e "\${BLUE}Author:\${NC} \$AUTHOR"
echo -e "\${BLUE}Date:\${NC} \$(date)"
echo ""

print_info "Script execution started"

# TODO: Add your script logic here
print_warning "This is a template script - add your logic!"

print_success "Script execution completed"
echo ""
echo -e "\${GREEN}Done!\${NC}"
SCRIPT_TEMPLATE

# Make the script executable
chmod +x "$SCRIPT_FILE"

echo -e "${GREEN}✅ Script created successfully!${NC}"
echo -e "${BLUE}File:${NC} $SCRIPT_FILE"
echo -e "${BLUE}Permissions:${NC} $(ls -l $SCRIPT_FILE | awk '{print $1}')"
echo ""
echo -e "${YELLOW}To run your script:${NC} ./$SCRIPT_FILE"
echo -e "${YELLOW}To edit your script:${NC} nano $SCRIPT_FILE"
EOF

chmod +x script_creator.sh
echo "Run ./script_creator.sh to create new scripts easily!"
```

**🔍 What You Learned:**
- Scripts start with shebang (#!/bin/bash)
- Comments document your code
- Variables store data and configuration
- Colors make output more readable
- Always make scripts executable with chmod +x
- Good scripts have error handling and documentation

---

# 3. Script Permissions and Execution

## 🔑 Core Concept
Scripts need execute permission to run. Think of it like giving someone permission to use your recipe!

## 📊 Script Execution Methods
```
Script Execution Methods:

1. Direct Execution (Requires +x permission):
   ./script.sh

2. Interpreter Execution (No +x needed):
   bash script.sh
   sh script.sh

3. Source Execution (Runs in current shell):
   source script.sh
   . script.sh

Permission Structure:
-rwxr-xr-x
 │││││││││
 │││└─┴─┴── Others permissions (r-x)
 │││
 ││└─┴─┴─── Group permissions (r-x)
 ││
 │└─┴─┴──── User permissions (rwx)
 │
 └────────── File type (- = regular file)

Common Script Permissions:
├── 755 (rwxr-xr-x) - Standard executable script
├── 750 (rwxr-x---) - Executable by owner and group only
├── 700 (rwx------) - Executable by owner only
└── 644 (rw-r--r--) - Not executable (source only)
```

## 🛠️ Hands-On Commands

### Step 1: Understanding Script Permissions
```bash
# Create a test script
cat << 'EOF' > permission_test.sh
#!/bin/bash
echo "This script is running!"
echo "Current user: $(whoami)"
echo "Script permissions: $(ls -l $0 | awk '{print $1}')"
EOF

# Check initial permissions
echo "=== INITIAL PERMISSIONS ==="
ls -l permission_test.sh

# Try to execute without execute permission
echo ""
echo "=== TRYING TO RUN WITHOUT EXECUTE PERMISSION ==="
./permission_test.sh 2>/dev/null || echo "❌ Failed: No execute permission"

# Run with bash interpreter (no execute permission needed)
echo ""
echo "=== RUNNING WITH BASH INTERPRETER ==="
bash permission_test.sh
```

### Step 2: Adding Execute Permissions
```bash
# Add execute permission for user only
echo "=== ADDING EXECUTE PERMISSION (USER ONLY) ==="
chmod u+x permission_test.sh
ls -l permission_test.sh
./permission_test.sh

# Add execute permission for all
echo ""
echo "=== ADDING EXECUTE PERMISSION (ALL USERS) ==="
chmod +x permission_test.sh
ls -l permission_test.sh

# Using numeric permissions
echo ""
echo "=== USING NUMERIC PERMISSIONS ==="
chmod 755 permission_test.sh
ls -l permission_test.sh
echo "755 = rwxr-xr-x (owner: read,write,execute; group: read,execute; others: read,execute)"
```

### Step 3: Different Execution Methods
```bash
# Create a script that shows execution method
cat << 'EOF' > execution_methods.sh
#!/bin/bash
# Script to demonstrate different execution methods

echo "=== EXECUTION METHOD DEMONSTRATION ==="
echo "Script name: $0"
echo "Parent process: $PPID"
echo "Current shell PID: $$"
echo "Bash subshell level: $BASH_SUBSHELL"

# Set a variable
SCRIPT_VAR="I am a script variable"
echo "Script variable set: $SCRIPT_VAR"

# Export the variable
export SCRIPT_VAR
echo "Variable exported to environment"
EOF

chmod +x execution_methods.sh

echo "=== METHOD 1: DIRECT EXECUTION ==="
./execution_methods.sh
echo "Check if variable exists in current shell: ${SCRIPT_VAR:-'Not found'}"
echo ""

echo "=== METHOD 2: BASH EXECUTION ==="
bash execution_methods.sh
echo "Check if variable exists in current shell: ${SCRIPT_VAR:-'Not found'}"
echo ""

echo "=== METHOD 3: SOURCE EXECUTION ==="
source execution_methods.sh
echo "Check if variable exists in current shell: ${SCRIPT_VAR:-'Not found'}"
```

### Step 4: Script Location and PATH
```bash
# Create a script in current directory
cat << 'EOF' > my_command.sh
#!/bin/bash
echo "My custom command is working!"
echo "Called from: $(pwd)"
echo "Script location: $(dirname $0)"
EOF

chmod +x my_command.sh

echo "=== RUNNING SCRIPT FROM CURRENT DIRECTORY ==="
./my_command.sh

# Copy script to a location in PATH
echo ""
echo "=== INSTALLING SCRIPT TO PATH ==="
sudo cp my_command.sh /usr/local/bin/my_command

echo "Script installed. Now you can run it from anywhere:"
echo "my_command"

# Show PATH
echo ""
echo "=== PATH DIRECTORIES ==="
echo "Your PATH contains these directories:"
echo $PATH | tr ':' '\n' | nl

# Clean up
sudo rm -f /usr/local/bin/my_command
```

### Step 5: Security Considerations
```bash
# Create script to demonstrate security concepts
cat << 'EOF' > security_demo.sh
#!/bin/bash
# Security Demonstration Script

echo "=== SCRIPT SECURITY DEMONSTRATION ==="

# Check script permissions
SCRIPT_PERM=$(stat -c "%a" "$0")
echo "Current script permissions: $SCRIPT_PERM"

# Warn about dangerous permissions
if [ "$SCRIPT_PERM" = "777" ]; then
    echo "⚠️  WARNING: Script has world-writable permissions (777)!"
    echo "   This is dangerous - anyone can modify your script!"
elif [ "${SCRIPT_PERM:2:1}" != "0" ] && [ "${SCRIPT_PERM:2:1}" != "4" ] && [ "${SCRIPT_PERM:2:1}" != "5" ]; then
    echo "⚠️  WARNING: Script is writable by others!"
else
    echo "✅ Script permissions are secure"
fi

# Check if running as root
if [ "$(id -u)" = "0" ]; then
    echo "⚠️  WARNING: Running as root!"
    echo "   Be careful with root privileges"
else
    echo "✅ Running as regular user: $(whoami)"
fi

# Check script ownership
SCRIPT_OWNER=$(stat -c "%U" "$0")
CURRENT_USER=$(whoami)
if [ "$SCRIPT_OWNER" != "$CURRENT_USER" ]; then
    echo "⚠️  WARNING: Script owner ($SCRIPT_OWNER) differs from current user ($CURRENT_USER)"
else
    echo "✅ Script owned by current user"
fi

echo ""
echo "Security recommendations:"
echo "1. Use 755 permissions for most scripts"
echo "2. Use 750 or 700 for sensitive scripts"
echo "3. Never use 777 permissions"
echo "4. Avoid running scripts as root unless necessary"
echo "5. Verify script ownership before execution"
EOF

chmod 755 security_demo.sh
./security_demo.sh

# Demonstrate dangerous permissions
echo ""
echo "=== DEMONSTRATING DANGEROUS PERMISSIONS ==="
chmod 777 security_demo.sh
./security_demo.sh

# Fix permissions
chmod 755 security_demo.sh
```

### Step 6: Debugging Script Execution
```bash
# Create script with debugging options
cat << 'EOF' > debug_demo.sh
#!/bin/bash
# Script Debugging Demonstration

# Enable different debug modes based on argument
case "${1:-normal}" in
    "verbose")
        set -v  # Print each command before executing
        ;;
    "trace")
        set -x  # Print each command with variable expansion
        ;;
    "strict")
        set -euo pipefail  # Exit on error, undefined vars, pipe failures
        ;;
esac

echo "=== DEBUGGING DEMONSTRATION ==="
echo "Mode: ${1:-normal}"

# Some variables
NAME="John"
AGE=25
LOCATION="City"

echo "Processing user: $NAME"
echo "Age: $AGE"
echo "Location: $LOCATION"

# Some commands
ls /tmp > /dev/null
pwd
whoami

echo "Script completed successfully"
EOF

chmod +x debug_demo.sh

echo "=== NORMAL EXECUTION ==="
./debug_demo.sh normal

echo ""
echo "=== VERBOSE MODE (set -v) ==="
./debug_demo.sh verbose

echo ""
echo "=== TRACE MODE (set -x) ==="
./debug_demo.sh trace
```

## 🎯 Practice Exercise 3.1: Script Deployment Workshop
```bash
# Create a script deployment and management system
cat << 'EOF' > script_manager.sh
#!/bin/bash
# Script Manager - Deploy and manage scripts
# Purpose: Help manage script permissions and deployment

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$HOME/scripts"
BIN_DIR="$HOME/bin"

# Functions
print_header() {
    echo -e "\n${GREEN}=== $1 ===${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

# Function to check script security
check_script_security() {
    local script="$1"
    local issues=0
    
    print_info "Checking security for: $script"
    
    # Check permissions
    local perm=$(stat -c "%a" "$script" 2>/dev/null)
    if [ "$perm" =
