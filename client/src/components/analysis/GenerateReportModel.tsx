import React, { useMemo, useState } from "react";
import { FileText, Package, TrendingUp, X } from "lucide-react";

interface GenerateReportModelProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (params: any) => Promise<void>;
  reportType: "sales" | "products" | "trends";
  setReportType: (type: "sales" | "products" | "trends") => void;
  isLoading: boolean;
}

const GenerateReportModel: React.FC<GenerateReportModelProps> = ({
  isOpen,
  onClose,
  onGenerate,
  reportType,
  setReportType,
  isLoading,
}) => {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const currentMonth = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const currentYear = useMemo(() => String(new Date().getFullYear()), []);

  const [salesPeriodType, setSalesPeriodType] = useState<"daily" | "weekly" | "monthly" | "yearly" | "total">(
    "monthly"
  );
  const [salesPeriodValue, setSalesPeriodValue] = useState(currentMonth);

  const [topPeriod, setTopPeriod] = useState("this-month");
  const [topLimit, setTopLimit] = useState(10);

  const [trendAnalysisType, setTrendAnalysisType] = useState<"monthly_trend" | "product_trend" | "category_trend">(
    "monthly_trend"
  );
  const [trendStartDate, setTrendStartDate] = useState(today);
  const [trendEndDate, setTrendEndDate] = useState(today);
  const [trendProductId, setTrendProductId] = useState("");

  if (!isOpen) {
    return null;
  }

  const resolveSalesPeriodInputType = () => {
    if (salesPeriodType === "monthly") return "month";
    if (salesPeriodType === "yearly") return "number";
    if (salesPeriodType === "total") return "text";
    return "date";
  };

  const handleSalesPeriodTypeChange = (nextType: typeof salesPeriodType) => {
    setSalesPeriodType(nextType);
    if (nextType === "monthly") {
      setSalesPeriodValue(currentMonth);
      return;
    }
    if (nextType === "yearly") {
      setSalesPeriodValue(currentYear);
      return;
    }
    if (nextType === "total") {
      setSalesPeriodValue("all");
      return;
    }
    setSalesPeriodValue(today);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (reportType === "sales") {
      await onGenerate({
        periodType: salesPeriodType,
        periodValue: salesPeriodType === "total" ? "all" : salesPeriodValue,
      });
      return;
    }

    if (reportType === "products") {
      await onGenerate({
        period: topPeriod,
        limit: topLimit,
      });
      return;
    }

    await onGenerate({
      analysisType: trendAnalysisType,
      startDate: trendStartDate,
      endDate: trendEndDate,
      productId: trendAnalysisType === "product_trend" ? Number(trendProductId) : undefined,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal analysis-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Generisi izvestaj</h2>
          <button className="btn btn--ghost btn--icon" onClick={onClose} disabled={isLoading}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            <div className="analysis-report-type-tabs">
              <button
                type="button"
                className={`analysis-report-type-btn ${
                  reportType === "sales" ? "analysis-report-type-btn--active" : ""
                }`}
                onClick={() => setReportType("sales")}
              >
                <FileText size={16} />
                Prodaja
              </button>
              <button
                type="button"
                className={`analysis-report-type-btn ${
                  reportType === "products" ? "analysis-report-type-btn--active" : ""
                }`}
                onClick={() => setReportType("products")}
              >
                <Package size={16} />
                Top proizvodi
              </button>
              <button
                type="button"
                className={`analysis-report-type-btn ${
                  reportType === "trends" ? "analysis-report-type-btn--active" : ""
                }`}
                onClick={() => setReportType("trends")}
              >
                <TrendingUp size={16} />
                Trendovi
              </button>
            </div>

            {reportType === "sales" && (
              <div className="analysis-form-grid">
                <div className="input-group">
                  <label className="input-group__label">Tip perioda</label>
                  <select
                    className="input select"
                    value={salesPeriodType}
                    onChange={(event) =>
                      handleSalesPeriodTypeChange(event.target.value as typeof salesPeriodType)
                    }
                  >
                    <option value="daily">Dnevni</option>
                    <option value="weekly">Nedeljni</option>
                    <option value="monthly">Mesecni</option>
                    <option value="yearly">Godisnji</option>
                    <option value="total">Ukupno</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-group__label">Vrednost perioda</label>
                  <input
                    className="input"
                    type={resolveSalesPeriodInputType()}
                    value={salesPeriodValue}
                    onChange={(event) => setSalesPeriodValue(event.target.value)}
                    disabled={salesPeriodType === "total"}
                    min={salesPeriodType === "yearly" ? "2000" : undefined}
                    max={salesPeriodType === "yearly" ? "2100" : undefined}
                  />
                </div>
              </div>
            )}

            {reportType === "products" && (
              <div className="analysis-form-grid">
                <div className="input-group">
                  <label className="input-group__label">Period</label>
                  <select
                    className="input select"
                    value={topPeriod}
                    onChange={(event) => setTopPeriod(event.target.value)}
                  >
                    <option value="today">Danas</option>
                    <option value="this-week">Ova nedelja</option>
                    <option value="this-month">Ovaj mesec</option>
                    <option value="last-month">Prosli mesec</option>
                    <option value="this-year">Ova godina</option>
                    <option value="all">Sve</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-group__label">Broj proizvoda</label>
                  <input
                    className="input"
                    type="number"
                    min={1}
                    max={100}
                    value={topLimit}
                    onChange={(event) => setTopLimit(Math.max(1, Number(event.target.value) || 1))}
                  />
                </div>
              </div>
            )}

            {reportType === "trends" && (
              <div className="analysis-form-grid">
                <div className="input-group">
                  <label className="input-group__label">Tip analize</label>
                  <select
                    className="input select"
                    value={trendAnalysisType}
                    onChange={(event) =>
                      setTrendAnalysisType(event.target.value as typeof trendAnalysisType)
                    }
                  >
                    <option value="monthly_trend">Mesecni trend</option>
                    <option value="product_trend">Trend po proizvodu</option>
                    <option value="category_trend">Trend po kategoriji</option>
                  </select>
                </div>

                {trendAnalysisType === "product_trend" && (
                  <div className="input-group">
                    <label className="input-group__label">Product ID</label>
                    <input
                      className="input"
                      type="number"
                      min={1}
                      value={trendProductId}
                      onChange={(event) => setTrendProductId(event.target.value)}
                    />
                  </div>
                )}

                <div className="analysis-form-row">
                  <div className="input-group">
                    <label className="input-group__label">Od datuma</label>
                    <input
                      className="input"
                      type="date"
                      value={trendStartDate}
                      onChange={(event) => setTrendStartDate(event.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-group__label">Do datuma</label>
                    <input
                      className="input"
                      type="date"
                      value={trendEndDate}
                      onChange={(event) => setTrendEndDate(event.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal__footer">
            <button type="button" className="btn btn--outline" onClick={onClose} disabled={isLoading}>
              Otkazi
            </button>
            <button type="submit" className="btn btn--primary" disabled={isLoading}>
              {isLoading ? "Generisanje..." : "Generisi izvestaj"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenerateReportModel;
