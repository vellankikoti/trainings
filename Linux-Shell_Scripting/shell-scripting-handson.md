# **Linux Shell Scripting - Complete Hands-On Guide**
## **🚀 Master Shell Scripting Like Magic!**
### **Magic Mantra: "Scripts are like recipes - write once, use forever!"**

---

# **PART 1: FOUNDATIONS & BASIC SCRIPTS**

## **📋 What You'll Learn in Part 1**
- Introduction to Shells
- Writing Your First Bash Script
- Script Permissions and Execution
- Variables and User Input
- Conditional Statements

---

## **1. Introduction to Shells**

### **What is a Shell?**
A shell is a command-line interpreter that provides a user interface for the Unix/Linux operating system. Think of it as a translator between you and the operating system.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      USER       │───▶│      SHELL      │───▶│   OPERATING     │
│   (Commands)    │    │  (Interpreter)  │    │     SYSTEM      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Types of Shells**
- **bash** (Bourne Again Shell) - Most popular
- **sh** (Bourne Shell) - Original shell
- **zsh** (Z Shell) - Feature-rich
- **csh** (C Shell) - C-like syntax
- **ksh** (Korn Shell) - Enhanced Bourne shell

### **Check Your Current Shell**
```bash
echo $SHELL
# Output: /bin/bash

# List available shells
cat /etc/shells
```

### **Shell Features**
- **Command execution**
- **Variables**
- **Control structures** (if, for, while)
- **Functions**
- **Input/Output redirection**
- **Job control**

---

## **2. Writing Your First Bash Script**

### **Script Structure**
```bash
#!/bin/bash
# ^^ This is called "shebang" - tells system which interpreter to use

# Comments start with #
# Good practice: Always comment your scripts

echo "Hello, World!"
```

### **Creating Your First Script**
```bash
# Step 1: Create the script file
nano hello.sh

# Step 2: Add content
#!/bin/bash
echo "🎉 Welcome to Shell Scripting!"
echo "Today's date is: $(date)"
echo "Current user: $USER"
echo "Current directory: $(pwd)"
```

### **Shebang Variations**
```bash
#!/bin/bash           # Standard bash
#!/usr/bin/env bash   # Portable bash (recommended)
#!/bin/sh             # POSIX shell
#!/usr/bin/env python3 # For Python scripts
```

### **Best Practices for Script Headers**
```bash
#!/usr/bin/env bash

#############################################################################
# Script Name: hello.sh
# Description: My first shell script
# Author: Your Name
# Date: $(date +%Y-%m-%d)
# Version: 1.0
#############################################################################

# Exit on any error
set -e

# Exit on undefined variables
set -u

echo "Script starting..."
```

---

## **3. Script Permissions and Execution**

### **Understanding File Permissions**
```
rwx rwx rwx
│   │   │
│   │   └── Others (everyone else)
│   └────── Group
└────────── Owner (user)

r = read (4)
w = write (2)  
x = execute (1)
```

### **Making Scripts Executable**
```bash
# Method 1: Using chmod with numbers
chmod 755 hello.sh    # rwxr-xr-x (owner: all, group/others: read+execute)
chmod 744 hello.sh    # rwxr--r-- (owner: all, others: read only)

# Method 2: Using chmod with letters
chmod +x hello.sh     # Add execute permission for everyone
chmod u+x hello.sh    # Add execute for user only
chmod go-w hello.sh   # Remove write for group and others

# Check permissions
ls -l hello.sh
# Output: -rwxr-xr-x 1 user group 156 Nov 15 10:30 hello.sh
```

### **Different Ways to Execute Scripts**
```bash
# Method 1: Direct execution (requires execute permission)
./hello.sh

# Method 2: Using bash interpreter
bash hello.sh

# Method 3: Using source (runs in current shell)
source hello.sh
# or
. hello.sh

# Method 4: Full path execution
/home/user/scripts/hello.sh
```

### **Script Execution Flow Diagram**
```
┌─────────────────────┐
│   User types:       │
│   ./script.sh       │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐    NO    ┌─────────────────────┐
│  Is file executable?├─────────▶│   Permission        │
└─────────┬───────────┘          │   Denied Error      │
          │ YES                  └─────────────────────┘
          ▼
┌─────────────────────┐
│  Check shebang      │
│  #!/bin/bash        │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Execute script     │
│  with bash          │
└─────────────────────┘
```

---

## **4. Variables and User Input**

### **Variable Declaration and Usage**
```bash
#!/usr/bin/env bash

# Variable assignment (NO SPACES around =)
name="John Doe"
age=30
is_admin=true

# Using variables
echo "Name: $name"
echo "Age: ${age}"           # Braces for clarity
echo "Admin: $is_admin"

# Command substitution
current_date=$(date)
file_count=$(ls | wc -l)

echo "Today is: $current_date"
echo "Files in directory: $file_count"
```

### **Types of Variables**
```bash
#!/usr/bin/env bash

# Local variables (script scope)
local_var="I'm local"

# Environment variables (system-wide)
export GLOBAL_VAR="I'm global"
echo $HOME    # User's home directory
echo $PATH    # System PATH
echo $USER    # Current username
echo $PWD     # Current directory

# Special variables
echo "Script name: $0"
echo "First argument: $1"
echo "All arguments: $@"
echo "Number of arguments: $#"
echo "Exit status of last command: $?"
echo "Process ID: $$"
```

### **Variable Best Practices**
```bash
#!/usr/bin/env bash

# Use uppercase for constants
readonly PI=3.14159
readonly CONFIG_FILE="/etc/myapp.conf"

# Use lowercase for local variables
user_name="admin"
temp_file="/tmp/processing.tmp"

# Use descriptive names
customer_email="user@example.com"    # Good
ce="user@example.com"               # Bad

# Quote variables to handle spaces
file_name="my document.txt"
echo "Processing: '$file_name'"     # Good
echo "Processing: $file_name"       # May break with spaces
```

### **Reading User Input**
```bash
#!/usr/bin/env bash

# Basic input
echo "What's your name?"
read name
echo "Hello, $name!"

# Input with prompt
read -p "Enter your age: " age
echo "You are $age years old"

# Silent input (for passwords)
read -s -p "Enter password: " password
echo  # New line after silent input
echo "Password received"

# Input with timeout
if read -t 10 -p "Enter something (10 sec timeout): " input; then
    echo "You entered: $input"
else
    echo "Timeout! Using default value"
    input="default"
fi

# Multiple inputs
echo "Enter your details:"
read -p "First Name: " first_name
read -p "Last Name: " last_name
read -p "Email: " email

echo "Summary:"
echo "Name: $first_name $last_name"
echo "Email: $email"
```

### **Interactive Script Example**
```bash
#!/usr/bin/env bash

echo "🔧 System Information Collector"
echo "================================"

# Collect user information
read -p "Enter your department: " department
read -p "Enter server purpose: " purpose

# Collect system info
hostname=$(hostname)
os_version=$(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)
memory=$(free -h | grep Mem | awk '{print $2}')
disk_usage=$(df -h / | tail -1 | awk '{print $5}')

# Display report
echo ""
echo "📊 SYSTEM REPORT"
echo "================"
echo "Department: $department"
echo "Purpose: $purpose"
echo "Hostname: $hostname"
echo "OS: $os_version"
echo "Memory: $memory"
echo "Disk Usage: $disk_usage"
echo "Report Date: $(date)"
```

---

## **5. Conditional Statements**

### **Basic if Statement**
```bash
#!/usr/bin/env bash

age=25

if [ $age -ge 18 ]; then
    echo "You are an adult"
fi
```

### **if-else Statement**
```bash
#!/usr/bin/env bash

read -p "Enter a number: " number

if [ $number -gt 0 ]; then
    echo "Positive number"
else
    echo "Negative number or zero"
fi
```

### **if-elif-else Statement**
```bash
#!/usr/bin/env bash

read -p "Enter your score (0-100): " score

if [ $score -ge 90 ]; then
    echo "Grade: A+ (Excellent!)"
elif [ $score -ge 80 ]; then
    echo "Grade: A (Very Good)"
elif [ $score -ge 70 ]; then
    echo "Grade: B (Good)"
elif [ $score -ge 60 ]; then
    echo "Grade: C (Average)"
else
    echo "Grade: F (Needs Improvement)"
fi
```

### **Comparison Operators**

#### **Numeric Comparisons**
```bash
# Integer comparisons
[ $a -eq $b ]    # Equal
[ $a -ne $b ]    # Not equal
[ $a -gt $b ]    # Greater than
[ $a -ge $b ]    # Greater than or equal
[ $a -lt $b ]    # Less than
[ $a -le $b ]    # Less than or equal

# Example
num1=10
num2=20

if [ $num1 -lt $num2 ]; then
    echo "$num1 is less than $num2"
fi
```

#### **String Comparisons**
```bash
# String comparisons
[ "$str1" = "$str2" ]     # Equal (single =)
[ "$str1" != "$str2" ]    # Not equal
[ "$str1" \< "$str2" ]    # Less than (lexicographic)
[ "$str1" \> "$str2" ]    # Greater than (lexicographic)
[ -z "$str" ]             # String is empty
[ -n "$str" ]             # String is not empty

# Example
name="admin"

if [ "$name" = "admin" ]; then
    echo "Welcome, administrator!"
elif [ -z "$name" ]; then
    echo "No name provided"
else
    echo "Welcome, $name"
fi
```

#### **File Tests**
```bash
# File existence and type tests
[ -f "$file" ]    # File exists and is regular file
[ -d "$dir" ]     # Directory exists
[ -e "$path" ]    # Path exists (file or directory)
[ -r "$file" ]    # File is readable
[ -w "$file" ]    # File is writable
[ -x "$file" ]    # File is executable
[ -s "$file" ]    # File exists and is not empty

# Example
config_file="/etc/myapp.conf"

if [ -f "$config_file" ]; then
    echo "Config file found"
    if [ -r "$config_file" ]; then
        echo "Config file is readable"
    else
        echo "Cannot read config file"
    fi
else
    echo "Config file not found"
fi
```

### **Advanced Conditional Examples**

#### **Multiple Conditions**
```bash
#!/usr/bin/env bash

read -p "Enter username: " username
read -s -p "Enter password: " password
echo

# AND condition
if [ "$username" = "admin" ] && [ "$password" = "secret123" ]; then
    echo "✅ Login successful"
else
    echo "❌ Invalid credentials"
fi

# OR condition
if [ "$username" = "admin" ] || [ "$username" = "root" ]; then
    echo "Administrative user detected"
fi
```

#### **System Check Script**
```bash
#!/usr/bin/env bash

echo "🔍 System Health Check"
echo "====================="

# Check disk space
disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')

if [ $disk_usage -gt 90 ]; then
    echo "🔴 CRITICAL: Disk usage is ${disk_usage}%"
elif [ $disk_usage -gt 80 ]; then
    echo "🟡 WARNING: Disk usage is ${disk_usage}%"
else
    echo "🟢 OK: Disk usage is ${disk_usage}%"
fi

# Check if important services are running
if systemctl is-active --quiet ssh; then
    echo "🟢 SSH service is running"
else
    echo "🔴 SSH service is not running"
fi

# Check memory usage
memory_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')

if [ $memory_usage -gt 85 ]; then
    echo "🔴 HIGH: Memory usage is ${memory_usage}%"
else
    echo "🟢 OK: Memory usage is ${memory_usage}%"
fi
```

### **Modern Test Syntax**
```bash
#!/usr/bin/env bash

# Traditional test syntax
if [ $age -ge 18 ]; then
    echo "Adult"
fi

# Modern double bracket syntax (bash specific)
if [[ $age -ge 18 ]]; then
    echo "Adult"
fi

# Double brackets support pattern matching
name="john_admin"
if [[ $name == *"admin"* ]]; then
    echo "Administrator detected"
fi

# Regular expressions with double brackets
email="user@example.com"
if [[ $email =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    echo "Valid email format"
else
    echo "Invalid email format"
fi
```

---

## **🎯 Part 1 Summary**

You've learned the foundations of shell scripting:

1. **Shells** - Command interpreters that execute your scripts
2. **Script Structure** - Shebang, comments, and basic organization
3. **Permissions** - Making scripts executable and understanding file permissions
4. **Variables** - Storing and using data in your scripts
5. **User Input** - Interactive scripts that respond to user input
6. **Conditionals** - Making decisions in your scripts

### **Key Takeaways**
- Always use `#!/usr/bin/env bash` for portability
- Quote your variables: `"$variable"`
- Use descriptive variable names
- Add execute permissions with `chmod +x script.sh`
- Test conditions with `[ ]` or `[[ ]]`

### **Next in Part 2**
- Loops (for, while, until)
- Case statements
- Functions
- Working with arguments

---

## **🧪 Practice Exercises**

Try creating these scripts to reinforce your learning:

1. **User Profile Script** - Collect user info and display a formatted profile
2. **File Backup Checker** - Check if backup files exist and are recent
3. **Password Strength Validator** - Check password length and complexity
4. **System Resource Monitor** - Display CPU, memory, and disk usage with color coding

**Remember**: Scripts are like recipes - write once, use forever! 🚀

---

# **PART 2: LOOPS, FUNCTIONS & ADVANCED CONTROL**

## **📋 What You'll Learn in Part 2**
- Loops (for, while, until)
- Case Statements
- Functions in Shell Scripts
- Working with Arguments and Return Values
- Reading Files in Scripts

---

## **6. Loops (for, while, until)**

### **For Loops**

#### **Basic For Loop**
```bash
#!/usr/bin/env bash

# Simple iteration
for i in 1 2 3 4 5; do
    echo "Number: $i"
done

# Using range
for i in {1..10}; do
    echo "Count: $i"
done

# With step increment
for i in {1..20..2}; do  # Start..End..Step
    echo "Odd number: $i"
done
```

#### **For Loop with Arrays**
```bash
#!/usr/bin/env bash

# Array of fruits
fruits=("apple" "banana" "cherry" "date" "elderberry")

echo "🍎 Fruit Inventory:"
for fruit in "${fruits[@]}"; do
    echo "- $fruit"
done

# Array of servers
servers=("web01" "web02" "db01" "cache01")

echo "🔍 Checking servers:"
for server in "${servers[@]}"; do
    echo "Pinging $server..."
    # ping -c 1 "$server" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ $server is up"
    else
        echo "❌ $server is down"
    fi
done
```

#### **For Loop with Files and Directories**
```bash
#!/usr/bin/env bash

# Process all .txt files
echo "📄 Processing text files:"
for file in *.txt; do
    if [ -f "$file" ]; then
        echo "Processing: $file"
        echo "Size: $(wc -l < "$file") lines"
    fi
done

# Process directories
echo "📁 Directory sizes:"
for dir in */; do
    if [ -d "$dir" ]; then
        size=$(du -sh "$dir" | cut -f1)
        echo "$dir: $size"
    fi
done

# Recursive file processing
echo "🔍 Finding large files:"
for file in $(find . -name "*.log" -size +10M); do
    echo "Large log file: $file"
    size=$(ls -lh "$file" | awk '{print $5}')
    echo "Size: $size"
done
```

#### **C-Style For Loop**
```bash
#!/usr/bin/env bash

# Traditional C-style loop
for ((i=1; i<=10; i++)); do
    echo "Iteration $i"
done

# Countdown timer
echo "⏰ Countdown:"
for ((i=10; i>=1; i--)); do
    echo "$i..."
    sleep 1
done
echo "🚀 Blast off!"

# Processing with index
files=(file1.txt file2.txt file3.txt)
for ((i=0; i<${#files[@]}; i++)); do
    echo "File $((i+1)): ${files[i]}"
done
```

### **While Loops**

#### **Basic While Loop**
```bash
#!/usr/bin/env bash

# Simple counter
counter=1
while [ $counter -le 5 ]; do
    echo "Counter: $counter"
    ((counter++))  # Increment counter
done

# Reading user input until valid
while true; do
    read -p "Enter 'yes' or 'no': " answer
    if [ "$answer" = "yes" ] || [ "$answer" = "no" ]; then
        echo "You entered: $answer"
        break
    else
        echo "Invalid input. Please try again."
    fi
done
```

#### **While Loop Reading Files**
```bash
#!/usr/bin/env bash

# Reading file line by line
echo "📖 Reading configuration file:"
while IFS= read -r line; do
    # Skip empty lines and comments
    if [[ -n "$line" && ! "$line" =~ ^# ]]; then
        echo "Config: $line"
    fi
done < "/etc/hosts"

# Processing CSV file
echo "📊 Processing CSV data:"
while IFS=',' read -r name age department; do
    echo "Employee: $name, Age: $age, Dept: $department"
done < employees.csv
```

#### **While Loop with Commands**
```bash
#!/usr/bin/env bash

# Monitor system until condition is met
echo "🔍 Monitoring system load..."
while [ $(uptime | awk '{print $12}' | cut -d',' -f1 | cut -d':' -f2) > 2.0 ]; do
    echo "High load detected. Waiting..."
    sleep 30
done
echo "✅ System load is normal"

# Wait for service to start
service_name="nginx"
echo "⏳ Waiting for $service_name to start..."
while ! systemctl is-active --quiet "$service_name"; do
    echo "Still waiting for $service_name..."
    sleep 5
done
echo "✅ $service_name is running"
```

### **Until Loops**

#### **Basic Until Loop**
```bash
#!/usr/bin/env bash

# Until loop (opposite of while)
counter=1
until [ $counter -gt 5 ]; do
    echo "Counter: $counter"
    ((counter++))
done

# Wait until file exists
target_file="/tmp/ready.flag"
echo "⏳ Waiting for file $target_file..."
until [ -f "$target_file" ]; do
    echo "File not found. Waiting..."
    sleep 2
done
echo "✅ File found!"
```

#### **Until Loop for System Monitoring**
```bash
#!/usr/bin/env bash

# Wait until disk space is available
echo "💾 Monitoring disk space..."
until [ $(df / | tail -1 | awk '{print $5}' | sed 's/%//') -lt 80 ]; do
    echo "Disk usage still high. Cleaning up..."
    # Clean temporary files
    find /tmp -type f -mtime +7 -delete 2>/dev/null
    sleep 300  # Wait 5 minutes
done
echo "✅ Disk space is sufficient"
```

### **Loop Control Statements**

#### **Break and Continue**
```bash
#!/usr/bin/env bash

# Break example
echo "🔍 Finding first .conf file:"
for file in /etc/*; do
    if [[ "$file" == *.conf ]]; then
        echo "Found config file: $file"
        break  # Exit loop
    fi
done

# Continue example
echo "📄 Processing even numbers only:"
for i in {1..10}; do
    if [ $((i % 2)) -ne 0 ]; then
        continue  # Skip odd numbers
    fi
    echo "Processing even number: $i"
done

# Nested loops with break
echo "🎯 Finding target in matrix:"
target=5
found=false

for row in {1..3}; do
    for col in {1..3}; do
        value=$((row * col))
        echo "Checking position [$row,$col] = $value"
        
        if [ $value -eq $target ]; then
            echo "🎉 Found target $target at [$row,$col]"
            found=true
            break 2  # Break out of both loops
        fi
    done
    
    if [ "$found" = true ]; then
        break
    fi
done
```

### **Practical Loop Examples**

#### **System Backup Script**
```bash
#!/usr/bin/env bash

# Backup important directories
backup_dirs=("/etc" "/home" "/var/log")
backup_destination="/backup/$(date +%Y%m%d)"

echo "🔄 Starting backup process..."
mkdir -p "$backup_destination"

for dir in "${backup_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "📦 Backing up $dir..."
        tar -czf "$backup_destination/$(basename $dir)-backup.tar.gz" "$dir" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo "✅ Successfully backed up $dir"
        else
            echo "❌ Failed to backup $dir"
        fi
    else
        echo "⚠️ Directory $dir not found"
    fi
done

echo "🎉 Backup completed!"
```

#### **Log Rotation Script**
```bash
#!/usr/bin/env bash

# Rotate log files older than 7 days
log_directory="/var/log/myapp"
retention_days=7

echo "🔄 Starting log rotation..."

for log_file in "$log_directory"/*.log; do
    if [ -f "$log_file" ]; then
        # Check file age
        file_age=$(find "$log_file" -mtime +$retention_days)
        
        if [ -n "$file_age" ]; then
            echo "📦 Compressing old log: $(basename "$log_file")"
            gzip "$log_file"
            
            # Move to archive directory
            mkdir -p "$log_directory/archive"
            mv "${log_file}.gz" "$log_directory/archive/"
        fi
    fi
done

echo "✅ Log rotation completed"
```

---

## **7. Case Statements**

### **Basic Case Statement**
```bash
#!/usr/bin/env bash

echo "🎮 Simple Calculator"
read -p "Enter first number: " num1
read -p "Enter operator (+, -, *, /): " operator
read -p "Enter second number: " num2

case $operator in
    "+")
        result=$((num1 + num2))
        echo "$num1 + $num2 = $result"
        ;;
    "-")
        result=$((num1 - num2))
        echo "$num1 - $num2 = $result"
        ;;
    "*")
        result=$((num1 * num2))
        echo "$num1 * $num2 = $result"
        ;;
    "/")
        if [ $num2 -ne 0 ]; then
            result=$((num1 / num2))
            echo "$num1 / $num2 = $result"
        else
            echo "❌ Error: Division by zero!"
        fi
        ;;
    *)
        echo "❌ Invalid operator: $operator"
        ;;
esac
```

### **Advanced Case Statement with Patterns**
```bash
#!/usr/bin/env bash

echo "📁 File Type Identifier"
read -p "Enter filename: " filename

case $filename in
    *.txt|*.doc|*.docx)
        echo "📄 Document file"
        ;;
    *.jpg|*.jpeg|*.png|*.gif)
        echo "🖼️ Image file"
        ;;
    *.mp3|*.wav|*.flac)
        echo "🎵 Audio file"
        ;;
    *.mp4|*.avi|*.mkv)
        echo "🎬 Video file"
        ;;
    *.sh)
        echo "🔧 Shell script"
        ;;
    *.py)
        echo "🐍 Python script"
        ;;
    [Rr]eadme*)
        echo "📖 README file"
        ;;
    config.*)
        echo "⚙️ Configuration file"
        ;;
    *)
        echo "❓ Unknown file type"
        ;;
esac
```

### **System Administration Menu**
```bash
#!/usr/bin/env bash

show_menu() {
    echo "🔧 System Administration Menu"
    echo "============================="
    echo "1. Show system information"
    echo "2. Check disk usage"
    echo "3. Show running processes"
    echo "4. Check network status"
    echo "5. View system logs"
    echo "6. Exit"
    echo "============================="
}

while true; do
    show_menu
    read -p "Select an option (1-6): " choice
    
    case $choice in
        1)
            echo "💻 System Information:"
            echo "Hostname: $(hostname)"
            echo "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
            echo "Uptime: $(uptime -p)"
            echo "Load: $(uptime | awk '{print $10 $11 $12}')"
            ;;
        2)
            echo "💾 Disk Usage:"
            df -h | grep -E "^/dev"
            ;;
        3)
            echo "⚡ Top 10 Processes by CPU:"
            ps aux --sort=-%cpu | head -11
            ;;
        4)
            echo "🌐 Network Status:"
            echo "Active connections: $(netstat -tun | wc -l)"
            echo "Listening ports: $(netstat -tuln | grep LISTEN | wc -l)"
            ;;
        5)
            echo "📝 Recent System Logs:"
            journalctl --since "1 hour ago" --no-pager | tail -20
            ;;
        6)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
    clear
done
```

### **Service Management Script**
```bash
#!/usr/bin/env bash

if [ $# -eq 0 ]; then
    echo "Usage: $0 <service_name> <action>"
    echo "Actions: start, stop, restart, status, enable, disable"
    exit 1
fi

service_name=$1
action=$2

case $action in
    "start")
        echo "🟢 Starting $service_name..."
        sudo systemctl start "$service_name"
        if [ $? -eq 0 ]; then
            echo "✅ $service_name started successfully"
        else
            echo "❌ Failed to start $service_name"
        fi
        ;;
    "stop")
        echo "🔴 Stopping $service_name..."
        sudo systemctl stop "$service_name"
        if [ $? -eq 0 ]; then
            echo "✅ $service_name stopped successfully"
        else
            echo "❌ Failed to stop $service_name"
        fi
        ;;
    "restart")
        echo "🔄 Restarting $service_name..."
        sudo systemctl restart "$service_name"
        if [ $? -eq 0 ]; then
            echo "✅ $service_name restarted successfully"
        else
            echo "❌ Failed to restart $service_name"
        fi
        ;;
    "status")
        echo "📊 Status of $service_name:"
        sudo systemctl status "$service_name" --no-pager
        ;;
    "enable")
        echo "⚡ Enabling $service_name..."
        sudo systemctl enable "$service_name"
        echo "✅ $service_name will start on boot"
        ;;
    "disable")
        echo "🚫 Disabling $service_name..."
        sudo systemctl disable "$service_name"
        echo "✅ $service_name will not start on boot"
        ;;
    *)
        echo "❌ Invalid action: $action"
        echo "Valid actions: start, stop, restart, status, enable, disable"
        exit 1
        ;;
esac
```

---

## **8. Functions in Shell Scripts**

### **Basic Function Syntax**
```bash
#!/usr/bin/env bash

# Function definition
greet() {
    echo "Hello, World!"
}

# Function call
greet

# Function with parameters
greet_user() {
    local name=$1
    echo "Hello, $name!"
}

greet_user "Alice"
greet_user "Bob"
```

### **Functions with Local Variables**
```bash
#!/usr/bin/env bash

# Global variable
global_counter=0

increment_counter() {
    local step=${1:-1}  # Default step is 1
    global_counter=$((global_counter + step))
    echo "Counter incremented by $step. New value: $global_counter"
}

reset_counter() {
    local old_value=$global_counter
    global_counter=0
    echo "Counter reset from $old_value to $global_counter"
}

# Usage
increment_counter      # +1
increment_counter 5    # +5
increment_counter 3    # +3
reset_counter
```

### **Functions with Return Values**
```bash
#!/usr/bin/env bash

# Function that returns exit status
is_number() {
    local input=$1
    
    # Check if input is a number
    if [[ $input =~ ^[0-9]+$ ]]; then
        return 0  # Success (true)
    else
        return 1  # Failure (false)
    fi
}

# Function that returns value via echo
get_file_size() {
    local filename=$1
    
    if [ -f "$filename" ]; then
        echo $(stat -c%s "$filename")
    else
        echo "0"
    fi
}

# Usage examples
read -p "Enter a number: " user_input

if is_number "$user_input"; then
    echo "✅ '$user_input' is a valid number"
else
    echo "❌ '$user_input' is not a valid number"
fi

# Capture function output
size=$(get_file_size "/etc/passwd")
echo "Size of /etc/passwd: $size bytes"
```

### **Advanced Function Examples**

#### **System Information Functions**
```bash
#!/usr/bin/env bash

# Function to get system info
get_system_info() {
    local info_type=$1
    
    case $info_type in
        "cpu")
            echo $(grep 'model name' /proc/cpuinfo | head -1 | cut -d':' -f2 | sed 's/^ *//')
            ;;
        "memory")
            echo $(free -h | grep '^Mem:' | awk '{print $2}')
            ;;
        "disk")
            echo $(df -h / | tail -1 | awk '{print $2}')
            ;;
        "uptime")
            echo $(uptime -p)
            ;;
        *)
            echo "Unknown info type: $info_type"
            return 1
            ;;
    esac
}

# Function to display formatted system report
show_system_report() {
    echo "🖥️  SYSTEM REPORT"
    echo "==================="
    echo "CPU Model: $(get_system_info cpu)"
    echo "Total Memory: $(get_system_info memory)"
    echo "Disk Space: $(get_system_info disk)"
    echo "Uptime: $(get_system_info uptime)"
    echo "Generated: $(date)"
}

# Call the function
show_system_report
```

#### **File Management Functions**
```bash
#!/usr/bin/env bash

# Function to create backup
create_backup() {
    local source_file=$1
    local backup_dir=${2:-"./backups"}
    
    # Validate input
    if [ ! -f "$source_file" ]; then
        echo "❌ Error: File '$source_file' not found"
        return 1
    fi
    
    # Create backup directory
    mkdir -p "$backup_dir"
    
    # Generate backup filename with timestamp
    local filename=$(basename "$source_file")
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$backup_dir/${filename}_${timestamp}.bak"
    
    # Create backup
    if cp "$source_file" "$backup_file"; then
        echo "✅ Backup created: $backup_file"
        return 0
    else
        echo "❌ Failed to create backup"
        return 1
    fi
}

# Function to validate file extension
validate_file_extension() {
    local filename=$1
    local expected_ext=$2
    
    if [[ "$filename" == *".$expected_ext" ]]; then
        return 0
    else
        return 1
    fi
}

# Function to get file info
get_file_info() {
    local filepath=$1
    
    if [ ! -e "$filepath" ]; then
        echo "File does not exist"
        return 1
    fi
    
    echo "📄 File Information:"
    echo "Path: $filepath"
    echo "Size: $(du -h "$filepath" | cut -f1)"
    echo "Modified: $(stat -c %y "$filepath")"
    echo "Permissions: $(stat -c %A "$filepath")"
    echo "Owner: $(stat -c %U "$filepath")"
}

# Usage examples
create_backup "/etc/hosts"
get_file_info "/etc/passwd"

if validate_file_extension "document.pdf" "pdf"; then
    echo "✅ Valid PDF file"
fi
```

#### **Network Utility Functions**
```bash
#!/usr/bin/env bash

# Function to check if host is reachable
check_host() {
    local hostname=$1
    local timeout=${2:-5}
    
    echo "🔍 Checking connectivity to $hostname..."
    
    if ping -c 1 -W $timeout "$hostname" >/dev/null 2>&1; then
        echo "✅ $hostname is reachable"
        return 0
    else
        echo "❌ $hostname is unreachable"
        return 1
    fi
}

# Function to check port connectivity
check_port() {
    local hostname=$1
    local port=$2
    local timeout=${3:-5}
    
    echo "🔌 Checking port $port on $hostname..."
    
    if timeout $timeout bash -c "echo >/dev/tcp/$hostname/$port" 2>/dev/null; then
        echo "✅ Port $port is open on $hostname"
        return 0
    else
        echo "❌ Port $port is closed or unreachable on $hostname"
        return 1
    fi
}

# Function to get public IP
get_public_ip() {
    local ip=$(curl -s ifconfig.me 2>/dev/null)
    
    if [ -n "$ip" ]; then
        echo "$ip"
    else
        echo "Unable to determine public IP"
    fi
}

# Function to scan common ports
scan_common_ports() {
    local hostname=$1
    local ports=(22 80 443 8080 3306 5432)
    
    echo "🔍 Scanning common ports on $hostname..."
    
    for port in "${ports[@]}"; do
        if check_port "$hostname" "$port" 2 >/dev/null; then
            echo "  ✅ Port $port: Open"
        else
            echo "  ❌ Port $port: Closed"
        fi
    done
}

# Usage
check_host "google.com"
echo "Public IP: $(get_public_ip)"
scan_common_ports "google.com"
```

---

## **9. Working with Arguments and Return Values**

### **Script Arguments**
```bash
#!/usr/bin/env bash

# Special variables for arguments
echo "Script name: $0"
echo "First argument: $1"
echo "Second argument: $2"
echo "All arguments: $@"
echo "Number of arguments: $#"
echo "All arguments as single string: $*"

# Check if enough arguments provided
if [ $# -lt 2 ]; then
    echo "Usage: $0 <source> <destination>"
    exit 1
fi

source_file=$1
dest_file=$2

echo "Copying $source_file to $dest_file"
```

### **Advanced Argument Processing**
```bash
#!/usr/bin/env bash

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS] <command>"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -v, --verbose  Enable verbose output"
    echo "  -f, --force    Force operation"
    echo "  -o, --output   Specify output file"
    echo ""
    echo "Commands:"
    echo "  backup         Create backup"
    echo "  restore        Restore from backup"
    echo "  list           List available backups"
}

# Default values
verbose=false
force=false
output_file=""
command=""

# Process command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        -v|--verbose)
            verbose=true
            shift
            ;;
        -f|--force)
            force=true
            shift
            ;;
        -o|--output)
            output_file="$2"
            shift 2
            ;;
        backup|restore|list)
            command="$1"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate required arguments
if [ -z "$command" ]; then
    echo "❌ Error: No command specified"
    show_usage
    exit 1
fi

# Use the parsed arguments
if [ "$verbose" = true ]; then
    echo "🔧 Verbose mode enabled"
    echo "Command: $command"
    echo "Force: $force"
    echo "Output file: $output_file"
fi

# Execute based on command
case $command in
    backup)
        echo "📦 Creating backup..."
        ;;
    restore)
        echo "🔄 Restoring from backup..."
        ;;
    list)
        echo "📋 Listing backups..."
        ;;
esac
```

### **Functions with Multiple Return Types**
```bash
#!/usr/bin/env bash

# Function that returns multiple values via global variables
get_disk_info() {
    local mount_point=$1
    
    # Use global variables to return multiple values
    disk_total=$(df -h "$mount_point" | tail -1 | awk '{print $2}')
    disk_used=$(df -h "$mount_point" | tail -1 | awk '{print $3}')
    disk_available=$(df -h "$mount_point" | tail -1 | awk '{print $4}')
    disk_percent=$(df -h "$mount_point" | tail -1 | awk '{print $5}')
    
    return 0
}

# Function that returns structured data via echo
get_system_stats() {
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    local memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    local load_average=$(uptime | awk '{print $10}' | cut -d',' -f1)
    
    # Return as colon-separated values
    echo "$cpu_usage:$memory_usage:$load_average"
}

# Usage examples
echo "💾 Disk Information for /:"
get_disk_info "/"
echo "Total: $disk_total"
echo "Used: $disk_used"
echo "Available: $disk_available"
echo "Usage: $disk_percent"

echo ""
echo "📊 System Statistics:"
stats=$(get_system_stats)
IFS=':' read -r cpu_usage memory_usage load_average <<< "$stats"
echo "CPU Usage: ${cpu_usage}%"
echo "Memory Usage: ${memory_usage}%"
echo "Load Average: $load_average"
```

### **Error Handling and Exit Codes**
```bash
#!/usr/bin/env bash

# Function with proper error handling
process_file() {
    local filename=$1
    
    # Check if file exists
    if [ ! -f "$filename" ]; then
        echo "❌ Error: File '$filename' not found" >&2
        return 1
    fi
    
    # Check if file is readable
    if [ ! -r "$filename" ]; then
        echo "❌ Error: File '$filename' is not readable" >&2
        return 2
    fi
    
    # Process the file
    echo "✅ Processing file: $filename"
    
    # Simulate processing that might fail
    if [[ "$filename" == *"error"* ]]; then
        echo "❌ Error: Processing failed for $filename" >&2
        return 3
    fi
    
    echo "✅ Successfully processed $filename"
    return 0
}

# Main script with error handling
main() {
    local files=("file1.txt" "error_file.txt" "file3.txt")
    local exit_code=0
    
    for file in "${files[@]}"; do
        if process_file "$file"; then
            echo "✅ Success: $file"
        else
            local error_code=$?
            echo "❌ Failed: $file (exit code: $error_code)"
            exit_code=1
        fi
        echo ""
    done
    
    exit $exit_code
}

# Run main function
main "$@"
```

---

## **10. Reading Files in Scripts**

### **Reading Files Line by Line**
```bash
#!/usr/bin/env bash

# Method 1: Using while loop with input redirection
echo "📖 Reading file line by line:"
while IFS= read -r line; do
    echo "Line: $line"
done < "/etc/passwd"

# Method 2: Using file descriptor
echo "📄 Reading with file descriptor:"
exec 3< "/etc/hosts"
while IFS= read -r line <&3; do
    # Skip empty lines and comments
    if [[ -n "$line" && ! "$line" =~ ^# ]]; then
        echo "Host entry: $line"
    fi
done
exec 3<&-  # Close file descriptor
```

### **Processing CSV Files**
```bash
#!/usr/bin/env bash

# Sample CSV processing
process_csv() {
    local csv_file=$1
    local line_number=0
    
    echo "📊 Processing CSV file: $csv_file"
    echo "=================================="
    
    while IFS=',' read -r name age department salary; do
        ((line_number++))
        
        # Skip header line
        if [ $line_number -eq 1 ]; then
            echo "Header: $name | $age | $department | $salary"
            continue
        fi
        
        # Process data
        echo "Employee $((line_number-1)):"
        echo "  Name: $name"
        echo "  Age: $age"
        echo "  Department: $department"
        echo "  Salary: \$(printf "%'d" $salary)"  # Format with commas
        echo ""
        
    done < "$csv_file"
}

# Create sample CSV for testing
cat > employees.csv << EOF
Name,Age,Department,Salary
John Doe,30,IT,75000
Jane Smith,28,HR,65000
Bob Johnson,35,Finance,85000
EOF

process_csv "employees.csv"
```

### **Configuration File Processing**
```bash
#!/usr/bin/env bash

# Function to read configuration file
read_config() {
    local config_file=$1
    
    # Declare associative array for config values
    declare -A config
    
    echo "⚙️ Reading configuration from: $config_file"
    
    while IFS='=' read -r key value; do
        # Skip empty lines and comments
        [[ -z "$key" || "$key" =~ ^# ]] && continue
        
        # Remove leading/trailing whitespace
        key=$(echo "$key" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
        value=$(echo "$value" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
        
        # Remove quotes if present
        value=$(echo "$value" | sed 's/^"//;s/"$//')
        
        config["$key"]="$value"
        echo "Config: $key = $value"
        
    done < "$config_file"
    
    # Export config values as environment variables
    for key in "${!config[@]}"; do
        export "APP_$key"="${config[$key]}"
    done
}

# Create sample config file
cat > app.conf << EOF
# Application Configuration
database_host=localhost
database_port=5432
database_name="myapp_db"
debug_mode=true
max_connections=100

# Cache settings
cache_enabled=true
cache_ttl=3600
EOF

read_config "app.conf"

# Use the configuration
echo ""
echo "🔧 Using configuration:"
echo "Database: $APP_database_host:$APP_database_port/$APP_database_name"
echo "Debug mode: $APP_debug_mode"
echo "Max connections: $APP_max_connections"
```

### **Log File Analysis**
```bash
#!/usr/bin/env bash

# Function to analyze log files
analyze_logs() {
    local log_file=$1
    local start_time=${2:-"1 hour ago"}
    
    echo "📈 Log Analysis Report"
    echo "======================"
    echo "File: $log_file"
    echo "Period: Since $start_time"
    echo ""
    
    # Count different log levels
    declare -A log_levels
    log_levels["ERROR"]=0
    log_levels["WARN"]=0
    log_levels["INFO"]=0
    log_levels["DEBUG"]=0
    
    total_lines=0
    
    while IFS= read -r line; do
        ((total_lines++))
        
        # Extract log level
        if [[ "$line" =~ ERROR ]]; then
            ((log_levels["ERROR"]++))
        elif [[ "$line" =~ WARN ]]; then
            ((log_levels["WARN"]++))
        elif [[ "$line" =~ INFO ]]; then
            ((log_levels["INFO"]++))
        elif [[ "$line" =~ DEBUG ]]; then
            ((log_levels["DEBUG"]++))
        fi
        
    done < "$log_file"
    
    # Display results
    echo "📊 Log Level Summary:"
    for level in ERROR WARN INFO DEBUG; do
        count=${log_levels[$level]}
        percentage=$((count * 100 / total_lines))
        echo "  $level: $count ($percentage%)"
    done
    
    echo ""
    echo "Total lines processed: $total_lines"
    
    # Show recent errors
    echo ""
    echo "🔴 Recent Errors:"
    grep "ERROR" "$log_file" | tail -5
}

# Create sample log file
cat > app.log << EOF
2023-11-15 10:00:01 INFO Application started
2023-11-15 10:00:02 DEBUG Loading configuration
2023-11-15 10:00:03 INFO Database connection established
2023-11-15 10:01:15 WARN High memory usage detected
2023-11-15 10:02:30 ERROR Failed to connect to external service
2023-11-15 10:02:31 INFO Retrying connection
2023-11-15 10:02:35 INFO Connection restored
2023-11-15 10:05:00 DEBUG Processing request 12345
2023-11-15 10:05:01 ERROR Invalid user credentials
2023-11-15 10:05:02 WARN Security alert: Multiple failed login attempts
EOF

analyze_logs "app.log"
```

### **File Backup and Processing**
```bash
#!/usr/bin/env bash

# Function to process and backup files
process_and_backup() {
    local source_dir=$1
    local backup_dir=${2:-"./backups"}
    local file_pattern=${3:-"*.txt"}
    
    echo "🔄 Processing files in: $source_dir"
    echo "Pattern: $file_pattern"
    echo "Backup directory: $backup_dir"
    echo ""
    
    # Create backup directory
    mkdir -p "$backup_dir"
    
    # Process matching files
    find "$source_dir" -name "$file_pattern" -type f | while IFS= read -r file; do
        echo "📄 Processing: $(basename "$file")"
        
        # Read and process file content
        line_count=$(wc -l < "$file")
        file_size=$(stat -c%s "$file")
        
        echo "  Lines: $line_count"
        echo "  Size: $file_size bytes"
        
        # Create backup with timestamp
        timestamp=$(date +%Y%m%d_%H%M%S)
        backup_file="$backup_dir/$(basename "$file")_$timestamp.bak"
        
        if cp "$file" "$backup_file"; then
            echo "  ✅ Backup created: $backup_file"
        else
            echo "  ❌ Backup failed"
        fi
        
        echo ""
    done
}

# Create test files
mkdir -p test_files
echo -e "Line 1\nLine 2\nLine 3" > test_files/file1.txt
echo -e "Content A\nContent B" > test_files/file2.txt

# Process the files
process_and_backup "test_files" "backups" "*.txt"
```

---

## **🎯 Part 2 Summary**

You've mastered advanced shell scripting concepts:

1. **Loops** - for, while, until loops for automation
2. **Case Statements** - Pattern matching and menu systems
3. **Functions** - Reusable code blocks with parameters
4. **Arguments** - Processing command-line options and parameters
5. **File Processing** - Reading and analyzing various file formats

### **Key Takeaways**
- Use `for` loops for known iterations, `while` for conditions
- `case` statements are perfect for menu systems and pattern matching
- Functions make code reusable and maintainable
- Always validate arguments and handle errors gracefully
- Process files line by line for memory efficiency

### **Next in Part 3**
- Logging Script Output
- Debugging Shell Scripts
- Automating System Tasks
- Script Scheduling with Crontab

---

## **🧪 Practice Exercises**

Try these advanced exercises:

1. **Log Analyzer** - Create a function that analyzes web server logs
2. **System Monitor** - Build a monitoring script with menu options
3. **File Organizer** - Sort files by type using functions and loops
4. **Configuration Manager** - Read and validate config files

**Remember**: Functions are your friends - write once, use everywhere! 🚀

---

# **PART 3: LOGGING, DEBUGGING & AUTOMATION**

## **📋 What You'll Learn in Part 3**
- Logging Script Output
- Debugging Shell Scripts
- Automating System Tasks
- Script Scheduling with Crontab
- Interactive Scripts with Menus and Colors

---

## **11. Logging Script Output**

### **Basic Logging Concepts**

#### **Understanding Output Streams**
```
┌─────────────────┐
│     SCRIPT      │
└─────┬───────────┘
      │
      ├─► stdout (1) ──► Screen/File (Normal output)
      │
      ├─► stderr (2) ──► Screen/File (Error messages)
      │
      └─► stdin  (0) ◄── Keyboard/File (Input)
```

### **Simple Logging Functions**
```bash
#!/usr/bin/env bash

# Global log file
LOG_FILE="/var/log/myscript.log"

# Logging functions
log_info() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $*" | tee -a "$LOG_FILE"
}

log_warn() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARN] $*" | tee -a "$LOG_FILE" >&2
}

log_error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $*" | tee -a "$LOG_FILE" >&2
}

log_debug() {
    if [ "${DEBUG:-false}" = "true" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [DEBUG] $*" | tee -a "$LOG_FILE"
    fi
}

# Usage examples
log_info "Script started"
log_warn "This is a warning message"
log_error "This is an error message"
DEBUG=true log_debug "This debug message will show"
log_info "Script completed"
```

### **Advanced Logging System**
```bash
#!/usr/bin/env bash

# Configuration
SCRIPT_NAME=$(basename "$0")
LOG_DIR="/var/log/scripts"
LOG_FILE="$LOG_DIR/${SCRIPT_NAME%.*}.log"
MAX_LOG_SIZE=10485760  # 10MB in bytes
MAX_LOG_FILES=5

# Log levels
LOG_LEVEL_DEBUG=0
LOG_LEVEL_INFO=1
LOG_LEVEL_WARN=2
LOG_LEVEL_ERROR=3

# Current log level (can be set via environment variable)
CURRENT_LOG_LEVEL=${LOG_LEVEL:-$LOG_LEVEL_INFO}

# Create log directory if it doesn't exist
setup_logging() {
    if [ ! -d "$LOG_DIR" ]; then
        mkdir -p "$LOG_DIR"
        if [ $? -ne 0 ]; then
            echo "Failed to create log directory: $LOG_DIR" >&2
            exit 1
        fi
    fi
    
    # Rotate logs if necessary
    rotate_logs
    
    log_info "Logging initialized - Log file: $LOG_FILE"
}

# Log rotation function
rotate_logs() {
    if [ -f "$LOG_FILE" ] && [ $(stat -c%s "$LOG_FILE") -gt $MAX_LOG_SIZE ]; then
        echo "Rotating log file (size: $(stat -c%s "$LOG_FILE") bytes)"
        
        # Shift existing rotated logs
        for i in $(seq $((MAX_LOG_FILES-1)) -1 1); do
            if [ -f "$LOG_FILE.$i" ]; then
                mv "$LOG_FILE.$i" "$LOG_FILE.$((i+1))"
            fi
        done
        
        # Move current log to .1
        mv "$LOG_FILE" "$LOG_FILE.1"
        
        # Remove oldest log if it exceeds max files
        if [ -f "$LOG_FILE.$MAX_LOG_FILES" ]; then
            rm "$LOG_FILE.$MAX_LOG_FILES"
        fi
    fi
}

# Enhanced logging functions
write_log() {
    local level=$1
    local level_name=$2
    local color=$3
    shift 3
    local message="$*"
    
    # Check if we should log this level
    if [ $level -lt $CURRENT_LOG_LEVEL ]; then
        return
    fi
    
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local log_entry="[$timestamp] [$level_name] [$$] $message"
    
    # Write to file
    echo "$log_entry" >> "$LOG_FILE"
    
    # Write to console with color
    if [ -t 1 ]; then  # Check if stdout is a terminal
        echo -e "$color[$timestamp] [$level_name]$NC $message"
    else
        echo "$log_entry"
    fi
}

# Color codes
NC='\033[0m'          # No Color
RED='\033[0;31m'      # Red
YELLOW='\033[0;33m'   # Yellow
GREEN='\033[0;32m'    # Green
BLUE='\033[0;34m'     # Blue
GRAY='\033[0;37m'     # Gray

# Logging functions with colors
log_debug() {
    write_log $LOG_LEVEL_DEBUG "DEBUG" "$GRAY" "$@"
}

log_info() {
    write_log $LOG_LEVEL_INFO "INFO" "$GREEN" "$@"
}

log_warn() {
    write_log $LOG_LEVEL_WARN "WARN" "$YELLOW" "$@"
}

log_error() {
    write_log $LOG_LEVEL_ERROR "ERROR" "$RED" "$@"
}

# Function to log function entry/exit
log_function() {
    local func_name=$1
    shift
    log_debug "Entering function: $func_name with arguments: $*"
    
    # Store the function name for exit logging
    export CURRENT_FUNCTION="$func_name"
}

log_function_exit() {
    local exit_code=${1:-$?}
    log_debug "Exiting function: $CURRENT_FUNCTION with exit code: $exit_code"
    unset CURRENT_FUNCTION
}

# Setup logging when script starts
setup_logging

# Example usage
example_function() {
    log_function "example_function" "$@"
    
    log_info "Processing data..."
    sleep 1
    
    if [ "$1" = "error" ]; then
        log_error "Simulated error occurred"
        log_function_exit 1
        return 1
    fi
    
    log_info "Data processed successfully"
    log_function_exit 0
    return 0
}

# Demo the logging system
log_info "Script execution started"
log_debug "Debug mode is enabled"
log_warn "This is a warning message"

example_function "success"
example_function "error"

log_info "Script execution completed"
```

### **Structured Logging with JSON**
```bash
#!/usr/bin/env bash

# JSON logging function
log_json() {
    local level=$1
    local message=$2
    local component=${3:-"main"}
    local extra_fields=${4:-"{}"}
    
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
    local hostname=$(hostname)
    local pid=$
    
    # Create JSON log entry
    cat << EOF >> "$LOG_FILE"
{
  "timestamp": "$timestamp",
  "level": "$level",
  "message": "$message",
  "component": "$component",
  "hostname": "$hostname",
  "pid": $pid,
  "script": "$SCRIPT_NAME",
  "extra": $extra_fields
}
EOF
}

# Convenience functions for JSON logging
log_json_info() {
    log_json "INFO" "$1" "$2" "$3"
}

log_json_error() {
    log_json "ERROR" "$1" "$2" "$3"
}

# Example with extra fields
log_json_info "User login" "auth" '{"user_id": "12345", "ip_address": "192.168.1.100"}'
log_json_error "Database connection failed" "database" '{"error_code": "CONN_TIMEOUT", "retry_count": 3}'
```

### **Performance Logging**
```bash
#!/usr/bin/env bash

# Performance timing functions
start_timer() {
    local timer_name=${1:-"default"}
    eval "timer_start_${timer_name}=$(date +%s%N)"
}

end_timer() {
    local timer_name=${1:-"default"}
    local start_var="timer_start_${timer_name}"
    local start_time=${!start_var}
    
    if [ -z "$start_time" ]; then
        log_error "Timer '$timer_name' was not started"
        return 1
    fi
    
    local end_time=$(date +%s%N)
    local duration_ns=$((end_time - start_time))
    local duration_ms=$((duration_ns / 1000000))
    
    log_info "Timer '$timer_name' completed in ${duration_ms}ms"
    
    # Clean up the timer variable
    unset "timer_start_${timer_name}"
    
    return 0
}

# Performance monitoring wrapper
with_timing() {
    local timer_name=$1
    shift
    
    start_timer "$timer_name"
    "$@"
    local exit_code=$?
    end_timer "$timer_name"
    
    return $exit_code
}

# Example usage
slow_function() {
    log_info "Starting slow operation..."
    sleep 2
    log_info "Slow operation completed"
}

# Time the function execution
with_timing "slow_operation" slow_function
```

---

## **12. Debugging Shell Scripts**

### **Debug Mode and Tracing**
```bash
#!/usr/bin/env bash

# Enable debugging modes
set -x          # Print each command before executing
set -e          # Exit on any error
set -u          # Exit on undefined variables
set -o pipefail # Exit on pipe failures

# Alternative: Enable all at once
# set -xeuo pipefail

# You can also enable selectively
debug_section() {
    set -x  # Enable tracing for this section
    
    echo "This will show the command being executed"
    ls /tmp
    date
    
    set +x  # Disable tracing
}

debug_section
```

### **Custom Debug Functions**
```bash
#!/usr/bin/env bash

# Debug configuration
DEBUG=${DEBUG:-false}
VERBOSE=${VERBOSE:-false}

# Debug print function
debug_print() {
    if [ "$DEBUG" = "true" ]; then
        echo "[DEBUG] $*" >&2
    fi
}

# Verbose print function
verbose_print() {
    if [ "$VERBOSE" = "true" ]; then
        echo "[VERBOSE] $*" >&2
    fi
}

# Function to dump all variables
dump_variables() {
    if [ "$DEBUG" = "true" ]; then
        echo "[DEBUG] === Variable Dump ===" >&2
        set | grep -E '^[A-Za-z_][A-Za-z0-9_]*=' | sort >&2
        echo "[DEBUG] === End Dump ===" >&2
    fi
}

# Function to trace function calls
trace_function() {
    local func_name=$1
    shift
    
    debug_print "ENTER: $func_name($*)"
    "$func_name" "$@"
    local exit_code=$?
    debug_print "EXIT: $func_name -> $exit_code"
    
    return $exit_code
}

# Example usage
my_function() {
    local param1=$1
    local param2=$2
    
    debug_print "Processing parameters: $param1, $param2"
    verbose_print "Performing calculations..."
    
    local result=$((param1 + param2))
    debug_print "Result calculated: $result"
    
    echo $result
    return 0
}

# Enable debug mode
DEBUG=true
VERBOSE=true

trace_function my_function 10 20
dump_variables
```

### **Error Handling and Stack Traces**
```bash
#!/usr/bin/env bash

# Enhanced error handling
set -eE  # Exit on error and inherit error handling in functions

# Array to store call stack
declare -a CALL_STACK

# Function to print stack trace
print_stack_trace() {
    echo "=== STACK TRACE ===" >&2
    local frame=0
    while caller $frame >&2; do
        ((frame++))
    done
    echo "==================" >&2
}

# Error trap handler
error_handler() {
    local exit_code=$?
    local line_number=$1
    
    echo "❌ ERROR: Script failed with exit code $exit_code at line $line_number" >&2
    echo "Command that failed: ${BASH_COMMAND}" >&2
    print_stack_trace
    
    # Log the error
    log_error "Script failure at line $line_number: ${BASH_COMMAND} (exit code: $exit_code)"
    
    exit $exit_code
}

# Set up error trap
trap 'error_handler $LINENO' ERR

# Function entry/exit tracking
function_enter() {
    local func_name=${FUNCNAME[1]}
    CALL_STACK+=("$func_name")
    debug_print "→ Entering $func_name"
}

function_exit() {
    local func_name=${FUNCNAME[1]}
    local exit_code=${1:-$?}
    
    # Remove from call stack
    unset 'CALL_STACK[${#CALL_STACK[@]}-1]'
    debug_print "← Exiting $func_name (exit code: $exit_code)"
    
    return $exit_code
}

# Example functions with tracking
risky_function() {
    function_enter
    
    debug_print "Doing something risky..."
    
    # This will cause an error
    ls /nonexistent/directory
    
    function_exit
}

safe_function() {
    function_enter
    
    debug_print "Doing something safe..."
    echo "This works fine"
    
    function_exit
}

# Test the error handling
DEBUG=true
safe_function
# risky_function  # Uncomment to test error handling
```

### **Interactive Debugging**
```bash
#!/usr/bin/env bash

# Interactive debugger
debug_break() {
    if [ "$DEBUG" = "true" ]; then
        echo "🔍 Debug break at line $LINENO in ${FUNCNAME[1]}" >&2
        echo "Variables in scope:" >&2
        local | grep -E '^[a-z]' >&2
        echo "Enter 'c' to continue, 'q' to quit, or any bash command:" >&2
        
        while true; do
            read -p "(debug) " debug_cmd
            case $debug_cmd in
                c|continue)
                    break
                    ;;
                q|quit)
                    exit 1
                    ;;
                *)
                    eval "$debug_cmd"
                    ;;
            esac
        done
    fi
}

# Function with debug breakpoints
process_data() {
    local input_file=$1
    local output_file=$2
    
    debug_break  # Breakpoint 1
    
    if [ ! -f "$input_file" ]; then
        log_error "Input file not found: $input_file"
        return 1
    fi
    
    debug_break  # Breakpoint 2
    
    # Process the file
    cat "$input_file" | grep -v "^#" > "$output_file"
    
    debug_break  # Breakpoint 3
    
    log_info "Processing completed: $output_file"
}

# Enable debug mode and test
DEBUG=true
process_data "/etc/passwd" "/tmp/output.txt"
```

### **Automated Testing and Validation**
```bash
#!/usr/bin/env bash

# Test framework for shell scripts
declare -i TESTS_RUN=0
declare -i TESTS_PASSED=0
declare -i TESTS_FAILED=0

# Test assertion functions
assert_equals() {
    local expected=$1
    local actual=$2
    local message=${3:-"Assertion failed"}
    
    ((TESTS_RUN++))
    
    if [ "$expected" = "$actual" ]; then
        ((TESTS_PASSED++))
        echo "✅ PASS: $message"
        return 0
    else
        ((TESTS_FAILED++))
        echo "❌ FAIL: $message"
        echo "   Expected: '$expected'"
        echo "   Actual:   '$actual'"
        return 1
    fi
}

assert_not_equals() {
    local not_expected=$1
    local actual=$2
    local message=${3:-"Assertion failed"}
    
    ((TESTS_RUN++))
    
    if [ "$not_expected" != "$actual" ]; then
        ((TESTS_PASSED++))
        echo "✅ PASS: $message"
        return 0
    else
        ((TESTS_FAILED++))
        echo "❌ FAIL: $message"
        echo "   Should not equal: '$not_expected'"
        echo "   Actual:          '$actual'"
        return 1
    fi
}

assert_file_exists() {
    local filepath=$1
    local message=${2:-"File should exist"}
    
    ((TESTS_RUN++))
    
    if [ -f "$filepath" ]; then
        ((TESTS_PASSED++))
        echo "✅ PASS: $message ($filepath)"
        return 0
    else
        ((TESTS_FAILED++))
        echo "❌ FAIL: $message ($filepath)"
        return 1
    fi
}

# Test runner
run_tests() {
    echo "🧪 Running Tests"
    echo "================"
    
    # Reset counters
    TESTS_RUN=0
    TESTS_PASSED=0
    TESTS_FAILED=0
    
    # Run test functions
    test_string_functions
    test_file_operations
    test_math_operations
    
    # Print summary
    echo ""
    echo "📊 Test Summary"
    echo "==============="
    echo "Tests run:    $TESTS_RUN"
    echo "Tests passed: $TESTS_PASSED"
    echo "Tests failed: $TESTS_FAILED"
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo "🎉 All tests passed!"
        return 0
    else
        echo "💥 Some tests failed!"
        return 1
    fi
}

# Example test functions
test_string_functions() {
    echo ""
    echo "Testing string functions..."
    
    # Test string concatenation
    result=$(echo "Hello" "World")
    assert_equals "Hello World" "$result" "String concatenation"
    
    # Test string length
    test_string="Hello"
    assert_equals "5" "${#test_string}" "String length"
    
    # Test string substitution
    test_string="Hello World"
    result=${test_string/World/Universe}
    assert_equals "Hello Universe" "$result" "String substitution"
}

test_file_operations() {
    echo ""
    echo "Testing file operations..."
    
    # Create test file
    test_file="/tmp/test_file_$"
    echo "test content" > "$test_file"
    
    assert_file_exists "$test_file" "Test file creation"
    
    # Test file content
    content=$(cat "$test_file")
    assert_equals "test content" "$content" "File content"
    
    # Cleanup
    rm -f "$test_file"
}

test_math_operations() {
    echo ""
    echo "Testing math operations..."
    
    # Test addition
    result=$((5 + 3))
    assert_equals "8" "$result" "Addition"
    
    # Test multiplication
    result=$((4 * 3))
    assert_equals "12" "$result" "Multiplication"
    
    # Test division
    result=$((10 / 2))
    assert_equals "5" "$result" "Division"
}

# Run tests if this script is executed directly
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    run_tests
fi
```

---

## **13. Automating System Tasks**

### **System Monitoring Automation**
```bash
#!/usr/bin/env bash

# System monitoring configuration
MONITOR_CONFIG="/etc/monitor.conf"
ALERT_EMAIL="admin@example.com"
ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEMORY=85
ALERT_THRESHOLD_DISK=90

# Load configuration if exists
if [ -f "$MONITOR_CONFIG" ]; then
    source "$MONITOR_CONFIG"
fi

# System monitoring functions
check_cpu_usage() {
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    local cpu_int=${cpu_usage%.*}  # Remove decimal part
    
    echo "CPU Usage: ${cpu_usage}%"
    
    if [ "$cpu_int" -gt "$ALERT_THRESHOLD_CPU" ]; then
        send_alert "HIGH CPU USAGE" "CPU usage is ${cpu_usage}% (threshold: ${ALERT_THRESHOLD_CPU}%)"
        return 1
    fi
    
    return 0
}

check_memory_usage() {
    local memory_info=$(free | grep Mem)
    local total=$(echo $memory_info | awk '{print $2}')
    local used=$(echo $memory_info | awk '{print $3}')
    local usage_percent=$((used * 100 / total))
    
    echo "Memory Usage: ${usage_percent}%"
    
    if [ "$usage_percent" -gt "$ALERT_THRESHOLD_MEMORY" ]; then
        send_alert "HIGH MEMORY USAGE" "Memory usage is ${usage_percent}% (threshold: ${ALERT_THRESHOLD_MEMORY}%)"
        return 1
    fi
    
    return 0
}

check_disk_usage() {
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    
    echo "Disk Usage: ${disk_usage}%"
    
    if [ "$disk_usage" -gt "$ALERT_THRESHOLD_DISK" ]; then
        send_alert "HIGH DISK USAGE" "Disk usage is ${disk_usage}% (threshold: ${ALERT_THRESHOLD_DISK}%)"
        return 1
    fi
    
    return 0
}

check_services() {
    local services=("ssh" "nginx" "mysql")
    local failed_services=()
    
    for service in "${services[@]}"; do
        if ! systemctl is-active --quiet "$service"; then
            failed_services+=("$service")
        fi
    done
    
    if [ ${#failed_services[@]} -gt 0 ]; then
        local failed_list=$(IFS=, ; echo "${failed_services[*]}")
        send_alert "SERVICE FAILURE" "The following services are not running: $failed_list"
        return 1
    fi
    
    echo "All monitored services are running"
    return 0
}

send_alert() {
    local subject=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local hostname=$(hostname)
    
    # Log the alert
    log_error "ALERT: $subject - $message"
    
    # Send email alert (if mail is configured)
    if command -v mail >/dev/null 2>&1; then
        cat << EOF | mail -s "[$hostname] $subject" "$ALERT_EMAIL"
Alert Details:
==============
Time: $timestamp
Host: $hostname
Subject: $subject
Message: $message

System Status:
==============
$(uname -a)
$(uptime)
$(df -h /)
$(free -h)
EOF
    fi
    
    # Send to syslog
    logger -p user.crit "System Monitor Alert: $subject - $message"
}

# Main monitoring function
run_system_monitor() {
    echo "🔍 System Monitor - $(date)"
    echo "================================"
    
    local alerts=0
    
    check_cpu_usage || ((alerts++))
    check_memory_usage || ((alerts++))
    check_disk_usage || ((alerts++))
    check_services || ((alerts++))
    
    echo ""
    if [ $alerts -eq 0 ]; then
        echo "✅ All checks passed"
        log_info "System monitor: All checks passed"
    else
        echo "⚠️  $alerts alert(s) generated"
        log_warn "System monitor: $alerts alert(s) generated"
    fi
    
    return $alerts
}

# Run the monitor
run_system_monitor
```

### **Automated Backup System**
```bash
#!/usr/bin/env bash

# Backup configuration
BACKUP_SOURCE_DIRS=("/etc" "/home" "/var/www")
BACKUP_DEST="/backup"
RETENTION_DAYS=30
COMPRESSION_LEVEL=6
EXCLUDE_PATTERNS=("*.tmp" "*.log" "cache/*")

# Backup functions
create_backup() {
    local backup_date=$(date +%Y%m%d_%H%M%S)
    local backup_name="system_backup_$backup_date"
    local backup_path="$BACKUP_DEST/$backup_name"
    
    log_info "Starting backup: $backup_name"
    
    # Create backup directory
    mkdir -p "$backup_path"
    
    # Build exclude options
    local exclude_opts=""
    for pattern in "${EXCLUDE_PATTERNS[@]}"; do
        exclude_opts="$exclude_opts --exclude=$pattern"
    done
    
    # Backup each source directory
    for source_dir in "${BACKUP_SOURCE_DIRS[@]}"; do
        if [ -d "$source_dir" ]; then
            local dir_name=$(basename "$source_dir")
            log_info "Backing up $source_dir..."
            
            tar $exclude_opts \
                --create \
                --gzip \
                --file "$backup_path/${dir_name}.tar.gz" \
                --directory / \
                --verbose \
                "${source_dir#/}" \
                2>&1 | while read line; do
                    log_debug "tar: $line"
                done
                
            if [ ${PIPESTATUS[0]} -eq 0 ]; then
                log_info "Successfully backed up $source_dir"
            else
                log_error "Failed to backup $source_dir"
                return 1
            fi
        else
            log_warn "Source directory not found: $source_dir"
        fi
    done
    
    # Create backup manifest
    create_backup_manifest "$backup_path"
    
    log_info "Backup completed: $backup_path"
    return 0
}

create_backup_manifest() {
    local backup_path=$1
    local manifest_file="$backup_path/manifest.txt"
    
    cat > "$manifest_file" << EOF
Backup Manifest
===============
Date: $(date)
Host: $(hostname)
User: $(whoami)
Backup Path: $backup_path

Source Directories:
$(printf '%s\n' "${BACKUP_SOURCE_DIRS[@]}")

Exclude Patterns:
$(printf '%s\n' "${EXCLUDE_PATTERNS[@]}")

Backup Contents:
$(find "$backup_path" -name "*.tar.gz" -exec basename {} \; | sort)

Backup Sizes:
$(find "$backup_path" -name "*.tar.gz" -exec ls -lh {} \; | awk '{print $5 "\t" $9}')

Total Size: $(du -sh "$backup_path" | cut -f1)
EOF

    log_info "Backup manifest created: $manifest_file"
}

cleanup_old_backups() {
    log_info "Cleaning up backups older than $RETENTION_DAYS days..."
    
    find "$BACKUP_DEST" -type d -name "system_backup_*" -mtime +$RETENTION_DAYS | while read old_backup; do
        log_info "Removing old backup: $old_backup"
        rm -rf "$old_backup"
    done
}

verify_backup() {
    local backup_path=$1
    log_info "Verifying backup: $backup_path"
    
    local errors=0
    
    # Check if backup directory exists
    if [ ! -d "$backup_path" ]; then
        log_error "Backup directory not found: $backup_path"
        return 1
    fi
    
    # Verify each backup file
    find "$backup_path" -name "*.tar.gz" | while read backup_file; do
        log_debug "Verifying: $backup_file"
        
        if tar -tzf "$backup_file" >/dev/null 2>&1; then
            log_debug "✅ Verified: $backup_file"
        else
            log_error "❌ Corrupted: $backup_file"
            ((errors++))
        fi
    done
    
    if [ $errors -eq 0 ]; then
        log_info "✅ Backup verification passed"
        return 0
    else
        log_error "❌ Backup verification failed ($errors errors)"
        return 1
    fi
}

# Main backup routine
run_backup() {
    log_info "=== Automated Backup System ==="
    
    # Check available space
    local available_space=$(df "$BACKUP_DEST" | tail -1 | awk '{print $4}')
    log_info "Available space: $available_space KB"
    
    # Create backup
    if create_backup; then
        # Get the latest backup path
        local latest_backup=$(find "$BACKUP_DEST" -type d -name "system_backup_*" | sort | tail -1)
        
        # Verify backup
        if verify_backup "$latest_backup"; then
            log_info "Backup process completed successfully"
        else
            log_error "Backup verification failed"
            return 1
        fi
    else
        log_error "Backup creation failed"
        return 1
    fi
    
    # Cleanup old backups
    cleanup_old_backups
    
    log_info "=== Backup Process Complete ==="
}

# Run backup
run_backup
```

### **Log Rotation and Cleanup**
```bash
#!/usr/bin/env bash

# Log rotation configuration
LOG_DIRS=("/var/log" "/var/log/nginx" "/var/log/apache2" "/opt/app/logs")
MAX_SIZE="100M"
MAX_AGE=30
COMPRESS_AGE=1

rotate_logs() {
    log_info "Starting log rotation process..."
    
    for log_dir in "${LOG_DIRS[@]}"; do
        if [ -d "$log_dir" ]; then
            log_info "Processing log directory: $log_dir"
            rotate_directory_logs "$log_dir"
        else
            log_warn "Log directory not found: $log_dir"
        fi
    done
}

rotate_directory_logs() {
    local dir=$1
    
    # Find large log files
    find "$dir" -name "*.log" -size "+$MAX_SIZE" -type f | while read logfile; do
        log_info "Rotating large log file: $logfile"
        rotate_single_log "$logfile"
    done
    
    # Compress old log files
    find "$dir" -name "*.log.*" -mtime +$COMPRESS_AGE -not -name "*.gz" -type f | while read logfile; do
        log_info "Compressing old log: $logfile"
        gzip "$logfile"
    done
    
    # Remove very old compressed logs
    find "$dir" -name "*.log.*.gz" -mtime +$MAX_AGE -type f | while read logfile; do
        log_info "Removing old compressed log: $logfile"
        rm "$logfile"
    done
}

rotate_single_log() {
    local logfile=$1
    local basename=$(basename "$logfile" .log)
    local dirname=$(dirname "$logfile")
    local timestamp=$(date +%Y%m%d_%H%M%S)
    
    # Copy the log file with timestamp
    cp "$logfile" "$dirname/${basename}.log.$timestamp"
    
    # Truncate the original log file
    > "$logfile"
    
    # Restart services if needed
    restart_log_services "$logfile"
}

restart_log_services() {
    local logfile=$1
    
    # Determine which service to restart based on log path
    case "$logfile" in
        */nginx/*)
            systemctl reload nginx 2>/dev/null && log_info "Reloaded nginx"
            ;;
        */apache2/*)
            systemctl reload apache2 2>/dev/null && log_info "Reloaded apache2"
            ;;
        */mysql/*)
            systemctl reload mysql 2>/dev/null && log_info "Reloaded mysql"
            ;;
    esac
}

# Run log rotation
rotate_logs
```

---

## **14. Script Scheduling with Crontab**

### **Understanding Cron Syntax**
```
┌─────────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌─────────── day of month (1 - 31)
│ │ │ ┌───────── month (1 - 12)
│ │ │ │ ┌─────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
│ │ │ │ │
* * * * * /path/to/script.sh

Examples:
0 2 * * *     - Daily at 2:00 AM
0 2 * * 1     - Every Monday at 2:00 AM
0 */6 * * *   - Every 6 hours
30 1 1 * *    - First day of month at 1:30 AM
0 9-17 * * 1-5 - Every hour from 9 AM to 5 PM, Monday to Friday
*/15 * * * *  - Every 15 minutes
```

### **Cron Management Functions**
```bash
#!/usr/bin/env bash

# Cron management functions
add_cron_job() {
    local schedule=$1
    local command=$2
    local description=${3:-"No description"}
    
    # Backup current crontab
    crontab -l > /tmp/crontab_backup_$ 2>/dev/null || true
    
    # Add new job with description
    (
        echo "# $description"
        echo "$schedule $command"
        echo ""
    ) >> /tmp/crontab_backup_$
    
    # Install new crontab
    crontab /tmp/crontab_backup_$
    
    if [ $? -eq 0 ]; then
        log_info "Cron job added: $schedule $command"
        rm /tmp/crontab_backup_$
        return 0
    else
        log_error "Failed to add cron job"
        rm /tmp/crontab_backup_$
        return 1
    fi
}

remove_cron_job() {
    local pattern=$1
    
    # Backup current crontab
    crontab -l > /tmp/crontab_backup_$ 2>/dev/null || true
    
    # Remove matching lines
    grep -v "$pattern" /tmp/crontab_backup_$ > /tmp/crontab_new_$
    
    # Install updated crontab
    crontab /tmp/crontab_new_$
    
    if [ $? -eq 0 ]; then
        log_info "Removed cron jobs matching: $pattern"
        rm /tmp/crontab_backup_$ /tmp/crontab_new_$
        return 0
    else
        log_error "Failed to remove cron job"
        rm /tmp/crontab_backup_$ /tmp/crontab_new_$
        return 1
    fi
}

list_cron_jobs() {
    echo "📋 Current Cron Jobs:"
    echo "===================="
    crontab -l 2>/dev/null || echo "No cron jobs found"
}

# Setup common maintenance jobs
setup_maintenance_crons() {
    log_info "Setting up maintenance cron jobs..."
    
    # Daily backup at 2 AM
    add_cron_job "0 2 * * *" "/usr/local/bin/backup.sh" "Daily system backup"
    
    # Weekly log rotation on Sunday at 3 AM
    add_cron_job "0 3 * * 0" "/usr/local/bin/rotate_logs.sh" "Weekly log rotation"
    
    # System monitoring every 15 minutes
    add_cron_job "*/15 * * * *" "/usr/local/bin/monitor.sh" "System monitoring"
    
    # Monthly cleanup on first day at 4 AM
    add_cron_job "0 4 1 * *" "/usr/local/bin/cleanup.sh" "Monthly cleanup"
    
    # Update system packages weekly on Saturday at 1 AM
    add_cron_job "0 1 * * 6" "/usr/local/bin/update_system.sh" "Weekly system updates"
}

# Setup the crons
setup_maintenance_crons
list_cron_jobs
```

### **Cron-Safe Script Template**
```bash
#!/usr/bin/env bash

# Cron-safe script template
# This script is designed to run safely from cron

# Set up environment for cron
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
export HOME="/root"
cd "$HOME"

# Script configuration
SCRIPT_NAME=$(basename "$0")
LOCK_FILE="/var/run/${SCRIPT_NAME}.lock"
LOG_FILE="/var/log/${SCRIPT_NAME}.log"
MAX_RUNTIME=3600  # 1 hour in seconds

# Logging function for cron
cron_log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}

# Lock file management
acquire_lock() {
    if [ -f "$LOCK_FILE" ]; then
        local lock_pid=$(cat "$LOCK_FILE" 2>/dev/null)
        
        # Check if process is still running
        if kill -0 "$lock_pid" 2>/dev/null; then
            cron_log "ERROR: Script is already running (PID: $lock_pid)"
            exit 1
        else
            cron_log "WARN: Removing stale lock file"
            rm -f "$LOCK_FILE"
        fi
    fi
    
    # Create lock file with current PID
    echo $ > "$LOCK_FILE"
    cron_log "INFO: Lock acquired (PID: $)"
}

release_lock() {
    rm -f "$LOCK_FILE"
    cron_log "INFO: Lock released"
}

# Timeout handler
timeout_handler() {
    cron_log "ERROR: Script timed out after $MAX_RUNTIME seconds"
    release_lock
    exit 124  # Standard timeout exit code
}

# Cleanup function
cleanup() {
    local exit_code=$?
    release_lock
    cron_log "INFO: Script finished with exit code $exit_code"
    exit $exit_code
}

# Set up signal handlers
trap cleanup EXIT
trap timeout_handler ALRM

# Set timeout
(sleep $MAX_RUNTIME && kill -ALRM $) &
timeout_pid=$!

# Main script logic
main() {
    cron_log "INFO: Script started"
    
    # Your script logic here
    cron_log "INFO: Performing maintenance tasks..."
    
    # Example task
    df -h >> "$LOG_FILE"
    
    # Cancel timeout
    kill $timeout_pid 2>/dev/null
    
    cron_log "INFO: Script completed successfully"
}

# Acquire lock and run main function
acquire_lock
main
```

### **System Update Automation**
```bash
#!/usr/bin/env bash

# Automated system update script
UPDATE_LOG="/var/log/system_updates.log"
REBOOT_REQUIRED_FILE="/var/run/reboot-required"
MAINTENANCE_WINDOW_START=2  # 2 AM
MAINTENANCE_WINDOW_END=6    # 6 AM

# Update functions
check_maintenance_window() {
    local current_hour=$(date +%H)
    local hour_int=$((10#$current_hour))  # Remove leading zero
    
    if [ $hour_int -ge $MAINTENANCE_WINDOW_START ] && [ $hour_int -lt $MAINTENANCE_WINDOW_END ]; then
        return 0  # In maintenance window
    else
        cron_log "Outside maintenance window (current: ${current_hour}:00)"
        return 1  # Outside maintenance window
    fi
}

update_package_lists() {
    cron_log "Updating package lists..."
    
    if apt-get update >> "$UPDATE_LOG" 2>&1; then
        cron_log "Package lists updated successfully"
        return 0
    else
        cron_log "Failed to update package lists"
        return 1
    fi
}

install_security_updates() {
    cron_log "Installing security updates..."
    
    # Install only security updates
    if unattended-upgrade -d >> "$UPDATE_LOG" 2>&1; then
        cron_log "Security updates installed successfully"
        return 0
    else
        cron_log "Failed to install security updates"
        return 1
    fi
}

check_reboot_required() {
    if [ -f "$REBOOT_REQUIRED_FILE" ]; then
        cron_log "Reboot required after updates"
        
        # Send notification
        cat << EOF | mail -s "Reboot Required - $(hostname)" admin@example.com
The system $(hostname) requires a reboot after installing updates.

Reboot will be scheduled for the next maintenance window.

Recent updates:
$(tail -20 "$UPDATE_LOG")
EOF
        
        return 0
    else
        cron_log "No reboot required"
        return 1
    fi
}

perform_reboot() {
    if check_maintenance_window; then
        cron_log "Scheduling reboot in 5 minutes..."
        shutdown -r +5 "System reboot for updates"
    else
        cron_log "Reboot postponed - outside maintenance window"
    fi
}

# Main update routine
run_system_updates() {
    cron_log "=== System Update Process Started ==="
    
    # Check if we're in maintenance window
    if ! check_maintenance_window; then
        exit 0
    fi
    
    # Update package lists
    if ! update_package_lists; then
        exit 1
    fi
    
    # Install security updates
    if install_security_updates; then
        # Check if reboot is required
        if check_reboot_required; then
            perform_reboot
        fi
    fi
    
    cron_log "=== System Update Process Completed ==="
}

# Run updates
run_system_updates
```

---

## **15. Interactive Scripts with Menus and Colors**

### **Color Definitions and Functions**
```bash
#!/usr/bin/env bash

# ANSI Color Codes
declare -A COLORS=(
    [BLACK]='\033[0;30m'
    [RED]='\033[0;31m'
    [GREEN]='\033[0;32m'
    [YELLOW]='\033[0;33m'
    [BLUE]='\033[0;34m'
    [PURPLE]='\033[0;35m'
    [CYAN]='\033[0;36m'
    [WHITE]='\033[0;37m'
    [BOLD]='\033[1m'
    [UNDERLINE]='\033[4m'
    [NC]='\033[0m'  # No Color
)

# Background colors
declare -A BG_COLORS=(
    [BG_BLACK]='\033[40m'
    [BG_RED]='\033[41m'
    [BG_GREEN]='\033[42m'
    [BG_YELLOW]='\033[43m'
    [BG_BLUE]='\033[44m'
    [BG_PURPLE]='\033[45m'
    [BG_CYAN]='\033[46m'
    [BG_WHITE]='\033[47m'
)

# Color printing functions
print_color() {
    local color=$1
    shift
    echo -e "${COLORS[$color]}$*${COLORS[NC]}"
}

print_success() {
    print_color GREEN "✅ $*"
}

print_error() {
    print_color RED "❌ $*"
}

print_warning() {
    print_color YELLOW "⚠️  $*"
}

print_info() {
    print_color BLUE "ℹ️  $*"
}

print_header() {
    echo ""
    print_color BOLD "═══════════════════════════════════════"
    print_color BOLD "  $*"
    print_color BOLD "═══════════════════════════════════════"
    echo ""
}

# Progress bar function
show_progress() {
    local current=$1
    local total=$2
    local width=50
    local percentage=$((current * 100 / total))
    local filled=$((current * width / total))
    local empty=$((width - filled))
    
    printf "\r["
    printf "%${filled}s" | tr ' ' '█'
    printf "%${empty}s" | tr ' ' '░'
    printf "] %d%% (%d/%d)" $percentage $current $total
}

# Spinner function
show_spinner() {
    local pid=$1
    local message=${2:-"Processing..."}
    local delay=0.1
    local spinstr='|/-\'
    
    while kill -0 $pid 2>/dev/null; do
        local temp=${spinstr#?}
        printf "\r%s [%c] " "$message" "$spinstr"
        spinstr=$temp${spinstr%"$temp"}
        sleep $delay
    done
    printf "\r%s [✓] \n" "$message"
}
```

### **Interactive Menu System**
```bash
#!/usr/bin/env bash

# Menu configuration
MENU_TITLE="System Administration Tool"
MENU_OPTIONS=(
    "System Information:show_system_info"
    "Disk Usage:show_disk_usage" 
    "Process Management:manage_processes"
    "Service Management:manage_services"
    "Log Viewer:view_logs"
    "Network Tools:network_tools"
    "File Operations:file_operations"
    "System Monitor:system_monitor"
    "Exit:exit_program"
)

# Clear screen and show header
show_header() {
    clear
    print_color CYAN "${BG_COLORS[BG_BLUE]}                                                    ${COLORS[NC]}"
    print_color CYAN "${BG_COLORS[BG_BLUE]}  🖥️  $MENU_TITLE  ${COLORS[NC]}"
    print_color CYAN "${BG_COLORS[BG_BLUE]}                                                    ${COLORS[NC]}"
    echo ""
}

# Display menu options
show_menu() {
    show_header
    
    print_info "Please select an option:"
    echo ""
    
    local index=1
    for option in "${MENU_OPTIONS[@]}"; do
        local description=${option%:*}
        printf "  %s%2d%s) %s\n" "${COLORS[YELLOW]}" $index "${COLORS[NC]}" "$description"
        ((index++))
    done
    
    echo ""
    printf "Enter your choice [1-${#MENU_OPTIONS[@]}]: "
}

# Get user choice
get_user_choice() {
    local choice
    read choice
    
    # Validate input
    if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le ${#MENU_OPTIONS[@]} ]; then
        return $((choice - 1))
    else
        print_error "Invalid choice. Please try again."
        read -p "Press Enter to continue..."
        return -1
    fi
}

# Execute menu option
execute_option() {
    local index=$1
    local option=${MENU_OPTIONS[$index]}
    local function_name=${option#*:}
    
    # Call the corresponding function
    $function_name
}

# Menu option functions
show_system_info() {
    print_header "System Information"
    
    print_info "Hostname: $(hostname)"
    print_info "Operating System: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
    print_info "Kernel: $(uname -r)"
    print_info "Architecture: $(uname -m)"
    print_info "Uptime: $(uptime -p)"
    print_info "Load Average: $(uptime | awk '{print $10 $11 $12}')"
    
    echo ""
    print_info "Memory Information:"
    free -h | while read line; do
        echo "  $line"
    done
    
    echo ""
    read -p "Press Enter to continue..."
}

show_disk_usage() {
    print_header "Disk Usage"
    
    print_info "Filesystem usage:"
    df -h | while read line; do
        if [[ $line == *"%"* ]]; then
            local usage=$(echo $line | awk '{print $5}' | sed 's/%//')
            if [ "$usage" -gt 80 ]; then
                print_error "$line"
            elif [ "$usage" -gt 60 ]; then
                print_warning "$line"
            else
                print_success "$line"
            fi
        else
            echo "$line"
        fi
    done
    
    echo ""
    read -p "Press Enter to continue..."
}

manage_processes() {
    print_header "Process Management"
    
    print_info "Top 10 processes by CPU usage:"
    ps aux --sort=-%cpu | head -11 | while IFS= read -r line; do
        echo "  $line"
    done
    
    echo ""
    print_info "Top 10 processes by memory usage:"
    ps aux --sort=-%mem | head -11 | while IFS= read -r line; do
        echo "  $line"
    done
    
    echo ""
    read -p "Press Enter to continue..."
}

manage_services() {
    print_header "Service Management"
    
    local services=("ssh" "nginx" "apache2" "mysql" "postgresql")
    
    print_info "Service Status:"
    for service in "${services[@]}"; do
        if systemctl is-active --quiet "$service"; then
            print_success "$service is running"
        else
            print_error "$service is not running"
        fi
    done
    
    echo ""
    read -p "Enter service name to manage (or press Enter to continue): " service_name
    
    if [ -n "$service_name" ]; then
        service_menu "$service_name"
    fi
}

service_menu() {
    local service_name=$1
    
    while true; do
        clear
        print_header "Managing Service: $service_name"
        
        if systemctl is-active --quiet "$service_name"; then
            print_success "Service is currently running"
        else
            print_error "Service is currently stopped"
        fi
        
        echo ""
        echo "1) Start service"
        echo "2) Stop service"
        echo "3) Restart service"
        echo "4) Check status"
        echo "5) View logs"
        echo "6) Back to main menu"
        echo ""
        
        read -p "Enter your choice [1-6]: " choice
        
        case $choice in
            1)
                print_info "Starting $service_name..."
                if sudo systemctl start "$service_name"; then
                    print_success "Service started successfully"
                else
                    print_error "Failed to start service"
                fi
                ;;
            2)
                print_info "Stopping $service_name..."
                if sudo systemctl stop "$service_name"; then
                    print_success "Service stopped successfully"
                else
                    print_error "Failed to stop service"
                fi
                ;;
            3)
                print_info "Restarting $service_name..."
                if sudo systemctl restart "$service_name"; then
                    print_success "Service restarted successfully"
                else
                    print_error "Failed to restart service"
                fi
                ;;
            4)
                print_info "Service status:"
                systemctl status "$service_name" --no-pager
                ;;
            5)
                print_info "Recent logs for $service_name:"
                journalctl -u "$service_name" --no-pager -n 20
                ;;
            6)
                return
                ;;
            *)
                print_error "Invalid choice"
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

view_logs() {
    print_header "Log Viewer"
    
    local log_files=("/var/log/syslog" "/var/log/auth.log" "/var/log/nginx/error.log" "/var/log/apache2/error.log")
    
    print_info "Available log files:"
    local index=1
    for log_file in "${log_files[@]}"; do
        if [ -f "$log_file" ]; then
            echo "$index) $log_file"
            ((index++))
        fi
    done
    
    echo ""
    read -p "Enter log file number (or full path): " choice
    
    if [[ "$choice" =~ ^[0-9]+$ ]]; then
        local selected_log=${log_files[$((choice-1))]}
        if [ -f "$selected_log" ]; then
            print_info "Showing last 50 lines of $selected_log:"
            tail -50 "$selected_log"
        else
            print_error "Log file not found"
        fi
    elif [ -f "$choice" ]; then
        print_info "Showing last 50 lines of $choice:"
        tail -50 "$choice"
    else
        print_error "Invalid choice or file not found"
    fi
    
    echo ""
    read -p "Press Enter to continue..."
}

network_tools() {
    print_header "Network Tools"
    
    print_info "Network interface information:"
    ip addr show | grep -E "^[0-9]|inet " | while read line; do
        echo "  $line"
    done
    
    echo ""
    print_info "Active network connections:"
    netstat -tuln | head -10
    
    echo ""
    read -p "Enter hostname/IP to ping (or press Enter to skip): " target
    
    if [ -n "$target" ]; then
        print_info "Pinging $target..."
        ping -c 4 "$target"
    fi
    
    echo ""
    read -p "Press Enter to continue..."
}

file_operations() {
    print_header "File Operations"
    
    echo "1) Find large files"
    echo "2) Find files by name"
    echo "3) Show directory sizes"
    echo "4) File permissions check"
    echo ""
    
    read -p "Enter your choice [1-4]: " choice
    
    case $choice in
        1)
            read -p "Enter directory to search (default: /): " search_dir
            search_dir=${search_dir:-/}
            print_info "Finding files larger than 100MB in $search_dir..."
            find "$search_dir" -type f -size +100M -exec ls -lh {} \; 2>/dev/null | head -20
            ;;
        2)
            read -p "Enter filename pattern: " pattern
            read -p "Enter directory to search (default: .): " search_dir
            search_dir=${search_dir:-.}
            print_info "Searching for files matching '$pattern' in $search_dir..."
            find "$search_dir" -name "*$pattern*" -type f 2>/dev/null | head -20
            ;;
        3)
            read -p "Enter directory (default: .): " target_dir
            target_dir=${target_dir:-.}
            print_info "Directory sizes in $target_dir:"
            du -sh "$target_dir"/* 2>/dev/null | sort -hr | head -10
            ;;
        4)
            read -p "Enter file/directory path: " target_path
            if [ -e "$target_path" ]; then
                print_info "Permissions for $target_path:"
                ls -la "$target_path"
            else
                print_error "Path not found: $target_path"
            fi
            ;;
        *)
            print_error "Invalid choice"
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
}

system_monitor() {
    print_header "System Monitor"
    
    print_info "System monitoring (press Ctrl+C to stop)..."
    echo ""
    
    # Real-time monitoring loop
    while true; do
        clear
        print_header "System Monitor - $(date)"
        
        # CPU usage
        local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
        print_info "CPU Usage: ${cpu_usage}%"
        
        # Memory usage
        local memory_info=$(free | grep Mem)
        local total=$(echo $memory_info | awk '{print $2}')
        local used=$(echo $memory_info | awk '{print $3}')
        local usage_percent=$((used * 100 / total))
        print_info "Memory Usage: ${usage_percent}%"
        
        # Disk usage
        local disk_usage=$(df / | tail -1 | awk '{print $5}')
        print_info "Disk Usage: $disk_usage"
        
        # Load average
        local load=$(uptime | awk '{print $10 $11 $12}')
        print_info "Load Average: $load"
        
        # Top processes
        echo ""
        print_info "Top 5 processes by CPU:"
        ps aux --sort=-%cpu | head -6 | tail -5
        
        echo ""
        print_info "Press Ctrl+C to return to main menu"
        sleep 5
    done
}

exit_program() {
    clear
    print_header "Thank You!"
    print_success "Have a great day! 👋"
    echo ""
    exit 0
}

# Main program loop
main() {
    while true; do
        show_menu
        
        if get_user_choice; then
            local choice=$?
            execute_option $choice
        fi
    done
}

# Handle Ctrl+C gracefully
trap 'echo ""; print_info "Returning to main menu..."; sleep 1' INT

# Start the program
main
```

### **Configuration Wizard**
```bash
#!/usr/bin/env bash

# Interactive configuration wizard
CONFIG_FILE="/etc/myapp.conf"
TEMP_CONFIG="/tmp/myapp_config_$"

# Configuration wizard functions
welcome_screen() {
    clear
    print_header "Application Configuration Wizard"
    
    cat << EOF
Welcome to the configuration wizard!

This wizard will help you set up your application with the
following components:

🔧 Database Configuration
🌐 Network Settings  
📧 Email Configuration
🔐 Security Settings
📝 Logging Configuration

Press Enter to continue or Ctrl+C to exit...
EOF
    
    read
}

configure_database() {
    print_header "Database Configuration"
    
    echo "Please provide your database connection details:"
    echo ""
    
    read -p "Database Host [localhost]: " db_host
    db_host=${db_host:-localhost}
    
    read -p "Database Port [5432]: " db_port
    db_port=${db_port:-5432}
    
    read -p "Database Name: " db_name
    while [ -z "$db_name" ]; do
        print_error "Database name is required"
        read -p "Database Name: " db_name
    done
    
    read -p "Database User: " db_user
    while [ -z "$db_user" ]; do
        print_error "Database user is required"
        read -p "Database User: " db_user
    done
    
    read -s -p "Database Password: " db_password
    echo ""
    while [ -z "$db_password" ]; do
        print_error "Database password is required"
        read -s -p "Database Password: " db_password
        echo ""
    done
    
    # Test database connection
    print_info "Testing database connection..."
    
    # Simulate connection test
    sleep 2
    if ping -c 1 "$db_host" >/dev/null 2>&1; then
        print_success "Database connection test passed"
    else
        print_warning "Could not reach database host (configuration saved anyway)"
    fi
    
    # Save to temp config
    cat >> "$TEMP_CONFIG" << EOF
# Database Configuration
DB_HOST=$db_host
DB_PORT=$db_port
DB_NAME=$db_name
DB_USER=$db_user
DB_PASSWORD=$db_password

EOF
}

configure_network() {
    print_header "Network Configuration"
    
    echo "Configure network settings:"
    echo ""
    
    read -p "Listen Address [0.0.0.0]: " listen_addr
    listen_addr=${listen_addr:-0.0.0.0}
    
    read -p "Listen Port [8080]: " listen_port
    listen_port=${listen_port:-8080}
    
    # Validate port number
    while ! [[ "$listen_port" =~ ^[0-9]+$ ]] || [ "$listen_port" -lt 1 ] || [ "$listen_port" -gt 65535 ]; do
        print_error "Invalid port number (1-65535)"
        read -p "Listen Port [8080]: " listen_port
        listen_port=${listen_port:-8080}
    done
    
    echo ""
    echo "SSL Configuration:"
    read -p "Enable SSL? [y/N]: " enable_ssl
    
    if [[ "$enable_ssl" =~ ^[Yy] ]]; then
        read -p "SSL Certificate Path: " ssl_cert
        read -p "SSL Private Key Path: " ssl_key
        
        # Validate SSL files
        if [ -f "$ssl_cert" ] && [ -f "$ssl_key" ]; then
            print_success "SSL certificate files found"
        else
            print_warning "SSL files not found (configuration saved anyway)"
        fi
        
        cat >> "$TEMP_CONFIG" << EOF
# Network Configuration
LISTEN_ADDRESS=$listen_addr
LISTEN_PORT=$listen_port
ENABLE_SSL=true
SSL_CERTIFICATE=$ssl_cert
SSL_PRIVATE_KEY=$ssl_key

EOF
    else
        cat >> "$TEMP_CONFIG" << EOF
# Network Configuration
LISTEN_ADDRESS=$listen_addr
LISTEN_PORT=$listen_port
ENABLE_SSL=false

EOF
    fi
}

configure_email() {
    print_header "Email Configuration"
    
    echo "Configure email settings for notifications:"
    echo ""
    
    read -p "SMTP Server: " smtp_server
    read -p "SMTP Port [587]: " smtp_port
    smtp_port=${smtp_port:-587}
    
    read -p "SMTP Username: " smtp_user
    read -s -p "SMTP Password: " smtp_password
    echo ""
    
    read -p "From Email Address: " from_email
    read -p "Admin Email Address: " admin_email
    
    # Test email configuration
    read -p "Send test email? [y/N]: " send_test
    
    if [[ "$send_test" =~ ^[Yy] ]]; then
        print_info "Sending test email..."
        # Simulate sending email
        sleep 2
        print_success "Test email sent successfully"
    fi
    
    cat >> "$TEMP_CONFIG" << EOF
# Email Configuration
SMTP_SERVER=$smtp_server
SMTP_PORT=$smtp_port
SMTP_USER=$smtp_user
SMTP_PASSWORD=$smtp_password
FROM_EMAIL=$from_email
ADMIN_EMAIL=$admin_email

EOF
}

configure_security() {
    print_header "Security Configuration"
    
    echo "Configure security settings:"
    echo ""
    
    # Generate random secret key
    local secret_key=$(openssl rand -hex 32)
    print_info "Generated secret key: $secret_key"
    
    read -p "Session timeout (minutes) [30]: " session_timeout
    session_timeout=${session_timeout:-30}
    
    echo ""
    echo "Authentication method:"
    echo "1) Local authentication"
    echo "2) LDAP authentication"
    echo "3) OAuth authentication"
    
    read -p "Select authentication method [1]: " auth_method
    auth_method=${auth_method:-1}
    
    case $auth_method in
        1)
            auth_type="local"
            ;;
        2)
            auth_type="ldap"
            read -p "LDAP Server: " ldap_server
            read -p "LDAP Base DN: " ldap_base_dn
            ;;
        3)
            auth_type="oauth"
            read -p "OAuth Provider: " oauth_provider
            read -p "OAuth Client ID: " oauth_client_id
            read -s -p "OAuth Client Secret: " oauth_client_secret
            echo ""
            ;;
        *)
            auth_type="local"
            ;;
    esac
    
    cat >> "$TEMP_CONFIG" << EOF
# Security Configuration
SECRET_KEY=$secret_key
SESSION_TIMEOUT=$session_timeout
AUTH_TYPE=$auth_type
EOF
    
    case $auth_type in
        ldap)
            cat >> "$TEMP_CONFIG" << EOF
LDAP_SERVER=$ldap_server
LDAP_BASE_DN=$ldap_base_dn
EOF
            ;;
        oauth)
            cat >> "$TEMP_CONFIG" << EOF
OAUTH_PROVIDER=$oauth_provider
OAUTH_CLIENT_ID=$oauth_client_id
OAUTH_CLIENT_SECRET=$oauth_client_secret
EOF
            ;;
    esac
    
    echo "" >> "$TEMP_CONFIG"
}

configure_logging() {
    print_header "Logging Configuration"
    
    echo "Configure logging settings:"
    echo ""
    
    read -p "Log Level (DEBUG/INFO/WARN/ERROR) [INFO]: " log_level
    log_level=${log_level:-INFO}
    
    read -p "Log File Path [/var/log/myapp.log]: " log_file
    log_file=${log_file:-/var/log/myapp.log}
    
    read -p "Max Log File Size (MB) [100]: " max_log_size
    max_log_size=${max_log_size:-100}
    
    read -p "Log Retention Days [30]: " log_retention
    log_retention=${log_retention:-30}
    
    # Create log directory if it doesn't exist
    local log_dir=$(dirname "$log_file")
    if [ ! -d "$log_dir" ]; then
        print_info "Creating log directory: $log_dir"
        sudo mkdir -p "$log_dir"
    fi
    
    cat >> "$TEMP_CONFIG" << EOF
# Logging Configuration
LOG_LEVEL=$log_level
LOG_FILE=$log_file
MAX_LOG_SIZE=${max_log_size}M
LOG_RETENTION=$log_retention

EOF
}

review_configuration() {
    print_header "Configuration Review"
    
    echo "Please review your configuration:"
    echo ""
    
    # Display configuration with colors
    while IFS= read -r line; do
        if [[ "$line" =~ ^# ]]; then
            print_color CYAN "$line"
        elif [[ "$line" =~ ^[A-Z_]+=.* ]]; then
            local key=${line%=*}
            local value=${line#*=}
            printf "%-20s = %s\n" "$key" "$value"
        else
            echo "$line"
        fi
    done < "$TEMP_CONFIG"
    
    echo ""
    read -p "Save this configuration? [Y/n]: " save_config
    
    if [[ ! "$save_config" =~ ^[Nn] ]]; then
        # Backup existing configuration
        if [ -f "$CONFIG_FILE" ]; then
            print_info "Backing up existing configuration..."
            sudo cp "$CONFIG_FILE" "${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
        fi
        
        # Save new configuration
        print_info "Saving configuration to $CONFIG_FILE..."
        sudo cp "$TEMP_CONFIG" "$CONFIG_FILE"
        sudo chmod 600 "$CONFIG_FILE"
        
        print_success "Configuration saved successfully!"
        
        # Clean up
        rm -f "$TEMP_CONFIG"
        
        return 0
    else
        print_warning "Configuration not saved"
        return 1
    fi
}

# Main wizard flow
run_wizard() {
    welcome_screen
    configure_database
    configure_network
    configure_email
    configure_security
    configure_logging
    
    if review_configuration; then
        print_header "Configuration Complete!"
        print_success "Your application has been configured successfully."
        print_info "Configuration file: $CONFIG_FILE"
        echo ""
        print_info "You can now start your application or make manual adjustments to the configuration file."
    else
        print_header "Configuration Cancelled"
        print_warning "Configuration was not saved. You can# **Linux Shell Scripting - Complete Hands-On Guide**
```
---

# **PART 4: BEST PRACTICES & REAL-WORLD EXAMPLES**

## **📋 What You'll Learn in Part 4**
- Best Practices for Writing Maintainable Scripts
- Creating a Library of Reusable Shell Scripts
- Real-World Examples
- Advanced Security and Performance Tips
- Professional Script Templates

---

## **16. Best Practices for Writing Maintainable Scripts**

### **Script Organization and Structure**

#### **Professional Script Template**
```bash
#!/usr/bin/env bash

#############################################################################
# Script Name: professional_template.sh
# Description: Professional shell script template with best practices
# Author: Your Name <your.email@example.com>
# Version: 1.0.0
# Date: $(date +%Y-%m-%d)
# License: MIT
# 
# Usage: ./professional_template.sh [OPTIONS] <arguments>
# 
# Examples:
#   ./professional_template.sh --verbose --config /path/to/config
#   ./professional_template.sh -h
#
# Dependencies:
#   - bash 4.0+
#   - curl
#   - jq
#
# Exit Codes:
#   0 - Success
#   1 - General error
#   2 - Invalid arguments
#   3 - Configuration error
#   4 - Network error
#############################################################################

# Strict error handling
set -euo pipefail

# Enable debug mode if DEBUG environment variable is set
[[ "${DEBUG:-false}" == "true" ]] && set -x

#============================================================================
# GLOBAL VARIABLES AND CONFIGURATION
#============================================================================

readonly SCRIPT_NAME=$(basename "$0")
readonly SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
readonly SCRIPT_VERSION="1.0.0"
readonly SCRIPT_AUTHOR="Your Name"

# Default configuration
DEFAULT_CONFIG_FILE="/etc/${SCRIPT_NAME%.*}.conf"
DEFAULT_LOG_LEVEL="INFO"
DEFAULT_TIMEOUT=30

# Runtime variables
VERBOSE=false
DRY_RUN=false
CONFIG_FILE="$DEFAULT_CONFIG_FILE"
LOG_LEVEL="$DEFAULT_LOG_LEVEL"
TIMEOUT="$DEFAULT_TIMEOUT"

# Color codes for output
if [[ -t 1 ]]; then
    readonly RED='\033[0;31m'
    readonly GREEN='\033[0;32m'
    readonly YELLOW='\033[0;33m'
    readonly BLUE='\033[0;34m'
    readonly PURPLE='\033[0;35m'
    readonly CYAN='\033[0;36m'
    readonly WHITE='\033[0;37m'
    readonly BOLD='\033[1m'
    readonly NC='\033[0m'
else
    readonly RED=''
    readonly GREEN=''
    readonly YELLOW=''
    readonly BLUE=''
    readonly PURPLE=''
    readonly CYAN=''
    readonly WHITE=''
    readonly BOLD=''
    readonly NC=''
fi

#============================================================================
# UTILITY FUNCTIONS
#============================================================================

# Logging functions
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        ERROR)
            echo -e "${timestamp} [${RED}ERROR${NC}] $message" >&2
            ;;
        WARN)
            echo -e "${timestamp} [${YELLOW}WARN${NC}] $message" >&2
            ;;
        INFO)
            echo -e "${timestamp} [${GREEN}INFO${NC}] $message"
            ;;
        DEBUG)
            [[ "$LOG_LEVEL" == "DEBUG" ]] && echo -e "${timestamp} [${BLUE}DEBUG${NC}] $message"
            ;;
    esac
}

log_error() { log ERROR "$@"; }
log_warn() { log WARN "$@"; }
log_info() { log INFO "$@"; }
log_debug() { log DEBUG "$@"; }

# Error handling
die() {
    log_error "$@"
    exit 1
}

# Cleanup function
cleanup() {
    local exit_code=$?
    log_debug "Cleaning up before exit (code: $exit_code)"
    
    # Remove temporary files
    [[ -n "${TEMP_DIR:-}" ]] && rm -rf "$TEMP_DIR"
    
    # Kill background processes if any
    # jobs -p | xargs -r kill
    
    exit $exit_code
}

# Set up signal handlers
trap cleanup EXIT
trap 'die "Script interrupted by user"' INT TERM

#============================================================================
# CONFIGURATION MANAGEMENT
#============================================================================

# Load configuration file
load_config() {
    local config_file=${1:-$CONFIG_FILE}
    
    if [[ -f "$config_file" ]]; then
        log_debug "Loading configuration from: $config_file"
        
        # Source the config file in a subshell to validate syntax
        if bash -n "$config_file"; then
            source "$config_file"
            log_info "Configuration loaded successfully"
        else
            die "Invalid configuration file syntax: $config_file"
        fi
    else
        log_warn "Configuration file not found: $config_file"
        log_info "Using default configuration"
    fi
}

# Validate configuration
validate_config() {
    log_debug "Validating configuration"
    
    # Example validations
    [[ -n "${API_KEY:-}" ]] || die "API_KEY not configured"
    [[ "$TIMEOUT" =~ ^[0-9]+$ ]] || die "Invalid TIMEOUT value: $TIMEOUT"
    
    log_info "Configuration validation passed"
}

#============================================================================
# COMMAND LINE ARGUMENT PARSING
#============================================================================

show_usage() {
    cat << EOF
${BOLD}$SCRIPT_NAME${NC} - Professional shell script template

${BOLD}USAGE:${NC}
    $SCRIPT_NAME [OPTIONS] <command> [arguments...]

${BOLD}OPTIONS:${NC}
    -c, --config FILE     Configuration file (default: $DEFAULT_CONFIG_FILE)
    -v, --verbose         Enable verbose output
    -d, --dry-run         Show what would be done without executing
    -l, --log-level LEVEL Set log level (DEBUG|INFO|WARN|ERROR)
    -t, --timeout SEC     Timeout in seconds (default: $DEFAULT_TIMEOUT)
    -h, --help            Show this help message
    -V, --version         Show version information

${BOLD}COMMANDS:${NC}
    process               Process data
    validate              Validate configuration
    backup                Create backup
    restore               Restore from backup

${BOLD}EXAMPLES:${NC}
    $SCRIPT_NAME --verbose process --input data.txt
    $SCRIPT_NAME --dry-run backup --destination /backup
    $SCRIPT_NAME --config custom.conf validate

${BOLD}AUTHOR:${NC}
    $SCRIPT_AUTHOR

${BOLD}VERSION:${NC}
    $SCRIPT_VERSION
EOF
}

show_version() {
    echo "$SCRIPT_NAME version $SCRIPT_VERSION"
}

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -c|--config)
                CONFIG_FILE="$2"
                shift 2
                ;;
            -v|--verbose)
                VERBOSE=true
                LOG_LEVEL="DEBUG"
                shift
                ;;
            -d|--dry-run)
                DRY_RUN=true
                shift
                ;;
            -l|--log-level)
                LOG_LEVEL="$2"
                shift 2
                ;;
            -t|--timeout)
                TIMEOUT="$2"
                shift 2
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            -V|--version)
                show_version
                exit 0
                ;;
            --)
                shift
                break
                ;;
            -*)
                die "Unknown option: $1"
                ;;
            *)
                # First non-option argument is the command
                COMMAND="$1"
                shift
                COMMAND_ARGS=("$@")
                break
                ;;
        esac
    done
    
    # Validate required arguments
    [[ -n "${COMMAND:-}" ]] || die "No command specified. Use -h for help."
}

#============================================================================
# BUSINESS LOGIC FUNCTIONS
#============================================================================

# Function to process data
process_data() {
    local input_file=${1:-}
    local output_file=${2:-}
    
    log_info "Processing data from $input_file to $output_file"
    
    # Validate inputs
    [[ -n "$input_file" ]] || die "Input file not specified"
    [[ -f "$input_file" ]] || die "Input file not found: $input_file"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Would process $input_file"
        return 0
    fi
    
    # Create temporary working directory
    TEMP_DIR=$(mktemp -d)
    log_debug "Created temporary directory: $TEMP_DIR"
    
    # Actual processing logic here
    log_info "Processing completed successfully"
}

# Function to validate system
validate_system() {
    log_info "Validating system configuration"
    
    local errors=0
    
    # Check required commands
    local required_commands=("curl" "jq" "tar" "gzip")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" >/dev/null 2>&1; then
            log_error "Required command not found: $cmd"
            ((errors++))
        fi
    done
    
    # Check required directories
    local required_dirs=("/tmp" "/var/log")
    for dir in "${required_dirs[@]}"; do
        if [[ ! -d "$dir" ]]; then
            log_error "Required directory not found: $dir"
            ((errors++))
        fi
    done
    
    # Check disk space
    local available_space=$(df /tmp | tail -1 | awk '{print $4}')
    if [[ "$available_space" -lt 1048576 ]]; then  # 1GB in KB
        log_warn "Low disk space in /tmp: ${available_space}KB"
    fi
    
    if [[ "$errors" -eq 0 ]]; then
        log_info "System validation passed"
        return 0
    else
        log_error "System validation failed with $errors errors"
        return 1
    fi
}

# Function to create backup
create_backup() {
    local destination=${1:-}
    
    log_info "Creating backup to $destination"
    
    [[ -n "$destination" ]] || die "Backup destination not specified"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Would create backup to $destination"
        return 0
    fi
    
    # Backup logic here
    log_info "Backup created successfully"
}

# Function to restore from backup
restore_backup() {
    local source=${1:-}
    
    log_info "Restoring from backup: $source"
    
    [[ -n "$source" ]] || die "Backup source not specified"
    [[ -f "$source" ]] || die "Backup file not found: $source"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Would restore from $source"
        return 0
    fi
    
    # Restore logic here
    log_info "Restore completed successfully"
}

#============================================================================
# MAIN EXECUTION
#============================================================================

main() {
    log_info "Starting $SCRIPT_NAME v$SCRIPT_VERSION"
    
    # Parse command line arguments
    parse_arguments "$@"
    
    # Load and validate configuration
    load_config
    validate_config
    
    # Validate system
    validate_system || die "System validation failed"
    
    # Execute command
    case "$COMMAND" in
        process)
            process_data "${COMMAND_ARGS[@]:-}"
            ;;
        validate)
            log_info "Configuration and system validation completed"
            ;;
        backup)
            create_backup "${COMMAND_ARGS[@]:-}"
            ;;
        restore)
            restore_backup "${COMMAND_ARGS[@]:-}"
            ;;
        *)
            die "Unknown command: $COMMAND"
            ;;
    esac
    
    log_info "$SCRIPT_NAME completed successfully"
}

# Execute main function with all arguments
main "$@"
```

### **Code Quality and Standards**

#### **Shell Script Linting and Validation**
```bash
#!/usr/bin/env bash

# Script quality checker
check_script_quality() {
    local script_file=$1
    
    echo "🔍 Checking script quality for: $script_file"
    echo "=============================================="
    
    # Check if file exists and is executable
    if [[ ! -f "$script_file" ]]; then
        echo "❌ Script file not found"
        return 1
    fi
    
    # Syntax check
    echo "📝 Checking syntax..."
    if bash -n "$script_file"; then
        echo "✅ Syntax check passed"
    else
        echo "❌ Syntax errors found"
        return 1
    fi
    
    # ShellCheck analysis (if available)
    if command -v shellcheck >/dev/null 2>&1; then
        echo "🔧 Running ShellCheck analysis..."
        if shellcheck "$script_file"; then
            echo "✅ ShellCheck passed"
        else
            echo "⚠️  ShellCheck found issues"
        fi
    else
        echo "ℹ️  ShellCheck not available (install for better analysis)"
    fi
    
    # Check for common best practices
    echo "📋 Checking best practices..."
    
    # Check for shebang
    if head -1 "$script_file" | grep -q "^#!/"; then
        echo "✅ Shebang present"
    else
        echo "❌ Missing shebang"
    fi
    
    # Check for set -euo pipefail
    if grep -q "set -euo pipefail\|set -[euo]*e[uo]*o[ue]*" "$script_file"; then
        echo "✅ Strict error handling enabled"
    else
        echo "⚠️  Consider adding 'set -euo pipefail'"
    fi
    
    # Check for quoted variables
    local unquoted_vars=$(grep -c '\$[A-Za-z_][A-Za-z0-9_]*[^"]' "$script_file" || true)
    if [[ "$unquoted_vars" -gt 0 ]]; then
        echo "⚠️  Found $unquoted_vars potentially unquoted variables"
    else
        echo "✅ Variables appear to be properly quoted"
    fi
    
    # Check for functions
    local function_count=$(grep -c "^[a-zA-Z_][a-zA-Z0-9_]*() {" "$script_file" || true)
    echo "ℹ️  Functions defined: $function_count"
    
    # Check script length
    local line_count=$(wc -l < "$script_file")
    echo "ℹ️  Script length: $line_count lines"
    
    if [[ "$line_count" -gt 500 ]]; then
        echo "⚠️  Script is quite long ($line_count lines) - consider breaking into modules"
    fi
    
    echo "✅ Quality check completed"
}

# Script formatting function
format_script() {
    local script_file=$1
    local backup_file="${script_file}.backup.$(date +%Y%m%d_%H%M%S)"
    
    echo "🎨 Formatting script: $script_file"
    
    # Create backup
    cp "$script_file" "$backup_file"
    echo "📦 Backup created: $backup_file"
    
    # Apply formatting rules
    
    # 1. Standardize indentation (convert tabs to 4 spaces)
    sed -i 's/\t/    /g' "$script_file"
    
    # 2. Remove trailing whitespace
    sed -i 's/[[:space:]]*$//' "$script_file"
    
    # 3. Ensure single blank line at end of file
    sed -i -e '$a\' "$script_file"
    
    # 4. Add spaces around operators (basic cases)
    sed -i 's/\([^=!<>]\)=\([^=]\)/\1 = \2/g' "$script_file"
    
    echo "✅ Formatting completed"
    echo "💡 Review changes and remove backup if satisfied"
}

# Documentation generator
generate_documentation() {
    local script_file=$1
    local doc_file="${script_file%.*}.md"
    
    echo "📚 Generating documentation for: $script_file"
    
    # Extract information from script
    local script_name=$(basename "$script_file")
    local description=$(grep "^# Description:" "$script_file" | cut -d':' -f2- | sed 's/^ *//')
    local author=$(grep "^# Author:" "$script_file" | cut -d':' -f2- | sed 's/^ *//')
    local version=$(grep "^# Version:" "$script_file" | cut -d':' -f2- | sed 's/^ *//')
    
    # Generate markdown documentation
    cat > "$doc_file" << EOF
# $script_name

## Description
${description:-"No description available"}

## Author
${author:-"Unknown"}

## Version
${version:-"Unknown"}

## Usage
\`\`\`bash
./$script_name [options] [arguments]
\`\`\`

## Functions
EOF
    
    # Extract function documentation
    grep -n "^[a-zA-Z_][a-zA-Z0-9_]*() {" "$script_file" | while IFS=: read -r line_num function_def; do
        local func_name=$(echo "$function_def" | sed 's/() {.*//')
        
        # Look for comments above the function
        local comment_lines=""
        local i=$((line_num - 1))
        while [[ $i -gt 0 ]]; do
            local prev_line=$(sed -n "${i}p" "$script_file")
            if [[ "$prev_line" =~ ^[[:space:]]*# ]]; then
                comment_lines="$prev_line\n$comment_lines"
                ((i--))
            else
                break
            fi
        done
        
        echo "" >> "$doc_file"
        echo "### $func_name" >> "$doc_file"
        echo "" >> "$doc_file"
        
        if [[ -n "$comment_lines" ]]; then
            echo -e "$comment_lines" | sed 's/^[[:space:]]*# //' >> "$doc_file"
        else
            echo "No documentation available." >> "$doc_file"
        fi
    done
    
    echo "✅ Documentation generated: $doc_file"
}

# Performance profiler
profile_script() {
    local script_file=$1
    shift
    local script_args=("$@")
    
    echo "⚡ Profiling script performance: $script_file"
    echo "============================================="
    
    # Run with time and detailed output
    echo "🔍 Running performance analysis..."
    
    {
        echo "Script: $script_file"
        echo "Arguments: ${script_args[*]}"
        echo "Start time: $(date)"
        echo ""
        
        # Run the script with timing
        time "$script_file" "${script_args[@]}" 2>&1
        
        echo ""
        echo "End time: $(date)"
    } | tee "profile_${script_file##*/}_$(date +%Y%m%d_%H%M%S).log"
    
    echo "✅ Performance profile saved"
}

# Usage examples
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    case "${1:-help}" in
        check)
            check_script_quality "$2"
            ;;
        format)
            format_script "$2"
            ;;
        document)
            generate_documentation "$2"
            ;;
        profile)
            shift
            profile_script "$@"
            ;;
        *)
            echo "Usage: $0 {check|format|document|profile} <script_file> [args...]"
            echo ""
            echo "Commands:"
            echo "  check    - Check script quality and best practices"
            echo "  format   - Format and clean up script"
            echo "  document - Generate documentation from script"
            echo "  profile  - Profile script performance"
            exit 1
            ;;
    esac
fi
```

---

## **17. Creating a Library of Reusable Shell Scripts**

### **Common Utility Library**
```bash
#!/usr/bin/env bash

# common_utils.sh - Reusable utility functions library
# Source this file in other scripts: source /path/to/common_utils.sh

#============================================================================
# STRING UTILITIES
#============================================================================

# Convert string to lowercase
str_lower() {
    echo "$1" | tr '[:upper:]' '[:lower:]'
}

# Convert string to uppercase
str_upper() {
    echo "$1" | tr '[:lower:]' '[:upper:]'
}

# Trim whitespace from string
str_trim() {
    echo "$1" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
}

# Check if string contains substring
str_contains() {
    local string="$1"
    local substring="$2"
    [[ "$string" == *"$substring"* ]]
}

# Generate random string
str_random() {
    local length=${1:-8}
    local charset=${2:-'a-zA-Z0-9'}
    tr -dc "$charset" < /dev/urandom | head -c "$length"
}

# URL encode string
str_urlencode() {
    local string="$1"
    local length="${#string}"
    for (( i = 0; i < length; i++ )); do
        local char="${string:i:1}"
        case $char in
            [a-zA-Z0-9.~_-]) printf '%s' "$char" ;;
            *) printf '%%%02X' "'$char" ;;
        esac
    done
}

#============================================================================
# FILE UTILITIES
#============================================================================

# Check if file is older than specified days
file_older_than() {
    local file="$1"
    local days="$2"
    
    [[ -f "$file" ]] || return 1
    
    local file_age=$(( ($(date +%s) - $(stat -c %Y "$file")) / 86400 ))
    [[ $file_age -gt $days ]]
}

# Get file size in human readable format
file_size() {
    local file="$1"
    [[ -f "$file" ]] || return 1
    
    if command -v numfmt >/dev/null 2>&1; then
        stat -c%s "$file" | numfmt --to=iec
    else
        ls -lh "$file" | awk '{print $5}'
    fi
}

# Create backup of file with timestamp
file_backup() {
    local file="$1"
    local backup_dir="${2:-$(dirname "$file")}"
    
    [[ -f "$file" ]] || return 1
    
    local basename=$(basename "$file")
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$backup_dir/${basename}.backup.$timestamp"
    
    cp "$file" "$backup_file" && echo "$backup_file"
}

# Rotate log files
file_rotate() {
    local file="$1"
    local max_files="${2:-5}"
    
    [[ -f "$file" ]] || return 1
    
    # Rotate existing backups
    for i in $(seq $((max_files - 1)) -1 1); do
        [[ -f "$file.$i" ]] && mv "$file.$i" "$file.$((i + 1))"
    done
    
    # Move current file to .1
    mv "$file" "$file.1"
    
    # Remove oldest backup if it exceeds max files
    [[ -f "$file.$max_files" ]] && rm "$file.$max_files"
    
    # Create new empty file
    touch "$file"
}

#============================================================================
# NETWORK UTILITIES
#============================================================================

# Check if host is reachable
net_ping() {
    local host="$1"
    local timeout="${2:-5}"
    ping -c 1 -W "$timeout" "$host" >/dev/null 2>&1
}

# Check if port is open
net_port_open() {
    local host="$1"
    local port="$2"
    local timeout="${3:-5}"
    
    timeout "$timeout" bash -c "echo >/dev/tcp/$host/$port" 2>/dev/null
}

# Get external IP address
net_external_ip() {
    local services=(
        "ifconfig.me"
        "ipecho.net/plain"
        "icanhazip.com"
        "ident.me"
    )
    
    for service in "${services[@]}"; do
        if curl -s --max-time 10 "$service" 2>/dev/null; then
            return 0
        fi
    done
    
    return 1
}

# Download file with progress
net_download() {
    local url="$1"
    local output_file="$2"
    local timeout="${3:-300}"
    
    if command -v wget >/dev/null 2>&1; then
        wget --timeout="$timeout" --progress=bar -O "$output_file" "$url"
    elif command -v curl >/dev/null 2>&1; then
        curl --max-time "$timeout" -L -o "$output_file" --progress-bar "$url"
    else
        return 1
    fi
}

#============================================================================
# SYSTEM UTILITIES
#============================================================================

# Get system information
sys_info() {
    local info_type="$1"
    
    case "$info_type" in
        hostname)
            hostname
            ;;
        os)
            if [[ -f /etc/os-release ]]; then
                grep PRETTY_NAME /etc/os-release | cut -d'"' -f2
            else
                uname -s
            fi
            ;;
        kernel)
            uname -r
            ;;
        arch)
            uname -m
            ;;
        cpu)
            grep 'model name' /proc/cpuinfo | head -1 | cut -d':' -f2 | sed 's/^ *//'
            ;;
        memory)
            free -h | grep '^Mem:' | awk '{print $2}'
            ;;
        uptime)
            uptime -p 2>/dev/null || uptime | cut -d',' -f1 | cut -d' ' -f4-
            ;;
        load)
            uptime | awk '{print $NF}'
            ;;
        *)
            echo "Unknown info type: $info_type" >&2
            return 1
            ;;
    esac
}

# Check if running as root
sys_is_root() {
    [[ $EUID -eq 0 ]]
}

# Check if command exists
sys_command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if service is running
sys_service_running() {
    local service="$1"
    
    if sys_command_exists systemctl; then
        systemctl is-active --quiet "$service"
    elif sys_command_exists service; then
        service "$service" status >/dev/null 2>&1
    else
        return 1
    fi
}

# Get available disk space in bytes
sys_disk_space() {
    local path="${1:-/}"
    df "$path" | tail -1 | awk '{print $4 * 1024}'
}

# Get memory usage percentage
sys_memory_usage() {
    free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}'
}

# Get CPU usage percentage
sys_cpu_usage() {
    top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1
}

#============================================================================
# DATE/TIME UTILITIES
#============================================================================

# Get timestamp in various formats
timestamp() {
    local format="${1:-iso}"
    
    case "$format" in
        iso)
            date -u +"%Y-%m-%dT%H:%M:%SZ"
            ;;
        epoch)
            date +%s
            ;;
        human)
            date "+%Y-%m-%d %H:%M:%S"
            ;;
        filename)
            date "+%Y%m%d_%H%M%S"
            ;;
        *)
            date +"$format"
            ;;
    esac
}

# Calculate time difference
time_diff() {
    local start_time="$1"
    local end_time="${2:-$(date +%s)}"
    echo $((end_time - start_time))
}

# Convert seconds to human readable format
seconds_to_human() {
    local seconds="$1"
    local days=$((seconds / 86400))
    local hours=$(((seconds % 86400) / 3600))
    local minutes=$(((seconds % 3600) / 60))
    local secs=$((seconds % 60))
    
    if [[ $days -gt 0 ]]; then
        printf "%dd %dh %dm %ds" $days $hours $minutes $secs
    elif [[ $hours -gt 0 ]]; then
        printf "%dh %dm %ds" $hours $minutes $secs
    elif [[ $minutes -gt 0 ]]; then
        printf "%dm %ds" $minutes $secs
    else
        printf "%ds" $secs
    fi
}

#============================================================================
# VALIDATION UTILITIES
#============================================================================

# Validate email address
validate_email() {
    local email="$1"
    [[ "$email" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]
}

# Validate IP address
validate_ip() {
    local ip="$1"
    local IFS='.'
    local -a octets=($ip)
    
    [[ ${#octets[@]} -eq 4 ]] || return 1
    
    for octet in "${octets[@]}"; do
        [[ "$octet" =~ ^[0-9]+$ ]] || return 1
        [[ $octet -ge 0 && $octet -le 255 ]] || return 1
    done
    
    return 0
}

# Validate URL
validate_url() {
    local url="$1"
    [[ "$url" =~ ^https?://[a-zA-Z0-9.-]+([:/][^[:space:]]*)?$ ]]
}

# Validate number
validate_number() {
    local number="$1"
    local min="${2:-}"
    local max="${3:-}"
    
    [[ "$number" =~ ^-?[0-9]+([.][0-9]+)?$ ]] || return 1
    
    if [[ -n "$min" ]] && (( $(echo "$number < $min" | bc -l) )); then
        return 1
    fi
    
    if [[ -n "$max" ]] && (( $(echo "$number > $max" | bc -l) )); then
        return 1
    fi
    
    return 0
}

#============================================================================
# ARRAY UTILITIES
#============================================================================

# Check if array contains element
array_contains() {
    local element="$1"
    shift
    local array=("$@")
    
    for item in "${array[@]}"; do
        [[ "$item" == "$element" ]] && return 0
    done
    return 1
}

# Join array elements with delimiter
array_join() {
    local delimiter="$1"
    shift
    local array=("$@")
    
    local result=""
    for item in "${array[@]}"; do
        if [[ -z "$result" ]]; then
            result="$item"
        else
            result="$result$delimiter$item"
        fi
    done
    
    echo "$result"
}

# Remove duplicates from array
array_unique() {
    local array=("$@")
    local -A seen
    local unique=()
    
    for item in "${array[@]}"; do
        if [[ -z "${seen[$item]:-}" ]]; then
            seen["$item"]=1
            unique+=("$item")
        fi
    done
    
    printf '%s\n' "${unique[@]}"
}

#============================================================================
# CONFIGURATION UTILITIES
#============================================================================

# Read configuration value
config_get() {
    local config_file="$1"
    local key="$2"
    local default_value="${3:-}"
    
    if [[ -f "$config_file" ]]; then
        local value=$(grep "^${key}=" "$config_file" | cut -d'=' -f2- | sed 's/^["'\'']\(.*\)["'\'']$/\1/')
        echo "${value:-$default_value}"
    else
        echo "$default_value"
    fi
}

# Set configuration value
config_set() {
    local config_file="$1"
    local key="$2"
    local value="$3"
    
    # Create config file if it doesn't exist
    touch "$config_file"
    
    # Remove existing key
    sed -i "/^${key}=/d" "$config_file"
    
    # Add new key=value
    echo "${key}=${value}" >> "$config_file"
}

# Validate configuration file
config_validate() {
    local config_file="$1"
    shift
    local required_keys=("$@")
    
    [[ -f "$config_file" ]] || return 1
    
    for key in "${required_keys[@]}"; do
        if ! grep -q "^${key}=" "$config_file"; then
            echo "Missing required configuration key: $key" >&2
            return 1
        fi
    done
    
    return 0
}

#============================================================================
# ENCRYPTION/SECURITY UTILITIES
#============================================================================

# Generate secure random password
generate_password() {
    local length="${1:-16}"
    local charset="${2:-'a-zA-Z0-9!@#$%^&*'}"
    
    tr -dc "$charset" < /dev/urandom | head -c "$length"
}

# Hash string with SHA256
hash_sha256() {
    local string="$1"
    echo -n "$string" | sha256sum | cut -d' ' -f1
}

# Simple encryption (base64 encode)
encrypt_simple() {
    local string="$1"
    echo -n "$string" | base64
}

# Simple decryption (base64 decode)
decrypt_simple() {
    local encoded="$1"
    echo -n "$encoded" | base64 -d
}

#============================================================================
# DOCKER UTILITIES (if Docker is available)
#============================================================================

# Check if Docker is available and running
docker_available() {
    sys_command_exists docker && docker info >/dev/null 2>&1
}

# List running containers
docker_list_containers() {
    docker_available || return 1
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Get container logs
docker_logs() {
    local container="$1"
    local lines="${2:-50}"
    
    docker_available || return 1
    docker logs --tail "$lines" "$container"
}

#============================================================================
# LIBRARY INITIALIZATION
#============================================================================

# Library version
readonly COMMON_UTILS_VERSION="1.0.0"

# Initialize library (called when sourced)
_common_utils_init() {
    # Set up any required environment
    export COMMON_UTILS_LOADED=true
    
    # Create temporary directory for library use
    export COMMON_UTILS_TEMP_DIR=$(mktemp -d -t common_utils.XXXXXX)
    
    # Cleanup on exit
    trap '_common_utils_cleanup' EXIT
}

# Cleanup function
_common_utils_cleanup() {
    [[ -n "${COMMON_UTILS_TEMP_DIR:-}" ]] && rm -rf "$COMMON_UTILS_TEMP_DIR"
}

# Check dependencies
_common_utils_check_deps() {
    local missing_deps=()
    
    # Critical dependencies
    local critical_deps=("sed" "awk" "grep" "cut" "tr")
    for dep in "${critical_deps[@]}"; do
        if ! sys_command_exists "$dep"; then
            missing_deps+=("$dep")
        fi
    done
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        echo "ERROR: Missing critical dependencies: ${missing_deps[*]}" >&2
        return 1
    fi
    
    return 0
}

# Initialize library if being sourced
if [[ "${BASH_SOURCE[0]}" != "${0}" ]]; then
    _common_utils_check_deps && _common_utils_init
fi

#============================================================================
# USAGE EXAMPLES AND TESTING
#============================================================================

# Function to run tests (if script is executed directly)
run_tests() {
    echo "🧪 Running Common Utils Library Tests"
    echo "====================================="
    
    local tests_passed=0
    local tests_failed=0
    
    # String utilities tests
    echo "Testing string utilities..."
    
    test_result=$(str_lower "HELLO WORLD")
    if [[ "$test_result" == "hello world" ]]; then
        echo "✅ str_lower test passed"
        ((tests_passed++))
    else
        echo "❌ str_lower test failed"
        ((tests_failed++))
    fi
    
    test_result=$(str_upper "hello world")
    if [[ "$test_result" == "HELLO WORLD" ]]; then
        echo "✅ str_upper test passed"
        ((tests_passed++))
    else
        echo "❌ str_upper test failed"
        ((tests_failed++))
    fi
    
    test_result=$(str_trim "  hello world  ")
    if [[ "$test_result" == "hello world" ]]; then
        echo "✅ str_trim test passed"
        ((tests_passed++))
    else
        echo "❌ str_trim test failed"
        ((tests_failed++))
    fi
    
    # Validation tests
    echo "Testing validation utilities..."
    
    if validate_email "user@example.com"; then
        echo "✅ validate_email test passed"
        ((tests_passed++))
    else
        echo "❌ validate_email test failed"
        ((tests_failed++))
    fi
    
    if validate_ip "192.168.1.1"; then
        echo "✅ validate_ip test passed"
        ((tests_passed++))
    else
        echo "❌ validate_ip test failed"
        ((tests_failed++))
    fi
    
    # System utilities tests
    echo "Testing system utilities..."
    
    if [[ -n "$(sys_info hostname)" ]]; then
        echo "✅ sys_info test passed"
        ((tests_passed++))
    else
        echo "❌ sys_info test failed"
        ((tests_failed++))
    fi
    
    # Array utilities tests
    echo "Testing array utilities..."
    
    test_array=("apple" "banana" "cherry")
    if array_contains "banana" "${test_array[@]}"; then
        echo "✅ array_contains test passed"
        ((tests_passed++))
    else
        echo "❌ array_contains test failed"
        ((tests_failed++))
    fi
    
    test_result=$(array_join "," "${test_array[@]}")
    if [[ "$test_result" == "apple,banana,cherry" ]]; then
        echo "✅ array_join test passed"
        ((tests_passed++))
    else
        echo "❌ array_join test failed"
        ((tests_failed++))
    fi
    
    # Summary
    echo ""
    echo "📊 Test Results:"
    echo "Passed: $tests_passed"
    echo "Failed: $tests_failed"
    echo "Total:  $((tests_passed + tests_failed))"
    
    if [[ $tests_failed -eq 0 ]]; then
        echo "🎉 All tests passed!"
        return 0
    else
        echo "💥 Some tests failed!"
        return 1
    fi
}

# Show usage examples
show_examples() {
    cat << 'EOF'
📚 Common Utils Library Usage Examples
======================================

String Utilities:
-----------------
str_lower "HELLO"              # Returns: hello
str_upper "hello"              # Returns: HELLO
str_trim "  hello  "           # Returns: hello
str_contains "hello" "ell"     # Returns: true (exit code 0)
str_random 8                   # Returns: random 8-char string
str_urlencode "hello world"    # Returns: hello%20world

File Utilities:
---------------
file_older_than "file.txt" 7   # Check if file is older than 7 days
file_size "file.txt"           # Get human-readable file size
file_backup "file.txt"         # Create timestamped backup
file_rotate "log.txt" 5        # Rotate log file, keep 5 versions

Network Utilities:
------------------
net_ping "google.com" 5        # Ping with 5 sec timeout
net_port_open "google.com" 80  # Check if port 80 is open
net_external_ip                # Get external IP address
net_download "url" "file"      # Download file with progress

System Utilities:
-----------------
sys_info "hostname"            # Get system hostname
sys_info "memory"              # Get total memory
sys_is_root                    # Check if running as root
sys_command_exists "curl"      # Check if command exists
sys_service_running "nginx"    # Check if service is running

Validation Utilities:
--------------------
validate_email "user@example.com"     # Validate email format
validate_ip "192.168.1.1"             # Validate IP address
validate_url "https://example.com"    # Validate URL format
validate_number "42" 1 100             # Validate number in range

Array Utilities:
---------------
array_contains "item" "${array[@]}"   # Check if array contains item
array_join "," "${array[@]}"          # Join array with delimiter
array_unique "${array[@]}"            # Remove duplicates from array

Configuration Utilities:
-----------------------
config_get "config.txt" "key" "default"   # Read config value
config_set "config.txt" "key" "value"     # Set config value
config_validate "config.txt" "key1" "key2" # Validate required keys

Date/Time Utilities:
-------------------
timestamp "iso"                # ISO 8601 timestamp
timestamp "epoch"              # Unix epoch timestamp
timestamp "filename"           # Filename-safe timestamp
seconds_to_human 3661          # Returns: 1h 1m 1s

Security Utilities:
------------------
generate_password 16          # Generate 16-char password
hash_sha256 "string"          # SHA256 hash of string
encrypt_simple "secret"       # Simple base64 encoding
decrypt_simple "encoded"      # Simple base64 decoding

Example Script Using Library:
-----------------------------
#!/usr/bin/env bash
source /path/to/common_utils.sh

# Use library functions
hostname=$(sys_info hostname)
memory=$(sys_info memory)
timestamp=$(timestamp human)

echo "Host: $hostname"
echo "Memory: $memory"
echo "Time: $timestamp"

# Validate user input
read -p "Enter email: " email
if validate_email "$email"; then
    echo "Valid email address"
else
    echo "Invalid email address"
fi
EOF
}

# Main execution when script is run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    case "${1:-help}" in
        test)
            run_tests
            ;;
        examples)
            show_examples
            ;;
        version)
            echo "Common Utils Library v$COMMON_UTILS_VERSION"
            ;;
        *)
            echo "Common Utils Library v$COMMON_UTILS_VERSION"
            echo ""
            echo "Usage: $0 {test|examples|version}"
            echo ""
            echo "Commands:"
            echo "  test     - Run library tests"
            echo "  examples - Show usage examples"
            echo "  version  - Show version information"
            echo ""
            echo "To use this library in your scripts:"
            echo "  source $0"
            ;;
    esac
fi
```

### **Database Operations Library**
```bash
#!/usr/bin/env bash

# database_utils.sh - Database operations library
# Source this file: source /path/to/database_utils.sh

#============================================================================
# DATABASE CONFIGURATION
#============================================================================

# Default database configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-}"
DB_USER="${DB_USER:-}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_TYPE="${DB_TYPE:-postgresql}"

# Connection timeout
DB_TIMEOUT="${DB_TIMEOUT:-30}"

#============================================================================
# POSTGRESQL UTILITIES
#============================================================================

# PostgreSQL connection test
pg_test_connection() {
    local host="${1:-$DB_HOST}"
    local port="${2:-$DB_PORT}"
    local dbname="${3:-$DB_NAME}"
    local user="${4:-$DB_USER}"
    local password="${5:-$DB_PASSWORD}"
    
    PGPASSWORD="$password" psql -h "$host" -p "$port" -U "$user" -d "$dbname" -c "SELECT 1;" >/dev/null 2>&1
}

# Execute PostgreSQL query
pg_execute() {
    local query="$1"
    local host="${2:-$DB_HOST}"
    local port="${3:-$DB_PORT}"
    local dbname="${4:-$DB_NAME}"
    local user="${5:-$DB_USER}"
    local password="${6:-$DB_PASSWORD}"
    
    PGPASSWORD="$password" psql -h "$host" -p "$port" -U "$user" -d "$dbname" -t -A -c "$query"
}

# PostgreSQL backup
pg_backup() {
    local backup_file="$1"
    local host="${2:-$DB_HOST}"
    local port="${3:-$DB_PORT}"
    local dbname="${4:-$DB_NAME}"
    local user="${5:-$DB_USER}"
    local password="${6:-$DB_PASSWORD}"
    
    PGPASSWORD="$password" pg_dump -h "$host" -p "$port" -U "$user" -d "$dbname" > "$backup_file"
}

# PostgreSQL restore
pg_restore() {
    local backup_file="$1"
    local host="${2:-$DB_HOST}"
    local port="${3:-$DB_PORT}"
    local dbname="${4:-$DB_NAME}"
    local user="${5:-$DB_USER}"
    local password="${6:-$DB_PASSWORD}"
    
    PGPASSWORD="$password" psql -h "$host" -p "$port" -U "$user" -d "$dbname" < "$backup_file"
}

#============================================================================
# MYSQL UTILITIES
#============================================================================

# MySQL connection test
mysql_test_connection() {
    local host="${1:-$DB_HOST}"
    local port="${2:-${DB_PORT:-3306}}"
    local dbname="${3:-$DB_NAME}"
    local user="${4:-$DB_USER}"
    local password="${5:-$DB_PASSWORD}"
    
    mysql -h "$host" -P "$port" -u "$user" -p"$password" -D "$dbname" -e "SELECT 1;" >/dev/null 2>&1
}

# Execute MySQL query
mysql_execute() {
    local query="$1"
    local host="${2:-$DB_HOST}"
    local port="${3:-${DB_PORT:-3306}}"
    local dbname="${4:-$DB_NAME}"
    local user="${5:-$DB_USER}"
    local password="${6:-$DB_PASSWORD}"
    
    mysql -h "$host" -P "$port" -u "$user" -p"$password" -D "$dbname" -s -N -e "$query"
}

# MySQL backup
mysql_backup() {
    local backup_file="$1"
    local host="${2:-$DB_HOST}"
    local port="${3:-${DB_PORT:-3306}}"
    local dbname="${4:-$DB_NAME}"
    local user="${5:-$DB_USER}"
    local password="${6:-$DB_PASSWORD}"
    
    mysqldump -h "$host" -P "$port" -u "$user" -p"$password" "$dbname" > "$backup_file"
}

# MySQL restore
mysql_restore() {
    local backup_file="$1"
    local host="${2:-$DB_HOST}"
    local port="${3:-${DB_PORT:-3306}}"
    local dbname="${4:-$DB_NAME}"
    local user="${5:-$DB_USER}"
    local password="${6:-$DB_PASSWORD}"
    
    mysql -h "$host" -P "$port" -u "$user" -p"$password" "$dbname" < "$backup_file"
}

#============================================================================
# GENERIC DATABASE UTILITIES
#============================================================================

# Test database connection (auto-detect type)
db_test_connection() {
    case "$DB_TYPE" in
        postgresql|postgres|pg)
            pg_test_connection "$@"
            ;;
        mysql|mariadb)
            mysql_test_connection "$@"
            ;;
        *)
            echo "Unsupported database type: $DB_TYPE" >&2
            return 1
            ;;
    esac
}

# Execute database query (auto-detect type)
db_execute() {
    case "$DB_TYPE" in
        postgresql|postgres|pg)
            pg_execute "$@"
            ;;
        mysql|mariadb)
            mysql_execute "$@"
            ;;
        *)
            echo "Unsupported database type: $DB_TYPE" >&2
            return 1
            ;;
    esac
}

# Create database backup (auto-detect type)
db_backup() {
    local backup_file="$1"
    
    case "$DB_TYPE" in
        postgresql|postgres|pg)
            pg_backup "$backup_file"
            ;;
        mysql|mariadb)
            mysql_backup "$backup_file"
            ;;
        *)
            echo "Unsupported database type: $DB_TYPE" >&2
            return 1
            ;;
    esac
}

# Restore database (auto-detect type)
db_restore() {
    local backup_file="$1"
    
    case "$DB_TYPE" in
        postgresql|postgres|pg)
            pg_restore "$backup_file"
            ;;
        mysql|mariadb)
            mysql_restore "$backup_file"
            ;;
        *)
            echo "Unsupported database type: $DB_TYPE" >&2
            return 1
            ;;
    esac
}

# Database health check
db_health_check() {
    echo "🔍 Database Health Check"
    echo "======================="
    echo "Type: $DB_TYPE"
    echo "Host: $DB_HOST:$DB_PORT"
    echo "Database: $DB_NAME"
    echo "User: $DB_USER"
    echo ""
    
    # Test connection
    if db_test_connection; then
        echo "✅ Connection: OK"
        
        # Get database size
        local size_query
        case "$DB_TYPE" in
            postgresql|postgres|pg)
                size_query="SELECT pg_size_pretty(pg_database_size('$DB_NAME'));"
                ;;
            mysql|mariadb)
                size_query="SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 1) AS 'DB Size in MB' FROM information_schema.tables WHERE table_schema='$DB_NAME';"
                ;;
        esac
        
        if [[ -n "$size_query" ]]; then
            local db_size=$(db_execute "$size_query")
            echo "📊 Database Size: $db_size"
        fi
        
        # Get connection count
        local conn_query
        case "$DB_TYPE" in
            postgresql|postgres|pg)
                conn_query="SELECT count(*) FROM pg_stat_activity WHERE datname = '$DB_NAME';"
                ;;
            mysql|mariadb)
                conn_query="SHOW STATUS LIKE 'Threads_connected';"
                ;;
        esac
        
        if [[ -n "$conn_query" ]]; then
            local connections=$(db_execute "$conn_query")
            echo "🔗 Active Connections: $connections"
        fi
        
    else
        echo "❌ Connection: FAILED"
        return 1
    fi
    
    echo ""
    return 0
}

# Database migration runner
db_migrate() {
    local migrations_dir="$1"
    local migration_table="${2:-schema_migrations}"
    
    echo "🚀 Running Database Migrations"
    echo "=============================="
    echo "Migrations directory: $migrations_dir"
    echo "Migration table: $migration_table"
    echo ""
    
    # Check if migrations directory exists
    [[ -d "$migrations_dir" ]] || {
        echo "❌ Migrations directory not found: $migrations_dir"
        return 1
    }
    
    # Create migration table if it doesn't exist
    local create_table_sql
    case "$DB_TYPE" in
        postgresql|postgres|pg)
            create_table_sql="CREATE TABLE IF NOT EXISTS $migration_table (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) NOT NULL UNIQUE,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );"
            ;;
        mysql|mariadb)
            create_table_sql="CREATE TABLE IF NOT EXISTS $migration_table (
                id INT AUTO_INCREMENT PRIMARY KEY,
                filename VARCHAR(255) NOT NULL UNIQUE,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );"
            ;;
    esac
    
    db_execute "$create_table_sql"
    
    # Get list of applied migrations
    local applied_migrations
    applied_migrations=$(db_execute "SELECT filename FROM $migration_table ORDER BY filename;")
    
    # Process migration files
    local migration_count=0
    for migration_file in "$migrations_dir"/*.sql; do
        [[ -f "$migration_file" ]] || continue
        
        local filename=$(basename "$migration_file")
        
        # Check if migration already applied
        if echo "$applied_migrations" | grep -q "^$filename$"; then
            echo "⏭️  Skipping (already applied): $filename"
            continue
        fi
        
        echo "▶️  Applying migration: $filename"
        
        # Apply migration
        if db_execute "$(cat "$migration_file")"; then
            # Record successful migration
            db_execute "INSERT INTO $migration_table (filename) VALUES ('$filename');"
            echo "✅ Applied: $filename"
            ((migration_count++))
        else
            echo "❌ Failed: $filename"
            return 1
        fi
    done
    
    echo ""
    echo "🎉 Migration completed successfully"
    echo "Applied $migration_count new migrations"
    
    return 0
}

# Database performance monitoring
db_monitor() {
    local duration="${1:-60}"
    local interval="${2:-5}"
    
    echo "📊 Database Performance Monitor"
    echo "Duration: ${duration}s, Interval: ${interval}s"
    echo "=============================="
    
    local end_time=$(($(date +%s) + duration))
    
    while [[ $(date +%s) -lt $end_time ]]; do
        local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        
        case "$DB_TYPE" in
            postgresql|postgres|pg)
                local active_connections=$(db_execute "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';")
                local db_size=$(db_execute "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));")
                echo "[$timestamp] Connections: $active_connections, Size: $db_size"
                ;;
            mysql|mariadb)
                local connections=$(db_execute "SHOW STATUS LIKE 'Threads_connected';" | cut -f2)
                local queries=$(db_execute "SHOW STATUS LIKE 'Queries';" | cut -f2)
                echo "[$timestamp] Connections: $connections, Queries: $queries"
                ;;
        esac
        
        sleep "$interval"
    done
}

# Example usage function
db_examples() {
    cat << 'EOF'
📚 Database Utils Library Examples
==================================

Configuration:
--------------
export DB_TYPE="postgresql"
export DB_HOST="localhost"
export DB_PORT="5432"
export DB_NAME="myapp"
export DB_USER="dbuser"
export DB_PASSWORD="secret"

Basic Operations:
----------------
# Test connection
db_test_connection

# Execute query
result=$(db_execute "SELECT count(*) FROM users;")

# Health check
db_health_check

# Create backup
db_backup "/backup/myapp_$(date +%Y%m%d).sql"

# Restore from backup
db_restore "/backup/myapp_20231115.sql"

Migration Management:
--------------------
# Run migrations from directory
db_migrate "/path/to/migrations"

# Custom migration table
db_migrate "/path/to/migrations" "my_migrations"

Performance Monitoring:
----------------------
# Monitor for 5 minutes, check every 10 seconds
db_monitor 300 10

PostgreSQL Specific:
-------------------
pg_test_connection "localhost" "5432" "mydb" "user" "pass"
pg_execute "SELECT version();"
pg_backup "/tmp/backup.sql"

MySQL Specific:
--------------
mysql_test_connection "localhost" "3306" "mydb" "user" "pass"
mysql_execute "SELECT version();"
mysql_backup "/tmp/backup.sql"
EOF
}

# Library initialization
if [[ "${BASH_SOURCE[0]}" != "${0}" ]]; then
    echo "Database Utils Library loaded (Type: ${DB_TYPE})"
fi

# Main execution when run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    case "${1:-help}" in
        health)
            db_health_check
            ;;
        monitor)
            db_monitor "${2:-60}" "${3:-5}"
            ;;
        migrate)
            db_migrate "${2:-./migrations}" "${3:-schema_migrations}"
            ;;
        backup)
            db_backup "${2:-backup_$(date +%Y%m%d_%H%M%S).sql}"
            ;;
        examples)
            db_examples
            ;;
        *)
            echo "Database Utils Library"
            echo ""
            echo "Usage: $0 {health|monitor|migrate|backup|examples}"
            echo ""
            echo "Commands:"
            echo "  health               - Run database health check"
            echo "  monitor [sec] [int]  - Monitor performance"
            echo "  migrate [dir] [table] - Run database migrations"
            echo "  backup [file]        - Create database backup"
            echo "  examples             - Show usage examples"
            ;;
    esac
fi
```

---

## **18. Real-World Examples**

### **Complete Server Deployment Script**
```bash
#!/usr/bin/env bash

#############################################################################
# Web Server Deployment Script
# Deploys a complete LAMP/LEMP stack with security hardening
#############################################################################

set -euo pipefail

# Import our utility libraries
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
source "$SCRIPT_DIR/common_utils.sh"

#============================================================================
# CONFIGURATION
#============================================================================

readonly DEPLOYMENT_CONFIG="/etc/deployment.conf"
readonly LOG_FILE="/var/log/deployment.log"

# Default configuration
SERVER_TYPE="nginx"           # nginx or apache
PHP_VERSION="8.1"
MYSQL_ROOT_PASSWORD=""
DOMAIN_NAME=""
SSL_EMAIL=""
ENABLE_FIREWALL=true
ENABLE_FAIL2BAN=true

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[0;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

#============================================================================
# LOGGING FUNCTIONS
#============================================================================

log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%# **Linux Shell Scripting - Complete Hands-On Guide**
```

---

# **PART 5: FINAL EXAMPLES & COMPLETE COURSE SUMMARY**

## **📋 What You'll Learn in Part 5**
- Complete Real-World Project Examples
- Advanced Security and Performance Tips
- Script Template Gallery
- Final Course Summary and Next Steps

---

## **Real-World Example: Complete Web Server Deployment Script**

```bash
#!/usr/bin/env bash

#############################################################################
# Complete Web Server Deployment Script
# Deploys LAMP/LEMP stack with security hardening and monitoring
#############################################################################

set -euo pipefail

# Script configuration
readonly SCRIPT_NAME=$(basename "$0")
readonly SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
readonly LOG_FILE="/var/log/deployment.log"
readonly CONFIG_FILE="/etc/deployment.conf"

# Colors
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[0;33m'
readonly BLUE='\033[0;34m'
readonly BOLD='\033[1m'
readonly NC='\033[0m'

#============================================================================
# LOGGING AND UTILITY FUNCTIONS
#============================================================================

log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Log to file
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    
    # Log to console with colors
    case $level in
        ERROR)
            echo -e "${RED}❌ [$level]${NC} $message" >&2
            ;;
        WARN)
            echo -e "${YELLOW}⚠️  [$level]${NC} $message"
            ;;
        INFO)
            echo -e "${GREEN}✅ [$level]${NC} $message"
            ;;
        DEBUG)
            [[ "${DEBUG:-false}" == "true" ]] && echo -e "${BLUE}🔍 [$level]${NC} $message"
            ;;
    esac
}

die() {
    log ERROR "$@"
    exit 1
}

success() {
    log INFO "$@"
}

warn() {
    log WARN "$@"
}

debug() {
    log DEBUG "$@"
}

# Progress indicator
show_progress() {
    local step=$1
    local total=$2
    local description=$3
    
    local percentage=$((step * 100 / total))
    local filled=$((step * 50 / total))
    local empty=$((50 - filled))
    
    printf "\r${BLUE}[%${filled}s%${empty}s] %d%% - %s${NC}" \
           "$(printf '%*s' $filled | tr ' ' '█')" \
           "$(printf '%*s' $empty | tr ' ' '░')" \
           $percentage "$description"
    
    [[ $step -eq $total ]] && echo ""
}

#============================================================================
# CONFIGURATION MANAGEMENT
#============================================================================

# Default configuration
DEFAULT_CONFIG='
# Web Server Deployment Configuration
SERVER_TYPE="nginx"
PHP_VERSION="8.1"
MYSQL_ROOT_PASSWORD=""
DOMAIN_NAME=""
SSL_EMAIL=""
ENABLE_FIREWALL=true
ENABLE_FAIL2BAN=true
ENABLE_MONITORING=true
BACKUP_RETENTION_DAYS=30
'

load_config() {
    # Create default config if doesn't exist
    if [[ ! -f "$CONFIG_FILE" ]]; then
        echo "$DEFAULT_CONFIG" > "$CONFIG_FILE"
        chmod 600 "$CONFIG_FILE"
        warn "Created default configuration file: $CONFIG_FILE"
    fi
    
    source "$CONFIG_FILE"
    success "Configuration loaded from $CONFIG_FILE"
}

#============================================================================
# SYSTEM PREPARATION
#============================================================================

prepare_system() {
    success "🔄 Preparing system for deployment..."
    
    # Update package lists
    show_progress 1 5 "Updating package lists"
    apt-get update -qq
    
    # Install essential packages
    show_progress 2 5 "Installing essential packages"
    apt-get install -y -qq \
        curl wget git unzip \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg lsb-release
    
    # Set timezone
    show_progress 3 5 "Configuring timezone"
    timedatectl set-timezone UTC
    
    # Create deployment user
    show_progress 4 5 "Creating deployment user"
    if ! id "deploy" &>/dev/null; then
        useradd -m -s /bin/bash deploy
        usermod -aG sudo deploy
        success "Created deployment user 'deploy'"
    fi
    
    # Set up SSH keys for deploy user
    show_progress 5 5 "Configuring SSH access"
    if [[ ! -d "/home/deploy/.ssh" ]]; then
        mkdir -p /home/deploy/.ssh
        chmod 700 /home/deploy/.ssh
        chown deploy:deploy /home/deploy/.ssh
    fi
    
    success "✅ System preparation completed"
}

#============================================================================
# WEB SERVER INSTALLATION
#============================================================================

install_nginx() {
    success "📦 Installing Nginx..."
    
    show_progress 1 4 "Installing Nginx package"
    apt-get install -y nginx
    
    show_progress 2 4 "Configuring Nginx"
    # Backup original config
    cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup
    
    # Create optimized nginx configuration
    cat > /etc/nginx/nginx.conf << 'EOF'
user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/atom+xml image/svg+xml;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF

    show_progress 3 4 "Setting up default site"
    # Remove default site
    rm -f /etc/nginx/sites-enabled/default
    
    # Create new default site
    cat > /etc/nginx/sites-available/default << EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    root /var/www/html;
    index index.php index.html index.htm;
    
    server_name ${DOMAIN_NAME:-_};
    
    location / {
        try_files \$uri \$uri/ =404;
    }
    
    location ~ \.php\$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php${PHP_VERSION}-fpm.sock;
    }
    
    location ~ /\.ht {
        deny all;
    }
}
EOF

    ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/
    
    show_progress 4 4 "Starting Nginx service"
    systemctl enable nginx
    systemctl start nginx
    
    success "✅ Nginx installation completed"
}

install_apache() {
    success "📦 Installing Apache..."
    
    show_progress 1 4 "Installing Apache package"
    apt-get install -y apache2
    
    show_progress 2 4 "Configuring Apache"
    # Enable required modules
    a2enmod rewrite ssl headers
    
    # Create optimized apache configuration
    cat > /etc/apache2/conf-available/security.conf << 'EOF'
ServerTokens Prod
ServerSignature Off
TraceEnable Off

Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
EOF

    a2enconf security
    
    show_progress 3 4 "Setting up virtual host"
    cat > /etc/apache2/sites-available/000-default.conf << EOF
<VirtualHost *:80>
    ServerAdmin webmaster@${DOMAIN_NAME:-localhost}
    DocumentRoot /var/www/html
    
    ErrorLog \${APACHE_LOG_DIR}/error.log
    CustomLog \${APACHE_LOG_DIR}/access.log combined
    
    <Directory /var/www/html>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
EOF

    show_progress 4 4 "Starting Apache service"
    systemctl enable apache2
    systemctl start apache2
    
    success "✅ Apache installation completed"
}

#============================================================================
# PHP INSTALLATION
#============================================================================

install_php() {
    success "📦 Installing PHP $PHP_VERSION..."
    
    show_progress 1 3 "Adding PHP repository"
    add-apt-repository -y ppa:ondrej/php
    apt-get update -qq
    
    show_progress 2 3 "Installing PHP packages"
    apt-get install -y \
        "php${PHP_VERSION}" \
        "php${PHP_VERSION}-fpm" \
        "php${PHP_VERSION}-mysql" \
        "php${PHP_VERSION}-xml" \
        "php${PHP_VERSION}-curl" \
        "php${PHP_VERSION}-gd" \
        "php${PHP_VERSION}-mbstring" \
        "php${PHP_VERSION}-zip" \
        "php${PHP_VERSION}-intl" \
        "php${PHP_VERSION}-bcmath"
    
    show_progress 3 3 "Configuring PHP"
    # Optimize PHP configuration
    sed -i 's/;cgi.fix_pathinfo=1/cgi.fix_pathinfo=0/' "/etc/php/${PHP_VERSION}/fpm/php.ini"
    sed -i 's/upload_max_filesize = 2M/upload_max_filesize = 64M/' "/etc/php/${PHP_VERSION}/fpm/php.ini"
    sed -i 's/post_max_size = 8M/post_max_size = 64M/' "/etc/php/${PHP_VERSION}/fpm/php.ini"
    sed -i 's/max_execution_time = 30/max_execution_time = 300/' "/etc/php/${PHP_VERSION}/fpm/php.ini"
    sed -i 's/memory_limit = 128M/memory_limit = 256M/' "/etc/php/${PHP_VERSION}/fpm/php.ini"
    
    systemctl enable "php${PHP_VERSION}-fpm"
    systemctl start "php${PHP_VERSION}-fpm"
    
    success "✅ PHP $PHP_VERSION installation completed"
}

#============================================================================
# DATABASE INSTALLATION
#============================================================================

install_mysql() {
    success "📦 Installing MySQL..."
    
    show_progress 1 4 "Installing MySQL packages"
    
    # Set MySQL root password non-interactively
    if [[ -n "$MYSQL_ROOT_PASSWORD" ]]; then
        debconf-set-selections <<< "mysql-server mysql-server/root_password password $MYSQL_ROOT_PASSWORD"
        debconf-set-selections <<< "mysql-server mysql-server/root_password_again password $MYSQL_ROOT_PASSWORD"
    fi
    
    apt-get install -y mysql-server mysql-client
    
    show_progress 2 4 "Securing MySQL installation"
    # Run mysql_secure_installation equivalent
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" << EOF
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\_%';
FLUSH PRIVILEGES;
EOF

    show_progress 3 4 "Configuring MySQL"
    # Optimize MySQL configuration
    cat > /etc/mysql/mysql.conf.d/optimization.cnf << 'EOF'
[mysqld]
innodb_buffer_pool_size = 256M
innodb_log_file_size = 64M
innodb_file_per_table = 1
innodb_flush_method = O_DIRECT
query_cache_type = 1
query_cache_size = 32M
query_cache_limit = 2M
thread_cache_size = 8
max_connections = 100
EOF

    show_progress 4 4 "Starting MySQL service"
    systemctl enable mysql
    systemctl restart mysql
    
    success "✅ MySQL installation completed"
}

#============================================================================
# SSL CERTIFICATE SETUP
#============================================================================

setup_ssl() {
    [[ -n "$DOMAIN_NAME" ]] || {
        warn "Domain name not set, skipping SSL setup"
        return 0
    }
    
    success "🔐 Setting up SSL certificate..."
    
    show_progress 1 3 "Installing Certbot"
    apt-get install -y certbot
    
    if [[ "$SERVER_TYPE" == "nginx" ]]; then
        apt-get install -y python3-certbot-nginx
    else
        apt-get install -y python3-certbot-apache
    fi
    
    show_progress 2 3 "Obtaining SSL certificate"
    if [[ "$SERVER_TYPE" == "nginx" ]]; then
        certbot --nginx -d "$DOMAIN_NAME" --email "$SSL_EMAIL" --agree-tos --non-interactive
    else
        certbot --apache -d "$DOMAIN_NAME" --email "$SSL_EMAIL" --agree-tos --non-interactive
    fi
    
    show_progress 3 3 "Setting up auto-renewal"
    crontab -l 2>/dev/null | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | crontab -
    
    success "✅ SSL certificate setup completed"
}

#============================================================================
# SECURITY HARDENING
#============================================================================

setup_firewall() {
    [[ "$ENABLE_FIREWALL" == "true" ]] || return 0
    
    success "🛡️ Setting up firewall..."
    
    show_progress 1 4 "Installing UFW"
    apt-get install -y ufw
    
    show_progress 2 4 "Configuring firewall rules"
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH
    ufw allow ssh
    # Allow HTTP/HTTPS
    ufw allow http
    ufw allow https
    
    show_progress 3 4 "Enabling firewall"
    ufw --force enable
    
    show_progress 4 4 "Firewall status"
    ufw status
    
    success "✅ Firewall setup completed"
}

setup_fail2ban() {
    [[ "$ENABLE_FAIL2BAN" == "true" ]] || return 0
    
    success "🔒 Setting up Fail2Ban..."
    
    show_progress 1 3 "Installing Fail2Ban"
    apt-get install -y fail2ban
    
    show_progress 2 3 "Configuring Fail2Ban"
    cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
backend = systemd

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
EOF

    show_progress 3 3 "Starting Fail2Ban"
    systemctl enable fail2ban
    systemctl start fail2ban
    
    success "✅ Fail2Ban setup completed"
}

#============================================================================
# MONITORING SETUP
#============================================================================

setup_monitoring() {
    [[ "$ENABLE_MONITORING" == "true" ]] || return 0
    
    success "📊 Setting up monitoring..."
    
    show_progress 1 2 "Creating monitoring scripts"
    
    # Create system monitor script
    cat > /usr/local/bin/system-monitor.sh << 'EOF'
#!/bin/bash
LOG_FILE="/var/log/system-monitor.log"

# System metrics
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
LOAD_AVG=$(uptime | awk '{print $NF}')

# Log metrics
echo "$(date '+%Y-%m-%d %H:%M:%S') CPU:${CPU_USAGE}% MEM:${MEMORY_USAGE}% DISK:${DISK_USAGE}% LOAD:${LOAD_AVG}" >> "$LOG_FILE"

# Alert if any metric is too high
if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
    echo "HIGH CPU USAGE: ${CPU_USAGE}%" | logger -t system-monitor
fi

if (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
    echo "HIGH MEMORY USAGE: ${MEMORY_USAGE}%" | logger -t system-monitor
fi

if [[ $DISK_USAGE -gt 80 ]]; then
    echo "HIGH DISK USAGE: ${DISK_USAGE}%" | logger -t system-monitor
fi
EOF

    chmod +x /usr/local/bin/system-monitor.sh
    
    show_progress 2 2 "Setting up monitoring cron jobs"
    # Add monitoring to crontab
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/system-monitor.sh") | crontab -
    
    success "✅ Monitoring setup completed"
}

#============================================================================
# BACKUP CONFIGURATION
#============================================================================

setup_backups() {
    success "💾 Setting up automated backups..."
    
    show_progress 1 2 "Creating backup scripts"
    
    # Create backup directory
    mkdir -p /var/backups/automated
    
    # Create database backup script
    cat > /usr/local/bin/backup-database.sh << EOF
#!/bin/bash
BACKUP_DIR="/var/backups/automated"
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="\$BACKUP_DIR/mysql_backup_\$DATE.sql.gz"

mysqldump -u root -p'$MYSQL_ROOT_PASSWORD' --all-databases | gzip > "\$BACKUP_FILE"

# Remove backups older than $BACKUP_RETENTION_DAYS days
find "\$BACKUP_DIR" -name "mysql_backup_*.sql.gz" -mtime +$BACKUP_RETENTION_DAYS -delete

echo "\$(date '+%Y-%m-%d %H:%M:%S') Database backup created: \$BACKUP_FILE" >> /var/log/backup.log
EOF

    chmod +x /usr/local/bin/backup-database.sh
    
    show_progress 2 2 "Scheduling backups"
    # Schedule daily database backups at 2 AM
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-database.sh") | crontab -
    
    success "✅ Backup system setup completed"
}

#============================================================================
# DEPLOYMENT VERIFICATION
#============================================================================

verify_deployment() {
    success "🔍 Verifying deployment..."
    
    local errors=0
    
    # Check web server
    if systemctl is-active --quiet nginx || systemctl is-active --quiet apache2; then
        success "✅ Web server is running"
    else
        warn "❌ Web server is not running"
        ((errors++))
    fi
    
    # Check PHP
    if systemctl is-active --quiet "php${PHP_VERSION}-fpm"; then
        success "✅ PHP-FPM is running"
    else
        warn "❌ PHP-FPM is not running"
        ((errors++))
    fi
    
    # Check MySQL
    if systemctl is-active --quiet mysql; then
        success "✅ MySQL is running"
    else
        warn "❌ MySQL is not running"
        ((errors++))
    fi
    
    # Check web server response
    if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200"; then
        success "✅ Web server responding"
    else
        warn "❌ Web server not responding"
        ((errors++))
    fi
    
    # Check firewall
    if [[ "$ENABLE_FIREWALL" == "true" ]] && ufw status | grep -q "Status: active"; then
        success "✅ Firewall is active"
    elif [[ "$ENABLE_FIREWALL" == "true" ]]; then
        warn "❌ Firewall is not active"
        ((errors++))
    fi
    
    # Test PHP functionality
    echo "<?php phpinfo(); ?>" > /var/www/html/info.php
    if curl -s http://localhost/info.php | grep -q "PHP Version"; then
        success "✅ PHP is working"
        rm -f /var/www/html/info.php  # Remove for security
    else
        warn "❌ PHP is not working"
        ((errors++))
    fi
    
    if [[ $errors -eq 0 ]]; then
        success "🎉 Deployment verification passed!"
        return 0
    else
        warn "⚠️ Deployment verification failed with $errors errors"
        return 1
    fi
}

#============================================================================
# MAIN DEPLOYMENT FUNCTION
#============================================================================

main() {
    echo -e "${BOLD}${BLUE}"
    cat << 'EOF'
╔═══════════════════════════════════════╗
║     Web Server Deployment Script     ║
║            Version 1.0.0              ║
╚═══════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    # Check if running as root
    if [[ $EUID -ne 0 ]]; then
        die "This script must be run as root"
    fi
    
    # Create log file
    touch "$LOG_FILE"
    chmod 644 "$LOG_FILE"
    
    success "🚀 Starting web server deployment..."
    
    # Load configuration
    load_config
    
    # Validate configuration
    [[ -n "$MYSQL_ROOT_PASSWORD" ]] || die "MySQL root password not set in configuration"
    
    # Deployment steps
    prepare_system
    
    # Install web server
    if [[ "$SERVER_TYPE" == "nginx" ]]; then
        install_nginx
    else
        install_apache
    fi
    
    install_php
    install_mysql
    
    # Security setup
    setup_firewall
    setup_fail2ban
    
    # SSL setup (if domain configured)
    setup_ssl
    
    # Monitoring and backups
    setup_monitoring
    setup_backups
    
    # Final verification
    if verify_deployment; then
        success "🎉 Deployment completed successfully!"
        
        echo ""
        echo -e "${BOLD}${GREEN}Deployment Summary:${NC}"
        echo "==================="
        echo "Web Server: $SERVER_TYPE"
        echo "PHP Version: $PHP_VERSION"
        echo "Domain: ${DOMAIN_NAME:-Not configured}"
        echo "SSL: $([[ -n "$DOMAIN_NAME" ]] && echo "Enabled" || echo "Not configured")"
        echo "Firewall: $ENABLE_FIREWALL"
        echo "Fail2Ban: $ENABLE_FAIL2BAN"
        echo "Monitoring: $ENABLE_MONITORING"
        echo ""
        echo "📋 Next Steps:"
        echo "- Upload your website files to /var/www/html"
        echo "- Configure your DNS to point to this server"
        echo "- Review logs in $LOG_FILE"
        echo "- Test your website functionality"
        
    else
        die "Deployment failed. Check logs in $LOG_FILE"
    fi
}

# Trap cleanup
cleanup() {
    local exit_code=$?
    if [[ $exit_code -ne 0 ]]; then
        warn "Deployment failed with exit code $exit_code"
        warn "Check logs in $LOG_FILE for details"
    fi
    exit $exit_code
}

trap cleanup EXIT

# Run main function
main "$@"
```

---

## **Advanced Security and Performance Scripts**

### **Security Audit Script**
```bash
#!/usr/bin/env bash

#############################################################################
# System Security Audit Script
# Performs comprehensive security checks and generates reports
#############################################################################

set -euo pipefail

readonly SCRIPT_NAME=$(basename "$0")
readonly AUDIT_REPORT="/tmp/security_audit_$(date +%Y%m%d_%H%M%S).txt"
readonly FAILED_CHECKS=()

# Colors
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[0;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

#============================================================================
# AUDIT FUNCTIONS
#============================================================================

audit_header() {
    local title="$1"
    echo "" | tee -a "$AUDIT_REPORT"
    echo "═══════════════════════════════════════" | tee -a "$AUDIT_REPORT"
    echo " $title" | tee -a "$AUDIT_REPORT"
    echo "═══════════════════════════════════════" | tee -a "$AUDIT_REPORT"
    echo "" | tee -a "$AUDIT_REPORT"
}

check_pass() {
    local message="$1"
    echo -e "${GREEN}✅ PASS${NC}: $message" | tee -a "$AUDIT_REPORT"
}

check_fail() {
    local message="$1"
    echo -e "${RED}❌ FAIL${NC}: $message" | tee -a "$AUDIT_REPORT"
    FAILED_CHECKS+=("$message")
}

check_warn() {
    local message="$1"
    echo -e "${YELLOW}⚠️  WARN${NC}: $message" | tee -a "$AUDIT_REPORT"
}

check_info() {
    local message="$1"
    echo -e "${BLUE}ℹ️  INFO${NC}: $message" | tee -a "$AUDIT_REPORT"
}

# System Information
audit_system_info() {
    audit_header "SYSTEM INFORMATION"
    
    check_info "Hostname: $(hostname)"
    check_info "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
    check_info "Kernel: $(uname -r)"
    check_info "Architecture: $(uname -m)"
    check_info "Uptime: $(uptime -p)"
    check_info "Last boot: $(who -b | awk '{print $3, $4}')"
}

# User and Authentication Audit
audit_users() {
    audit_header "USER AND AUTHENTICATION AUDIT"
    
    # Check for users with UID 0
    local root_users=$(awk -F: '$3 == 0 {print $1}' /etc/passwd)
    if [[ "$root_users" == "root" ]]; then
        check_pass "Only root user has UID 0"
    else
        check_fail "Multiple users with UID 0: $root_users"
    fi
    
    # Check for empty passwords
    local empty_passwords=$(awk -F: '$2 == "" {print $1}' /etc/shadow 2>/dev/null | wc -l)
    if [[ $empty_passwords -eq 0 ]]; then
        check_pass "No users with empty passwords"
    else
        check_fail "$empty_passwords users have empty passwords"
    fi
    
    # Check password aging
    local users_no_aging=$(awk -F: '$5 == "" || $5 == "99999" {print $1}' /etc/shadow 2>/dev/null | grep -v -E '^(root|daemon|bin|sys|sync|games|man|lp|mail|news|uucp|proxy|www-data|backup|list|irc|gnats|nobody|systemd-|_)' | wc -l)
    if [[ $users_no_aging -eq 0 ]]; then
        check_pass "All regular users have password aging configured"
    else
        check_warn "$users_no_aging regular users don't have password aging"
    fi
    
    # Check for sudo users
    local sudo_users=$(grep -E '^sudo:' /etc/group | cut -d: -f4)
    check_info "Users with sudo access: ${sudo_users:-none}"
}

# Network Security Audit
audit_network() {
    audit_header "NETWORK SECURITY AUDIT"
    
    # Check for open ports
    local listening_ports=$(ss -tuln | grep LISTEN | awk '{print $5}' | cut -d: -f2 | sort -n | uniq)
    check_info "Listening ports: $(echo $listening_ports | tr '\n' ' ')"
    
    # Check if SSH is secured
    if [[ -f /etc/ssh/sshd_config ]]; then
        if grep -q "^PermitRootLogin no" /etc/ssh/sshd_config; then
            check_pass "SSH root login is disabled"
        else
            check_fail "SSH root login is not explicitly disabled"
        fi
        
        if grep -q "^PasswordAuthentication no" /etc/ssh/sshd_config; then
            check_pass "SSH password authentication is disabled"
        else
            check_warn "SSH password authentication is enabled"
        fi
        
        if grep -q "^Protocol 2" /etc/ssh/sshd_config; then
            check_pass "SSH is using Protocol 2"
        else
            check_warn "SSH protocol version not explicitly set to 2"
        fi
    fi
    
    # Check firewall status
    if command -v ufw >/dev/null; then
        if ufw status | grep -q "Status: active"; then
            check_pass "UFW firewall is active"
        else
            check_fail "UFW firewall is inactive"
        fi
    elif command -v iptables >/dev/null; then
        local iptables_rules=$(iptables -L | wc -l)
        if [[ $iptables_rules -gt 8 ]]; then
            check_pass "Iptables rules are configured"
        else
            check_warn "No custom iptables rules found"
        fi
    else
        check_fail "No firewall detected"
    fi
}

# File System Security Audit
audit_filesystem() {
    audit_header "FILE SYSTEM SECURITY AUDIT"
    
    # Check for world-writable files
    local world_writable=$(find / -type f -perm -002 2>/dev/null | grep -v /proc | grep -v /sys | wc -l)
    if [[ $world_writable -eq 0 ]]; then
        check_pass "No world-writable files found"
    else
        check_warn "$world_writable world-writable files found"
    fi
    
    # Check for SUID/SGID files
    local suid_files=$(find / -type f \( -perm -4000 -o -perm -2000 \) 2>/dev/null | wc -l)
    check_info "$suid_files SUID/SGID files found"
    
    # Check /tmp permissions
    local tmp_perms=$(stat -c %a /tmp)
    if [[ "$tmp_perms" == "1777" ]]; then
        check_pass "/tmp has correct permissions (1777)"
    else
        check_fail "/tmp has incorrect permissions ($tmp_perms)"
    fi
    
    # Check for unowned files
    local unowned_files=$(find / -nouser -o -nogroup 2>/dev/null | wc -l)
    if [[ $unowned_files -eq 0 ]]; then
        check_pass "No unowned files found"
    else
        check_warn "$unowned_files unowned files found"
    fi
}

# Service Security Audit
audit_services() {
    audit_header "SERVICE SECURITY AUDIT"
    
    # Check running services
    local running_services=$(systemctl list-units --type=service --state=running | grep -v systemctl | wc -l)
    check_info "$running_services services are running"
    
    # Check for unnecessary services
    local unnecessary_services=("telnet" "rsh" "rlogin" "vsftpd" "proftpd")
    for service in "${unnecessary_services[@]}"; do
        if systemctl is-active --quiet "$service" 2>/dev/null; then
            check_fail "Unnecessary service $service is running"
        else
            check_pass "Service $service is not running"
        fi
    done
    
    # Check fail2ban status
    if command -v fail2ban-client >/dev/null; then
        if systemctl is-active --quiet fail2ban; then
            check_pass "Fail2ban is active"
            local banned_ips=$(fail2ban-client status | grep "Jail list" | cut -d: -f2 | wc -w)
            check_info "Fail2ban has $banned_ips active jails"
        else
            check_warn "Fail2ban is installed but not active"
        fi
    else
        check_warn "Fail2ban is not installed"
    fi
}

# System Updates Audit
audit_updates() {
    audit_header "SYSTEM UPDATES AUDIT"
    
    if command -v apt >/dev/null; then
        apt update -qq 2>/dev/null
        local security_updates=$(apt list --upgradable 2>/dev/null | grep -i security | wc -l)
        local total_updates=$(apt list --upgradable 2>/dev/null | tail -n +2 | wc -l)
        
        if [[ $security_updates -eq 0 ]]; then
            check_pass "No security updates pending"
        else
            check_fail "$security_updates security updates pending"
        fi
        
        check_info "$total_updates total updates available"
        
    elif command -v yum >/dev/null; then
        local security_updates=$(yum --security check-update 2>/dev/null | grep -c "needed for security" || echo "0")
        if [[ $security_updates -eq 0 ]]; then
            check_pass "No security updates pending"
        else
            check_fail "$security_updates security updates pending"
        fi
    fi
}

# Log Analysis
audit_logs() {
    audit_header "LOG ANALYSIS"
    
    # Check for authentication failures
    local auth_failures=$(grep "authentication failure" /var/log/auth.log 2>/dev/null | wc -l)
    if [[ $auth_failures -gt 10 ]]; then
        check_warn "$auth_failures authentication failures in auth.log"
    else
        check_pass "Authentication failures are within normal range"
    fi
    
    # Check for sudo usage
    local sudo_usage=$(grep "sudo:" /var/log/auth.log 2>/dev/null | wc -l)
    check_info "$sudo_usage sudo commands executed recently"
    
    # Check disk space for logs
    local log_disk_usage=$(df /var/log | tail -1 | awk '{print $5}' | sed 's/%//')
    if [[ $log_disk_usage -gt 80 ]]; then
        check_warn "Log partition is ${log_disk_usage}% full"
    else
        check_pass "Log partition usage is acceptable (${log_disk_usage}%)"
    fi
}

# Generate security recommendations
generate_recommendations() {
    audit_header "SECURITY RECOMMENDATIONS"
    
    if [[ ${#FAILED_CHECKS[@]} -gt 0 ]]; then
        echo "🔴 CRITICAL ISSUES TO ADDRESS:" | tee -a "$AUDIT_REPORT"
        for check in "${FAILED_CHECKS[@]}"; do
            echo "  - $check" | tee -a "$AUDIT_REPORT"
        done
        echo "" | tee -a "$AUDIT_REPORT"
    fi
    
    echo "📋 GENERAL SECURITY RECOMMENDATIONS:" | tee -a "$AUDIT_REPORT"
    echo "  - Regularly update the system and installed packages" | tee -a "$AUDIT_REPORT"
    echo "  - Use strong, unique passwords for all accounts" | tee -a "$AUDIT_REPORT"
    echo "  - Enable two-factor authentication where possible" | tee -a "$AUDIT_REPORT"
    echo "  - Regularly review user accounts and permissions" | tee -a "$AUDIT_REPORT"
    echo "  - Monitor system logs for suspicious activity" | tee -a "$AUDIT_REPORT"
    echo "  - Keep security tools like fail2ban up to date" | tee -a "$AUDIT_REPORT"
    echo "  - Perform regular security audits" | tee -a "$AUDIT_REPORT"
    echo "" | tee -a "$AUDIT_REPORT"
}

#============================================================================
# MAIN EXECUTION
#============================================================================

main() {
    echo -e "${BLUE}🔍 Starting Security Audit${NC}"
    echo "Report will be saved to: $AUDIT_REPORT"
    echo ""
    
    # Initialize report
    cat > "$AUDIT_REPORT" << EOF
SYSTEM SECURITY AUDIT REPORT
============================
Generated: $(date)
Hostname: $(hostname)
Auditor: $(whoami)

EOF
    
    # Run audit checks
    audit_system_info
    audit_users
    audit_network
    audit_filesystem
    audit_services
    audit_updates
    audit_logs
    generate_recommendations
    
    # Summary
    local total_failed=${#FAILED_CHECKS[@]}
    
    echo "" | tee -a "$AUDIT_REPORT"
    echo "AUDIT SUMMARY" | tee -a "$AUDIT_REPORT"
    echo "=============" | tee -a "$AUDIT_REPORT"
    echo "Critical Issues: $total_failed" | tee -a "$AUDIT_REPORT"
    echo "Report Location: $AUDIT_REPORT" | tee -a "$AUDIT_REPORT"
    echo "" | tee -a "$AUDIT_REPORT"
    
    if [[ $total_failed -eq 0 ]]; then
        echo -e "${GREEN}🎉 Security audit completed - No critical issues found!${NC}"
    else
        echo -e "${RED}⚠️ Security audit completed - $total_failed critical issues found${NC}"
        echo -e "${YELLOW}Please review the report and address the issues listed${NC}"
    fi
    
    echo "Full report available at: $AUDIT_REPORT"
}

# Run the audit
main "$@"
```

---

## **Course Summary and Best Practices Checklist**

### **🎓 Complete Shell Scripting Mastery Checklist**

```bash
#!/usr/bin/env bash

# Shell Scripting Mastery Assessment Tool
# Use this to verify your understanding of all course concepts

echo "🎓 Shell Scripting Mastery Assessment"
echo "======================================"
echo ""

# Track scores
correct=0
total=0

ask_question() {
    local question="$1"
    local correct_answer="$2"
    local explanation="$3"
    
    ((total++))
    echo "Question $total: $question"
    read -p "Your answer: " user_answer
    
    if [[ "${user_answer,,}" == "${correct_answer,,}" ]]; then
        echo "✅ Correct!"
        ((correct++))
    else
        echo "❌ Incorrect. The answer is: $correct_answer"
        echo "💡 Explanation: $explanation"
    fi
    echo ""
}

# Assessment questions covering all course topics
echo "📚 COURSE CONCEPT REVIEW"
echo "========================"

ask_question \
    "What does 'set -euo pipefail' do in a bash script?" \
    "enables strict error handling" \
    "This enables exit on error (-e), exit on undefined variables (-u), and exit on pipe failures (-o pipefail)"

ask_question \
    "How do you make a script executable?" \
    "chmod +x script.sh" \
    "This adds execute permissions for the owner, group, and others"

ask_question \
    "What's the difference between \$* and \$@?" \
    "\$* treats all arguments as single string, \$@ treats them as separate" \
    "\$* joins all arguments with the first character of IFS, \$@ preserves individual arguments"

ask_question \
    "Which loop type would you use for a known number of iterations?" \
    "for loop" \
    "For loops are ideal when you know the number of iterations or have a list to iterate over"

ask_question \
    "What does 'local' keyword do in a function?" \
    "creates function-scoped variables" \
    "Local variables exist only within the function and don't affect global scope"

ask_question \
    "How do you redirect both stdout and stderr to a file?" \
    "&> file or > file 2>&1" \
    "Both syntaxes redirect all output to a file"

ask_question \
    "What's the purpose of double brackets [[ ]] vs single brackets [ ]?" \
    "double brackets support pattern matching and are bash-specific" \
    "Double brackets are a bash builtin with extended features like pattern matching and regex support"

# Calculate and display score
percentage=$((correct * 100 / total))

echo "📊 ASSESSMENT RESULTS"
echo "===================="
echo "Score: $correct out of $total ($percentage%)"

if [[ $percentage -ge 90 ]]; then
    echo "🏆 EXCELLENT! You've mastered shell scripting!"
elif [[ $percentage -ge 75 ]]; then
    echo "🎉 GOOD! You have a solid understanding of shell scripting"
elif [[ $percentage -ge 60 ]]; then
    echo "👍 FAIR! Review the concepts you missed and practice more"
else
    echo "📚 NEEDS IMPROVEMENT! Review the course materials and practice"
fi

echo ""
echo "🚀 RECOMMENDED NEXT STEPS:"
echo "=========================="

if [[ $percentage -ge 75 ]]; then
    echo "✨ You're ready for advanced topics:"
    echo "   - Advanced system administration scripts"
    echo "   - DevOps automation with shell scripts"
    echo "   - Performance optimization techniques"
    echo "   - Security hardening scripts"
else
    echo "📖 Focus on these fundamentals:"
    echo "   - Practice writing functions"
    echo "   - Master loops and conditionals"
    echo "   - Learn proper error handling"
    echo "   - Study the provided examples"
fi

echo ""
echo "💡 BONUS PRACTICE CHALLENGES:"
echo "=============================="
echo "1. Create a system backup script with rotation"
echo "2. Build a log analyzer with email alerts"
echo "3. Write a deployment automation script"
echo "4. Develop a system monitoring dashboard"
echo "5. Create a security audit tool"
```

### **🎯 Final Course Summary**

**Congratulations! You've completed the comprehensive Linux Shell Scripting course!**

#### **📋 What You've Learned:**

**Part 1: Foundations**
- ✅ Shell basics and script structure
- ✅ Variables and user input
- ✅ File permissions and execution
- ✅ Conditional statements and comparisons

**Part 2: Control Structures**
- ✅ All types of loops (for, while, until)
- ✅ Case statements and pattern matching
- ✅ Functions and modular programming
- ✅ Argument processing and file handling

**Part 3: Advanced Features**
- ✅ Professional logging systems
- ✅ Debugging techniques and tools
- ✅ System automation and monitoring
- ✅ Cron scheduling and maintenance
- ✅ Interactive menus and colors

**Part 4: Professional Development**
- ✅ Best practices and code quality
- ✅ Reusable utility libraries
- ✅ Database operations
- ✅ Configuration management

**Part 5: Real-World Applications**
- ✅ Complete deployment scripts
- ✅ Security audit tools
- ✅ Performance monitoring
- ✅ Professional templates

#### **🏆 Key Achievements:**

1. **Script Architecture**: You can now design well-structured, maintainable scripts
2. **Error Handling**: You understand proper error handling and debugging techniques
3. **Automation**: You can automate complex system administration tasks
4. **Security**: You know how to write secure scripts and audit systems
5. **Performance**: You understand optimization techniques and monitoring
6. **Professional Standards**: You follow industry best practices and coding standards

#### **🚀 Your Shell Scripting Toolkit:**

```bash
# Essential tools you now master:
- Variables and arrays
- Functions and libraries  
- Loops and conditionals
- Error handling and debugging
- Logging and monitoring
- Security and permissions
- File operations and processing
- Network utilities
- Database operations
- System automation
- Interactive interfaces
- Professional templates
```

#### **🌟 Next Steps in Your Journey:**

1. **Advanced Topics to Explore:**
   - Advanced regex and text processing
   - Parallel processing and job control
   - Integration with configuration management tools
   - Cloud automation scripts
   - Container orchestration scripts

2. **Practice Projects:**
   - Build your own system administration toolkit
   - Create deployment pipelines
   - Develop monitoring and alerting systems
   - Write security compliance tools

3. **Career Applications:**
   - DevOps automation
   - System administration
   - Site reliability engineering
   - Security operations
   - Infrastructure as code

#### **📚 Resources for Continued Learning:**

- **Advanced Bash Guide**: Continue with more complex scenarios
- **System Administration**: Apply scripts to real-world systems
- **DevOps Tools**: Integrate with Docker, Kubernetes, CI/CD
- **Security**: Develop security-focused automation
- **Open Source**: Contribute to shell script projects

---

## **🎉 Graduation Certificate**

```
╔═══════════════════════════════════════════════════════════╗
║                    CERTIFICATE OF COMPLETION             ║
║                                                           ║
║                 🎓 SHELL SCRIPTING MASTERY 🎓             ║
║                                                           ║
║    This certifies that you have successfully completed   ║
║         the Complete Linux Shell Scripting Course       ║
║                                                           ║
║                        🏆 SKILLS MASTERED 🏆              ║
║    • Advanced Bash Scripting & Automation               ║
║    • System Administration & Security                    ║
║    • Professional Development Practices                  ║
║    • Real-World Problem Solving                         ║
║                                                           ║
║              "Scripts are like recipes -                ║
║               write once, use forever!"                  ║
║                                                           ║
║    🚀 Ready for Advanced System Administration! 🚀       ║
╚═══════════════════════════════════════════════════════════╝
```

**Remember**: The best way to master shell scripting is through practice. Use the templates and examples from this course as starting points for your own projects. Keep the "Magic Mantra" in mind: **"Scripts are like recipes - write once, use forever!"**

Happy scripting! 🚀✨
