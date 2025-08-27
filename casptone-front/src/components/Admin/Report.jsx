import React, { useEffect, useState } from "react";
import axios from "axios";

const Report = () => {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:8000/api/reports", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setReportData(response.data);
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
        <div className="container mt-4">
            <h2>Reports</h2>
            {loading ? (
                <p>Loading reports...</p>
            ) : error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : (
                <table className="table table-bordered">
                    <thead className="table-light">
                        <tr>
                            <th>Report Type</th>
                            <th>Description</th>
                            <th>Date Generated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.length > 0 ? (
                            reportData.map((report) => (
                                <tr key={report.id}>
                                    <td>{report.type}</td>
                                    <td>{report.description}</td>
                                    <td>{new Date(report.created_at).toLocaleString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="text-center">
                                    No reports available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Report;
