# Linux Mastery: From Zero to Hero - 100% Hands-On Training

## 🚀 Welcome to Linux Magic!

**Remember this forever: Linux is like a house with many rooms. Each command is a key that opens specific doors. Master the keys, master the house!**

---

## 📋 Table of Contents
1. [Linux OS & Administration](#linux-os--administration)
2. [Linux Shell Scripting](#linux-shell-scripting)
3. [Real-World Projects](#real-world-projects)

---

# Linux OS & Administration

## Chapter 1: Understanding Linux Distributions

### 🔑 Key Concept
Think of Linux distributions like different car brands - they all have engines (Linux kernel) but different features and interfaces.

### Hands-On Commands

```bash
# Check your Linux distribution
cat /etc/os-release
lsb_release -a
hostnamectl

# Check kernel version
uname -r
uname -a

# Check system architecture
arch
uname -m
```

### 🎯 Exercise 1.1
```bash
# Create a system info script
echo "=== My Linux System Info ===" > system_info.txt
echo "Distribution: $(lsb_release -d | cut -f2)" >> system_info.txt
echo "Kernel: $(uname -r)" >> system_info.txt
echo "Architecture: $(uname -m)" >> system_info.txt
cat system_info.txt
```

---

## Chapter 2: Linux Boot Process & System Architecture

### 🔑 Key Concept
Linux boot is like waking up a person: BIOS → Bootloader → Kernel → Init → Services

### Hands-On Commands

```bash
# Check boot messages
dmesg | head -20
dmesg | grep -i error

# Check system uptime
uptime
who -b

# Check running services
systemctl list-units --type=service --state=running
systemctl status

# Check boot time
systemd-analyze
systemd-analyze blame
```

### 🎯 Exercise 2.1
```bash
# Create boot analysis report
echo "=== Boot Analysis Report ===" > boot_report.txt
echo "Boot Time: $(systemd-analyze | head -1)" >> boot_report.txt
echo "Slowest Services:" >> boot_report.txt
systemd-analyze blame | head -5 >> boot_report.txt
cat boot_report.txt
```

---

## Chapter 3: Installing Linux & Virtualization

### 🔑 Key Concept
VirtualBox is like having a computer inside your computer - perfect for learning!

### Hands-On Commands

```bash
# Check if running in virtual environment
sudo dmidecode -s system-manufacturer
lscpu | grep Virtualization

# Install VirtualBox Guest Additions (if in VirtualBox)
sudo apt update && sudo apt install virtualbox-guest-additions-iso

# Check available disk space for installation
df -h
lsblk
```

### 🎯 Exercise 3.1
```bash
# System readiness check
echo "=== Installation Readiness Check ===" > readiness.txt
echo "Available Space: $(df -h / | tail -1 | awk '{print $4}')" >> readiness.txt
echo "Memory: $(free -h | grep Mem | awk '{print $2}')" >> readiness.txt
echo "CPU Cores: $(nproc)" >> readiness.txt
cat readiness.txt
```

---

## Chapter 4: Terminal Mastery & SSH

### 🔑 Key Concept
Terminal is your magic wand. SSH is teleportation to other computers!

### Hands-On Commands

```bash
# Terminal shortcuts (memorize these!)
# Ctrl+C = Stop current command
# Ctrl+Z = Suspend current command
# Ctrl+L = Clear screen
# Ctrl+R = Search command history
# Tab = Auto-complete
# Up/Down arrows = Command history

# Check current terminal
tty
echo $TERM

# Terminal customization
PS1="[\u@\h \W]\$ "  # Change prompt
alias ll='ls -la'    # Create alias
alias ..='cd ..'

# SSH basics
ssh username@hostname
ssh -p 2222 username@hostname  # Different port
ssh-keygen -t rsa              # Generate SSH key
ssh-copy-id username@hostname  # Copy public key
```

### 🎯 Exercise 4.1
```bash
# Create your custom terminal setup
echo "# My Custom Terminal Setup" >> ~/.bashrc
echo "alias ll='ls -la --color=auto'" >> ~/.bashrc
echo "alias grep='grep --color=auto'" >> ~/.bashrc
echo "alias la='ls -A'" >> ~/.bashrc
echo "export PS1='\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '" >> ~/.bashrc
source ~/.bashrc
```

---

## Chapter 5: File System Navigation

### 🔑 Key Concept
Linux file system is like a tree: / is the root, branches are directories. Everything is a file!

### Hands-On Commands

```bash
# Essential navigation
pwd                    # Where am I?
ls                     # What's here?
ls -la                 # Show all details
ls -lh                 # Human readable sizes
cd /                   # Go to root
cd ~                   # Go to home
cd -                   # Go to previous directory
cd ..                  # Go up one level
cd ../..               # Go up two levels

# File system exploration
tree /                 # View directory tree
tree -L 2 /           # Limit depth
find / -name "*.conf" 2>/dev/null | head -10

# Important directories
ls -la /bin           # Essential commands
ls -la /etc           # Configuration files
ls -la /var/log       # Log files
ls -la /home          # User home directories
ls -la /tmp           # Temporary files
```

### 🎯 Exercise 5.1
```bash
# File system explorer script
#!/bin/bash
echo "=== File System Explorer ==="
echo "Current location: $(pwd)"
echo "Home directory: $HOME"
echo "Files in current directory:"
ls -la
echo ""
echo "Disk usage of current directory:"
du -sh .
echo ""
echo "File system information:"
df -h .
```

---

## Chapter 6: User and Group Management

### 🔑 Key Concept
Users are like people in a building, groups are like departments. Everyone has an ID card (UID/GID)!

### Hands-On Commands

```bash
# User information
whoami                 # Who am I?
id                     # My user details
id username           # Someone else's details
w                     # Who's online?
last                  # Login history

# User management (requires sudo)
sudo adduser newuser           # Add user (interactive)
sudo useradd -m -s /bin/bash testuser  # Add user (manual)
sudo passwd testuser           # Set password
sudo userdel -r olduser       # Delete user and home
sudo usermod -G group1,group2 username  # Add to groups

# Group management
groups                # My groups
getent group         # All groups
sudo groupadd developers     # Create group
sudo groupdel oldgroup      # Delete group
sudo usermod -a -G sudo username  # Add user to sudo group

# Switch users
su - username        # Switch user
sudo su -            # Become root
```

### 🎯 Exercise 6.1
```bash
# User management practice
echo "=== User Management Exercise ==="
echo "Current user: $(whoami)"
echo "User ID: $(id -u)"
echo "Groups: $(groups)"
echo ""

# Create a test user (comment out if not sudo user)
# sudo adduser testdummy --disabled-password --gecos ""
# echo "Created test user: testdummy"
# id testdummy
```

---

## Chapter 7: Permissions & Ownership

### 🔑 Key Concept
Permissions are like locks: r(read), w(write), x(execute). Numbers: 4+2+1 = 7 (rwx)

### Hands-On Commands

```bash
# Understanding permissions
ls -la                 # View permissions
touch testfile.txt     # Create test file
ls -la testfile.txt    # Check permissions

# Permission breakdown: drwxrwxrwx
# d = directory (- for file)
# rwx = owner permissions
# rwx = group permissions  
# rwx = others permissions

# Changing permissions
chmod 755 testfile.txt    # rwxr-xr-x
chmod 644 testfile.txt    # rw-r--r--
chmod +x testfile.txt     # Add execute
chmod -w testfile.txt     # Remove write
chmod u+w testfile.txt    # Add write for user

# Ownership
chown user:group file     # Change owner and group
chown user file          # Change owner only
chgrp group file         # Change group only

# Practical examples
mkdir testdir
chmod 755 testdir        # Standard directory permissions
chmod 644 *.txt          # Standard file permissions
```

### 🎯 Exercise 7.1
```bash
# Permissions practice lab
echo "=== Permissions Lab ==="
mkdir -p lab/secret lab/public
touch lab/secret/topsecret.txt lab/public/readme.txt

# Set permissions
chmod 700 lab/secret              # Only owner access
chmod 644 lab/secret/topsecret.txt # Read-only for others
chmod 755 lab/public              # Everyone can read/execute
chmod 644 lab/public/readme.txt   # Standard file permissions

echo "Secret directory (owner only):"
ls -la lab/
echo "Public directory (everyone can read):"
ls -la lab/public/

# Test permissions
echo "This is secret!" > lab/secret/topsecret.txt
echo "This is public!" > lab/public/readme.txt
```

---

## Chapter 8: Package Management

### 🔑 Key Concept
Package managers are like app stores. APT (Debian/Ubuntu), YUM/DNF (RedHat/CentOS)

### Hands-On Commands

```bash
# APT (Ubuntu/Debian)
sudo apt update              # Update package list
sudo apt upgrade             # Upgrade packages
sudo apt install htop       # Install package
sudo apt remove package     # Remove package
sudo apt purge package      # Remove package + config
sudo apt autoremove         # Remove unused packages
sudo apt search keyword     # Search packages
apt list --installed        # List installed packages

# Alternative commands for other distros
# sudo yum install package   # CentOS 7
# sudo dnf install package   # CentOS 8+/Fedora

# Snap packages (universal)
sudo snap install code --classic
snap list
sudo snap remove package

# Manual package installation
wget http://example.com/package.deb
sudo dpkg -i package.deb
sudo apt -f install         # Fix dependencies
```

### 🎯 Exercise 8.1
```bash
# Package management lab
echo "=== Package Management Lab ==="

# Install useful tools
sudo apt update
sudo apt install -y tree htop curl wget git

# Check what we installed
echo "Installed packages:"
apt list tree htop curl wget git 2>/dev/null | grep installed

# Create package report
echo "=== System Package Report ===" > package_report.txt
echo "Total installed packages: $(apt list --installed 2>/dev/null | wc -l)" >> package_report.txt
echo "Upgradeable packages: $(apt list --upgradable 2>/dev/null | wc -l)" >> package_report.txt
cat package_report.txt
```

---

## Chapter 9: Process Management

### 🔑 Key Concept
Processes are like workers in a factory. Each has a PID (Process ID) like an employee number.

### Hands-On Commands

```bash
# View processes
ps                    # My processes
ps aux               # All processes
ps -ef               # All processes (alternative format)
pstree               # Process tree
top                  # Real-time process monitor
htop                 # Better process monitor

# Process information
ps aux | grep nginx  # Find specific process
pgrep nginx         # Find process by name
pidof nginx         # Get PID of process

# Process control
kill PID            # Terminate process (SIGTERM)
kill -9 PID         # Force kill (SIGKILL)
killall processname # Kill all instances
pkill processname   # Kill by name

# Background processes
command &           # Run in background
jobs               # List background jobs
fg %1              # Bring job to foreground
bg %1              # Send job to background
nohup command &    # Run even after logout

# Process monitoring
watch "ps aux | grep nginx"  # Monitor continuously
```

### 🎯 Exercise 9.1
```bash
# Process management lab
echo "=== Process Management Lab ==="

# Start some background processes
sleep 100 &
sleep 200 &
sleep 300 &

echo "Background jobs:"
jobs

echo "All sleep processes:"
ps aux | grep sleep | grep -v grep

echo "Process tree:"
pstree -p $$

# Kill our test processes
killall sleep
echo "Cleaned up test processes"
```

---

## Chapter 10: Service Management with systemd

### 🔑 Key Concept
Services are like hotel staff - they run in the background serving you. systemd is the manager!

### Hands-On Commands

```bash
# Service status
systemctl status servicename
systemctl status ssh
systemctl status apache2

# Service control
sudo systemctl start servicename
sudo systemctl stop servicename
sudo systemctl restart servicename
sudo systemctl reload servicename

# Service management
sudo systemctl enable servicename   # Start at boot
sudo systemctl disable servicename  # Don't start at boot
systemctl is-enabled servicename    # Check if enabled
systemctl is-active servicename     # Check if running

# List services
systemctl list-units --type=service
systemctl list-units --type=service --state=running
systemctl list-units --type=service --state=failed

# Create custom service
sudo nano /etc/systemd/system/myapp.service
sudo systemctl daemon-reload        # Reload systemd
```

### Sample Service File
```ini
[Unit]
Description=My Custom Application
After=network.target

[Service]
Type=simple
User=myuser
WorkingDirectory=/opt/myapp
ExecStart=/opt/myapp/start.sh
Restart=always

[Install]
WantedBy=multi-user.target
```

### 🎯 Exercise 10.1
```bash
# Service management lab
echo "=== Service Management Lab ==="

# Check important services
services=("ssh" "networking" "systemd-resolved")
for service in "${services[@]}"; do
    echo "Service: $service"
    systemctl is-active $service
    systemctl is-enabled $service
    echo ""
done

# List failed services
echo "Failed services:"
systemctl --failed

# Service dependency tree
systemctl list-dependencies
```

---

## Chapter 11: Log Files and Monitoring

### 🔑 Key Concept
Logs are like a diary - they tell you what happened and when. journalctl reads the modern diary!

### Hands-On Commands

```bash
# System logs with journalctl
journalctl                    # All logs
journalctl -f                 # Follow logs (tail -f style)
journalctl -u servicename     # Logs for specific service
journalctl --since "1 hour ago"
journalctl --since "2023-01-01"
journalctl -p err             # Only errors
journalctl -k                 # Kernel messages

# Traditional log files
sudo tail -f /var/log/syslog     # System log
sudo tail -f /var/log/auth.log   # Authentication log
sudo tail -f /var/log/dpkg.log   # Package management log
ls -la /var/log/                 # All log files

# Log rotation
logrotate --help
cat /etc/logrotate.conf

# Monitor logs in real-time
sudo multitail /var/log/syslog /var/log/auth.log
```

### 🎯 Exercise 11.1
```bash
# Log monitoring lab
echo "=== Log Monitoring Lab ==="

# Create log summary
echo "=== System Log Summary ===" > log_summary.txt
echo "Boot time: $(journalctl -b | head -1 | awk '{print $1, $2, $3}')" >> log_summary.txt
echo "Error count today: $(journalctl --since today -p err | wc -l)" >> log_summary.txt
echo "Warning count today: $(journalctl --since today -p warning | wc -l)" >> log_summary.txt
echo "Last 5 login attempts:" >> log_summary.txt
sudo grep "sshd" /var/log/auth.log | tail -5 >> log_summary.txt 2>/dev/null || echo "No SSH logs found" >> log_summary.txt

cat log_summary.txt
```

---

## Chapter 12: Disk Management & Mounting

### 🔑 Key Concept
Disks are like filing cabinets. You need to "mount" them (attach) before you can use them!

### Hands-On Commands

```bash
# View disks and partitions
lsblk                    # Block devices tree
fdisk -l                 # List all disks
df -h                    # Disk space usage
du -sh /path/to/dir     # Directory size

# Mount/unmount
sudo mount /dev/sdb1 /mnt/mydisk
sudo umount /mnt/mydisk
mount | grep -v tmpfs   # Show mounted filesystems

# Permanent mounts
sudo nano /etc/fstab
# Format: device mountpoint filesystem options dump pass
# /dev/sdb1 /mnt/mydisk ext4 defaults 0 2

# USB devices
sudo mkdir /mnt/usb
sudo mount /dev/sdc1 /mnt/usb
ls /mnt/usb
sudo umount /mnt/usb

# Check filesystem
sudo fsck /dev/sdb1      # Check and repair
sudo mkfs.ext4 /dev/sdb1 # Format as ext4
```

### 🎯 Exercise 12.1
```bash
# Disk management lab
echo "=== Disk Management Lab ==="

# Disk usage report
echo "=== Disk Usage Report ===" > disk_report.txt
echo "Filesystem usage:" >> disk_report.txt
df -h >> disk_report.txt
echo "" >> disk_report.txt
echo "Largest directories in /var:" >> disk_report.txt
sudo du -sh /var/* 2>/dev/null | sort -hr | head -5 >> disk_report.txt
echo "" >> disk_report.txt
echo "Block devices:" >> disk_report.txt
lsblk >> disk_report.txt

cat disk_report.txt
```

---

## Chapter 13: Networking Basics

### 🔑 Key Concept
Networking is like postal system. IP addresses are like house addresses, ports are like apartment numbers!

### Hands-On Commands

```bash
# Network interface information
ip addr show            # Show IP addresses
ip route show          # Show routing table
ifconfig               # Old way (may need net-tools)

# Network connectivity
ping google.com        # Test connectivity
ping -c 4 8.8.8.8     # Ping 4 times
traceroute google.com  # Show route to destination

# Network statistics
netstat -tuln          # Show listening ports
ss -tuln               # Modern replacement for netstat
ss -tulpn              # Show process names too

# DNS
nslookup google.com
dig google.com
cat /etc/resolv.conf   # DNS configuration

# Download files
wget https://example.com/file
curl -O https://example.com/file
curl -s http://ipinfo.io  # Get public IP info
```

### 🎯 Exercise 13.1
```bash
# Network diagnostics lab
echo "=== Network Diagnostics Lab ==="

# Create network report
echo "=== Network Status Report ===" > network_report.txt
echo "Hostname: $(hostname)" >> network_report.txt
echo "IP Address: $(ip route get 8.8.8.8 | awk '{print $7}' | head -1)" >> network_report.txt
echo "Gateway: $(ip route | grep default | awk '{print $3}')" >> network_report.txt
echo "DNS Servers:" >> network_report.txt
cat /etc/resolv.conf | grep nameserver >> network_report.txt
echo "" >> network_report.txt
echo "Open ports:" >> network_report.txt
ss -tuln | head -10 >> network_report.txt

cat network_report.txt
```

---

## Chapter 14: Firewall & Security

### 🔑 Key Concept
Firewall is like a security guard - it decides who can come in and who can't!

### Hands-On Commands

```bash
# UFW (Uncomplicated Firewall) - Ubuntu
sudo ufw status           # Check status
sudo ufw enable           # Enable firewall
sudo ufw disable          # Disable firewall
sudo ufw allow 22         # Allow SSH
sudo ufw allow 80/tcp     # Allow HTTP
sudo ufw deny 21          # Block FTP
sudo ufw delete allow 80  # Remove rule

# iptables (advanced)
sudo iptables -L          # List rules
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables-save        # Save rules

# Security checks
sudo netstat -tulpn | grep :22  # Check SSH port
last                             # Recent logins
sudo grep "Failed password" /var/log/auth.log | tail -10
who                              # Currently logged in users

# File integrity
sudo find /etc -name "*.conf" -mtime -1  # Modified configs last 24h
sudo find /home -perm 777                # World-writable files
```

### 🎯 Exercise 14.1
```bash
# Security audit lab
echo "=== Security Audit Lab ==="

# Create security report
echo "=== Security Audit Report ===" > security_report.txt
echo "Firewall status: $(sudo ufw status | head -1)" >> security_report.txt
echo "Failed login attempts today:" >> security_report.txt
sudo grep "Failed password" /var/log/auth.log 2>/dev/null | grep "$(date '+%b %d')" | wc -l >> security_report.txt
echo "Currently logged in:" >> security_report.txt
who >> security_report.txt
echo "Listening services:" >> security_report.txt
sudo ss -tulpn | grep LISTEN | head -5 >> security_report.txt

cat security_report.txt
```

---

## Chapter 15: Crontab & Scheduled Jobs

### 🔑 Key Concept
Cron is like a personal assistant that does tasks at scheduled times. Perfect memory, never sleeps!

### Hands-On Commands

```bash
# Crontab management
crontab -l              # List my cron jobs
crontab -e              # Edit my cron jobs
crontab -r              # Remove all my cron jobs
sudo crontab -l         # Root's cron jobs

# Cron format: minute hour day month weekday command
# * * * * * command
# 0 2 * * * /path/to/backup.sh    # Daily at 2 AM
# 0 */6 * * * /path/to/check.sh   # Every 6 hours
# 30 23 * * 0 /path/to/weekly.sh  # Weekly on Sunday 11:30 PM

# System cron directories
ls -la /etc/cron.d/      # System cron jobs
ls -la /etc/cron.daily/  # Daily scripts
ls -la /etc/cron.hourly/ # Hourly scripts
ls -la /etc/cron.weekly/ # Weekly scripts
ls -la /etc/cron.monthly/# Monthly scripts

# Test cron jobs
# Add this to test: */1 * * * * echo "Hello from cron: $(date)" >> /tmp/crontest.log
# Wait a minute and check: tail /tmp/crontest.log
```

### Sample Cron Jobs
```bash
# Backup home directory daily at 2 AM
0 2 * * * tar -czf /backup/home_$(date +\%Y\%m\%d).tar.gz /home/

# Clean temporary files every hour
0 * * * * find /tmp -type f -mtime +1 -delete

# System update check weekly
0 9 * * 1 apt update && apt list --upgradable > /var/log/updates-available.log

# Restart web server monthly
0 3 1 * * systemctl restart apache2
```

### 🎯 Exercise 15.1
```bash
# Cron job lab
echo "=== Cron Job Lab ==="

# Create a test cron job
echo "# Test cron job - runs every minute" > /tmp/mycron
echo "*/1 * * * * echo 'Cron test: \$(date)' >> /tmp/crontest.log" >> /tmp/mycron
crontab /tmp/mycron

echo "Added test cron job. Check /tmp/crontest.log in a minute"
echo "Current cron jobs:"
crontab -l

# Clean up after test (uncomment to remove test job)
# crontab -r
```

---

## Chapter 16: File Search & Text Processing

### 🔑 Key Concept
find is like a detective, grep is like a highlighter, awk is like a data analyst!

### Hands-On Commands

```bash
# Finding files
find /home -name "*.txt"           # Find by name
find /var -type f -size +100M      # Files larger than 100MB
find /etc -mtime -1                # Modified in last 24 hours
find /tmp -user $USER              # Files owned by me
find . -perm 755                   # Files with specific permissions

# Advanced find
find /var/log -name "*.log" -exec ls -lh {} \;
find /home -name "*.bak" -delete
find . -type f -empty              # Empty files

# Text searching with grep
grep "error" /var/log/syslog       # Find errors in log
grep -r "TODO" /home/project/      # Recursive search
grep -i "password" file.txt        # Case insensitive
grep -n "error" file.txt           # Show line numbers
grep -v "debug" file.txt           # Exclude lines with "debug"

# Advanced grep
grep -E "error|warning" file.txt   # Multiple patterns
grep -A 3 -B 3 "error" file.txt    # Show 3 lines before/after
ps aux | grep nginx                # Grep with pipes

# AWK text processing
awk '{print $1}' file.txt          # Print first column
awk '{print $1, $3}' file.txt      # Print columns 1 and 3
awk '/error/ {print $0}' file.txt  # Print lines containing "error"
df -h | awk '{print $5}' | grep %  # Disk usage percentages

# Other text tools
cut -d: -f1 /etc/passwd            # Get usernames
sort file.txt                      # Sort lines
uniq file.txt                      # Remove duplicates
wc -l file.txt                     # Count lines
head -n 10 file.txt                # First 10 lines
tail -n 10 file.txt                # Last 10 lines
```

### 🎯 Exercise 16.1
```bash
# Text processing lab
echo "=== Text Processing Lab ==="

# Create test data
echo -e "apple\nbanana\napple\ncherry\nbanana\ndate" > fruits.txt
echo -e "john:25:engineer\nmary:30:doctor\nbob:28:teacher" > people.txt

# Find and process
echo "Unique fruits:"
sort fruits.txt | uniq

echo "People older than 27:"
awk -F: '$2 > 27 {print $1, "is", $2, "years old"}' people.txt

echo "Log files modified today:"
find /var/log -name "*.log" -mtime 0 2>/dev/null | head -5

# Clean up
rm fruits.txt people.txt
```

---

## Chapter 17: Archives & Compression

### 🔑 Key Concept
Archives are like moving boxes. tar = tape archive, gzip = compress, zip = both archive + compress

### Hands-On Commands

```bash
# TAR (Tape Archive)
tar -cvf archive.tar files/        # Create archive
tar -xvf archive.tar               # Extract archive
tar -tvf archive.tar               # List archive contents

# TAR with compression
tar -czvf archive.tar.gz files/    # Create compressed archive
tar -xzvf archive.tar.gz           # Extract compressed archive
tar -cjvf archive.tar.bz2 files/   # Create bzip2 archive
tar -xjvf archive.tar.bz2          # Extract bzip2 archive

# Individual compression
gzip file.txt                      # Compress file
gunzip file.txt.gz                 # Decompress file
bzip2 file.txt                     # Better compression
bunzip2 file.txt.bz2               # Decompress bzip2

# ZIP archives
zip -r archive.zip directory/      # Create zip archive
unzip archive.zip                  # Extract zip archive
unzip -l archive.zip               # List zip contents

# Quick backup examples
tar -czvf backup_$(date +%Y%m%d).tar.gz /home/user/documents/
tar -czvf website_backup.tar.gz /var/www/html/
```

### 🎯 Exercise 17.1
```bash
# Archive management lab
echo "=== Archive Management Lab ==="

# Create test directory structure
mkdir -p testdata/{docs,pics,code}
echo "Document 1" > testdata/docs/file1.txt
echo "Document 2" > testdata/docs/file2.txt
echo "#!/bin/bash" > testdata/code/script.sh
echo "Photo metadata" > testdata/pics/photo1.jpg

# Create different types of archives
tar -cvf testdata.tar testdata/
tar -czvf testdata.tar.gz testdata/
zip -r testdata.zip testdata/

# Compare sizes
echo "Archive sizes:"
ls -lh testdata.tar* testdata.zip

# Test extraction
mkdir extract_test
cd extract_test
tar -xzf ../testdata.tar.gz
ls -la
cd ..

# Clean up
rm -rf testdata extract_test testdata.tar* testdata.zip
```

---

## Chapter 18: Disk Usage & Quota Management

### 🔑 Key Concept
Monitor disk space like monitoring your bank account - before it runs out!

### Hands-On Commands

```bash
# Disk space monitoring
df -h                    # Human readable disk space
df -i                    # Inode usage
du -sh /home/*          # Directory sizes
du -h --max-depth=1 /var # One level deep

# Find large files
find /home -size +100M -ls
find / -size +1G 2>/dev/null

# Disk usage analysis
ncdu /home              # Interactive disk usage analyzer
baobab                  # GUI disk usage analyzer (if available)

# Clean up space
sudo apt autoremove     # Remove unused packages
sudo apt autoclean      # Clean package cache
sudo journalctl --vacuum-time=7d  # Clean old logs

# Quota management (if enabled)
quota -u username       # User quota
repquota -a            # All quotas
sudo edquota username  # Edit user quota
```

### Space-Saving Script
```bash
#!/bin/bash
# cleanup.sh - System cleanup script

echo "=== System Cleanup ==="

# Package cache cleanup
echo "Cleaning package cache..."
sudo apt autoremove -y
sudo apt autoclean

# Log cleanup
echo "Cleaning old logs..."
sudo journalctl --vacuum-time=7d

# Temp file cleanup
echo "Cleaning temp files..."
sudo find /tmp -type f -atime +7 -delete

# Show results
echo "Disk space after cleanup:"
df -h
```

### 🎯 Exercise 18.1
```bash
# Disk monitoring lab
echo "=== Disk Monitoring Lab ==="

# Create disk usage report
echo "=== Disk Usage Report ===" > disk_usage.txt
echo "Generated: $(date)" >> disk_usage.txt
echo "" >> disk_usage.txt
echo "Filesystem Usage:" >> disk_usage.txt
df -h >> disk_usage.txt
echo "" >> disk_usage.txt
echo "Largest directories in /home:" >> disk_usage.txt
sudo du -sh /home/* 2>/dev/null | sort -hr | head -5 >> disk_usage.txt
echo "" >> disk_usage.txt
echo "Files larger than 50MB:" >> disk_usage.txt
find /home -size +50M -ls 2>/dev/null | head -5 >> disk_usage.txt

cat disk_usage.txt
```

---

# Linux Shell Scripting

## Chapter 19: Introduction to Shells

### 🔑 Key Concept
Shell is your interpreter - it translates your commands into system language. bash is the most popular!

### Hands-On Commands

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

### 🎯 Exercise 19.1
```bash
# Shell exploration lab
echo "=== Shell Information ==="
echo "Current shell: $SHELL"
echo "Shell version: $BASH_VERSION"
echo "Available shells:"
cat /etc/shells
echo ""
echo "Shell variables starting with 'HOME':"
env | grep HOME
echo ""
echo "Command history count: $(history | wc -l)"
```

---

## Chapter 20: Your First Bash Script

### 🔑 Key Concept
Scripts are like recipes - step by step instructions saved in a file!

### Basic Script Structure

```bash
#!/bin/bash
# This is a comment
# Script: myfirst.sh
# Purpose: My first bash script

echo "Hello, Linux World!"
echo "Today is: $(date)"
echo "Current user: $(whoami)"
echo "Current directory: $(pwd)"
```

### Hands-On Commands

```bash
# Create your first script
nano myfirst.sh

# Make it executable
chmod +x myfirst.sh

# Run the script
./myfirst.sh

# Alternative ways to run
bash myfirst.sh
sh myfirst.sh

# Check script syntax
bash -n myfirst.sh
```

### Advanced First Script

```bash
#!/bin/bash
# advanced_first.sh - A more comprehensive first script

# Variables
SCRIPT_NAME="Advanced First Script"
VERSION="1.0"
AUTHOR="Your Name"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}$SCRIPT_NAME v$VERSION${NC}"
    echo -e "${GREEN}By: $AUTHOR${NC}"
    echo -e "${GREEN}================================${NC}"
}

system_info() {
    echo -e "${YELLOW}System Information:${NC}"
    echo "Hostname: $(hostname)"
    echo "OS: $(lsb_release -d | cut -f2)"
    echo "Kernel: $(uname -r)"
    echo "Uptime: $(uptime -p)"
    echo "Load Average: $(uptime | awk -F'load average:' '{print $2}')"
}

# Main execution
print_header
system_info
echo -e "${RED}Script completed successfully!${NC}"
```

### 🎯 Exercise 20.1
```bash
# Create a personal system info script
cat << 'EOF' > system_info.sh
#!/bin/bash
# system_info.sh - Personal system information script

echo "=== Personal System Information ==="
echo "Date: $(date)"
echo "User: $(whoami)"
echo "Home Directory: $HOME"
echo "Current Directory: $(pwd)"
echo "Shell: $SHELL"
echo "Terminal: $TERM"
echo ""
echo "=== System Stats ==="
echo "Hostname: $(hostname)"
echo "Uptime: $(uptime -p)"
echo "Disk Usage:"
df -h / | tail -1
echo "Memory Usage:"
free -h | grep Mem
echo "=== End Report ==="
EOF

chmod +x system_info.sh
./system_info.sh
```

---

## Chapter 21: Script Permissions & Execution

### 🔑 Key Concept
Scripts need execute permission to run. Think of it like giving someone permission to use your recipe!

### Hands-On Commands

```bash
# Check script permissions
ls -la script.sh

# Add execute permissions
chmod +x script.sh           # Add execute for all
chmod u+x script.sh          # Add execute for user only
chmod 755 script.sh          # rwxr-xr-x

# Run scripts different ways
./script.sh                  # Direct execution (needs +x)
bash script.sh              # Run with bash interpreter
sh script.sh                # Run with sh interpreter
source script.sh            # Run in current shell
. script.sh                  # Same as source

# Make script available system-wide
sudo cp script.sh /usr/local/bin/myscript
sudo chmod +x /usr/local/bin/myscript
myscript                     # Now can run from anywhere

# Script debugging
bash -x script.sh            # Show each command execution
bash -n script.sh            # Check syntax without running
```

### Script Template with Proper Headers

```bash
#!/bin/bash
#
# Script Name: template.sh
# Description: Template for bash scripts
# Author: Your Name
# Email: your.email@example.com
# Date: $(date +%Y-%m-%d)
# Version: 1.0
#
# Usage: ./template.sh [options] [arguments]
#
# Exit Codes:
#   0 - Success
#   1 - General error
#   2 - Wrong usage
#

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Script variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_NAME="$(basename "$0")"

# Your script logic here
echo "Script starting..."
echo "Script directory: $SCRIPT_DIR"
echo "Script name: $SCRIPT_NAME"

exit 0
```

### 🎯 Exercise 21.1
```bash
# Permission and execution lab
cat << 'EOF' > permission_test.sh
#!/bin/bash
echo "If you can see this, the script has execute permission!"
echo "Script permissions:"
ls -la "$0"
EOF

# Test without execute permission
echo "Trying to run without execute permission:"
./permission_test.sh 2>/dev/null || echo "Failed - no execute permission"

# Add execute permission
chmod +x permission_test.sh
echo "After adding execute permission:"
./permission_test.sh

# Clean up
rm permission_test.sh
```

---

## Chapter 22: Variables and User Input

### 🔑 Key Concept
Variables are like labeled boxes where you store information. User input makes scripts interactive!

### Hands-On Commands

```bash
# Variable basics
NAME="John"                  # Create variable (no spaces around =)
echo $NAME                   # Use variable
echo ${NAME}                 # Alternative syntax
echo "Hello $NAME"           # Variable in string
echo 'Hello $NAME'           # Single quotes preserve literal

# Special variables
echo $0                      # Script name
echo $1 $2 $3               # Command line arguments
echo $#                      # Number of arguments
echo $@                      # All arguments
echo $                      # Process ID
echo $?                      # Exit code of last command

# Environment variables
echo $HOME $USER $PATH      # System variables
export MYVAR="Global"       # Make variable available to child processes

# User input
read -p "Enter your name: " username
echo "Hello, $username!"

# Advanced input
read -s -p "Enter password: " password  # Silent input
echo ""
read -t 10 -p "Quick! Enter something (10 sec): " quick_input
```

### Interactive Script Example

```bash
#!/bin/bash
# interactive_demo.sh - Demonstrates user input

echo "=== Interactive Demo ==="

# Basic input
read -p "What's your name? " name
read -p "What's your age? " age

# Input with validation
while true; do
    read -p "Enter a number (1-10): " number
    if [[ $number -ge 1 && $number -le 10 ]]; then
        break
    else
        echo "Please enter a number between 1 and 10"
    fi
done

# Silent input (like password)
read -s -p "Enter a secret word: " secret
echo ""

# Results
echo ""
echo "=== Summary ==="
echo "Name: $name"
echo "Age: $age"
echo "Lucky number: $number"
echo "Secret word has ${#secret} characters"

# Command line arguments
echo "Script name: $0"
echo "Number of arguments: $#"
echo "Arguments: $@"
```

### Variable Manipulation

```bash
#!/bin/bash
# variable_demo.sh - Variable manipulation examples

TEXT="Hello World Linux"

echo "Original: $TEXT"
echo "Length: ${#TEXT}"
echo "Uppercase: ${TEXT^^}"
echo "Lowercase: ${TEXT,,}"
echo "Substring (0-5): ${TEXT:0:5}"
echo "Replace World with Universe: ${TEXT/World/Universe}"
echo "Remove 'o': ${TEXT//o/}"

# Default values
echo "UNDEFINED variable with default: ${UNDEFINED:-'Default Value'}"
echo "UNDEFINED variable set to default: ${UNDEFINED:='Set Default'}"
echo "Now UNDEFINED contains: $UNDEFINED"

# Array variables
FRUITS=("apple" "banana" "cherry")
echo "First fruit: ${FRUITS[0]}"
echo "All fruits: ${FRUITS[@]}"
echo "Number of fruits: ${#FRUITS[@]}"
```

### 🎯 Exercise 22.1
```bash
# Create a personal profile script
cat << 'EOF' > personal_profile.sh
#!/bin/bash
# personal_profile.sh - Create a personal profile

echo "=== Personal Profile Creator ==="

# Collect information
read -p "First Name: " first_name
read -p "Last Name: " last_name
read -p "Age: " age
read -p "City: " city
read -p "Occupation: " occupation

# Create profile
echo ""
echo "=== Your Profile ==="
echo "Name: $first_name $last_name"
echo "Age: $age years old"
echo "Location: $city"
echo "Occupation: $occupation"
echo "Profile created on: $(date)"

# Save to file
profile_file="${first_name}_${last_name}_profile.txt"
{
    echo "Personal Profile"
    echo "================"
    echo "Name: $first_name $last_name"
    echo "Age: $age"
    echo "City: $city"
    echo "Occupation: $occupation"
    echo "Created: $(date)"
} > "$profile_file"

echo ""
echo "Profile saved to: $profile_file"
EOF

chmod +x personal_profile.sh
# Run it: ./personal_profile.sh
```

---

## Chapter 23: Conditional Statements

### 🔑 Key Concept
Conditionals are like decision trees - if this, then that, else something else!

### Basic If Statements

```bash
#!/bin/bash
# conditionals_demo.sh

# Basic if statement
age=25
if [ $age -ge 18 ]; then
    echo "You are an adult"
fi

# If-else
if [ $age -ge 21 ]; then
    echo "You can drink alcohol in the US"
else
    echo "You cannot drink alcohol in the US"
fi

# If-elif-else
if [ $age -lt 13 ]; then
    echo "You are a child"
elif [ $age -lt 20 ]; then
    echo "You are a teenager"
elif [ $age -lt 60 ]; then
    echo "You are an adult"
else
    echo "You are a senior"
fi
```

### Test Operators Reference

```bash
#!/bin/bash
# test_operators.sh - Comprehensive test examples

num1=10
num2=20
str1="hello"
str2="world"
file="/etc/passwd"

echo "=== Numeric Tests ==="
[ $num1 -eq $num2 ] && echo "Equal" || echo "Not equal"
[ $num1 -ne $num2 ] && echo "Not equal" || echo "Equal"
[ $num1 -lt $num2 ] && echo "$num1 is less than $num2"
[ $num1 -gt $num2 ] && echo "$num1 is greater than $num2" || echo "$num1 is not greater than $num2"
[ $num1 -le $num2 ] && echo "$num1 is less than or equal to $num2"
[ $num1 -ge $num2 ] && echo "$num1 is greater than or equal to $num2" || echo "$num1 is not >= $num2"

echo ""
echo "=== String Tests ==="
[ "$str1" = "$str2" ] && echo "Strings are equal" || echo "Strings are not equal"
[ "$str1" != "$str2" ] && echo "Strings are different"
[ -z "$str1" ] && echo "String is empty" || echo "String is not empty"
[ -n "$str1" ] && echo "String is not empty"

echo ""
echo "=== File Tests ==="
[ -f "$file" ] && echo "$file is a regular file"
[ -d "/tmp" ] && echo "/tmp is a directory"
[ -r "$file" ] && echo "$file is readable"
[ -w "/tmp" ] && echo "/tmp is writable"
[ -x "/bin/ls" ] && echo "/bin/ls is executable"
[ -e "$file" ] && echo "$file exists"
```

### Advanced Conditionals

```bash
#!/bin/bash
# advanced_conditionals.sh

# Double bracket syntax (preferred)
name="John"
if [[ $name == "John" ]]; then
    echo "Hello John!"
fi

# Pattern matching
if [[ $name == J* ]]; then
    echo "Name starts with J"
fi

# Multiple conditions
age=25
income=50000
if [[ $age -ge 21 && $income -gt 30000 ]]; then
    echo "Eligible for premium account"
fi

# Logical operators
if [[ $age -lt 18 || $age -gt 65 ]]; then
    echo "Special discount available"
fi

# Case statement (better for multiple options)
read -p "Enter your grade (A-F): " grade
case $grade in
    A|a)
        echo "Excellent! 90-100%"
        ;;
    B|b)
        echo "Good! 80-89%"
        ;;
    C|c)
        echo "Average! 70-79%"
        ;;
    D|d)
        echo "Below Average! 60-69%"
        ;;
    F|f)
        echo "Failing! Below 60%"
        ;;
    *)
        echo "Invalid grade entered"
        ;;
esac
```

### 🎯 Exercise 23.1
```bash
# Create a system health checker
cat << 'EOF' > health_checker.sh
#!/bin/bash
# health_checker.sh - System health monitoring

echo "=== System Health Checker ==="

# Check disk usage
disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [[ $disk_usage -gt 90 ]]; then
    echo "🔴 CRITICAL: Disk usage is ${disk_usage}%"
elif [[ $disk_usage -gt 75 ]]; then
    echo "🟡 WARNING: Disk usage is ${disk_usage}%"
else
    echo "🟢 OK: Disk usage is ${disk_usage}%"
fi

# Check memory usage
memory_usage=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
if [[ $memory_usage -gt 90 ]]; then
    echo "🔴 CRITICAL: Memory usage is ${memory_usage}%"
elif [[ $memory_usage -gt 75 ]]; then
    echo "🟡 WARNING: Memory usage is ${memory_usage}%"
else
    echo "🟢 OK: Memory usage is ${memory_usage}%"
fi

# Check load average
load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk -F', ' '{print $1}')
if (( $(echo "$load_avg > 2.0" | bc -l) )); then
    echo "🔴 CRITICAL: High load average: $load_avg"
elif (( $(echo "$load_avg > 1.0" | bc -l) )); then
    echo "🟡 WARNING: Moderate load average: $load_avg"
else
    echo "🟢 OK: Load average: $load_avg"
fi

# Check if important services are running
services=("ssh" "systemd-resolved")
for service in "${services[@]}"; do
    if systemctl is-active --quiet "$service"; then
        echo "🟢 OK: $service is running"
    else
        echo "🔴 CRITICAL: $service is not running"
    fi
done

echo "=== Health Check Complete ==="
EOF

chmod +x health_checker.sh
./health_checker.sh
```

---

## Chapter 24: Loops

### 🔑 Key Concept
Loops are like assembly lines - repeat the same action until done!

### For Loops

```bash
#!/bin/bash
# for_loops_demo.sh

echo "=== For Loop Examples ==="

# Basic for loop
echo "Counting 1 to 5:"
for i in 1 2 3 4 5; do
    echo "Number: $i"
done

# Range for loop
echo ""
echo "Counting 1 to 10:"
for i in {1..10}; do
    echo -n "$i "
done
echo ""

# Step for loop
echo ""
echo "Even numbers 2 to 20:"
for i in {2..20..2}; do
    echo -n "$i "
done
echo ""

# C-style for loop
echo ""
echo "C-style loop:"
for ((i=1; i<=5; i++)); do
    echo "Iteration $i"
done

# Loop over files
echo ""
echo "Files in current directory:"
for file in *; do
    if [ -f "$file" ]; then
        echo "File: $file"
    fi
done

# Loop over array
echo ""
echo "Loop over array:"
fruits=("apple" "banana" "cherry" "date")
for fruit in "${fruits[@]}"; do
    echo "Fruit: $fruit"
done
```

### While Loops

```bash
#!/bin/bash
# while_loops_demo.sh

echo "=== While Loop Examples ==="

# Basic while loop
counter=1
echo "Counting with while loop:"
while [ $counter -le 5 ]; do
    echo "Count: $counter"
    ((counter++))
done

# Reading file line by line
echo ""
echo "Reading /etc/passwd (first 5 lines):"
counter=0
while IFS= read -r line; do
    echo "Line $((++counter)): $line"
    if [ $counter -eq 5 ]; then
        break
    fi
done < /etc/passwd

# Infinite loop with break
echo ""
echo "Guessing game:"
secret_number=7
while true; do
    read -p "Guess a number (1-10): " guess
    if [ "$guess" -eq "$secret_number" ]; then
        echo "Correct! The number was $secret_number"
        break
    elif [ "$guess" -lt "$secret_number" ]; then
        echo "Too low!"
    else
        echo "Too high!"
    fi
done
```

### Until Loops

```bash
#!/bin/bash
# until_loops_demo.sh

echo "=== Until Loop Examples ==="

# Basic until loop (opposite of while)
counter=1
echo "Counting with until loop:"
until [ $counter -gt 5 ]; do
    echo "Count: $counter"
    ((counter++))
done

# Wait for file to appear
echo ""
echo "Waiting for file to appear..."
until [ -f "/tmp/test_file" ]; do
    echo "File not found, waiting..."
    sleep 1
    # Create the file after 3 seconds for demo
    if [ ! -f "/tmp/test_file" ]; then
        touch /tmp/test_file
    fi
done
echo "File found!"
rm /tmp/test_file
```

### Loop Control

```bash
#!/bin/bash
# loop_control_demo.sh

echo "=== Loop Control Examples ==="

# Break and continue
echo "Numbers 1-10, skipping 5:"
for i in {1..10}; do
    if [ $i -eq 5 ]; then
        echo "Skipping $i"
        continue
    fi
    if [ $i -eq 8 ]; then
        echo "Breaking at $i"
        break
    fi
    echo "Number: $i"
done

# Nested loops
echo ""
echo "Multiplication table (3x3):"
for i in {1..3}; do
    for j in {1..3}; do
        result=$((i * j))
        echo -n "$i x $j = $result  "
    done
    echo ""
done
```

### 🎯 Exercise 24.1
```bash
# Create a backup script using loops
cat << 'EOF' > backup_script.sh
#!/bin/bash
# backup_script.sh - Automated backup with loops

echo "=== Automated Backup Script ==="

# Directories to backup
backup_dirs=("/home/$USER/Documents" "/home/$USER/Pictures" "/home/$USER/Scripts")
backup_base="/tmp/backups"
timestamp=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p "$backup_base"

# Loop through directories
for dir in "${backup_dirs[@]}"; do
    if [ -d "$dir" ]; then
        dir_name=$(basename "$dir")
        backup_file="${backup_base}/${dir_name}_${timestamp}.tar.gz"
        
        echo "Backing up $dir..."
        tar -czf "$backup_file" -C "$(dirname "$dir")" "$(basename "$dir")" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo "✅ Successfully backed up $dir to $backup_file"
        else
            echo "❌ Failed to backup $dir"
        fi
    else
        echo "⚠️  Directory $dir does not exist, skipping..."
    fi
done

# Show backup summary
echo ""
echo "=== Backup Summary ==="
backup_count=$(ls -1 "$backup_base"/*_${timestamp}.tar.gz 2>/dev/null | wc -l)
echo "Total backups created: $backup_count"
echo "Backup location: $backup_base"
echo "Backup files:"
ls -lh "$backup_base"/*_${timestamp}.tar.gz 2>/dev/null || echo "No backup files found"

echo ""
echo "=== Backup Complete ==="
EOF

chmod +x backup_script.sh
# Create some test directories first
mkdir -p ~/Documents ~/Pictures ~/Scripts
echo "test doc" > ~/Documents/test.txt
echo "test script" > ~/Scripts/test.sh
./backup_script.sh
```

---

## Chapter 25: Functions in Shell Scripts

### 🔑 Key Concept
Functions are like mini-programs within your script - write once, use many times!

### Basic Functions

```bash
#!/bin/bash
# functions_demo.sh

# Simple function
greet() {
    echo "Hello, World!"
}

# Function with parameters
greet_user() {
    local name=$1
    local age=$2
    echo "Hello, $name! You are $age years old."
}

# Function with return value
add_numbers() {
    local num1=$1
    local num2=$2
    local result=$((num1 + num2))
    echo $result
}

# Function with local variables
calculate_circle_area() {
    local radius=$1
    local pi=3.14159
    local area=$(echo "$pi * $radius * $radius" | bc -l)
    printf "Area of circle with radius %.2f is %.2f\n" "$radius" "$area"
}

# Usage examples
echo "=== Function Examples ==="
greet
greet_user "John" 25
result=$(add_numbers 10 20)
echo "10 + 20 = $result"
calculate_circle_area 5
```

### Advanced Functions

```bash
#!/bin/bash
# advanced_functions.sh

# Function with error handling
safe_division() {
    local numerator=$1
    local denominator=$2
    
    if [ "$denominator" -eq 0 ]; then
        echo "Error: Division by zero!" >&2
        return 1
    fi
    
    local result=$(echo "scale=2; $numerator / $denominator" | bc -l)
    echo $result
    return 0
}

# Function that modifies global variables
counter=0
increment_counter() {
    ((counter++))
    echo "Counter is now: $counter"
}

# Function with multiple return values (using arrays)
get_system_info() {
    local -n result_array=$1
    result_array[0]=$(hostname)
    result_array[1]=$(uptime -p)
    result_array[2]=$(df -h / | tail -1 | awk '{print $5}')
}

# Function with validation
validate_email() {
    local email=$1
    local regex="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    
    if [[ $email =~ $regex ]]; then
        echo "Valid email: $email"
        return 0
    else
        echo "Invalid email: $email"
        return 1
    fi
}

# Usage examples
echo "=== Advanced Function Examples ==="

# Test safe division
result=$(safe_division 10 3)
echo "10 / 3 = $result"

safe_division 10 0
if [ $? -ne 0 ]; then
    echo "Division failed as expected"
fi

# Test counter
increment_counter
increment_counter

# Test system info
declare -a sys_info
get_system_info sys_info
echo "Hostname: ${sys_info[0]}"
echo "Uptime: ${sys_info[1]}"
echo "Disk usage: ${sys_info[2]}"

# Test email validation
validate_email "user@example.com"
validate_email "invalid.email"
```

### Utility Functions Library

```bash
#!/bin/bash
# utility_functions.sh - Reusable utility functions

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" >&2
}

# File operations
backup_file() {
    local file=$1
    if [ -f "$file" ]; then
        local backup_name="${file}.backup.$(date +%Y%m%d_%H%M%S)"
        cp "$file" "$backup_name"
        log_success "Backed up $file to $backup_name"
    else
        log_error "File $file not found"
        return 1
    fi
}

# System checks
check_disk_space() {
    local threshold=${1:-80}
    local usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [ "$usage" -gt "$threshold" ]; then
        log_warning "Disk usage is ${usage}% (threshold: ${threshold}%)"
        return 1
    else
        log_info "Disk usage is ${usage}% (OK)"
        return 0
    fi
}

check_service() {
    local service=$1
    if systemctl is-active --quiet "$service"; then
        log_success "Service $service is running"
        return 0
    else
        log_error "Service $service is not running"
        return 1
    fi
}

# Network functions
check_connectivity() {
    local host=${1:-8.8.8.8}
    if ping -c 1 "$host" >/dev/null 2>&1; then
        log_success "Network connectivity to $host is OK"
        return 0
    else
        log_error "No network connectivity to $host"
        return 1
    fi
}

# Usage examples
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    echo "=== Utility Functions Demo ==="
    log_info "Starting utility functions demo"
    check_disk_space 80
    check_service "ssh"
    check_connectivity "google.com"
    log_success "Demo completed"
fi
```

### 🎯 Exercise 25.1
```bash
# Create a system administration toolkit
cat << 'EOF' > sysadmin_toolkit.sh
#!/bin/bash
# sysadmin_toolkit.sh - System administration toolkit with functions

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Menu function
show_menu() {
    clear
    echo -e "${BLUE}=== System Administration Toolkit ===${NC}"
    echo "1. System Information"
    echo "2. Disk Usage Report"
    echo "3. Memory Usage Report" 
    echo "4. Network Status"
    echo "5. Service Status Check"
    echo "6. Log File Analysis"
    echo "7. User Management Info"
    echo "8. Exit"
    echo ""
    read -p "Choose an option (1-8): " choice
}

# System information
system_info() {
    echo -e "${GREEN}=== System Information ===${NC}"
    echo "Hostname: $(hostname)"
    echo "OS: $(lsb_release -d 2>/dev/null | cut -f2 || echo "Unknown")"
    echo "Kernel: $(uname -r)"
    echo "Architecture: $(uname -m)"
    
---
```

## Chapter 26: Script Arguments and Return Values

### 🔑 Key Concept
Arguments are like ingredients you pass to a recipe. Return values tell you if the recipe worked!

### Handling Command Line Arguments

```bash
#!/bin/bash
# arguments_demo.sh - Demonstrating command line arguments

echo "=== Command Line Arguments Demo ==="
echo "Script name: $0"
echo "Number of arguments: $#"
echo "All arguments: $@"
echo "All arguments (quoted): $*"

# Individual arguments
echo "First argument: $1"
echo "Second argument: $2"
echo "Third argument: $3"

# Process ID and exit status
echo "Process ID: $"
echo "Exit status of last command: $?"

# Check if arguments provided
if [ $# -eq 0 ]; then
    echo "No arguments provided!"
    echo "Usage: $0 <arg1> <arg2> [arg3]"
    exit 1
fi

# Validate argument count
if [ $# -lt 2 ]; then
    echo "Error: At least 2 arguments required"
    exit 1
fi

echo "Processing arguments..."
for arg in "$@"; do
    echo "Processing: $arg"
done
```

### Advanced Argument Processing

```bash
#!/bin/bash
# advanced_args.sh - Advanced argument processing

# Default values
VERBOSE=false
OUTPUT_FILE=""
INPUT_FILE=""

# Function to show usage
usage() {
    echo "Usage: $0 -i <input_file> [-o <output_file>] [-v] [-h]"
    echo "Options:"
    echo "  -i <file>    Input file (required)"
    echo "  -o <file>    Output file (optional)"
    echo "  -v           Verbose mode"
    echo "  -h           Show this help"
    exit 1
}

# Process command line options
while getopts "i:o:vh" opt; do
    case $opt in
        i)
            INPUT_FILE="$OPTARG"
            ;;
        o)
            OUTPUT_FILE="$OPTARG"
            ;;
        v)
            VERBOSE=true
            ;;
        h)
            usage
            ;;
        \?)
            echo "Invalid option: -$OPTARG" >&2
            usage
            ;;
        :)
            echo "Option -$OPTARG requires an argument." >&2
            usage
            ;;
    esac
done

# Shift processed options
shift $((OPTIND-1))

# Validate required arguments
if [ -z "$INPUT_FILE" ]; then
    echo "Error: Input file is required"
    usage
fi

if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Input file '$INPUT_FILE' not found"
    exit 1
fi

# Set default output file if not provided
if [ -z "$OUTPUT_FILE" ]; then
    OUTPUT_FILE="${INPUT_FILE}.processed"
fi

# Verbose output
if [ "$VERBOSE" = true ]; then
    echo "Verbose mode enabled"
    echo "Input file: $INPUT_FILE"
    echo "Output file: $OUTPUT_FILE"
fi

# Process the file
echo "Processing $INPUT_FILE..."
cp "$INPUT_FILE" "$OUTPUT_FILE"
echo "Done! Output saved to $OUTPUT_FILE"
```

### Return Values and Exit Codes

```bash
#!/bin/bash
# return_values.sh - Working with return values

# Function that returns success/failure
check_file_exists() {
    local file=$1
    if [ -f "$file" ]; then
        echo "File $file exists"
        return 0  # Success
    else
        echo "File $file does not exist" >&2
        return 1  # Failure
    fi
}

# Function that returns a value via echo
get_file_size() {
    local file=$1
    if [ -f "$file" ]; then
        local size=$(stat -c%s "$file")
        echo $size
        return 0
    else
        return 1
    fi
}

# Function with multiple return codes
validate_number() {
    local num=$1
    if [[ ! $num =~ ^[0-9]+$ ]]; then
        return 2  # Not a number
    elif [ $num -lt 0 ]; then
        return 3  # Negative number
    elif [ $num -eq 0 ]; then
        return 4  # Zero
    else
        return 0  # Valid positive number
    fi
}

# Usage examples
echo "=== Return Values Demo ==="

# Test file existence
check_file_exists "/etc/passwd"
echo "Return code: $?"

check_file_exists "/nonexistent/file"
echo "Return code: $?"

# Capture return value
if check_file_exists "/etc/hosts"; then
    echo "File check succeeded"
else
    echo "File check failed"
fi

# Get value from function
if file_size=$(get_file_size "/etc/passwd"); then
    echo "File size: $file_size bytes"
else
    echo "Could not get file size"
fi

# Multiple return codes
validate_number "abc"
case $? in
    0) echo "Valid positive number" ;;
    2) echo "Not a number" ;;
    3) echo "Negative number" ;;
    4) echo "Zero" ;;
esac
```

### 🎯 Exercise 26.1
```bash
# Create a file processor with proper argument handling
cat << 'EOF' > file_processor.sh
#!/bin/bash
# file_processor.sh - File processing tool with argument handling

# Default values
OPERATION=""
INPUT_FILE=""
OUTPUT_FILE=""
VERBOSE=false

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging function
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        INFO)
            echo -e "[${GREEN}INFO${NC}] $timestamp - $message"
            ;;
        WARN)
            echo -e "[${YELLOW}WARN${NC}] $timestamp - $message"
            ;;
        ERROR)
            echo -e "[${RED}ERROR${NC}] $timestamp - $message" >&2
            ;;
    esac
}

# Usage function
usage() {
    echo "File Processor Tool"
    echo "Usage: $0 -o <operation> -i <input_file> [-f <output_file>] [-v] [-h]"
    echo ""
    echo "Operations:"
    echo "  count     - Count lines, words, and characters"
    echo "  upper     - Convert to uppercase"
    echo "  lower     - Convert to lowercase"
    echo "  backup    - Create backup copy"
    echo ""
    echo "Options:"
    echo "  -o <op>      Operation to perform (required)"
    echo "  -i <file>    Input file (required)"
    echo "  -f <file>    Output file (optional)"
    echo "  -v           Verbose mode"
    echo "  -h           Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 -o count -i myfile.txt"
    echo "  $0 -o upper -i input.txt -f output.txt -v"
    exit 1
}

# Count operation
count_file() {
    local file=$1
    local lines=$(wc -l < "$file")
    local words=$(wc -w < "$file")
    local chars=$(wc -c < "$file")
    
    echo "File Statistics for: $file"
    echo "Lines: $lines"
    echo "Words: $words"
    echo "Characters: $chars"
    return 0
}

# Uppercase operation
upper_case() {
    local input=$1
    local output=$2
    
    tr '[:lower:]' '[:upper:]' < "$input" > "$output"
    return $?
}

# Lowercase operation
lower_case() {
    local input=$1
    local output=$2
    
    tr '[:upper:]' '[:lower:]' < "$input" > "$output"
    return $?
}

# Backup operation
backup_file() {
    local input=$1
    local output=$2
    
    cp "$input" "$output"
    return $?
}

# Process command line arguments
while getopts "o:i:f:vh" opt; do
    case $opt in
        o) OPERATION="$OPTARG" ;;
        i) INPUT_FILE="$OPTARG" ;;
        f) OUTPUT_FILE="$OPTARG" ;;
        v) VERBOSE=true ;;
        h) usage ;;
        \?) 
            log ERROR "Invalid option: -$OPTARG"
            usage 
            ;;
        :) 
            log ERROR "Option -$OPTARG requires an argument"
            usage 
            ;;
    esac
done

# Validate required arguments
if [ -z "$OPERATION" ]; then
    log ERROR "Operation is required"
    usage
fi

if [ -z "$INPUT_FILE" ]; then
    log ERROR "Input file is required"
    usage
fi

if [ ! -f "$INPUT_FILE" ]; then
    log ERROR "Input file '$INPUT_FILE' not found"
    exit 1
fi

# Set default output file for operations that need it
if [ -z "$OUTPUT_FILE" ] && [ "$OPERATION" != "count" ]; then
    OUTPUT_FILE="${INPUT_FILE}.${OPERATION}"
fi

# Verbose output
if [ "$VERBOSE" = true ]; then
    log INFO "Verbose mode enabled"
    log INFO "Operation: $OPERATION"
    log INFO "Input file: $INPUT_FILE"
    [ -n "$OUTPUT_FILE" ] && log INFO "Output file: $OUTPUT_FILE"
fi

# Perform operation
case $OPERATION in
    count)
        log INFO "Counting file statistics"
        if count_file "$INPUT_FILE"; then
            log INFO "Count operation completed successfully"
        else
            log ERROR "Count operation failed"
            exit 1
        fi
        ;;
    upper)
        log INFO "Converting to uppercase"
        if upper_case "$INPUT_FILE" "$OUTPUT_FILE"; then
            log INFO "Uppercase conversion completed: $OUTPUT_FILE"
        else
            log ERROR "Uppercase conversion failed"
            exit 1
        fi
        ;;
    lower)
        log INFO "Converting to lowercase"
        if lower_case "$INPUT_FILE" "$OUTPUT_FILE"; then
            log INFO "Lowercase conversion completed: $OUTPUT_FILE"
        else
            log ERROR "Lowercase conversion failed"
            exit 1
        fi
        ;;
    backup)
        log INFO "Creating backup"
        if backup_file "$INPUT_FILE" "$OUTPUT_FILE"; then
            log INFO "Backup created: $OUTPUT_FILE"
        else
            log ERROR "Backup operation failed"
            exit 1
        fi
        ;;
    *)
        log ERROR "Unknown operation: $OPERATION"
        usage
        ;;
esac

log INFO "File processing completed successfully"
exit 0
EOF

chmod +x file_processor.sh

# Create test file
echo -e "Hello World\nThis is a test file\nWith Multiple Lines" > test.txt

echo "File processor created! Try these commands:"
echo "./file_processor.sh -o count -i test.txt"
echo "./file_processor.sh -o upper -i test.txt -f upper.txt -v"
echo "./file_processor.sh -h"
```

---

## Chapter 27: Reading Files in Scripts

### 🔑 Key Concept
Reading files is like opening a book page by page - you can read line by line, all at once, or specific parts!

### Basic File Reading

```bash
#!/bin/bash
# file_reading_demo.sh

# Create test file
cat << 'EOF' > sample_data.txt
John,25,Engineer
Mary,30,Doctor  
Bob,28,Teacher
Alice,35,Manager
Charlie,22,Student
EOF

echo "=== File Reading Examples ==="

# Method 1: Read entire file
echo "Method 1: Read entire file"
content=$(cat sample_data.txt)
echo "$content"
echo ""

# Method 2: Read line by line with while loop
echo "Method 2: Read line by line"
while IFS= read -r line; do
    echo "Processing line: $line"
done < sample_data.txt
echo ""

# Method 3: Read with field separator
echo "Method 3: Read with field separator (CSV)"
while IFS=',' read -r name age job; do
    echo "Name: $name, Age: $age, Job: $job"
done < sample_data.txt
echo ""

# Method 4: Read into array
echo "Method 4: Read into array"
readarray -t lines < sample_data.txt
for i in "${!lines[@]}"; do
    echo "Line $((i+1)): ${lines[i]}"
done
echo ""

# Method 5: Skip first line (header)
echo "Method 5: Skip header line"
{
    read  # Skip first line
    while IFS=',' read -r name age job; do
        echo "Employee: $name ($age years old) - $job"
    done
} < sample_data.txt

# Clean up
rm sample_data.txt
```

### Advanced File Processing

```bash
#!/bin/bash
# advanced_file_processing.sh

# Create test log file
cat << 'EOF' > system.log
2024-01-15 08:30:15 INFO System started
2024-01-15 08:31:22 ERROR Database connection failed
2024-01-15 08:32:10 INFO Database connection restored
2024-01-15 08:35:45 WARNING High memory usage detected
2024-01-15 08:40:12 INFO Backup completed successfully
2024-01-15 08:45:33 ERROR Disk space low
2024-01-15 08:50:18 INFO Maintenance job started
EOF

echo "=== Advanced File Processing ==="

# Process log file
log_file="system.log"
error_count=0
warning_count=0
info_count=0

echo "Processing log file: $log_file"
echo ""

while read -r date time level message; do
    case $level in
        INFO)
            ((info_count++))
            echo "ℹ️  $time: $message"
            ;;
        WARNING)
            ((warning_count++))
            echo "⚠️  $time: $message"
            ;;
        ERROR)
            ((error_count++))
            echo "❌ $time: $message"
            ;;
    esac
done < "$log_file"

echo ""
echo "=== Log Summary ==="
echo "Total INFO messages: $info_count"
echo "Total WARNING messages: $warning_count"
echo "Total ERROR messages: $error_count"
echo "Total messages: $((info_count + warning_count + error_count))"

# Extract specific information
echo ""
echo "=== Error Analysis ==="
grep "ERROR" "$log_file" | while read -r line; do
    echo "Error found: $line"
done

# Clean up
rm system.log
```

### Configuration File Parser

```bash
#!/bin/bash
# config_parser.sh - Parse configuration files

# Create sample config file
cat << 'EOF' > app.conf
# Application Configuration File
# Lines starting with # are comments

# Database settings
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp
DB_USER=admin

# Server settings  
SERVER_PORT=8080
SERVER_HOST=0.0.0.0
DEBUG_MODE=true

# Cache settings
CACHE_ENABLED=true
CACHE_TTL=3600
CACHE_SIZE=100MB

# Empty lines and comments should be ignored
EOF

echo "=== Configuration File Parser ==="

declare -A config
config_file="app.conf"

# Parse configuration file
while IFS= read -r line; do
    # Skip empty lines and comments
    if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
        continue
    fi
    
    # Parse key=value pairs
    if [[ "$line" =~ ^[[:space:]]*([^=]+)[[:space:]]*=[[:space:]]*(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"
        
        # Remove leading/trailing whitespace
        key=$(echo "$key" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
        value=$(echo "$value" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
        
        config["$key"]="$value"
        echo "Loaded config: $key = $value"
    fi
done < "$config_file"

echo ""
echo "=== Configuration Summary ==="
echo "Database: ${config[DB_HOST]}:${config[DB_PORT]}/${config[DB_NAME]}"
echo "Server: ${config[SERVER_HOST]}:${config[SERVER_PORT]}"
echo "Debug Mode: ${config[DEBUG_MODE]}"
echo "Cache: ${config[CACHE_ENABLED]} (TTL: ${config[CACHE_TTL]}s, Size: ${config[CACHE_SIZE]})"

# Function to get config value
get_config() {
    local key=$1
    local default=$2
    echo "${config[$key]:-$default}"
}

echo ""
echo "=== Using Configuration ==="
echo "Database host: $(get_config "DB_HOST" "default_host")"
echo "Unknown setting: $(get_config "UNKNOWN_KEY" "default_value")"

# Clean up
rm app.conf
```

### CSV File Processor

```bash
#!/bin/bash
# csv_processor.sh - Process CSV files

# Create sample CSV file
cat << 'EOF' > employees.csv
Name,Age,Department,Salary
John Smith,25,Engineering,75000
Mary Johnson,30,Marketing,65000
Bob Wilson,28,Engineering,80000
Alice Brown,35,Management,95000
Charlie Davis,22,Sales,45000
Diana Miller,29,Engineering,78000
Eve Garcia,31,Marketing,70000
EOF

echo "=== CSV File Processor ==="

csv_file="employees.csv"
total_salary=0
employee_count=0
declare -A dept_count
declare -A dept_salary

# Read header
IFS=',' read -r header < "$csv_file"
echo "CSV Header: $header"
echo ""

# Process data rows
{
    read  # Skip header
    while IFS=',' read -r name age department salary; do
        ((employee_count++))
        total_salary=$((total_salary + salary))
        
        # Department statistics
        if [[ -n "${dept_count[$department]}" ]]; then
            dept_count[$department]=$((dept_count[$department] + 1))
            dept_salary[$department]=$((dept_salary[$department] + salary))
        else
            dept_count[$department]=1
            dept_salary[$department]=$salary
        fi
        
        echo "Employee $employee_count: $name ($age) - $department - \${salary}"
    done
} < "$csv_file"

echo ""
echo "=== Statistics ==="
echo "Total employees: $employee_count"
echo "Total salary budget: \${total_salary}"
echo "Average salary: \$(( total_salary / employee_count ))"

echo ""
echo "=== Department Summary ==="
for dept in "${!dept_count[@]}"; do
    count=${dept_count[$dept]}
    salary=${dept_salary[$dept]}
    avg_salary=$((salary / count))
    echo "$dept: $count employees, Total: \${salary}, Average: \${avg_salary}"
done

# Find highest paid employee
echo ""
echo "=== Highest Paid Employee ==="
max_salary=0
top_employee=""

{
    read  # Skip header
    while IFS=',' read -r name age department salary; do
        if [ "$salary" -gt "$max_salary" ]; then
            max_salary=$salary
            top_employee="$name ($department)"
        fi
    done
} < "$csv_file"

echo "Highest paid: $top_employee - \${max_salary}"

# Clean up
rm employees.csv
```

### 🎯 Exercise 27.1
```bash
# Create a log analyzer script
cat << 'EOF' > log_analyzer.sh
#!/bin/bash
# log_analyzer.sh - Comprehensive log file analyzer

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Create sample log file for testing
create_sample_log() {
    cat << 'LOGEOF' > sample_access.log
192.168.1.100 - - [15/Jan/2024:08:30:15 +0000] "GET /index.html HTTP/1.1" 200 1234
192.168.1.101 - - [15/Jan/2024:08:31:22 +0000] "POST /login HTTP/1.1" 401 567
192.168.1.102 - - [15/Jan/2024:08:32:10 +0000] "GET /dashboard HTTP/1.1" 200 2345
192.168.1.100 - - [15/Jan/2024:08:35:45 +0000] "GET /api/users HTTP/1.1" 500 789
192.168.1.103 - - [15/Jan/2024:08:40:12 +0000] "GET /index.html HTTP/1.1" 200 1234
192.168.1.101 - - [15/Jan/2024:08:45:33 +0000] "POST /login HTTP/1.1" 200 890
192.168.1.104 - - [15/Jan/2024:08:50:18 +0000] "GET /admin HTTP/1.1" 403 456
192.168.1.102 - - [15/Jan/2024:08:55:21 +0000] "GET /profile HTTP/1.1" 200 1567
192.168.1.105 - - [15/Jan/2024:09:00:33 +0000] "DELETE /api/data HTTP/1.1" 404 234
192.168.1.100 - - [15/Jan/2024:09:05:45 +0000] "GET /logout HTTP/1.1" 200 345
LOGEOF
    echo "Sample log file created: sample_access.log"
}

# Initialize counters
declare -A ip_count
declare -A status_count
declare -A method_count
declare -A hour_count
total_requests=0
total_bytes=0

# Analyze log file
analyze_log() {
    local log_file=$1
    
    if [ ! -f "$log_file" ]; then
        echo -e "${RED}Error: Log file '$log_file' not found${NC}"
        return 1
    fi
    
    echo -e "${BLUE}=== Analyzing Log File: $log_file ===${NC}"
    echo ""
    
    while read -r line; do
        # Skip empty lines
        if [ -z "$line" ]; then
            continue
        fi
        
        ((total_requests++))
        
        # Extract fields using regex
        if [[ $line =~ ^([0-9.]+).*\[([^]]+)\].*\"([A-Z]+)[[:space:]]+([^[:space:]]+)[[:space:]]+[^\"]*\"[[:space:]]+([0-9]+)[[:space:]]+([0-9]+) ]]; then
            ip="${BASH_REMATCH[1]}"
            timestamp="${BASH_REMATCH[2]}"
            method="${BASH_REMATCH[3]}"
            url="${BASH_REMATCH[4]}"
            status="${BASH_REMATCH[5]}"
            bytes="${BASH_REMATCH[6]}"
            
            # Extract hour from timestamp
            hour=$(echo "$timestamp" | cut -d':' -f2)
            
            # Count statistics
            ((ip_count[$ip]++))
            ((status_count[$status]++))
            ((method_count[$method]++))
            ((hour_count[$hour]++))
            total_bytes=$((total_bytes + bytes))
        fi
    done < "$log_file"
    
    # Display results
    display_results
}

# Display analysis results
display_results() {
    echo -e "${GREEN}=== Log Analysis Results ===${NC}"
    echo "Total requests: $total_requests"
    echo "Total bytes transferred: $total_bytes"
    echo "Average bytes per request: $((total_bytes / total_requests))"
    echo ""
    
    echo -e "${YELLOW}=== Top 5 IP Addresses ===${NC}"
    for ip in "${!ip_count[@]}"; do
        echo "$ip ${ip_count[$ip]}"
    done | sort -k2 -nr | head -5
    echo ""
    
    echo -e "${YELLOW}=== HTTP Status Codes ===${NC}"
    for status in "${!status_count[@]}"; do
        case $status in
            2*) status_type="SUCCESS" ;;
            3*) status_type="REDIRECT" ;;
            4*) status_type="CLIENT ERROR" ;;
            5*) status_type="SERVER ERROR" ;;
            *) status_type="OTHER" ;;
        esac
        echo "$status ($status_type): ${status_count[$status]}"
    done | sort
    echo ""
    
    echo -e "${YELLOW}=== HTTP Methods ===${NC}"
    for method in "${!method_count[@]}"; do
        echo "$method: ${method_count[$method]}"
    done | sort -k2 -nr
    echo ""
    
    echo -e "${YELLOW}=== Traffic by Hour ===${NC}"
    for hour in $(echo "${!hour_count[@]}" | tr ' ' '\n' | sort -n); do
        echo "${hour}:00 - ${hour_count[$hour]} requests"
    done
    echo ""
    
    # Security analysis
    security_analysis
}

# Security analysis
security_analysis() {
    echo -e "${RED}=== Security Analysis ===${NC}"
    
    # Find 4xx and 5xx errors
    error_4xx=0
    error_5xx=0
    
    for status in "${!status_count[@]}"; do
        if [[ $status =~ ^4 ]]; then
            error_4xx=$((error_4xx + status_count[$status]))
        elif [[ $status =~ ^5 ]]; then
            error_5xx=$((error_5xx + status_count[$status]))
        fi
    done
    
    echo "4xx Client Errors: $error_4xx"
    echo "5xx Server Errors: $error_5xx"
    
    # Calculate error percentage
    total_errors=$((error_4xx + error_5xx))
    if [# Linux Mastery: From Zero to Hero - 100% Hands-On Training

## 🚀 Welcome to Linux Magic!

**Remember this forever: Linux is like a house with many rooms. Each command is a key that opens specific doors. Master the keys, master the house!**

---

## 📋 Table of Contents
1. [Linux OS & Administration](#linux-os--administration)
2. [Linux Shell Scripting](#linux-shell-scripting)
3. [Real-World Projects](#real-world-projects)

---

# Linux OS & Administration

## Chapter 1: Understanding Linux Distributions

### 🔑 Key Concept
Think of Linux distributions like different car brands - they all have engines (Linux kernel) but different features and interfaces.

### Hands-On Commands

```bash
# Check your Linux distribution
cat /etc/os-release
lsb_release -a
hostnamectl

# Check kernel version
uname -r
uname -a

# Check system architecture
arch
uname -m
```

### 🎯 Exercise 1.1
```bash
# Create a system info script
echo "=== My Linux System Info ===" > system_info.txt
echo "Distribution: $(lsb_release -d | cut -f2)" >> system_info.txt
echo "Kernel: $(uname -r)" >> system_info.txt
echo "Architecture: $(uname -m)" >> system_info.txt
cat system_info.txt
```

---

## Chapter 2: Linux Boot Process & System Architecture

### 🔑 Key Concept
Linux boot is like waking up a person: BIOS → Bootloader → Kernel → Init → Services

### Hands-On Commands

```bash
# Check boot messages
dmesg | head -20
dmesg | grep -i error

# Check system uptime
uptime
who -b

# Check running services
systemctl list-units --type=service --state=running
systemctl status

# Check boot time
systemd-analyze
systemd-analyze blame
```

### 🎯 Exercise 2.1
```bash
# Create boot analysis report
echo "=== Boot Analysis Report ===" > boot_report.txt
echo "Boot Time: $(systemd-analyze | head -1)" >> boot_report.txt
echo "Slowest Services:" >> boot_report.txt
systemd-analyze blame | head -5 >> boot_report.txt
cat boot_report.txt
```

---

## Chapter 3: Installing Linux & Virtualization

### 🔑 Key Concept
VirtualBox is like having a computer inside your computer - perfect for learning!

### Hands-On Commands

```bash
# Check if running in virtual environment
sudo dmidecode -s system-manufacturer
lscpu | grep Virtualization

# Install VirtualBox Guest Additions (if in VirtualBox)
sudo apt update && sudo apt install virtualbox-guest-additions-iso

# Check available disk space for installation
df -h
lsblk
```

### 🎯 Exercise 3.1
```bash
# System readiness check
echo "=== Installation Readiness Check ===" > readiness.txt
echo "Available Space: $(df -h / | tail -1 | awk '{print $4}')" >> readiness.txt
echo "Memory: $(free -h | grep Mem | awk '{print $2}')" >> readiness.txt
echo "CPU Cores: $(nproc)" >> readiness.txt
cat readiness.txt
```

---

## Chapter 4: Terminal Mastery & SSH

### 🔑 Key Concept
Terminal is your magic wand. SSH is teleportation to other computers!

### Hands-On Commands

```bash
# Terminal shortcuts (memorize these!)
# Ctrl+C = Stop current command
# Ctrl+Z = Suspend current command
# Ctrl+L = Clear screen
# Ctrl+R = Search command history
# Tab = Auto-complete
# Up/Down arrows = Command history

# Check current terminal
tty
echo $TERM

# Terminal customization
PS1="[\u@\h \W]\$ "  # Change prompt
alias ll='ls -la'    # Create alias
alias ..='cd ..'

# SSH basics
ssh username@hostname
ssh -p 2222 username@hostname  # Different port
ssh-keygen -t rsa              # Generate SSH key
ssh-copy-id username@hostname  # Copy public key
```

### 🎯 Exercise 4.1
```bash
# Create your custom terminal setup
echo "# My Custom Terminal Setup" >> ~/.bashrc
echo "alias ll='ls -la --color=auto'" >> ~/.bashrc
echo "alias grep='grep --color=auto'" >> ~/.bashrc
echo "alias la='ls -A'" >> ~/.bashrc
echo "export PS1='\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '" >> ~/.bashrc
source ~/.bashrc
```

---

## Chapter 5: File System Navigation

### 🔑 Key Concept
Linux file system is like a tree: / is the root, branches are directories. Everything is a file!

### Hands-On Commands

```bash
# Essential navigation
pwd                    # Where am I?
ls                     # What's here?
ls -la                 # Show all details
ls -lh                 # Human readable sizes
cd /                   # Go to root
cd ~                   # Go to home
cd -                   # Go to previous directory
cd ..                  # Go up one level
cd ../..               # Go up two levels

# File system exploration
tree /                 # View directory tree
tree -L 2 /           # Limit depth
find / -name "*.conf" 2>/dev/null | head -10

# Important directories
ls -la /bin           # Essential commands
ls -la /etc           # Configuration files
ls -la /var/log       # Log files
ls -la /home          # User home directories
ls -la /tmp           # Temporary files
```

### 🎯 Exercise 5.1
```bash
# File system explorer script
#!/bin/bash
echo "=== File System Explorer ==="
echo "Current location: $(pwd)"
echo "Home directory: $HOME"
echo "Files in current directory:"
ls -la
echo ""
echo "Disk usage of current directory:"
du -sh .
echo ""
echo "File system information:"
df -h .
```

---

## Chapter 6: User and Group Management

### 🔑 Key Concept
Users are like people in a building, groups are like departments. Everyone has an ID card (UID/GID)!

### Hands-On Commands

```bash
# User information
whoami                 # Who am I?
id                     # My user details
id username           # Someone else's details
w                     # Who's online?
last                  # Login history

# User management (requires sudo)
sudo adduser newuser           # Add user (interactive)
sudo useradd -m -s /bin/bash testuser  # Add user (manual)
sudo passwd testuser           # Set password
sudo userdel -r olduser       # Delete user and home
sudo usermod -G group1,group2 username  # Add to groups

# Group management
groups                # My groups
getent group         # All groups
sudo groupadd developers     # Create group
sudo groupdel oldgroup      # Delete group
sudo usermod -a -G sudo username  # Add user to sudo group

# Switch users
su - username        # Switch user
sudo su -            # Become root
```

### 🎯 Exercise 6.1
```bash
# User management practice
echo "=== User Management Exercise ==="
echo "Current user: $(whoami)"
echo "User ID: $(id -u)"
echo "Groups: $(groups)"
echo ""

# Create a test user (comment out if not sudo user)
# sudo adduser testdummy --disabled-password --gecos ""
# echo "Created test user: testdummy"
# id testdummy
```

---

## Chapter 7: Permissions & Ownership

### 🔑 Key Concept
Permissions are like locks: r(read), w(write), x(execute). Numbers: 4+2+1 = 7 (rwx)

### Hands-On Commands

```bash
# Understanding permissions
ls -la                 # View permissions
touch testfile.txt     # Create test file
ls -la testfile.txt    # Check permissions

# Permission breakdown: drwxrwxrwx
# d = directory (- for file)
# rwx = owner permissions
# rwx = group permissions  
# rwx = others permissions

# Changing permissions
chmod 755 testfile.txt    # rwxr-xr-x
chmod 644 testfile.txt    # rw-r--r--
chmod +x testfile.txt     # Add execute
chmod -w testfile.txt     # Remove write
chmod u+w testfile.txt    # Add write for user

# Ownership
chown user:group file     # Change owner and group
chown user file          # Change owner only
chgrp group file         # Change group only

# Practical examples
mkdir testdir
chmod 755 testdir        # Standard directory permissions
chmod 644 *.txt          # Standard file permissions
```

### 🎯 Exercise 7.1
```bash
# Permissions practice lab
echo "=== Permissions Lab ==="
mkdir -p lab/secret lab/public
touch lab/secret/topsecret.txt lab/public/readme.txt

# Set permissions
chmod 700 lab/secret              # Only owner access
chmod 644 lab/secret/topsecret.txt # Read-only for others
chmod 755 lab/public              # Everyone can read/execute
chmod 644 lab/public/readme.txt   # Standard file permissions

echo "Secret directory (owner only):"
ls -la lab/
echo "Public directory (everyone can read):"
ls -la lab/public/

# Test permissions
echo "This is secret!" > lab/secret/topsecret.txt
echo "This is public!" > lab/public/readme.txt
```

---

## Chapter 8: Package Management

### 🔑 Key Concept
Package managers are like app stores. APT (Debian/Ubuntu), YUM/DNF (RedHat/CentOS)

### Hands-On Commands

```bash
# APT (Ubuntu/Debian)
sudo apt update              # Update package list
sudo apt upgrade             # Upgrade packages
sudo apt install htop       # Install package
sudo apt remove package     # Remove package
sudo apt purge package      # Remove package + config
sudo apt autoremove         # Remove unused packages
sudo apt search keyword     # Search packages
apt list --installed        # List installed packages

# Alternative commands for other distros
# sudo yum install package   # CentOS 7
# sudo dnf install package   # CentOS 8+/Fedora

# Snap packages (universal)
sudo snap install code --classic
snap list
sudo snap remove package

# Manual package installation
wget http://example.com/package.deb
sudo dpkg -i package.deb
sudo apt -f install         # Fix dependencies
```

### 🎯 Exercise 8.1
```bash
# Package management lab
echo "=== Package Management Lab ==="

# Install useful tools
sudo apt update
sudo apt install -y tree htop curl wget git

# Check what we installed
echo "Installed packages:"
apt list tree htop curl wget git 2>/dev/null | grep installed

# Create package report
echo "=== System Package Report ===" > package_report.txt
echo "Total installed packages: $(apt list --installed 2>/dev/null | wc -l)" >> package_report.txt
echo "Upgradeable packages: $(apt list --upgradable 2>/dev/null | wc -l)" >> package_report.txt
cat package_report.txt
```

---

## Chapter 9: Process Management

### 🔑 Key Concept
Processes are like workers in a factory. Each has a PID (Process ID) like an employee number.

### Hands-On Commands

```bash
# View processes
ps                    # My processes
ps aux               # All processes
ps -ef               # All processes (alternative format)
pstree               # Process tree
top                  # Real-time process monitor
htop                 # Better process monitor

# Process information
ps aux | grep nginx  # Find specific process
pgrep nginx         # Find process by name
pidof nginx         # Get PID of process

# Process control
kill PID            # Terminate process (SIGTERM)
kill -9 PID         # Force kill (SIGKILL)
killall processname # Kill all instances
pkill processname   # Kill by name

# Background processes
command &           # Run in background
jobs               # List background jobs
fg %1              # Bring job to foreground
bg %1              # Send job to background
nohup command &    # Run even after logout

# Process monitoring
watch "ps aux | grep nginx"  # Monitor continuously
```

### 🎯 Exercise 9.1
```bash
# Process management lab
echo "=== Process Management Lab ==="

# Start some background processes
sleep 100 &
sleep 200 &
sleep 300 &

echo "Background jobs:"
jobs

echo "All sleep processes:"
ps aux | grep sleep | grep -v grep

echo "Process tree:"
pstree -p $$

# Kill our test processes
killall sleep
echo "Cleaned up test processes"
```

---

## Chapter 10: Service Management with systemd

### 🔑 Key Concept
Services are like hotel staff - they run in the background serving you. systemd is the manager!

### Hands-On Commands

```bash
# Service status
systemctl status servicename
systemctl status ssh
systemctl status apache2

# Service control
sudo systemctl start servicename
sudo systemctl stop servicename
sudo systemctl restart servicename
sudo systemctl reload servicename

# Service management
sudo systemctl enable servicename   # Start at boot
sudo systemctl disable servicename  # Don't start at boot
systemctl is-enabled servicename    # Check if enabled
systemctl is-active servicename     # Check if running

# List services
systemctl list-units --type=service
systemctl list-units --type=service --state=running
systemctl list-units --type=service --state=failed

# Create custom service
sudo nano /etc/systemd/system/myapp.service
sudo systemctl daemon-reload        # Reload systemd
```

### Sample Service File
```ini
[Unit]
Description=My Custom Application
After=network.target

[Service]
Type=simple
User=myuser
WorkingDirectory=/opt/myapp
ExecStart=/opt/myapp/start.sh
Restart=always

[Install]
WantedBy=multi-user.target
```

### 🎯 Exercise 10.1
```bash
# Service management lab
echo "=== Service Management Lab ==="

# Check important services
services=("ssh" "networking" "systemd-resolved")
for service in "${services[@]}"; do
    echo "Service: $service"
    systemctl is-active $service
    systemctl is-enabled $service
    echo ""
done

# List failed services
echo "Failed services:"
systemctl --failed

# Service dependency tree
systemctl list-dependencies
```

---

## Chapter 11: Log Files and Monitoring

### 🔑 Key Concept
Logs are like a diary - they tell you what happened and when. journalctl reads the modern diary!

### Hands-On Commands

```bash
# System logs with journalctl
journalctl                    # All logs
journalctl -f                 # Follow logs (tail -f style)
journalctl -u servicename     # Logs for specific service
journalctl --since "1 hour ago"
journalctl --since "2023-01-01"
journalctl -p err             # Only errors
journalctl -k                 # Kernel messages

# Traditional log files
sudo tail -f /var/log/syslog     # System log
sudo tail -f /var/log/auth.log   # Authentication log
sudo tail -f /var/log/dpkg.log   # Package management log
ls -la /var/log/                 # All log files

# Log rotation
logrotate --help
cat /etc/logrotate.conf

# Monitor logs in real-time
sudo multitail /var/log/syslog /var/log/auth.log
```

### 🎯 Exercise 11.1
```bash
# Log monitoring lab
echo "=== Log Monitoring Lab ==="

# Create log summary
echo "=== System Log Summary ===" > log_summary.txt
echo "Boot time: $(journalctl -b | head -1 | awk '{print $1, $2, $3}')" >> log_summary.txt
echo "Error count today: $(journalctl --since today -p err | wc -l)" >> log_summary.txt
echo "Warning count today: $(journalctl --since today -p warning | wc -l)" >> log_summary.txt
echo "Last 5 login attempts:" >> log_summary.txt
sudo grep "sshd" /var/log/auth.log | tail -5 >> log_summary.txt 2>/dev/null || echo "No SSH logs found" >> log_summary.txt

cat log_summary.txt
```

---

## Chapter 12: Disk Management & Mounting

### 🔑 Key Concept
Disks are like filing cabinets. You need to "mount" them (attach) before you can use them!

### Hands-On Commands

```bash
# View disks and partitions
lsblk                    # Block devices tree
fdisk -l                 # List all disks
df -h                    # Disk space usage
du -sh /path/to/dir     # Directory size

# Mount/unmount
sudo mount /dev/sdb1 /mnt/mydisk
sudo umount /mnt/mydisk
mount | grep -v tmpfs   # Show mounted filesystems

# Permanent mounts
sudo nano /etc/fstab
# Format: device mountpoint filesystem options dump pass
# /dev/sdb1 /mnt/mydisk ext4 defaults 0 2

# USB devices
sudo mkdir /mnt/usb
sudo mount /dev/sdc1 /mnt/usb
ls /mnt/usb
sudo umount /mnt/usb

# Check filesystem
sudo fsck /dev/sdb1      # Check and repair
sudo mkfs.ext4 /dev/sdb1 # Format as ext4
```

### 🎯 Exercise 12.1
```bash
# Disk management lab
echo "=== Disk Management Lab ==="

# Disk usage report
echo "=== Disk Usage Report ===" > disk_report.txt
echo "Filesystem usage:" >> disk_report.txt
df -h >> disk_report.txt
echo "" >> disk_report.txt
echo "Largest directories in /var:" >> disk_report.txt
sudo du -sh /var/* 2>/dev/null | sort -hr | head -5 >> disk_report.txt
echo "" >> disk_report.txt
echo "Block devices:" >> disk_report.txt
lsblk >> disk_report.txt

cat disk_report.txt
```

---

## Chapter 13: Networking Basics

### 🔑 Key Concept
Networking is like postal system. IP addresses are like house addresses, ports are like apartment numbers!

### Hands-On Commands

```bash
# Network interface information
ip addr show            # Show IP addresses
ip route show          # Show routing table
ifconfig               # Old way (may need net-tools)

# Network connectivity
ping google.com        # Test connectivity
ping -c 4 8.8.8.8     # Ping 4 times
traceroute google.com  # Show route to destination

# Network statistics
netstat -tuln          # Show listening ports
ss -tuln               # Modern replacement for netstat
ss -tulpn              # Show process names too

# DNS
nslookup google.com
dig google.com
cat /etc/resolv.conf   # DNS configuration

# Download files
wget https://example.com/file
curl -O https://example.com/file
curl -s http://ipinfo.io  # Get public IP info
```

### 🎯 Exercise 13.1
```bash
# Network diagnostics lab
echo "=== Network Diagnostics Lab ==="

# Create network report
echo "=== Network Status Report ===" > network_report.txt
echo "Hostname: $(hostname)" >> network_report.txt
echo "IP Address: $(ip route get 8.8.8.8 | awk '{print $7}' | head -1)" >> network_report.txt
echo "Gateway: $(ip route | grep default | awk '{print $3}')" >> network_report.txt
echo "DNS Servers:" >> network_report.txt
cat /etc/resolv.conf | grep nameserver >> network_report.txt
echo "" >> network_report.txt
echo "Open ports:" >> network_report.txt
ss -tuln | head -10 >> network_report.txt

cat network_report.txt
```

---

## Chapter 14: Firewall & Security

### 🔑 Key Concept
Firewall is like a security guard - it decides who can come in and who can't!

### Hands-On Commands

```bash
# UFW (Uncomplicated Firewall) - Ubuntu
sudo ufw status           # Check status
sudo ufw enable           # Enable firewall
sudo ufw disable          # Disable firewall
sudo ufw allow 22         # Allow SSH
sudo ufw allow 80/tcp     # Allow HTTP
sudo ufw deny 21          # Block FTP
sudo ufw delete allow 80  # Remove rule

# iptables (advanced)
sudo iptables -L          # List rules
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables-save        # Save rules

# Security checks
sudo netstat -tulpn | grep :22  # Check SSH port
last                             # Recent logins
sudo grep "Failed password" /var/log/auth.log | tail -10
who                              # Currently logged in users

# File integrity
sudo find /etc -name "*.conf" -mtime -1  # Modified configs last 24h
sudo find /home -perm 777                # World-writable files
```

### 🎯 Exercise 14.1
```bash
# Security audit lab
echo "=== Security Audit Lab ==="

# Create security report
echo "=== Security Audit Report ===" > security_report.txt
echo "Firewall status: $(sudo ufw status | head -1)" >> security_report.txt
echo "Failed login attempts today:" >> security_report.txt
sudo grep "Failed password" /var/log/auth.log 2>/dev/null | grep "$(date '+%b %d')" | wc -l >> security_report.txt
echo "Currently logged in:" >> security_report.txt
who >> security_report.txt
echo "Listening services:" >> security_report.txt
sudo ss -tulpn | grep LISTEN | head -5 >> security_report.txt

cat security_report.txt
```

---

## Chapter 15: Crontab & Scheduled Jobs

### 🔑 Key Concept
Cron is like a personal assistant that does tasks at scheduled times. Perfect memory, never sleeps!

### Hands-On Commands

```bash
# Crontab management
crontab -l              # List my cron jobs
crontab -e              # Edit my cron jobs
crontab -r              # Remove all my cron jobs
sudo crontab -l         # Root's cron jobs

# Cron format: minute hour day month weekday command
# * * * * * command
# 0 2 * * * /path/to/backup.sh    # Daily at 2 AM
# 0 */6 * * * /path/to/check.sh   # Every 6 hours
# 30 23 * * 0 /path/to/weekly.sh  # Weekly on Sunday 11:30 PM

# System cron directories
ls -la /etc/cron.d/      # System cron jobs
ls -la /etc/cron.daily/  # Daily scripts
ls -la /etc/cron.hourly/ # Hourly scripts
ls -la /etc/cron.weekly/ # Weekly scripts
ls -la /etc/cron.monthly/# Monthly scripts

# Test cron jobs
# Add this to test: */1 * * * * echo "Hello from cron: $(date)" >> /tmp/crontest.log
# Wait a minute and check: tail /tmp/crontest.log
```

### Sample Cron Jobs
```bash
# Backup home directory daily at 2 AM
0 2 * * * tar -czf /backup/home_$(date +\%Y\%m\%d).tar.gz /home/

# Clean temporary files every hour
0 * * * * find /tmp -type f -mtime +1 -delete

# System update check weekly
0 9 * * 1 apt update && apt list --upgradable > /var/log/updates-available.log

# Restart web server monthly
0 3 1 * * systemctl restart apache2
```

### 🎯 Exercise 15.1
```bash
# Cron job lab
echo "=== Cron Job Lab ==="

# Create a test cron job
echo "# Test cron job - runs every minute" > /tmp/mycron
echo "*/1 * * * * echo 'Cron test: \$(date)' >> /tmp/crontest.log" >> /tmp/mycron
crontab /tmp/mycron

echo "Added test cron job. Check /tmp/crontest.log in a minute"
echo "Current cron jobs:"
crontab -l

# Clean up after test (uncomment to remove test job)
# crontab -r
```

---

## Chapter 16: File Search & Text Processing

### 🔑 Key Concept
find is like a detective, grep is like a highlighter, awk is like a data analyst!

### Hands-On Commands

```bash
# Finding files
find /home -name "*.txt"           # Find by name
find /var -type f -size +100M      # Files larger than 100MB
find /etc -mtime -1                # Modified in last 24 hours
find /tmp -user $USER              # Files owned by me
find . -perm 755                   # Files with specific permissions

# Advanced find
find /var/log -name "*.log" -exec ls -lh {} \;
find /home -name "*.bak" -delete
find . -type f -empty              # Empty files

# Text searching with grep
grep "error" /var/log/syslog       # Find errors in log
grep -r "TODO" /home/project/      # Recursive search
grep -i "password" file.txt        # Case insensitive
grep -n "error" file.txt           # Show line numbers
grep -v "debug" file.txt           # Exclude lines with "debug"

# Advanced grep
grep -E "error|warning" file.txt   # Multiple patterns
grep -A 3 -B 3 "error" file.txt    # Show 3 lines before/after
ps aux | grep nginx                # Grep with pipes

# AWK text processing
awk '{print $1}' file.txt          # Print first column
awk '{print $1, $3}' file.txt      # Print columns 1 and 3
awk '/error/ {print $0}' file.txt  # Print lines containing "error"
df -h | awk '{print $5}' | grep %  # Disk usage percentages

# Other text tools
cut -d: -f1 /etc/passwd            # Get usernames
sort file.txt                      # Sort lines
uniq file.txt                      # Remove duplicates
wc -l file.txt                     # Count lines
head -n 10 file.txt                # First 10 lines
tail -n 10 file.txt                # Last 10 lines
```

### 🎯 Exercise 16.1
```bash
# Text processing lab
echo "=== Text Processing Lab ==="

# Create test data
echo -e "apple\nbanana\napple\ncherry\nbanana\ndate" > fruits.txt
echo -e "john:25:engineer\nmary:30:doctor\nbob:28:teacher" > people.txt

# Find and process
echo "Unique fruits:"
sort fruits.txt | uniq

echo "People older than 27:"
awk -F: '$2 > 27 {print $1, "is", $2, "years old"}' people.txt

echo "Log files modified today:"
find /var/log -name "*.log" -mtime 0 2>/dev/null | head -5

# Clean up
rm fruits.txt people.txt
```

---

## Chapter 17: Archives & Compression

### 🔑 Key Concept
Archives are like moving boxes. tar = tape archive, gzip = compress, zip = both archive + compress

### Hands-On Commands

```bash
# TAR (Tape Archive)
tar -cvf archive.tar files/        # Create archive
tar -xvf archive.tar               # Extract archive
tar -tvf archive.tar               # List archive contents

# TAR with compression
tar -czvf archive.tar.gz files/    # Create compressed archive
tar -xzvf archive.tar.gz           # Extract compressed archive
tar -cjvf archive.tar.bz2 files/   # Create bzip2 archive
tar -xjvf archive.tar.bz2          # Extract bzip2 archive

# Individual compression
gzip file.txt                      # Compress file
gunzip file.txt.gz                 # Decompress file
bzip2 file.txt                     # Better compression
bunzip2 file.txt.bz2               # Decompress bzip2

# ZIP archives
zip -r archive.zip directory/      # Create zip archive
unzip archive.zip                  # Extract zip archive
unzip -l archive.zip               # List zip contents

# Quick backup examples
tar -czvf backup_$(date +%Y%m%d).tar.gz /home/user/documents/
tar -czvf website_backup.tar.gz /var/www/html/
```

### 🎯 Exercise 17.1
```bash
# Archive management lab
echo "=== Archive Management Lab ==="

# Create test directory structure
mkdir -p testdata/{docs,pics,code}
echo "Document 1" > testdata/docs/file1.txt
echo "Document 2" > testdata/docs/file2.txt
echo "#!/bin/bash" > testdata/code/script.sh
echo "Photo metadata" > testdata/pics/photo1.jpg

# Create different types of archives
tar -cvf testdata.tar testdata/
tar -czvf testdata.tar.gz testdata/
zip -r testdata.zip testdata/

# Compare sizes
echo "Archive sizes:"
ls -lh testdata.tar* testdata.zip

# Test extraction
mkdir extract_test
cd extract_test
tar -xzf ../testdata.tar.gz
ls -la
cd ..

# Clean up
rm -rf testdata extract_test testdata.tar* testdata.zip
```

---

## Chapter 18: Disk Usage & Quota Management

### 🔑 Key Concept
Monitor disk space like monitoring your bank account - before it runs out!

### Hands-On Commands

```bash
# Disk space monitoring
df -h                    # Human readable disk space
df -i                    # Inode usage
du -sh /home/*          # Directory sizes
du -h --max-depth=1 /var # One level deep

# Find large files
find /home -size +100M -ls
find / -size +1G 2>/dev/null

# Disk usage analysis
ncdu /home              # Interactive disk usage analyzer
baobab                  # GUI disk usage analyzer (if available)

# Clean up space
sudo apt autoremove     # Remove unused packages
sudo apt autoclean      # Clean package cache
sudo journalctl --vacuum-time=7d  # Clean old logs

# Quota management (if enabled)
quota -u username       # User quota
repquota -a            # All quotas
sudo edquota username  # Edit user quota
```

### Space-Saving Script
```bash
#!/bin/bash
# cleanup.sh - System cleanup script

echo "=== System Cleanup ==="

# Package cache cleanup
echo "Cleaning package cache..."
sudo apt autoremove -y
sudo apt autoclean

# Log cleanup
echo "Cleaning old logs..."
sudo journalctl --vacuum-time=7d

# Temp file cleanup
echo "Cleaning temp files..."
sudo find /tmp -type f -atime +7 -delete

# Show results
echo "Disk space after cleanup:"
df -h
```

### 🎯 Exercise 18.1
```bash
# Disk monitoring lab
echo "=== Disk Monitoring Lab ==="

# Create disk usage report
echo "=== Disk Usage Report ===" > disk_usage.txt
echo "Generated: $(date)" >> disk_usage.txt
echo "" >> disk_usage.txt
echo "Filesystem Usage:" >> disk_usage.txt
df -h >> disk_usage.txt
echo "" >> disk_usage.txt
echo "Largest directories in /home:" >> disk_usage.txt
sudo du -sh /home/* 2>/dev/null | sort -hr | head -5 >> disk_usage.txt
echo "" >> disk_usage.txt
echo "Files larger than 50MB:" >> disk_usage.txt
find /home -size +50M -ls 2>/dev/null | head -5 >> disk_usage.txt

cat disk_usage.txt
```

---

# Linux Shell Scripting

## Chapter 19: Introduction to Shells

### 🔑 Key Concept
Shell is your interpreter - it translates your commands into system language. bash is the most popular!

### Hands-On Commands

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

### 🎯 Exercise 19.1
```bash
# Shell exploration lab
echo "=== Shell Information ==="
echo "Current shell: $SHELL"
echo "Shell version: $BASH_VERSION"
echo "Available shells:"
cat /etc/shells
echo ""
echo "Shell variables starting with 'HOME':"
env | grep HOME
echo ""
echo "Command history count: $(history | wc -l)"
```

---

## Chapter 20: Your First Bash Script

### 🔑 Key Concept
Scripts are like recipes - step by step instructions saved in a file!

### Basic Script Structure

```bash
#!/bin/bash
# This is a comment
# Script: myfirst.sh
# Purpose: My first bash script

echo "Hello, Linux World!"
echo "Today is: $(date)"
echo "Current user: $(whoami)"
echo "Current directory: $(pwd)"
```

### Hands-On Commands

```bash
# Create your first script
nano myfirst.sh

# Make it executable
chmod +x myfirst.sh

# Run the script
./myfirst.sh

# Alternative ways to run
bash myfirst.sh
sh myfirst.sh

# Check script syntax
bash -n myfirst.sh
```

### Advanced First Script

```bash
#!/bin/bash
# advanced_first.sh - A more comprehensive first script

# Variables
SCRIPT_NAME="Advanced First Script"
VERSION="1.0"
AUTHOR="Your Name"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}$SCRIPT_NAME v$VERSION${NC}"
    echo -e "${GREEN}By: $AUTHOR${NC}"
    echo -e "${GREEN}================================${NC}"
}

system_info() {
    echo -e "${YELLOW}System Information:${NC}"
    echo "Hostname: $(hostname)"
    echo "OS: $(lsb_release -d | cut -f2)"
    echo "Kernel: $(uname -r)"
    echo "Uptime: $(uptime -p)"
    echo "Load Average: $(uptime | awk -F'load average:' '{print $2}')"
}

# Main execution
print_header
system_info
echo -e "${RED}Script completed successfully!${NC}"
```

### 🎯 Exercise 20.1
```bash
# Create a personal system info script
cat << 'EOF' > system_info.sh
#!/bin/bash
# system_info.sh - Personal system information script

echo "=== Personal System Information ==="
echo "Date: $(date)"
echo "User: $(whoami)"
echo "Home Directory: $HOME"
echo "Current Directory: $(pwd)"
echo "Shell: $SHELL"
echo "Terminal: $TERM"
echo ""
echo "=== System Stats ==="
echo "Hostname: $(hostname)"
echo "Uptime: $(uptime -p)"
echo "Disk Usage:"
df -h / | tail -1
echo "Memory Usage:"
free -h | grep Mem
echo "=== End Report ==="
EOF

chmod +x system_info.sh
./system_info.sh
```

---

## Chapter 21: Script Permissions & Execution

### 🔑 Key Concept
Scripts need execute permission to run. Think of it like giving someone permission to use your recipe!

### Hands-On Commands

```bash
# Check script permissions
ls -la script.sh

# Add execute permissions
chmod +x script.sh           # Add execute for all
chmod u+x script.sh          # Add execute for user only
chmod 755 script.sh          # rwxr-xr-x

# Run scripts different ways
./script.sh                  # Direct execution (needs +x)
bash script.sh              # Run with bash interpreter
sh script.sh                # Run with sh interpreter
source script.sh            # Run in current shell
. script.sh                  # Same as source

# Make script available system-wide
sudo cp script.sh /usr/local/bin/myscript
sudo chmod +x /usr/local/bin/myscript
myscript                     # Now can run from anywhere

# Script debugging
bash -x script.sh            # Show each command execution
bash -n script.sh            # Check syntax without running
```

### Script Template with Proper Headers

```bash
#!/bin/bash
#
# Script Name: template.sh
# Description: Template for bash scripts
# Author: Your Name
# Email: your.email@example.com
# Date: $(date +%Y-%m-%d)
# Version: 1.0
#
# Usage: ./template.sh [options] [arguments]
#
# Exit Codes:
#   0 - Success
#   1 - General error
#   2 - Wrong usage
#

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Script variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_NAME="$(basename "$0")"

# Your script logic here
echo "Script starting..."
echo "Script directory: $SCRIPT_DIR"
echo "Script name: $SCRIPT_NAME"

exit 0
```

### 🎯 Exercise 21.1
```bash
# Permission and execution lab
cat << 'EOF' > permission_test.sh
#!/bin/bash
echo "If you can see this, the script has execute permission!"
echo "Script permissions:"
ls -la "$0"
EOF

# Test without execute permission
echo "Trying to run without execute permission:"
./permission_test.sh 2>/dev/null || echo "Failed - no execute permission"

# Add execute permission
chmod +x permission_test.sh
echo "After adding execute permission:"
./permission_test.sh

# Clean up
rm permission_test.sh
```

---

## Chapter 22: Variables and User Input

### 🔑 Key Concept
Variables are like labeled boxes where you store information. User input makes scripts interactive!

### Hands-On Commands

```bash
# Variable basics
NAME="John"                  # Create variable (no spaces around =)
echo $NAME                   # Use variable
echo ${NAME}                 # Alternative syntax
echo "Hello $NAME"           # Variable in string
echo 'Hello $NAME'           # Single quotes preserve literal

# Special variables
echo $0                      # Script name
echo $1 $2 $3               # Command line arguments
echo $#                      # Number of arguments
echo $@                      # All arguments
echo $                      # Process ID
echo $?                      # Exit code of last command

# Environment variables
echo $HOME $USER $PATH      # System variables
export MYVAR="Global"       # Make variable available to child processes

# User input
read -p "Enter your name: " username
echo "Hello, $username!"

# Advanced input
read -s -p "Enter password: " password  # Silent input
echo ""
read -t 10 -p "Quick! Enter something (10 sec): " quick_input
```

### Interactive Script Example

```bash
#!/bin/bash
# interactive_demo.sh - Demonstrates user input

echo "=== Interactive Demo ==="

# Basic input
read -p "What's your name? " name
read -p "What's your age? " age

# Input with validation
while true; do
    read -p "Enter a number (1-10): " number
    if [[ $number -ge 1 && $number -le 10 ]]; then
        break
    else
        echo "Please enter a number between 1 and 10"
    fi
done

# Silent input (like password)
read -s -p "Enter a secret word: " secret
echo ""

# Results
echo ""
echo "=== Summary ==="
echo "Name: $name"
echo "Age: $age"
echo "Lucky number: $number"
echo "Secret word has ${#secret} characters"

# Command line arguments
echo "Script name: $0"
echo "Number of arguments: $#"
echo "Arguments: $@"
```

### Variable Manipulation

```bash
#!/bin/bash
# variable_demo.sh - Variable manipulation examples

TEXT="Hello World Linux"

echo "Original: $TEXT"
echo "Length: ${#TEXT}"
echo "Uppercase: ${TEXT^^}"
echo "Lowercase: ${TEXT,,}"
echo "Substring (0-5): ${TEXT:0:5}"
echo "Replace World with Universe: ${TEXT/World/Universe}"
echo "Remove 'o': ${TEXT//o/}"

# Default values
echo "UNDEFINED variable with default: ${UNDEFINED:-'Default Value'}"
echo "UNDEFINED variable set to default: ${UNDEFINED:='Set Default'}"
echo "Now UNDEFINED contains: $UNDEFINED"

# Array variables
FRUITS=("apple" "banana" "cherry")
echo "First fruit: ${FRUITS[0]}"
echo "All fruits: ${FRUITS[@]}"
echo "Number of fruits: ${#FRUITS[@]}"
```

### 🎯 Exercise 22.1
```bash
# Create a personal profile script
cat << 'EOF' > personal_profile.sh
#!/bin/bash
# personal_profile.sh - Create a personal profile

echo "=== Personal Profile Creator ==="

# Collect information
read -p "First Name: " first_name
read -p "Last Name: " last_name
read -p "Age: " age
read -p "City: " city
read -p "Occupation: " occupation

# Create profile
echo ""
echo "=== Your Profile ==="
echo "Name: $first_name $last_name"
echo "Age: $age years old"
echo "Location: $city"
echo "Occupation: $occupation"
echo "Profile created on: $(date)"

# Save to file
profile_file="${first_name}_${last_name}_profile.txt"
{
    echo "Personal Profile"
    echo "================"
    echo "Name: $first_name $last_name"
    echo "Age: $age"
    echo "City: $city"
    echo "Occupation: $occupation"
    echo "Created: $(date)"
} > "$profile_file"

echo ""
echo "Profile saved to: $profile_file"
EOF

chmod +x personal_profile.sh
# Run it: ./personal_profile.sh
```

---

## Chapter 23: Conditional Statements

### 🔑 Key Concept
Conditionals are like decision trees - if this, then that, else something else!

### Basic If Statements

```bash
#!/bin/bash
# conditionals_demo.sh

# Basic if statement
age=25
if [ $age -ge 18 ]; then
    echo "You are an adult"
fi

# If-else
if [ $age -ge 21 ]; then
    echo "You can drink alcohol in the US"
else
    echo "You cannot drink alcohol in the US"
fi

# If-elif-else
if [ $age -lt 13 ]; then
    echo "You are a child"
elif [ $age -lt 20 ]; then
    echo "You are a teenager"
elif [ $age -lt 60 ]; then
    echo "You are an adult"
else
    echo "You are a senior"
fi
```

### Test Operators Reference

```bash
#!/bin/bash
# test_operators.sh - Comprehensive test examples

num1=10
num2=20
str1="hello"
str2="world"
file="/etc/passwd"

echo "=== Numeric Tests ==="
[ $num1 -eq $num2 ] && echo "Equal" || echo "Not equal"
[ $num1 -ne $num2 ] && echo "Not equal" || echo "Equal"
[ $num1 -lt $num2 ] && echo "$num1 is less than $num2"
[ $num1 -gt $num2 ] && echo "$num1 is greater than $num2" || echo "$num1 is not greater than $num2"
[ $num1 -le $num2 ] && echo "$num1 is less than or equal to $num2"
[ $num1 -ge $num2 ] && echo "$num1 is greater than or equal to $num2" || echo "$num1 is not >= $num2"

echo ""
echo "=== String Tests ==="
[ "$str1" = "$str2" ] && echo "Strings are equal" || echo "Strings are not equal"
[ "$str1" != "$str2" ] && echo "Strings are different"
[ -z "$str1" ] && echo "String is empty" || echo "String is not empty"
[ -n "$str1" ] && echo "String is not empty"

echo ""
echo "=== File Tests ==="
[ -f "$file" ] && echo "$file is a regular file"
[ -d "/tmp" ] && echo "/tmp is a directory"
[ -r "$file" ] && echo "$file is readable"
[ -w "/tmp" ] && echo "/tmp is writable"
[ -x "/bin/ls" ] && echo "/bin/ls is executable"
[ -e "$file" ] && echo "$file exists"
```

### Advanced Conditionals

```bash
#!/bin/bash
# advanced_conditionals.sh

# Double bracket syntax (preferred)
name="John"
if [[ $name == "John" ]]; then
    echo "Hello John!"
fi

# Pattern matching
if [[ $name == J* ]]; then
    echo "Name starts with J"
fi

# Multiple conditions
age=25
income=50000
if [[ $age -ge 21 && $income -gt 30000 ]]; then
    echo "Eligible for premium account"
fi

# Logical operators
if [[ $age -lt 18 || $age -gt 65 ]]; then
    echo "Special discount available"
fi

# Case statement (better for multiple options)
read -p "Enter your grade (A-F): " grade
case $grade in
    A|a)
        echo "Excellent! 90-100%"
        ;;
    B|b)
        echo "Good! 80-89%"
        ;;
    C|c)
        echo "Average! 70-79%"
        ;;
    D|d)
        echo "Below Average! 60-69%"
        ;;
    F|f)
        echo "Failing! Below 60%"
        ;;
    *)
        echo "Invalid grade entered"
        ;;
esac
```

### 🎯 Exercise 23.1
```bash
# Create a system health checker
cat << 'EOF' > health_checker.sh
#!/bin/bash
# health_checker.sh - System health monitoring

echo "=== System Health Checker ==="

# Check disk usage
disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [[ $disk_usage -gt 90 ]]; then
    echo "🔴 CRITICAL: Disk usage is ${disk_usage}%"
elif [[ $disk_usage -gt 75 ]]; then
    echo "🟡 WARNING: Disk usage is ${disk_usage}%"
else
    echo "🟢 OK: Disk usage is ${disk_usage}%"
fi

# Check memory usage
memory_usage=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
if [[ $memory_usage -gt 90 ]]; then
    echo "🔴 CRITICAL: Memory usage is ${memory_usage}%"
elif [[ $memory_usage -gt 75 ]]; then
    echo "🟡 WARNING: Memory usage is ${memory_usage}%"
else
    echo "🟢 OK: Memory usage is ${memory_usage}%"
fi

# Check load average
load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk -F', ' '{print $1}')
if (( $(echo "$load_avg > 2.0" | bc -l) )); then
    echo "🔴 CRITICAL: High load average: $load_avg"
elif (( $(echo "$load_avg > 1.0" | bc -l) )); then
    echo "🟡 WARNING: Moderate load average: $load_avg"
else
    echo "🟢 OK: Load average: $load_avg"
fi

# Check if important services are running
services=("ssh" "systemd-resolved")
for service in "${services[@]}"; do
    if systemctl is-active --quiet "$service"; then
        echo "🟢 OK: $service is running"
    else
        echo "🔴 CRITICAL: $service is not running"
    fi
done

echo "=== Health Check Complete ==="
EOF

chmod +x health_checker.sh
./health_checker.sh
```

---

## Chapter 24: Loops

### 🔑 Key Concept
Loops are like assembly lines - repeat the same action until done!

### For Loops

```bash
#!/bin/bash
# for_loops_demo.sh

echo "=== For Loop Examples ==="

# Basic for loop
echo "Counting 1 to 5:"
for i in 1 2 3 4 5; do
    echo "Number: $i"
done

# Range for loop
echo ""
echo "Counting 1 to 10:"
for i in {1..10}; do
    echo -n "$i "
done
echo ""

# Step for loop
echo ""
echo "Even numbers 2 to 20:"
for i in {2..20..2}; do
    echo -n "$i "
done
echo ""

# C-style for loop
echo ""
echo "C-style loop:"
for ((i=1; i<=5; i++)); do
    echo "Iteration $i"
done

# Loop over files
echo ""
echo "Files in current directory:"
for file in *; do
    if [ -f "$file" ]; then
        echo "File: $file"
    fi
done

# Loop over array
echo ""
echo "Loop over array:"
fruits=("apple" "banana" "cherry" "date")
for fruit in "${fruits[@]}"; do
    echo "Fruit: $fruit"
done
```

### While Loops

```bash
#!/bin/bash
# while_loops_demo.sh

echo "=== While Loop Examples ==="

# Basic while loop
counter=1
echo "Counting with while loop:"
while [ $counter -le 5 ]; do
    echo "Count: $counter"
    ((counter++))
done

# Reading file line by line
echo ""
echo "Reading /etc/passwd (first 5 lines):"
counter=0
while IFS= read -r line; do
    echo "Line $((++counter)): $line"
    if [ $counter -eq 5 ]; then
        break
    fi
done < /etc/passwd

# Infinite loop with break
echo ""
echo "Guessing game:"
secret_number=7
while true; do
    read -p "Guess a number (1-10): " guess
    if [ "$guess" -eq "$secret_number" ]; then
        echo "Correct! The number was $secret_number"
        break
    elif [ "$guess" -lt "$secret_number" ]; then
        echo "Too low!"
    else
        echo "Too high!"
    fi
done
```

### Until Loops

```bash
#!/bin/bash
# until_loops_demo.sh

echo "=== Until Loop Examples ==="

# Basic until loop (opposite of while)
counter=1
echo "Counting with until loop:"
until [ $counter -gt 5 ]; do
    echo "Count: $counter"
    ((counter++))
done

# Wait for file to appear
echo ""
echo "Waiting for file to appear..."
until [ -f "/tmp/test_file" ]; do
    echo "File not found, waiting..."
    sleep 1
    # Create the file after 3 seconds for demo
    if [ ! -f "/tmp/test_file" ]; then
        touch /tmp/test_file
    fi
done
echo "File found!"
rm /tmp/test_file
```

### Loop Control

```bash
#!/bin/bash
# loop_control_demo.sh

echo "=== Loop Control Examples ==="

# Break and continue
echo "Numbers 1-10, skipping 5:"
for i in {1..10}; do
    if [ $i -eq 5 ]; then
        echo "Skipping $i"
        continue
    fi
    if [ $i -eq 8 ]; then
        echo "Breaking at $i"
        break
    fi
    echo "Number: $i"
done

# Nested loops
echo ""
echo "Multiplication table (3x3):"
for i in {1..3}; do
    for j in {1..3}; do
        result=$((i * j))
        echo -n "$i x $j = $result  "
    done
    echo ""
done
```

### 🎯 Exercise 24.1
```bash
# Create a backup script using loops
cat << 'EOF' > backup_script.sh
#!/bin/bash
# backup_script.sh - Automated backup with loops

echo "=== Automated Backup Script ==="

# Directories to backup
backup_dirs=("/home/$USER/Documents" "/home/$USER/Pictures" "/home/$USER/Scripts")
backup_base="/tmp/backups"
timestamp=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p "$backup_base"

# Loop through directories
for dir in "${backup_dirs[@]}"; do
    if [ -d "$dir" ]; then
        dir_name=$(basename "$dir")
        backup_file="${backup_base}/${dir_name}_${timestamp}.tar.gz"
        
        echo "Backing up $dir..."
        tar -czf "$backup_file" -C "$(dirname "$dir")" "$(basename "$dir")" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo "✅ Successfully backed up $dir to $backup_file"
        else
            echo "❌ Failed to backup $dir"
        fi
    else
        echo "⚠️  Directory $dir does not exist, skipping..."
    fi
done

# Show backup summary
echo ""
echo "=== Backup Summary ==="
backup_count=$(ls -1 "$backup_base"/*_${timestamp}.tar.gz 2>/dev/null | wc -l)
echo "Total backups created: $backup_count"
echo "Backup location: $backup_base"
echo "Backup files:"
ls -lh "$backup_base"/*_${timestamp}.tar.gz 2>/dev/null || echo "No backup files found"

echo ""
echo "=== Backup Complete ==="
EOF

chmod +x backup_script.sh
# Create some test directories first
mkdir -p ~/Documents ~/Pictures ~/Scripts
echo "test doc" > ~/Documents/test.txt
echo "test script" > ~/Scripts/test.sh
./backup_script.sh
```

---

## Chapter 25: Functions in Shell Scripts

### 🔑 Key Concept
Functions are like mini-programs within your script - write once, use many times!

### Basic Functions

```bash
#!/bin/bash
# functions_demo.sh

# Simple function
greet() {
    echo "Hello, World!"
}

# Function with parameters
greet_user() {
    local name=$1
    local age=$2
    echo "Hello, $name! You are $age years old."
}

# Function with return value
add_numbers() {
    local num1=$1
    local num2=$2
    local result=$((num1 + num2))
    echo $result
}

# Function with local variables
calculate_circle_area() {
    local radius=$1
    local pi=3.14159
    local area=$(echo "$pi * $radius * $radius" | bc -l)
    printf "Area of circle with radius %.2f is %.2f\n" "$radius" "$area"
}

# Usage examples
echo "=== Function Examples ==="
greet
greet_user "John" 25
result=$(add_numbers 10 20)
echo "10 + 20 = $result"
calculate_circle_area 5
```

### Advanced Functions

```bash
#!/bin/bash
# advanced_functions.sh

# Function with error handling
safe_division() {
    local numerator=$1
    local denominator=$2
    
    if [ "$denominator" -eq 0 ]; then
        echo "Error: Division by zero!" >&2
        return 1
    fi
    
    local result=$(echo "scale=2; $numerator / $denominator" | bc -l)
    echo $result
    return 0
}

# Function that modifies global variables
counter=0
increment_counter() {
    ((counter++))
    echo "Counter is now: $counter"
}

# Function with multiple return values (using arrays)
get_system_info() {
    local -n result_array=$1
    result_array[0]=$(hostname)
    result_array[1]=$(uptime -p)
    result_array[2]=$(df -h / | tail -1 | awk '{print $5}')
}

# Function with validation
validate_email() {
    local email=$1
    local regex="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    
    if [[ $email =~ $regex ]]; then
        echo "Valid email: $email"
        return 0
    else
        echo "Invalid email: $email"
        return 1
    fi
}

# Usage examples
echo "=== Advanced Function Examples ==="

# Test safe division
result=$(safe_division 10 3)
echo "10 / 3 = $result"

safe_division 10 0
if [ $? -ne 0 ]; then
    echo "Division failed as expected"
fi

# Test counter
increment_counter
increment_counter

# Test system info
declare -a sys_info
get_system_info sys_info
echo "Hostname: ${sys_info[0]}"
echo "Uptime: ${sys_info[1]}"
echo "Disk usage: ${sys_info[2]}"

# Test email validation
validate_email "user@example.com"
validate_email "invalid.email"
```

### Utility Functions Library

```bash
#!/bin/bash
# utility_functions.sh - Reusable utility functions

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" >&2
}

# File operations
backup_file() {
    local file=$1
    if [ -f "$file" ]; then
        local backup_name="${file}.backup.$(date +%Y%m%d_%H%M%S)"
        cp "$file" "$backup_name"
        log_success "Backed up $file to $backup_name"
    else
        log_error "File $file not found"
        return 1
    fi
}

# System checks
check_disk_space() {
    local threshold=${1:-80}
    local usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [ "$usage" -gt "$threshold" ]; then
        log_warning "Disk usage is ${usage}% (threshold: ${threshold}%)"
        return 1
    else
        log_info "Disk usage is ${usage}% (OK)"
        return 0
    fi
}

check_service() {
    local service=$1
    if systemctl is-active --quiet "$service"; then
        log_success "Service $service is running"
        return 0
    else
        log_error "Service $service is not running"
        return 1
    fi
}

# Network functions
check_connectivity() {
    local host=${1:-8.8.8.8}
    if ping -c 1 "$host" >/dev/null 2>&1; then
        log_success "Network connectivity to $host is OK"
        return 0
    else
        log_error "No network connectivity to $host"
        return 1
    fi
}

# Usage examples
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    echo "=== Utility Functions Demo ==="
    log_info "Starting utility functions demo"
    check_disk_space 80
    check_service "ssh"
    check_connectivity "google.com"
    log_success "Demo completed"
fi
```

### 🎯 Exercise 25.1
```bash
# Create a system administration toolkit
cat << 'EOF' > sysadmin_toolkit.sh
#!/bin/bash
# sysadmin_toolkit.sh - System administration toolkit with functions

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Menu function
show_menu() {
    clear
    echo -e "${BLUE}=== System Administration Toolkit ===${NC}"
    echo "1. System Information"
    echo "2. Disk Usage Report"
    echo "3. Memory Usage Report" 
    echo "4. Network Status"
    echo "5. Service Status Check"
    echo "6. Log File Analysis"
    echo "7. User Management Info"
    echo "8. Exit"
    echo ""
    read -p "Choose an option (1-8): " choice
}

# System information
system_info() {
    echo -e "${GREEN}=== System Information ===${NC}"
    echo "Hostname: $(hostname)"
    echo "OS: $(lsb_release -d 2>/dev/null | cut -f2 || echo "Unknown")"
    echo "Kernel: $(uname -r)"
    echo "Architecture: $(uname -m)"
    
