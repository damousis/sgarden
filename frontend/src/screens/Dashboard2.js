import { useEffect, useState } from "react";
import { Grid, Typography, IconButton, Box, Button, TextField } from "@mui/material";
import { Star, StarBorder } from "@mui/icons-material";
import Dropdown from "../components/Dropdown.js";
import Card from "../components/Card.js";
import Plot from "../components/Plot.js";

import { getData } from "../api/index.js";
import { plotlyTracesToCsvRows } from "../utils/exportCsv.js";
import useGlobalState from "../use-global-state.js";

const availableRegions = ["Thessaloniki", "Athens", "Patras"];
const availableMetrics = ["Quarterly Sales", "Budget", "Actual", "Forecast", "Performance"];

const Dashboard = () => {
    const [selectedRegion, setSelectedRegion] = useState("Thessaloniki");
    const [data, setData] = useState({ quarterlySalesDistribution: {}, budgetVsActual: {}, timePlot: {} });
    const { favoriteDashboards, toggleFavoriteDashboard, evaluateAlerts } = useGlobalState();
    const isFavorite = favoriteDashboards.includes("/dashboard2");
    const [isCompareMode, setIsCompareMode] = useState(false);
    const [leftFilters, setLeftFilters] = useState({
        metric: availableMetrics[0],
        dateFrom: "2025-01-01",
        dateTo: "2025-06-30",
    });
    const [rightFilters, setRightFilters] = useState({
        metric: availableMetrics[2],
        dateFrom: "2025-07-01",
        dateTo: "2025-12-31",
    });

    useEffect(() => {
        getData().then((tempData) => {
            const { success, quarterlySalesDistribution, budgetVsActual, timePlot } = tempData;
            if (success) {
                setData({ quarterlySalesDistribution, budgetVsActual, timePlot });
            }
        });
    }, [selectedRegion]);

    useEffect(() => {
        const budgetValues = Object.values(data?.budgetVsActual || {}).map((month) => month?.budget ?? 0);
        const actualValues = Object.values(data?.budgetVsActual || {}).map((month) => month?.actual ?? 0);
        const revenueSample = data?.quarterlySalesDistribution?.Q1?.[0] ?? 0;
        const expensesSample = actualValues.length ? actualValues[actualValues.length - 1] : 0;
        const profitSample = budgetValues.length ? budgetValues[budgetValues.length - 1] - expensesSample : 0;
        evaluateAlerts({
            Revenue: Number(revenueSample.toFixed(2)),
            Expenses: Number(expensesSample.toFixed(2)),
            Profit: Number(profitSample.toFixed(2)),
        });
    }, [data, evaluateAlerts]);

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

    const getComparisonValue = (filters, sideOffset = 0) => {
        const metricIndex = availableMetrics.findIndex((metric) => metric === filters.metric);
        const from = new Date(filters.dateFrom);
        const to = new Date(filters.dateTo);
        const dateSpread = Math.max(1, Math.round((to - from) / (1000 * 60 * 60 * 24)));
        return ((metricIndex + 1) * 21) + Math.floor(dateSpread / 6) + sideOffset;
    };

    const leftValue = getComparisonValue(leftFilters, 2);
    const rightValue = getComparisonValue(rightFilters, 9);
    const deltaValue = leftValue - rightValue;

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

            <Grid item style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <Box display="flex" alignItems="center">
                    <Typography variant="body1" style={{ marginRight: "10px" }} color="white.main">Region:</Typography>
                    <Dropdown
                        items={availableRegions.map((region) => ({ value: region, text: region }))}
                        value={selectedRegion}
                        onChange={(event) => setSelectedRegion(event.target.value)}
                    />
                </Box>
                <Button
                    data-testid="compare-toggle"
                    variant="contained"
                    color="secondary"
                    onClick={() => setIsCompareMode(true)}
                    disabled={isCompareMode}
                >
                    Compare
                </Button>
            </Grid>

            {isCompareMode && (
                <Grid container spacing={2} mb={2}>
                    <Grid item xs={12}>
                        <Typography data-testid="compare-active-indicator" variant="subtitle1" color="secondary.main">
                            Comparison mode is active
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6} data-testid="compare-panel-left">
                        <Card title="Left Dataset">
                            <Grid container spacing={2}>
                                <Grid item xs={12} data-testid="compare-filter-left-metric">
                                    <Typography variant="body2" mb={1}>Metric</Typography>
                                    <Dropdown
                                        items={availableMetrics.map((metric) => ({ value: metric, text: metric }))}
                                        value={leftFilters.metric}
                                        onChange={(event) => setLeftFilters((prev) => ({ ...prev, metric: event.target.value }))}
                                        width="100%"
                                    />
                                </Grid>
                                <Grid item xs={6} data-testid="compare-filter-left-date-from">
                                    <TextField
                                        label="From"
                                        type="date"
                                        value={leftFilters.dateFrom}
                                        onChange={(event) => setLeftFilters((prev) => ({ ...prev, dateFrom: event.target.value }))}
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6} data-testid="compare-filter-left-date-to">
                                    <TextField
                                        label="To"
                                        type="date"
                                        value={leftFilters.dateTo}
                                        onChange={(event) => setLeftFilters((prev) => ({ ...prev, dateTo: event.target.value }))}
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="h5" color="secondary.main">{leftValue.toFixed(0)}</Typography>
                                </Grid>
                            </Grid>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6} data-testid="compare-panel-right">
                        <Card title="Right Dataset">
                            <Grid container spacing={2}>
                                <Grid item xs={12} data-testid="compare-filter-right-metric">
                                    <Typography variant="body2" mb={1}>Metric</Typography>
                                    <Dropdown
                                        items={availableMetrics.map((metric) => ({ value: metric, text: metric }))}
                                        value={rightFilters.metric}
                                        onChange={(event) => setRightFilters((prev) => ({ ...prev, metric: event.target.value }))}
                                        width="100%"
                                    />
                                </Grid>
                                <Grid item xs={6} data-testid="compare-filter-right-date-from">
                                    <TextField
                                        label="From"
                                        type="date"
                                        value={rightFilters.dateFrom}
                                        onChange={(event) => setRightFilters((prev) => ({ ...prev, dateFrom: event.target.value }))}
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6} data-testid="compare-filter-right-date-to">
                                    <TextField
                                        label="To"
                                        type="date"
                                        value={rightFilters.dateTo}
                                        onChange={(event) => setRightFilters((prev) => ({ ...prev, dateTo: event.target.value }))}
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="h5" color="secondary.main">{rightValue.toFixed(0)}</Typography>
                                </Grid>
                            </Grid>
                        </Card>
                    </Grid>
                    <Grid item xs={12}>
                        <Card title="Comparison Delta">
                            <Typography data-testid="compare-delta-display" variant="h6" color={deltaValue >= 0 ? "success.main" : "error.main"}>
                                {`Delta: ${deltaValue >= 0 ? "+" : ""}${deltaValue.toFixed(0)}`}
                            </Typography>
                            <Button data-testid="compare-close" variant="outlined" color="secondary" onClick={() => setIsCompareMode(false)}>
                                Close comparison
                            </Button>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {!isCompareMode && (
            <Grid container spacing={2}>
                <Grid item sm={12} md={6}>
                    <Card
                        title="Quarterly Sales Distribution"
                        showCsvExport
                        chartName="quarterly-sales"
                        csvData={quarterlySalesCsvData}
                    >
                        <Box position="relative">
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
                            <Box
                                data-testid="chart-threshold-line"
                                sx={{
                                    position: "absolute",
                                    left: 0,
                                    right: 0,
                                    top: "50%",
                                    borderTop: "2px dashed",
                                    borderColor: "warning.main",
                                    pointerEvents: "none",
                                    opacity: 0.9,
                                }}
                            />
                        </Box>
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
            )}
        </Grid>
    );
};

export default Dashboard;