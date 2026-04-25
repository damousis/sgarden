import { useEffect, useState } from "react";
import { Grid, Typography, IconButton, Box } from "@mui/material";
import { Star, StarBorder } from "@mui/icons-material";
import Dropdown from "../components/Dropdown.js";
import Card from "../components/Card.js";
import Plot from "../components/Plot.js";

import { getData } from "../api/index.js";
import { plotlyTracesToCsvRows } from "../utils/exportCsv.js";
import useGlobalState from "../use-global-state.js";

const availableRegions = ["Thessaloniki", "Athens", "Patras"];

const Dashboard = () => {
    const [selectedRegion, setSelectedRegion] = useState("Thessaloniki");
    const [data, setData] = useState({ quarterlySalesDistribution: {}, budgetVsActual: {}, timePlot: {} });
    const { favoriteDashboards, toggleFavoriteDashboard } = useGlobalState();
    const isFavorite = favoriteDashboards.includes("/dashboard2");

    useEffect(() => {
        getData().then((tempData) => {
            const { success, quarterlySalesDistribution, budgetVsActual, timePlot } = tempData;
            if (success) {
                setData({ quarterlySalesDistribution, budgetVsActual, timePlot });
            }
        });
    }, [selectedRegion]);

    // --- CSV data builders ---
    const quarterlySalesCsvData = [
        ...(data?.quarterlySalesDistribution?.Q1 || []).map((v) => ({ quarter: "Q1", value: v })),
        ...(data?.quarterlySalesDistribution?.Q2 || []).map((v) => ({ quarter: "Q2", value: v })),
        ...(data?.quarterlySalesDistribution?.Q3 || []).map((v) => ({ quarter: "Q3", value: v })),
    ];

    const budgetVsActualCsvData = Object.entries(data?.budgetVsActual || {}).map(
        ([month, values]) => ({
            month,
            budget: values?.budget ?? "",
            actual: values?.actual ?? "",
            forecast: values?.forecast ?? "",
        })
    );

    const performanceCsvData = plotlyTracesToCsvRows([
        { name: "Projected", x: Array.from({ length: 20 }, (_, i) => i + 1), y: data?.timePlot?.projected },
        { name: "Actual", x: Array.from({ length: 20 }, (_, i) => i + 1), y: data?.timePlot?.actual },
        { name: "Historical Avg", x: Array.from({ length: 20 }, (_, i) => i + 1), y: data?.timePlot?.historicalAvg },
    ]);

    return (
        <Grid container py={2} flexDirection="column">
            <Grid item display="flex" alignItems="center" mb={1}>
                <Typography variant="h4" gutterBottom color="white.main" sx={{ mb: 0 }}>
                    Insights
                </Typography>
                <IconButton
                    data-testid="bookmark-toggle-dashboard2"
                    sx={{ color: "white.main", ml: 1 }}
                    onClick={() => toggleFavoriteDashboard("/dashboard2")}
                >
                    {isFavorite ? <Star /> : <StarBorder />}
                </IconButton>
                {isFavorite && <Box data-testid="bookmark-active-dashboard2" sx={{ width: 1, height: 1 }} />}
            </Grid>

            <Grid item style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: "20px" }}>
                <Typography variant="body1" style={{ marginRight: "10px" }} color="white.main">Region:</Typography>
                <Dropdown
                    items={availableRegions.map((region) => ({ value: region, text: region }))}
                    value={selectedRegion}
                    onChange={(event) => setSelectedRegion(event.target.value)}
                />
            </Grid>

            <Grid container spacing={2}>
                <Grid item sm={12} md={6}>
                    <Card
                        title="Quarterly Sales Distribution"
                        showCsvExport
                        chartName="quarterly-sales"
                        csvData={quarterlySalesCsvData}
                    >
                        <Plot
                            data={[
                                { title: "Q1", y: data?.quarterlySalesDistribution?.Q1, type: "box", color: "primary" },
                                { title: "Q2", y: data?.quarterlySalesDistribution?.Q2, type: "box", color: "secondary" },
                                { title: "Q3", y: data?.quarterlySalesDistribution?.Q3, type: "box", color: "third" },
                            ]}
                            showLegend={false}
                            displayBar={false}
                            height="300px"
                            marginBottom="40"
                        />
                    </Card>
                </Grid>

                <Grid item sm={12} md={6}>
                    <Card
                        title="Budget vs Actual Spending"
                        showCsvExport
                        chartName="budget-vs-actual"
                        csvData={budgetVsActualCsvData}
                    >
                        <Plot
                            data={[
                                {
                                    x: ["January", "February", "March", "April", "May", "June"],
                                    y: Object.values(data?.budgetVsActual).map(month => month.budget),
                                    type: "bar", color: "primary", title: "Budget",
                                },
                                {
                                    x: ["January", "February", "March", "April", "May", "June"],
                                    y: Object.values(data?.budgetVsActual).map(month => month.actual),
                                    type: "bar", color: "secondary", title: "Actual",
                                },
                                {
                                    x: ["January", "February", "March", "April", "May", "June"],
                                    y: Object.values(data?.budgetVsActual).map(month => month.forecast),
                                    type: "bar", color: "third", title: "Forecast",
                                },
                            ]}
                            showLegend={true}
                            displayBar={false}
                            height="300px"
                            marginBottom="40"
                        />
                    </Card>
                </Grid>

                <Grid item sm={12}>
                    <Card
                        title="Performance Over Time"
                        showCsvExport
                        chartName="performance"
                        csvData={performanceCsvData}
                    >
                        <Plot
                            data={[
                                { title: "Projected", x: Array.from({ length: 20 }, (_, i) => i + 1), y: data?.timePlot?.projected, type: "line", color: "primary" },
                                { title: "Actual", x: Array.from({ length: 20 }, (_, i) => i + 1), y: data?.timePlot?.actual, type: "line", color: "secondary" },
                                { title: "Historical Avg", x: Array.from({ length: 20 }, (_, i) => i + 1), y: data?.timePlot?.historicalAvg, type: "line", color: "third" },
                            ]}
                            showLegend={true}
                            displayBar={false}
                            height="300px"
                            marginBottom="40"
                        />
                    </Card>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default Dashboard;