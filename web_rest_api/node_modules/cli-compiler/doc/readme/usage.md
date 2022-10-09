## Usage

The compiler executes the following phases:

1. Create or initialize a `Program` instance or subclass (create).
2. Load and execute library modules (libs).
3. Gather source files to merge with parsed program data (sources).
4. Load and concatenate markdown input files (cat).
5. Parse markdown document to tokens (parse).
6. Render markdown tokens into program definition (render).
7. Replace variables in the program strings (replace).
8. Transform the program definition to a module (transform).
9. Write the transformed javascript module to a file (write).
10. Print the javascript document (print).
