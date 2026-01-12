import { RunSimulationDTO } from "../../Domain/DTOs/RunSimulationDTO";

export interface ValidationResult {
    success: boolean;
    message?: string;
}

export function validateRunSimulation(data: RunSimulationDTO): ValidationResult {
    //provera da li podaci postoje
    if(!data){     
        return { success: false, message: "Podaci za simulaciju su obavezni."};
    }

    //provera da li je naziv prazan string i da li postoji
    if(!data.naziv || data.naziv.trim().length === 0){
        return { success: false, message: "Naziv je obavezan."};
    }

    //provera za tip algoritma
    const moguciTipovi = ["distributivni_centar", "magacinski_centar"];
    if(!data.tip_algoritma || !moguciTipovi.includes(data.tip_algoritma)){
        return { success: false, message: "Tip algoritma mora biti distributivni_centar ili magacinski_centar."};
    }

    return {success: true};
}

