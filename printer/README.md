# Printer Modules
These Files handle printing, from rendering the page to creating a page. The functionality uses the build in electron function `webContents.printToPDF()`. This means that the program doesn't actually print the data, but rather generate a PDF files and open them in the configured PDF viewer for the client. Here is how I came to this.
1. I first tried to use the `webContents.print()` method, but that is very limited in what it can do, does not preview the page before printing and does not provide a callback when finished, which complicates thinds.
2. Next, I tried to use the `webContents.printToPDF()` and print the file from the program using the `node-printer` and `pdfium` npm libraries, however pdfium failed to build when install and hasn't been updated ina while. Several other users online expressed this issue as well.
3. Finally, I decided to just open the file after generating the PDF instead of attempting to print it. The advantage of this to the client is being able to have a choice of what to do with opened PDF files as determined by their set pdf viewer. Also, that solves the problem of not being able to preview the file before printing.

The system works by creating a hidden electron window, filling it with the data as html, then printing the window contents to a PDF and closing it afterwords. 

## Files
* `css`: Folder containing css files for a modified version of skeleton css for use with rendering data for printing. I chose skeleton because of it's simplicity.
* `printer.html`: File to be loaded in the hidden window, calls the "PrintRenderer.ts" script.
* `PrintHandler`: Script in charge of creating the hidden window and printing it's contents.
* `PrintRenderer.ts`: Take data to print and convert it into html recursively.
* `RenderData.d.ts`: Type definitions for data to be printed.