import pypdf
import re

def extract_text_from_pdf(pdf_path):
    try:
        reader = pypdf.PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        return str(e)

pdf_path = "d:/kripto/projek/s11071-024-10414-3 (2).pdf"
text = extract_text_from_pdf(pdf_path)

# Write to file with utf-8 encoding
with open("d:/kripto/projek/pdf_content.txt", "w", encoding="utf-8") as f:
    f.write(text)

print("Extraction complete. Check pdf_content.txt")
