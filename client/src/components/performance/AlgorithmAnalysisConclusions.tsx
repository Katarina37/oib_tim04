import React from "react";
import { Lightbulb, Info, Zap } from "lucide-react";
import { PerformanceReportDTO } from "../../models/performance/PerformanceReportDTO";

interface AlgorithmAnalysisConclusionsProps {
    // Prosleđujemo selektovani izveštaj iz tabele
    selectedReport: PerformanceReportDTO | null;
}

const AlgorithmAnalysisConclusions: React.FC<AlgorithmAnalysisConclusionsProps> = ({ selectedReport }) => {
    
    // Ako korisnik još nije kliknuo na neki red u tabeli
    if (!selectedReport) {
        return (
            <div className="bg-background border border-dashed border-border rounded-lg p-8 text-center">
                <div className="flex justify-center mb-3 text-text-muted opacity-20">
                    <Info size={40} />
                </div>
                <p className="text-sm text-text-muted italic">
                    Izaberite simulaciju iz tabele da biste videli detaljne zaključke analize.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2">
            {/* Zaglavlje kartice */}
            <div className="bg-primary/5 border-b border-border px-4 py-3 flex items-center gap-2">
                <Lightbulb size={18} className="text-primary" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-main">
                    Zaključak analize: {selectedReport.naziv}
                </h4>
            </div>

            {/* Sadržaj zaključka */}
            <div className="p-5">
                <blockquote className="border-l-4 border-primary/30 pl-4 py-1 mb-4">
                    <p className="text-sm text-text-secondary leading-relaxed italic">
                        "{selectedReport.zakljucci}"
                    </p>
                </blockquote>

                {/* Brze statistike unutar zaključka */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-background p-3 rounded-md border border-border">
                        <span className="text-[10px] text-text-muted uppercase font-bold block mb-1 tracking-tighter">
                            Brzina procesiranja
                        </span>
                        <div className="flex items-center gap-2 text-primary">
                            <Zap size={14} />
                            <span className="font-bold text-sm">{selectedReport.brzina_obrade} amb/s</span>
                        </div>
                    </div>
                    
                    <div className="bg-background p-3 rounded-md border border-border">
                        <span className="text-[10px] text-text-muted uppercase font-bold block mb-1 tracking-tighter">
                            Ukupna efikasnost
                        </span>
                        <div className="text-success font-bold text-sm">
                            {selectedReport.efikasnost_procenat}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Futerić sa dodatnim info */}
            <div className="bg-background/50 px-4 py-2 border-t border-border flex justify-between items-center text-[10px] text-text-muted">
                <span>Tip: {selectedReport.tip_algoritma.replace('_', ' ')}</span>
                <span>Datum: {new Date(selectedReport.datum_kreiranja).toLocaleDateString()}</span>
            </div>
        </div>
    );
};

export default AlgorithmAnalysisConclusions;


