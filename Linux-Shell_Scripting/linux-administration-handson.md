# Linux OS & Administration - Complete Hands-On Guide

## 🚀 Master Linux Like Magic!

**Magic Mantra: "Linux is like a house - master the keys (commands) and you control every room!"**

---

## 📋 Complete Course Contents

1. [Understanding Linux Distributions](#1-understanding-linux-distributions)
2. [Linux Boot Process & System Architecture](#2-linux-boot-process--system-architecture)
3. [Installing Linux on VirtualBox/Bare Metal](#3-installing-linux-on-virtualboxbare-metal)
4. [Terminal, SSH, and TTY Access](#4-terminal-ssh-and-tty-access)
5. [File System Hierarchy & Navigation](#5-file-system-hierarchy--navigation)
6. [User and Group Management](#6-user-and-group-management)
7. [Permissions & Ownership](#7-permissions--ownership)
8. [Package Management](#8-package-management)
9. [Process Management](#9-process-management)
10. [Service Management with systemd](#10-service-management-with-systemd)
11. [Log Files and Journald](#11-log-files-and-journald)
12. [Mounting Disks and USBs](#12-mounting-disks-and-usbs)
13. [Networking Basics](#13-networking-basics)
14. [Firewall & Security](#14-firewall--security)
15. [Crontab and Scheduled Jobs](#15-crontab-and-scheduled-jobs)
16. [File Search and Text Processing](#16-file-search-and-text-processing)
17. [Archiving and Compression](#17-archiving-and-compression)
18. [Disk Usage and Quota Management](#18-disk-usage-and-quota-management)

---

# 1. Understanding Linux Distributions

## 🔑 Core Concept
Linux distributions are like different car brands - they all have the same engine (Linux kernel) but different features, interfaces, and target audiences.

## 📊 Distribution Family Tree
```
Linux Kernel
├── Debian Family
│   ├── Ubuntu (Beginner-friendly)
│   ├── Linux Mint (Windows-like)
│   └── Kali Linux (Security)
├── Red Hat Family  
│   ├── RHEL (Enterprise)
│   ├── CentOS (Free RHEL)
│   └── Fedora (Latest features)
├── Arch Family
│   ├── Arch Linux (Advanced)
│   └── Manjaro (User-friendly Arch)
└── SUSE Family
    ├── openSUSE (Community)
    └── SLES (Enterprise)
```

## 🛠️ Hands-On Commands

### Step 1: Identify Your Current Distribution
```bash
# Method 1: Check OS release information
cat /etc/os-release
```
**Expected Output:**
```
NAME="Ubuntu"
VERSION="22.04.3 LTS (Jammy Jellyfish)"
ID=ubuntu
ID_LIKE=debian
```

```bash
# Method 2: LSB release (if available)
lsb_release -a

# Method 3: Check specific distribution files
ls /etc/*release* /etc/*version*
```

### Step 2: Check Kernel Information
```bash
# Kernel version and build info
uname -a

# Just kernel version
uname -r

# System architecture  
uname -m
```

### Step 3: System Hardware Information
```bash
# CPU information
lscpu | head -20

# Memory information
free -h

# Disk information
lsblk

# All hardware summary
sudo lshw -short | head -20
```

## 🎯 Practice Exercise 1.1: System Discovery
```bash
# Create a system information report
echo "=== SYSTEM DISCOVERY REPORT ===" > system_report.txt
echo "Generated on: $(date)" >> system_report.txt
echo "" >> system_report.txt

echo "DISTRIBUTION INFO:" >> system_report.txt
cat /etc/os-release | head -4 >> system_report.txt
echo "" >> system_report.txt

echo "KERNEL INFO:" >> system_report.txt
echo "Kernel: $(uname -r)" >> system_report.txt
echo "Architecture: $(uname -m)" >> system_report.txt
echo "" >> system_report.txt

echo "HARDWARE SUMMARY:" >> system_report.txt
echo "CPU: $(lscpu | grep 'Model name' | cut -d':' -f2 | xargs)" >> system_report.txt
echo "Memory: $(free -h | grep Mem | awk '{print $2}')" >> system_report.txt
echo "Disk: $(lsblk | grep disk | awk '{print $1, $4}' | head -1)" >> system_report.txt

cat system_report.txt
```

**🔍 What You Learned:**
- Every Linux system has identifying fingerprints
- `uname` is your go-to for kernel info
- `/etc/os-release` contains distribution details
- Hardware info commands: `lscpu`, `free`, `lsblk`, `lshw`

---

# 2. Linux Boot Process & System Architecture

## 🔑 Core Concept
Linux boot process is like waking up a person: **BIOS → Bootloader → Kernel → Init → Services**

## 📊 Boot Process Diagram
```
Power On
    ↓
┌─────────────┐
│    BIOS     │ ← Checks hardware, finds boot device
└─────────────┘
    ↓
┌─────────────┐  
│ Bootloader  │ ← GRUB loads kernel
│   (GRUB)    │
└─────────────┘
    ↓
┌─────────────┐
│   Kernel    │ ← Initializes hardware, mounts root
│   Loading   │
└─────────────┘
    ↓
┌─────────────┐
│   systemd   │ ← First process (PID 1), starts services
│  (Init)     │
└─────────────┘
    ↓
┌─────────────┐
│  Services   │ ← SSH, Network, GUI, etc.
│  Starting   │
└─────────────┘
    ↓
┌─────────────┐
│   Login     │ ← Ready for user login
│   Ready     │
└─────────────┘
```

## 🛠️ Hands-On Commands

### Step 1: Analyze Boot Messages
```bash
# View kernel boot messages
dmesg | head -30

# View boot messages with timestamps
dmesg -T | head -20

# Search for specific hardware initialization
dmesg | grep -i "cpu\|memory\|disk"
```

### Step 2: Check Boot Time and Performance
```bash
# System uptime since last boot
uptime

# When was the system last booted?
who -b

# Analyze boot time (systemd systems)
systemd-analyze

# Show time taken by each service during boot
systemd-analyze blame | head -10

# Critical chain of boot process
systemd-analyze critical-chain
```

### Step 3: Examine Init System
```bash
# Check what init system is running
ps -p 1

# Check systemd version (if using systemd)
systemctl --version

# List all systemd units
systemctl list-units --type=service | head -10
```

### Step 4: Boot Configuration
```bash
# View GRUB configuration (bootloader)
sudo cat /boot/grub/grub.cfg | head -20

# Check available kernels
ls /boot/vmlinuz*

# View kernel parameters used during boot
cat /proc/cmdline
```

## 🎯 Practice Exercise 2.1: Boot Analysis Lab
```bash
# Create comprehensive boot analysis
echo "=== BOOT ANALYSIS LAB ===" > boot_analysis.txt
echo "Analysis performed: $(date)" >> boot_analysis.txt
echo "" >> boot_analysis.txt

echo "1. BOOT TIME ANALYSIS:" >> boot_analysis.txt
systemd-analyze >> boot_analysis.txt 2>/dev/null || echo "systemd-analyze not available" >> boot_analysis.txt
echo "" >> boot_analysis.txt

echo "2. SYSTEM UPTIME:" >> boot_analysis.txt
uptime >> boot_analysis.txt
echo "" >> boot_analysis.txt

echo "3. LAST BOOT TIME:" >> boot_analysis.txt
who -b >> boot_analysis.txt
echo "" >> boot_analysis.txt

echo "4. SLOWEST SERVICES (Top 5):" >> boot_analysis.txt
systemd-analyze blame 2>/dev/null | head -5 >> boot_analysis.txt || echo "systemd-analyze not available" >> boot_analysis.txt
echo "" >> boot_analysis.txt

echo "5. INIT SYSTEM:" >> boot_analysis.txt
ps -p 1 -o comm= >> boot_analysis.txt
echo "" >> boot_analysis.txt

echo "6. KERNEL VERSION:" >> boot_analysis.txt
uname -r >> boot_analysis.txt
echo "" >> boot_analysis.txt

echo "7. KERNEL BOOT PARAMETERS:" >> boot_analysis.txt
cat /proc/cmdline >> boot_analysis.txt

cat boot_analysis.txt
```

**🔍 What You Learned:**
- Boot process has 6 main stages
- `systemd-analyze` shows boot performance
- `dmesg` contains kernel messages
- PID 1 is always the init process
- GRUB is the most common bootloader

---

# 3. Installing Linux on VirtualBox/Bare Metal

## 🔑 Core Concept
Installing Linux is like setting up a new house - you need to prepare the foundation (partitions), install the structure (OS), and configure utilities (services).

## 📊 Installation Process Flow
```
Pre-Installation
├── Download ISO
├── Create Bootable Media
├── Boot from Media
└── Choose Installation Type

    ↓

Partitioning
├── Root Partition (/)     [20-50GB]
├── Swap Partition        [RAM Size]
├── Home Partition (/home) [Remaining]
└── Boot Partition (/boot) [500MB-1GB]

    ↓

Installation
├── Copy Files
├── Install Bootloader
├── Configure Users
└── Install Software

    ↓

Post-Installation
├── Updates
├── Additional Software
├── Configuration
└── Security Setup
```

## 🛠️ Hands-On Commands

### Step 1: Check Installation Environment
```bash
# Check if running in virtual environment
sudo dmidecode -s system-manufacturer
sudo dmidecode -s system-product-name

# Check virtualization support
lscpu | grep Virtualization

# Check available storage
lsblk -f
df -h
```

### Step 2: Post-Installation System Check
```bash
# Verify successful installation
echo "=== POST-INSTALLATION VERIFICATION ==="

# Check root filesystem
mount | grep "on / "

# Check swap
swapon --show
free -h | grep Swap

# Check bootloader
sudo efibootmgr 2>/dev/null || echo "Legacy BIOS system"

# Check installed kernel
ls /boot/vmlinuz*
```

### Step 3: Initial System Updates
```bash
# Update package lists (Ubuntu/Debian)
sudo apt update

# Upgrade installed packages
sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git vim htop tree

# Check for additional updates
sudo apt list --upgradable
```

### Step 4: VirtualBox Guest Additions (if in VirtualBox)
```bash
# Check if VirtualBox Guest Additions are installed
lsmod | grep vbox

# Install Guest Additions dependencies
sudo apt install -y build-essential dkms linux-headers-$(uname -r)

# Mount Guest Additions CD (if available)
sudo mkdir -p /mnt/cdrom
sudo mount /dev/cdrom /mnt/cdrom 2>/dev/null || echo "No CD found"

# Check Guest Additions status
VBoxControl --version 2>/dev/null || echo "VirtualBox Guest Additions not installed"
```

## 🎯 Practice Exercise 3.1: Installation Readiness Assessment
```bash
# Create installation readiness report
echo "=== INSTALLATION READINESS ASSESSMENT ===" > install_readiness.txt
echo "Assessment Date: $(date)" >> install_readiness.txt
echo "" >> install_readiness.txt

echo "1. HARDWARE REQUIREMENTS:" >> install_readiness.txt
echo "   CPU Cores: $(nproc)" >> install_readiness.txt
echo "   Total Memory: $(free -h | grep Mem | awk '{print $2}')" >> install_readiness.txt
echo "   Available Storage: $(df -h / | tail -1 | awk '{print $4}')" >> install_readiness.txt
echo "" >> install_readiness.txt

echo "2. SYSTEM TYPE:" >> install_readiness.txt
if sudo dmidecode -s system-manufacturer | grep -i virtual >/dev/null 2>&1; then
    echo "   Environment: Virtual Machine" >> install_readiness.txt
    echo "   Manufacturer: $(sudo dmidecode -s system-manufacturer 2>/dev/null || echo 'Unknown')" >> install_readiness.txt
else
    echo "   Environment: Physical Machine" >> install_readiness.txt
fi
echo "" >> install_readiness.txt

echo "3. BOOT CONFIGURATION:" >> install_readiness.txt
if [ -d /sys/firmware/efi ]; then
    echo "   Boot Mode: UEFI" >> install_readiness.txt
else
    echo "   Boot Mode: Legacy BIOS" >> install_readiness.txt
fi
echo "" >> install_readiness.txt

echo "4. STORAGE LAYOUT:" >> install_readiness.txt
lsblk >> install_readiness.txt
echo "" >> install_readiness.txt

echo "5. NETWORK CONNECTIVITY:" >> install_readiness.txt
if ping -c 1 8.8.8.8 >/dev/null 2>&1; then
    echo "   Internet: Connected" >> install_readiness.txt
else
    echo "   Internet: Not Connected" >> install_readiness.txt
fi

cat install_readiness.txt
```

**🔍 What You Learned:**
- Installation requires minimum 20GB disk space
- UEFI vs BIOS affects bootloader installation
- Virtual machines need Guest Additions for full functionality
- Post-installation updates are critical for security

---

# 4. Terminal, SSH, and TTY Access

## 🔑 Core Concept
Terminal is your command center, SSH is your teleportation device, TTY is your direct line to the system!

## 📊 Access Methods Diagram
```
Linux System Access Methods

Local Access:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Desktop   │    │  Terminal   │    │   TTY/CLI   │
│    (GUI)    │◄──►│ Application │◄──►│   Direct    │
└─────────────┘    └─────────────┘    └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │    Shell    │
                   │   (bash)    │
                   └─────────────┘

Remote Access:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   SSH       │    │  VNC/RDP    │    │  Web-based  │
│  (Secure)   │    │  (Desktop)  │    │  Terminal   │
└─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │
       └──────────────────┼──────────────────┘
                          ▼
                 ┌─────────────┐
                 │ Linux Server│
                 └─────────────┘
```

## 🛠️ Hands-On Commands

### Step 1: Understanding Your Terminal Environment
```bash
# Check what terminal you're using
echo $TERM

# Check current TTY
tty

# Check your shell
echo $SHELL
echo $0

# Check shell version
bash --version | head -1

# See who's logged in and from where
who
w
```

### Step 2: Terminal Customization
```bash
# Current prompt settings
echo $PS1

# Customize your prompt (temporary)
PS1="[\u@\h \W]\$ "

# Add colors to prompt
PS1="\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ "

# Create useful aliases
alias ll='ls -la --color=auto'
alias la='ls -A --color=auto'
alias l='ls -CF --color=auto'
alias grep='grep --color=auto'
alias ..='cd ..'
alias ...='cd ../..'

# View current aliases
alias
```

### Step 3: SSH Setup and Usage
```bash
# Check SSH service status
systemctl status ssh
# OR for some systems:
systemctl status sshd

# Check SSH configuration
sudo cat /etc/ssh/sshd_config | grep -E "Port|PermitRootLogin|PasswordAuthentication"

# Generate SSH key pair (if not exists)
if [ ! -f ~/.ssh/id_rsa ]; then
    ssh-keygen -t rsa -b 4096 -C "$(whoami)@$(hostname)"
    echo "SSH key generated!"
else
    echo "SSH key already exists"
fi

# View your public key
cat ~/.ssh/id_rsa.pub 2>/dev/null || echo "No SSH key found"

# Test SSH to localhost
ssh localhost 'echo "SSH test successful - logged in as $(whoami)"'
```

### Step 4: TTY and Console Management
```bash
# List available TTYs
ls /dev/tty*

# Check current runlevel/target
systemctl get-default

# Switch between TTYs (use Ctrl+Alt+F1-F6)
echo "Use Ctrl+Alt+F1 through F6 to switch TTYs"
echo "Current TTY: $(tty)"

# Check logged in users on all TTYs
who -a
```

### Step 5: Terminal Multiplexing with Screen/Tmux
```bash
# Install screen (if not available)
which screen || sudo apt install -y screen

# Basic screen commands demo
echo "=== SCREEN COMMANDS ==="
echo "screen -S mysession    # Create named session"
echo "screen -ls             # List sessions"
echo "screen -r mysession    # Reconnect to session"
echo "Ctrl+A then D          # Detach from session"
echo "Ctrl+A then C          # Create new window"
echo "Ctrl+A then N          # Next window"

# If tmux is available
if which tmux >/dev/null 2>&1; then
    echo ""
    echo "=== TMUX COMMANDS ==="
    echo "tmux new -s mysession  # Create named session"
    echo "tmux ls                # List sessions"
    echo "tmux attach -t mysession # Reconnect"
    echo "Ctrl+B then D          # Detach"
    echo "Ctrl+B then C          # New window"
fi
```

## 🎯 Practice Exercise 4.1: Terminal Mastery Lab
```bash
# Create terminal configuration script
cat << 'EOF' > setup_terminal.sh
#!/bin/bash
# Terminal Setup Script

echo "=== TERMINAL SETUP LAB ==="

# Backup existing bashrc
if [ -f ~/.bashrc ]; then
    cp ~/.bashrc ~/.bashrc.backup.$(date +%Y%m%d)
    echo "✅ Backed up existing .bashrc"
fi

# Add custom aliases to .bashrc
echo "" >> ~/.bashrc
echo "# Custom aliases added by setup script" >> ~/.bashrc
echo "alias ll='ls -la --color=auto'" >> ~/.bashrc
echo "alias la='ls -A --color=auto'" >> ~/.bashrc
echo "alias l='ls -CF --color=auto'" >> ~/.bashrc
echo "alias grep='grep --color=auto'" >> ~/.bashrc
echo "alias ..='cd ..'" >> ~/.bashrc
echo "alias ...='cd ../..'" >> ~/.bashrc
echo "alias h='history'" >> ~/.bashrc
echo "alias c='clear'" >> ~/.bashrc

# Add custom prompt
echo "" >> ~/.bashrc
echo "# Custom prompt" >> ~/.bashrc
echo 'export PS1="\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ "' >> ~/.bashrc

# Add useful functions
echo "" >> ~/.bashrc
echo "# Useful functions" >> ~/.bashrc
echo "mkcd() { mkdir -p \"\$1\" && cd \"\$1\"; }" >> ~/.bashrc
echo "extract() {" >> ~/.bashrc
echo "  if [ -f \$1 ] ; then" >> ~/.bashrc
echo "    case \$1 in" >> ~/.bashrc
echo "      *.tar.bz2)   tar xjf \$1     ;;" >> ~/.bashrc
echo "      *.tar.gz)    tar xzf \$1     ;;" >> ~/.bashrc
echo "      *.bz2)       bunzip2 \$1     ;;" >> ~/.bashrc
echo "      *.rar)       unrar e \$1     ;;" >> ~/.bashrc
echo "      *.gz)        gunzip \$1      ;;" >> ~/.bashrc
echo "      *.tar)       tar xf \$1      ;;" >> ~/.bashrc
echo "      *.tbz2)      tar xjf \$1     ;;" >> ~/.bashrc
echo "      *.tgz)       tar xzf \$1     ;;" >> ~/.bashrc
echo "      *.zip)       unzip \$1       ;;" >> ~/.bashrc
echo "      *)           echo '\$1 cannot be extracted' ;;" >> ~/.bashrc
echo "    esac" >> ~/.bashrc
echo "  else" >> ~/.bashrc
echo "    echo '\$1 is not a valid file'" >> ~/.bashrc
echo "  fi" >> ~/.bashrc
echo "}" >> ~/.bashrc

echo "✅ Terminal configuration added to ~/.bashrc"
echo "✅ Run 'source ~/.bashrc' to apply changes"
echo ""
echo "New features added:"
echo "  - Colored prompt"
echo "  - Useful aliases (ll, la, .., etc.)"
echo "  - mkcd function (mkdir + cd)"
echo "  - extract function (universal archive extractor)"
EOF

chmod +x setup_terminal.sh
./setup_terminal.sh

# Apply new settings
source ~/.bashrc 2>/dev/null || echo "Restart terminal to see changes"

# Test new aliases
echo ""
echo "=== TESTING NEW ALIASES ==="
echo "Testing 'll' alias:"
ll | head -3
```

**🔍 What You Learned:**
- Terminal, TTY, and shell are different concepts
- SSH provides secure remote access
- Aliases and functions speed up common tasks
- `.bashrc` customizes your shell environment
- Screen/tmux allow persistent sessions

---

# 5. File System Hierarchy & Navigation

## 🔑 Core Concept
Linux file system is like a giant tree - everything starts from root (/) and branches out into directories. Every file and device is treated as a file!

## 📊 Linux File System Hierarchy
```
                    / (root)
                    │
     ┌──────────────┼──────────────┐
     │              │              │
   /bin           /etc           /home
(Essential      (Configuration   (User 
 commands)       files)         directories)
     │              │              │
     │              ├─ passwd      ├─ user1/
     │              ├─ hosts       ├─ user2/
     │              └─ fstab       └─ user3/
     │
 ┌───┴───┐
/usr    /var
(User   (Variable
programs) data)
 │        │
 ├─bin/   ├─log/     ← System logs
 ├─lib/   ├─www/     ← Web files  
 └─share/ └─tmp/     ← Temp files

Additional Important Directories:
/boot  → Boot files (kernel, initrd)
/dev   → Device files (disks, USB, etc.)
/proc  → Process information (virtual)
/sys   → System information (virtual)
/tmp   → Temporary files
/opt   → Optional software
/mnt   → Mount points for external drives
/media → Auto-mounted removable media
```

## 🛠️ Hands-On Commands

### Step 1: Basic Navigation Commands
```bash
# Where am I?
pwd

# What's here?
ls

# Show all files including hidden ones
ls -la

# Show file sizes in human readable format
ls -lh

# Show files with colors
ls --color=auto

# Tree view of directory structure
tree / -L 2 2>/dev/null || echo "Install tree: sudo apt install tree"

# Navigate to different directories
cd /              # Go to root
pwd               # Confirm location
cd ~              # Go to home directory  
pwd               # Confirm location
cd -              # Go back to previous directory
pwd               # Confirm location
```

### Step 2: Exploring the File System Hierarchy
```bash
# Essential commands directory
echo "=== ESSENTIAL COMMANDS in /bin ==="
ls -la /bin | head -10

# System configuration files
echo "=== CONFIGURATION FILES in /etc ==="
ls -la /etc | head -10

# User directories
echo "=== USER DIRECTORIES in /home ==="
ls -la /home

# System logs
echo "=== LOG FILES in /var/log ==="
sudo ls -la /var/log | head -10

# Process information (virtual filesystem)
echo "=== PROCESS INFO in /proc ==="
ls /proc | head -10

# Device files
echo "=== DEVICE FILES in /dev ==="
ls -la /dev | head -10
```

### Step 3: File and Directory Operations
```bash
# Create directories
mkdir -p lab/test/deep/nested
echo "Created nested directories"

# Create files
touch lab/file1.txt lab/file2.txt lab/test/file3.txt
echo "Created test files"

# Copy files and directories
cp lab/file1.txt lab/file1_copy.txt
cp -r lab lab_backup
echo "Copied files and directories"

# Move/rename files
mv lab/file2.txt lab/renamed_file.txt
echo "Renamed file2.txt to renamed_file.txt"

# View directory structure
tree lab 2>/dev/null || find lab -type d

# Remove files and directories
rm lab/file1_copy.txt
rm -rf lab_backup
echo "Cleaned up copied files"
```

### Step 4: Advanced Navigation Techniques
```bash
# Find commands and files
which ls           # Location of ls command
type ls            # Type of ls command
whereis ls         # All locations of ls

# Search for files
find /etc -name "*.conf" 2>/dev/null | head -5
find /usr/bin -name "*ssh*" 2>/dev/null

# Locate files (if updatedb database exists)
locate passwd 2>/dev/null | head -5 || echo "locate database not available"

# Show disk usage of directories
du -sh /var/log
du -sh /usr/bin
du -sh /home

# Show what's taking up space
df -h                    # File system usage
du -sh /*               # Space used by top-level directories
```

### Step 5: Understanding Special Directories
```bash
# Virtual filesystems (don't contain real files)
echo "=== /proc - Process Information ==="
cat /proc/version       # Kernel version
cat /proc/meminfo | head -5    # Memory info
cat /proc/cpuinfo | grep "model name" | head -1  # CPU info

echo "=== /sys - System Information ==="
ls /sys/class/          # Device classes
cat /sys/class/power_supply/*/type 2>/dev/null || echo "No power supply info"

echo "=== /dev - Device Files ==="
ls -la /dev/sd*         # Storage devices
ls -la /dev/tty*        # Terminal devices

# Temporary directories
echo "=== Temporary Directories ==="
ls -la /tmp | head -5
ls -la /var/tmp | head -5
```

## 🎯 Practice Exercise 5.1: File System Explorer
```bash
# Create comprehensive file system exploration script
cat << 'EOF' > fs_explorer.sh
#!/bin/bash
# File System Explorer

echo "=== LINUX FILE SYSTEM EXPLORER ==="
echo "Generated: $(date)"
echo ""

# Function to show directory info
show_dir_info() {
    local dir=$1
    local desc=$2
    echo "📁 $dir - $desc"
    if [ -d "$dir" ]; then
        echo "   Size: $(du -sh $dir 2>/dev/null | cut -f1)"
        echo "   Files: $(find $dir -type f 2>/dev/null | wc -l)"
        echo "   Subdirs: $(find $dir -type d 2>/dev/null | wc -l)"
        echo "   Sample contents:"
        ls -la $dir 2>/dev/null | head -3 | tail -2
    else
        echo "   Directory not found"
    fi
    echo ""
}

# Explore key directories
show_dir_info "/" "Root directory - everything starts here"
show_dir_info "/bin" "Essential commands for all users"
show_dir_info "/sbin" "System administration commands"
show_dir_info "/etc" "System configuration files"
show_dir_info "/home" "User home directories"
show_dir_info "/var" "Variable data (logs, databases, web)"
show_dir_info "/usr" "User programs and utilities"
show_dir_info "/opt" "Optional software packages"
show_dir_info "/tmp" "Temporary files"
show_dir_info "/proc" "Process and kernel information"
show_dir_info "/sys" "System and hardware information"
show_dir_info "/dev" "Device files"

# Current location analysis
echo "🎯 CURRENT LOCATION ANALYSIS:"
echo "Current directory: $(pwd)"
echo "Home directory: $HOME"
echo "Files in current directory: $(ls -1 | wc -l)"
echo "Hidden files: $(ls -1a | grep '^\\.' | wc -l)"
echo "Total disk usage here: $(du -sh . | cut -f1)"
echo ""

# File system usage summary
echo "💾 FILE SYSTEM USAGE SUMMARY:"
df -h | grep -E "Filesystem|/dev/"
echo ""

# Path information
echo "🛤️  PATH INFORMATION:"
echo "PATH variable contains $(echo $PATH | tr ':' '\\n' | wc -l) directories:"
echo $PATH | tr ':' '\n' | nl
EOF

chmod +x fs_explorer.sh
./fs_explorer.sh
```

**🔍 What You Learned:**
- Linux file system starts from root (/)
- Everything is a file in Linux
- Key directories: `/bin`, `/etc`, `/home`, `/var`, `/usr`
- Virtual directories: `/proc`, `/sys`, `/dev`
- Navigation commands: `cd`, `pwd`, `ls`, `tree`, `find`

---

# 6. User and Group Management

## 🔑 Core Concept
Users are like people in a building, groups are like departments. Every user has an ID badge (UID) and belongs to departments (groups) with specific permissions!

## 📊 User and Group Structure
```
Linux User Management Structure

System Users (UID 0-999)
├── root (UID 0)           ← Superuser
├── daemon (UID 1)         ← System services
├── bin (UID 2)            ← Binary executables
└── nobody (UID 65534)     ← Minimal privileges

Regular Users (UID 1000+)
├── user1
