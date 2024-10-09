#!/bin/bash

# Find all files named handler.py recursively
find . -type f -name "handler.py" | while read -r file; do
  # Check if the first line starts with "# force build comment"
  first_line=$(head -n 1 "$file")
  if [[ "$first_line" == "# force build comment"* ]]; then
    # Generate a random 10-digit number using awk
    random_number=$(awk 'BEGIN{srand(); print int(1000000000 + rand() * 9000000000)}')
    
    # Create a temporary file
    tmp_file=$(mktemp)
    
    # Add the new comment with the random number to the temporary file
    echo "# force build comment $random_number" > "$tmp_file"
    
    # Append the rest of the original file to the temporary file
    tail -n +2 "$file" >> "$tmp_file"
    
    # Replace the original file with the temporary file
    mv "$tmp_file" "$file"
  fi
done