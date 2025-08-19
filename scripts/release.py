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


def create_new_branch(branch_name, source_branch="develop", dry_run=False):
    """Create a new branch from source branch"""
    run_git_command(["checkout", source_branch], dry_run)
    run_git_command(["pull", "origin", source_branch], dry_run)
    run_git_command(["checkout", "-b", branch_name], dry_run)
    run_git_command(["push", "-u", "origin", branch_name], dry_run)


def get_latest_release_branch(dry_run=False):
    """Get the latest release branch from origin"""
    if dry_run:
        print("🔍 Would fetch and find latest release branch")
        return "release/v1.0815.0"  # Mock for dry run

    # Fetch all remote branches
    run_git_command(["fetch", "origin"], dry_run)

    # Get all remote release branches
    result = subprocess.run(
        ["git", "branch", "-r", "--list", "origin/release/v*"],
        capture_output=True, text=True, check=False)

    if result.returncode != 0:
        print("❌ Error getting remote branches")
        exit(1)

    release_branches = []
    for line in result.stdout.strip().split('\n'):
        if line.strip():
            branch = line.strip().replace('origin/', '')
            release_branches.append(branch)

    if not release_branches:
        print("❌ No release branches found")
        exit(1)

    # Sort branches to get the latest (assuming semantic versioning)
    release_branches.sort(reverse=True)
    latest_release = release_branches[0]

    print(f"📌 Latest release branch found: {latest_release}")
    return latest_release


def create_patch_branch(dry_run=False):
    """Create a patch branch from the latest release"""
    latest_release = get_latest_release_branch(dry_run)

    # Extract version components from branch name (e.g., release/v1.0815.0)
    import re
    match = re.match(r'release/v(\d+)\.(\d+)\.(\d+)', latest_release)
    if not match:
        print(f"❌ Could not parse version from branch: {latest_release}")
        exit(1)

    major, minor, patch = match.groups()
    new_patch = int(patch) + 1
    new_branch_name = f"release/v{major}.{minor}.{new_patch}"

    if dry_run:
        print(
            f"🔍 DRY RUN: Would create patch branch: {new_branch_name} from '{latest_release}'")
    else:
        print(
            f"📌 Creating patch branch: {new_branch_name} from '{latest_release}'")

    # Check if branch already exists
    branch_exists = False
    if not dry_run:
        # Check local branches
        local_branches = subprocess.run(
            ["git", "branch"],
            capture_output=True, text=True, check=False)
        if local_branches.returncode == 0 and new_branch_name in local_branches.stdout:
            print(
                f"ℹ️  Branch {new_branch_name} already exists locally. Skipping creation.")
            branch_exists = True

        # Check remote branches (only if not found locally)
        if not branch_exists:
            remote_branches = subprocess.run(
                ["git", "branch", "-r"],
                capture_output=True, text=True, check=False)
            if remote_branches.returncode == 0 and f"origin/{new_branch_name}" in remote_branches.stdout:
                print(
                    f"ℹ️  Branch {new_branch_name} already exists on remote. Skipping creation.")
                branch_exists = True
    else:
        print(f"🔍 Would check if branch {new_branch_name} already exists")

    # Only create branch if it doesn't exist
    if not branch_exists and not dry_run:
        create_new_branch(new_branch_name, latest_release, dry_run)
        print(f"✅ Done! Created and pushed: {new_branch_name}")
    elif not dry_run and branch_exists:
        # Branch exists, just checkout to it
        run_git_command(["checkout", new_branch_name])
        print(f"✅ Switched to existing branch: {new_branch_name}")
    elif dry_run:
        create_new_branch(new_branch_name, latest_release, dry_run)
        print(f"🔍 DRY RUN: Would have created and pushed: {new_branch_name}")

    return new_branch_name


def main():
    parser = argparse.ArgumentParser(description="Create release branches")
    parser.add_argument(
        "command", nargs="?", default="minor",
        help="Command to run: 'minor' (default) or 'cpb' (create patch branch)")
    parser.add_argument(
        "--dry", action="store_true",
        help="Show what commands would be run without executing them")
    parser.add_argument(
        "--patch", type=int, default=0,
        help="Patch version number (default: 0)")
    args = parser.parse_args()

    if args.command == "cpb":
        # Create patch branch from latest release
        branch_name = create_patch_branch(args.dry)
    else:
        # Default behavior: create minor release branch
        today = datetime.today()
        minor = f"{today.month}{today.day:02d}"  # e.g. "0815"
        branch_name = f"release/v1.{minor}.{args.patch}"

        if args.dry:
            print(
                f"🔍 DRY RUN: Would create branch: {branch_name} from 'develop'")
        else:
            print(f"📌 Creating branch: {branch_name} from 'develop'")

        run_git_command(["fetch", "origin"], args.dry)

        # Check if branch already exists (both locally and remotely)
        branch_exists = False
        if not args.dry:
            # Check local branches
            local_branches = subprocess.run(
                ["git", "branch"],
                capture_output=True, text=True, check=False)
            if local_branches.returncode == 0 and branch_name in local_branches.stdout:
                print(
                    f"ℹ️  Branch {branch_name} already exists locally. Skipping creation.")
                branch_exists = True

            # Check remote branches (only if not found locally)
            if not branch_exists:
                remote_branches = subprocess.run(
                    ["git", "branch", "-r"],
                    capture_output=True, text=True, check=False)
                if remote_branches.returncode == 0 and f"origin/{branch_name}" in remote_branches.stdout:
                    print(
                        f"ℹ️  Branch {branch_name} already exists on remote. Skipping creation.")
                    branch_exists = True
        else:
            print(f"🔍 Would check if branch {branch_name} already exists")

        # Only create branch if it doesn't exist
        if not branch_exists and not args.dry:
            create_new_branch(branch_name, "develop", args.dry)
            print(f"✅ Done! Created and pushed: {branch_name}")
        elif not args.dry and branch_exists:
            # Branch exists, just checkout to it
            run_git_command(["checkout", branch_name])
            print(f"✅ Switched to existing branch: {branch_name}")
        elif args.dry:
            create_new_branch(branch_name, "develop", args.dry)
            print(f"🔍 DRY RUN: Would have created and pushed: {branch_name}")

    # Ask if user wants to create a PR (for both new and existing branches)
    if args.dry:
        print("🔍 Would ask if you want to create a PR to main")
    else:
        try:
            create_pr = input(
                "\n🔄 Do you want to create a Pull Request to main? (y/N): ").strip().lower()
            if create_pr in ['y', 'yes']:
                print(f"📝 Creating Pull Request from {branch_name} to main...")
                result = subprocess.run(
                    ["gh", "pr", "create", "-B", "main", "--fill"],
                    capture_output=True, text=True, check=False)
                if result.returncode == 0:
                    print("✅ Pull Request created successfully!")
                    print(result.stdout.strip())
                else:
                    print(f"❌ Error creating PR: {result.stderr.strip()}")
            else:
                print("👍 Skipping PR creation.")
        except KeyboardInterrupt:
            print("\n👍 Skipping PR creation.")


if __name__ == "__main__":
    main()
