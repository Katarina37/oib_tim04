import React from "react";
import { TrendingUp, TrendingDown, Minus, Download } from "lucide-react";
import { formatCurrency } from "../../helpers/formatters";

interface TopProduct{
    productId: string;
    productName: string;
    unitsSold: number;
    revenue: number;
    percentage: number;
}

interface TopProductsTableProps{
    products: TopProduct[];
    onExport?: () => void;
    compact?: boolean;
}

const TopProductsTable: React.FC<TopProductsTableProps> = ({
    products,
    onExport,
    compact = false
}) => {
    const getTrendIcon = (index: number, previousIndex?: number) => {
        if(!previousIndex) return <Minus size={12}/>;

        if(index < previousIndex){
            return <TrendingUp size={12} className="text-success"/>;
        }else if(index > previousIndex){
            return <TrendingDown size={12} className="text-error"/>;
        }
        return <Minus size={12}/>;
    };

    if(products.length === 0){
        return(
            <div className="text-center py-8">
                <p className="text-text-muted">Nema podataka o top proizvodima</p>
            </div>
        );
    }

    return(
        <div>
            {!compact && (
                <div className="px-4 py-3 border-b border-border flex justify-between items-center">
                    <h4 className="font-medium">Top {products.length} najprodavanijih parfema</h4>
                    {onExport && (
                        <button className="btn btn--outline btn--sm" onClick={onExport}>
                            <Download size={14}/>
                            Preuzmi izveštaj
                        </button>
                    )}
                </div>
            )}

            <div className={`${compact ? 'p-2' : 'p-4'}`}>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border">
                            <th className={`text-left pb-2 ${compact ? 'text-xs' : 'text-sm'} text-text-muted`}>#</th>
                            <th className={`text-left pb-2 ${compact ? 'text-xs' : 'text-sm'} text-text-muted`}>Naziv</th>
                            <th className={`text-left pb-2 ${compact ? 'text-xs' : 'text-sm'} text-text-muted`}>Prodaja</th>
                            <th className={`text-left pb-2 ${compact ? 'text-xs' : 'text-sm'} text-text-muted`}>Prihod</th>
                            {!compact && (
                                <th className="text-left pb-2 text-sm text-text-muted">Udeo</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((products, index) => (
                            <tr key={products.productId} className="border-b border-border last:border-0">
                                <td className={`py-3 ${compact ? 'text-xs' : 'text-sm'}`}>
                                    <div className="flex items-center gap-2">
                                        <span className={`font-bold ${index < 3 ? 'text-primary' : 'text-text-secondary'}`}>{index+1}</span>
                                        {/* {getTrendIcon(index, product.previousRank)} */}
                                    </div>
                                </td>
                                <td className={`py-3 ${compact ? 'text-xs' : 'text-sm'} font-medium`}>
                                    {products.productName}
                                </td>
                                <td className={`py-3 ${compact ? 'text-xs' : 'text-sm'}`}>
                                    {products.unitsSold.toLocaleString()}
                                </td>
                                <td className={`py-3 ${compact ? 'text-xs' : 'text-sm'} font-bold`}>
                                    {formatCurrency(products.revenue)}
                                </td>
                                {!compact && (
                                    <td className="py-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-2 bg-border rounded-full overflow-hidden">
                                                <div 
                                                className="h-full bg-primary rounded-full"
                                                style={{ width: `${Math.min(products.percentage, 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-text-muted">
                                                {products.percentage.toFixed(1)}%
                                            </span>
                                        </div>
                                    </td>
                                )}   
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {!compact && products.length > 0 && (
                <div className="px-4 py-3 border-t border-border bg-surface">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-text-muted">
                            Ukupno {products.length} proizvoda
                        </span>
                        <span className="font-bold">
                            Ukupan prihod: {formatCurrency(products.reduce((sum, p) => sum + p.revenue, 0))}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopProductsTable;