import React, {useState} from "react";
import {X, FileText, TrendingUp, Package, Calendar} from 'lucide-react';

interface GenerateReportModelProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (params: any) => Promise<void>;
    reportType: 'sales' | 'products' | 'trends';
    setReportType: (type: 'sales' | 'products' | 'trends') => void;
    isLoading: boolean;
}

const GenerateReportModel: React.FC<GenerateReportModelProps> = ({
    isOpen,
    onClose,
    onGenerate,
    reportType,
    setReportType,
    isLoading
}) => {
    const [formData, setFormData] = useState({
        periodType: 'monthly',
        periodValue: new Date().toISOString().slice(0, 7),
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
        limit: 10,
        analysisType: 'monthly_trend'
    });

    if(!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let params: any = {};
        switch(reportType){
            case 'sales':
                params = {
                    periodType: formData.periodType,
                    periodValue: formData.periodValue
                };
                break;
            case 'products':
                params = {
                    period: formData.periodValue,
                    limit: formData.limit
                };
                break;
            case 'trends':
                params = {
                    analysisType: formData.analysisType,
                    startDate: formData.startDate,
                    endDate: formData.endDate
                };
                break;
        }
        await onGenerate(params);
    };
    return(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '500px'}}>
                <div className="modal__header">
                    <h2 className="modal__title">
                        Generiši izveštaj
                    </h2>
                    <button className="btn btn--ghost btn--icon" onClick={onClose}>
                        <X size={20}/>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal__body">
                        <div className="flex gap-2 mb-6">
                            <button type="button"
                            className={`flex-1 btn ${reportType === 'sales' ? 'btn--primary' : 'btn--outline'}`}
                            onClick={() => setReportType('sales')}>
                                <FileText size={16}/>
                                Prodaja
                            </button>
                            <button
                            type="button"
                            className={`flex-1 btn ${reportType === 'products' ? 'btn--primary' : 'btn--outline'}`}
                            onClick={() => setReportType('products')}>
                                <Package size={16}/>
                                Top proizvodi
                            </button>
                            <button
                            type="button"
                            className={`flex-1 btn ${reportType === 'trends' ? 'btn--primary' : 'btn--outline'}`}
                            onClick={() => setReportType('trends')}>
                                <TrendingUp size={16}/>
                                Trendovi
                            </button>
                        </div>
                        {reportType === 'sales' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-2">
                                        Tip perioda
                                    </label>
                                    <select
                                    className="w-full input"
                                    value={formData.periodType}
                                    onChange={(e) => setFormData({...formData, periodType: e.target.value})}>
                                        <option
                                        value="daily">
                                            Dnevni
                                        </option>
                                        <option
                                        value="weekly">
                                            Nedeljni
                                        </option>
                                        <option
                                        value="monthly">
                                            Mesečni
                                        </option>
                                        <option
                                        value="yearly">
                                            Godišnji
                                        </option>
                                        <option
                                        value="total">
                                            Ukupno
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-2">
                                        Vrednost perioda
                                    </label>
                                    {formData.periodType === 'monthly' ? (
                                        <input
                                        type="month"
                                        className="w-full input"
                                        value={formData.periodValue}
                                        onChange={(e) => setFormData({...formData, periodValue: e.target.value})}/>
                                    ) : formData.periodType === 'yearly' ? (
                                        <input
                                        type="number"
                                        className="w-full input"
                                        placeholder="Godina"
                                        value={formData.periodValue}
                                        onChange={(e) => setFormData({...formData, periodValue: e.target.value})}/>
                                    ) : (
                                        <input
                                        type="date"
                                        className="w-full input"
                                        value={formData.periodValue}
                                        onChange={(e)=> setFormData({...formData, periodValue: e.target.value})}/>
                                    )}
                                </div>
                            </div>
                        )}
                        {reportType === 'products' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-2">Period</label>
                                    <select
                                    className="w-full input"
                                    value={formData.periodType}
                                    onChange={(e) => setFormData({...formData, periodType: e.target.value})}>
                                        <option
                                        value="this-week">Ova nedelja</option>
                                        <option
                                        value="this-month">Ovaj mesec</option>
                                        <option
                                        value="last-month">Prošli mesec</option>
                                        <option
                                        value="this-year">Ova godina</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-2">
                                        Broj proizvoda
                                    </label>
                                    <input
                                    type="number"
                                    className="w-full input"
                                    min="1"
                                    max="50"
                                    value={formData.limit}
                                    onChange={(e) => setFormData({...formData, limit: parseInt(e.target.value)})}/>
                                </div>
                            </div>
                        )}
                        {reportType === 'trends' && (
                            <div className="space-y-4">
                                <div>
                                    <label
                                    className="block text-sm font-medium text-text-muted mb-2">Tip analize</label>
                                    <select
                                    className="w-full input"
                                    value={formData.analysisType}
                                    onChange={(e) => setFormData({...formData, analysisType: e.target.value})}>
                                        <option value="monthly_trend">Mesečni trend</option>
                                        <option value="product_trend">Trend po proizvodu</option>
                                        <option value="category_trend">Trend po kategoriji</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label
                                        className="block text-sm font-medium text-text-muted mb-2">
                                            Od datuma
                                        </label>
                                        <input
                                        type="date"
                                        className="w-full input"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}/>
                                    </div>
                                    <div>
                                        <label
                                        className="block text-sm font-medium text-text-muted mb-2">
                                            Do datuma
                                        </label>
                                        <input
                                        type="date"
                                        className="w-full input"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}/>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="modal__footer">
                        <button className="btn btn--outline"
                        onClick={onClose}
                        disabled={isLoading}>
                            Otkaži
                        </button>
                        <button
                        type="submit"
                        className="btn btn--primary"
                        disabled={isLoading}>
                            {isLoading ? 'Generisanje...' : 'Generiši izveštaj'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GenerateReportModel;