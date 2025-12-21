from pypdf import PdfReader
import sys

try:
    reader = PdfReader("d:/kripto/projek/s11071-024-10414-3 (2).pdf")
    print(f"Number of Pages: {len(reader.pages)}")
    text_content = ""
    with open("paper_content_2.txt", "w", encoding="utf-8") as f:
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            f.write(f"--- Page {i+1} ---\n")
            f.write(text + "\n")
    print("PDF content written to paper_content.txt")
except Exception as e:
    print(f"Error reading PDF: {e}")
