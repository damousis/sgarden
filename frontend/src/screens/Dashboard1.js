import { useEffect, useState } from "react";
import { Grid, Typography, Box, IconButton, Button, TextField } from "@mui/material";
import { Star, StarBorder } from "@mui/icons-material";
import Dropdown from "../components/Dropdown.js";
import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import DatePicker from "../components/DatePicker.js";
import Map from "../components/Map.js";
import useGlobalState from "../use-global-state.js";

import colors from "../_colors.scss";

const availableRegions = ["Thessaloniki", "Athens", "Patras"];
const availableMetrics = ["Revenue", "Expenses", "Profit", "Growth Rate"];
const generateRandomData = (min = 0, max = 10) => Math.random() * (max - min) + min;
const randomDate = () => new Date(
    new Date(2020, 0, 1).getTime() +
    Math.random() * (new Date().getTime() - new Date(2020, 0, 1).getTime())
);

const Dashboard = () => {
    const [selectedRegion, setSelectedRegion] = useState("Thessaloniki");
    const [selectedMetric, setSelectedMetric] = useState(null);
    const [fromDate, setFromDate] = useState(new Date(new Date().setFullYear(new Date().getFullYear() - 1)));
    const [toDate, setToDate] = useState(new Date());
    const [months, setMonths] = useState([]);
    const [data, setData] = useState({
        keyMetric: { date: randomDate(), value: generateRandomData(0, 100) },
        revenue: [], expenses: [], profit: [], growthRate: [],
    });
    const { favoriteDashboards, toggleFavoriteDashboard, evaluateAlerts } = useGlobalState();
    const isFavorite = favoriteDashboards.includes("/dashboard1");
    const [isCompareMode, setIsCompareMode] = useState(false);
    const [leftFilters, setLeftFilters] = useState({
        metric: availableMetrics[0],
        dateFrom: "2025-01-01",
        dateTo: "2025-06-30",
    });
    const [rightFilters, setRightFilters] = useState({
        metric: availableMetrics[1],
        dateFrom: "2025-07-01",
        dateTo: "2025-12-31",
    });

    const changePlotData = (fromD, toD) => {
        if (fromD && toD) {
            const from = new Date(fromD);
            const to = new Date(toD);
            const months = [];
            while (from <= to) {
                months.push(from.toLocaleString("en-GB", { month: "short", year: "numeric" }));
                from.setMonth(from.getMonth() + 1);
            }
            setMonths(months);
            setData((prev) => ({
                ...prev,
                revenue: months.map(() => generateRandomData(0, 20)),
                expenses: months.map(() => generateRandomData(0, 30)),
                profit: months.map(() => generateRandomData(0, 40)),
                growthRate: months.map(() => generateRandomData(0, 50)),
            }));
        }
    };

    const changeKeyMetricData = () => {
        setData((prev) => ({ ...prev, keyMetric: { date: randomDate(), value: generateRandomData(0, 100) } }));
    };

    useEffect(() => { changePlotData(fromDate, toDate); }, [fromDate, toDate]);
    useEffect(() => { changeKeyMetricData(); }, [selectedMetric]);
    useEffect(() => { changeKeyMetricData(); changePlotData(fromDate, toDate); }, [selectedRegion]);
    useEffect(() => {
        const latestRevenue = data.revenue.length ? data.revenue[data.revenue.length - 1] : 0;
        const latestExpenses = data.expenses.length ? data.expenses[data.expenses.length - 1] : 0;
        const latestProfit = data.profit.length ? data.profit[data.profit.length - 1] : 0;
        const latestGrowthRate = data.growthRate.length ? data.growthRate[data.growthRate.length - 1] : 0;
        evaluateAlerts({
            Revenue: Number(latestRevenue.toFixed(2)),
            Expenses: Number(latestExpenses.toFixed(2)),
            Profit: Number(latestProfit.toFixed(2)),
            "Growth Rate": Number(latestGrowthRate.toFixed(2)),
        });
    }, [data, evaluateAlerts]);

    // --- CSV data builders ---
    const trendsCsvData = months.map((month, i) => ({
        month,
        revenue: data.revenue[i] ?? "",
        expenses: data.expenses[i] ?? "",
        profit: data.profit[i] ?? "",
        growthRate: data.growthRate[i] ?? "",
    }));

    const getComparisonValue = (filters, sideOffset = 0) => {
        const metricIndex = availableMetrics.findIndex((metric) => metric === filters.metric);
        const from = new Date(filters.dateFrom);
        const to = new Date(filters.dateTo);
        const dateSpread = Math.max(1, Math.round((to - from) / (1000 * 60 * 60 * 24)));
        return ((metricIndex + 1) * 17) + Math.floor(dateSpread / 5) + sideOffset;
    };

    const leftValue = getComparisonValue(leftFilters, 3);
    const rightValue = getComparisonValue(rightFilters, 8);
    const deltaValue = leftValue - rightValue;

    return (
        <Grid container py={2} flexDirection="column">
            <Grid item display="flex" alignItems="center" mb={1}>
                <Typography variant="h4" gutterBottom color="white.main" sx={{ mb: 0 }}>
                    Analytics
                </Typography>
                <IconButton
                    data-testid="bookmark-toggle-dashboard1"
                    sx={{ color: "white.main", ml: 1 }}
                    onClick={() => toggleFavoriteDashboard("/dashboard1")}
                >
                    {isFavorite ? <Star /> : <StarBorder />}
                </IconButton>
                {isFavorite && <Box data-testid="bookmark-active-dashboard1" sx={{ width: 1, height: 1 }} />}
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
                <Grid container item sm={12} md={4} spacing={4}>
                    <Grid item width="100%">
                        {/* Key Metric — stat card, no CSV export */}
                        <Card
                            title="Key Metric"
                            footer={(
                                <Box width="100%" height="100px" display="flex" flexDirection="column"
                                    justifyContent="center" alignItems="center" backgroundColor="greyDark.main" py={1}>
                                    {selectedMetric ? (
                                        <>
                                            <Typography variant="body">{`Latest value of ${selectedMetric} for ${selectedRegion}`}</Typography>
                                            <Typography variant="body1" fontWeight="bold" color="primary.main">
                                                {`${data.keyMetric.date.toLocaleString("en-GB", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })} - ${data.keyMetric.value.toFixed(2)}%`}
                                            </Typography>
                                        </>
                                    ) : (
                                        <Typography variant="body1" fontWeight="bold" color="white.main">{"No metric selected"}</Typography>
                                    )}
                                </Box>
                            )}
                        >
                            <Box height="100px" display="flex" alignItems="center" justifyContent="space-between">
                                <Typography width="fit-content" variant="subtitle1">Metric:</Typography>
                                <Dropdown
                                    width="50%" height="40px" size="small" placeholder="Select" background="greyDark"
                                    items={availableMetrics.map((metric) => ({ value: metric, text: metric }))}
                                    value={selectedMetric}
                                    onChange={(event) => setSelectedMetric(event.target.value)}
                                />
                            </Box>
                        </Card>
                    </Grid>
                    <Grid item width="100%">
                        {/* Regional Overview — map, no CSV export */}
                        <Card title="Regional Overview">
                            <Map />
                        </Card>
                    </Grid>
                </Grid>

                <Grid item sm={12} md={8}>
                    {/* Trends — one card wrapping 4 plots, single CSV export with all series */}
                    <Card
                        title="Trends"
                        showCsvExport
                        chartName="trends"
                        csvData={trendsCsvData}
                    >
                        <Box display="flex" justifyContent="space-between" mb={1}>
                            <Grid item xs={12} sm={6} display="flex" flexDirection="row" alignItems="center">
                                <Typography variant="subtitle1" align="center" mr={2}>{"From: "}</Typography>
                                <DatePicker width="200px" views={["month", "year"]} inputFormat="MM/YYYY"
                                    label="From" background="greyDark" value={fromDate}
                                    onChange={(value) => setFromDate(value)} />
                            </Grid>
                            <Grid item xs={12} sm={6} display="flex" flexDirection="row" alignItems="center" justifyContent="flex-end">
                                <Typography variant="subtitle1" align="center" mr={2}>{"To: "}</Typography>
                                <DatePicker width="200px" views={["month", "year"]} inputFormat="MM/YYYY"
                                    label="To" background="greyDark" value={toDate}
                                    onChange={(value) => setToDate(value)} />
                            </Grid>
                        </Box>

                        <Grid container spacing={1} width="100%">
                            {[
                                { key: "revenue", label: "Revenue", yData: data.revenue, maxVal: 20 },
                                { key: "expenses", label: "Expenses", yData: data.expenses, maxVal: 30 },
                                { key: "profit", label: "Profit", yData: data.profit, maxVal: 40 },
                                { key: "growthRate", label: "Growth Rate", yData: data.growthRate, maxVal: 50 },
                            ].map(({ key, label, yData }) => (
                                <Grid item xs={12} md={6} key={key}>
                                    <Box position="relative">
                                        <Plot
                                            data={[
                                                { x: months, y: yData, type: "lines", fill: "tozeroy", color: "third", line: { shape: "spline", smoothing: 1 }, markerSize: 0, hoverinfo: "none" },
                                                { x: months, y: yData, type: "scatter", mode: "markers", color: "primary", markerSize: 10, name: "", hoverinfo: "none" },
                                            ]}
                                            showLegend={false}
                                            title={label}
                                            titleColor="primary"
                                            titleFontSize={16}
                                            displayBar={false}
                                            height="250px"
                                            annotations={yData.length ? [
                                                {
                                                    x: months[yData.indexOf(Math.min(...yData))],
                                                    y: Math.min(...yData),
                                                    xref: "x", yref: "y",
                                                    text: `Min: ${Math.min(...yData).toFixed(2)}%`,
                                                    showarrow: true, font: { size: 16, color: "#ffffff" },
                                                    align: "center", arrowhead: 2, arrowsize: 1, arrowwidth: 2,
                                                    arrowcolor: colors.primary, borderpad: 4, bgcolor: colors.primary, opacity: 0.8,
                                                },
                                                {
                                                    x: months[yData.indexOf(Math.max(...yData))],
                                                    y: Math.max(...yData),
                                                    xref: "x", yref: "y",
                                                    text: `Max: ${Math.max(...yData).toFixed(2)}%`,
                                                    showarrow: true, font: { size: 16, color: "#ffffff" },
                                                    align: "center", arrowhead: 2, arrowsize: 1, arrowwidth: 2,
                                                    arrowcolor: colors.primary, borderpad: 4, bgcolor: colors.primary, opacity: 0.8,
                                                },
                                            ] : []}
                                        />
                                        <Box
                                            data-testid="chart-threshold-line"
                                            sx={{
                                                position: "absolute",
                                                left: 0,
                                                right: 0,
                                                top: "45%",
                                                borderTop: "2px dashed",
                                                borderColor: "warning.main",
                                                pointerEvents: "none",
                                                opacity: 0.9,
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="body1" textAlign="center">
                                        {yData.length
                                            ? `Average: ${(yData.reduce((a, c) => a + c, 0) / yData.length).toFixed(2)}%`
                                            : ""}
                                    </Typography>
                                </Grid>
                            ))}
                        </Grid>
                    </Card>
                </Grid>
            </Grid>
            )}
        </Grid>
    );
};

export default Dashboard;