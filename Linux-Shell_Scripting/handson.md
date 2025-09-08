# Linux OS & Administration - 100% Hands-On Training

## 🚀 Welcome to Linux Administration Mastery!

**Magic Mantra: "Linux is like a house - master the keys (commands) and you control every room!"**

---

## 📋 Table of Contents
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
```

```bash
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
└── nobody (UID 65534

### Step 7: Alternative Package Managers (Snap)
```bash
# Check if Snap is available
echo "=== SNAP PACKAGE MANAGER ==="
if command -v snap >/dev/null 2>&1; then
    echo "✅ Snap is available"
    
    # List installed snaps
    echo ""
    echo "Installed Snap packages:"
    snap list | head -10
    
    # Search for snap packages
    echo ""
    echo "Searching for code editors in Snap:"
    snap find editor | head -5
    
    # Show snap info
    echo ""
    echo "Example snap package info:"
    snap info code 2>/dev/null | head -10 || echo "VS Code snap not available"
    
else
    echo "❌ Snap is not available"
    echo "To install Snap:"
    echo "sudo apt install snapd"
fi

# Check if Flatpak is available
echo ""
echo "=== FLATPAK PACKAGE MANAGER ==="
if command -v flatpak >/dev/null 2>&1; then
    echo "✅ Flatpak is available"
    flatpak list | head -5
else
    echo "❌ Flatpak is not available"
    echo "To install Flatpak:"
    echo "sudo apt install flatpak"
fi
```

### Step 8: Repository Management
```bash
# List current repositories
echo "=== REPOSITORY MANAGEMENT ==="
echo "Current APT repositories:"
cat /etc/apt/sources.list | grep -v '^#' | head -5

echo ""
echo "Additional repositories:"
ls /etc/apt/sources.list.d/ 2>/dev/null | head -5 || echo "No additional repositories"

# Show repository keys
echo ""
echo "Repository keys:"
apt-key list 2>/dev/null | grep -A 1 "pub" | head -10 || echo "Use apt-key is deprecated"

# Check repository status
echo ""
echo "Repository update status:"
find /var/lib/apt/lists -name "*Release*" -type f | head -5
```

## 🎯 Practice Exercise 8.1: Complete Package Management Lab
```bash
# Create comprehensive package management lab
cat << 'EOF' > package_management_lab.sh
#!/bin/bash
# Package Management Laboratory

echo "=== PACKAGE MANAGEMENT LABORATORY ==="
echo "Lab started: $(date)"
echo "System: $(lsb_release -d 2>/dev/null | cut -f2 || echo 'Unknown')"
echo ""

# Detect package manager
detect_package_manager() {
    if command -v apt >/dev/null 2>&1; then
        echo "apt"
    elif command -v yum >/dev/null 2>&1; then
        echo "yum"
    elif command -v dnf >/dev/null 2>&1; then
        echo "dnf"
    elif command -v pacman >/dev/null 2>&1; then
        echo "pacman"
    elif command -v zypper >/dev/null 2>&1; then
        echo "zypper"
    else
        echo "unknown"
    fi
}

PKG_MGR=$(detect_package_manager)
echo "1. PACKAGE MANAGER DETECTION"
echo "============================="
echo "Detected package manager: $PKG_MGR"
echo ""

# System package statistics
echo "2. PACKAGE STATISTICS"
echo "====================="
case $PKG_MGR in
    apt)
        total_packages=$(apt list --installed 2>/dev/null | wc -l)
        upgradable=$(apt list --upgradable 2>/dev/null | wc -l)
        echo "Total installed packages: $((total_packages - 1))"
        echo "Upgradable packages: $((upgradable - 1))"
        echo "Package cache size: $(du -sh /var/cache/apt 2>/dev/null | cut -f1 || echo 'Unknown')"
        ;;
    yum|dnf)
        echo "Total installed packages: $(rpm -qa | wc -l)"
        echo "Package cache size: $(du -sh /var/cache/$PKG_MGR 2>/dev/null | cut -f1 || echo 'Unknown')"
        ;;
    *)
        echo "Package statistics not available for $PKG_MGR"
        ;;
esac
echo ""

# Essential packages check
echo "3. ESSENTIAL PACKAGES CHECK"
echo "============================"
essential_packages="curl wget git vim htop tree"
echo "Checking essential development tools:"

for pkg in $essential_packages; do
    if command -v $pkg >/dev/null 2>&1; then
        version=$(($pkg --version 2>/dev/null || $pkg -V 2>/dev/null || echo "unknown") | head -1)
        echo "✅ $pkg: installed ($version)"
    else
        echo "❌ $pkg: not installed"
    fi
done
echo ""

# Package search demonstration
echo "4. PACKAGE SEARCH DEMONSTRATION"
echo "================================"
case $PKG_MGR in
    apt)
        echo "Searching for text editors:"
        apt search "text editor" 2>/dev/null | head -3 | grep -E "^[a-z]" || echo "Search results not available"
        echo ""
        echo "Searching for development tools:"
        apt search "development" 2>/dev/null | head -3 | grep -E "^[a-z]" || echo "Search results not available"
        ;;
    *)
        echo "Search demonstration not available for $PKG_MGR"
        ;;
esac
echo ""

# Package dependency analysis
echo "5. DEPENDENCY ANALYSIS"
echo "======================"
if command -v git >/dev/null 2>&1; then
    case $PKG_MGR in
        apt)
            echo "Dependencies for 'git' package:"
            apt depends git 2>/dev/null | head -5 || echo "Dependency info not available"
            ;;
        *)
            echo "Dependency analysis not available for $PKG_MGR"
            ;;
    esac
else
    echo "Git not installed - cannot analyze dependencies"
fi
echo ""

# Repository information
echo "6. REPOSITORY INFORMATION"
echo "========================="
case $PKG_MGR in
    apt)
        echo "Active repositories:"
        grep -h "^deb " /etc/apt/sources.list /etc/apt/sources.list.d/* 2>/dev/null | head -3
        echo ""
        echo "Last repository update:"
        ls -l /var/lib/apt/lists/lock 2>/dev/null | awk '{print $6, $7, $8}' || echo "Unknown"
        ;;
    *)
        echo "Repository information not available for $PKG_MGR"
        ;;
esac
echo ""

# Package cleanup analysis
echo "7. CLEANUP OPPORTUNITIES"
echo "========================"
case $PKG_MGR in
    apt)
        orphaned=$(apt autoremove --dry-run 2>/dev/null | grep -c "^Remv" || echo "0")
        echo "Orphaned packages that can be removed: $orphaned"
        
        cache_size=$(du -sh /var/cache/apt/archives 2>/dev/null | cut -f1 || echo "Unknown")
        echo "Package cache size: $cache_size"
        
        config_files=$(dpkg -l | grep "^rc" | wc -l)
        echo "Leftover configuration files: $config_files"
        ;;
    *)
        echo "Cleanup analysis not available for $PKG_MGR"
        ;;
esac
echo ""

# Alternative package managers
echo "8. ALTERNATIVE PACKAGE MANAGERS"
echo "==============================="
echo "Snap package manager: $(command -v snap >/dev/null 2>&1 && echo 'Available' || echo 'Not available')"
if command -v snap >/dev/null 2>&1; then
    snap_count=$(snap list 2>/dev/null | tail -n +2 | wc -l)
    echo "  Installed snap packages: $snap_count"
fi

echo "Flatpak package manager: $(command -v flatpak >/dev/null 2>&1 && echo 'Available' || echo 'Not available')"
if command -v flatpak >/dev/null 2>&1; then
    flatpak_count=$(flatpak list 2>/dev/null | wc -l)
    echo "  Installed flatpak packages: $flatpak_count"
fi
echo ""

# Security updates
echo "9. SECURITY UPDATE STATUS"
echo "=========================="
case $PKG_MGR in
    apt)
        security_updates=$(apt list --upgradable 2>/dev/null | grep -c "security" || echo "0")
        echo "Available security updates: $security_updates"
        
        echo "Unattended upgrades status:"
        if [ -f /etc/apt/apt.conf.d/20auto-upgrades ]; then
            grep "APT::Periodic::Unattended-Upgrade" /etc/apt/apt.conf.d/20auto-upgrades || echo "Not configured"
        else
            echo "Unattended upgrades not configured"
        fi
        ;;
    *)
        echo "Security update information not available for $PKG_MGR"
        ;;
esac
echo ""

# Package management best practices
echo "10. PACKAGE MANAGEMENT BEST PRACTICES"
echo "====================================="
echo "✅ Regularly update package database (apt update)"
echo "✅ Install security updates promptly (apt upgrade)"
echo "✅ Remove orphaned packages (apt autoremove)"
echo "✅ Clean package cache periodically (apt autoclean)"
echo "✅ Verify package signatures and use official repositories"
echo "❌ Don't add untrusted repositories"
echo "❌ Don't ignore security updates"
echo "❌ Don't mix different package managers carelessly"
echo ""

echo "=== LABORATORY COMPLETE ==="
echo "Package manager in use: $PKG_MGR"
echo "System is $(command -v git >/dev/null 2>&1 && echo 'ready for development' || echo 'missing development tools')"
EOF

chmod +x package_management_lab.sh
./package_management_lab.sh
```

**🔍 What You Learned:**
- Each Linux distribution has its own package manager
- APT (Debian/Ubuntu): `apt update`, `apt install`, `apt search`
- Package dependencies are automatically handled
- Alternative managers: Snap, Flatpak, AppImage
- Regular updates and cleanup keep system healthy
- Security updates should be installed promptly

---

# 9. Process Management

## 🔑 Core Concept
Processes are like workers in a factory - each has a unique ID (PID), a job to do, and a supervisor (parent process). The kernel is the factory manager controlling everything!

## 📊 Process Hierarchy and States
```
Process Management Structure

Process States:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Running   │ ── │  Sleeping   │ ── │   Stopped   │
│     (R)     │    │    (S)      │    │     (T)     │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       └─────────────────────────────────────────
                          │
                   ┌─────────────┐
                   │   Zombie    │
                   │     (Z)     │
                   └─────────────┘

Process Hierarchy:
                   systemd (PID 1)
                        │
         ┌──────────────┼──────────────┐
         │              │              │
    ssh daemon     network manager   cron
    (sshd)         (NetworkManager)  (cron)
         │              │              │
    ssh session    network processes  scheduled jobs
         │
    user shell
    (bash)
         │
    user processes
    (firefox, vim, etc.)

Process Information:
PID    = Process ID (unique identifier)
PPID   = Parent Process ID  
UID    = User ID (who owns the process)
CPU%   = CPU usage percentage
MEM%   = Memory usage percentage
TIME   = CPU time consumed
CMD    = Command that started the process
```

## 🛠️ Hands-On Commands

### Step 1: Viewing Current Processes
```bash
# Basic process viewing
echo "=== BASIC PROCESS VIEWING ==="

# Show processes for current user
ps

# Show all processes with detailed info
ps aux | head -10

# Show processes in tree format
ps aux --forest | head -15

# Alternative tree view
pstree | head -10

# Show processes with custom format
ps -eo pid,ppid,user,cpu,mem,cmd | head -10
```

### Step 2: Real-time Process Monitoring
```bash
# Real-time monitoring commands
echo "=== REAL-TIME MONITORING TOOLS ==="

echo "Available monitoring tools:"
command -v top >/dev/null && echo "✅ top - basic process monitor"
command -v htop >/dev/null && echo "✅ htop - enhanced process monitor"
command -v atop >/dev/null && echo "✅ atop - advanced process monitor"

# Demonstrate top command basics
echo ""
echo "Top command shortcuts:"
echo "  q - quit"
echo "  k - kill process"
echo "  r - renice process"
echo "  M - sort by memory"
echo "  P - sort by CPU"
echo "  1 - show individual CPUs"

# Show system load
echo ""
echo "Current system load:"
uptime

# Show memory usage
echo ""
echo "Memory usage:"
free -h
```

### Step 3: Process Information and Details
```bash
# Get detailed process information
echo "=== PROCESS INFORMATION ==="

# Current shell process
echo "Current shell process:"
ps -p $

# Process environment
echo ""
echo "Current process environment variables (first 5):"
env | head -5

# Process limits
echo ""
echo "Process limits:"
ulimit -a | head -10

# System-wide process information
echo ""
echo "System process statistics:"
echo "Total processes: $(ps aux | wc -l)"
echo "Running processes: $(ps aux | grep -c ' R ')"
echo "Sleeping processes: $(ps aux | grep -c ' S ')"
echo "Zombie processes: $(ps aux | grep -c ' Z ')"
```

### Step 4: Process Search and Filtering
```bash
# Finding specific processes
echo "=== PROCESS SEARCH AND FILTERING ==="

# Find processes by name
echo "SSH-related processes:"
ps aux | grep ssh | grep -v grep

# Use pgrep to find process IDs
echo ""
echo "Process IDs for SSH:"
pgrep ssh 2>/dev/null || echo "No SSH processes found"

# Find processes by user
echo ""
echo "Processes owned by current user:"
ps -u $(whoami) | head -5

# Find processes using specific resources
echo ""
echo "Processes using the most memory:"
ps aux --sort=-%mem | head -5

echo ""
echo "Processes using the most CPU:"
ps aux --sort=-%cpu | head -5
```

### Step 5: Process Control and Signals
```bash
# Process control demonstration
echo "=== PROCESS CONTROL DEMONSTRATION ==="

# Start background processes for demonstration
echo "Starting test processes..."
sleep 100 &
PID1=$!
sleep 200 &
PID2=$!
sleep 300 &
PID3=$!

echo "Started background processes with PIDs: $PID1, $PID2, $PID3"

# Show our background jobs
echo ""
echo "Background jobs:"
jobs

# Show the processes we created
echo ""
echo "Our test processes:"
ps -p $PID1,$PID2,$PID3 2>/dev/null || echo "Some processes may have finished"

# Signal demonstration
echo ""
echo "Signal types:"
echo "  SIGTERM (15) - Graceful shutdown request"
echo "  SIGKILL (9)  - Force kill (cannot be ignored)"
echo "  SIGSTOP (19) - Pause process"
echo "  SIGCONT (18) - Resume process"

# Kill test processes
echo ""
echo "Cleaning up test processes..."
kill $PID1 $PID2 $PID3 2>/dev/null
wait 2>/dev/null  # Wait for processes to terminate
echo "Test processes terminated"
```

### Step 6: Process Priority and Nice Values
```bash
# Process priority management
echo "=== PROCESS PRIORITY MANAGEMENT ==="

# Show current process priorities
echo "Processes with their nice values:"
ps -eo pid,ni,cmd | head -10

# Explain nice values
echo ""
echo "Nice value explanation:"
echo "  Range: -20 (highest priority) to +19 (lowest priority)"
echo "  Default: 0"
echo "  Only root can set negative values"

# Start process with different nice values
echo ""
echo "Starting processes with different priorities..."

# Start low priority process
nice -n 10 sleep 60 &
LOW_PID=$!

# Start normal priority process  
sleep 60 &
NORMAL_PID=$!

echo "Started processes:"
echo "  Low priority (nice 10): PID $LOW_PID"
echo "  Normal priority (nice 0): PID $NORMAL_PID"

# Show the nice values
ps -eo pid,ni,cmd | grep sleep

# Clean up
kill $LOW_PID $NORMAL_PID 2>/dev/null
echo "Cleaned up demo processes"
```

### Step 7: Advanced Process Analysis
```bash
# Advanced process analysis
echo "=== ADVANCED PROCESS ANALYSIS ==="

# Process file descriptors
echo "File descriptors for current shell:"
ls /proc/$/fd/ | wc -l
echo "Open files count: $(ls /proc/$/fd/ | wc -l)"

# Process memory information
echo ""
echo "Memory information for current shell:"
if [ -f /proc/$/status ]; then
    grep -E "VmSize|VmRSS|VmData" /proc/$/status
fi

# System-wide process summary
echo ""
echo "System process summary:"
echo "Load average: $(uptime | awk -F'load average:' '{print $2}')"
echo "Total threads: $(ps -eT | wc -l)"
echo "Unique processes: $(ps -e | wc -l)"

# Top CPU consumers
echo ""
echo "Top 5 CPU consumers:"
ps aux --sort=-%cpu | head -6 | tail -5

# Top memory consumers
echo ""
echo "Top 5 memory consumers:"
ps aux --sort=-%mem | head -6 | tail -5
```

## 🎯 Practice Exercise 9.1: Process Management Workshop
```bash
# Create comprehensive process management workshop
cat << 'EOF' > process_management_workshop.sh
#!/bin/bash
# Process Management Workshop

echo "=== PROCESS MANAGEMENT WORKSHOP ==="
echo "Workshop started: $(date)"
echo "Performed by: $(whoami) (PID: $)"
echo ""

# Workshop environment setup
WORKSHOP_LOG="/tmp/process_workshop.log"
echo "Workshop log: $WORKSHOP_LOG"

# Function to log activities
log_activity() {
    echo "$(date '+%H:%M:%S') - $1" | tee -a $WORKSHOP_LOG
}

log_activity "Starting Process Management Workshop"

echo "1. CURRENT SYSTEM STATE"
echo "======================="
log_activity "Analyzing current system state"

echo "System uptime and load:"
uptime

echo ""
echo "Memory usage:"
free -h | grep -E "Mem:|Swap:"

echo ""
echo "Current process count by state:"
echo "  Total processes: $(ps aux | wc -l)"
echo "  Running (R): $(ps aux | awk '$8 ~ /R/ {count++} END {print count+0}')"
echo "  Sleeping (S): $(ps aux | awk '$8 ~ /S/ {count++} END {print count+0}')"
echo "  Zombie (Z): $(ps aux | awk '$8 ~ /Z/ {count++} END {print count+0}')"
echo ""

echo "2. PROCESS HIERARCHY ANALYSIS"
echo "=============================="
log_activity "Analyzing process hierarchy"

echo "Process tree (top levels):"
pstree -p $ | head -5

echo ""
echo "Init system process:"
ps -p 1 -o pid,cmd

echo ""
echo "My parent process:"
parent_pid=$(ps -o ppid= -p $)
ps -p $parent_pid -o pid,ppid,cmd 2>/dev/null || echo "Parent process not found"
echo ""

echo "3. RESOURCE CONSUMPTION ANALYSIS"
echo "================================="
log_activity "Analyzing resource consumption"

echo "Top 5 CPU consumers:"
ps aux --sort=-%cpu | head -6 | awk 'NR==1 || NR>1 {printf "%-8s %-6s %-6s %s\n", $2, $3, $4, $11}'

echo ""
echo "Top 5 memory consumers:"
ps aux --sort=-%mem | head -6 | awk 'NR==1 || NR>1 {printf "%-8s %-6s %-6s %s\n", $2, $3, $4, $11}'

echo ""
echo "Process count by user:"
ps aux | awk 'NR>1 {users[$1]++} END {for(u in users) printf "%-15s %d\n", u, users[u]}' | sort -k2 -nr | head -5
echo ""

echo "4. INTERACTIVE PROCESS MANAGEMENT"
echo "=================================="
log_activity "Demonstrating process management"

# Create test processes
echo "Creating test processes for management demonstration..."

# CPU-intensive process
(while true; do :; done) &
CPU_PID=$!

# I/O process
(while true; do echo "test" > /dev/null; sleep 1; done) &
IO_PID=$!

# Memory process (allocate small amount)
(head -c 10M /dev/zero > /dev/null; sleep 60) &
MEM_PID=$!

log_activity "Created test processes: CPU=$CPU_PID, IO=$IO_PID, MEM=$MEM_PID"

echo "Test processes created:"
echo "  CPU-intensive: PID $CPU_PID"
echo "  I/O process: PID $IO_PID"  
echo "  Memory process: PID $MEM_PID"

# Monitor the processes
echo ""
echo "Monitoring test processes:"
ps -p $CPU_PID,$IO_PID,$MEM_PID -o pid,pcpu,pmem,time,cmd 2>/dev/null

# Process control demonstration
echo ""
echo "Demonstrating process control:"

# Suspend and resume
echo "  Suspending I/O process..."
kill -STOP $IO_PID 2>/dev/null
sleep 2
echo "  Process state after STOP:"
ps -p $IO_PID -o pid,stat,cmd 2>/dev/null | grep -v PID

echo "  Resuming I/O process..."
kill -CONT $IO_PID 2>/dev/null
sleep 1
echo "  Process state after CONT:"
ps -p $IO_PID -o pid,stat,cmd 2>/dev/null | grep -v PID

# Priority adjustment
echo ""
echo "  Adjusting process priority:"
original_nice=$(ps -p $MEM_PID -o ni= 2>/dev/null | tr -d ' ')
echo "  Original nice value: $original_nice"

renice +5 $MEM_PID >/dev/null 2>&1
new_nice=$(ps -p $MEM_PID -o ni= 2>/dev/null | tr -d ' ')
echo "  New nice value: $new_nice"

# Clean up test processes
echo ""
echo "  Cleaning up test processes..."
kill $CPU_PID $IO_PID $MEM_PID 2>/dev/null
sleep 2

# Verify cleanup
remaining=$(ps -p $CPU_PID,$IO_PID,$MEM_PID 2>/dev/null | wc -l)
if [ $remaining -eq 1 ]; then
    echo "  ✅ All test processes terminated successfully"
else
    echo "  ⚠️  Some processes may still be running"
    ps -p $CPU_PID,$IO_PID,$MEM_PID 2>/dev/null || true
fi

log_activity "Test processes cleaned up"
echo ""

echo "5. SYSTEM MONITORING TOOLS"
echo "=========================="
log_activity "Checking monitoring tools"

echo "Available monitoring tools:"
for tool in top htop atop iotop; do
    if command -v $tool >/dev/null 2>&1; then
        echo "  ✅ $tool - $(which $tool)"
    else
        echo "  ❌ $tool - not installed"
    fi
done

echo ""
echo "Process monitoring commands summary:"
echo "  ps aux           - snapshot of all processes"
echo "  ps -ef           - alternative process view"
echo "  pstree           - process hierarchy tree"
echo "  top              - real-time process monitor"
echo "  htop             - enhanced real-time monitor"
echo "  pgrep <name>     - find processes by name"
echo "  pkill <name>     - kill processes by name"
echo "  jobs             - show background jobs"
echo "  nohup <cmd> &    - run process immune to hangups"
echo ""

echo "6. BEST PRACTICES"
echo "================="
log_activity "Documenting best practices"

echo "Process management best practices:"
echo "  ✅ Use SIGTERM (15) before SIGKILL (9)"
echo "  ✅ Monitor system load and memory usage"
echo "  ✅ Use nice values for CPU-intensive tasks"
echo "  ✅ Clean up zombie processes"
echo "  ✅ Monitor for runaway processes"
echo "  ❌ Don't kill system processes randomly"
echo "  ❌ Don't ignore high load averages"
echo "  ❌ Don't run untrusted processes as root"
echo ""

echo "Signal reference:"
echo "  1  - SIGHUP    (hangup, reload config)"
echo "  2  - SIGINT    (interrupt, Ctrl+C)"
echo "  9  - SIGKILL   (force kill, cannot be caught)"
echo "  15 - SIGTERM   (terminate gracefully)"
echo "  18 - SIGCONT   (continue if stopped)"
echo "  19 - SIGSTOP   (stop process)"
echo ""

log_activity "Workshop completed successfully"
echo "=== WORKSHOP COMPLETE ==="
echo "Log file: $WORKSHOP_LOG"
echo "Current system load: $(uptime | awk -F'load average:' '{print $2}')"
EOF

chmod +x process_management_workshop.sh
./process_management_workshop.sh
```

**🔍 What You Learned:**
- Every process has unique PID and parent PPID
- Process states: Running (R), Sleeping (S), Stopped (T), Zombie (Z)
- Commands: `ps`, `top`, `htop`, `pgrep`, `kill`, `jobs`
- Signals: SIGTERM (15), SIGKILL (9), SIGSTOP (19), SIGCONT (18)
- Nice values control priority: -20 (highest) to +19 (lowest)
- Process hierarchy starts with systemd (PID 1)

---

Due to length constraints, I'll create the **Linux Shell Scripting** document as a separate response. This Linux OS & Administration document covers all the essential hands-on commands and concepts you requested with clear explanations, visual diagrams, and practical exercises.

Would you like me to continue with the remaining chapters (10-18) of the Linux OS & Administration document, or would you prefer me to create the separate Linux Shell Scripting document now?## 🛠️ Hands-On Commands

### Step 1: Understanding Current User Environment
```bash
# Who am I?
whoami

# My user ID and group information
id

# Detailed user information
id $(whoami)

# My groups
groups

# Who's currently logged in?
who

# More detailed who information
w

# Login history
last | head -10
```

### Step 2: Examining User Database Files
```bash
# View user database (first 10 entries)
head -10 /etc/passwd

# Find my user entry
grep "^$(whoami):" /etc/passwd

# View group database (first 10 entries)
head -10 /etc/group

# Find groups I belong to
groups $(whoami) | tr ' ' '\n'

# Check shadow file (requires root)
sudo head -5 /etc/shadow 2>/dev/null || echo "No permission to view shadow file"
```

### Step 3: User Information Commands
```bash
# Get user information by name
getent passwd $(whoami)

# Get group information by name
getent group $(groups | cut -d' ' -f1)

# List all users on system
cut -d: -f1 /etc/passwd | sort

# List all groups on system
cut -d: -f1 /etc/group | sort

# Count users and groups
echo "Total users: $(wc -l < /etc/passwd)"
echo "Total groups: $(wc -l < /etc/group)"
```

### Step 4: User Management (Requires sudo)
```bash
# Add a new user (interactive)
# sudo adduser testuser

# Add user with specific settings (non-interactive)
sudo useradd -m -s /bin/bash -c "Test User" testuser 2>/dev/null || echo "User might already exist"

# Set password for user
echo "Setting password for testuser..."
sudo passwd testuser 2>/dev/null || echo "Password setting skipped (requires interaction)"

# Add user to group
sudo usermod -a -G sudo testuser 2>/dev/null || echo "User modification skipped"

# Check user was created
getent passwd testuser || echo "User testuser not found"

# Lock a user account
sudo usermod -L testuser 2>/dev/null || echo "User lock skipped"

# Unlock a user account
sudo usermod -U testuser 2>/dev/null || echo "User unlock skipped"
```

### Step 5: Group Management (Requires sudo)
```bash
# Create a new group
sudo groupadd developers 2>/dev/null || echo "Group might already exist"

# Add user to group
sudo usermod -a -G developers $(whoami) 2>/dev/null || echo "Group modification skipped"

# Remove user from group (requires editing /etc/group or using gpasswd)
sudo gpasswd -d $(whoami) developers 2>/dev/null || echo "Group removal skipped"

# Delete a group
sudo groupdel developers 2>/dev/null || echo "Group deletion skipped"

# Check group membership
getent group sudo | grep $(whoami) && echo "I am in sudo group" || echo "I am not in sudo group"
```

### Step 6: User Environment and Home Directory
```bash
# Explore user home directory structure
echo "=== HOME DIRECTORY STRUCTURE ==="
ls -la $HOME

# Check user's shell configuration files
echo "=== SHELL CONFIGURATION FILES ==="
ls -la $HOME/.bash* 2>/dev/null || echo "No bash config files found"
ls -la $HOME/.profile 2>/dev/null || echo "No .profile found"

# Check user's SSH directory
if [ -d "$HOME/.ssh" ]; then
    echo "=== SSH CONFIGURATION ==="
    ls -la $HOME/.ssh/
else
    echo "No SSH directory found"
fi

# User's default umask
echo "Current umask: $(umask)"

# User's environment variables
echo "=== KEY ENVIRONMENT VARIABLES ==="
echo "HOME: $HOME"
echo "USER: $USER"
echo "SHELL: $SHELL"
echo "PATH: $PATH"
```

## 🎯 Practice Exercise 6.1: User Management Lab
```bash
# Create comprehensive user analysis script
cat << 'EOF' > user_management_lab.sh
#!/bin/bash
# User Management Analysis Lab

echo "=== USER MANAGEMENT LAB ==="
echo "Analysis performed: $(date)"
echo "Performed by: $(whoami) (UID: $(id -u))"
echo ""

# Current user analysis
echo "1. CURRENT USER ANALYSIS:"
echo "   Username: $(whoami)"
echo "   User ID: $(id -u)"
echo "   Primary Group: $(id -gn)"
echo "   Primary Group ID: $(id -g)"
echo "   All Groups: $(groups)"
echo "   Home Directory: $HOME"
echo "   Default Shell: $SHELL"
echo "   Current Working Directory: $(pwd)"
echo ""

# System users overview
echo "2. SYSTEM USERS OVERVIEW:"
regular_users=$(awk -F: '$3 >= 1000 && $3 < 65534 {print $1}' /etc/passwd)
system_users=$(awk -F: '$3 < 1000 {print $1}' /etc/passwd)

echo "   Total users in system: $(wc -l < /etc/passwd)"
echo "   System users (UID < 1000): $(echo "$system_users" | wc -w)"
echo "   Regular users (UID >= 1000): $(echo "$regular_users" | wc -w)"
echo "   Regular users list: $regular_users"
echo ""

# Group analysis
echo "3. GROUP ANALYSIS:"
echo "   Total groups: $(wc -l < /etc/group)"
echo "   Groups I belong to: $(groups | wc -w)"
echo "   Administrative access:"
if groups | grep -q sudo; then
    echo "   ✅ Member of sudo group (can run sudo commands)"
else
    echo "   ❌ Not member of sudo group"
fi
if groups | grep -q wheel; then
    echo "   ✅ Member of wheel group"
else
    echo "   ❌ Not member of wheel group"
fi
echo ""

# Login information
echo "4. LOGIN INFORMATION:"
echo "   Currently logged in users:"
who | while read user tty time rest; do
    echo "     $user on $tty since $time"
done
echo ""
echo "   Recent login history (last 5):"
last -n 5 | head -5
echo ""

# Home directory analysis
echo "5. HOME DIRECTORY ANALYSIS:"
if [ -d "$HOME" ]; then
    echo "   Home directory exists: $HOME"
    echo "   Home directory size: $(du -sh $HOME 2>/dev/null | cut -f1)"
    echo "   Files in home: $(find $HOME -type f 2>/dev/null | wc -l)"
    echo "   Hidden files: $(ls -la $HOME | grep '^-.*\.' | wc -l)"
    echo "   Subdirectories: $(find $HOME -type d 2>/dev/null | wc -l)"
else
    echo "   ❌ Home directory not found"
fi
echo ""

# Permission analysis
echo "6. PERMISSION ANALYSIS:"
echo "   Current umask: $(umask)"
echo "   Can write to /tmp: $(test -w /tmp && echo 'Yes' || echo 'No')"
echo "   Can read /etc/shadow: $(test -r /etc/shadow && echo 'Yes' || echo 'No')"
echo "   Can execute sudo: $(which sudo >/dev/null && echo 'Yes' || echo 'No')"
echo ""

# Security analysis
echo "7. SECURITY ANALYSIS:"
echo "   Password aging policy (from /etc/login.defs):"
grep -E "PASS_MAX_DAYS|PASS_MIN_DAYS|PASS_WARN_AGE" /etc/login.defs 2>/dev/null | head -3
echo "   Failed login attempts (recent):"
sudo lastb 2>/dev/null | head -3 || echo "   No failed login data available"
echo ""

echo "=== LAB COMPLETE ==="
EOF

chmod +x user_management_lab.sh
./user_management_lab.sh
```

**🔍 What You Learned:**
- Every user has a UID (User ID) and belongs to groups (GID)
- User info stored in `/etc/passwd`, groups in `/etc/group`, passwords in `/etc/shadow`
- Commands: `whoami`, `id`, `groups`, `who`, `last`
- User management: `useradd`, `usermod`, `passwd`, `groupadd`
- Regular users start with UID 1000, system users have UID < 1000

---

# 7. Permissions & Ownership

## 🔑 Core Concept
Linux permissions are like locks and keys: **Read (r)**, **Write (w)**, **Execute (x)** for **User**, **Group**, and **Others**. Numbers make it easy: **4+2+1 = 7 (rwx)**!

## 📊 Permission System Diagram
```
Linux Permission System

File Permission Structure:
-rwxrwxrwx
│└─┴─┴─┴─┴─┴─┴─── Permission bits
└──────────────── File type (-=file, d=directory, l=link)

Permission Breakdown:
Position 1:    File Type
                ├── - (regular file)
                ├── d (directory)  
                ├── l (symbolic link)
                ├── c (character device)
                └── b (block device)

Positions 2-4: User/Owner Permissions
Positions 5-7: Group Permissions  
Positions 8-10: Other/World Permissions

Each trio: rwx
├── r (read)    = 4
├── w (write)   = 2  
└── x (execute) = 1

Common Permission Combinations:
├── 755 = rwxr-xr-x (directories, executables)
├── 644 = rw-r--r-- (regular files)
├── 600 = rw------- (private files)
├── 777 = rwxrwxrwx (everyone full access - DANGEROUS!)
└── 000 = --------- (no access to anyone)

Special Permissions:
├── SUID (4000) - Run as file owner
├── SGID (2000) - Run as group owner  
└── Sticky (1000) - Only owner can delete
```

## 🛠️ Hands-On Commands

### Step 1: Understanding Current Permissions
```bash
# Create test files and directories for practice
mkdir -p permission_lab
cd permission_lab

# Create test files
touch file1.txt file2.txt script.sh
mkdir dir1 dir2

# View detailed permissions
ls -la

# Understand the permission format
echo "=== PERMISSION FORMAT EXPLANATION ==="
ls -l file1.txt
echo ""
echo "Format: drwxrwxrwx"
echo "d = directory (- for file)"
echo "rwx = owner permissions (user)"
echo "rwx = group permissions"  
echo "rwx = other permissions (everyone else)"
echo ""
echo "Permission values:"
echo "r (read) = 4"
echo "w (write) = 2"
echo "x (execute) = 1"
```

### Step 2: Changing File Permissions with chmod
```bash
# Using numeric notation
chmod 755 script.sh     # rwxr-xr-x (owner: rwx, group: r-x, others: r-x)
chmod 644 file1.txt     # rw-r--r-- (owner: rw-, group: r--, others: r--)
chmod 600 file2.txt     # rw------- (owner: rw-, group: ---, others: ---)

echo "=== AFTER SETTING NUMERIC PERMISSIONS ==="
ls -l file1.txt file2.txt script.sh
echo ""

# Using symbolic notation
chmod u+x file1.txt     # Add execute for user
chmod g+w file1.txt     # Add write for group
chmod o-r file1.txt     # Remove read for others

echo "=== AFTER SYMBOLIC CHANGES ==="
ls -l file1.txt
echo ""

# More symbolic examples
chmod u+rwx,g+rx,o+r script.sh    # Set specific permissions
chmod a+r file2.txt                # Add read for all (a=all)
chmod a-x file2.txt                # Remove execute for all

# Directory permissions
chmod 755 dir1          # Standard directory permissions
chmod 700 dir2          # Private directory (owner only)

echo "=== DIRECTORY PERMISSIONS ==="
ls -ld dir1 dir2
```

### Step 3: Changing Ownership with chown and chgrp
```bash
# View current ownership
echo "=== CURRENT OWNERSHIP ==="
ls -l file1.txt

# Note: chown usually requires sudo for changing to other users
# We'll demonstrate the commands but may not be able to execute them

echo ""
echo "=== OWNERSHIP CHANGE COMMANDS ==="
echo "chown user:group file     # Change owner and group"
echo "chown user file           # Change owner only"  
echo "chgrp group file          # Change group only"
echo "chown -R user:group dir/  # Recursive change"

# Change group (this might work if user belongs to the group)
# chgrp $(groups | cut -d' ' -f1) file1.txt 2>/dev/null || echo "Group change requires appropriate permissions"

# Show what we could do with sudo
echo ""
echo "Examples requiring sudo:"
echo "sudo chown root:root file1.txt"
echo "sudo chown $(whoami):$(groups | cut -d' ' -f1) file1.txt"
```

### Step 4: Understanding umask
```bash
# Check current umask
echo "=== UMASK ANALYSIS ==="
echo "Current umask: $(umask)"

# Show umask in symbolic notation
umask -S

# Demonstrate umask effect
echo ""
echo "=== UMASK DEMONSTRATION ==="
echo "Creating files with current umask:"
touch umask_test_file
mkdir umask_test_dir
ls -ld umask_test_*

# Calculate what permissions would be with different umask
echo ""
echo "Default permissions calculation:"
echo "Files: 666 - umask = actual permissions"
echo "Directories: 777 - umask = actual permissions"
echo ""
echo "Current umask: $(umask)"
echo "New file permissions: 666 - $(umask) = $(printf "%03o" $((0666 & ~$(umask))))"
echo "New directory permissions: 777 - $(umask) = $(printf "%03o" $((0777 & ~$(umask))))"
```

### Step 5: Special Permissions (SUID, SGID, Sticky Bit)
```bash
# Create examples of special permissions
echo "=== SPECIAL PERMISSIONS ==="

# Find examples of SUID files (run as owner)
echo "Examples of SUID files on system:"
find /usr/bin -perm -4000 2>/dev/null | head -5

# Find examples of SGID files (run as group)  
echo ""
echo "Examples of SGID files/directories:"
find /usr -perm -2000 2>/dev/null | head -5

# Check sticky bit on /tmp (only owner can delete files)
echo ""
echo "Sticky bit example (/tmp directory):"
ls -ld /tmp

# Demonstrate setting special permissions
chmod 4755 script.sh 2>/dev/null || echo "SUID set on script.sh"
chmod 2755 dir1 2>/dev/null || echo "SGID set on dir1"  
chmod 1755 dir2 2>/dev/null || echo "Sticky bit set on dir2"

echo ""
echo "Special permissions on our files:"
ls -l script.sh
ls -ld dir1 dir2
```

### Step 6: Advanced Permission Analysis
```bash
# Create comprehensive permission test
echo "=== ADVANCED PERMISSION TESTING ==="

# Test file accessibility
test_file="permission_test.txt"
echo "This is a test file" > $test_file

# Set different permissions and test
chmod 644 $test_file
echo "File with 644 permissions:"
ls -l $test_file
echo "Can read: $(test -r $test_file && echo 'Yes' || echo 'No')"
echo "Can write: $(test -w $test_file && echo 'Yes' || echo 'No')"
echo "Can execute: $(test -x $test_file && echo 'Yes' || echo 'No')"

echo ""
chmod 000 $test_file
echo "File with 000 permissions:"
ls -l $test_file
echo "Can read: $(test -r $test_file && echo 'Yes' || echo 'No')"
echo "Can write: $(test -w $test_file && echo 'Yes' || echo 'No')"
echo "Can execute: $(test -x $test_file && echo 'Yes' || echo 'No')"

# Restore permissions for cleanup
chmod 644 $test_file
```

## 🎯 Practice Exercise 7.1: Complete Permission Workshop
```bash
# Create comprehensive permission workshop
cat << 'EOF' > permission_workshop.sh
#!/bin/bash
# Permission Management Workshop

echo "=== PERMISSION MANAGEMENT WORKSHOP ==="
echo "Workshop started: $(date)"
echo ""

# Setup workshop environment
WORKSHOP_DIR="permission_workshop"
mkdir -p $WORKSHOP_DIR
cd $WORKSHOP_DIR

echo "1. CREATING TEST ENVIRONMENT"
echo "================================"

# Create test files with different purposes
echo "Secret data" > secret.txt
echo "#!/bin/bash\necho 'Hello World'" > hello.sh
echo "Public information" > public.txt
echo "Configuration settings" > config.conf
mkdir private_dir public_dir shared_dir

echo "✅ Created test files and directories"
echo ""

echo "2. SETTING APPROPRIATE PERMISSIONS"
echo "====================================="

# Set permissions based on file purpose
chmod 600 secret.txt        # Private file (owner read/write only)
chmod 755 hello.sh          # Executable script
chmod 644 public.txt        # Public readable file
chmod 640 config.conf       # Config file (owner rw, group r)

# Directory permissions
chmod 700 private_dir       # Private directory
chmod 755 public_dir        # Public directory  
chmod 770 shared_dir        # Shared group directory

echo "✅ Set permissions based on security requirements"
echo ""

echo "3. PERMISSION ANALYSIS"
echo "======================"
echo "File/Directory        Permissions  Purpose"
echo "------------------------------------------------"
printf "%-20s %-12s %s\n" "secret.txt" "$(stat -c '%A' secret.txt)" "Private data"
printf "%-20s %-12s %s\n" "hello.sh" "$(stat -c '%A' hello.sh)" "Executable script"
printf "%-20s %-12s %s\n" "public.txt" "$(stat -c '%A' public.txt)" "Public file"
printf "%-20s %-12s %s\n" "config.conf" "$(stat -c '%A' config.conf)" "Configuration"
printf "%-20s %-12s %s\n" "private_dir/" "$(stat -c '%A' private_dir)" "Private directory"
printf "%-20s %-12s %s\n" "public_dir/" "$(stat -c '%A' public_dir)" "Public directory"
printf "%-20s %-12s %s\n" "shared_dir/" "$(stat -c '%A' shared_dir)" "Shared directory"
echo ""

echo "4. PERMISSION TESTING"
echo "====================="

# Test file access
echo "Testing file accessibility:"
for file in secret.txt hello.sh public.txt config.conf; do
    echo "  $file:"
    echo "    Readable: $(test -r $file && echo 'Yes' || echo 'No')"
    echo "    Writable: $(test -w $file && echo 'Yes' || echo 'No')"  
    echo "    Executable: $(test -x $file && echo 'Yes' || echo 'No')"
done
echo ""

echo "5. NUMERIC PERMISSION REFERENCE"
echo "================================"
echo "Common Permission Patterns:"
echo "  755 (rwxr-xr-x) - Directories, executable files"
echo "  644 (rw-r--r--) - Regular files"
echo "  600 (rw-------) - Private files (passwords, keys)"
echo "  640 (rw-r-----) - Group-readable configs"
echo "  700 (rwx------) - Private directories"
echo "  770 (rwxrwx---) - Group-shared directories"
echo "  777 (rwxrwxrwx) - World-writable (DANGEROUS!)"
echo ""

echo "6. SECURITY BEST PRACTICES"
echo "==========================="
echo "✅ Private files: 600 (owner only)"
echo "✅ Shared configs: 640 (group readable)"
echo "✅ Public files: 644 (world readable)"
echo "✅ Executables: 755 (world executable)"
echo "✅ Private dirs: 700 (owner only)"
echo "✅ Public dirs: 755 (world accessible)"
echo "❌ Avoid 777 permissions (security risk)"
echo "❌ Don't make files executable unless needed"
echo ""

echo "7. OWNERSHIP INFORMATION"
echo "========================"
echo "Current ownership of files:"
ls -l | grep -v '^d' | awk '{print $3, $4, $9}' | column -t
echo ""
echo "Current ownership of directories:"
ls -ld */ | awk '{print $3, $4, $9}' | column -t
echo ""

echo "8. UMASK ANALYSIS"
echo "================="
echo "Current umask: $(umask)"
echo "This means new files will have permissions: $(printf "%03o" $((0666 & ~$(umask))))"
echo "And new directories will have permissions: $(printf "%03o" $((0777 & ~$(umask))))"
echo ""

# Cleanup
cd ..
echo "=== WORKSHOP COMPLETE ==="
echo "Workshop files created in: $WORKSHOP_DIR"
echo "Review the files with: ls -la $WORKSHOP_DIR"
EOF

chmod +x permission_workshop.sh
./permission_workshop.sh

# Clean up lab directory
cd ..
rm -rf permission_lab
```

**🔍 What You Learned:**
- Permissions have 3 levels: User, Group, Others
- Each level has 3 permissions: Read (4), Write (2), Execute (1)
- Common patterns: 755 (directories), 644 (files), 600 (private)
- Commands: `chmod`, `chown`, `chgrp`, `umask`
- Special permissions: SUID, SGID, Sticky bit
- Security principle: Give minimum necessary permissions

---

# 8. Package Management

## 🔑 Core Concept
Package managers are like app stores for Linux! **APT** (Debian/Ubuntu), **YUM/DNF** (RedHat/CentOS), **Pacman** (Arch), **Zypper** (SUSE) - each distribution has its own store!

## 📊 Package Management Ecosystem
```
Package Management Systems

Debian/Ubuntu Family (APT)
├── apt update           ← Update package list
├── apt upgrade          ← Upgrade packages
├── apt install <pkg>    ← Install package
├── apt remove <pkg>     ← Remove package
├── apt search <term>    ← Search packages
└── dpkg -i <file.deb>   ← Install .deb file

RedHat/CentOS Family
├── yum (CentOS 7)
│   ├── yum update
│   ├── yum install <pkg>
│   └── yum search <term>
└── dnf (CentOS 8+/Fedora)
    ├── dnf update
    ├── dnf install <pkg>
    └── dnf search <term>

Universal Packages
├── Snap Packages
│   ├── snap install <pkg>
│   ├── snap list
│   └── snap remove <pkg>
├── Flatpak
│   ├── flatpak install <pkg>
│   └── flatpak list
└── AppImage
    └── ./application.AppImage

Package Dependencies
Application Package
├── Library A (dependency)
├── Library B (dependency)
│   └── Library C (sub-dependency)
└── Configuration Files
```

## 🛠️ Hands-On Commands

### Step 1: Identify Your Package Manager
```bash
# Detect which package manager is available
echo "=== PACKAGE MANAGER DETECTION ==="

if command -v apt >/dev/null 2>&1; then
    echo "✅ APT package manager detected (Debian/Ubuntu)"
    PKG_MGR="apt"
elif command -v yum >/dev/null 2>&1; then
    echo "✅ YUM package manager detected (CentOS 7/RHEL 7)"
    PKG_MGR="yum"
elif command -v dnf >/dev/null 2>&1; then
    echo "✅ DNF package manager detected (CentOS 8+/Fedora)"
    PKG_MGR="dnf"
elif command -v pacman >/dev/null 2>&1; then
    echo "✅ Pacman package manager detected (Arch Linux)"
    PKG_MGR="pacman"
elif command -v zypper >/dev/null 2>&1; then
    echo "✅ Zypper package manager detected (openSUSE)"
    PKG_MGR="zypper"
else
    echo "❌ No recognized package manager found"
    PKG_MGR="unknown"
fi

echo "Package manager in use: $PKG_MGR"
echo ""
```

### Step 2: Basic Package Operations (APT-based systems)
```bash
# Update package database
echo "=== UPDATING PACKAGE DATABASE ==="
sudo apt update

# List upgradable packages
echo ""
echo "=== CHECKING FOR UPGRADES ==="
apt list --upgradable | head -10

# Search for packages
echo ""
echo "=== SEARCHING FOR PACKAGES ==="
apt search htop | head -5
apt search "text editor" | head -3

# Show package information
echo ""
echo "=== PACKAGE INFORMATION ==="
apt show htop | head -15
```

### Step 3: Installing and Managing Packages
```bash
# Install essential packages
echo "=== INSTALLING ESSENTIAL PACKAGES ==="
packages="curl wget git vim htop tree ncdu"

for pkg in $packages; do
    if ! command -v $pkg >/dev/null 2>&1; then
        echo "Installing $pkg..."
        sudo apt install -y $pkg
    else
        echo "$pkg is already installed"
    fi
done

echo ""
echo "=== VERIFYING INSTALLATIONS ==="
for pkg in $packages; do
    if command -v $pkg >/dev/null 2>&1; then
        echo "✅ $pkg: $(which $pkg)"
    else
        echo "❌ $pkg: Not found"
    fi
done
```

### Step 4: Package Information and Dependencies
```bash
# List installed packages
echo "=== INSTALLED PACKAGES ANALYSIS ==="
installed_count=$(apt list --installed 2>/dev/null | wc -l)
echo "Total installed packages: $((installed_count - 1))"

# Show recently installed packages
echo ""
echo "Recent installations from log:"
grep " install " /var/log/apt/history.log 2>/dev/null | tail -5 || echo "No installation history found"

# Check package dependencies
echo ""
echo "=== DEPENDENCY ANALYSIS ==="
echo "Dependencies for 'git':"
apt depends git | head -10

# Show which packages depend on a library
echo ""
echo "Packages that depend on 'libc6':"
apt rdepends libc6 | head -10
```

### Step 5: Package Cache and Cleanup
```bash
# Check package cache
echo "=== PACKAGE CACHE ANALYSIS ==="
cache_dir="/var/cache/apt/archives"
if [ -d "$cache_dir" ]; then
    cache_size=$(du -sh $cache_dir | cut -f1)
    cache_files=$(ls $cache_dir/*.deb 2>/dev/null | wc -l)
    echo "Cache directory: $cache_dir"
    echo "Cache size: $cache_size"
    echo "Cached packages: $cache_files"
else
    echo "Package cache directory not found"
fi

# Clean package cache
echo ""
echo "=== CLEANING PACKAGE CACHE ==="
sudo apt autoclean
echo "✅ Cleaned obsolete package files"

sudo apt autoremove
echo "✅ Removed unused packages"

# Check cache size after cleanup
if [ -d "$cache_dir" ]; then
    new_cache_size=$(du -sh $cache_dir | cut -f1)
    echo "Cache size after cleanup: $new_cache_size"
fi
```

### Step 6: Working with .deb Files and External Sources
```bash
# Download a .deb file for demonstration
echo "=== WORKING WITH .DEB FILES ==="
temp_dir="/tmp/package_demo"
mkdir -p $temp_dir
cd $temp_dir

# Note: We'll simulate this since we can't download random packages
echo "Simulating .deb package operations:"
echo ""
echo "To download a .deb file:"
echo "wget https://example.com/package.deb"
echo ""
echo "To inspect a .deb file:"
echo "dpkg -I package.deb                    # Show package info"
echo "dpkg -c package.deb                    # List contents"
echo ""
echo "To install a .deb file:"
echo "sudo dpkg -i package.deb               # Install package"
echo "sudo apt -f install                    # Fix dependencies"

# Clean up
cd - > /dev/null
rm -rf $temp_dir
```

### Step 7: Alternative Package Managers (Snap)
```bash
# Check if Snap is available
echo "=== SNAP PACKAGE MANAGER ==="
if command -v snap >/dev/null 2>&1; then
    echo "✅ Snap is# Linux OS & Administration - 100% Hands-On Training

## 🚀 Welcome to Linux Administration Mastery!

**Magic Mantra: "Linux is like a house - master the keys (commands) and you control every room!"**

---

## 📋 Table of Contents
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
```

```bash
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
└── nobody (UID 65534
