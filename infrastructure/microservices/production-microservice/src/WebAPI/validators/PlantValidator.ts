import { CreatePlantDTO } from "../../Domain/DTOs/CreatePlantDTO";
import { UpdatePlantDTO } from "../../Domain/DTOs/UpdatePlantDTO";
import { ChangeOilStrengthDTO } from "../../Domain/DTOs/ChangeOilStrengthDTO";
import { HarvestPlantsDTO } from "../../Domain/DTOs/HarvestPlantsDTO";
import { PlantState } from "../../Domain/enums/PlantState";

export interface ValidationResult {
  success: boolean;
  message?: string;
}

export function validateCreatePlantData(data: CreatePlantDTO): ValidationResult {
  if (!data.commonName || data.commonName.trim().length < 2) {
    return { success: false, message: "Opsti naziv mora imati najmanje 2 karaktera" };
  }

  if (!data.latinName || data.latinName.trim().length < 2) {
    return { success: false, message: "Latinski naziv mora imati najmanje 2 karaktera" };
  }

  if (!data.countryOfOrigin || data.countryOfOrigin.trim().length < 2) {
    return { success: false, message: "Zemlja porekla mora imati najmanje 2 karaktera" };
  }

  if (data.oilStrength !== undefined) {
    if (data.oilStrength < 1.0 || data.oilStrength > 5.0) {
      return { success: false, message: "Jacina aromaticnih ulja mora biti izmedju 1.0 i 5.0" };
    }
  }

  return { success: true };
}

export function validateUpdatePlantData(data: UpdatePlantDTO): ValidationResult {
  if (data.commonName !== undefined && data.commonName.trim().length < 2) {
    return { success: false, message: "Opsti naziv mora imati najmanje 2 karaktera" };
  }

  if (data.latinName !== undefined && data.latinName.trim().length < 2) {
    return { success: false, message: "Latinski naziv mora imati najmanje 2 karaktera" };
  }

  if (data.countryOfOrigin !== undefined && data.countryOfOrigin.trim().length < 2) {
    return { success: false, message: "Zemlja porekla mora imati najmanje 2 karaktera" };
  }

  if (data.oilStrength !== undefined) {
    if (data.oilStrength < 1.0 || data.oilStrength > 5.0) {
      return { success: false, message: "Jacina aromaticnih ulja mora biti izmedju 1.0 i 5.0" };
    }
  }

  if (data.state !== undefined && !Object.values(PlantState).includes(data.state)) {
    return { success: false, message: "Nevalidno stanje biljke" };
  }

  return { success: true };
}

export function validateChangeOilStrengthData(data: ChangeOilStrengthDTO): ValidationResult {
  if (!data.plantId || data.plantId <= 0) {
    return { success: false, message: "ID biljke mora biti pozitivan broj" };
  }

  if (data.percentageChange === undefined || data.percentageChange === null) {
    return { success: false, message: "Procenat promene je obavezan" };
  }

  if (data.percentageChange < -100 || data.percentageChange > 500) {
    return { success: false, message: "Procenat promene mora biti izmedju -100 i 500" };
  }

  return { success: true };
}

export function validateHarvestPlantsData(data: HarvestPlantsDTO): ValidationResult {
  if (!data.commonName || data.commonName.trim().length < 2) {
    return { success: false, message: "Opsti naziv mora imati najmanje 2 karaktera" };
  }

  if (!data.quantity || data.quantity <= 0) {
    return { success: false, message: "Kolicina mora biti pozitivan broj" };
  }

  if (!Number.isInteger(data.quantity)) {
    return { success: false, message: "Kolicina mora biti ceo broj" };
  }

  return { success: true };
}