import PDFDocument from "pdfkit";
import { PerformanceReport } from "../Domain/models/PerformanceReport";

export class PdfService {
    static async generatePerformancePdf(report: PerformanceReport): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try{
                const doc = new PDFDocument();
                const chunks: Buffer[] = [];

                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));

                //zaglavlje
                doc.fontSize(20).text(`IZVESTAJ - ANALIZA PERFORMANSI`, { align: 'center' });
                doc.moveDown();
                doc.fontSize(12).text(`Report ID: ${report.id}`);
                doc.text(`Naziv simulacije: ${report.naziv}`);
                doc.text(`Datum generisanja: ${new Date(report.datum_kreiranja).toLocaleDateString('sr-RS')}`);
                doc.moveDown();

                //sadrzaj
                doc.fontSize(14).text('Podaci izvestaja:', { underline: true });
                doc.moveDown(0.5);

                doc.fontSize(10).text(`Tip algoritma: ${report.tip_algoritma === "distributivni_centar" ? "Distributivni centar" : "Magacinski centar"}`);
                doc.text(`Broj ambalaza po slanju: ${report.broj_ambalaza_po_slanju}`);
                doc.text(`Vreme obrade: ${Number(report.vreme_obrade_sekunde).toFixed(2)} sekundi`);
                doc.text(`Efikasnost: ${Number(report.efikasnost_procenat).toFixed(2)}%`);
                doc.text(`Brzina obrade: ${Number(report.brzina_obrade).toFixed(2)} ambalaza/s`);
        
                doc.moveDown();
                doc.fontSize(12).text('Zakljucak analize:', { underline: true });
                doc.fontSize(10).text(report.zakljucci);
        
                doc.moveDown(2);
                //doc.fontSize(10).text('Ovaj izvestaj je generisan automatski od strane sistema za analizu performansi.', { italic: true });
        
                //donji deo
                doc.moveDown();
                doc.text('Logisticki Centar - Sistem za simulaciju');

                doc.end();

            }catch(error){
                reject(error);
            }
        });
    }

}





