export interface RecommendationResponseDTO {
    korisnikId: number;
    preporuke: Array<{
        parfemId: number;
        naziv: string;
        tipPreporuke: string;
        objasnjenje?: string; 
    }>;
    generisanDatum: Date;
}