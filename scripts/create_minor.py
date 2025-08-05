#!/usr/bin/env python3
import subprocess
import argparse
from datetime import datetime

def run_git_command(args, dry_run=False):
    if dry_run:
        print(f"🔍 Would run: git {' '.join(args)}")
        return ""
    
    result = subprocess.run(["git"] + args, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"❌ Error: {' '.join(args)}\n{result.stderr.strip()}")
        exit(1)
    return result.stdout.strip()

def create_new_branch(branch_name, dry_run=False):
    """Create a new branch from develop"""
    run_git_command(["checkout", "develop"], dry_run)
    run_git_command(["pull", "origin", "develop"], dry_run)
    run_git_command(["checkout", "-b", branch_name], dry_run)
    run_git_command(["push", "-u", "origin", branch_name], dry_run)

def main():
    parser = argparse.ArgumentParser(description="Create a minor release branch")
    parser.add_argument("--dry", action="store_true", help="Show what commands would be run without executing them")
    parser.add_argument("--patch", type=int, default=0, help="Patch version number (default: 0)")
    args = parser.parse_args()
    
    today = datetime.today()
    minor = f"{today.month}{today.day:02d}"  # e.g. "0805"
    branch_name = f"release/v1.{minor}.{args.patch}"

    if args.dry:
        print(f"🔍 DRY RUN: Would create branch: {branch_name} from 'develop'")
    else:
        print(f"📌 Creating branch: {branch_name} from 'develop'")

    run_git_command(["fetch", "origin"], args.dry)
    
    # Check if branch already exists (both locally and remotely)
    branch_exists = False
    if not args.dry:
        # Check local branches
        local_branches = subprocess.run(["git", "branch"], capture_output=True, text=True)
        if local_branches.returncode == 0 and branch_name in local_branches.stdout:
            print(f"ℹ️  Branch {branch_name} already exists locally. Skipping creation.")
            branch_exists = True
        
        # Check remote branches (only if not found locally)
        if not branch_exists:
            remote_branches = subprocess.run(["git", "branch", "-r"], capture_output=True, text=True)
            if remote_branches.returncode == 0 and f"origin/{branch_name}" in remote_branches.stdout:
                print(f"ℹ️  Branch {branch_name} already exists on remote. Skipping creation.")
                branch_exists = True
    else:
        print(f"🔍 Would check if branch {branch_name} already exists")
    
    # Only create branch if it doesn't exist
    if not branch_exists and not args.dry:
        create_new_branch(branch_name, args.dry)
        print(f"✅ Done! Created and pushed: {branch_name}")
    elif not args.dry and branch_exists:
        # Branch exists, just checkout to it
        run_git_command(["checkout", branch_name])
        print(f"✅ Switched to existing branch: {branch_name}")
    elif args.dry:
        create_new_branch(branch_name, args.dry)
        print(f"🔍 DRY RUN: Would have created and pushed: {branch_name}")

    # Ask if user wants to create a PR (for both new and existing branches)
    if args.dry:
        print(f"🔍 Would ask if you want to create a PR to main")
    else:
        try:
            create_pr = input("\n🔄 Do you want to create a Pull Request to main? (y/N): ").strip().lower()
            if create_pr in ['y', 'yes']:
                print(f"📝 Creating Pull Request from {branch_name} to main...")
                result = subprocess.run(["gh", "pr", "create", "-B", "main", "--fill"], capture_output=True, text=True)
                if result.returncode == 0:
                    print(f"✅ Pull Request created successfully!")
                    print(result.stdout.strip())
                else:
                    print(f"❌ Error creating PR: {result.stderr.strip()}")
            else:
                print("👍 Skipping PR creation.")
        except KeyboardInterrupt:
            print("\n👍 Skipping PR creation.")

if __name__ == "__main__":
    main()