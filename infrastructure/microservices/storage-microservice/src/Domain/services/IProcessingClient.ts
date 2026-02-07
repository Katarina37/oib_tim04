export interface ProcessingPerfumeDTO {
    id: number;
    name: string;
    type: string;
    netVolumeMl: number;
    serialNumber: string;
    plantId: number;
    expiryDate: string;
}

export interface IProcessingClient {
    requestPerfumesForPackaging(quantity: number): Promise<ProcessingPerfumeDTO[]>;
}
