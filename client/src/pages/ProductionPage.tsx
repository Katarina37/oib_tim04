import React, { useState, useEffect, useMemo } from 'react';
import { Leaf, Plus, Scissors, Droplets, TreeDeciduous, Sprout, FlaskConical } from 'lucide-react';
import { useAuth } from '../hooks/useAuthHook';
import { PlantAPI } from '../api/plants/PlantAPI';
import { PlantDTO, CreatePlantDTO, UpdatePlantDTO, PlantState, HarvestPlantsDTO, ChangeOilStrengthDTO, PlantSearchCriteriaDTO } from '../models/plants/PlantDTO';
import PlantTable from '../components/production/PlantTable';
import PlantModal from '../components/production/PlantModal';
import HarvestModal from '../components/production/HarvestModal';
import ChangeOilStrengthModal from '../components/production/ChangeOilStrengthModal';
import ProductionLog, { LogEntry } from '../components/production/ProductionLog';
import StatsCard from '../components/production/StatsCard';
import SearchFilterBar from '../components/production/SearchFilterBar';
import ConfirmModal from '../components/common/ConfirmModal';

const plantAPI = new PlantAPI();

export const ProductionPage: React.FC = () => {
  const { token } = useAuth();
  
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
  
  // State for logs
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logsLoading] = useState(false);

  // Fetch plants on mount
  useEffect(() => {
    fetchPlants();
    // Add some sample logs
    setLogs([
      { id: 1, time: '14:23', message: 'Zasadjena biljka: Lavanda', type: 'success' },
      { id: 2, time: '14:28', message: 'Prerada zavrsena: 5 bocica parfema', type: 'success' },
      { id: 3, time: '14:35', message: 'Upozorenje: Jacina ulja prelazi 4.0', type: 'warning' },
      { id: 4, time: '15:10', message: 'Ubrano 10 biljaka vrste Ruza', type: 'info' },
    ]);
  }, []);

  const fetchPlants = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await plantAPI.getAllPlants(token);
      setPlants(data);
    } catch (err) {
      setError('Greska pri ucitavanju biljaka');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and search plants
  const filteredPlants = useMemo(() => {
    return plants.filter(plant => {
      // Search term filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (
          !plant.commonName.toLowerCase().includes(search) &&
          !plant.latinName.toLowerCase().includes(search)
        ) {
          return false;
        }
      }
      
      // State filter
      if (filters.state && plant.state !== filters.state) {
        return false;
      }
      
      // Country filter
      if (filters.countryOfOrigin && 
          !plant.countryOfOrigin.toLowerCase().includes(filters.countryOfOrigin.toLowerCase())) {
        return false;
      }
      
      // Oil strength filters
      if (filters.minOilStrength !== undefined && plant.oilStrength < filters.minOilStrength) {
        return false;
      }
      if (filters.maxOilStrength !== undefined && plant.oilStrength > filters.maxOilStrength) {
        return false;
      }
      
      return true;
    });
  }, [plants, searchTerm, filters]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = plants.length;
    const planted = plants.filter(p => p.state === PlantState.PLANTED).length;
    const harvested = plants.filter(p => p.state === PlantState.HARVESTED).length;
    const processed = plants.filter(p => p.state === PlantState.PROCESSED).length;
    return { total, planted, harvested, processed };
  }, [plants]);

  // Add log entry
  const addLog = (message: string, type: LogEntry['type']) => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setLogs(prev => [{ id: Date.now(), time, message, type }, ...prev]);
  };

  // Handle plant creation/update
  const handleSavePlant = async (data: CreatePlantDTO | UpdatePlantDTO) => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      if (selectedPlant) {
        await plantAPI.updatePlant(selectedPlant.id, data as PlantDTO, token);
        addLog(`Biljka "${(data as UpdatePlantDTO).commonName || selectedPlant.commonName}" je azurirana`, 'success');
      } else {
        await plantAPI.createPlant(data as PlantDTO, token);
        addLog(`Nova biljka "${(data as CreatePlantDTO).commonName}" je zasadjena`, 'success');
      }
      await fetchPlants();
      setIsPlantModalOpen(false);
      setSelectedPlant(null);
    } catch (err) {
      addLog('Greska pri cuvanju biljke', 'error');
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
      addLog(`Biljka "${selectedPlant.commonName}" je obrisana`, 'info');
      await fetchPlants();
      setIsDeleteModalOpen(false);
      setSelectedPlant(null);
    } catch (err) {
      addLog('Greska pri brisanju biljke', 'error');
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
      const harvested = await plantAPI.harvestPlants(data, token);
      const harvestedCount = harvested.length || data.quantity;
      addLog(`Ubrano ${harvestedCount} biljaka vrste ${data.commonName}`, 'success');
      await fetchPlants();
      setIsHarvestModalOpen(false);
    } catch (err) {
      setError('Greska pri berbi biljaka');
      addLog('Greska pri berbi biljaka', 'error');
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
      const updatedPlant = await plantAPI.changeOilStrength(data, token);
      const direction = data.percentageChange > 0 ? 'povecana' : 'smanjena';
      addLog(
        `Jacina ulja za "${updatedPlant.commonName}" ${direction} na ${updatedPlant.oilStrength.toFixed(1)}`,
        'success'
      );
      await fetchPlants();
      setIsOilStrengthModalOpen(false);
    } catch (err) {
      setError('Greska pri promeni jacine ulja');
      addLog('Greska pri promeni jacine ulja', 'error');
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
              />
            )}
          </div>
          <div className="card__footer">
            <span className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
              Prikazano {filteredPlants.length} od {plants.length} biljaka
            </span>
          </div>
        </div>

        {/* Production Log Section */}
        <div className="card">
          <div className="card__header">
            <h2 className="card__title">
              <span style={{ color: 'var(--color-primary)' }}>LOG</span>
              Dnevnik proizvodnje
            </h2>
          </div>
          <div className="card__body" style={{ padding: 0 }}>
            <ProductionLog logs={logs} isLoading={logsLoading} />
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
