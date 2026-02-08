import PDFDocument from "pdfkit";
import { AlgorithmType } from "../../Domain/enums/AlgorithmType";
import { PerformanceReport } from "../../Domain/models/PerformanceReport";
import { IPdfGenerator } from "../../Domain/services/IPdfGenerator";

export class PdfGenerator implements IPdfGenerator {
  async generate(report: PerformanceReport): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          margin: 48,
          size: "A4",
        });
        const chunks: Buffer[] = [];

        doc.on("data", (chunk: Buffer) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));

        const algorithmLabel =
          report.tipAlgoritma === AlgorithmType.DISTRIBUTION_CENTER
            ? "Distributivni centar"
            : "Magacinski centar";

        doc.fontSize(18).text("IZVESTAJ O ANALIZI PERFORMANSI", { align: "center" });
        doc.moveDown(1);

        doc.fontSize(11);
        doc.text(`ID izvestaja: ${report.id}`);
        doc.text(`Naziv simulacije: ${report.naziv}`);
        doc.text(`Tip algoritma: ${algorithmLabel}`);
        doc.text(`Datum kreiranja: ${report.datumKreiranja.toISOString()}`);
        doc.moveDown(1);

        doc.fontSize(13).text("Ključne metrike", { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11);
        doc.text(`Broj ambalaza po slanju: ${report.brojAmbalazaPoSlanju}`);
        doc.text(`Vreme obrade: ${report.vremeObradeSekunde.toFixed(3)} sekundi`);
        doc.text(`Efikasnost: ${report.efikasnostProcenat.toFixed(2)}%`);
        doc.text(`Brzina obrade: ${report.brzinaObrade.toFixed(3)} amb/s`);
        doc.moveDown(1);

        doc.fontSize(13).text("Detalji simulacije", { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11);
        doc.text(`Broj zahteva: ${report.podaciSimulacije.broj_zahteva}`);
        doc.text(`Broj tura: ${report.podaciSimulacije.broj_tura}`);
        doc.text(
          `Idealno vreme: ${report.podaciSimulacije.idealno_vreme_sekunde.toFixed(3)} sekundi`
        );
        doc.text(
          `Faktor opterecenja: ${report.podaciSimulacije.faktor_opterecenja.toFixed(3)}`
        );
        doc.text(
          `Prosek po turi: ${report.podaciSimulacije.prosek_vreme_po_turi.toFixed(3)} sekundi`
        );
        doc.text(`Preporuka: ${report.podaciSimulacije.preporuka}`);
        doc.moveDown(1);

        doc.fontSize(13).text("Zakljucak", { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).text(report.zakljucci);
        doc.moveDown(2);
        doc.fontSize(9).fillColor("#666666");
        doc.text(
          "Dokument je automatski generisan od strane performance-microservice.",
          {
            align: "left",
          }
        );

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
