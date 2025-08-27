import React, { useEffect, useState } from "react";
import axios from "axios";
import AppLayout from "../Header";

const Report = () => {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const token = localStorage.getItem("token");
                // Use replenishment endpoint which returns structured inventory recommendations
                const response = await axios.get("http://localhost:8000/api/replenishment", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setReportData(response.data || []);
            } catch (err) {
                console.error("Error fetching reports:", err);
                setError("Failed to load reports.");
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    return (
        <AppLayout>
            <div className="container mt-4">
                <h2 className="fw-bold">Inventory Replenishment Report</h2>
                {loading ? (
                    <p>Loading reports...</p>
                ) : error ? (
                    <p style={{ color: "red" }}>{error}</p>
                ) : (
                    <div className="card shadow-sm">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>SKU</th>
                                        <th>Name</th>
                                        <th className="text-end">On Hand</th>
                                        <th className="text-end">Avg Daily Usage</th>
                                        <th className="text-end">ROP</th>
                                        <th className="text-end">Suggested Order</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.length > 0 ? (
                                        reportData.map((row) => (
                                            <tr key={row.sku}>
                                                <td>{row.sku}</td>
                                                <td>{row.name}</td>
                                                <td className="text-end">{row.on_hand}</td>
                                                <td className="text-end">{row.avg_daily_usage}</td>
                                                <td className="text-end">{row.rop}</td>
                                                <td className="text-end fw-bold">{row.suggested_order}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center">No data available.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default Report;
