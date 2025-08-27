import React, { useEffect, useState } from "react";
import { getAnalytics } from "../../api/productionApi";
import { getAdminOverview } from "../../api/inventoryApi";
import KPICards from "./Analytics/KPICards";
import DailyOutputChart from "./Analytics/DailyOutputChart";
import StagePieChart from "./Analytics/StagePieChart";
import TopProductsChart from "./Analytics/TopProductsChart";
import TopUsersChart from "./Analytics/TopUsersChart";

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    status: "",
  });
  const [overview, setOverview] = useState(null);

  const fetchAnalytics = async () => {
    const data = await getAnalytics(filters);
    setAnalytics(data);
  };

  const fetchOverview = async () => {
    const data = await getAdminOverview();
    setOverview(data);
  };

  useEffect(() => {
    fetchAnalytics();
    fetchOverview();
  }, []); // fetch on mount

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    fetchAnalytics();
  };

  return (
    <div className="container mt-4">
      <div className="text-center mb-4">
        <h2 style={{ color: "black" }}>UNICK FURNITURE DASHBOARD</h2>
      </div>

      {/* 🔹 Filters */}
      <div className="row mb-4">
        <div className="col-md-3">
          <label>Start Date</label>
          <input
            type="date"
            name="start_date"
            value={filters.start_date}
            onChange={handleFilterChange}
            className="form-control"
          />
        </div>
        <div className="col-md-3">
          <label>End Date</label>
          <input
            type="date"
            name="end_date"
            value={filters.end_date}
            onChange={handleFilterChange}
            className="form-control"
          />
        </div>
        <div className="col-md-3">
          <label>Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="form-control"
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Hold">Hold</option>
          </select>
        </div>
        <div className="col-md-3 d-flex align-items-end">
          <button onClick={applyFilters} className="btn btn-primary w-100">
            Apply Filters
          </button>
        </div>
      </div>

      {/* 🔹 Analytics */}
      {!analytics ? (
        <p className="text-center mt-4">Loading analytics...</p>
      ) : (
        <>
          <KPICards kpis={analytics.kpis} />

          <div className="row mt-4">
            <div className="col-md-6">
              <DailyOutputChart data={analytics.daily_output} />
            </div>
            <div className="col-md-6">
              <StagePieChart data={analytics.stage_breakdown} />
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-md-6">
              <TopProductsChart data={analytics.top_products} />
            </div>
            <div className="col-md-6">
              <TopUsersChart data={analytics.top_users} />
            </div>
          </div>
        </>
      )}

      {/* 🔹 Forecasts & Stocks Overview */}
      {!overview ? (
        <p className="text-center mt-4">Loading overview...</p>
      ) : (
        <div className="mt-4">
          <h4>Inventory Forecasts</h4>
          <div className="table-responsive">
            <table className="table table-sm table-striped">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Name</th>
                  <th className="text-end">On Hand</th>
                  <th className="text-end">Avg Daily</th>
                  <th className="text-end">Days to Depletion</th>
                  <th className="text-end">ROP</th>
                  <th className="text-end">Suggested Order</th>
                </tr>
              </thead>
              <tbody>
                {overview.forecasts?.map((f) => (
                  <tr key={f.sku}>
                    <td>{f.sku}</td>
                    <td>{f.name}</td>
                    <td className="text-end">{f.on_hand}</td>
                    <td className="text-end">{f.avg_daily_usage}</td>
                    <td className="text-end">{f.days_to_depletion ?? "-"}</td>
                    <td className="text-end">{f.reorder_point}</td>
                    <td className="text-end fw-bold">{f.suggested_order}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
