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
    if [ "$perm" = "777" ]; then
        print_warning "World-writable permissions (777) - SECURITY RISK!"
        ((issues++))
    elif [ "${perm:2:1}" -gt "5" ]; then
        print_warning "Others have write permission - potential risk"
        ((issues++))
    else
        print_success "Permissions are secure ($perm)"
    fi
    
    # Check ownership
    local owner=$(stat -c "%U" "$script" 2>/dev/null)
    if [ "$owner" != "$(whoami)" ]; then
        print_warning "Script owned by different user: $owner"
        ((issues++))
    else
        print_success "Owned by current user"
    fi
    
    # Check for executable bit
    if [ -x "$script" ]; then
        print_success "Script is executable"
    else
        print_warning "Script is not executable"
        ((issues++))
    fi
    
    return $issues
}

# Function to fix script permissions
fix_permissions() {
    local script="$1"
    print_info "Fixing permissions for: $script"
    
    # Set secure permissions
    chmod 755 "$script"
    print_success "Set permissions to 755 (rwxr-xr-x)"
}

# Function to deploy script
deploy_script() {
    local script="$1"
    local name="$2"
    
    if [ ! -f "$script" ]; then
        print_error "Script file not found: $script"
        return 1
    fi
    
    # Create bin directory if it doesn't exist
    mkdir -p "$BIN_DIR"
    
    # Copy script
    cp "$script" "$BIN_DIR/$name"
    chmod 755 "$BIN_DIR/$name"
    
    # Add to PATH if not already there
    if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
        echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
        print_info "Added $BIN_DIR to PATH in .bashrc"
        print_warning "Run 'source ~/.bashrc' or restart shell to use new PATH"
    fi
    
    print_success "Script deployed as: $name"
}

# Main menu
show_menu() {
    clear
    echo -e "${BLUE}╔════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║         SCRIPT MANAGER             ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════╝${NC}"
    echo ""
    echo "1. Check script security"
    echo "2. Fix script permissions"
    echo "3. Deploy script to ~/bin"
    echo "4. List deployed scripts"
    echo "5. Create script directories"
    echo "6. Exit"
    echo ""
}

# Main execution
while true; do
    show_menu
    read -p "Choose an option (1-6): " choice
    
    case $choice in
        1)
            read -p "Enter script path: " script_path
            if [ -f "$script_path" ]; then
                check_script_security "$script_path"
            else
                print_error "File not found: $script_path"
            fi
            read -p "Press Enter to continue..."
            ;;
        2)
            read -p "Enter script path: " script_path
            if [ -f "$script_path" ]; then
                fix_permissions "$script_path"
            else
                print_error "File not found: $script_path"
            fi
            read -p "Press Enter to continue..."
            ;;
        3)
            read -p "Enter script path: " script_path
            read -p "Enter command name: " cmd_name
            deploy_script "$script_path" "$cmd_name"
            read -p "Press Enter to continue..."
            ;;
        4)
            print_header "DEPLOYED SCRIPTS"
            if [ -d "$BIN_DIR" ]; then
                ls -la "$BIN_DIR"
            else
                print_info "No scripts deployed yet"
            fi
            read -p "Press Enter to continue..."
            ;;
        5)
            print_header "CREATING SCRIPT DIRECTORIES"
            mkdir -p "$SCRIPT_DIR" "$BIN_DIR"
            print_success "Created: $SCRIPT_DIR"
            print_success "Created: $BIN_DIR"
            read -p "Press Enter to continue..."
            ;;
        6)
            print_success "Goodbye!"
            exit 0
            ;;
        *)
            print_error "Invalid option. Please try again."
            sleep 2
            ;;
    esac
done
EOF

chmod +x script_manager.sh
echo "Run ./script_manager.sh to manage your scripts!"
```

**🔍 What You Learned:**
- Scripts need execute permission (+x) to run directly
- Three execution methods: direct (./script.sh), interpreter (bash script.sh), source (source script.sh)
- Security matters: avoid 777 permissions, check ownership
- Scripts can be deployed to PATH for system-wide access
- Debugging options: set -v (verbose), set -x (trace), set -e (exit on error)

---

# 4. Variables and User Input

## 🔑 Core Concept
Variables are like labeled boxes where you store information. User input makes scripts interactive!

## 📊 Variable Types and Scope
```
Variable Types in Bash:

Local Variables:
├── NAME="John"              ← Only in current script/shell
├── AGE=25                   ← Numbers don't need quotes
├── LOCATION="New York"      ← Strings with spaces need quotes
└── IS_ADMIN=false           ← Boolean values as strings

Environment Variables:
├── export GLOBAL_VAR="value" ← Available to child processes
├── PATH="/usr/bin:/bin"      ← System PATH
├── HOME="/home/user"         ← User home directory
└── USER="username"           ← Current username

Special Variables:
├── $0    ← Script name
├── $1,$2 ← Command line arguments
├── $#    ← Number of arguments
├── $@    ← All arguments
├── $    ← Process ID
├── $?    ← Exit status of last command
├── $!    ← PID of last background job
└── $_    ← Last argument of previous command

Array Variables:
├── FRUITS=("apple" "banana" "cherry")
├── ${FRUITS[0]}              ← First element
├── ${FRUITS[@]}              ← All elements
├── ${#FRUITS[@]}             ← Array length
└── FRUITS[3]="date"          ← Add element

Variable Operations:
├── ${VAR:-default}           ← Use default if VAR is empty
├── ${VAR:=default}           ← Set VAR to default if empty
├── ${VAR:+alternate}         ← Use alternate if VAR is set
├── ${#VAR}                   ← Length of VAR
├── ${VAR^^}                  ← Convert to uppercase
├── ${VAR,,}                  ← Convert to lowercase
├── ${VAR/old/new}            ← Replace first occurrence
└── ${VAR//old/new}           ← Replace all occurrences
```

## 🛠️ Hands-On Commands

### Step 1: Basic Variable Operations
```bash
# Create script to demonstrate variable basics
cat << 'EOF' > variables_basic.sh
#!/bin/bash
# Basic Variable Operations

echo "=== BASIC VARIABLE OPERATIONS ==="

# Creating variables
NAME="Alice"
AGE=30
CITY="San Francisco"
SALARY=75000.50

echo "Employee Information:"
echo "Name: $NAME"
echo "Age: $AGE"
echo "City: $CITY"
echo "Salary: \${SALARY}"

# Variable without quotes (be careful!)
SIMPLE_VAR=hello
echo "Simple variable: $SIMPLE_VAR"

# Variable with spaces (needs quotes)
FULL_NAME="John Doe"
echo "Full name: $FULL_NAME"

# Using curly braces for clarity
echo "Hello ${NAME}, welcome to ${CITY}!"

# Variable in variable
GREETING="Hello"
MESSAGE="${GREETING}, ${NAME}!"
echo "Message: $MESSAGE"

# Arithmetic with variables
CURRENT_YEAR=2024
BIRTH_YEAR=$((CURRENT_YEAR - AGE))
echo "Born in: $BIRTH_YEAR"
EOF

chmod +x variables_basic.sh
./variables_basic.sh
```

### Step 2: Advanced Variable Manipulation
```bash
# Create script for advanced variable operations
cat << 'EOF' > variables_advanced.sh
#!/bin/bash
# Advanced Variable Operations

echo "=== ADVANCED VARIABLE OPERATIONS ==="

# String manipulation
TEXT="Hello World Linux"
echo "Original text: $TEXT"
echo "Length: ${#TEXT}"
echo "Uppercase: ${TEXT^^}"
echo "Lowercase: ${TEXT,,}"
echo "Substring (0-5): ${TEXT:0:5}"
echo "Substring from position 6: ${TEXT:6}"

# Search and replace
echo ""
echo "=== SEARCH AND REPLACE ==="
SENTENCE="The quick brown fox jumps over the lazy dog"
echo "Original: $SENTENCE"
echo "Replace 'fox' with 'cat': ${SENTENCE/fox/cat}"
echo "Replace all 'o' with '0': ${SENTENCE//o/0}"
echo "Remove 'the ': ${SENTENCE//the /}"

# Default values
echo ""
echo "=== DEFAULT VALUES ==="
UNDEFINED_VAR=""
echo "Empty variable with default: ${UNDEFINED_VAR:-'Default Value'}"
echo "Set variable to default: ${UNDEFINED_VAR:='Set Default'}"
echo "Now UNDEFINED_VAR contains: '$UNDEFINED_VAR'"

# Conditional replacement
SET_VAR="I am set"
echo "Variable set, use alternate: ${SET_VAR:+'Variable has value'}"

# Path manipulation
echo ""
echo "=== PATH MANIPULATION ==="
FILEPATH="/home/user/documents/script.sh"
echo "Full path: $FILEPATH"
echo "Directory: ${FILEPATH%/*}"
echo "Filename: ${FILEPATH##*/}"
echo "Extension: ${FILEPATH##*.}"
echo "Name without extension: ${FILEPATH%.*}"
EOF

chmod +x variables_advanced.sh
./variables_advanced.sh
```

### Step 3: Arrays and Lists
```bash
# Create script for array operations
cat << 'EOF' > arrays_demo.sh
#!/bin/bash
# Array Operations Demo

echo "=== ARRAY OPERATIONS DEMO ==="

# Creating arrays
FRUITS=("apple" "banana" "cherry" "date")
NUMBERS=(1 2 3 4 5)
MIXED=("hello" 42 "world" 3.14)

echo "=== BASIC ARRAY OPERATIONS ==="
echo "First fruit: ${FRUITS[0]}"
echo "Second fruit: ${FRUITS[1]}"
echo "All fruits: ${FRUITS[@]}"
echo "Number of fruits: ${#FRUITS[@]}"

# Adding elements
FRUITS[4]="elderberry"
FRUITS+=("fig" "grape")
echo "After adding elements: ${FRUITS[@]}"
echo "New count: ${#FRUITS[@]}"

# Looping through arrays
echo ""
echo "=== LOOPING THROUGH ARRAYS ==="
echo "Fruits list:"
for fruit in "${FRUITS[@]}"; do
    echo "  - $fruit"
done

echo ""
echo "Fruits with indices:"
for i in "${!FRUITS[@]}"; do
    echo "  [$i]: ${FRUITS[$i]}"
done

# Array slicing
echo ""
echo "=== ARRAY SLICING ==="
echo "First 3 fruits: ${FRUITS[@]:0:3}"
echo "Fruits from index 2: ${FRUITS[@]:2}"
echo "Last 2 fruits: ${FRUITS[@]: -2}"

# Associative arrays (Bash 4+)
if [ "${BASH_VERSION%%.*}" -ge 4 ]; then
    echo ""
    echo "=== ASSOCIATIVE ARRAYS ==="
    declare -A PERSON
    PERSON[name]="John"
    PERSON[age]=25
    PERSON[city]="Boston"
    
    echo "Person details:"
    for key in "${!PERSON[@]}"; do
        echo "  $key: ${PERSON[$key]}"
    done
fi
EOF

chmod +x arrays_demo.sh
./arrays_demo.sh
```

### Step 4: User Input and Interaction
```bash
# Create interactive input script
cat << 'EOF' > user_input_demo.sh
#!/bin/bash
# User Input Demonstration

# Colors for better interaction
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== USER INPUT DEMONSTRATION ===${NC}"

# Basic input
echo -e "\n${BLUE}1. BASIC INPUT${NC}"
read -p "Enter your name: " USER_NAME
echo "Hello, $USER_NAME!"

# Input with prompt on same line
echo -e "\n${BLUE}2. INLINE PROMPT${NC}"
read -p "Enter your age: " USER_AGE
echo "You are $USER_AGE years old."

# Silent input (like password)
echo -e "\n${BLUE}3. SILENT INPUT${NC}"
read -s -p "Enter a secret word: " SECRET
echo ""
echo "Your secret has ${#SECRET} characters."

# Input with timeout
echo -e "\n${BLUE}4. INPUT WITH TIMEOUT${NC}"
if read -t 10 -p "Quick! Enter something (10 seconds): " QUICK_INPUT; then
    echo ""
    echo "You entered: $QUICK_INPUT"
else
    echo ""
    echo "Too slow! Time's up!"
fi

# Input validation
echo -e "\n${BLUE}5. INPUT VALIDATION${NC}"
while true; do
    read -p "Enter a number between 1 and 10: " NUMBER
    if [[ "$NUMBER" =~ ^[0-9]+$ ]] && [ "$NUMBER" -ge 1 ] && [ "$NUMBER" -le 10 ]; then
        echo "Great! You entered: $NUMBER"
        break
    else
        echo -e "${RED}Invalid input. Please enter a number between 1 and 10.${NC}"
    fi
done

# Multiple inputs
echo -e "\n${BLUE}6. MULTIPLE INPUTS${NC}"
echo "Enter three words separated by spaces:"
read WORD1 WORD2 WORD3 REST
echo "First word: $WORD1"
echo "Second word: $WORD2"
echo "Third word: $WORD3"
echo "Remaining words: $REST"

# Reading into array
echo -e "\n${BLUE}7. READING INTO ARRAY${NC}"
echo "Enter your favorite colors (space-separated):"
read -a COLORS
echo "You entered ${#COLORS[@]} colors:"
for i in "${!COLORS[@]}"; do
    echo "  Color $((i+1)): ${COLORS[$i]}"
done

# Default values
echo -e "\n${BLUE}8. DEFAULT VALUES${NC}"
read -p "Enter your country [USA]: " COUNTRY
COUNTRY=${COUNTRY:-USA}
echo "Country: $COUNTRY"

# Confirmation
echo -e "\n${BLUE}9. CONFIRMATION${NC}"
read -p "Do you want to continue? (y/N): " CONFIRM
if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Continuing...${NC}"
else
    echo -e "${YELLOW}Stopping...${NC}"
fi

echo -e "\n${GREEN}Input demonstration complete!${NC}"
EOF

chmod +x user_input_demo.sh
echo "Run ./user_input_demo.sh for interactive experience"
```

### Step 5: Environment Variables and Scope
```bash
# Create script to demonstrate variable scope
cat << 'EOF' > variable_scope.sh
#!/bin/bash
# Variable Scope Demonstration

echo "=== VARIABLE SCOPE DEMONSTRATION ==="

# Local variable
LOCAL_VAR="I am local"
echo "Local variable: $LOCAL_VAR"

# Export to make it available to child processes
export EXPORTED_VAR="I am exported"
echo "Exported variable: $EXPORTED_VAR"

# Function to test scope
test_scope() {
    echo ""
    echo "=== INSIDE FUNCTION ==="
    
    # Local to function
    local FUNCTION_VAR="I am function-local"
    echo "Function variable: $FUNCTION_VAR"
    
    # Modify local variable
    LOCAL_VAR="Modified in function"
    echo "Modified local variable: $LOCAL_VAR"
    
    # Access exported variable
    echo "Exported variable in function: $EXPORTED_VAR"
    
    # Create new local variable with same name as global
    local EXPORTED_VAR="I am function-local with same name"
    echo "Local EXPORTED_VAR in function: $EXPORTED_VAR"
}

# Call function
test_scope

echo ""
echo "=== AFTER FUNCTION ==="
echo "Local variable after function: $LOCAL_VAR"
echo "Exported variable after function: $EXPORTED_VAR"

# Test with subshell
echo ""
echo "=== SUBSHELL TEST ==="
(
    echo "In subshell - Local variable: $LOCAL_VAR"
    echo "In subshell - Exported variable: $EXPORTED_VAR"
    
    # Modify variables in subshell
    LOCAL_VAR="Modified in subshell"
    EXPORTED_VAR="Modified in subshell"
    echo "Modified in subshell - Local: $LOCAL_VAR"
    echo "Modified in subshell - Exported: $EXPORTED_VAR"
)

echo "After subshell - Local variable: $LOCAL_VAR"
echo "After subshell - Exported variable: $EXPORTED_VAR"

# Environment variables
echo ""
echo "=== IMPORTANT ENVIRONMENT VARIABLES ==="
echo "HOME: $HOME"
echo "USER: $USER"
echo "SHELL: $SHELL"
echo "PATH: ${PATH:0:50}..." # Show first 50 chars of PATH
echo "PWD: $PWD"
echo "HOSTNAME: $HOSTNAME"
EOF

chmod +x variable_scope.sh
./variable_scope.sh
```

### Step 6: Special Variables and Parameters
```bash
# Create script to demonstrate special variables
cat << 'EOF' > special_variables.sh
#!/bin/bash
# Special Variables Demonstration

echo "=== SPECIAL VARIABLES DEMONSTRATION ==="

echo "Script Information:"
echo "Script name: $0"
echo "Script directory: $(dirname $0)"
echo "Script basename: $(basename $0)"
echo "Process ID: $"
echo "Parent Process ID: $PPID"

echo ""
echo "Command Line Arguments:"
echo "Number of arguments: $#"
echo "All arguments: $@"
echo "All arguments (quoted): \$*"

# Show individual arguments
if [ $# -gt 0 ]; then
    echo "Individual arguments:"
    for i in {1..9}; do
        arg_var="\$i"
        arg_value=$(eval echo $arg_var)
        if [ -n "$arg_value" ]; then
            echo "  Argument $i: $arg_value"
        fi
    done
else
    echo "No arguments provided"
    echo "Try running: $0 hello world 123"
fi

echo ""
echo "Exit Status Examples:"

# Command that succeeds
ls /tmp > /dev/null 2>&1
echo "ls /tmp exit status: $?"

# Command that fails
ls /nonexistent 2>/dev/null
echo "ls /nonexistent exit status: $?"

# Background job
sleep 2 &
BACKGROUND_PID=$!
echo "Background job PID: $BACKGROUND_PID"
wait $BACKGROUND_PID
echo "Background job exit status: $?"

echo ""
echo "Other Special Variables:"
echo "Number of positional parameters: $#"
echo "Last argument of previous command: $_"
echo "Current shell options: $-"

# Demonstrate shift
if [ $# -gt 0 ]; then
    echo ""
    echo "Demonstrating 'shift':"
    echo "Before shift - \$1: $1, \$2: $2, \$#: $#"
    shift
    echo "After shift  - \$1: $1, \$2: $2, \$#: $#"
fi
EOF

chmod +x special_variables.sh
./special_variables.sh arg1 arg2 arg3
```

## 🎯 Practice Exercise 4.1: Personal Information Manager
```bash
# Create a comprehensive personal information manager
cat << 'EOF' > personal_info_manager.sh
#!/bin/bash
# Personal Information Manager
# Purpose: Collect, store, and display personal information

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Data file
DATA_FILE="$HOME/.personal_info.dat"

# Functions
print_header() {
    echo -e "\n${CYAN}╔════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║      PERSONAL INFORMATION MANAGER      ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
}

print_menu() {
    echo -e "\n${BLUE}Choose an option:${NC}"
    echo "1. Enter personal information"
    echo "2. Display information"
    echo "3. Update information"
    echo "4. Clear all data"
    echo "5. Export to file"
    echo "6. Exit"
}

validate_email() {
    local email="$1"
    if [[ "$email" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        return 0
    else
        return 1
    fi
}

validate_phone() {
    local phone="$1"
    # Remove all non-digits
    local clean_phone=$(echo "$phone" | sed 's/[^0-9]//g')
    if [ ${#clean_phone} -ge 10 ]; then
        return 0
    else
        return 1
    fi
}

collect_information() {
    echo -e "\n${GREEN}=== ENTER PERSONAL INFORMATION ===${NC}"
    
    # Name
    while true; do
        read -p "Full Name: " FULL_NAME
        if [ -n "$FULL_NAME" ]; then
            break
        else
            echo -e "${RED}Name cannot be empty!${NC}"
        fi
    done
    
    # Age with validation
    while true; do
        read -p "Age: " AGE
        if [[ "$AGE" =~ ^[0-9]+$ ]] && [ "$AGE" -gt 0 ] && [ "$AGE" -lt 150 ]; then
            break
        else
            echo -e "${RED}Please enter a valid age (1-149)${NC}"
        fi
    done
    
    # Email with validation
    while true; do
        read -p "Email: " EMAIL
        if validate_email "$EMAIL"; then
            break
        else
            echo -e "${RED}Please enter a valid email address${NC}"
        fi
    done
    
    # Phone with validation
    while true; do
        read -p "Phone: " PHONE
        if validate_phone "$PHONE"; then
            break
        else
            echo -e "${RED}Please enter a valid phone number (at least 10 digits)${NC}"
        fi
    done
    
    # Address
    read -p "Address: " ADDRESS
    
    # City
    read -p "City: " CITY
    
    # Country with default
    read -p "Country [USA]: " COUNTRY
    COUNTRY=${COUNTRY:-USA}
    
    # Occupation
    read -p "Occupation: " OCCUPATION
    
    # Hobbies (array)
    echo "Enter hobbies (space-separated):"
    read -a HOBBIES
    
    # Emergency contact
    read -p "Emergency contact name: " EMERGENCY_NAME
    read -p "Emergency contact phone: " EMERGENCY_PHONE
    
    # Save to file
    save_information
    echo -e "\n${GREEN}✅ Information saved successfully!${NC}"
}

save_information() {
    cat > "$DATA_FILE" << DATA
FULL_NAME="$FULL_NAME"
AGE="$AGE"
EMAIL="$EMAIL"
PHONE="$PHONE"
ADDRESS="$ADDRESS"
CITY="$CITY"
COUNTRY="$COUNTRY"
OCCUPATION="$OCCUPATION"
HOBBIES=(${HOBBIES[@]})
EMERGENCY_NAME="$EMERGENCY_NAME"
EMERGENCY_PHONE="$EMERGENCY_PHONE"
CREATED_DATE="$(date)"
DATA
}

load_information() {
    if [ -f "$DATA_FILE" ]; then
        source "$DATA_FILE"
        return 0
    else
        return 1
    fi
}

display_information() {
    if load_information; then
        echo -e "\n${GREEN}=== PERSONAL INFORMATION ===${NC}"
        echo -e "${YELLOW}Name:${NC} $FULL_NAME"
        echo -e "${YELLOW}Age:${NC} $AGE"
        echo -e "${YELLOW}Email:${NC} $EMAIL"
        echo -e "${YELLOW}Phone:${NC} $PHONE"
        echo -e "${YELLOW}Address:${NC} $ADDRESS"
        echo -e "${YELLOW}City:${NC} $CITY"
        echo -e "${YELLOW}Country:${NC} $COUNTRY"
        echo -e "${YELLOW}Occupation:${NC} $OCCUPATION"
        echo -e "${YELLOW}Hobbies:${NC} ${HOBBIES[*]}"
        echo -e "${YELLOW}Emergency Contact:${NC} $EMERGENCY_NAME ($EMERGENCY_PHONE)"
        echo -e "${YELLOW}Created:${NC} $CREATED_DATE"
    else
        echo -e "\n${RED}No information found. Please enter information first.${NC}"
    fi
}

update_information() {
    if load_information; then
        echo -e "\n${GREEN}=== UPDATE INFORMATION ===${NC}"
        echo "Current information loaded. Enter new values (press Enter to keep current):"
        
        read -p "Full Name [$FULL_NAME]: " NEW_NAME
        [ -n "$NEW_NAME" ] && FULL_NAME="$NEW_NAME"
        
        read -p "Age [$AGE]: " NEW_AGE
        if [ -n "$NEW_AGE" ] && [[ "$NEW_AGE" =~ ^[0-9]+$ ]]; then
            AGE="$NEW_AGE"
        fi
        
        read -p "Email [$EMAIL]: " NEW_EMAIL
        if [ -n "$NEW_EMAIL" ] && validate_email "$NEW_EMAIL"; then
            EMAIL="$NEW_EMAIL"
        fi
        
        read -p "Phone [$PHONE]: " NEW_PHONE
        if [ -n "$NEW_PHONE" ] && validate_phone "$NEW_PHONE"; then
            PHONE="$NEW_PHONE"
        fi
        
        save_information
        echo -e "\n${GREEN}✅ Information updated successfully!${NC}"
    else
        echo -e "\n${RED}No information found. Please enter information first.${NC}"
    fi
}

export_information() {
    if load_information; then
        local export_file="personal_info_$(date +%Y%m%d_%H%M%S).txt"
        cat > "$export_file" << EXPORT
Personal Information Export
==========================
Generated: $(date)

Name: $FULL_NAME
Age: $AGE
Email: $EMAIL
Phone: $PHONE
Address: $ADDRESS
City: $CITY
Country: $COUNTRY
Occupation: $OCCUPATION
Hobbies: ${HOBBIES[*]}
Emergency Contact: $EMERGENCY_NAME ($EMERGENCY_PHONE)
Created: $CREATED_DATE
EXPORT
        echo -e "\n${GREEN}✅ Information exported to: $export_file${NC}"
    else
        echo -e "\n${RED}No information found to export.${NC}"
    fi
}

clear_data() {
    read -p "Are you sure you want to clear all data? (y/N): " CONFIRM
    if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
        rm -f "$DATA_FILE"
        echo -e "\n${GREEN}✅ All data cleared.${NC}"
    else
        echo -e "\n${YELLOW}Operation cancelled.${NC}"
    fi
}

# Main program loop
while true; do
    print_header
    print_menu
    
    read -p "Enter your choice (1-6): " CHOICE
    
    case $CHOICE in
        1) collect_information ;;
        2) display_information ;;
        3) update_information ;;
        4) clear_data ;;
        5) export_information ;;
        6) 
            echo -e "\n${GREEN}Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "\n${RED}Invalid option. Please try again.${NC}"
            sleep 2
            ;;
    esac
    
    echo -e "\nPress Enter to continue..."
    read
done
EOF

chmod +x personal_info_manager.sh
echo "Run ./personal_info_manager.sh to manage personal information!"
```

**🔍 What You Learned:**
- Variables store different types of data (strings, numbers, arrays)
- Variable operations: substitution, length, case conversion, search/replace
- Arrays store multiple values with indexed access
- User input with validation and error handling
- Variable scope: local, global, exported, function-local
- Special variables: $0, $1-$n, $#, $@, $, $?, etc.
- Default values and conditional assignment

---

# 5. Conditional Statements

## 🔑 Core Concept
Conditionals are like decision trees - if this, then that, else something else!

## 📊 Conditional Statement Structure
```
Conditional Statement Types:

Basic If Statement:
if [ condition ]; then
    # commands
fi

If-Else Statement:
if [ condition ]; then
    # commands if true
else
    # commands if false
fi

If-Elif-Else Statement:
if [ condition1 ]; then
    # commands if condition1 true
elif [ condition2 ]; then
    # commands if condition2 true
else
    # commands if all false
fi

Test Operators:

Numeric Comparisons:
├── -eq  (equal)
├── -ne  (not equal)
├── -lt  (less than)
├── -le  (less than or equal)
├── -gt  (greater than)
└── -ge  (greater than or equal)

String Comparisons:
├── =    (equal)
├── !=   (not equal)
├── -z   (string is empty)
├── -n   (string is not empty)
