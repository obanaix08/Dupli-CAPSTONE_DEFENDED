import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function TopUsersChart({ data }) {
  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Top Users</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="user_name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="quantity" fill="#f59e0b" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
