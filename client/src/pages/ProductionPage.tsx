import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Leaf, Plus, Scissors, Droplets, TreeDeciduous, Sprout, FlaskConical, ScrollText } from 'lucide-react';
import { useAuth } from '../hooks/useAuthHook';
import { useServices } from '../contexts/ServiceContext';
import { PlantDTO, CreatePlantDTO, UpdatePlantDTO, PlantState, HarvestPlantsDTO, ChangeOilStrengthDTO, PlantSearchCriteriaDTO } from '../models/plants/PlantDTO';
import PlantTable from '../components/production/PlantTable';
import PlantModal from '../components/production/PlantModal';
import HarvestModal from '../components/production/HarvestModal';
import ChangeOilStrengthModal from '../components/production/ChangeOilStrengthModal';
import ProductionLog, { LogEntry } from '../components/production/ProductionLog';
import StatsCard from '../components/production/StatsCard';
import SearchFilterBar from '../components/production/SearchFilterBar';
import ConfirmModal from '../components/common/ConfirmModal';
import { AuditLogDTO } from '../models/audit/AuditLogDTO';

const PRODUCTION_MICROSERVICE = 'proizvodnja';

const mapLogLevelToEntryType = (level: AuditLogDTO['tip_zapisa']): LogEntry['type'] => {
  const normalized = String(level ?? '').toLowerCase();

  if (normalized === 'error') return 'error';
  if (normalized === 'warning') return 'warning';
  if (normalized === 'success') return 'success';
  return 'info';
};

const formatTimestampToTime = (timestamp: string): string => {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return '--:--';
  }

  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const toLogEntry = (auditLog: AuditLogDTO): LogEntry => ({
  id: auditLog.id,
  time: formatTimestampToTime(auditLog.datum_vreme),
  message: auditLog.opis,
  type: mapLogLevelToEntryType(auditLog.tip_zapisa),
});

export const ProductionPage: React.FC = () => {
  const { token } = useAuth();
  const { plantAPI, auditAPI } = useServices();
  
  // State for plants data
  const [plants, setPlants] = useState<PlantDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for modals
  const [isPlantModalOpen, setIsPlantModalOpen] = useState(false);
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
  const [isOilStrengthModalOpen, setIsOilStrengthModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<PlantDTO | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<PlantSearchCriteriaDTO>({});
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<PlantSearchCriteriaDTO['sortBy']>('createdAt');
  const [sortDirection, setSortDirection] = useState<PlantSearchCriteriaDTO['sortDirection']>('DESC');
  
  // State for logs
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);

  const fetchPlants = useCallback(async () => {
    if (!token) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const criteria: PlantSearchCriteriaDTO = {
        ...filters,
        searchTerm: searchTerm || undefined,
        sortBy,
        sortDirection,
      };

      const data = await plantAPI.searchPlants(criteria, token);
      setPlants(data);
    } catch (err) {
      setError('Greska pri ucitavanju biljaka');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [plantAPI, token, filters, searchTerm, sortBy, sortDirection]);

  const fetchProductionLogs = useCallback(async () => {
    if (!token) {
      setLogs([]);
      return;
    }

    setLogsLoading(true);
    setLogsError(null);

    try {
      const auditLogs = await auditAPI.searchLogs({ mikroservis: PRODUCTION_MICROSERVICE }, token);
      const sortedLogs = [...auditLogs].sort(
        (first, second) => new Date(second.datum_vreme).getTime() - new Date(first.datum_vreme).getTime()
      );
      setLogs(sortedLogs.map(toLogEntry));
    } catch (err) {
      setLogsError('Greska pri ucitavanju dnevnika');
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  }, [auditAPI, token]);

  useEffect(() => {
    fetchPlants();
    fetchProductionLogs();
  }, [fetchPlants, fetchProductionLogs]);

  // Filter and search plants
  const filteredPlants = plants;

  // Calculate statistics
  const stats = useMemo(() => {
    const total = plants.length;
    const planted = plants.filter(p => p.state === PlantState.PLANTED).length;
    const harvested = plants.filter(p => p.state === PlantState.HARVESTED).length;
    const processed = plants.filter(p => p.state === PlantState.PROCESSED).length;
    return { total, planted, harvested, processed };
  }, [plants]);

  // Handle plant creation/update
  const handleSavePlant = async (data: CreatePlantDTO | UpdatePlantDTO) => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      if (selectedPlant) {
        await plantAPI.updatePlant(selectedPlant.id, data as PlantDTO, token);
      } else {
        await plantAPI.createPlant(data as PlantDTO, token);
      }
      await fetchPlants();
      await fetchProductionLogs();
      setIsPlantModalOpen(false);
      setSelectedPlant(null);
    } catch (err) {
      setError('Greska pri cuvanju biljke');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle plant deletion
  const handleDeletePlant = async () => {
    if (!token || !selectedPlant) return;
    setIsSubmitting(true);
    try {
      await plantAPI.deletePlant(selectedPlant.id, token);
      await fetchPlants();
      await fetchProductionLogs();
      setIsDeleteModalOpen(false);
      setSelectedPlant(null);
    } catch (err) {
      setError('Greska pri brisanju biljke');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle harvest
  const handleHarvest = async (data: HarvestPlantsDTO) => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      await plantAPI.harvestPlants(data, token);
      await fetchPlants();
      await fetchProductionLogs();
      setIsHarvestModalOpen(false);
    } catch (err) {
      setError('Greska pri berbi biljaka');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle oil strength change
  const handleOilStrengthChange = async (data: ChangeOilStrengthDTO) => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      await plantAPI.changeOilStrength(data, token);
      await fetchPlants();
      await fetchProductionLogs();
      setIsOilStrengthModalOpen(false);
    } catch (err) {
      setError('Greska pri promeni jacine ulja');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit click
  const handleEditClick = (plant: PlantDTO) => {
    setSelectedPlant(plant);
    setIsPlantModalOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (plant: PlantDTO) => {
    setSelectedPlant(plant);
    setIsDeleteModalOpen(true);
  };

  // Handle add new plant
  const handleAddClick = () => {
    setSelectedPlant(null);
    setIsPlantModalOpen(true);
  };

  return (
    <div className="production-page">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-header__title">Proizvodnja</h1>
        <p className="page-header__subtitle">Upravljanje biljkama i proizvodnim procesima</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatsCard 
          icon={<TreeDeciduous size={24} />}
          value={stats.total}
          label="Ukupno biljaka"
        />
        <StatsCard 
          icon={<Sprout size={24} />}
          value={stats.planted}
          label="Posadjene"
        />
        <StatsCard 
          icon={<Scissors size={24} />}
          value={stats.harvested}
          label="Ubrane"
        />
        <StatsCard 
          icon={<FlaskConical size={24} />}
          value={stats.processed}
          label="Preradjene"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid--production">
        {/* Plants Table Section */}
        <div className="card">
          <div className="card__header">
            <h2 className="card__title">
              <Leaf size={20} className="card__title-icon" />
              Upravljanje biljkama
            </h2>
            <div className="card__actions">
              <button className="btn btn--secondary" onClick={() => setIsHarvestModalOpen(true)}>
                <Scissors size={16} />
                Uberi biljku
              </button>
              <button className="btn btn--secondary" onClick={() => setIsOilStrengthModalOpen(true)}>
                <Droplets size={16} />
                Promeni jacinu
              </button>
              <button className="btn btn--primary" onClick={handleAddClick}>
                <Plus size={16} />
                Zasadi biljku
              </button>
            </div>
          </div>
          <div className="card__body">
            <SearchFilterBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filters={filters}
              onFilterChange={setFilters}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
            />
            
            {error ? (
              <div className="empty-state">
                <p className="text-error">{error}</p>
                <button className="btn btn--primary mt-md" onClick={fetchPlants}>
                  Pokusaj ponovo
                </button>
              </div>
            ) : (
              <PlantTable
                plants={filteredPlants}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                isLoading={isLoading}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSortChange={(column, direction) => {
                  setSortBy(column);
                  setSortDirection(direction);
                }}
              />
            )}
          </div>
          <div className="card__footer">
            <span className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
              Prikazano {plants.length} biljaka
            </span>
          </div>
        </div>

        {/* Production Log Section */}
        <div className="card">
          <div className="card__header">
            <h2 className="card__title">
              <ScrollText size={20} className="card__title-icon" />
              Dnevnik proizvodnje
            </h2>
          </div>
          <div className="card__body" style={{ padding: 0 }}>
            {logsError ? (
              <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                <p className="text-error">{logsError}</p>
                <button className="btn btn--secondary mt-md" onClick={fetchProductionLogs}>
                  Osvezi dnevnik
                </button>
              </div>
            ) : (
              <ProductionLog logs={logs} isLoading={logsLoading} />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <PlantModal
        isOpen={isPlantModalOpen}
        onClose={() => {
          setIsPlantModalOpen(false);
          setSelectedPlant(null);
        }}
        onSave={handleSavePlant}
        plant={selectedPlant}
        isLoading={isSubmitting}
      />

      <HarvestModal
        isOpen={isHarvestModalOpen}
        onClose={() => setIsHarvestModalOpen(false)}
        onHarvest={handleHarvest}
        availablePlants={plants}
        isLoading={isSubmitting}
      />

      <ChangeOilStrengthModal
        isOpen={isOilStrengthModalOpen}
        onClose={() => setIsOilStrengthModalOpen(false)}
        onChange={handleOilStrengthChange}
        availablePlants={plants}
        isLoading={isSubmitting}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedPlant(null);
        }}
        onConfirm={handleDeletePlant}
        title="Obrisi biljku"
        message={`Da li ste sigurni da zelite da obrisete biljku "${selectedPlant?.commonName}"? Ova akcija se ne moze ponistiti.`}
        confirmText="Obrisi"
        cancelText="Otkazi"
        isLoading={isSubmitting}
        variant="danger"
      />
    </div>
  );
};

export default ProductionPage;
