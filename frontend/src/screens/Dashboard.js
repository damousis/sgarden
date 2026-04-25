import { useEffect, useState } from "react";
import { Grid, Typography, Box, IconButton } from "@mui/material";
import { Star, StarBorder } from "@mui/icons-material";

import Dropdown from "../components/Dropdown.js";
import Card from "../components/Card.js";
import Plot from "../components/Plot.js";
import useGlobalState from "../use-global-state.js";

const availableRegions = ["Thessaloniki", "Athens", "Patras"];
const generateRandomData = (minimum = 0, maximum = 100) =>
    Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;

const formatNumber = (number, symbol = "", showSign = true) => {
    if (!number) return "-";
    let formattedNumber = (number > 0 && showSign) ? "+" : "";
    formattedNumber += number;
    formattedNumber += symbol;
    return formattedNumber;
};

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Dec"];

const Dashboard = () => {
    const [selectedRegion, setSelectedRegion] = useState("Thessaloniki");
    const [data, setData] = useState({});
    const { favoriteDashboards, toggleFavoriteDashboard } = useGlobalState();
    const isFavorite = favoriteDashboards.includes("/dashboard");

    useEffect(() => {
        const newData = {
            monthlyRevenue: { value: generateRandomData(), change: generateRandomData(-100, 100) },
            newCustomers: { value: generateRandomData(0, 10_000), change: generateRandomData(-100, 100) },
            activeSubscriptions: { value: generateRandomData(0, 100_000), change: generateRandomData(-100, 100) },
            weeklySales: Array.from({ length: 7 }, () => generateRandomData(0, 100)),
            revenueTrend: Array.from({ length: 12 }, () => generateRandomData(0, 500)),
            customerSatisfaction: Array.from({ length: 12 }, () => generateRandomData(0, 500)),
        };
        setData(newData);
    }, [selectedRegion]);

    // --- CSV data builders ---
    const weeklySalesCsvData = DAYS.map((day, i) => ({
        day,
        transactions: data?.weeklySales?.[i] ?? "",
    }));

    const revenueTrendCsvData = MONTHS.map((month, i) => ({
        month,
        revenue: data?.revenueTrend?.[i] ?? "",
    }));

    const customerSatisfactionCsvData = MONTHS.map((month, i) => ({
        month,
        score: data?.customerSatisfaction?.[i] ?? "",
    }));

    return (
        <Grid container py={2} flexDirection="column">
            <Grid item display="flex" alignItems="center" mb={1}>
                <Typography variant="h4" gutterBottom color="white.main" sx={{ mb: 0 }}>
                    Overview
                </Typography>
                <IconButton
                    data-testid="bookmark-toggle-dashboard"
                    sx={{ color: "white.main", ml: 1 }}
                    onClick={() => toggleFavoriteDashboard("/dashboard")}
                >
                    {isFavorite ? <Star /> : <StarBorder />}
                </IconButton>
                {isFavorite && <Box data-testid="bookmark-active-dashboard" sx={{ width: 1, height: 1 }} />}
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
                {/* Stat cards — no CSV export (no chart data) */}
                <Grid item xs={12} sm={4}>
                    <Card title="Monthly Revenue">
                        <Box display="flex" flexDirection="column" alignItems="center">
                            <Typography variant="h3" fontWeight="bold" color="secondary.main">{formatNumber(data?.monthlyRevenue?.value, "%", false)}</Typography>
                            <Grid item display="flex" flexDirection="row">
                                <Typography variant="body" color={data?.monthlyRevenue?.change > 0 ? "success.main" : "error.main"}>
                                    {formatNumber(data?.monthlyRevenue?.change, "%")}
                                </Typography>
                                <Typography variant="body" color="secondary.main" ml={1}>{"than last month"}</Typography>
                            </Grid>
                        </Box>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card title="New Customers">
                        <Box display="flex" flexDirection="column" alignItems="center">
                            <Typography variant="h3" fontWeight="bold" color="secondary.main">{formatNumber(data?.newCustomers?.value, "", false)}</Typography>
                            <Grid item display="flex" flexDirection="row">
                                <Typography variant="body" color={data?.newCustomers?.change > 0 ? "success.main" : "error.main"}>
                                    {formatNumber(data?.newCustomers?.change, "%")}
                                </Typography>
                                <Typography variant="body" color="secondary.main" ml={1}>{"than last month"}</Typography>
                            </Grid>
                        </Box>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card title="Active Subscriptions">
                        <Box display="flex" flexDirection="column" alignItems="center">
                            <Typography variant="h3" fontWeight="bold" color="secondary.main">{formatNumber(data?.activeSubscriptions?.value, "", false)}</Typography>
                            <Grid item display="flex" flexDirection="row">
                                <Typography variant="body" color={data?.activeSubscriptions?.change > 0 ? "success.main" : "error.main"}>
                                    {formatNumber(data?.activeSubscriptions?.change, "%")}
                                </Typography>
                                <Typography variant="body" color="secondary.main" ml={1}>{"than last month"}</Typography>
                            </Grid>
                        </Box>
                    </Card>
                </Grid>

                {/* Chart cards — with CSV export */}
                <Grid item xs={12} sm={4}>
                    <Card
                        title="Weekly Sales"
                        showCsvExport
                        chartName="weekly-sales"
                        csvData={weeklySalesCsvData}
                        footer={(
                            <Grid sx={{ width: "100%", borderTop: "1px solid gray" }}>
                                <Typography variant="body2" component="p" sx={{ marginTop: "10px" }}>{"🕗 averages (last month)"}</Typography>
                            </Grid>
                        )}
                        footerBackgroundColor="white"
                        footerColor="gray"
                    >
                        <Plot
                            data={[{ x: DAYS, y: data?.weeklySales, type: "bar", color: "third" }]}
                            showLegend={false}
                            title="Number of transactions per day"
                            titleColor="primary"
                            titleFontSize={16}
                            displayBar={false}
                        />
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card
                        title="Revenue Trend"
                        showCsvExport
                        chartName="revenue-trend"
                        csvData={revenueTrendCsvData}
                        footer={(
                            <Grid sx={{ width: "100%", borderTop: "1px solid gray" }}>
                                <Typography variant="body2" component="p" sx={{ marginTop: "10px" }}>{"🕗 updated 4min ago"}</Typography>
                            </Grid>
                        )}
                        footerBackgroundColor="white"
                        footerColor="gray"
                    >
                        <Plot
                            data={[{ x: MONTHS, y: data?.revenueTrend, type: "lines+markers", color: "third" }]}
                            showLegend={false}
                            title="15% increase in revenue this month"
                            titleColor="primary"
                            titleFontSize={16}
                            displayBar={false}
                        />
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card
                        title="Customer Satisfaction"
                        showCsvExport
                        chartName="customer-satisfaction"
                        csvData={customerSatisfactionCsvData}
                        footer={(
                            <Grid sx={{ width: "100%", borderTop: "1px solid gray" }}>
                                <Typography variant="body2" component="p" sx={{ marginTop: "10px" }}>{"🕗 just updated"}</Typography>
                            </Grid>
                        )}
                        footerBackgroundColor="white"
                        footerColor="gray"
                    >
                        <Plot
                            data={[{ x: MONTHS, y: data?.customerSatisfaction, type: "lines+markers", color: "third" }]}
                            showLegend={false}
                            title="Customer satisfaction score over time"
                            titleColor="primary"
                            titleFontSize={16}
                            displayBar={false}
                        />
                    </Card>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default Dashboard;