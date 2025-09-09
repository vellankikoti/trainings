# Linux OS & Administration

## Chapters 1-4: Foundation & Access

**🚀 Master Linux Like Magic!**

**Magic Mantra: "Linux is like a house - master the keys (commands) and you control every room!"**

---

## 📋 Part 1 Contents

1. [Understanding Linux Distributions](#1-understanding-linux-distributions)
2. [Linux Boot Process & System Architecture](#2-linux-boot-process--system-architecture)
3. [Installing Linux on VirtualBox/Bare Metal](#3-installing-linux-on-virtualboxbare-metal)
4. [Terminal, SSH, and TTY Access](#4-terminal-ssh-and-tty-access)

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

## 🎯 Part 1 Summary

**Congratulations! You've completed Part 1 of Linux OS & Administration!**

### What You've Mastered:
✅ **Linux Distributions**: Identified your system and understood the Linux family tree  
✅ **Boot Process**: Analyzed how Linux starts from power-on to login  
✅ **Installation**: Prepared and verified Linux installations  
✅ **Terminal Access**: Mastered local and remote access methods  

### Key Commands Learned:
- `uname`, `lsb_release`, `cat /etc/os-release` - System identification
- `systemd-analyze`, `dmesg`, `who -b` - Boot analysis
- `df`, `lsblk`, `mount` - Storage and installation verification
- `ssh`, `tty`, `screen/tmux` - Terminal and remote access

### Next Steps:
**Continue to Part 2** to learn:
- File System Navigation & Hierarchy
- User and Group Management
- Permissions & Ownership
- Package Management

---
# Linux OS & Administration - Part 2
## Chapters 5-8: File Systems & Users

**🚀 Continue Your Linux Mastery Journey!**

**Magic Mantra: "In Linux, everything is a file, and every file has an owner!"**

---

## 📋 Part 2 Contents

5. [File System Hierarchy & Navigation](#5-file-system-hierarchy--navigation)
6. [User and Group Management](#6-user-and-group-management)
7. [Permissions & Ownership](#7-permissions--ownership)
8. [Package Management](#8-package-management)

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
├── user1 (UID 1000)       ← First regular user
├── user2 (UID 1001)       ← Second regular user
└── userN (UID 100N)       ← Additional users

Groups Structure
├── Primary Group          ← User's main group
│   └── Same as username (usually)
└── Secondary Groups       ← Additional groups
    ├── sudo               ← Administrative access
    ├── wheel              ← Alternative admin group
    ├── audio              ← Audio device access
    ├── video              ← Video device access
    └── plugdev            ← USB device access

File: /etc/passwd
username:x:UID:GID:GECOS:home:shell

File: /etc/group  
groupname:x:GID:members

File: /etc/shadow (encrypted passwords)
username:encrypted_password:last_change:min:max:warn:inactive:expire
```

## 🛠️ Hands-On Commands

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
echo "testuser:password123" | sudo chpasswd 2>/dev/null || echo "Password setting skipped"

# Add user to group
sudo usermod -a -G sudo testuser 2>/dev/null || echo "User modification skipped"

# Check user was created
getent passwd testuser || echo "User testuser not found"

# Lock a user account
sudo usermod -L testuser 2>/dev/null || echo "User lock skipped"

# Unlock a user account
sudo usermod -U testuser 2>/dev/null || echo "User unlock skipped"

# Remove test user (cleanup)
sudo userdel -r testuser 2>/dev/null || echo "User removal skipped"
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

### Step 3: Understanding umask
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

### Step 4: Special Permissions (SUID, SGID, Sticky Bit)
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

## 🎯 Practice Exercise 7.1: Permission Security Lab
```bash
# Create permission security laboratory
cat << 'EOF' > permission_security_lab.sh
#!/bin/bash
# Permission Security Laboratory

echo "=== PERMISSION SECURITY LABORATORY ==="
echo "Lab started: $(date)"
echo ""

# Setup lab environment
LAB_DIR="security_lab"
mkdir -p $LAB_DIR
cd $LAB_DIR

echo "1. CREATING SECURITY TEST FILES"
echo "================================"

# Create files with different security levels
echo "Top secret data" > classified.txt
echo "#!/bin/bash\necho 'System admin script'" > admin_script.sh
echo "Public information" > public_info.txt
echo "password=secret123" > config.conf
mkdir private_docs shared_folder

echo "✅ Created test files and directories"

echo ""
echo "2. APPLYING SECURITY-BASED PERMISSIONS"
echo "======================================="

# Set permissions based on security requirements
chmod 600 classified.txt       # Owner read/write only
chmod 750 admin_script.sh      # Owner execute, group read/execute
chmod 644 public_info.txt      # World readable
chmod 640 config.conf          # Group readable config
chmod 700 private_docs         # Owner only directory
chmod 755 shared_folder        # Shared directory

echo "✅ Applied security-appropriate permissions"

echo ""
echo "3. SECURITY ANALYSIS"
echo "===================="

echo "File Security Analysis:"
echo "File                   Permissions  Security Level"
echo "---------------------------------------------------"
for item in classified.txt admin_script.sh public_info.txt config.conf private_docs shared_folder; do
    perms=$(stat -c '%A' "$item" 2>/dev/null)
    case $item in
        classified.txt) level="🔴 Top Secret (owner only)" ;;
        admin_script.sh) level="🟠 Restricted (admin access)" ;;
        public_info.txt) level="🟢 Public (world readable)" ;;
        config.conf) level="🟡 Sensitive (group access)" ;;
        private_docs) level="🔴 Private (owner only)" ;;
        shared_folder) level="🔵 Shared (group collaboration)" ;;
    esac
    printf "%-22s %-12s %s\n" "$item" "$perms" "$level"
done

echo ""
echo "4. PERMISSION TESTING"
echo "====================="

echo "Testing file accessibility:"
for file in classified.txt admin_script.sh public_info.txt config.conf; do
    echo "  $file:"
    echo "    Readable: $(test -r $file && echo 'Yes' || echo 'No')"
    echo "    Writable: $(test -w $file && echo 'Yes' || echo 'No')"  
    echo "    Executable: $(test -x $file && echo 'Yes' || echo 'No')"
done

echo ""
echo "5. SECURITY RECOMMENDATIONS"
echo "==========================="
echo "✅ Sensitive files: Use 600 or 640 permissions"
echo "✅ Executable scripts: Use 750 or 755 permissions"
echo "✅ Public files: Use 644 permissions"
echo "✅ Private directories: Use 700 permissions"
echo "✅ Shared directories: Use 755 or 775 permissions"
echo "❌ Never use 777 permissions in production"
echo "❌ Avoid world-writable files"

# Cleanup
cd ..
echo ""
echo "=== SECURITY LAB COMPLETE ==="
echo "Lab files created in: $LAB_DIR"
EOF

chmod +x permission_security_lab.sh
./permission_security_lab.sh

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

## 🎯 Practice Exercise 8.1: Package Management Workshop
```bash
# Create comprehensive package management workshop
cat << 'EOF' > package_workshop.sh
#!/bin/bash
# Package Management Workshop

echo "=== PACKAGE MANAGEMENT WORKSHOP ==="
echo "Workshop started: $(date)"
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
        echo "✅ $pkg: installed"
    else
        echo "❌ $pkg: not installed"
    fi
done
echo ""

# Security updates
echo "4. SECURITY UPDATE STATUS"
echo "=========================="
case $PKG_MGR in
    apt)
        security_updates=$(apt list --upgradable 2>/dev/null | grep -c "security" || echo "0")
        echo "Available security updates: $security_updates"
        ;;
    *)
        echo "Security update information not available for $PKG_MGR"
        ;;
esac
echo ""

# Package management best practices
echo "5. BEST PRACTICES"
echo "================="
echo "✅ Regularly update package database ($PKG_MGR update)"
echo "✅ Install security updates promptly ($PKG_MGR upgrade)"
echo "✅ Remove orphaned packages ($PKG_MGR autoremove)"
echo "✅ Clean package cache periodically ($PKG_MGR autoclean)"
echo "✅ Use official repositories only"
echo "❌ Don't add untrusted repositories"
echo "❌ Don't ignore security updates"
echo ""

echo "=== WORKSHOP COMPLETE ==="
echo "System is ready for development work!"
EOF

chmod +x package_workshop.sh
./package_workshop.sh
```

**🔍 What You Learned:**
- Each Linux distribution has its own package manager
- APT (Debian/Ubuntu): `apt update`, `apt install`, `apt search`
- Package dependencies are automatically handled
- Alternative managers: Snap, Flatpak, AppImage
- Regular updates and cleanup keep system healthy
- Security updates should be installed promptly

---

## 🎯 Part 2 Summary

**Congratulations! You've completed Part 2 of Linux OS & Administration!**

### What You've Mastered:
✅ **File System Navigation**: Mastered Linux directory structure and file operations  
✅ **User Management**: Created, managed, and analyzed users and groups  
✅ **Permissions**: Secured files and directories with proper access controls  
✅ **Package Management**: Installed, updated, and managed software packages  

### Key Commands Learned:
- `ls`, `cd`, `pwd`, `find`, `tree` - File system navigation
- `whoami`, `id`, `groups`, `useradd`, `usermod` - User management
- `chmod`, `chown`, `umask`, `stat` - Permissions and ownership
- `apt`, `dpkg`, `snap` - Package management

### Security Concepts Mastered:
- File permissions (rwx) and numeric notation (755, 644, 600)
- User/Group/Other permission levels
- Special permissions (SUID, SGID, Sticky)
- Package security and trusted repositories

---
# Linux OS & Administration - Part 3
## Chapters 9-12: Processes & Services

**🚀 Continue Your Linux Mastery Journey!**

**Magic Mantra: "Processes are workers, services are managers, logs are historians!"**

---

## 📋 Part 3 Contents

9. [Process Management](#9-process-management)
10. [Service Management with systemd](#10-service-management-with-systemd)
11. [Log Files and Journald](#11-log-files-and-journald)
12. [Mounting Disks and USBs](#12-mounting-disks-and-usbs)

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
ps -p $$

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

## 🎯 Practice Exercise 9.1: Process Management Lab
```bash
# Create comprehensive process management lab
cat << 'EOF' > process_lab.sh
#!/bin/bash
# Process Management Laboratory

echo "=== PROCESS MANAGEMENT LABORATORY ==="
echo "Lab started: $(date)"
echo "Performed by: $(whoami) (PID: $$)"
echo ""

# Function to log activities
log_activity() {
    echo "$(date '+%H:%M:%S') - $1"
}

log_activity "Starting Process Management Lab"

echo "1. CURRENT SYSTEM STATE"
echo "======================="

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

echo "Process tree (top levels):"
pstree -p $$ | head -5

echo ""
echo "Init system process:"
ps -p 1 -o pid,cmd

echo ""
echo "My parent process:"
parent_pid=$(ps -o ppid= -p $$)
ps -p $parent_pid -o pid,ppid,cmd 2>/dev/null || echo "Parent process not found"
echo ""

echo "3. RESOURCE CONSUMPTION ANALYSIS"
echo "================================="

echo "Top 5 CPU consumers:"
ps aux --sort=-%cpu | head -6 | awk 'NR==1 || NR>1 {printf "%-8s %-6s %-6s %s\n", $2, $3, $4, $11}'

echo ""
echo "Top 5 memory consumers:"
ps aux --sort=-%mem | head -6 | awk 'NR==1 || NR>1 {printf "%-8s %-6s %-6s %s\n", $2, $3, $4, $11}'

echo ""
echo "Process count by user:"
ps aux | awk 'NR>1 {users[$1]++} END {for(u in users) printf "%-15s %d\n", u, users[u]}' | sort -k2 -nr | head -5
echo ""

echo "4. SYSTEM MONITORING TOOLS"
echo "=========================="

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

echo "5. BEST PRACTICES"
echo "================="

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

log_activity "Lab completed successfully"
echo "=== LAB COMPLETE ==="
echo "Current system load: $(uptime | awk -F'load average:' '{print $2}')"
EOF

chmod +x process_lab.sh
./process_lab.sh
```

**🔍 What You Learned:**
- Every process has unique PID and parent PPID
- Process states: Running (R), Sleeping (S), Stopped (T), Zombie (Z)
- Commands: `ps`, `top`, `htop`, `pgrep`, `kill`, `jobs`
- Signals: SIGTERM (15), SIGKILL (9), SIGSTOP (19), SIGCONT (18)
- Nice values control priority: -20 (highest) to +19 (lowest)
- Process hierarchy starts with systemd (PID 1)

---

# 10. Service Management with systemd

## 🔑 Core Concept
Services are like hotel staff - they run in the background serving you. **systemd** is the manager controlling when services start, stop, and restart!

## 📊 systemd Service Management
```
systemd Service Management Structure

System Boot Process:
systemd (PID 1)
├── sysinit.target
├── basic.target
├── multi-user.target
│   ├── networking.service
│   ├── ssh.service
│   ├── cron.service
│   └── custom.service
└── graphical.target (if GUI)

Service States:
├── active (running)     ← Service is working
├── inactive (dead)      ← Service is stopped
├── activating          ← Service is starting
├── deactivating        ← Service is stopping
├── failed              ← Service crashed
└── reloading           ← Service reloading config

Service Types:
├── simple    ← Basic service (default)
├── forking   ← Service forks child processes
├── oneshot   ← Run once and exit
├── notify    ← Service notifies when ready
└── idle      ← Wait until other services finish

Unit File Structure:
[Unit]
Description=My Service
After=network.target

[Service]
Type=simple
ExecStart=/path/to/executable
Restart=always
User=serviceuser

[Install]
WantedBy=multi-user.target
```

## 🛠️ Hands-On Commands

### Step 1: Understanding systemd and Service Status
```bash
# Check systemd version
echo "=== SYSTEMD INFORMATION ==="
systemctl --version

# Check system state
systemctl is-system-running

# List all services
echo ""
echo "=== SERVICE OVERVIEW ==="
echo "Total units: $(systemctl list-units --all | wc -l)"
echo "Active services: $(systemctl list-units --type=service --state=active | wc -l)"
echo "Failed services: $(systemctl list-units --type=service --state=failed | wc -l)"

# Show failed services
echo ""
echo "Failed services (if any):"
systemctl --failed
```

### Step 2: Service Status and Information
```bash
# Check specific service status
echo "=== SERVICE STATUS EXAMPLES ==="

# Common services to check
services=("ssh" "networking" "systemd-resolved" "cron")

for service in "${services[@]}"; do
    echo "Service: $service"
    if systemctl is-active --quiet "$service"; then
        echo "  Status: ✅ Active"
    else
        echo "  Status: ❌ Inactive"
    fi
    
    if systemctl is-enabled --quiet "$service" 2>/dev/null; then
        echo "  Enabled: ✅ Yes (starts at boot)"
    else
        echo "  Enabled: ❌ No"
    fi
    echo ""
done

# Detailed status of SSH service
echo "=== DETAILED SERVICE STATUS ==="
systemctl status ssh --no-pager -l
```

### Step 3: Service Control Operations
```bash
# Service control demonstration
echo "=== SERVICE CONTROL DEMONSTRATION ==="

# Note: These commands require sudo and may affect system services
# We'll show the commands but not execute them to avoid system disruption

echo "Basic service control commands:"
echo ""
echo "Start a service:"
echo "  sudo systemctl start servicename"
echo ""
echo "Stop a service:"
echo "  sudo systemctl stop servicename"
echo ""
echo "Restart a service:"
echo "  sudo systemctl restart servicename"
echo ""
echo "Reload service configuration:"
echo "  sudo systemctl reload servicename"
echo ""
echo "Enable service at boot:"
echo "  sudo systemctl enable servicename"
echo ""
echo "Disable service at boot:"
echo "  sudo systemctl disable servicename"

# Safe demonstration with a timer or socket
echo ""
echo "Safe demonstration with system timers:"
systemctl list-timers | head -5
```

### Step 4: Service Dependencies and Targets
```bash
# Service dependencies
echo "=== SERVICE DEPENDENCIES ==="

# Show what depends on network
echo "Services that depend on network:"
systemctl list-dependencies network.target | head -10

# Show what SSH depends on
echo ""
echo "SSH service dependencies:"
systemctl list-dependencies ssh | head -10

# Show current target
echo ""
echo "Current system target:"
systemctl get-default

# List all targets
echo ""
echo "Available targets:"
systemctl list-units --type=target | head -10
```

### Step 5: Creating a Custom Service
```bash
# Custom service creation demonstration
echo "=== CUSTOM SERVICE CREATION ==="

# Create a simple script for our service
SERVICE_DIR="/tmp/custom_service_demo"
mkdir -p $SERVICE_DIR

cat << 'SERVICE_SCRIPT' > $SERVICE_DIR/hello_service.sh
#!/bin/bash
# Simple service script

LOG_FILE="/tmp/hello_service.log"

echo "$(date): Hello Service started" >> $LOG_FILE

while true; do
    echo "$(date): Service is running" >> $LOG_FILE
    sleep 30
done
SERVICE_SCRIPT

chmod +x $SERVICE_DIR/hello_service.sh

# Create service unit file
cat << 'UNIT_FILE' > $SERVICE_DIR/hello.service
[Unit]
Description=Hello Demo Service
After=network.target

[Service]
Type=simple
ExecStart=/tmp/custom_service_demo/hello_service.sh
Restart=always
RestartSec=5
User=nobody

[Install]
WantedBy=multi-user.target
UNIT_FILE

echo "Created demo service files:"
echo "  Script: $SERVICE_DIR/hello_service.sh"
echo "  Unit file: $SERVICE_DIR/hello.service"
echo ""
echo "To install this service:"
echo "  sudo cp $SERVICE_DIR/hello.service /etc/systemd/system/"
echo "  sudo systemctl daemon-reload"
echo "  sudo systemctl enable hello.service"
echo "  sudo systemctl start hello.service"
echo ""
echo "To check service:"
echo "  systemctl status hello"
echo "  journalctl -u hello -f"
```

## 🎯 Practice Exercise 10.1: Service Management Lab
```bash
# Create comprehensive service management lab
cat << 'EOF' > service_lab.sh
#!/bin/bash
# Service Management Laboratory

echo "=== SERVICE MANAGEMENT LABORATORY ==="
echo "Lab started: $(date)"
echo "System: $(systemctl --version | head -1)"
echo ""

# Function to check service status
check_service() {
    local service=$1
    local status=""
    local enabled=""
    
    if systemctl is-active --quiet "$service"; then
        status="✅ Running"
    else
        status="❌ Stopped"
    fi
    
    if systemctl is-enabled --quiet "$service" 2>/dev/null; then
        enabled="✅ Enabled"
    else
        enabled="❌ Disabled"
    fi
    
    printf "%-20s %-12s %-12s\n" "$service" "$status" "$enabled"
}

echo "1. SYSTEM STATE ANALYSIS"
echo "========================="

echo "systemd system state: $(systemctl is-system-running)"
echo "Default target: $(systemctl get-default)"
echo "Current target: $(systemctl list-units --type=target --state=active | grep target | awk '{print $1}' | head -1)"
echo ""

echo "Boot performance:"
systemd-analyze | head -1
echo ""

echo "2. SERVICE INVENTORY"
echo "===================="

echo "Service status overview:"
printf "%-20s %-12s %-12s\n" "SERVICE" "STATUS" "BOOT ENABLE"
echo "------------------------------------------------"

# Common services to check
services=("ssh" "networking" "systemd-resolved" "cron" "rsyslog" "systemd-timesyncd")

for service in "${services[@]}"; do
    check_service "$service"
done

echo ""
echo "Service statistics:"
echo "  Total services: $(systemctl list-units --type=service --all | grep -c service)"
echo "  Active services: $(systemctl list-units --type=service --state=active | grep -c service)"
echo "  Failed services: $(systemctl list-units --type=service --state=failed | grep -c service)"
echo ""

echo "3. FAILED SERVICES ANALYSIS"
echo "============================"

failed_services=$(systemctl --failed --no-legend --no-pager | wc -l)
if [ $failed_services -eq 0 ]; then
    echo "✅ No failed services found"
else
    echo "❌ Found $failed_services failed services:"
    systemctl --failed --no-legend --no-pager
fi
echo ""

echo "4. SERVICE DEPENDENCIES"
echo "======================="

echo "Multi-user target dependencies (key services):"
systemctl list-dependencies multi-user.target --no-pager | grep -E "ssh|network|cron" | head -5

echo ""
echo "SSH service dependencies:"
systemctl list-dependencies ssh --no-pager | head -5
echo ""

echo "5. SERVICE TIMING ANALYSIS"
echo "=========================="

echo "Slowest services to start (boot time):"
systemd-analyze blame --no-pager | head -5

echo ""
echo "Critical path for system boot:"
systemd-analyze critical-chain --no-pager | head -3
echo ""

echo "6. TIMER AND SCHEDULED SERVICES"
echo "==============================="

echo "Active systemd timers:"
systemctl list-timers --no-pager | head -5

echo ""
echo "Next scheduled timer:"
systemctl list-timers --no-pager | head -2 | tail -1
echo ""

echo "7. SERVICE MANAGEMENT COMMANDS"
echo "==============================="

echo "Essential service management commands:"
echo ""
echo "Status and Information:"
echo "  systemctl status <service>     - Show service status"
echo "  systemctl is-active <service>  - Check if service is running"
echo "  systemctl is-enabled <service> - Check if service starts at boot"
echo "  systemctl list-units --type=service - List all services"
echo ""
echo "Control Operations (require sudo):"
echo "  systemctl start <service>      - Start service"
echo "  systemctl stop <service>       - Stop service"
echo "  systemctl restart <service>    - Restart service"
echo "  systemctl reload <service>     - Reload configuration"
echo "  systemctl enable <service>     - Enable at boot"
echo "  systemctl disable <service>    - Disable at boot"
echo ""
echo "System Analysis:"
echo "  systemd-analyze                - Boot time analysis"
echo "  systemd-analyze blame          - Service timing"
echo "  systemd-analyze critical-chain - Boot dependency chain"
echo ""

echo "=== LABORATORY COMPLETE ==="
echo "Current system state: $(systemctl is-system-running)"
echo "Active services: $(systemctl list-units --type=service --state=active | grep -c service)"
echo "Failed services: $(systemctl list-units --type=service --state=failed | grep -c service)"
EOF

chmod +x service_lab.sh
./service_lab.sh
```

**🔍 What You Learned:**
- systemd is the modern service manager for Linux
- Services have states: active, inactive, failed, enabled, disabled
- Commands: `systemctl status`, `start`, `stop`, `restart`, `enable`, `disable`
- Service dependencies ensure services start in correct order
- Service files located in `/etc/systemd/system/`
- Targets define system states (multi-user.target, graphical.target)

---

# 11. Log Files and Journald

## 🔑 Core Concept
Logs are like a system's diary - they record everything that happens! **journalctl** reads modern systemd logs, while traditional logs live in `/var/log/`

## 📊 Linux Logging Architecture
```
Linux Logging System Architecture

Modern Logging (systemd):
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Applications  │───▶│    journald     │───▶│  Journal Files  │
│   & Services    │    │  (Log Manager)  │    │ (/var/log/      │
└─────────────────┘    └─────────────────┘    │  journal/)      │
                                              └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   rsyslog       │ ← Traditional syslog
                       │  (Optional)     │
                       └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │ Traditional     │
                       │ Log Files       │
                       │ (/var/log/*.log)│
                       └─────────────────┘

Traditional Log Files:
├── /var/log/syslog       ← General system messages
├── /var/log/auth.log     ← Authentication & authorization
├── /var/log/kern.log     ← Kernel messages
├── /var/log/boot.log     ← Boot process messages
├── /var/log/dmesg        ← Hardware/driver messages
├── /var/log/mail.log     ← Mail server logs
├── /var/log/apache2/     ← Web server logs
├── /var/log/nginx/       ← Nginx web server logs
└── /var/log/apt/         ← Package management logs

Log Levels (Priority):
0 - emerg    (Emergency - system unusable)
1 - alert    (Alert - immediate action needed)
2 - crit     (Critical - critical conditions)
3 - err      (Error - error conditions)
4 - warning  (Warning - warning conditions)
5 - notice   (Notice - normal but significant)
6 - info     (Info - informational messages)
7 - debug    (Debug - debug-level messages)
```

## 🛠️ Hands-On Commands

### Step 1: Understanding systemd Journal
```bash
# Basic journalctl usage
echo "=== SYSTEMD JOURNAL BASICS ==="

# Show recent logs
echo "Recent system logs (last 20 lines):"
journalctl -n 20 --no-pager

# Follow logs in real-time (like tail -f)
echo ""
echo "To follow logs in real-time:"
echo "journalctl -f"

# Show logs since system boot
echo ""
echo "Logs since last boot (first 10):"
journalctl -b --no-pager -n 10

# Show logs for specific time period
echo ""
echo "Logs from last hour:"
journalctl --since "1 hour ago" --no-pager -n 5
```

### Step 2: Service-Specific Logs
```bash
# Service-specific logging
echo "=== SERVICE-SPECIFIC LOGS ==="

# SSH service logs
echo "SSH service logs (last 10 entries):"
journalctl -u ssh --no-pager -n 10

# System resolver logs
echo ""
echo "DNS resolver logs (last 5 entries):"
journalctl -u systemd-resolved --no-pager -n 5

# Kernel logs
echo ""
echo "Kernel messages (last 5 entries):"
journalctl -k --no-pager -n 5

# Multiple services
echo ""
echo "Network-related services:"
journalctl -u networking -u systemd-networkd --no-pager -n 3
```

### Step 3: Log Filtering and Priority
```bash
# Log filtering
echo "=== LOG FILTERING ==="

# Filter by priority
echo "Error messages from today:"
journalctl -p err --since today --no-pager -n 5

echo ""
echo "Warning and error messages:"
journalctl -p warning --no-pager -n 5

# Filter by time
echo ""
echo "Logs between specific times:"
echo "journalctl --since '2024-01-01 00:00:00' --until '2024-01-01 23:59:59'"

# Filter by user
echo ""
echo "Logs for current user:"
journalctl _UID=$(id -u) --no-pager -n 5
```

### Step 4: Traditional Log Files
```bash
# Traditional log files exploration
echo "=== TRADITIONAL LOG FILES ==="

# List log directory
echo "Contents of /var/log/:"
ls -la /var/log/ | head -10

# System log
echo ""
echo "Recent syslog entries:"
sudo tail -n 5 /var/log/syslog 2>/dev/null || echo "syslog not accessible"

# Authentication log
echo ""
echo "Recent authentication attempts:"
sudo tail -n 5 /var/log/auth.log 2>/dev/null || echo "auth.log not accessible"

# Kernel messages
echo ""
echo "Kernel ring buffer:"
dmesg | tail -5

# Package management logs
echo ""
echo "Recent package operations:"
if [ -f /var/log/apt/history.log ]; then
    sudo tail -n 3 /var/log/apt/history.log
else
    echo "APT history log not found"
fi
```

### Step 5: Log Rotation and Management
```bash
# Log rotation and management
echo "=== LOG ROTATION AND MANAGEMENT ==="

# Check log rotation configuration
echo "Log rotation configuration:"
ls /etc/logrotate.d/ | head -5

# Show logrotate configuration for syslog
echo ""
echo "Syslog rotation config:"
cat /etc/logrotate.d/rsyslog 2>/dev/null | head -10 || echo "rsyslog config not found"


# Journal disk usage
echo ""
echo "Journal disk usage:"
journalctl --disk-usage

# Journal vacuum (cleanup)
echo ""
echo "Journal cleanup commands:"
echo "  journalctl --vacuum-time=7d     # Keep last 7 days"
echo "  journalctl --vacuum-size=100M   # Keep max 100MB"
echo "  journalctl --verify             # Verify journal integrity"
```

### Step 6: Log Analysis and Monitoring
```bash
# Log analysis
echo "=== LOG ANALYSIS ==="

# Boot time analysis from logs
echo "Boot time from logs:"
journalctl -b --no-pager | head -1

# Failed service attempts
echo ""
echo "Failed systemd services:"
journalctl -p err --no-pager -n 5 | grep -i "failed\|error" | head -3

# Authentication failures
echo ""
echo "Authentication failures:"
sudo grep "authentication failure" /var/log/auth.log 2>/dev/null | tail -3 || echo "No auth failures found"

# Disk space monitoring
echo ""
echo "Log disk usage:"
du -sh /var/log/ 2>/dev/null || echo "Cannot access /var/log/"
du -sh /var/log/journal/ 2>/dev/null || echo "Cannot access journal directory"
```

## 🎯 Practice Exercise 11.1: Log Analysis Lab
```bash
# Create comprehensive log analysis lab
cat << 'EOF' > log_analysis_lab.sh
#!/bin/bash
# Log Analysis Laboratory

echo "=== LOG ANALYSIS LABORATORY ==="
echo "Lab started: $(date)"
echo "Analyzing logs for: $(hostname)"
echo ""

# Function to log our activities
log_activity() {
    echo "$(date '+%H:%M:%S') - $1"
}

log_activity "Starting log analysis laboratory"

echo "1. SYSTEM LOG OVERVIEW"
echo "======================"

# Journal statistics
if command -v journalctl >/dev/null; then
    echo "Journal system status:"
    echo "  Disk usage: $(journalctl --disk-usage 2>/dev/null | grep -o '[0-9.]*[KMGT]B' || echo 'Unknown')"
    echo "  Oldest entry: $(journalctl --no-pager -n 1 --reverse 2>/dev/null | head -1 | awk '{print $1, $2, $3}' || echo 'Unknown')"
    echo "  Newest entry: $(journalctl --no-pager -n 1 2>/dev/null | head -1 | awk '{print $1, $2, $3}' || echo 'Unknown')"
else
    echo "systemd journal not available"
fi

echo ""
echo "Traditional log files:"
if [ -d /var/log ]; then
    echo "  Log directory size: $(du -sh /var/log 2>/dev/null | cut -f1 || echo 'Unknown')"
    echo "  Number of log files: $(find /var/log -type f -name "*.log" 2>/dev/null | wc -l)"
    echo "  Largest log files:"
    find /var/log -type f -name "*.log" -exec du -h {} \; 2>/dev/null | sort -hr | head -3
else
    echo "  /var/log directory not accessible"
fi
log_activity "Completed system log overview"
echo ""

echo "2. BOOT AND SYSTEM ANALYSIS"
echo "============================"

echo "System boot analysis:"
if command -v journalctl >/dev/null; then
    echo "  Last boot time: $(journalctl -b --no-pager | head -1 | awk '{print $1, $2, $3}' 2>/dev/null || echo 'Unknown')"
    echo "  Boot messages with errors:"
    boot_errors=$(journalctl -b -p err --no-pager 2>/dev/null | wc -l)
    echo "    Error count: $boot_errors"
    if [ "$boot_errors" -gt 0 ]; then
        echo "    Sample errors:"
        journalctl -b -p err --no-pager -n 2 2>/dev/null | tail -2
    fi
else
    echo "  Boot analysis not available (systemd required)"
fi

echo ""
echo "Kernel messages:"
echo "  Recent kernel messages:"
dmesg | tail -3 2>/dev/null || echo "  dmesg not accessible"
log_activity "Completed boot and system analysis"
echo ""

echo "3. SERVICE LOG ANALYSIS"
echo "======================="

# Analyze key services
services=("ssh" "systemd-resolved" "networking" "cron")
echo "Key service log analysis:"

for service in "${services[@]}"; do
    echo "  $service service:"
    if systemctl is-active --quiet "$service" 2>/dev/null; then
        echo "    Status: Active"
        error_count=$(journalctl -u "$service" -p err --no-pager 2>/dev/null | wc -l)
        echo "    Error entries: $error_count"
        if [ "$error_count" -gt 0 ]; then
            echo "    Recent error: $(journalctl -u "$service" -p err --no-pager -n 1 2>/dev/null | tail -1)"
        fi
    else
        echo "    Status: Inactive or not found"
    fi
done
log_activity "Completed service log analysis"
echo ""

echo "4. SECURITY LOG ANALYSIS"
echo "========================="

echo "Authentication and security logs:"

# SSH connection attempts
if [ -f /var/log/auth.log ]; then
    ssh_attempts=$(sudo grep -c "sshd" /var/log/auth.log 2>/dev/null || echo "0")
    echo "  SSH connection attempts: $ssh_attempts"
    
    failed_logins=$(sudo grep -c "authentication failure" /var/log/auth.log 2>/dev/null || echo "0")
    echo "  Failed login attempts: $failed_logins"
    
    if [ "$failed_logins" -gt 0 ]; then
        echo "  Recent failed attempts:"
        sudo grep "authentication failure" /var/log/auth.log 2>/dev/null | tail -2 | while read line; do
            echo "    $line"
        done
    fi
else
    echo "  Authentication log not accessible"
fi

# Sudo usage
sudo_usage=$(journalctl _COMM=sudo --no-pager 2>/dev/null | wc -l)
echo "  Sudo command executions: $sudo_usage"

log_activity "Completed security log analysis"
echo ""

echo "5. ERROR AND WARNING ANALYSIS"
echo "=============================="

echo "System-wide error analysis:"

# Count errors by priority
if command -v journalctl >/dev/null; then
    echo "  Error counts by priority (last 24 hours):"
    error_count=$(journalctl --since "24 hours ago" -p err --no-pager 2>/dev/null | wc -l)
    warning_count=$(journalctl --since "24 hours ago" -p warning --no-pager 2>/dev/null | wc -l)
    echo "    Errors: $error_count"
    echo "    Warnings: $warning_count"
    
    if [ "$error_count" -gt 0 ]; then
        echo "  Recent critical errors:"
        journalctl --since "24 hours ago" -p err --no-pager -n 2 2>/dev/null | tail -2
    fi
else
    echo "  Error analysis not available (systemd required)"
fi

log_activity "Completed error analysis"
echo ""

echo "6. LOG MONITORING COMMANDS"
echo "=========================="

echo "Essential log monitoring commands:"
echo ""
echo "Journal Commands:"
echo "  journalctl                    - View all logs"
echo "  journalctl -f                 - Follow logs in real-time"
echo "  journalctl -u <service>       - Logs for specific service"
echo "  journalctl -p err             - Error messages only"
echo "  journalctl --since '1 hour ago' - Recent logs"
echo "  journalctl -b                 - Logs since last boot"
echo ""
echo "Traditional Log Commands:"
echo "  tail -f /var/log/syslog       - Follow system log"
echo "  grep 'error' /var/log/syslog  - Search for errors"
echo "  less /var/log/auth.log        - View auth log"
echo ""
echo "Log Management:"
echo "  journalctl --disk-usage       - Check journal disk usage"
echo "  journalctl --vacuum-time=7d   - Clean old journal entries"
echo "  logrotate /etc/logrotate.conf - Rotate traditional logs"
echo ""

echo "=== LABORATORY COMPLETE ==="
echo "Log analysis completed successfully!"
echo "Current system time: $(date)"
EOF

chmod +x log_analysis_lab.sh
./log_analysis_lab.sh
```

**🔍 What You Learned:**
- Modern logs use journalctl (systemd journal)
- Traditional logs stored in `/var/log/`
- Log levels: emergency, alert, critical, error, warning, notice, info, debug
- Service logs: `journalctl -u servicename`
- Time filtering: `--since`, `--until`
- Priority filtering: `-p err`, `-p warning`
- Log rotation keeps disk usage under control

---

# 12. Mounting Disks and USBs

## 🔑 Core Concept
Disks are like filing cabinets. You need to "mount" them (attach) before you can use them! Think of mounting like plugging in a USB drive and making it accessible.

## 📊 Linux Storage and Mount Structure
```
Linux Storage Hierarchy

Physical Storage:
├── /dev/sda           ← First SATA drive
│   ├── /dev/sda1      ← First partition
│   ├── /dev/sda2      ← Second partition
│   └── /dev/sda3      ← Third partition
├── /dev/sdb           ← Second SATA drive
├── /dev/nvme0n1       ← NVMe SSD drive
└── /dev/mmcblk0       ← SD card

Mount Points (Where drives appear):
├── /                  ← Root filesystem
├── /home              ← User data (often separate partition)
├── /boot              ← Boot files
├── /var               ← Variable data
├── /tmp               ← Temporary files
├── /mnt               ← Manual mount point
├── /media             ← Auto-mount for removable media
└── /opt               ← Optional software

File Systems:
├── ext4               ← Linux native (most common)
├── ext3/ext2          ← Older Linux filesystems
├── xfs                ← High-performance filesystem
├── btrfs              ← Advanced features (snapshots)
├── ntfs               ← Windows filesystem
├── fat32/vfat         ← Universal compatibility
└── exfat              ← Large file support

Mount Process:
Physical Device → Filesystem → Mount Point → Access
    /dev/sdb1   →    ext4    →    /mnt/usb  → /mnt/usb/files
```

## 🛠️ Hands-On Commands

### Step 1: View Storage Devices and Partitions
```bash
# List all block devices
echo "=== STORAGE DEVICE OVERVIEW ==="
lsblk

# Show detailed block device information
echo ""
echo "=== DETAILED BLOCK DEVICE INFO ==="
lsblk -f

# List partitions with sizes
echo ""
echo "=== PARTITION TABLE ==="
sudo fdisk -l | head -20

# Show mounted filesystems
echo ""
echo "=== CURRENTLY MOUNTED FILESYSTEMS ==="
mount | grep -v tmpfs | head -10

# Show disk usage of mounted filesystems
echo ""
echo "=== DISK USAGE ==="
df -h
```

### Step 2: Understanding Current Mounts
```bash
# Examine mount points
echo "=== MOUNT POINT ANALYSIS ==="

# Show all mounts in a clean format
echo "Active mount points:"
mount | column -t | head -10

# Check what's mounted where
echo ""
echo "Mount point details:"
findmnt / 2>/dev/null || echo "Root filesystem mount info not available"

# Look at /etc/fstab (permanent mounts)
echo ""
echo "Permanent mount configuration (/etc/fstab):"
cat /etc/fstab | grep -v '^#' | grep -v '^# Linux OS & Administration - Part 3
```
## Chapters 9-12: Processes & Services

**🚀 Continue Your Linux Mastery Journey!**

**Magic Mantra: "Processes are workers, services are managers, logs are historians!"**

---

## 🎯 Part 3 Summary

**Congratulations! You've completed Part 3 of Linux OS & Administration!**

### What You've Mastered:
✅ **Process Management**: Controlled and monitored system processes  
✅ **Service Management**: Managed systemd services and dependencies  
✅ **Log Analysis**: Read and analyzed system logs with journalctl  
✅ **Storage Management**: Mounted and managed disks, USBs, and filesystems  

### Key Commands Learned:
- `ps`, `top`, `htop`, `kill`, `jobs`, `pgrep` - Process management
- `systemctl`, `systemd-analyze` - Service management
- `journalctl`, `tail`, `grep` - Log analysis  
- `lsblk`, `mount`, `umount`, `df`, `fdisk` - Storage management

### System Administration Skills:
- Process states, signals, and priority management
- Service dependencies and systemd targets
- Log filtering, rotation, and monitoring
- Filesystem types and mount options
- USB device handling and permanent mounts

### Next Steps:
**Continue to Part 4** to learn:
- Networking Fundamentals
- Firewall and Security
- Scheduled Jobs with Crontab
- File Search and Text Processing
- Archiving and Compression
- Advanced Disk Management

---
# Linux OS & Administration - Part 4 
## Chapters 13-18: Advanced Administration

**🚀 Complete Your Linux Mastery Journey!**

**Magic Mantra: "Network connects, firewall protects, automation perfects!"**

---

# Linux OS & Administration - Part 4 
## Chapters 13-18: Advanced Administration

**🚀 Complete Your Linux Mastery Journey!**

**Magic Mantra: "Network connects, firewall protects, automation perfects!"**

---

## 📋 Part 4 Contents

13. [Networking Basics](#13-networking-basics)
14. [Firewall & Security](#14-firewall--security)
15. [Crontab and Scheduled Jobs](#15-crontab-and-scheduled-jobs)
16. [File Search and Text Processing](#16-file-search-and-text-processing)
17. [Archiving and Compression](#17-archiving-and-compression)
18. [Disk Usage and Quota Management](#18-disk-usage-and-quota-management)

---

# 13. Networking Basics

## 🔑 Core Concept
Networking is like a postal system. IP addresses are house addresses, ports are apartment numbers, and protocols are the delivery methods!

## 📊 Network Architecture Overview
```
Linux Network Stack

Application Layer:
├── Web Browser (HTTP/HTTPS)
├── Email Client (SMTP/POP3/IMAP)
├── SSH Client (SSH)
└── File Transfer (FTP/SFTP)
           │
Transport Layer:
├── TCP (Reliable, connection-based)
└── UDP (Fast, connectionless)
           │
Network Layer:
├── IP (Internet Protocol)
├── ICMP (Ping, error messages)
└── Routing (packet forwarding)
           │
Physical Layer:
├── Ethernet (eth0, enp0s3)
├── WiFi (wlan0, wlp2s0)
└── Loopback (lo - 127.0.0.1)

Network Configuration:
├── IP Address     ← Your address (192.168.1.100)
├── Subnet Mask    ← Your neighborhood (/24 = 255.255.255.0)
├── Gateway        ← Way out (192.168.1.1)
├── DNS Servers    ← Phone book (8.8.8.8)
└── MAC Address    ← Hardware ID (aa:bb:cc:dd:ee:ff)

Common Ports:
├── 22    ← SSH (Secure Shell)
├── 23    ← Telnet (Insecure)
├── 25    ← SMTP (Email sending)
├── 53    ← DNS (Name resolution)
├── 80    ← HTTP (Web)
├── 443   ← HTTPS (Secure web)
├── 993   ← IMAPS (Secure email)
└── 3389  ← RDP (Remote Desktop)
```

## 🛠️ Hands-On Commands

### Step 1: Network Interface Information
```bash
# Modern network interface commands
echo "=== NETWORK INTERFACE INFORMATION ==="

# Show all network interfaces (modern method)
ip addr show

# Show interfaces in brief format
ip addr show | grep -E "^[0-9]|inet "

# Show routing table
ip route show

# Legacy commands (if available)
echo ""
echo "=== LEGACY INTERFACE COMMANDS ==="
ifconfig 2>/dev/null || echo "ifconfig not available (install net-tools)"

# Show interface statistics
echo ""
echo "=== INTERFACE STATISTICS ==="
cat /proc/net/dev | head -5
```

### Step 2: Network Connectivity Testing
```bash
# Basic connectivity tests
echo "=== NETWORK CONNECTIVITY TESTING ==="

# Test connectivity to common servers
echo "Testing basic connectivity:"

# Ping test
echo "  Pinging Google DNS..."
ping -c 3 8.8.8.8

# Test name resolution
echo ""
echo "  Testing DNS resolution..."
nslookup google.com 2>/dev/null || echo "nslookup not available"

# Alternative DNS test
echo ""
echo "  Testing with host command..."
host google.com 2>/dev/null || echo "host command not available"

# Test specific ports
echo ""
echo "  Testing port connectivity..."
timeout 5 telnet google.com 80 2>/dev/null <<< "" && echo "Port 80 accessible" || echo "Port 80 test failed"
```

### Step 3: Network Configuration Analysis
```bash
# Analyze current network configuration
echo "=== NETWORK CONFIGURATION ANALYSIS ==="

# Get default route and gateway
echo "Default gateway:"
ip route | grep default

# DNS configuration
echo ""
echo "DNS configuration:"
cat /etc/resolv.conf

# Network manager status (if available)
echo ""
echo "Network manager status:"
systemctl is-active NetworkManager 2>/dev/null && echo "NetworkManager is active" || echo "NetworkManager not running"

# Show hostname and domain
echo ""
echo "System network identity:"
echo "  Hostname: $(hostname)"
echo "  FQDN: $(hostname -f 2>/dev/null || hostname)"
echo "  Domain: $(hostname -d 2>/dev/null || echo 'Not set')"
```

### Step 4: Port and Service Monitoring
```bash
# Monitor network ports and services
echo "=== PORT AND SERVICE MONITORING ==="

# Show listening ports (modern method)
echo "Listening ports and services:"
ss -tuln | head -10

# Show processes using network
echo ""
echo "Network connections with processes:"
ss -tulpn | head -10

# Legacy netstat (if available)
echo ""
echo "=== LEGACY NETSTAT COMMANDS ==="
netstat -tuln 2>/dev/null | head -10 || echo "netstat not available (install net-tools)"

# Show network statistics
echo ""
echo "Network statistics:"
ss -s
```

### Step 5: Network Troubleshooting
```bash
# Network troubleshooting toolkit
echo "=== NETWORK TROUBLESHOOTING ==="

# Trace route to destination
echo "Route tracing to google.com:"
traceroute google.com 2>/dev/null | head -10 || echo "traceroute not available"

# Alternative trace route
echo ""
echo "Alternative route tracing:"
tracepath google.com 2>/dev/null | head -10 || echo "tracepath not available"

# Network interface errors
echo ""
echo "Network interface error statistics:"
ip -s link show

# ARP table (Address Resolution Protocol)
echo ""
echo "ARP table (IP to MAC mapping):"
ip neigh show

# Check if firewall is blocking
echo ""
echo "Basic firewall status:"
ufw status 2>/dev/null || echo "UFW not available"
```

## 🎯 Practice Challenges

### Basic Network Discovery
```bash
# Network discovery script
#!/bin/bash
echo "=== NETWORK DISCOVERY CHALLENGE ==="

# Get your IP and network
MY_IP=$(ip route get 8.8.8.8 | awk '{print $7; exit}')
NETWORK=$(ip route | grep -E "192\.168\.|10\.|172\." | head -1 | awk '{print $1}')

echo "Your IP: $MY_IP"
echo "Your Network: $NETWORK"

# Scan for active devices (if nmap available)
if command -v nmap &> /dev/null; then
    echo "Scanning network for active devices..."
    nmap -sn $NETWORK 2>/dev/null | grep -E "Nmap scan report|MAC Address"
else
    echo "Install nmap for network scanning: sudo apt install nmap"
fi
```

### Network Configuration Backup
```bash
# Create network configuration backup
#!/bin/bash
echo "=== NETWORK CONFIGURATION BACKUP ==="

BACKUP_DIR="$HOME/network_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "Creating network configuration backup in: $BACKUP_DIR"

# Backup network interfaces
ip addr show > "$BACKUP_DIR/interfaces.txt"
ip route show > "$BACKUP_DIR/routes.txt"

# Backup DNS settings
cp /etc/resolv.conf "$BACKUP_DIR/" 2>/dev/null || echo "Could not backup resolv.conf"

# Backup hosts file
cp /etc/hosts "$BACKUP_DIR/" 2>/dev/null || echo "Could not backup hosts file"

# Create summary
cat > "$BACKUP_DIR/network_summary.txt" << EOF
Network Configuration Backup
Created: $(date)
Hostname: $(hostname)
Default Gateway: $(ip route | grep default | awk '{print $3}')
DNS Servers: $(grep nameserver /etc/resolv.conf | awk '{print $2}' | tr '\n' ' ')
Active Interfaces: $(ip link show | grep UP | grep -v LOOPBACK | wc -l)
EOF

echo "Backup completed successfully!"
ls -la "$BACKUP_DIR"
```

---

# 14. Firewall & Security

## 🔑 Core Concept
A firewall is like a security guard at a building entrance - it checks every visitor (packet) and only allows those on the approved list (rules) to enter!

## 📊 Firewall Architecture
```
Linux Firewall Stack

┌─────────────────────────────────────┐
│          Applications               │
├─────────────────────────────────────┤
│     Firewall Management Tools      │
│  ┌─────────┐ ┌─────────┐ ┌────────┐ │
│  │   UFW   │ │firewalld│ │ GUI    │ │
│  │(Simple) │ │(Advanced)│ │Tools   │ │
│  └─────────┘ └─────────┘ └────────┘ │
├─────────────────────────────────────┤
│            iptables                 │
│     (Rule Processing Engine)        │
├─────────────────────────────────────┤
│            netfilter                │
│      (Kernel Framework)             │
└─────────────────────────────────────┘

Firewall Rule Flow:
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   PACKET    │───▶│   FIREWALL   │───▶│   ACCEPT    │
│  ARRIVES    │    │   EVALUATES  │    │   OR DROP   │
└─────────────┘    │    RULES     │    └─────────────┘
                   └──────────────┘

Common Rule Types:
├── INPUT     ← Traffic coming TO your system
├── OUTPUT    ← Traffic going FROM your system
├── FORWARD   ← Traffic passing THROUGH your system
└── MASQUERADE← NAT (Network Address Translation)

Security Layers:
├── Network Firewall     ← First line of defense
├── Host-based Firewall  ← System-level protection
├── Application Firewall ← Service-specific rules
└── SELinux/AppArmor    ← Mandatory Access Control
```

## 🛠️ Hands-On Commands

### Step 1: UFW (Uncomplicated Firewall) Basics
```bash
# UFW is the user-friendly front-end for iptables
echo "=== UFW FIREWALL MANAGEMENT ==="

# Check UFW status
sudo ufw status verbose

# Enable UFW (if not already enabled)
echo ""
echo "Enabling UFW..."
sudo ufw --force enable

# Basic UFW rules
echo ""
echo "Setting up basic UFW rules..."

# Allow SSH (important - don't lock yourself out!)
sudo ufw allow ssh
sudo ufw allow 22

# Allow common services
sudo ufw allow http      # Port 80
sudo ufw allow https     # Port 443
sudo ufw allow 53        # DNS

# Deny a specific port
sudo ufw deny 23         # Block Telnet

# Show status with numbered rules
echo ""
echo "Current UFW rules:"
sudo ufw status numbered
```

### Step 2: Advanced UFW Rules
```bash
# Advanced UFW rule management
echo "=== ADVANCED UFW RULES ==="

# Allow from specific IP
sudo ufw allow from 192.168.1.100

# Allow specific port from specific IP
sudo ufw allow from 192.168.1.100 to any port 22

# Allow subnet
sudo ufw allow from 192.168.1.0/24

# Allow specific protocol
sudo ufw allow 53/udp

# Rate limiting (DDoS protection)
sudo ufw limit ssh

# Application profiles
echo ""
echo "Available application profiles:"
sudo ufw app list

# Allow application profile
sudo ufw allow 'Apache Full' 2>/dev/null || echo "Apache profile not available"

# Show UFW configuration
echo ""
echo "UFW configuration details:"
sudo ufw show raw 2>/dev/null | head -20
```

### Step 3: iptables Direct Management
```bash
# Direct iptables management (advanced)
echo "=== IPTABLES DIRECT MANAGEMENT ==="

# Show current iptables rules
echo "Current iptables rules:"
sudo iptables -L -n --line-numbers

# Show NAT rules
echo ""
echo "NAT table rules:"
sudo iptables -t nat -L -n 2>/dev/null || echo "NAT table access denied"

# Show connection tracking
echo ""
echo "Connection tracking statistics:"
cat /proc/net/nf_conntrack | head -5 2>/dev/null || echo "Connection tracking not available"

# Show iptables statistics
echo ""
echo "Iptables rule statistics:"
sudo iptables -L -v -n | head -10

# Backup current iptables rules
echo ""
echo "Creating iptables backup..."
sudo iptables-save > ~/iptables_backup_$(date +%Y%m%d_%H%M%S).rules 2>/dev/null && echo "Backup created" || echo "Backup failed"
```

### Step 4: Security Monitoring
```bash
# Security monitoring and log analysis
echo "=== SECURITY MONITORING ==="

# Check for firewall logs
echo "Recent firewall logs:"
sudo journalctl -u ufw --since "1 hour ago" -n 10 2>/dev/null || echo "UFW logs not available"

# Check auth log for suspicious activity
echo ""
echo "Recent authentication attempts:"
sudo tail -10 /var/log/auth.log 2>/dev/null || echo "Auth log not accessible"

# Check for failed login attempts
echo ""
echo "Failed login attempts:"
sudo grep "Failed password" /var/log/auth.log 2>/dev/null | tail -5 || echo "No failed logins found"

# Check listening services
echo ""
echo "Services listening on network:"
sudo ss -tulpn | grep LISTEN | head -10

# Check for unusual network connections
echo ""
echo "Established connections:"
sudo ss -tulpn | grep ESTAB | head -5

# System security status
echo ""
echo "System security overview:"
echo "  Firewall status: $(sudo ufw status | head -1)"
echo "  Active connections: $(ss -t | grep ESTAB | wc -l)"
echo "  Listening services: $(ss -tln | grep LISTEN | wc -l)"
```

### Step 5: Security Hardening
```bash
# Basic security hardening steps
echo "=== SECURITY HARDENING ==="

# Disable unnecessary services
echo "Checking for unnecessary services:"
systemctl list-unit-files --type=service --state=enabled | grep -E "(telnet|rsh|rlogin)" || echo "No obviously insecure services found"

# Check SSH configuration
echo ""
echo "SSH security configuration:"
grep -E "^(PermitRootLogin|PasswordAuthentication|Port)" /etc/ssh/sshd_config 2>/dev/null || echo "SSH config not accessible"

# Check for SUID/SGID files (security risk)
echo ""
echo "Finding SUID/SGID files (first 10):"
find /usr -type f \( -perm -4000 -o -perm -2000 \) 2>/dev/null | head -10

# Check file permissions on sensitive files
echo ""
echo "Checking sensitive file permissions:"
ls -l /etc/passwd /etc/shadow /etc/hosts 2>/dev/null

# Kernel security parameters
echo ""
echo "Kernel security parameters:"
sysctl net.ipv4.ip_forward 2>/dev/null || echo "IP forwarding check failed"
sysctl net.ipv4.icmp_echo_ignore_all 2>/dev/null || echo "ICMP echo check failed"

# Check for rootkits (basic)
echo ""
echo "Basic rootkit detection:"
ls -la /tmp /var/tmp | grep -E "^\." | head -3 2>/dev/null || echo "No suspicious hidden files found"
```

## 🎯 Practice Challenges

### Firewall Rule Tester
```bash
#!/bin/bash
echo "=== FIREWALL RULE TESTER ==="

# Function to test port connectivity
test_port() {
    local host=$1
    local port=$2
    local timeout=3
    
    echo -n "Testing $host:$port... "
    if timeout $timeout bash -c "</dev/tcp/$host/$port" 2>/dev/null; then
        echo "OPEN"
    else
        echo "CLOSED/FILTERED"
    fi
}

# Test common ports
echo "Testing connectivity to common services:"
test_port "google.com" "80"
test_port "google.com" "443"
test_port "8.8.8.8" "53"

# Test local services
echo ""
echo "Testing local services:"
test_port "localhost" "22"
test_port "localhost" "80"
test_port "localhost" "443"

# Show current firewall status
echo ""
echo "Current firewall configuration:"
sudo ufw status | head -10
```

### Security Audit Script
```bash
#!/bin/bash
echo "=== SECURITY AUDIT SCRIPT ==="

AUDIT_FILE="security_audit_$(date +%Y%m%d_%H%M%S).txt"

{
    echo "Security Audit Report"
    echo "Generated: $(date)"
    echo "Hostname: $(hostname)"
    echo "================================"
    
    echo ""
    echo "FIREWALL STATUS:"
    sudo ufw status verbose
    
    echo ""
    echo "LISTENING SERVICES:"
    sudo ss -tulpn | grep LISTEN
    
    echo ""
    echo "RECENT FAILED LOGINS:"
    sudo grep "Failed password" /var/log/auth.log 2>/dev/null | tail -10 || echo "No failed logins found"
    
    echo ""
    echo "NETWORK CONNECTIONS:"
    sudo ss -tulpn | grep ESTAB | head -10
    
    echo ""
    echo "SYSTEM USERS:"
    awk -F: '$3 >= 1000 && $1 != "nobody" {print $1}' /etc/passwd
    
} > "$AUDIT_FILE"

echo "Security audit completed: $AUDIT_FILE"
echo "Review the file for security recommendations."
```

---

# 15. Crontab and Scheduled Jobs

## 🔑 Core Concept
Cron is like having a personal assistant that never sleeps! It executes tasks automatically at scheduled times - from daily backups to monthly reports.

## 📊 Cron Architecture
```
Cron System Architecture

┌─────────────────────────────────────┐
│        System Cron Jobs             │
│  ┌─────────────────────────────────┐ │
│  │     /etc/crontab                │ │
│  │     /etc/cron.d/                │ │
│  │     /etc/cron.daily/            │ │
│  │     /etc/cron.weekly/           │ │
│  │     /etc/cron.monthly/          │ │
│  └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│        User Cron Jobs               │
│  ┌─────────────────────────────────┐ │
│  │   crontab -e (edit)             │ │
│  │   crontab -l (list)             │ │
│  │   crontab -r (remove)           │ │
│  └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│         Cron Daemon                 │
│      (crond/cron service)           │
└─────────────────────────────────────┘

Cron Time Format:
* * * * * command
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, Sun=0 or 7)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)

Special Characters:
├── *     ← Any value (every)
├── ,     ← Value list (1,3,5)
├── -     ← Range (1-5)
├── /     ← Step (*/5 = every 5)
├── @     ← Special strings
└── %     ← Newline in command

Special Strings:
├── @reboot   ← Run at startup
├── @yearly   ← Run once per year (0 0 1 1 *)
├── @monthly  ← Run once per month (0 0 1 * *)
├── @weekly   ← Run once per week (0 0 * * 0)
├── @daily    ← Run once per day (0 0 * * *)
└── @hourly   ← Run once per hour (0 * * * *)
```

## 🛠️ Hands-On Commands

### Step 1: Cron Service Management
```bash
# Cron service management and status
echo "=== CRON SERVICE MANAGEMENT ==="

# Check if cron service is running
echo "Cron service status:"
systemctl status cron 2>/dev/null || systemctl status crond 2>/dev/null || echo "Cron service not found"

# Start cron if not running
sudo systemctl start cron 2>/dev/null || sudo systemctl start crond 2>/dev/null

# Enable cron to start at boot
sudo systemctl enable cron 2>/dev/null || sudo systemctl enable crond 2>/dev/null

# Check cron logs
echo ""
echo "Recent cron activity:"
sudo journalctl -u cron --since "1 hour ago" -n 5 2>/dev/null || echo "No recent cron logs found"

# Alternative log location
echo ""
echo "Checking /var/log/cron (if available):"
sudo tail -5 /var/log/cron 2>/dev/null || echo "/var/log/cron not available"
```

### Step 2: User Crontab Management
```bash
# User crontab operations
echo "=== USER CRONTAB MANAGEMENT ==="

# List current user's crontab
echo "Current user crontab:"
crontab -l 2>/dev/null || echo "No crontab for current user"

# Create a sample crontab (be careful - this overwrites existing)
echo ""
echo "Creating sample crontab entries..."

# Backup existing crontab first
crontab -l > ~/crontab_backup_$(date +%Y%m%d_%H%M%S).txt 2>/dev/null

# Create temporary crontab file
cat > ~/temp_crontab << 'EOF'
# Sample Crontab - Auto-generated for demonstration
# Format: minute hour day month weekday command

# Run every minute (for testing - remove after verification)
# * * * * * echo "Cron test: $(date)" >> /tmp/cron_test.log

# Daily system update check at 2 AM
0 2 * * * /usr/bin/apt list --upgradable > /tmp/updates_check.log 2>&1

# Weekly disk usage report every Sunday at 3 AM
0 3 * * 0 df -h > /tmp/disk_usage_$(date +\%Y\%m\%d).log

# Monthly cleanup of temporary files on 1st day at 4 AM
0 4 1 * * find /tmp -type f -mtime +7 -delete 2>/dev/null

# Backup home directory every day at 1 AM
0 1 * * * tar -czf /tmp/home_backup_$(date +\%Y\%m\%d).tar.gz $HOME 2>/dev/null

# Log system information every 6 hours
0 */6 * * * uptime >> /tmp/system_uptime.log

# Special time shortcuts
@reboot echo "System started at $(date)" >> /tmp/boot.log
@daily echo "Daily task executed at $(date)" >> /tmp/daily.log
EOF

echo "Sample crontab created in ~/temp_crontab"
echo "To install: crontab ~/temp_crontab"
echo "To edit: crontab -e"
```

### Step 3: System Cron Directories
```bash
# Explore system cron directories
echo "=== SYSTEM CRON DIRECTORIES ==="

# Check system crontab
echo "System crontab (/etc/crontab):"
cat /etc/crontab 2>/dev/null || echo "/etc/crontab not accessible"

# List daily cron jobs
echo ""
echo "Daily cron jobs (/etc/cron.daily/):"
ls -la /etc/cron.daily/ 2>/dev/null || echo "/etc/cron.daily/ not accessible"

# List weekly cron jobs
echo ""
echo "Weekly cron jobs (/etc/cron.weekly/):"
ls -la /etc/cron.weekly/ 2>/dev/null || echo "/etc/cron.weekly/ not accessible"

# List monthly cron jobs
echo ""
echo "Monthly cron jobs (/etc/cron.monthly/):"
ls -la /etc/cron.monthly/ 2>/dev/null || echo "/etc/cron.monthly/ not accessible"

# Check cron.d directory
echo ""
echo "Additional cron jobs (/etc/cron.d/):"
ls -la /etc/cron.d/ 2>/dev/null || echo "/etc/cron.d/ not accessible"

# Show content of a system cron job
echo ""
echo "Sample system cron job content:"
head -10 /etc/cron.daily/apt-compat 2>/dev/null || head -10 /etc/cron.daily/* 2>/dev/null | head -10 || echo "No system cron jobs found"
```

### Step 4: Cron Job Testing and Validation
```bash
# Test and validate cron jobs
echo "=== CRON JOB TESTING ==="

# Create a test cron job
echo "Creating test cron job..."
echo "* * * * * echo 'Test: $(date)' >> /tmp/cron_test.log" | crontab -

echo "Test cron job installed. Waiting 2 minutes for execution..."
echo "Monitor with: tail -f /tmp/cron_test.log"

# Wait and check
sleep 70
if [ -f /tmp/cron_test.log ]; then
    echo ""
    echo "Cron test results:"
    tail -3 /tmp/cron_test.log
else
    echo "Test log not created yet. Check manually in a few minutes."
fi

# Validate cron syntax (manual check)
echo ""
echo "=== CRON SYNTAX VALIDATION ==="
echo "Common cron examples:"
echo "  0 2 * * *        # Daily at 2 AM"
echo "  0 */6 * * *      # Every 6 hours"
echo "  30 2 * * 1       # Every Monday at 2:30 AM"
echo "  0 0 1 * *        # First day of every month"
echo "  0 0 * * 1-5      # Weekdays at midnight"
echo "  */15 * * * *     # Every 15 minutes"

# Remove test cron job
echo ""
echo "Removing test cron job..."
crontab -r 2>/dev/null && echo "Test crontab removed" || echo "No crontab to remove"

# Restore backup if it exists
if ls ~/crontab_backup_*.txt 2>/dev/null; then
    LATEST_BACKUP=$(ls -t ~/crontab_backup_*.txt | head -1)
    echo "Restoring crontab from: $LATEST_BACKUP"
    crontab "$LATEST_BACKUP"
fi
```

### Step 5: Advanced Cron Management
```bash
# Advanced cron management techniques
echo "=== ADVANCED CRON MANAGEMENT ==="

# Check who has crontabs
echo "Users with crontabs:"
sudo ls -la /var/spool/cron/crontabs/ 2>/dev/null || sudo ls -la /var/spool/cron/ 2>/dev/null || echo "Cron spool directory not accessible"

# Cron access control
echo ""
echo "Cron access control files:"
echo "Allow file: $(ls /etc/cron.allow 2>/dev/null || echo 'Not exists')"
echo "Deny file: $(ls /etc/cron.deny 2>/dev/null || echo 'Not exists')"

# Environment variables in cron
echo ""
echo "Cron environment considerations:"
cat << 'EOF'
Important: Cron runs with minimal environment
- PATH is usually just /usr/bin:/bin
- No interactive shell variables
- Always use full paths in commands
- Set environment variables at top of crontab:
  PATH=/usr/local/bin:/usr/bin:/bin
  SHELL=/bin/bash
  MAILTO=user@example.com
EOF

# Cron logging configuration
echo ""
echo "Cron logging configuration:"
grep cron /etc/rsyslog.conf 2>/dev/null || echo "Rsyslog configuration not accessible"

# Alternative scheduling with at
echo ""
echo "Alternative: 'at' command for one-time scheduling:"
echo "Usage examples:"
echo "  at 14:30 today"
echo "  at 2:30 PM tomorrow"
echo "  at now + 1 hour"
echo "Check: atq (list), atrm (remove)"
```

## 🎯 Practice Challenges

### Cron Job Creator Script
```bash
#!/bin/bash
echo "=== CRON JOB CREATOR ==="

# Interactive cron job creator
read -p "Enter command to schedule: " COMMAND
read -p "Enter minute (0-59, * for all): " MINUTE
read -p "Enter hour (0-23, * for all): " HOUR
read -p "Enter day of month (1-31, * for all): " DAY
read -p "Enter month (1-12, * for all): " MONTH
read -p "Enter day of week (0-7, * for all): " WEEKDAY

# Validate basic input
if [[ -z "$COMMAND" ]]; then
    echo "Error: Command cannot be empty"
    exit 1
fi

# Create cron entry
CRON_ENTRY="$MINUTE $HOUR $DAY $MONTH $WEEKDAY $COMMAND"

echo ""
echo "Generated cron entry:"
echo "$CRON_ENTRY"

# Add to crontab
read -p "Add this to your crontab? (y/n): " CONFIRM
if [[ "$CONFIRM" == "y" ]]; then
    # Backup existing crontab
    crontab -l > ~/crontab_backup_$(date +%Y%m%d_%H%M%S).txt 2>/dev/null
    
    # Add new entry
    (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
    echo "Cron job added successfully!"
    echo "Current crontab:"
    crontab -l
else
    echo "Cron job not added."
fi
```

### System Maintenance Scheduler
```bash
#!/bin/bash
echo "=== SYSTEM MAINTENANCE SCHEDULER ==="

# Create comprehensive maintenance crontab
MAINT_CRONTAB="/tmp/maintenance_crontab.txt"

cat > "$MAINT_CRONTAB" << 'EOF'
# System Maintenance Crontab
# Generated automatically - review before installing

# Environment variables
PATH=/usr/local/bin:/usr/bin:/bin:/sbin:/usr/sbin
SHELL=/bin/bash
MAILTO=root

# Daily maintenance (2 AM)
0 2 * * * /usr/bin/updatedb 2>/dev/null
15 2 * * * /usr/bin/apt update > /tmp/apt_update.log 2>&1
30 2 * * * /usr/bin/find /tmp -type f -mtime +7 -delete 2>/dev/null

# Weekly maintenance (Sunday 3 AM)
0 3 * * 0 /usr/bin/apt autoremove -y > /tmp/apt_autoremove.log 2>&1
30 3 * * 0 /bin/journalctl --vacuum-time=30d > /tmp/journal_cleanup.log 2>&1

# Monthly maintenance (1st day 4 AM)
0 4 1 * * /usr/bin/apt autoclean > /tmp/apt_autoclean.log 2>&1
30 4 1 * * /usr/bin/find /var/log -name "*.log" -mtime +30 -delete 2>/dev/null

# System monitoring (every 6 hours)
0 */6 * * * /usr/bin/df -h > /tmp/disk_usage_$(date +\%Y\%m\%d_\%H).log
30 */6 * * * /usr/bin/free -h > /tmp/memory_usage_$(date +\%Y\%m\%d_\%H).log

# Security checks (daily 5 AM)
0 5 * * * /usr/bin/last -n 20 > /tmp/last_logins.log 2>&1
15 5 * * * /bin/grep "Failed password" /var/log/auth.log | tail -20 > /tmp/failed_logins.log 2>/dev/null

# Backup reminders (@reboot and weekly)
@reboot echo "System rebooted at $(date)" >> /tmp/reboot.log
0 6 * * 1 echo "Weekly backup reminder: $(date)" >> /tmp/backup_reminder.log
EOF

echo "Maintenance crontab created: $MAINT_CRONTAB"
echo ""
echo "Contents:"
cat "$MAINT_CRONTAB"

echo ""
read -p "Install this maintenance crontab? (y/n): " INSTALL
if [[ "$INSTALL" == "y" ]]; then
    # Backup existing
    crontab -l > ~/crontab_backup_maintenance_$(date +%Y%m%d_%H%M%S).txt 2>/dev/null
    
    # Install new crontab
    crontab "$MAINT_CRONTAB"
    echo "Maintenance crontab installed!"
else
    echo "Maintenance crontab saved to $MAINT_CRONTAB for manual review."
fi
```

---

# 16. File Search and Text Processing

## 🔑 Core Concept
File searching is like being a detective with superpowers! You can find any file by name, content, size, or date, and process text like a master linguist.

## 📊 Search and Processing Architecture
```
File Search & Text Processing Tools

┌─────────────────────────────────────┐
│          Search Commands            │
│  ┌─────────────────────────────────┐ │
│  │ find    ← File system search    │ │
│  │ locate  ← Database search       │ │
│  │ which   ← Command location      │ │
│  │ whereis ← Binary/manual search  │ │
│  └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│        Text Processing              │
│  ┌─────────────────────────────────┐ │
│  │ grep    ← Pattern matching      │ │
│  │ sed     ← Stream editing        │ │
│  │ awk     ← Pattern processing    │ │
│  │ cut     ← Column extraction     │ │
│  │ sort    ← Sorting data          │ │
│  │ uniq    ← Remove duplicates     │ │
│  │ tr      ← Character translation │ │
│  └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│        File Analysis                │
│  ┌─────────────────────────────────┐ │
│  │ wc      ← Word/line/char count  │ │
│  │ file    ← File type detection   │ │
│  │ stat    ← File statistics       │ │
│  │ head    ← First lines           │ │
│  │ tail    ← Last lines            │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘

Search Criteria:
├── By Name      ← -name "*.txt"
├── By Type      ← -type f (file), d (directory)
├── By Size      ← -size +100M
├── By Time      ← -mtime -7 (modified within 7 days)
├── By Permissions ← -perm 755
├── By Owner     ← -user username
└── By Content   ← grep "pattern" file

Text Processing Pipeline:
Input → grep → sed → awk → sort → uniq → Output
```

## 🛠️ Hands-On Commands

### Step 1: File Finding Fundamentals
```bash
# Basic file finding operations
echo "=== FILE FINDING FUNDAMENTALS ==="

# Find files by name
echo "Finding files by name pattern:"
find /usr/share -name "*.txt" -type f 2>/dev/null | head -5

# Find files by type
echo ""
echo "Finding directories in current location:"
find . -type d -maxdepth 2 2>/dev/null

# Find files by size
echo ""
echo "Finding large files (>10MB) in /usr:"
find /usr -type f -size +10M 2>/dev/null | head -5

# Find files by modification time
echo ""
echo "Finding recently modified files (last 1 day):"
find /tmp -type f -mtime -1 2>/dev/null | head -5

# Find files by permissions
echo ""
echo "Finding executable files in current directory:"
find . -type f -executable -maxdepth 1 2>/dev/null

# Using locate (if database exists)
echo ""
echo "Using locate command (if available):"
updatedb 2>/dev/null && echo "Database updated" || echo "Cannot update locate database"
locate bash 2>/dev/null | head -5 || echo "Locate database not available"
```

### Step 2: Advanced File Search
```bash
# Advanced file search techniques
echo "=== ADVANCED FILE SEARCH ==="

# Complex find operations
echo "Finding files with multiple criteria:"
find /etc -name "*.conf" -type f -readable 2>/dev/null | head -5

# Find and execute actions
echo ""
echo "Finding and counting lines in config files:"
find /etc -name "*.conf" -type f -exec wc -l {} + 2>/dev/null | head -5

# Find with logical operators
echo ""
echo "Finding files NOT owned by root:"
find /home -type f ! -user root 2>/dev/null | head -5

# Find empty files and directories
echo ""
echo "Finding empty files:"
find /tmp -type f -empty 2>/dev/null | head -3

echo ""
echo "Finding empty directories:"
find /tmp -type d -empty 2>/dev/null | head -3

# Find files by content using grep
echo ""
echo "Finding files containing specific text:"
grep -r "bash" /etc/cron* 2>/dev/null | head -3

# Find duplicate files (by size)
echo ""
echo "Finding potential duplicate files by size:"
find /usr/share -type f -exec ls -l {} + 2>/dev/null | awk '{print $5, $NF}' | sort -n | uniq -d -w10 | head -3
```

### Step 3: Text Processing with grep
```bash
# Advanced grep operations
echo "=== GREP TEXT PROCESSING ==="

# Create sample file for demonstration
cat > /tmp/sample_log.txt << 'EOF'
2025-01-15 10:30:15 INFO User john logged in
2025-01-15 10:31:22 ERROR Failed to connect to database
2025-01-15 10:32:05 INFO User mary logged in
2025-01-15 10:33:12 WARNING Low disk space on /var
2025-01-15 10:34:18 ERROR Authentication failed for user bob
2025-01-15 10:35:25 INFO Backup completed successfully
2025-01-15 10:36:30 ERROR Connection timeout
2025-01-15 10:37:15 INFO User john logged out
EOF

echo "Sample log file created. Processing with grep:"

# Basic grep patterns
echo ""
echo "Finding ERROR entries:"
grep "ERROR" /tmp/sample_log.txt

# Case-insensitive search
echo ""
echo "Finding all 'info' entries (case-insensitive):"
grep -i "info" /tmp/sample_log.txt

# Counting matches
echo ""
echo "Counting ERROR occurrences:"
grep -c "ERROR" /tmp/sample_log.txt

# Line numbers
echo ""
echo "Finding entries with line numbers:"
grep -n "User" /tmp/sample_log.txt

# Multiple patterns
echo ""
echo "Finding ERROR or WARNING entries:"
grep -E "(ERROR|WARNING)" /tmp/sample_log.txt

# Inverse matching
echo ""
echo "Finding non-INFO entries:"
grep -v "INFO" /tmp/sample_log.txt

# Context lines
echo ""
echo "Finding ERROR with context (1 line before/after):"
grep -C 1 "ERROR" /tmp/sample_log.txt
```

### Step 4: Stream Editing with sed
```bash
# Stream editing with sed
echo "=== SED STREAM EDITING ==="

echo "Original sample text:"
cat /tmp/sample_log.txt | head -3

# Basic substitution
echo ""
echo "Replacing 'ERROR' with 'CRITICAL':"
sed 's/ERROR/CRITICAL/g' /tmp/sample_log.txt | grep CRITICAL

# Multiple substitutions
echo ""
echo "Replacing user names:"
sed -e 's/john/JOHN/g' -e 's/mary/MARY/g' /tmp/sample_log.txt | grep -E "(JOHN|MARY)"

# Delete lines
echo ""
echo "Removing INFO lines:"
sed '/INFO/d' /tmp/sample_log.txt

# Extract specific lines
echo ""
echo "Extracting lines 2-4:"
sed -n '2,4p' /tmp/sample_log.txt

# Insert text
echo ""
echo "Adding header line:"
sed '1i\LOG FILE HEADER - START OF ENTRIES' /tmp/sample_log.txt | head -4

# Replace entire line
echo ""
echo "Replacing lines containing 'WARNING':"
sed '/WARNING/c\SYSTEM ALERT: Check disk space immediately' /tmp/sample_log.txt | grep -A1 -B1 "SYSTEM ALERT"
```

### Step 5: Pattern Processing with awk
```bash
# Pattern processing with awk
echo "=== AWK PATTERN PROCESSING ==="

# Create structured data
cat > /tmp/users.txt << 'EOF'
john:1001:developer:50000
mary:1002:admin:60000
bob:1003:tester:45000
alice:1004:manager:70000
charlie:1005:developer:52000
EOF

echo "User data file created:"
cat /tmp/users.txt

# Basic field extraction
echo ""
echo "Extracting usernames (field 1):"
awk -F: '{print $1}' /tmp/users.txt

# Multiple fields
echo ""
echo "Extracting username and salary:"
awk -F: '{print $1, $4}' /tmp/users.txt

# Conditional processing
echo ""
echo "Finding high earners (>55000):"
awk -F: '$4 > 55000 {print $1, "earns", $4}' /tmp/users.txt

# Calculations
echo ""
echo "Calculating average salary:"
awk -F: '{sum += $4; count++} END {print "Average salary:", sum/count}' /tmp/users.txt

# Pattern matching
echo ""
echo "Finding developers:"
awk -F: '$3 == "developer" {print $1, "is a", $3}' /tmp/users.txt

# Built-in variables
echo ""
echo "Adding line numbers:"
awk -F: '{print NR, $1, $3}' /tmp/users.txt

# Complex processing
echo ""
echo "Salary report with formatting:"
awk -F: 'BEGIN {print "SALARY REPORT"; print "=============="} 
         {printf "%-10s %-10s $%d\n", $1, $3, $4} 
         END {print "=============="}' /tmp/users.txt
```

## 🎯 Practice Challenges

### File Detective Script
```bash
#!/bin/bash
echo "=== FILE DETECTIVE SCRIPT ==="

# Interactive file search tool
echo "What would you like to search for?"
echo "1) Files by name pattern"
echo "2) Large files (>100MB)"
echo "3) Recently modified files"
echo "4) Files containing text"
echo "5) All of the above"

read -p "Enter choice (1-5): " CHOICE

case $CHOICE in
    1)
        read -p "Enter file name pattern (e.g., *.log): " PATTERN
        read -p "Enter search directory [/]: " DIR
        DIR=${DIR:-/}
        echo "Searching for files matching '$PATTERN' in '$DIR':"
        find "$DIR" -name "$PATTERN" -type f 2>/dev/null | head -20
        ;;
    2)
        read -p "Enter search directory [/]: " DIR
        DIR=${DIR:-/}
        echo "Finding large files (>100MB) in '$DIR':"
        find "$DIR" -type f -size +100M -exec ls -lh {} + 2>/dev/null | head -10
        ;;
    3)
        read -p "Enter days back [7]: " DAYS
        DAYS=${DAYS:-7}
        read -p "Enter search directory [.]: " DIR
        DIR=${DIR:-.}
        echo "Files modified in last $DAYS days in '$DIR':"
        find "$DIR" -type f -mtime -"$DAYS" 2>/dev/null | head -15
        ;;
    4)
        read -p "Enter text to search for: " TEXT
        read -p "Enter search directory [/etc]: " DIR
        DIR=${DIR:-/etc}
        echo "Files containing '$TEXT' in '$DIR':"
        grep -r "$TEXT" "$DIR" 2>/dev/null | head -10
        ;;
    5)
        echo "Running comprehensive file analysis..."
        echo ""
        echo "1. Large files (>50MB):"
        find / -type f -size +50M 2>/dev/null | head -5
        echo ""
        echo "2. Recently modified (last 2 days):"
        find /var/log -type f -mtime -2 2>/dev/null | head -5
        echo ""
        echo "3. Configuration files:"
        find /etc -name "*.conf" -type f 2>/dev/null | head -5
        echo ""
        echo "4. Executable files in PATH:"
        which -a python python3 bash 2>/dev/null
        ;;
    *)
        echo "Invalid choice. Please run again."
        ;;
esac
```

### Log Analysis Tool
```bash
#!/bin/bash
echo "=== LOG ANALYSIS TOOL ==="

# Find and analyze log files
LOG_DIR="/var/log"
TEMP_FILE="/tmp/log_analysis.txt"

echo "Analyzing logs in $LOG_DIR..."

# Find all log files
find "$LOG_DIR" -name "*.log" -type f -readable 2>/dev/null > "$TEMP_FILE"

if [[ ! -s "$TEMP_FILE" ]]; then
    echo "No accessible log files found in $LOG_DIR"
    exit 1
fi

echo "Found $(wc -l < "$TEMP_FILE") log files"
echo ""

# Analyze each log file
while IFS= read -r logfile; do
    if [[ -r "$logfile" ]]; then
        echo "=== Analysis of $logfile ==="
        echo "File size: $(ls -lh "$logfile" | awk '{print $5}')"
        echo "Lines: $(wc -l < "$logfile" 2>/dev/null)"
        echo "Last modified: $(stat -c %y "$logfile" 2>/dev/null | cut -d. -f1)"
        
        # Look for common patterns
        echo "Recent errors:"
        grep -i "error" "$logfile" 2>/dev/null | tail -3
        
        echo "Recent warnings:"
        grep -i "warning" "$logfile" 2>/dev/null | tail -3
        
        echo ""
    fi
done < "$TEMP_FILE"

# Cleanup
rm -f "$TEMP_FILE"

echo "Log analysis completed!"
```

---

# 17. Archiving and Compression

## 🔑 Core Concept
Archiving and compression are like packing for a trip - you organize files into containers (archives) and compress them to save space, making storage and transfer efficient!

## 📊 Archive and Compression Tools
```
Archive & Compression Ecosystem

┌─────────────────────────────────────┐
│         Archive Formats             │
│  ┌─────────────────────────────────┐ │
│  │ tar    ← Tape Archive (no comp) │ │
│  │ zip    ← ZIP format             │ │
│  │ rar    ← RAR format (proprietary)│ │
│  │ 7z     ← 7-Zip format           │ │
│  └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│       Compression Algorithms        │
│  ┌─────────────────────────────────┐ │
│  │ gzip   ← Fast, good compression │ │
│  │ bzip2  ← Better compression     │ │
│  │ xz     ← Best compression       │ │
│  │ lz4    ← Fastest compression    │ │
│  │ zstd   ← Modern, balanced       │ │
│  └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│        Combined Operations          │
│  ┌─────────────────────────────────┐ │
│  │ tar.gz  ← tar + gzip            │ │
│  │ tar.bz2 ← tar + bzip2           │ │
│  │ tar.xz  ← tar + xz              │ │
│  │ tgz     ← tar.gz shorthand      │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘

Compression Comparison:
┌─────────┬─────────┬─────────────┬──────────┐
│ Method  │ Speed   │ Compression │ CPU Use  │
├─────────┼─────────┼─────────────┼──────────┤
│ gzip    │ Fast    │ Good        │ Low      │
│ bzip2   │ Medium  │ Better      │ Medium   │
│ xz      │ Slow    │ Best        │ High     │
│ lz4     │ Fastest │ Fair        │ Very Low │
│ zstd    │ Fast    │ Very Good   │ Medium   │
└─────────┴─────────┴─────────────┴──────────┘

Common Extensions:
├── .tar     ← Archive only
├── .gz      ← Gzip compressed
├── .bz2     ← Bzip2 compressed
├── .xz      ← XZ compressed
├── .tar.gz  ← Tar + Gzip
├── .tar.bz2 ← Tar + Bzip2
├── .tar.xz  ← Tar + XZ
├── .zip     ← ZIP format
└── .7z      ← 7-Zip format
```

## 🛠️ Hands-On Commands

### Step 1: Basic TAR Operations
```bash
# Basic tar archiving operations
echo "=== BASIC TAR OPERATIONS ==="

# Create sample directory structure for demonstration
mkdir -p /tmp/archive_demo/{docs,scripts,config}
echo "Sample document 1" > /tmp/archive_demo/docs/file1.txt
echo "Sample document 2" > /tmp/archive_demo/docs/file2.txt
echo "#!/bin/bash\necho 'Hello World'" > /tmp/archive_demo/scripts/hello.sh
echo "config_setting=value" > /tmp/archive_demo/config/app.conf

echo "Created sample directory structure:"
tree /tmp/archive_demo 2>/dev/null || find /tmp/archive_demo -type f

# Create basic tar archive
echo ""
echo "Creating basic tar archive (no compression):"
tar -cvf /tmp/basic_archive.tar /tmp/archive_demo
echo "Archive created: $(ls -lh /tmp/basic_archive.tar | awk '{print $5}')"

# List contents of tar archive
echo ""
echo "Listing archive contents:"
tar -tvf /tmp/basic_archive.tar | head -5

# Extract tar archive
echo ""
echo "Extracting archive to /tmp/extracted:"
mkdir -p /tmp/extracted
tar -xvf /tmp/basic_archive.tar -C /tmp/extracted
echo "Extraction completed."
```

### Step 2: Compressed Archives
```bash
# Compressed archive operations
echo "=== COMPRESSED ARCHIVES ==="

# Create gzip compressed archive
echo "Creating gzip compressed archive (.tar.gz):"
tar -czf /tmp/archive_gzip.tar.gz /tmp/archive_demo
GZIP_SIZE=$(ls -lh /tmp/archive_gzip.tar.gz | awk '{print $5}')
echo "Gzip archive size: $GZIP_SIZE"

# Create bzip2 compressed archive
echo ""
echo "Creating bzip2 compressed archive (.tar.bz2):"
tar -cjf /tmp/archive_bzip2.tar.bz2 /tmp/archive_demo
BZIP2_SIZE=$(ls -lh /tmp/archive_bzip2.tar.bz2 | awk '{print $5}')
echo "Bzip2 archive size: $BZIP2_SIZE"

# Create xz compressed archive
echo ""
echo "Creating xz compressed archive (.tar.xz):"
tar -cJf /tmp/archive_xz.tar.xz /tmp/archive_demo
XZ_SIZE=$(ls -lh /tmp/archive_xz.tar.xz | awk '{print $5}')
echo "XZ archive size: $XZ_SIZE"

# Compare archive sizes
echo ""
echo "=== SIZE COMPARISON ==="
echo "Original directory: $(du -sh /tmp/archive_demo | awk '{print $1}')"
echo "Uncompressed tar:   $(ls -lh /tmp/basic_archive.tar | awk '{print $5}')"
echo "Gzip compressed:    $GZIP_SIZE"
echo "Bzip2 compressed:   $BZIP2_SIZE"
echo "XZ compressed:      $XZ_SIZE"

# Extract compressed archives
echo ""
echo "Extracting compressed archives:"
echo "  Gzip: tar -xzf archive.tar.gz"
echo "  Bzip2: tar -xjf archive.tar.bz2"
echo "  XZ: tar -xJf archive.tar.xz"
```

### Step 3: Advanced TAR Options
```bash
# Advanced tar operations
echo "=== ADVANCED TAR OPTIONS ==="

# Exclude files during archiving
echo "Creating archive with exclusions:"
tar -czf /tmp/archive_filtered.tar.gz \
    --exclude='*.tmp' \
    --exclude='*.log' \
    --exclude='cache/*' \
    /tmp/archive_demo

# Archive with progress information
echo ""
echo "Creating archive with progress (if pv available):"
if command -v pv &> /dev/null; then
    tar -czf - /tmp/archive_demo | pv > /tmp/archive_progress.tar.gz
else
    echo "Install pv for progress: sudo apt install pv"
    tar -czf /tmp/archive_progress.tar.gz /tmp/archive_demo
fi

# Incremental backup
echo ""
echo "Creating incremental backup:"
# First, create a full backup
tar -czf /tmp/full_backup.tar.gz -g /tmp/backup.snar /tmp/archive_demo
echo "Full backup created with snapshot file"

# Simulate file changes
echo "New content" > /tmp/archive_demo/docs/new_file.txt
sleep 1

# Create incremental backup
tar -czf /tmp/incremental_backup.tar.gz -g /tmp/backup.snar /tmp/archive_demo
echo "Incremental backup created"

# Compare backup sizes
echo "Full backup size: $(ls -lh /tmp/full_backup.tar.gz | awk '{print $5}')"
echo "Incremental backup size: $(ls -lh /tmp/incremental_backup.tar.gz | awk '{print $5}')"

# Archive with timestamp
echo ""
echo "Creating timestamped archive:"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
tar -czf /tmp/backup_$TIMESTAMP.tar.gz /tmp/archive_demo
echo "Created: backup_$TIMESTAMP.tar.gz"
```

### Step 4: ZIP Operations
```bash
# ZIP file operations
echo "=== ZIP OPERATIONS ==="

# Create ZIP archive
echo "Creating ZIP archive:"
cd /tmp
zip -r archive_demo.zip archive_demo/
echo "ZIP archive created: $(ls -lh archive_demo.zip | awk '{print $5}')"

# List ZIP contents
echo ""
echo "ZIP archive contents:"
unzip -l archive_demo.zip

# Extract ZIP archive
echo ""
echo "Extracting ZIP archive:"
mkdir -p /tmp/zip_extracted
unzip -q archive_demo.zip -d /tmp/zip_extracted
echo "ZIP extraction completed"

# Create password-protected ZIP
echo ""
echo "Creating password-protected ZIP:"
zip -r -P "password123" archive_secure.zip archive_demo/
echo "Secure ZIP created (password: password123)"

# Test password-protected ZIP
echo ""
echo "Testing password-protected ZIP:"
unzip -t archive_secure.zip

# Advanced ZIP options
echo ""
echo "ZIP with compression levels:"
echo "  Level 0 (store): zip -0 -r file.zip directory/"
echo "  Level 6 (default): zip -6 -r file.zip directory/"
echo "  Level 9 (maximum): zip -9 -r file.zip directory/"

# Demonstrate compression levels
zip -0 -r archive_store.zip archive_demo/ >/dev/null 2>&1
zip -9 -r archive_max.zip archive_demo/ >/dev/null 2>&1

echo "Store (no compression): $(ls -lh archive_store.zip | awk '{print $5}')"
echo "Maximum compression: $(ls -lh archive_max.zip | awk '{print $5}')"
```

### Step 5: Other Archive Formats
```bash
# Other archive and compression formats
echo "=== OTHER ARCHIVE FORMATS ==="

# Individual file compression
echo "Individual file compression examples:"

# Create test file
echo "This is a test file for compression demonstration. It contains some text that can be compressed to show the differences between various compression algorithms." > /tmp/test_file.txt
ORIGINAL_SIZE=$(ls -lh /tmp/test_file.txt | awk '{print $5}')
echo "Original file size: $ORIGINAL_SIZE"

# Gzip compression
gzip -c /tmp/test_file.txt > /tmp/test_file.txt.gz
GZIP_SIZE=$(ls -lh /tmp/test_file.txt.gz | awk '{print $5}')
echo "Gzip compressed: $GZIP_SIZE"

# Bzip2 compression
bzip2 -c /tmp/test_file.txt > /tmp/test_file.txt.bz2
BZIP2_SIZE=$(ls -lh /tmp/test_file.txt.bz2 | awk '{print $5}')
echo "Bzip2 compressed: $BZIP2_SIZE"

# XZ compression
xz -c /tmp/test_file.txt > /tmp/test_file.txt.xz
XZ_SIZE=$(ls -lh /tmp/test_file.txt.xz | awk '{print $5}')
echo "XZ compressed: $XZ_SIZE"

# 7-Zip (if available)
echo ""
echo "7-Zip operations (if available):"
if command -v 7z &> /dev/null; then
    7z a /tmp/archive_demo.7z /tmp/archive_demo/ >/dev/null
    SEVENZ_SIZE=$(ls -lh /tmp/archive_demo.7z | awk '{print $5}')
    echo "7-Zip archive size: $SEVENZ_SIZE"
    echo "7-Zip contents:"
    7z l /tmp/archive_demo.7z | head -10
else
    echo "7-Zip not available (install: sudo apt install p7zip-full)"
fi

# Modern compression (zstd)
echo ""
echo "Modern compression with zstd (if available):"
if command -v zstd &> /dev/null; then
    zstd /tmp/test_file.txt -o /tmp/test_file.txt.zst
    ZSTD_SIZE=$(ls -lh /tmp/test_file.txt.zst | awk '{print $5}')
    echo "Zstd compressed: $ZSTD_SIZE"
    
    # Zstd with tar
    tar --use-compress-program=zstd -cf /tmp/archive_zstd.tar.zst /tmp/archive_demo/
    echo "Tar+Zstd archive created"
else
    echo "Zstd not available (install: sudo apt install zstd)"
fi
```

## 🎯 Practice Challenges

### Backup Script Creator
```bash
#!/bin/bash
echo "=== BACKUP SCRIPT CREATOR ==="

# Interactive backup script
read -p "Enter source directory to backup: " SOURCE_DIR
read -p "Enter backup destination directory: " BACKUP_DIR
read -p "Enter compression method (gzip/bzip2/xz): " COMPRESSION

# Validate input
if [[ ! -d "$SOURCE_DIR" ]]; then
    echo "Error: Source directory does not exist"
    exit 1
fi

if [[ ! -d "$BACKUP_DIR" ]]; then
    echo "Creating backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
fi

# Set compression option
case "$COMPRESSION" in
    "gzip")
        COMP_FLAG="z"
        EXT="tar.gz"
        ;;
    "bzip2")
        COMP_FLAG="j"
        EXT="tar.bz2"
        ;;
    "xz")
        COMP_FLAG="J"
        EXT="tar.xz"
        ;;
    *)
        echo "Invalid compression method. Using gzip."
        COMP_FLAG="z"
        EXT="tar.gz"
        ;;
esac

# Create timestamped backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_$(basename "$SOURCE_DIR")_$TIMESTAMP.$EXT"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

echo ""
echo "Creating backup..."
echo "Source: $SOURCE_DIR"
echo "Destination: $BACKUP_PATH"
echo "Compression: $COMPRESSION"

# Create backup
if tar -c${COMP_FLAG}f "$BACKUP_PATH" -C "$(dirname "$SOURCE_DIR")" "$(basename "$SOURCE_DIR")"; then
    echo ""
    echo "Backup completed successfully!"
    echo "Backup file: $BACKUP_PATH"
    echo "Backup size: $(ls -lh "$BACKUP_PATH" | awk '{print $5}')"
    
    # Create verification
    echo ""
    echo "Verifying backup integrity..."
    if tar -t${COMP_FLAG}f "$BACKUP_PATH" >/dev/null 2>&1; then
        echo "✓ Backup integrity verified"
    else
        echo "✗ Backup integrity check failed"
    fi
else
    echo "Backup failed!"
    exit 1
fi

# Offer to create restore script
read -p "Create restore script? (y/n): " CREATE_RESTORE
if [[ "$CREATE_RESTORE" == "y" ]]; then
    RESTORE_SCRIPT="$BACKUP_DIR/restore_$(basename "$SOURCE_DIR")_$TIMESTAMP.sh"
    cat > "$RESTORE_SCRIPT" << EOF
#!/bin/bash
# Restore script for backup: $BACKUP_NAME
# Created: $(date)

echo "Restoring backup: $BACKUP_NAME"
read -p "Enter restore destination directory: " RESTORE_DIR

if [[ ! -d "\$RESTORE_DIR" ]]; then
    echo "Creating restore directory: \$RESTORE_DIR"
    mkdir -p "\$RESTORE_DIR"
fi

echo "Extracting backup to \$RESTORE_DIR..."
if tar -x${COMP_FLAG}f "$BACKUP_PATH" -C "\$RESTORE_DIR"; then
    echo "Restore completed successfully!"
    echo "Files restored to: \$RESTORE_DIR"
else
    echo "Restore failed!"
    exit 1
fi
EOF
    chmod +x "$RESTORE_SCRIPT"
    echo "Restore script created: $RESTORE_SCRIPT"
fi

echo ""
echo "Backup operation completed!"
```

### Archive Analyzer
```bash
#!/bin/bash
echo "=== ARCHIVE ANALYZER ==="

# Function to analyze archive
analyze_archive() {
    local file="$1"
    local type="$2"
    
    echo "=== Analysis of $file ==="
    echo "Type: $type"
    echo "Size: $(ls -lh "$file" | awk '{print $5}')"
    echo "Modified: $(stat -c %y "$file" | cut -d. -f1)"
    
    case "$type" in
        "tar"|"tar.gz"|"tar.bz2"|"tar.xz"|"tgz")
            echo "Contents (first 10 entries):"
            tar -tf "$file" 2>/dev/null | head -10
            echo "Total entries: $(tar -tf "$file" 2>/dev/null | wc -l)"
            ;;
        "zip")
            echo "Contents:"
            unzip -l "$file" | head -15
            ;;
        "7z")
            if command -v 7z &> /dev/null; then
                echo "Contents:"
                7z l "$file" | head -15
            else
                echo "7z command not available"
            fi
            ;;
        *)
            echo "Unknown archive type"
            ;;
    esac
    echo ""
}

# Find and analyze archives in current directory
echo "Searching for archives in current directory..."

# Find tar archives
for file in *.tar *.tar.gz *.tar.bz2 *.tar.xz *.tgz 2>/dev/null; do
    if [[ -f "$file" ]]; then
        case "$file" in
            *.tar.gz|*.tgz) analyze_archive "$file" "tar.gz" ;;
            *.tar.bz2) analyze_archive "$file" "tar.bz2" ;;
            *.tar.xz) analyze_archive "$file" "tar.xz" ;;
            *.tar) analyze_archive "$file" "tar" ;;
        esac
    fi
done

# Find zip archives
for file in *.zip 2>/dev/null; do
    if [[ -f "$file" ]]; then
        analyze_archive "$file" "zip"
    fi
done

# Find 7z archives
for file in *.7z 2>/dev/null; do
    if [[ -f "$file" ]]; then
        analyze_archive "$file" "7z"
    fi
done

echo "Archive analysis completed!"
```

---

# 18. Disk Usage and Quota Management

## 🔑 Core Concept
Disk management is like managing a warehouse - you need to know what's taking up space, set limits for different users, and clean up when things get cluttered!

## 📊 Disk Management Architecture
```
Disk Usage & Quota Management

┌─────────────────────────────────────┐
│        Disk Usage Tools             │
│  ┌─────────────────────────────────┐ │
│  │ df      ← Filesystem usage      │ │
│  │ du      ← Directory usage       │ │
│  │ lsblk   ← Block device listing  │ │
│  │ fdisk   ← Partition management  │ │
│  │ ncdu    ← Interactive analyzer  │ │
│  └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│         Quota System                │
│  ┌─────────────────────────────────┐ │
│  │ quotacheck ← Initialize quotas  │ │
│  │ quotaon    ← Enable quotas      │ │
│  │ quotaoff   ← Disable quotas     │ │
│  │ setquota   ← Set user limits    │ │
│  │ repquota   ← Show quota usage   │ │
│  │ quota      ← Check user quota   │ │
│  └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│       Cleanup Tools                 │
│  ┌─────────────────────────────────┐ │
│  │ find + delete ← Automated cleanup│ │
│  │ tmpwatch     ← Temp file cleanup │ │
│  │ logrotate    ← Log management    │ │
│  │ apt clean    ← Package cleanup   │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘

Filesystem Hierarchy:
├── / (root)          ← System root
├── /home            ← User directories
├── /var             ← Variable data
│   ├── /var/log     ← System logs
│   ├── /var/tmp     ← Temporary files
│   └── /var/cache   ← Cache files
├── /tmp             ← Temporary files
├── /usr             ← Programs & libraries
└── /opt             ← Optional software

Quota Types:
├── User Quotas      ← Per-user limits
├── Group Quotas     ← Per-group limits
├── Soft Limits      ← Warning threshold
└── Hard Limits      ← Absolute maximum

Common Large Directories:
├── /var/log         ← Log files
├── /tmp             ← Temporary files
├── /var/cache       ← Cache files
├── ~/.cache         ← User cache
├── /usr/lib         ← Libraries
└── /home            ← User data
```

## 🛠️ Hands-On Commands

### Step 1: Basic Disk Usage Analysis
```bash
# Basic disk usage commands
echo "=== BASIC DISK USAGE ANALYSIS ==="

# Show filesystem disk usage
echo "Filesystem usage (df -h):"
df -h

# Show disk usage with filesystem types
echo ""
echo "Filesystem usage with types:"
df -hT

# Show inode usage
echo ""
echo "Inode usage:"
df -i | head -10

# Show only specific filesystem types
echo ""
echo "Ext4 filesystems only:"
df -t ext4 -h 2>/dev/null || echo "No ext4 filesystems found"

# Show disk usage summary
echo ""
echo "Disk usage summary:"
echo "Total disk space: $(df -h --total | tail -1 | awk '{print $2}')"
echo "Used space: $(df -h --total | tail -1 | awk '{print $3}')"
echo "Available space: $(df -h --total | tail -1 | awk '{print $4}')"
echo "Usage percentage: $(df -h --total | tail -1 | awk '{print $5}')"
```

### Step 2: Directory Usage Analysis
```bash
# Directory usage analysis with du
echo "=== DIRECTORY USAGE ANALYSIS ==="

# Show directory sizes in current location
echo "Directory sizes in current location:"
du -sh * 2>/dev/null | sort -hr | head -10

# Show subdirectory sizes with depth limit
echo ""
echo "Subdirectory sizes (max depth 2):"
du -h --max-depth=2 /var 2>/dev/null | sort -hr | head -10

# Find largest directories in /home
echo ""
echo "Largest directories in /home:"
du -sh /home/* 2>/dev/null | sort -hr | head -5

# Show disk usage for specific directories
echo ""
echo "System directory usage:"
for dir in /var/log /tmp /var/cache /usr/lib; do
    if [[ -d "$dir" ]]; then
        size=$(du -sh "$dir" 2>/dev/null | cut -f1)
        echo "  $dir: $size"
    fi
done

# Find large files (>100MB)
echo ""
echo "Large files (>100MB) in /var:"
find /var -type f -size +100M -exec ls -lh {} + 2>/dev/null | head -5

# Show hidden directory sizes in home
echo ""
echo "Hidden directory sizes in $HOME:"
du -sh "$HOME"/.[^.]* 2>/dev/null | sort -hr | head -5
```

### Step 3: Advanced Disk Analysis
```bash
# Advanced disk analysis techniques
echo "=== ADVANCED DISK ANALYSIS ==="

# Block device information
echo "Block devices (lsblk):"
lsblk 2>/dev/null || echo "lsblk not available"

# Detailed block device info
echo ""
echo "Block device details:"
cat /proc/partitions

# Disk I/O statistics
echo ""
echo "Disk I/O statistics:"
cat /proc/diskstats | head -5

# Mount information
echo ""
echo "Mount points:"
mount | grep -E "^/dev" | head -10

# Find the largest 20 files in system
echo ""
echo "Largest files on system (top 10):"
find / -type f -printf '%s %p\n' 2>/dev/null | sort -nr | head -10 | awk '{printf "%.1fMB %s\n", $1/1024/1024, $2}'

# Check for duplicate files by size
echo ""
echo "Potential duplicate files (same size):"
find /home -type f -printf '%s %p\n' 2>/dev/null | sort -n | uniq -d -w10 | head -5

# Analyze file types taking up space
echo ""
echo "Space usage by file type:"
find /home -type f -name "*.*" 2>/dev/null | sed 's/.*\.//' | sort | uniq -c | sort -nr | head -10

# Check for old files
echo ""
echo "Files older than 365 days in /var/log:"
find /var/log -type f -mtime +365 2>/dev/null | head -5
```

### Step 4: Quota Management (if supported)
```bash
# Quota management operations
echo "=== QUOTA MANAGEMENT ==="

# Check if quota tools are available
if ! command -v quota &> /dev/null; then
    echo "Quota tools not installed. Install with:"
    echo "  Ubuntu/Debian: sudo apt install quota"
    echo "  CentOS/RHEL: sudo yum install quota"
    echo ""
fi

# Show current quota status
echo "Checking quota status:"
sudo quotaon -p -a 2>/dev/null || echo "Quotas not enabled on any filesystem"

# Show user quotas (if enabled)
echo ""
echo "User quota information:"
quota -u 2>/dev/null || echo "User quotas not available or not enabled"

# Show group quotas (if enabled)
echo ""
echo "Group quota information:"
quota -g 2>/dev/null || echo "Group quotas not available or not enabled"

# Report all quotas (if enabled)
echo ""
echo "All quota reports:"
sudo repquota -a 2>/dev/null || echo "Quota reporting not available"

# Check filesystem quota support
echo ""
echo "Checking filesystem quota support:"
grep -E "(usrquota|grpquota)" /etc/fstab 2>/dev/null || echo "No quota-enabled filesystems in /etc/fstab"

# Quota setup example (commented for safety)
cat << 'EOF'

Quota Setup Example (run manually if needed):
1. Edit /etc/fstab to add quota options:
   /dev/sda1 /home ext4 defaults,usrquota,grpquota 0 2

2. Remount filesystem:
   sudo mount -o remount /home

3. Create quota files:
   sudo quotacheck -cug /home

4. Enable quotas:
   sudo quotaon /home

5. Set user quota:
   sudo setquota -u username 1000000 1100000 1000 1100 /home

6. Set group quota:
   sudo setquota -g groupname 5000000 5500000 5000 5500 /home
EOF
```

### Step 5: Automated Cleanup Tools
```bash
# Automated cleanup operations
echo "=== AUTOMATED CLEANUP TOOLS ==="

# Package cache cleanup
echo "Package management cleanup:"
if command -v apt &> /dev/null; then
    echo "APT cache size before cleanup:"
    du -sh /var/cache/apt 2>/dev/null || echo "APT cache not accessible"
    
    echo "Running apt cleanup (simulation):"
    echo "  sudo apt clean       # Remove downloaded packages"
    echo "  sudo apt autoclean   # Remove obsolete packages"
    echo "  sudo apt autoremove  # Remove unused dependencies"
    
elif command -v yum &> /dev/null; then
    echo "YUM cache cleanup:"
    echo "  sudo yum clean all"
    
elif command -v dnf &> /dev/null; then
    echo "DNF cache cleanup:"
    echo "  sudo dnf clean all"
fi

# Temporary file cleanup
echo ""
echo "Temporary file cleanup:"
echo "Files in /tmp older than 7 days:"
find /tmp -type f -mtime +7 2>/dev/null | wc -l

echo "Files in /var/tmp older than 30 days:"
find /var/tmp -type f -mtime +30 2>/dev/null | wc -l

# Log file analysis
echo ""
echo "Log file analysis:"
echo "Large log files (>10MB):"
find /var/log -type f -size +10M 2>/dev/null | head -5

echo ""
echo "Log rotation status:"
ls -la /etc/logrotate.d/ 2>/dev/null | wc -l && echo "logrotate configurations found" || echo "logrotate not configured"

# User cache cleanup
echo ""
echo "User cache analysis:"
if [[ -d "$HOME/.cache" ]]; then
    echo "User cache size: $(du -sh "$HOME/.cache" | cut -f1)"
    echo "Largest cache directories:"
    du -sh "$HOME/.cache"/* 2>/dev/null | sort -hr | head -5
fi

# Browser cache (common locations)
echo ""
echo "Browser cache locations:"
for cache_dir in \
    "$HOME/.cache/google-chrome" \
    "$HOME/.cache/firefox" \
    "$HOME/.cache/mozilla" \
    "$HOME/.cache/chromium"; do
    if [[ -d "$cache_dir" ]]; then
        echo "  $cache_dir: $(du -sh "$cache_dir" | cut -f1)"
    fi
done

# System journal size
echo ""
echo "System journal size:"
journalctl --disk-usage 2>/dev/null || echo "Journal size information not available"

# Create cleanup script template
cat > /tmp/cleanup_template.sh << 'EOF'
#!/bin/bash
# System Cleanup Script Template
echo "=== System Cleanup Script ==="

# Package cache cleanup
echo "Cleaning package cache..."
sudo apt clean 2>/dev/null
sudo apt autoremove -y 2>/dev/null

# Temporary files cleanup (older than 7 days)
echo "Cleaning temporary files..."
sudo find /tmp -type f -mtime +7 -delete 2>/dev/null
sudo find /var/tmp -type f -mtime +30 -delete 2>/dev/null

# User cache cleanup
echo "Cleaning user cache..."
rm -rf "$HOME/.cache/thumbnails/*" 2>/dev/null
rm -rf "$HOME/.cache/google-chrome/Default/Cache/*" 2>/dev/null

# Log cleanup (keep last 30 days)
echo "Rotating logs..."
sudo journalctl --vacuum-time=30d 2>/dev/null

# Empty trash
echo "Emptying trash..."
rm -rf "$HOME/.local/share/Trash/files/*" 2>/dev/null
rm -rf "$HOME/.local/share/Trash/info/*" 2>/dev/null

echo "Cleanup completed!"
echo "Run 'df -h' to see freed space."
EOF

echo ""
echo "Cleanup script template created: /tmp/cleanup_template.sh"
echo "Review and customize before using!"
```

## 🎯 Practice Challenges

### Disk Space Monitor
```bash
#!/bin/bash
echo "=== DISK SPACE MONITOR ==="

# Configuration
THRESHOLD=80  # Alert threshold in percentage
EMAIL="admin@localhost"  # Email for alerts (if configured)
LOG_FILE="/tmp/disk_monitor.log"

# Function to check disk usage
check_disk_usage() {
    df -h | grep -vE '^Filesystem|tmpfs|cdrom' | awk '{ print $5 " " $1 " " $6 }' | while read output; do
        usage=$(echo $output | awk '{ print $1}' | cut -d'%' -f1)
        partition=$(echo $output | awk '{ print $2 }')
        mount_point=$(echo $output | awk '{ print $3 }')
        
        if [ $usage -ge $THRESHOLD ]; then
            echo "$(date): ALERT - $partition ($mount_point) is ${usage}% full" | tee -a "$LOG_FILE"
            
            # Show top 10 largest directories in the problematic mount point
            echo "Largest directories in $mount_point:"
            du -sh "$mount_point"/* 2>/dev/null | sort -hr | head -10
            
            # Suggest cleanup actions
            echo "Suggested cleanup actions:"
            echo "1. Check for large log files: find $mount_point -name '*.log' -size +100M"
            echo "2. Clean temporary files: find $mount_point -name 'tmp*' -mtime +7"
            echo "3. Empty trash: rm -rf $HOME/.local/share/Trash/files/*"
            
        else
            echo "$(date): OK - $partition ($mount_point) is ${usage}% full" | tee -a "$LOG_FILE"
        fi
    done
}

# Function to generate disk usage report
generate_report() {
    echo "=== DISK USAGE REPORT ===" > /tmp/disk_report.txt
    echo "Generated: $(date)" >> /tmp/disk_report.txt
    echo "" >> /tmp/disk_report.txt
    
    echo "FILESYSTEM USAGE:" >> /tmp/disk_report.txt
    df -h >> /tmp/disk_report.txt
    echo "" >> /tmp/disk_report.txt
    
    echo "INODE USAGE:" >> /tmp/disk_report.txt
    df -i >> /tmp/disk_report.txt
    echo "" >> /tmp/disk_report.txt
    
    echo "LARGEST DIRECTORIES:" >> /tmp/disk_report.txt
    du -sh /* 2>/dev/null | sort -hr | head -10 >> /tmp/disk_report.txt
    echo "" >> /tmp/disk_report.txt
    
    echo "LARGEST FILES:" >> /tmp/disk_report.txt
    find / -type f -printf '%s %p\n' 2>/dev/null | sort -nr | head -10 | \
        awk '{printf "%.1fMB %s\n", $1/1024/1024, $2}' >> /tmp/disk_report.txt
    
    echo "Report saved to: /tmp/disk_report.txt"
}

# Main execution
echo "Checking disk usage against ${THRESHOLD}% threshold..."
check_disk_usage

echo ""
read -p "Generate detailed disk usage report? (y/n): " GENERATE_REPORT
if [[ "$GENERATE_REPORT" == "y" ]]; then
    generate_report
fi

echo ""
echo "Monitor log: $LOG_FILE"
echo "To run this monitor regularly, add to crontab:"
echo "*/30 * * * * /path/to/this/script"
```

### Quota Management Script
```bash
#!/bin/bash
echo "=== QUOTA MANAGEMENT SCRIPT ==="

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    echo "This script requires root privileges for quota management"
    echo "Run with: sudo $0"
    exit 1
fi

# Check if quota tools are installed
if ! command -v quota &> /dev/null; then
    echo "Quota tools not installed. Installing..."
    if command -v apt &> /dev/null; then
        apt update && apt install -y quota
    elif command -v yum &> /dev/null; then
        yum install -y quota
    else
        echo "Please install quota tools manually"
        exit 1
    fi
fi

# Function to setup quotas on a filesystem
setup_quotas() {
    local filesystem="$1"
    
    echo "Setting up quotas on $filesystem..."
    
    # Check if already enabled
    if quotaon -p "$filesystem" 2>/dev/null | grep -q "on"; then
        echo "Quotas already enabled on $filesystem"
        return
    fi
    
    echo "1. Adding quota options to /etc/fstab..."
    # Backup fstab
    cp /etc/fstab /etc/fstab.backup.$(date +%Y%m%d_%H%M%S)
    
    # Note: This is a simulation - real implementation would modify fstab
    echo "   (Simulated) Adding usrquota,grpquota options to $filesystem"
    
    echo "2. Creating quota files..."
    quotacheck -cug "$filesystem" 2>/dev/null
    
    echo "3. Enabling quotas..."
    quotaon "$filesystem" 2>/dev/null
    
    echo "Quota setup completed for $filesystem"
}

# Function to set user quota
set_user_quota() {
    local username="$1"
    local filesystem="$2"
    local soft_limit="$3"
    local hard_limit="$4"
    
    echo "Setting quota for user $username on $filesystem"
    echo "  Soft limit: ${soft_limit}MB"
    echo "  Hard limit: ${hard_limit}MB"
    
    # Convert MB to KB (quota uses KB)
    soft_kb=$((soft_limit * 1024))
    hard_kb=$((hard_limit * 1024))
    
    setquota -u "$username" "$soft_kb" "$hard_kb" 0 0 "$filesystem"
    
    echo "Quota set successfully"
}

# Function to show quota usage
show_quota_usage() {
    echo "=== QUOTA USAGE REPORT ==="
    
    echo "User quotas:"
    repquota -u -a 2>/dev/null | head -20
    
    echo ""
    echo "Group quotas:"
    repquota -g -a 2>/dev/null | head -10
    
    echo ""
    echo "Users exceeding quotas:"
    repquota -u -a 2>/dev/null | grep "++"
}

# Function to cleanup exceeded quotas
quota_cleanup_suggestions() {
    echo "=== QUOTA CLEANUP SUGGESTIONS ==="
    
    # Find users over quota
    repquota -u -a 2>/dev/null | grep "++" | while read line; do
        username=$(echo "$line" | awk '{print $1}')
        echo ""
        echo "User $username is over quota:"
        echo "  Large files in home directory:"
        find "/home/$username" -type f -size +10M 2>/dev/null | head -10
        echo "  Cache directories:"
        du -sh "/home/$username/.cache"/* 2>/dev/null | head -5
    done
}

# Main menu
while true; do
    echo ""
    echo "=== QUOTA MANAGEMENT MENU ==="
    echo "1. Show quota status"
    echo "2. Setup quotas on filesystem"
    echo "3. Set user quota"
    echo "4. Show quota usage report"
    echo "5. Quota cleanup suggestions"
    echo "6. Exit"
    
    read -p "Select option (1-6): " choice
    
    case $choice in
        1)
            quotaon -p -a 2>/dev/null
            ;;
        2)
            read -p "Enter filesystem path: " fs_path
            setup_quotas "$fs_path"
            ;;
        3)
            read -p "Enter username: " username
            read -p "Enter filesystem: " filesystem
            read -p "Enter soft limit (MB): " soft
            read -p "Enter hard limit (MB): " hard
            set_user_quota "$username" "$filesystem" "$soft" "$hard"
            ;;
        4)
            show_quota_usage
            ;;
        5)
            quota_cleanup_suggestions
            ;;
        6)
            echo "Exiting quota management"
            exit 0
            ;;
        *)
            echo "Invalid option. Please try again."
            ;;
    esac
done
```

---

## 🎓 Part 4 Summary and Mastery Check

Congratulations! You've completed Linux OS & Administration Part 4. Let's verify your advanced administration skills:

### 🔍 Self-Assessment Quiz

**Networking (Chapter 13):**
1. What's the difference between TCP and UDP?
2. How do you check which process is listening on port 80?
3. What command shows your routing table?

**Firewall & Security (Chapter 14):**
1. How do you allow SSH through UFW firewall?
2. What's the difference between iptables and UFW?
3. How do you check failed login attempts?

**Crontab (Chapter 15):**
1. What does `0 2 * * 1` mean in crontab?
2. How do you list a user's cron jobs?
3. Where are system-wide cron jobs stored?

**File Search (Chapter 16):**
1. How do you find files larger than 100MB?
2. What's the difference between `find` and `locate`?
3. How do you search for text within files recursively?

**Archives (Chapter 17):**
1. What's the command to create a gzip-compressed tar archive?
2. How do you list contents of a zip file without extracting?
3. Which compression method provides the best compression ratio?

**Disk Usage (Chapter 18):**
1. How do you show filesystem usage in human-readable format?
2. What's the difference between `df` and `du`?
3. How do you find the largest directories on your system?

### 🏆 Advanced Challenges

Try these real-world scenarios to test your mastery:

1. **Network Security Audit**: Set up a firewall, monitor network connections, and create a security report
2. **Automated Backup System**: Create a cron job that backs up important directories with rotation
3. **Disk Cleanup Automation**: Write a script that identifies and cleans large unnecessary files
4. **Log Analysis Pipeline**: Build a system to search, process, and analyze log files
5. **System Monitoring Dashboard**: Combine all tools to create a comprehensive system health check

### 🎯 Next Steps

With Part 4 completed, you've mastered:
- ✅ Network configuration and troubleshooting
- ✅ Firewall management and security hardening
- ✅ Task automation with cron
- ✅ Advanced file searching and text processing
- ✅ Archive management and compression
- ✅ Disk usage monitoring and quota management

**Ready for Production**: You now have the skills to manage Linux systems in production environments!

**Continue Learning**: Consider exploring:
- Container technologies (Docker, Kubernetes)
- Configuration management (Ansible, Puppet)
- Monitoring solutions (Nagios, Zabbix)
- Cloud platforms (AWS, Azure, GCP)

### 📚 Quick Reference Commands

```bash
# Network
ip addr show               # Show network interfaces
ss -tulpn                 # Show listening ports
ping -c 3 google.com      # Test connectivity

# Firewall
sudo ufw status           # Check UFW status
sudo ufw allow ssh        # Allow SSH
sudo ufw enable           # Enable firewall

# Cron
crontab -l               # List cron jobs
crontab -e               # Edit cron jobs
0 2 * * * command        # Daily at 2 AM

# File Search
find / -name "*.log"     # Find log files
find / -size +100M       # Find large files
grep -r "error" /var/log # Search in logs

# Archives
tar -czf backup.tar.gz /home    # Create compressed archive
tar -xzf backup.tar.gz          # Extract archive
zip -r archive.zip directory/   # Create ZIP

# Disk Usage
df -h                    # Filesystem usage
du -sh *                 # Directory sizes
ncdu                     # Interactive disk analyzer
```

**🎉 Congratulations! You're now a Linux Advanced Administrator!**
