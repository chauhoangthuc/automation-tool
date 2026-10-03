from pathlib import Path

lines = [
    "IELTS READING PASSAGE 1",
    "Community Rooftop Gardens",
    "Cities are finding new uses for unused roof space.",
    "A  In 2020, the town of Westbridge opened its first public rooftop garden.",
    "The garden is free to visit and grows tomatoes, beans and herbs.",
    "Volunteers water the plants every Tuesday morning.",
    "B  The council says the garden reduces summer heat in the building below.",
    "No study has yet measured whether it changes winter temperatures.",
    "Questions 1-3",
    "Do the following statements agree with the information given in Reading Passage 1?",
    "Write TRUE, FALSE or NOT GIVEN.",
    "1  Westbridge opened the rooftop garden in 2020.",
    "2  Visitors must pay to enter the garden.",
    "3  The garden makes the building warmer in winter.",
    "ANSWER KEY",
    "1 TRUE   2 FALSE   3 NOT GIVEN",
]


def esc(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


stream = ["BT", "/F1 11 Tf", "50 790 Td"]
for index, line in enumerate(lines):
    if index:
        stream.append("0 -28 Td")
    stream.append(f"({esc(line)}) Tj")
stream.append("ET")
content = "\n".join(stream).encode("ascii")
objects = [
    b"<< /Type /Catalog /Pages 2 0 R >>",
    b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    b"<< /Length %d >>\nstream\n" % len(content) + content + b"\nendstream",
    b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
]
pdf = bytearray(b"%PDF-1.4\n")
offsets = [0]
for number, obj in enumerate(objects, 1):
    offsets.append(len(pdf))
    pdf.extend(f"{number} 0 obj\n".encode())
    pdf.extend(obj)
    pdf.extend(b"\nendobj\n")
xref = len(pdf)
pdf.extend(f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n".encode())
for offset in offsets[1:]:
    pdf.extend(f"{offset:010d} 00000 n \n".encode())
pdf.extend(f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n".encode())
target = Path(__file__).resolve().parent / "fixtures" / "ai-single-passage.pdf"
target.parent.mkdir(parents=True, exist_ok=True)
target.write_bytes(pdf)
print(target)
