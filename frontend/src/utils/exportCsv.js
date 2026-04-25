const escapeCsvValue = (value) => {
    if (value === null || value === undefined) return "";

    const stringValue = String(value);

    if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
    ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
};

export const exportRowsToCsv = ({ rows, filename = "chart-data" }) => {
    if (!rows || rows.length === 0) return;

    const headers = Object.keys(rows[0]);

    const csvContent = [
        headers.map(escapeCsvValue).join(","),
        ...rows.map((row) =>
            headers.map((header) => escapeCsvValue(row[header])).join(",")
        ),
    ].join("\n");

    const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const plotlyTracesToCsvRows = (traces) => {
    if (!Array.isArray(traces)) return [];

    const rows = [];

    traces.forEach((trace) => {
        const xValues = trace.x || [];
        const yValues = trace.y || [];
        const seriesName = trace.name || "Series";

        xValues.forEach((x, index) => {
            rows.push({
                series: seriesName,
                x,
                y: yValues[index],
            });
        });
    });

    return rows;
};