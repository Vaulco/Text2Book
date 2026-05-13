# Removes empty lines unless the next line contains "Chapter"

input_file = "input.txt"
output_file = "output.txt"

with open(input_file, "r", encoding="utf-8") as f:
    lines = f.readlines()

result = []

for i, line in enumerate(lines):
    # Check if the line is empty
    if line.strip() == "":
        # Keep it only if the next line contains "Chapter"
        if i + 1 < len(lines) and "Chapter" in lines[i + 1]:
            result.append(line)
    else:
        result.append(line)

with open(output_file, "w", encoding="utf-8") as f:
    f.writelines(result)

print("Done.")