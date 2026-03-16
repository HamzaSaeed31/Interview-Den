import os
import json
from pathlib import Path

def rename_files_in_folder(folder_path, prefix="file", start_number=1, dry_run=True):
    """
    Rename all JSON files in a folder with sequential numbering
    
    Args:
        folder_path: Path to folder containing JSON files
        prefix: Prefix for renamed files (e.g., 'resume', 'job')
        start_number: Starting number for sequential naming
        dry_run: If True, only shows what would be renamed without actually renaming
    """
    
    folder = Path(folder_path)
    
    if not folder.exists():
        print(f"Error: Folder '{folder_path}' does not exist!")
        return
    
    # Get all JSON files
    json_files = sorted(folder.glob("*.json"))
    
    if len(json_files) == 0:
        print(f"No JSON files found in '{folder_path}'")
        return
    
    print("="*60)
    print(f"Files in: {folder_path}")
    print(f"Total files: {len(json_files)}")
    print("="*60)
    
    if dry_run:
        print("\n[DRY RUN MODE - No files will be renamed]")
    
    print("\nRename plan:")
    print("-"*60)
    
    rename_map = []
    
    for idx, old_path in enumerate(json_files):
        new_number = start_number + idx
        new_name = f"{prefix}_{new_number}.json"
        new_path = folder / new_name
        
        # Check if new name already exists
        if new_path.exists() and new_path != old_path:
            print(f"⚠ Warning: {new_name} already exists!")
            continue
        
        rename_map.append((old_path, new_path))
        print(f"{idx+1}. {old_path.name:50} → {new_name}")
    
    print("-"*60)
    
    if dry_run:
        print("\nThis was a DRY RUN. No files were renamed.")
        print("To actually rename files, run with --execute flag")
        return
    
    # Confirm before renaming
    print(f"\nReady to rename {len(rename_map)} files.")
    confirm = input("Proceed with renaming? (yes/no): ").strip().lower()
    
    if confirm != 'yes':
        print("Renaming cancelled.")
        return
    
    # Perform renaming
    print("\nRenaming files...")
    successful = 0
    failed = 0
    
    for old_path, new_path in rename_map:
        try:
            old_path.rename(new_path)
            print(f"✓ Renamed: {old_path.name} → {new_path.name}")
            successful += 1
        except Exception as e:
            print(f"✗ Failed: {old_path.name} - {e}")
            failed += 1
    
    print("\n" + "="*60)
    print(f"Renaming complete!")
    print(f"  Successful: {successful}")
    print(f"  Failed: {failed}")
    print("="*60)

def rename_with_content_info(folder_path, prefix="file", extract_field=None, dry_run=True):
    """
    Rename files based on content inside JSON (e.g., job title, name)
    
    Args:
        folder_path: Path to folder containing JSON files
        prefix: Prefix for renamed files
        extract_field: Field to extract from JSON (e.g., 'job_title', 'Name')
        dry_run: If True, only shows what would be renamed
    """
    
    folder = Path(folder_path)
    
    if not folder.exists():
        print(f"Error: Folder '{folder_path}' does not exist!")
        return
    
    json_files = sorted(folder.glob("*.json"))
    
    if len(json_files) == 0:
        print(f"No JSON files found in '{folder_path}'")
        return
    
    print("="*60)
    print(f"Files in: {folder_path}")
    print(f"Total files: {len(json_files)}")
    print("="*60)
    
    if dry_run:
        print("\n[DRY RUN MODE - No files will be renamed]")
    
    print("\nRename plan:")
    print("-"*60)
    
    rename_map = []
    
    for idx, old_path in enumerate(json_files):
        try:
            with open(old_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Try to extract meaningful name from JSON
            extracted_name = None
            
            if extract_field:
                # Try to get the specified field
                if extract_field in data:
                    extracted_name = str(data[extract_field])
            
            # If no field specified or not found, use number
            if not extracted_name:
                extracted_name = str(idx + 1)
            
            # Clean the name (remove special characters)
            import re
            clean_name = re.sub(r'[^\w\s-]', '', extracted_name)
            clean_name = clean_name.replace(' ', '_').lower()
            
            # Limit length
            if len(clean_name) > 50:
                clean_name = clean_name[:50]
            
            new_name = f"{prefix}_{clean_name}.json"
            new_path = folder / new_name
            
            # Handle duplicates
            counter = 1
            while new_path.exists() and new_path != old_path:
                new_name = f"{prefix}_{clean_name}_{counter}.json"
                new_path = folder / new_name
                counter += 1
            
            rename_map.append((old_path, new_path))
            print(f"{idx+1}. {old_path.name:50} → {new_name}")
            
        except Exception as e:
            print(f"⚠ Error reading {old_path.name}: {e}")
            continue
    
    print("-"*60)
    
    if dry_run:
        print("\nThis was a DRY RUN. No files were renamed.")
        print("To actually rename files, run with --execute flag")
        return
    
    # Confirm and rename
    print(f"\nReady to rename {len(rename_map)} files.")
    confirm = input("Proceed with renaming? (yes/no): ").strip().lower()
    
    if confirm != 'yes':
        print("Renaming cancelled.")
        return
    
    print("\nRenaming files...")
    successful = 0
    failed = 0
    
    for old_path, new_path in rename_map:
        try:
            old_path.rename(new_path)
            print(f"✓ Renamed: {old_path.name} → {new_path.name}")
            successful += 1
        except Exception as e:
            print(f"✗ Failed: {old_path.name} - {e}")
            failed += 1
    
    print("\n" + "="*60)
    print(f"Renaming complete!")
    print(f"  Successful: {successful}")
    print(f"  Failed: {failed}")
    print("="*60)

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Rename JSON files in a folder")
    parser.add_argument("folder",
                       help="Folder containing JSON files to rename")
    parser.add_argument("-p", "--prefix",
                       default="file",
                       help="Prefix for renamed files (default: file)")
    parser.add_argument("-s", "--start",
                       type=int,
                       default=1,
                       help="Starting number (default: 1)")
    parser.add_argument("--execute",
                       action="store_true",
                       help="Actually rename files (without this, it's a dry run)")
    parser.add_argument("--use-content",
                       action="store_true",
                       help="Use content from JSON for naming")
    parser.add_argument("--field",
                       help="JSON field to extract for naming (e.g., 'job_title', 'Name')")
    
    args = parser.parse_args()
    
    dry_run = not args.execute
    
    if args.use_content:
        rename_with_content_info(
            args.folder, 
            prefix=args.prefix, 
            extract_field=args.field,
            dry_run=dry_run
        )
    else:
        rename_files_in_folder(
            args.folder, 
            prefix=args.prefix, 
            start_number=args.start,
            dry_run=dry_run
        )

if __name__ == "__main__":
    main()