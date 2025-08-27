import React, { useEffect, useState } from "react";
import { getAnalytics } from "../../api/productionApi";
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

  const fetchAnalytics = async () => {
    const data = await getAnalytics(filters);
    setAnalytics(data);
  };

  useEffect(() => {
    fetchAnalytics();
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
    </div>
  );
};

export default AdminDashboard;
