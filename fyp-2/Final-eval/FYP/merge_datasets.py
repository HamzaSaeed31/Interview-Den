import pandas as pd
import os

def normalize_skills(skills_text):
    """Normalize skills text for comparison"""
    if pd.isna(skills_text):
        return ""
    
    skills_str = str(skills_text).lower().strip()
    # Remove extra spaces and normalize separators
    skills_str = skills_str.replace(';', ',').replace('  ', ' ')
    return skills_str

def merge_datasets_by_skills(original_file, shortlisted_file, output_file="Complete_Job_Dataset.xlsx"):
    """
    Merge original dataset with shortlisted dataset by matching on Skills column
    
    Args:
        original_file: Path to original complete dataset
        shortlisted_file: Path to shortlisted dataset
        output_file: Path to save the merged dataset
    """
    
    print("="*60)
    print("Reading datasets...")
    print("="*60)
    
    # Read original dataset
    print(f"\nReading original dataset: {original_file}")
    df_original = pd.read_excel(original_file, header=None)
    
    print(f"  Rows: {len(df_original)}")
    print(f"  Columns: {len(df_original.columns)}")
    print(f"\n  Sample first row:")
    for i, val in enumerate(df_original.iloc[0].tolist()[:8]):
        print(f"    Column {i}: {str(val)[:60]}...")
    
    # Read shortlisted dataset
    print(f"\nReading shortlisted dataset: {shortlisted_file}")
    df_shortlisted = pd.read_excel(shortlisted_file, header=None)
    
    print(f"  Rows: {len(df_shortlisted)}")
    print(f"  Columns: {len(df_shortlisted.columns)}")
    print(f"\n  Sample first row:")
    for i, val in enumerate(df_shortlisted.iloc[0].tolist()):
        print(f"    Column {i}: {str(val)[:60]}...")
    
    print("\n" + "="*60)
    print("Determining Skills column position...")
    print("="*60)
    
    # Ask user which column is skills in each dataset
    print("\nIn the SHORTLISTED dataset, which column number contains Skills?")
    print("(Looking at the sample above, count from 0)")
    shortlisted_skills_col = input("Enter column number (usually 3): ").strip()
    shortlisted_skills_col = int(shortlisted_skills_col) if shortlisted_skills_col else 3
    
    print("\nIn the ORIGINAL dataset, which column number contains Skills?")
    print("(Looking at the sample above, count from 0)")
    original_skills_col = input("Enter column number (usually 3): ").strip()
    original_skills_col = int(original_skills_col) if original_skills_col else 3
    
    print(f"\nUsing column {shortlisted_skills_col} for shortlisted skills")
    print(f"Using column {original_skills_col} for original skills")
    
    print("\n" + "="*60)
    print("Matching rows by skills...")
    print("="*60)
    
    # Create merged dataframe
    merged_rows = []
    matched_count = 0
    unmatched_count = 0
    
    for idx in range(len(df_shortlisted)):
        row_short = df_shortlisted.iloc[idx]
        
        # Get skills from shortlisted
        skills_short = normalize_skills(row_short[shortlisted_skills_col])
        job_title = str(row_short[0]).strip()
        
        # Try to find matching row in original by skills
        matching_row = None
        for orig_idx in range(len(df_original)):
            orig_skills = normalize_skills(df_original.iloc[orig_idx][original_skills_col])
            
            # Match if skills are identical
            if skills_short and orig_skills and skills_short == orig_skills:
                matching_row = df_original.iloc[orig_idx]
                break
        
        if matching_row is not None:
            # Build merged row: all shortlisted columns + extra columns from original
            merged_row = list(row_short.values)
            
            # Add columns that come AFTER skills in original (responsibilities, keywords, etc.)
            num_shortlisted_cols = len(row_short)
            
            # Add all columns after the skills column from original
            for col_idx in range(original_skills_col + 1, len(matching_row)):
                merged_row.append(matching_row[col_idx])
            
            merged_rows.append(merged_row)
            matched_count += 1
            
            if matched_count % 10 == 0:
                print(f"  Matched {matched_count} rows...")
        else:
            # No match found, add empty values for missing columns
            merged_row = list(row_short.values)
            
            # Add empty placeholders for responsibilities and keywords
            num_extra_cols = len(df_original.columns) - original_skills_col - 1
            merged_row.extend(["Not found"] * num_extra_cols)
            
            merged_rows.append(merged_row)
            unmatched_count += 1
            print(f"  ✗ No match for: {job_title} (Skills: {str(row_short[shortlisted_skills_col])[:40]}...)")
    
    print(f"\n  ✓ Successfully matched: {matched_count}")
    print(f"  ✗ No match found: {unmatched_count}")
    
    # Create merged dataframe
    # Determine max columns
    max_cols = max(len(row) for row in merged_rows) if merged_rows else 0
    
    # Pad rows to same length
    for row in merged_rows:
        while len(row) < max_cols:
            row.append("")
    
    df_merged = pd.DataFrame(merged_rows)
    
    # Add column names
    column_names = []
    num_cols = len(df_merged.columns)
    
    # Base columns from shortlisted
    base_names = ['Job Title', 'Experience Level', 'Years', 'Skills']
    
    for i in range(num_cols):
        if i < len(base_names):
            column_names.append(base_names[i])
        elif i == len(base_names):
            column_names.append('Responsibilities')
        elif i == len(base_names) + 1:
            column_names.append('Keywords')
        else:
            column_names.append(f'Extra_Column_{i - len(base_names) - 1}')
    
    df_merged.columns = column_names
    
    # Save merged dataset
    print("\n" + "="*60)
    print(f"Saving merged dataset to: {output_file}")
    print("="*60)
    
    df_merged.to_excel(output_file, index=False)
    
    print(f"\n✓ Complete dataset saved!")
    print(f"  Total rows: {len(df_merged)}")
    print(f"  Total columns: {len(df_merged.columns)}")
    print(f"  Columns: {list(df_merged.columns)}")
    print(f"  Matched: {matched_count}")
    print(f"  Unmatched: {unmatched_count}")
    print("="*60)
    
    return df_merged

def auto_detect_and_merge(original_file, shortlisted_file, output_file="Complete_Job_Dataset.xlsx"):
    """Auto-detect skills column and merge (assumes both have skills in column 3)"""
    
    print("="*60)
    print("Auto-detecting and merging...")
    print("="*60)
    
    # Read datasets
    df_original = pd.read_excel(original_file, header=None)
    df_shortlisted = pd.read_excel(shortlisted_file, header=None)
    
    print(f"Original: {len(df_original)} rows, {len(df_original.columns)} columns")
    print(f"Shortlisted: {len(df_shortlisted)} rows, {len(df_shortlisted.columns)} columns")
    
    # Assume skills are in column 3 (4th column) for both
    skills_col = 3
    
    print(f"\nAssuming skills are in column {skills_col} (0-indexed)")
    print("Matching rows...\n")
    
    merged_rows = []
    matched = 0
    unmatched = 0
    
    for idx in range(len(df_shortlisted)):
        row_short = df_shortlisted.iloc[idx]
        skills_short = normalize_skills(row_short[skills_col])
        
        # Find match in original
        matching_row = None
        for orig_idx in range(len(df_original)):
            orig_skills = normalize_skills(df_original.iloc[orig_idx][skills_col])
            if skills_short and orig_skills and skills_short == orig_skills:
                matching_row = df_original.iloc[orig_idx]
                break
        
        merged_row = list(row_short.values)
        
        if matching_row is not None:
            # Add columns after skills from original
            for col_idx in range(skills_col + 1, len(matching_row)):
                merged_row.append(matching_row[col_idx])
            matched += 1
        else:
            # Add placeholders
            num_extra = len(df_original.columns) - skills_col - 1
            merged_row.extend(["Not found"] * num_extra)
            unmatched += 1
        
        merged_rows.append(merged_row)
        
        if (idx + 1) % 50 == 0:
            print(f"  Processed {idx + 1}/{len(df_shortlisted)} rows...")
    
    # Create dataframe
    max_cols = max(len(row) for row in merged_rows)
    for row in merged_rows:
        while len(row) < max_cols:
            row.append("")
    
    df_merged = pd.DataFrame(merged_rows)
    
    # Column names
    column_names = ['Job Title', 'Experience Level', 'Years', 'Skills']
    for i in range(4, len(df_merged.columns)):
        if i == 4:
            column_names.append('Responsibilities')
        elif i == 5:
            column_names.append('Keywords')
        else:
            column_names.append(f'Column_{i}')
    
    df_merged.columns = column_names
    
    # Save
    df_merged.to_excel(output_file, index=False)
    
    print(f"\n{'='*60}")
    print(f"✓ Merged dataset saved: {output_file}")
    print(f"  Total rows: {len(df_merged)}")
    print(f"  Matched: {matched}")
    print(f"  Unmatched: {unmatched}")
    print(f"  Columns: {list(df_merged.columns)}")
    print(f"{'='*60}")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Merge job datasets by matching on skills column")
    parser.add_argument("--original", 
                       required=True,
                       help="Path to original complete dataset")
    parser.add_argument("--shortlisted",
                       required=True,
                       help="Path to shortlisted dataset")
    parser.add_argument("-o", "--output",
                       default="Complete_Job_Dataset.xlsx",
                       help="Output file path")
    parser.add_argument("--auto",
                       action="store_true",
                       help="Auto-detect skills column (assumes column 3)")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.original):
        print(f"Error: Original file not found: {args.original}")
        return
    
    if not os.path.exists(args.shortlisted):
        print(f"Error: Shortlisted file not found: {args.shortlisted}")
        return
    
    if args.auto:
        auto_detect_and_merge(args.original, args.shortlisted, args.output)
    else:
        merge_datasets_by_skills(args.original, args.shortlisted, args.output)

if __name__ == "__main__":
    main()