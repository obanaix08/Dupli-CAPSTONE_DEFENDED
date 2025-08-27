import React from "react";

export default function KPICards({ kpis }) {
  const items = [
    { label: "Total Orders", value: kpis.total },
    { label: "In Progress", value: kpis.in_progress },
    { label: "Completed", value: kpis.completed },
    { label: "On Hold", value: kpis.hold },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item, i) => (
        <div
          key={i}
          className="p-4 bg-white rounded shadow text-center border"
        >
          <p className="text-gray-600 text-sm">{item.label}</p>
          <p className="text-2xl font-bold">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
