import React, {useState} from "react";
import { CreatePerformanceParams } from "../../models/performance/CreatePerformanceParams";

interface Props {
    onRunSimulation: (params: CreatePerformanceParams) => void;
    isLoading: boolean;
}

const PerformanceSimulationForm: React.FC<Props> = ({ onRunSimulation, isLoading }) => {
    const [naziv, setNaziv] = useState("");
    const [tip, setTip] = useState<"distributivni_centar" | "magacinski_centar">("distributivni_centar");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onRunSimulation({ 
            naziv, 
            tip_algoritma: tip 
        });
    };

    return (
        <div className="bg-surface p-5 rounded-lg border border-border mb-6">
            <h4 className="text-sm font-bold mb-4 uppercase">Nova simulacija</h4>
            
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="text-xs text-text-muted mb-1 block">Naziv</label>
                    <input
                        type="text"
                        className="w-full bg-background border border-border rounded px-3 py-2 text-sm outline-none focus:border-primary"
                        value={naziv}
                        onChange={(e) => setNaziv(e.target.value)}
                        required
                    />
                </div>

                <div className="flex-1 w-full">
                    <label className="text-xs text-text-muted mb-1 block">Algoritam</label>
                    <select
                        className="w-full bg-background border border-border rounded px-3 py-2 text-sm outline-none focus:border-primary"
                        value={tip}
                        onChange={(e) => setTip(e.target.value as any)}
                    >
                        <option value="distributivni_centar">Distributivni centar</option>
                        <option value="magacinski_centar">Magacinski centar</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !naziv}
                    className="bg-primary text-white px-6 py-2 rounded font-medium disabled:opacity-50 transition-opacity"
                >
                    {isLoading ? "Pokretanje..." : "Pokreni"}
                </button>
            </form>
        </div>
    );
};

export default PerformanceSimulationForm;
