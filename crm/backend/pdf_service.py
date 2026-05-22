"""Generate a signing certificate PDF for electronically signed patient forms."""
from datetime import datetime
from typing import List


_PINK = (233, 30, 140)
_DARK = (31, 41, 55)
_GRAY = (107, 114, 128)
_LIGHT = (249, 242, 248)


def generate_signing_certificate(
    patient_name: str,
    signed_at: str,
    signer_ip: str,
    signatures: List[dict],
) -> bytes:
    """
    Returns PDF bytes for a signing certificate listing all signed forms.
    signatures: list of dicts with keys form_title, signer_name
    """
    try:
        from fpdf import FPDF

        class PDF(FPDF):
            def header(self):
                self.set_fill_color(*_PINK)
                self.rect(0, 0, 210, 28, "F")
                self.set_font("Helvetica", "B", 16)
                self.set_text_color(255, 255, 255)
                self.set_xy(0, 8)
                self.cell(0, 10, "Lifeway Programs", align="C", ln=True)
                self.set_font("Helvetica", "", 9)
                self.set_text_color(255, 200, 230)
                self.cell(0, 6, "Electronic Signature Certificate", align="C", ln=True)
                self.ln(6)

            def footer(self):
                self.set_y(-15)
                self.set_font("Helvetica", "I", 8)
                self.set_text_color(*_GRAY)
                self.cell(0, 10, f"Page {self.page_no()} | lifewayprograms.org | Generated {datetime.now().strftime('%Y-%m-%d')}", align="C")

        pdf = PDF()
        pdf.set_auto_page_break(auto=True, margin=20)
        pdf.add_page()
        pdf.set_margins(20, 35, 20)

        # Title
        pdf.set_font("Helvetica", "B", 14)
        pdf.set_text_color(*_DARK)
        pdf.cell(0, 10, "Electronic Signature Certificate", ln=True, align="C")
        pdf.ln(4)

        # Legal notice box
        pdf.set_fill_color(*_LIGHT)
        pdf.set_draw_color(*_PINK)
        pdf.set_line_width(0.5)
        pdf.set_font("Helvetica", "", 8)
        pdf.set_text_color(*_DARK)
        pdf.multi_cell(
            0, 5,
            "This certificate confirms that the following intake forms were electronically signed in accordance with "
            "the Electronic Signatures in Global and National Commerce Act (E-SIGN Act, 15 U.S.C. § 7001 et seq.) "
            "and Florida's Electronic Signature Act (F.S. § 668.001). The electronic signature has the same legal "
            "effect as a handwritten signature.",
            border=1, fill=True, align="J"
        )
        pdf.ln(6)

        # Signer details table
        def row(label, value):
            pdf.set_font("Helvetica", "B", 9)
            pdf.set_text_color(*_GRAY)
            pdf.cell(45, 7, label, ln=False)
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(*_DARK)
            pdf.cell(0, 7, str(value), ln=True)

        pdf.set_font("Helvetica", "B", 10)
        pdf.set_text_color(*_PINK)
        pdf.cell(0, 8, "Signer Information", ln=True)
        pdf.set_draw_color(220, 220, 220)
        pdf.line(20, pdf.get_y(), 190, pdf.get_y())
        pdf.ln(3)

        row("Full Name:", patient_name)
        row("Signed At:", signed_at)
        row("IP Address:", signer_ip or "Not recorded")
        row("Signature Method:", "Typed name — electronic signature")
        pdf.ln(6)

        # Signed forms
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_text_color(*_PINK)
        pdf.cell(0, 8, "Forms Signed", ln=True)
        pdf.set_draw_color(220, 220, 220)
        pdf.line(20, pdf.get_y(), 190, pdf.get_y())
        pdf.ln(3)

        for i, sig in enumerate(signatures, 1):
            # Form row
            pdf.set_fill_color(248, 250, 252) if i % 2 == 0 else pdf.set_fill_color(255, 255, 255)
            pdf.set_font("Helvetica", "B", 9)
            pdf.set_text_color(*_DARK)
            pdf.cell(0, 6, f"{i}. {sig.get('form_title', sig.get('form_filename', 'Unknown'))}", ln=False, fill=True)
            pdf.ln(5)
            pdf.set_font("Helvetica", "I", 8)
            pdf.set_text_color(*_GRAY)
            pdf.set_x(25)
            pdf.cell(0, 5, f"Signed by: {sig.get('signer_name', patient_name)}", ln=True)
            pdf.ln(1)

        pdf.ln(6)

        # Footer statement
        pdf.set_fill_color(240, 253, 244)
        pdf.set_draw_color(187, 247, 208)
        pdf.set_font("Helvetica", "", 8)
        pdf.set_text_color(22, 101, 52)
        pdf.multi_cell(
            0, 5,
            "This document is a legally valid record of electronic consent. To request a copy of any signed form "
            "or to revoke consent, contact Lifeway Programs at jeffrey.tjok@proton.me.",
            border=1, fill=True, align="J"
        )

        return bytes(pdf.output())

    except ImportError:
        print("[pdf] fpdf2 not installed — returning empty bytes")
        return b""
    except Exception as e:
        print(f"[pdf] Generation error: {e}")
        return b""
