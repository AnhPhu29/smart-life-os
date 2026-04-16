#!/bin/bash

# 🚀 Smart Life OS - CI/CD Workflow Runner
# Script giúp chạy workflows một cách dễ dàng

set -e  # Exit nếu có lỗi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "\n${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║ $1${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI not installed!"
        echo "Install from: https://cli.github.com"
        exit 1
    fi
    print_success "GitHub CLI found"
}

run_frontend_workflow() {
    print_header "Running Frontend Workflow"
    echo "Branch: main"
    echo ""
    
    gh workflow run frontend.yml --ref main
    print_success "Frontend workflow triggered!"
    echo ""
    echo "Monitoring workflow..."
    gh run watch
}

run_backend_workflow() {
    print_header "Running Backend Workflow"
    echo "Branch: main"
    echo ""
    
    gh workflow run backend.yml --ref main
    print_success "Backend workflow triggered!"
    echo ""
    echo "Monitoring workflow..."
    gh run watch
}

run_docker_workflow() {
    print_header "Running Docker Workflow"
    echo "Branch: main"
    echo ""
    
    gh workflow run docker.yml
    print_success "Docker workflow triggered!"
    echo ""
    echo "Monitoring workflow..."
    gh run watch
}

run_all_workflows() {
    print_header "Running ALL Workflows"
    
    echo -e "${YELLOW}This will run all workflows sequentially...${NC}\n"
    
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Cancelled"
        return
    fi
    
    print_header "1️⃣  Frontend Workflow"
    gh workflow run frontend.yml --ref main
    print_success "Frontend triggered"
    sleep 5
    
    print_header "2️⃣  Backend Workflow"
    gh workflow run backend.yml --ref main
    print_success "Backend triggered"
    sleep 5
    
    print_header "3️⃣  Docker Workflow"
    gh workflow run docker.yml
    print_success "Docker triggered"
    
    echo ""
    print_success "All workflows triggered!"
    echo "Check: Repository → Actions"
}

view_workflow_logs() {
    print_header "View Workflow Logs"
    echo ""
    gh run list
    echo ""
    
    read -p "Enter Run ID to view logs: " run_id
    
    if [ -z "$run_id" ]; then
        print_error "No Run ID provided"
        return
    fi
    
    gh run view "$run_id" --log
}

list_workflows() {
    print_header "Available Workflows"
    echo ""
    gh workflow list
}

push_to_main() {
    print_header "Push to Main Branch"
    
    if [ -z "$(git status --porcelain)" ]; then
        print_warning "No changes to commit"
        return
    fi
    
    echo "Current changes:"
    git status --short
    echo ""
    
    read -p "Commit message: " commit_msg
    
    if [ -z "$commit_msg" ]; then
        print_error "No commit message provided"
        return
    fi
    
    git add .
    git commit -m "$commit_msg"
    git push origin main
    
    print_success "Pushed to main!"
    echo "Frontend and Backend workflows will run automatically"
}

push_with_tag() {
    print_header "Push to Main with Version Tag"
    
    read -p "Enter version tag (e.g., v1.0.0): " tag
    
    if [ -z "$tag" ]; then
        print_error "No tag provided"
        return
    fi
    
    # Check if tag already exists
    if git rev-parse "$tag" >/dev/null 2>&1; then
        print_error "Tag $tag already exists!"
        return
    fi
    
    git add .
    read -p "Commit message: " commit_msg
    git commit -m "$commit_msg"
    git tag "$tag"
    
    git push origin main
    git push origin "$tag"
    
    print_success "Pushed to main with tag $tag!"
    echo "Docker workflow will run automatically"
}

main() {
    check_gh_cli
    
    print_header "Smart Life OS - CI/CD Workflow Runner"
    echo "Choose an option:"
    echo ""
    echo "1) Run Frontend Workflow"
    echo "2) Run Backend Workflow"
    echo "3) Run Docker Workflow"
    echo "4) Run ALL Workflows"
    echo "5) View Workflow Logs"
    echo "6) List All Workflows"
    echo "7) Push to Main (triggers workflows)"
    echo "8) Push to Main with Version Tag"
    echo "9) Exit"
    echo ""
    
    read -p "Enter your choice (1-9): " choice
    
    case $choice in
        1) run_frontend_workflow ;;
        2) run_backend_workflow ;;
        3) run_docker_workflow ;;
        4) run_all_workflows ;;
        5) view_workflow_logs ;;
        6) list_workflows ;;
        7) push_to_main ;;
        8) push_with_tag ;;
        9) 
            print_success "Goodbye!"
            exit 0
            ;;
        *)
            print_error "Invalid choice"
            main
            ;;
    esac
    
    echo ""
    read -p "Run another command? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        main
    else
        print_success "Goodbye!"
    fi
}

main "$@"
